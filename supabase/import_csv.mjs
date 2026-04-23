#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const INPUT_DIR = process.env.IMPORT_INPUT_DIR || path.resolve(process.cwd(), "supabase", "csv");
const OUTPUT_DIR = process.env.IMPORT_OUTPUT_DIR || path.resolve(process.cwd(), "supabase", "import-output");
const IMPORT_ORG_NAME = process.env.IMPORT_ORG_NAME || "Default Organization";
const IMPORT_ORG_CODE = process.env.IMPORT_ORG_CODE || "DEFAULT";
const IMPORT_ORG_SLUG = process.env.IMPORT_ORG_SLUG || "default";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const REQUIRED_ROLE_MAP = {
  ADMIN: "admin",
  MANAGER: "manager_flota",
  OFFICE: "contabilitate",
  SOFER: "sofer"
};

const state = {
  organization: null,
  rolesByCode: new Map(),
  usersByLegacyId: new Map(),
  employeesByLegacyId: new Map(),
  vehiclesByLegacyId: new Map(),
  vehiclesByPlate: new Map(),
  projectsByCode: new Map(),
  sitesByCode: new Map(),
  rejects: [],
  stats: {
    insertedOrUpdated: {},
    rejected: {}
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  ensureDir(OUTPUT_DIR);

  const runStartedAt = new Date().toISOString();
  console.log(`Import started at ${runStartedAt}`);
  console.log(`Input dir: ${INPUT_DIR}`);

  await ensureDefaultOrganization();
  await ensureRoles();

  await importUsers();
  await importEmployees();
  await importProjects();
  await importSites();
  await importVehicles();
  await importVehicleDocuments();
  await importMaintenanceLogs();
  await importFuelLogs();
  await importExpenses();
  await importAttachments();

  await writeRejects();
  await writeSummary(runStartedAt);

  console.log("Import finished.");
}

async function ensureDefaultOrganization() {
  const rows = await upsertRows("organizations", [
    {
      name: IMPORT_ORG_NAME,
      code: IMPORT_ORG_CODE,
      slug: IMPORT_ORG_SLUG,
      status: "active"
    }
  ], "code");

  const org = rows[0];
  if (!org) {
    throw new Error("Could not create or fetch organization");
  }
  state.organization = org;
}

async function ensureRoles() {
  const payload = [
    { code: "admin", name: "Admin", description: "Administrare completa", is_system: true },
    { code: "manager_flota", name: "Manager Flota", description: "Gestionare flota", is_system: true },
    { code: "manager_santier", name: "Manager Santier", description: "Gestionare proiecte si santiere", is_system: true },
    { code: "contabilitate", name: "Contabilitate", description: "Cheltuieli si documente financiare", is_system: true },
    { code: "sofer", name: "Sofer", description: "Acces propriu si vehicul alocat", is_system: true }
  ];

  const roles = await upsertRows("roles", payload, "code");
  roles.forEach((role) => state.rolesByCode.set(role.code, role));
}

async function importUsers() {
  const rows = readCsvOptional("Users.csv");
  if (!rows.length) return;

  const userPayload = [];
  const userRolePayload = [];

  rows.forEach((row, index) => {
    const legacyUserId = text(row.UserID);
    const email = text(row.Email).toLowerCase();
    const roleCode = REQUIRED_ROLE_MAP[text(row.Rol).toUpperCase()] || null;

    if (!legacyUserId) return reject("Users.csv", index, "Missing UserID", row);
    if (!email) return reject("Users.csv", index, "Missing Email", row);
    if (!roleCode) return reject("Users.csv", index, `Unsupported role ${row.Rol || ""}`, row);

    userPayload.push({
      organization_id: state.organization.id,
      legacy_user_id: legacyUserId,
      email,
      full_name: text(row.Nume) || email,
      phone: null,
      status: normalizeStatus(row.Status),
      metadata: {
        source: "Users.csv",
        ultima_autentificare: parseDateTimeOrNull(row.UltimaAutentificare)
      }
    });
  });

  const importedUsers = await upsertRows("user_profiles", userPayload, "legacy_user_id");
  importedUsers.forEach((user) => state.usersByLegacyId.set(user.legacy_user_id, user));

  rows.forEach((row, index) => {
    const legacyUserId = text(row.UserID);
    const roleCode = REQUIRED_ROLE_MAP[text(row.Rol).toUpperCase()] || null;
    const user = state.usersByLegacyId.get(legacyUserId);
    const role = state.rolesByCode.get(roleCode);

    if (!user || !role) {
      return reject("Users.csv", index, "Could not resolve imported user or role", row);
    }

    userRolePayload.push({
      organization_id: state.organization.id,
      user_profile_id: user.id,
      role_id: role.id,
      is_primary: true,
      status: "active"
    });
  });

  await upsertRows("user_roles", userRolePayload, "organization_id,user_profile_id,role_id");
}

async function importEmployees() {
  const rows = readCsvOptional("Soferi.csv");
  if (!rows.length) return;

  const payload = [];

  rows.forEach((row, index) => {
    const legacySoferId = text(row.SoferID);
    if (!legacySoferId) return reject("Soferi.csv", index, "Missing SoferID", row);

    const user = state.usersByLegacyId.get(text(row.UserID));

    payload.push({
      organization_id: state.organization.id,
      user_profile_id: user ? user.id : null,
      legacy_sofer_id: legacySoferId,
      employee_code: legacySoferId,
      full_name: text(row.Nume) || legacySoferId,
      email: user?.email || null,
      phone: text(row.Telefon) || null,
      status: normalizeStatus(row.Status),
      job_title: "sofer",
      license_categories: text(row.CategoriePermis) || null,
      notes: text(row.Observatii) || null
    });
  });

  const imported = await upsertRows("employees", payload, "legacy_sofer_id");
  imported.forEach((employee) => state.employeesByLegacyId.set(employee.legacy_sofer_id, employee));
}

async function importProjects() {
  const rows = readCsvOptional("Projects.csv");
  if (!rows.length) return;

  const payload = [];

  rows.forEach((row, index) => {
    const code = text(row.code || row.Code || row.ProjectCode);
    const name = text(row.name || row.Name || row.ProjectName);
    if (!name) return reject("Projects.csv", index, "Missing project name", row);

    payload.push({
      organization_id: state.organization.id,
      code: code || null,
      name,
      client_name: text(row.client_name || row.ClientName) || null,
      status: normalizeStatus(row.status || row.Status || "active"),
      start_date: parseDateOrNull(row.start_date || row.StartDate),
      end_date: parseDateOrNull(row.end_date || row.EndDate),
      budget: parseNumberOrNull(row.budget || row.Budget),
      notes: text(row.notes || row.Notes) || null
    });
  });

  const imported = await upsertRows("projects", payload, "organization_id,code");
  imported.forEach((project) => {
    if (project.code) state.projectsByCode.set(project.code, project);
  });
}

async function importSites() {
  const rows = readCsvOptional("Sites.csv");
  if (!rows.length) return;

  const payload = [];

  rows.forEach((row, index) => {
    const code = text(row.code || row.Code || row.SiteCode);
    const name = text(row.name || row.Name || row.SiteName);
    if (!name) return reject("Sites.csv", index, "Missing site name", row);

    const projectCode = text(row.project_code || row.ProjectCode);
    const project = projectCode ? state.projectsByCode.get(projectCode) : null;

    payload.push({
      organization_id: state.organization.id,
      project_id: project?.id || null,
      code: code || null,
      name,
      address: text(row.address || row.Address) || null,
      city: text(row.city || row.City) || null,
      county: text(row.county || row.County) || null,
      latitude: parseNumberOrNull(row.latitude || row.Latitude),
      longitude: parseNumberOrNull(row.longitude || row.Longitude),
      status: normalizeStatus(row.status || row.Status || "active"),
      notes: text(row.notes || row.Notes) || null
    });
  });

  const imported = await upsertRows("sites", payload, "organization_id,code");
  imported.forEach((site) => {
    if (site.code) state.sitesByCode.set(site.code, site);
  });
}

async function importVehicles() {
  const rows = readCsvOptional("Masini.csv");
  if (!rows.length) return;

  const payload = [];

  rows.forEach((row, index) => {
    const legacyVehicleId = text(row.MasinaID);
    const plateNumber = normalizePlate(row.NrInmatriculare);
    if (!legacyVehicleId) return reject("Masini.csv", index, "Missing MasinaID", row);
    if (!plateNumber) return reject("Masini.csv", index, "Missing NrInmatriculare", row);

    const employee = state.employeesByLegacyId.get(text(row.SoferCurentID));

    payload.push({
      organization_id: state.organization.id,
      legacy_vehicle_id: legacyVehicleId,
      vehicle_code: legacyVehicleId,
      plate_number: plateNumber,
      brand: text(row.Marca) || null,
      model: text(row.Model) || null,
      fabrication_year: parseIntOrNull(row.AnFabricatie),
      vehicle_type: normalizeEnumText(row.TipVehicul),
      fuel_type: normalizeEnumText(row.Combustibil),
      status: normalizeStatus(row.Status),
      current_km: parseNumberOrZero(row.KmCurenti),
      current_employee_id: employee?.id || null,
      notes: text(row.Observatii) || null,
      metadata: {
        itp_expira_la: parseDateOrNull(row.ITPExpiraLa),
        rca_expira_la: parseDateOrNull(row.RCAExpiraLa),
        rovinieta_expira_la: parseDateOrNull(row.RovinietaExpiraLa)
      }
    });
  });

  const imported = await upsertRows("vehicles", payload, "legacy_vehicle_id");
  imported.forEach((vehicle) => {
    state.vehiclesByLegacyId.set(vehicle.legacy_vehicle_id, vehicle);
    state.vehiclesByPlate.set(normalizePlate(vehicle.plate_number), vehicle);
  });
}

async function importVehicleDocuments() {
  const documentRows = readCsvOptional("Documente.csv");
  const vehicleRows = readCsvOptional("Masini.csv");
  const payload = [];

  documentRows.forEach((row, index) => {
    const legacyDocumentId = text(row.DocumentID);
    const vehicle = state.vehiclesByLegacyId.get(text(row.MasinaID));
    if (!legacyDocumentId) return reject("Documente.csv", index, "Missing DocumentID", row);
    if (!vehicle) return reject("Documente.csv", index, "Unknown MasinaID", row);

    payload.push({
      organization_id: state.organization.id,
      vehicle_id: vehicle.id,
      legacy_document_id: legacyDocumentId,
      document_type: normalizeEnumText(row.TipDocument) || "document",
      series_number: text(row.SerieNumar) || null,
      issue_date: parseDateOrNull(row.DataEmitere),
      expiry_date: parseDateOrNull(row.DataExpirare),
      cost: parseNumberOrNull(row.Cost),
      supplier: text(row.Furnizor) || null,
      status: normalizeStatus(row.Status),
      file_url: text(row.FisierURL) || null,
      notes: text(row.Observatii) || null
    });
  });

  vehicleRows.forEach((row, index) => {
    const vehicle = state.vehiclesByLegacyId.get(text(row.MasinaID));
    if (!vehicle) return;

    [
      { type: "ITP", value: row.ITPExpiraLa },
      { type: "RCA", value: row.RCAExpiraLa },
      { type: "ROVINIETA", value: row.RovinietaExpiraLa }
    ].forEach((doc) => {
      const expiry = parseDateOrNull(doc.value);
      if (!expiry) return;

      payload.push({
        organization_id: state.organization.id,
        vehicle_id: vehicle.id,
        legacy_document_id: `${text(row.MasinaID)}:${doc.type}`,
        document_type: doc.type,
        expiry_date: expiry,
        status: "active",
        notes: `Migrated from Masini.${doc.type}`
      });
    });
  });

  await upsertRows("vehicle_documents", payload, "legacy_document_id");
}

async function importMaintenanceLogs() {
  const defectRows = readCsvOptional("Defecte.csv");
  const revisionRows = readCsvOptional("Revizii.csv");
  const payload = [];

  defectRows.forEach((row, index) => {
    const legacyDefectId = text(row.DefectID);
    const vehicle = state.vehiclesByLegacyId.get(text(row.MasinaID));
    const employee = state.employeesByLegacyId.get(text(row.SoferID));
    if (!legacyDefectId) return reject("Defecte.csv", index, "Missing DefectID", row);
    if (!vehicle) return reject("Defecte.csv", index, "Unknown MasinaID", row);

    payload.push({
      organization_id: state.organization.id,
      vehicle_id: vehicle.id,
      employee_id: employee?.id || null,
      maintenance_type: "defect",
      title: text(row.Titlu) || legacyDefectId,
      description: text(row.Descriere) || null,
      status: normalizeStatus(row.Status || "open"),
      maintenance_date: parseDateOrNull(row.DataRaportare),
      estimated_cost: parseNumberOrNull(row.CostEstimat),
      final_cost: parseNumberOrNull(row.CostFinal),
      notes: buildJoinedNotes([
        text(row.Severitate) ? `Severitate: ${text(row.Severitate)}` : "",
        text(row.PozaURL) ? `PozaURL: ${text(row.PozaURL)}` : ""
      ]),
      legacy_defect_id: legacyDefectId
    });
  });

  revisionRows.forEach((row, index) => {
    const legacyRevisionId = text(row.RevizieID);
    const vehicle = state.vehiclesByLegacyId.get(text(row.MasinaID));
    if (!legacyRevisionId) return reject("Revizii.csv", index, "Missing RevizieID", row);
    if (!vehicle) return reject("Revizii.csv", index, "Unknown MasinaID", row);

    payload.push({
      organization_id: state.organization.id,
      vehicle_id: vehicle.id,
      maintenance_type: "revizie",
      title: text(row.TipRevizie) || legacyRevisionId,
      description: text(row.Observatii) || null,
      status: normalizeStatus(row.Status || "closed"),
      maintenance_date: parseDateOrNull(row.DataRevizie),
      due_date: parseDateOrNull(row.DataUrmatoareRevizie),
      estimated_cost: parseNumberOrNull(row.CostEstimat),
      final_cost: parseNumberOrNull(row.CostFinal || row.Cost),
      supplier: text(row.Furnizor) || null,
      notes: text(row.Observatii) || null,
      legacy_revision_id: legacyRevisionId
    });
  });

  await upsertRows("maintenance_logs", payload, "legacy_defect_id,legacy_revision_id");
}

async function importFuelLogs() {
  const fuelRows = readCsvOptional("Alimentari.csv");
  const tankRows = readCsvOptional("tranzactii_bazin.csv");
  const payload = [];

  fuelRows.forEach((row, index) => {
    const legacyFuelId = text(row.AlimentareID);
    const vehicle = state.vehiclesByLegacyId.get(text(row.MasinaID));
    const employee = state.employeesByLegacyId.get(text(row.SoferID));

    if (!legacyFuelId) return reject("Alimentari.csv", index, "Missing AlimentareID", row);
    if (!vehicle) return reject("Alimentari.csv", index, "Unknown MasinaID", row);

    payload.push({
      organization_id: state.organization.id,
      vehicle_id: vehicle.id,
      employee_id: employee?.id || null,
      source_type: "station",
      operation_type: "fueling",
      fuel_type: normalizeEnumText(row.TipCombustibil),
      station_name: text(row.Statie) || null,
      quantity_liters: parseNumberOrZero(row.CantitateLitri),
      total_cost: parseNumberOrNull(row.CostTotal),
      unit_price: parseNumberOrNull(row.PretPeLitru),
      odometer_km: parseNumberOrNull(row.KmLaAlimentare),
      operation_date: parseDateTimeOrNull(row.DataAlimentare) || new Date().toISOString(),
      notes: text(row.Observatii) || null,
      legacy_fuel_id: legacyFuelId
    });
  });

  tankRows.forEach((row, index) => {
    const legacyTxnId = text(row.id);
    const operationType = normalizeTankOperation(row.tip_operatie);
    const utilityRef = text(row.utilaj_alimentat);
    const vehicle = utilityRef
      ? state.vehiclesByLegacyId.get(utilityRef) || state.vehiclesByPlate.get(normalizePlate(utilityRef))
      : null;
    const employee = state.usersByLegacyId.get(text(row.creat_de_user_id));

    if (!legacyTxnId) return reject("tranzactii_bazin.csv", index, "Missing id", row);
    if (!operationType) return reject("tranzactii_bazin.csv", index, "Invalid tip_operatie", row);

    payload.push({
      organization_id: state.organization.id,
      vehicle_id: vehicle?.id || null,
      employee_id: null,
      source_type: "tank",
      operation_type: operationType,
      quantity_liters: parseNumberOrZero(row.cantitate_litri),
      operation_date: parseDateTimeOrNull(row.created_at) || new Date().toISOString(),
      notes: buildJoinedNotes([
        text(row.locatie) ? `Locatie: ${text(row.locatie)}` : "",
        text(row.observatii) || "",
        text(row.creat_de_user_id) ? `LegacyUserID: ${text(row.creat_de_user_id)}` : "",
        text(row.creat_de_user_nume) ? `LegacyUserName: ${text(row.creat_de_user_nume)}` : ""
      ]),
      legacy_tank_transaction_id: legacyTxnId
    });
  });

  await upsertRows("fuel_logs", payload, "legacy_fuel_id,legacy_tank_transaction_id");
}

async function importExpenses() {
  const rows = readCsvOptional("Expenses.csv");
  if (!rows.length) return;

  const payload = [];

  rows.forEach((row, index) => {
    const amount = parseNumberOrNull(row.amount || row.Amount);
    const expenseDate = parseDateOrNull(row.expense_date || row.ExpenseDate);
    const type = text(row.expense_type || row.ExpenseType);
    if (!amount || !expenseDate || !type) {
      return reject("Expenses.csv", index, "Missing amount, expense_date, or expense_type", row);
    }

    const project = state.projectsByCode.get(text(row.project_code || row.ProjectCode));
    const site = state.sitesByCode.get(text(row.site_code || row.SiteCode));
    const vehicle = state.vehiclesByLegacyId.get(text(row.vehicle_legacy_id || row.MasinaID));
    const employee = state.employeesByLegacyId.get(text(row.employee_legacy_id || row.SoferID));

    payload.push({
      organization_id: state.organization.id,
      project_id: project?.id || null,
      site_id: site?.id || null,
      vehicle_id: vehicle?.id || null,
      employee_id: employee?.id || null,
      expense_type: type,
      amount,
      currency: text(row.currency || row.Currency) || "RON",
      expense_date: expenseDate,
      vendor: text(row.vendor || row.Vendor) || null,
      reference_no: text(row.reference_no || row.ReferenceNo) || null,
      status: normalizeStatus(row.status || row.Status || "draft"),
      notes: text(row.notes || row.Notes) || null
    });
  });

  await upsertRows("expenses", payload);
}

async function importAttachments() {
  const rows = readCsvOptional("Attachments.csv");
  if (!rows.length) return;

  const payload = [];

  rows.forEach((row, index) => {
    const entityType = text(row.entity_type || row.EntityType);
    const entityId = text(row.entity_id || row.EntityId);
    const fileName = text(row.file_name || row.FileName);
    const filePath = text(row.file_path || row.FilePath);

    if (!entityType || !entityId || !fileName || !filePath) {
      return reject("Attachments.csv", index, "Missing entity_type, entity_id, file_name, or file_path", row);
    }

    const uploader = state.usersByLegacyId.get(text(row.user_legacy_id || row.UserID));

    payload.push({
      organization_id: state.organization.id,
      uploaded_by_user_profile_id: uploader?.id || null,
      entity_type: entityType,
      entity_id: entityId,
      file_name: fileName,
      file_path: filePath,
      file_url: text(row.file_url || row.FileURL) || null,
      mime_type: text(row.mime_type || row.MimeType) || null,
      file_size: parseIntOrNull(row.file_size || row.FileSize),
      notes: text(row.notes || row.Notes) || null
    });
  });

  await upsertRows("attachments", payload);
}

async function upsertRows(table, rows, onConflict = "") {
  if (!rows.length) return [];

  const dedupedRows = dedupeRows(rows, onConflict);
  const chunks = chunk(dedupedRows, 500);
  const results = [];

  for (const part of chunks) {
    const query = new URLSearchParams();
    query.set("select", "*");
    if (onConflict) query.set("on_conflict", onConflict);

    const response = await rest(`/rest/v1/${table}?${query.toString()}`, {
      method: "POST",
      headers: {
        Prefer: "return=representation,resolution=merge-duplicates"
      },
      body: JSON.stringify(part)
    });

    results.push(...response);
    incrementStat("insertedOrUpdated", table, part.length);
  }

  return results;
}

async function rest(resourcePath, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${resourcePath}`, {
    method: options.method || "GET",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed ${response.status}: ${text}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

function readCsvOptional(filename) {
  const filePath = path.join(INPUT_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf8");
  return parseCsv(raw);
}

function parseCsv(raw) {
  const lines = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    const next = raw[i + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current);
      current = "";
      if (row.some((cell) => cell !== "")) lines.push(row);
      row = [];
      continue;
    }

    current += char;
  }

  if (current !== "" || row.length) {
    row.push(current);
    if (row.some((cell) => cell !== "")) lines.push(row);
  }

  if (!lines.length) return [];

  const headers = lines[0].map((item) => text(item));
  return lines.slice(1).map((values) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = values[index] ?? "";
    });
    return item;
  });
}

function reject(source, rowIndex, reason, row) {
  state.rejects.push({
    source,
    row_index: rowIndex + 2,
    reason,
    row
  });
  incrementStat("rejected", source, 1);
}

function incrementStat(bucket, key, count) {
  state.stats[bucket][key] = (state.stats[bucket][key] || 0) + count;
}

async function writeRejects() {
  const timestamp = buildFileTimestamp();
  const filePath = path.join(OUTPUT_DIR, `rejected_rows_${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(state.rejects, null, 2), "utf8");
}

async function writeSummary(startedAt) {
  const timestamp = buildFileTimestamp();
  const filePath = path.join(OUTPUT_DIR, `import_summary_${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify({
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    organization_id: state.organization?.id || null,
    stats: state.stats,
    rejected_count: state.rejects.length
  }, null, 2), "utf8");
}

function dedupeRows(rows, onConflict) {
  if (!onConflict) return rows;
  const keys = onConflict.split(",").map((item) => item.trim()).filter(Boolean);
  const map = new Map();

  rows.forEach((row) => {
    const dedupeKey = keys.map((key) => String(row[key] ?? "")).join("::");
    map.set(dedupeKey, row);
  });

  return Array.from(map.values());
}

function chunk(items, size) {
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function normalizeStatus(value) {
  const raw = text(value).toLowerCase();
  if (!raw) return "active";
  if (["activ", "activa", "active"].includes(raw)) return "active";
  if (["inactiv", "inactive"].includes(raw)) return "inactive";
  if (["raportata", "reported"].includes(raw)) return "reported";
  if (["rezolvat", "closed", "finalizat"].includes(raw)) return "closed";
  if (["draft"].includes(raw)) return "draft";
  if (["open", "deschis"].includes(raw)) return "open";
  return raw;
}

function normalizeEnumText(value) {
  const raw = text(value);
  return raw ? raw.toUpperCase() : null;
}

function normalizePlate(value) {
  return text(value).toUpperCase().replace(/\s+/g, "");
}

function normalizeTankOperation(value) {
  const raw = text(value).toUpperCase();
  if (raw === "UMPLERE") return "fill";
  if (raw === "DESCARCARE") return "dispense";
  return null;
}

function parseDateOrNull(value) {
  const date = parseDateValue(value);
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

function parseDateTimeOrNull(value) {
  const date = parseDateValue(value);
  return date ? date.toISOString() : null;
}

function parseDateValue(value) {
  const raw = text(value);
  if (!raw) return null;

  const ro = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (ro) {
    const date = new Date(Date.UTC(Number(ro[3]), Number(ro[2]) - 1, Number(ro[1])));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const iso = new Date(raw);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

function parseNumberOrNull(value) {
  const raw = text(value).replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function parseNumberOrZero(value) {
  return parseNumberOrNull(value) ?? 0;
}

function parseIntOrNull(value) {
  const num = parseInt(text(value), 10);
  return Number.isFinite(num) ? num : null;
}

function buildJoinedNotes(parts) {
  return parts.filter(Boolean).join(" | ") || null;
}

function text(value) {
  return String(value ?? "").trim();
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function buildFileTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
