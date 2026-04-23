const { supabaseRest, buildSelectPath } = require("./supabase-server");

const VIEW_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE", "SOFER"]);
const OPERATE_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE", "SOFER"]);
const MANAGE_TRANSACTION_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE"]);

async function listFuelTanks(context) {
  if (!VIEW_ROLES.has(normalizeRole(context.role))) {
    return denied("Nu ai drepturi pentru vizualizarea bazinului.");
  }

  const organization = await getDefaultOrganization();
  const tanks = await supabaseRest(
    buildSelectPath(
      "fuel_tanks",
      [
        "select=*",
        `organization_id=eq.${organization.id}`,
        "order=created_at.asc"
      ].join("&")
    )
  );

  return {
    ok: true,
    data: {
      items: (tanks || []).map(mapFuelTankToLegacyShape)
    }
  };
}

async function listFuelTankTransactions(context) {
  if (!MANAGE_TRANSACTION_ROLES.has(normalizeRole(context.role))) {
    return denied("Nu ai drepturi pentru istoricul bazinului.");
  }

  const organization = await getDefaultOrganization();
  const [transactions, vehicles] = await Promise.all([
    supabaseRest(
      buildSelectPath(
        "fuel_tank_transactions",
        [
          "select=*",
          `organization_id=eq.${organization.id}`,
          "order=created_at.desc"
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "vehicles",
        [
          "select=id,legacy_vehicle_id,plate_number",
          `organization_id=eq.${organization.id}`
        ].join("&")
      )
    )
  ]);

  const vehicleById = new Map((vehicles || []).map((item) => [item.id, item]));
  return {
    ok: true,
    data: {
      items: (transactions || []).map((item) => mapFuelTankTransactionToLegacyShape(item, vehicleById))
    }
  };
}

async function createFuelTankTransaction(payload) {
  const role = normalizeRole(payload.role);
  if (!OPERATE_ROLES.has(role)) {
    return denied("Rolul curent nu poate opera bazinul.");
  }

  const organization = await getDefaultOrganization();
  const tank = await getOrCreateFuelTank(organization.id, payload);
  const normalized = normalizeFuelTankTransactionPayload(payload, tank);
  const validationError = validateFuelTankTransaction(normalized, { isEdit: false });
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const targetVehicle = await resolveUtilityVehicle(organization.id, normalized.utilaj_alimentat);
  const createdByUserProfile = await resolveUserProfile(organization.id, text(payload.userId));

  const nextLevel = await validateProjectedTankLevel(tank, normalized, null);
  await supabaseRest("/rest/v1/fuel_tank_transactions", {
    method: "POST",
    body: [
      {
        organization_id: organization.id,
        fuel_tank_id: tank.id,
        transaction_type: normalized.tip_operatie,
        quantity_liters: normalized.cantitate_litri,
        target_vehicle_id: targetVehicle ? targetVehicle.id : null,
        utility_label: normalized.utilaj_alimentat || null,
        location: normalized.locatie,
        created_by_user_profile_id: createdByUserProfile ? createdByUserProfile.id : null,
        created_by_user_name: createdByUserProfile ? createdByUserProfile.full_name : text(payload.userId),
        notes: normalized.observatii || null,
        legacy_tank_transaction_id: null
      }
    ]
  });

  await updateTankState(tank.id, {
    name: normalized.nume || tank.name,
    max_capacity_liters: normalized.capacitate_maxima_litri,
    current_level_liters: nextLevel,
    current_location: normalized.locatie
  });

  return {
    ok: true,
    message: normalized.tip_operatie === "UMPLERE" ? "Bazinul a fost umplut." : "Descarcarea din bazin a fost inregistrata.",
    data: {
      nivel_curent_litri: nextLevel,
      capacitate_maxima_litri: normalized.capacitate_maxima_litri
    }
  };
}

async function updateFuelTankTransaction(payload) {
  const role = normalizeRole(payload.role);
  if (!MANAGE_TRANSACTION_ROLES.has(role)) {
    return denied("Doar ADMIN, MANAGER sau OFFICE pot edita tranzactii de bazin.");
  }

  const organization = await getDefaultOrganization();
  const transactionId = text(payload.id);
  if (!transactionId) {
    return { ok: false, message: "ID-ul tranzactiei este obligatoriu." };
  }

  const existing = await findTankTransactionById(organization.id, transactionId);
  if (!existing) {
    return { ok: false, message: "Tranzactia nu a fost gasita." };
  }

  const tank = await getFuelTankById(organization.id, existing.fuel_tank_id);
  if (!tank) {
    return { ok: false, message: "Bazinul nu a fost gasit." };
  }

  const normalized = normalizeFuelTankTransactionPayload(
    {
      ...payload,
      bazin_id: payload.bazin_id || existing.fuel_tank_id,
      tip_operatie: payload.tip_operatie || existing.transaction_type,
      cantitate_litri: payload.cantitate_litri || existing.quantity_liters,
      utilaj_alimentat: payload.utilaj_alimentat || existing.utility_label,
      locatie: payload.locatie || existing.location,
      observatii: payload.observatii || existing.notes,
      capacitate_maxima_litri: payload.capacitate_maxima_litri || tank.max_capacity_liters,
      nume: payload.nume || tank.name
    },
    tank
  );

  const validationError = validateFuelTankTransaction(normalized, { isEdit: true });
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const targetVehicle = await resolveUtilityVehicle(organization.id, normalized.utilaj_alimentat);
  const nextLevel = await validateProjectedTankLevel(tank, normalized, existing.id);

  await supabaseRest(`/rest/v1/fuel_tank_transactions?id=eq.${existing.id}`, {
    method: "PATCH",
    body: {
      transaction_type: normalized.tip_operatie,
      quantity_liters: normalized.cantitate_litri,
      target_vehicle_id: targetVehicle ? targetVehicle.id : null,
      utility_label: normalized.utilaj_alimentat || null,
      location: normalized.locatie,
      notes: normalized.observatii || null
    }
  });

  await updateTankState(tank.id, {
    name: normalized.nume || tank.name,
    max_capacity_liters: normalized.capacitate_maxima_litri,
    current_level_liters: nextLevel,
    current_location: normalized.locatie
  });

  return { ok: true, message: "Tranzactia de bazin a fost actualizata." };
}

async function deleteFuelTankTransaction(payload) {
  const role = normalizeRole(payload.role);
  if (!MANAGE_TRANSACTION_ROLES.has(role)) {
    return denied("Doar ADMIN, MANAGER sau OFFICE pot sterge tranzactii de bazin.");
  }

  const organization = await getDefaultOrganization();
  const transactionId = text(payload.id);
  if (!transactionId) {
    return { ok: false, message: "ID-ul tranzactiei este obligatoriu." };
  }

  const existing = await findTankTransactionById(organization.id, transactionId);
  if (!existing) {
    return { ok: false, message: "Tranzactia nu a fost gasita." };
  }

  await supabaseRest(`/rest/v1/fuel_tank_transactions?id=eq.${existing.id}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });

  const tank = await getFuelTankById(organization.id, existing.fuel_tank_id);
  if (tank) {
    const nextLevel = await computeTankLevel(organization.id, tank.id);
    await updateTankState(tank.id, {
      current_level_liters: nextLevel
    });
  }

  return { ok: true, message: "Tranzactia de bazin a fost stearsa." };
}

async function getOrCreateFuelTank(organizationId, payload) {
  const rows = await supabaseRest(
    buildSelectPath(
      "fuel_tanks",
      [
        "select=*",
        `organization_id=eq.${organizationId}`,
        "order=created_at.asc",
        "limit=1"
      ].join("&")
    )
  );

  if (rows && rows[0]) {
    return rows[0];
  }

  const capacity = toNumber(payload.capacitate_maxima_litri) || 1000;
  const inserted = await supabaseRest("/rest/v1/fuel_tanks", {
    method: "POST",
    body: [
      {
        organization_id: organizationId,
        name: text(payload.nume) || "Bazin mobil",
        max_capacity_liters: capacity,
        current_level_liters: 0,
        current_location: text(payload.locatie) || "",
        status: "active",
        legacy_tank_id: null
      }
    ]
  });

  return inserted && inserted[0] ? inserted[0] : null;
}

async function getFuelTankById(organizationId, tankId) {
  const rows = await supabaseRest(
    buildSelectPath(
      "fuel_tanks",
      [
        "select=*",
        `organization_id=eq.${organizationId}`,
        `id=eq.${tankId}`,
        "limit=1"
      ].join("&")
    )
  );
  return rows && rows[0] ? rows[0] : null;
}

async function findTankTransactionById(organizationId, transactionId) {
  const rows = await supabaseRest(
    buildSelectPath(
      "fuel_tank_transactions",
      [
        "select=*",
        `organization_id=eq.${organizationId}`,
        `id=eq.${transactionId}`,
        "limit=1"
      ].join("&")
    )
  );
  return rows && rows[0] ? rows[0] : null;
}

async function resolveUserProfile(organizationId, legacyUserId) {
  if (!legacyUserId) {
    return null;
  }

  const rows = await supabaseRest(
    buildSelectPath(
      "user_profiles",
      [
        "select=id,full_name",
        `organization_id=eq.${organizationId}`,
        `legacy_user_id=eq.${encodeURIComponent(legacyUserId)}`,
        "limit=1"
      ].join("&")
    )
  );

  return rows && rows[0] ? rows[0] : null;
}

async function resolveUtilityVehicle(organizationId, reference) {
  const value = text(reference);
  if (!value) {
    return null;
  }

  const byLegacy = await supabaseRest(
    buildSelectPath(
      "vehicles",
      [
        "select=id,legacy_vehicle_id,plate_number",
        `organization_id=eq.${organizationId}`,
        `legacy_vehicle_id=eq.${encodeURIComponent(value)}`,
        "limit=1"
      ].join("&")
    )
  );
  if (byLegacy && byLegacy[0]) {
    return byLegacy[0];
  }

  const byPlate = await supabaseRest(
    buildSelectPath(
      "vehicles",
      [
        "select=id,legacy_vehicle_id,plate_number",
        `organization_id=eq.${organizationId}`,
        `plate_number=eq.${encodeURIComponent(value)}`,
        "limit=1"
      ].join("&")
    )
  );
  return byPlate && byPlate[0] ? byPlate[0] : null;
}

async function validateProjectedTankLevel(tank, normalized, excludedTransactionId) {
  const currentLevelWithoutExcluded = await computeTankLevel(await getDefaultOrganizationId(), tank.id, excludedTransactionId);
  const currentBase = currentLevelWithoutExcluded;
  const nextLevel = normalized.tip_operatie === "UMPLERE"
    ? currentBase + normalized.cantitate_litri
    : currentBase - normalized.cantitate_litri;

  if (nextLevel < 0) {
    throw new Error("Nu exista suficienta motorina in bazin pentru aceasta descarcare.");
  }
  if (nextLevel > normalized.capacitate_maxima_litri) {
    throw new Error("Nivelul curent nu poate depasi capacitatea maxima a bazinului.");
  }
  return nextLevel;
}

async function computeTankLevel(organizationId, tankId, excludedTransactionId = "") {
  const rows = await supabaseRest(
    buildSelectPath(
      "fuel_tank_transactions",
      [
        "select=id,transaction_type,quantity_liters",
        `organization_id=eq.${organizationId}`,
        `fuel_tank_id=eq.${tankId}`,
        "order=created_at.asc"
      ].join("&")
    )
  );

  return (rows || []).reduce((sum, item) => {
    if (excludedTransactionId && String(item.id) === String(excludedTransactionId)) {
      return sum;
    }
    const quantity = toNumber(item.quantity_liters);
    return String(item.transaction_type || "").toUpperCase() === "UMPLERE" ? sum + quantity : sum - quantity;
  }, 0);
}

async function updateTankState(tankId, values) {
  const body = {};
  if (Object.prototype.hasOwnProperty.call(values, "name")) body.name = values.name;
  if (Object.prototype.hasOwnProperty.call(values, "max_capacity_liters")) body.max_capacity_liters = values.max_capacity_liters;
  if (Object.prototype.hasOwnProperty.call(values, "current_level_liters")) body.current_level_liters = values.current_level_liters;
  if (Object.prototype.hasOwnProperty.call(values, "current_location")) body.current_location = values.current_location;

  await supabaseRest(`/rest/v1/fuel_tanks?id=eq.${tankId}`, {
    method: "PATCH",
    body
  });
}

function mapFuelTankToLegacyShape(item) {
  return {
    id: item.id,
    nume: item.name || "",
    capacitate_maxima_litri: toNumber(item.max_capacity_liters),
    nivel_curent_litri: toNumber(item.current_level_liters),
    locatie_curenta: item.current_location || "",
    created_at: item.created_at || "",
    updated_at: item.updated_at || ""
  };
}

function mapFuelTankTransactionToLegacyShape(item, vehicleById) {
  const vehicle = item.target_vehicle_id ? vehicleById.get(item.target_vehicle_id) : null;
  return {
    id: item.id,
    bazin_id: item.fuel_tank_id,
    tip_operatie: item.transaction_type || "",
    cantitate_litri: toNumber(item.quantity_liters),
    utilaj_alimentat: item.utility_label || (vehicle ? vehicle.plate_number || vehicle.legacy_vehicle_id || "" : ""),
    locatie: item.location || "",
    creat_de_user_id: item.created_by_user_profile_id || "",
    creat_de_user_nume: item.created_by_user_name || "",
    observatii: item.notes || "",
    created_at: item.created_at || ""
  };
}

function normalizeFuelTankTransactionPayload(payload, tank) {
  return {
    bazin_id: text(payload.bazin_id) || (tank ? tank.id : ""),
    nume: text(payload.nume) || (tank ? tank.name || "" : ""),
    capacitate_maxima_litri: toNumber(payload.capacitate_maxima_litri) || toNumber(tank && tank.max_capacity_liters) || 1000,
    tip_operatie: text(payload.tip_operatie).toUpperCase(),
    cantitate_litri: toNumber(payload.cantitate_litri),
    utilaj_alimentat: text(payload.utilaj_alimentat),
    locatie: text(payload.locatie),
    observatii: text(payload.observatii)
  };
}

function validateFuelTankTransaction(payload, options = {}) {
  if (!payload.bazin_id) {
    return "Bazinul nu este configurat corect.";
  }
  if (!payload.tip_operatie || !["UMPLERE", "DESCARCARE"].includes(payload.tip_operatie)) {
    return "Tipul operatiei este invalid.";
  }
  if (payload.cantitate_litri <= 0) {
    return "Cantitatea trebuie sa fie mai mare decat zero.";
  }
  if (!payload.locatie) {
    return "Locatia este obligatorie.";
  }
  if (payload.tip_operatie === "DESCARCARE" && !payload.utilaj_alimentat) {
    return "Utilajul alimentat este obligatoriu.";
  }
  if (payload.capacitate_maxima_litri <= 0) {
    return "Capacitatea maxima a bazinului este invalida.";
  }
  return "";
}

async function getDefaultOrganization() {
  if (cachedOrganization) {
    return cachedOrganization;
  }

  const code = text(process.env.SUPABASE_DEFAULT_ORG_CODE);
  const slug = text(process.env.SUPABASE_DEFAULT_ORG_SLUG);
  let query = "select=id,name,code,slug&order=created_at.asc&limit=1";

  if (code) {
    query = `select=id,name,code,slug&code=eq.${encodeURIComponent(code)}&limit=1`;
  } else if (slug) {
    query = `select=id,name,code,slug&slug=eq.${encodeURIComponent(slug)}&limit=1`;
  }

  const rows = await supabaseRest(buildSelectPath("organizations", query));
  const organization = rows && rows[0];
  if (!organization) {
    throw new Error("Nu exista organizatie configurata pentru Supabase.");
  }

  cachedOrganization = organization;
  return organization;
}

async function getDefaultOrganizationId() {
  const organization = await getDefaultOrganization();
  return organization.id;
}

function normalizeRole(value) {
  return text(value).toUpperCase();
}

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const normalized = String(value || "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value) {
  return String(value || "").trim();
}

function denied(message) {
  return { ok: false, message };
}

let cachedOrganization = null;

module.exports = {
  listFuelTanks,
  listFuelTankTransactions,
  createFuelTankTransaction,
  updateFuelTankTransaction,
  deleteFuelTankTransaction
};
