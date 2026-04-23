const { supabaseRest, buildSelectPath } = require("./supabase-server");

let cachedOrganization = null;

async function getDashboardSummary(context) {
  const role = normalizeRole(context.role);
  const linkedSoferId = text(context.linkedSoferId);
  const organization = await getDefaultOrganization();

  const [
    vehiclesRows,
    employeesRows,
    assignmentsRows,
    fuelRows,
    tripRows,
    documentRows,
    defectRows,
    revisionRows
  ] = await Promise.all([
    supabaseRest(
      buildSelectPath(
        "vehicles",
        [
          "select=id,legacy_vehicle_id,plate_number,status,current_employee_id,brand,model,current_km",
          `organization_id=eq.${organization.id}`
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "employees",
        [
          "select=id,legacy_sofer_id,status",
          `organization_id=eq.${organization.id}`
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "vehicle_assignments",
        [
          "select=id,vehicle_id,employee_id,status,start_date,legacy_assignment_id",
          `organization_id=eq.${organization.id}`
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "fuel_logs",
        [
          "select=id,legacy_fuel_id,vehicle_id,employee_id,operation_date,quantity_liters,total_cost,unit_price,station_name,fuel_type,notes,odometer_km,source_type,operation_type",
          `organization_id=eq.${organization.id}`,
          "source_type=eq.station",
          "operation_type=eq.fueling"
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "trip_sheets",
        [
          "select=id,legacy_trip_sheet_id,vehicle_id,employee_id,departure_date,start_location,destination,trip_purpose,odometer_start,odometer_end,distance_km,status",
          `organization_id=eq.${organization.id}`
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "vehicle_documents",
        [
          "select=id,legacy_document_id,vehicle_id,document_type,issue_date,expiry_date,cost,supplier,status,file_url,notes",
          `organization_id=eq.${organization.id}`
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "maintenance_logs",
        [
          "select=id,legacy_defect_id,vehicle_id,employee_id,maintenance_date,title,status,estimated_cost,final_cost,severity,photo_url,description,notes,maintenance_type",
          `organization_id=eq.${organization.id}`,
          "maintenance_type=eq.defect"
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "maintenance_logs",
        [
          "select=id,legacy_revision_id,vehicle_id,employee_id,maintenance_date,status,odometer_km,revision_type,service_name,supplier,final_cost,notes,title,maintenance_type",
          `organization_id=eq.${organization.id}`,
          "maintenance_type=eq.revision"
        ].join("&")
      )
    )
  ]);

  const employeeById = new Map((employeesRows || []).map((item) => [item.id, item]));
  const docsByVehicleId = buildDocsByVehicleId(documentRows || []);
  const vehicles = (vehiclesRows || []).map((item) => mapVehicle(item, employeeById, docsByVehicleId));
  const assignments = (assignmentsRows || []).map((item) => mapAssignment(item, vehiclesRows || [], employeesRows || []));
  const fuelEntries = (fuelRows || []).map((item) => mapFuelEntry(item, vehiclesRows || [], employeesRows || []));
  const tripSheets = (tripRows || []).map((item) => mapTripSheet(item, vehiclesRows || [], employeesRows || []));
  const documents = (documentRows || []).map((item) => mapDocument(item, vehiclesRows || []));
  const defects = (defectRows || []).map((item) => mapDefect(item, vehiclesRows || [], employeesRows || []));
  const revisions = (revisionRows || []).map((item) => mapRevision(item, vehiclesRows || [], employeesRows || []));

  if (role === "SOFER") {
    return { ok: true, data: buildDriverDashboardData({ linkedSoferId, vehicles, assignments, fuelEntries, tripSheets, documents, defects, revisions }) };
  }

  return { ok: true, data: buildGlobalDashboardData({ vehicles, employees: employeesRows || [], assignments, fuelEntries, tripSheets, documents, defects, revisions }) };
}

function buildGlobalDashboardData(data) {
  const vehicles = data.vehicles || [];
  const assignments = data.assignments || [];
  const fuelEntries = data.fuelEntries || [];
  const tripSheets = data.tripSheets || [];
  const documents = data.documents || [];
  const defects = data.defects || [];
  const revisions = data.revisions || [];
  const employees = data.employees || [];
  const expiringVehicleDocs = buildVehicleDocumentRows(vehicles);
  const expiringDocuments = buildDocumentRows(documents).concat(expiringVehicleDocs);
  const todayKey = normalizeDateKey(new Date());
  const tripVehicleIdsToday = new Set(
    tripSheets
      .filter((item) => normalizeDateKey(item.DataPlecare) === todayKey)
      .map((item) => text(item.MasinaID))
      .filter(Boolean)
  );

  return {
    cards: {
      masiniActive: vehicles.filter((item) => ["ACTIV", "ACTIVA", "ACTIVE"].includes(normalizeStatus(item.Status))).length,
      masiniInService: vehicles.filter((item) => ["IN SERVICE", "SERVICE", "IN_SERVICE"].includes(normalizeStatus(item.Status))).length,
      soferiActivi: employees.filter((item) => ["ACTIVE", "ACTIV", "ACTIVA"].includes(normalizeStatus(item.status))).length,
      asignariActive: assignments.filter((item) => ["ACTIV", "ACTIVA"].includes(normalizeStatus(item.Status))).length,
      totalAlimentari: fuelEntries.length,
      costTotalAlimentari: sumByField(fuelEntries, "CostTotal"),
      totalFoiParcurs: tripSheets.length,
      kmTotalParcurs: sumByField(tripSheets, "KmParcursi"),
      totalDocumente: documents.length + expiringVehicleDocs.length,
      documenteExpirate: expiringDocuments.filter((item) => Number(item.zileRamase) < 0).length,
      documenteExpiraIn30Zile: expiringDocuments.filter((item) => Number(item.zileRamase) >= 0 && Number(item.zileRamase) <= 30).length,
      documenteExpiraIn7Zile: expiringDocuments.filter((item) => Number(item.zileRamase) >= 0 && Number(item.zileRamase) <= 7).length
    },
    latestFuelEntries: sortByDateDesc(fuelEntries, "DataAlimentare").slice(0, 5),
    latestTripSheets: sortByDateDesc(tripSheets, "DataPlecare").slice(0, 5),
    expiringDocuments: expiringDocuments.sort((a, b) => Number(a.zileRamase) - Number(b.zileRamase)).slice(0, 10),
    latestDefects: sortByDateDesc(defects, "DataRaportare").slice(0, 5),
    latestRevisions: sortByDateDesc(revisions, "DataRevizie").slice(0, 5),
    extra: {
      totalRevizii: revisions.length,
      defecteDeschise: defects.filter((item) => !["REZOLVAT", "RESPINS"].includes(normalizeStatus(item.Status))).length,
      foiParcursAzi: tripSheets.filter((item) => normalizeDateKey(item.DataPlecare) === todayKey).length,
      masiniFaraFoaieAzi: vehicles
        .filter((item) => ["ACTIV", "ACTIVA", "ACTIVE"].includes(normalizeStatus(item.Status)))
        .filter((item) => !tripVehicleIdsToday.has(text(item.MasinaID))).length
    }
  };
}

function buildDriverDashboardData(data) {
  const linkedSoferId = text(data.linkedSoferId);
  const vehicles = data.vehicles || [];
  const assignments = data.assignments || [];
  const fuelEntriesAll = data.fuelEntries || [];
  const tripSheetsAll = data.tripSheets || [];
  const documentsAll = data.documents || [];
  const defectsAll = data.defects || [];
  const revisionsAll = data.revisions || [];

  const activeAssignments = assignments.filter((item) => {
    const sameDriver = text(item.SoferID) === linkedSoferId;
    const activeStatus = ["ACTIV", "ACTIVA"].includes(normalizeStatus(item.Status));
    return sameDriver && activeStatus;
  });

  const assignedVehicleIds = new Set(activeAssignments.map((item) => text(item.MasinaID)).filter(Boolean));
  vehicles.forEach((item) => {
    if (text(item.SoferCurentID) === linkedSoferId) {
      assignedVehicleIds.add(text(item.MasinaID));
    }
  });

  let ownVehicles = vehicles.filter((item) => assignedVehicleIds.has(text(item.MasinaID)));
  if (!ownVehicles.length && assignedVehicleIds.size) {
    ownVehicles = Array.from(assignedVehicleIds).map((masinaId) => ({
      MasinaID: masinaId,
      Status: "ACTIVA"
    }));
  }

  const tripSheets = tripSheetsAll.filter((item) => text(item.SoferID) === linkedSoferId);
  const fuelEntries = fuelEntriesAll.filter((item) => text(item.SoferID) === linkedSoferId || assignedVehicleIds.has(text(item.MasinaID)));
  const documents = documentsAll.filter((item) => assignedVehicleIds.has(text(item.MasinaID)));
  const defects = defectsAll.filter((item) => text(item.SoferID) === linkedSoferId || assignedVehicleIds.has(text(item.MasinaID)));
  const revisions = revisionsAll.filter((item) => assignedVehicleIds.has(text(item.MasinaID)));

  const expiringVehicleDocs = buildVehicleDocumentRows(ownVehicles);
  const expiringDocuments = buildDocumentRows(documents).concat(expiringVehicleDocs);
  const todayKey = normalizeDateKey(new Date());
  const tripVehicleIdsToday = new Set(
    tripSheets
      .filter((item) => normalizeDateKey(item.DataPlecare) === todayKey)
      .map((item) => text(item.MasinaID))
      .filter(Boolean)
  );

  return {
    cards: {
      masiniActive: ownVehicles.filter((item) => ["ACTIV", "ACTIVA", "ACTIVE"].includes(normalizeStatus(item.Status))).length,
      masiniInService: ownVehicles.filter((item) => ["IN SERVICE", "SERVICE", "IN_SERVICE"].includes(normalizeStatus(item.Status))).length,
      soferiActivi: linkedSoferId ? 1 : 0,
      asignariActive: activeAssignments.length,
      totalAlimentari: fuelEntries.length,
      costTotalAlimentari: sumByField(fuelEntries, "CostTotal"),
      totalFoiParcurs: tripSheets.length,
      kmTotalParcurs: sumByField(tripSheets, "KmParcursi"),
      totalDocumente: documents.length + expiringVehicleDocs.length,
      documenteExpirate: expiringDocuments.filter((item) => Number(item.zileRamase) < 0).length,
      documenteExpiraIn30Zile: expiringDocuments.filter((item) => Number(item.zileRamase) >= 0 && Number(item.zileRamase) <= 30).length,
      documenteExpiraIn7Zile: expiringDocuments.filter((item) => Number(item.zileRamase) >= 0 && Number(item.zileRamase) <= 7).length
    },
    latestFuelEntries: sortByDateDesc(fuelEntries, "DataAlimentare").slice(0, 5),
    latestTripSheets: sortByDateDesc(tripSheets, "DataPlecare").slice(0, 5),
    expiringDocuments: expiringDocuments.sort((a, b) => Number(a.zileRamase) - Number(b.zileRamase)).slice(0, 10),
    latestDefects: sortByDateDesc(defects, "DataRaportare").slice(0, 5),
    latestRevisions: sortByDateDesc(revisions, "DataRevizie").slice(0, 5),
    extra: {
      totalRevizii: revisions.length,
      defecteDeschise: defects.filter((item) => !["REZOLVAT", "RESPINS"].includes(normalizeStatus(item.Status))).length,
      foiParcursAzi: tripSheets.filter((item) => normalizeDateKey(item.DataPlecare) === todayKey).length,
      masiniFaraFoaieAzi: ownVehicles.filter((item) => !tripVehicleIdsToday.has(text(item.MasinaID))).length
    }
  };
}

function buildDocsByVehicleId(rows) {
  const result = new Map();
  (rows || []).forEach((item) => {
    if (!result.has(item.vehicle_id)) {
      result.set(item.vehicle_id, {});
    }
    result.get(item.vehicle_id)[normalizeStatus(item.document_type)] = item.expiry_date || "";
  });
  return result;
}

function mapVehicle(item, employeeById, docsByVehicleId) {
  const employee = item.current_employee_id ? employeeById.get(item.current_employee_id) : null;
  const docs = docsByVehicleId.get(item.id) || {};
  return {
    MasinaID: item.legacy_vehicle_id || item.id,
    NrInmatriculare: item.plate_number || "",
    Marca: item.brand || "",
    Model: item.model || "",
    Status: item.status || "",
    KmCurenti: numberOrZero(item.current_km),
    SoferCurentID: employee ? employee.legacy_sofer_id || "" : "",
    ITPExpiraLa: docs.ITP || "",
    RCAExpiraLa: docs.RCA || "",
    RovinietaExpiraLa: docs.ROVINIETA || ""
  };
}

function mapAssignment(item, vehiclesRows, employeesRows) {
  const vehicle = (vehiclesRows || []).find((row) => row.id === item.vehicle_id);
  const employee = (employeesRows || []).find((row) => row.id === item.employee_id);
  return {
    AsignareID: item.legacy_assignment_id || item.id,
    MasinaID: vehicle ? vehicle.legacy_vehicle_id || "" : "",
    SoferID: employee ? employee.legacy_sofer_id || "" : "",
    Status: mapAssignmentStatus(item.status)
  };
}

function mapFuelEntry(item, vehiclesRows, employeesRows) {
  const vehicle = (vehiclesRows || []).find((row) => row.id === item.vehicle_id);
  const employee = (employeesRows || []).find((row) => row.id === item.employee_id);
  return {
    AlimentareID: item.legacy_fuel_id || item.id,
    MasinaID: vehicle ? vehicle.legacy_vehicle_id || "" : "",
    NrInmatriculare: vehicle ? vehicle.plate_number || "" : "",
    SoferID: employee ? employee.legacy_sofer_id || "" : "",
    DataAlimentare: item.operation_date || "",
    CantitateLitri: numberOrZero(item.quantity_liters),
    CostTotal: numberOrZero(item.total_cost),
    Statie: item.station_name || "",
    TipCombustibil: item.fuel_type || ""
  };
}

function mapTripSheet(item, vehiclesRows, employeesRows) {
  const vehicle = (vehiclesRows || []).find((row) => row.id === item.vehicle_id);
  const employee = (employeesRows || []).find((row) => row.id === item.employee_id);
  return {
    FoaieParcursID: item.legacy_trip_sheet_id || item.id,
    MasinaID: vehicle ? vehicle.legacy_vehicle_id || "" : "",
    NrInmatriculare: vehicle ? vehicle.plate_number || "" : "",
    SoferID: employee ? employee.legacy_sofer_id || "" : "",
    DataPlecare: item.departure_date || "",
    Destinatie: item.destination || "",
    KmParcursi: numberOrZero(item.distance_km)
  };
}

function mapDocument(item, vehiclesRows) {
  const vehicle = (vehiclesRows || []).find((row) => row.id === item.vehicle_id);
  return {
    DocumentID: item.legacy_document_id || item.id,
    MasinaID: vehicle ? vehicle.legacy_vehicle_id || "" : "",
    NrInmatriculare: vehicle ? vehicle.plate_number || "" : "",
    TipDocument: item.document_type || "",
    DataExpirare: item.expiry_date || ""
  };
}

function mapDefect(item, vehiclesRows, employeesRows) {
  const vehicle = (vehiclesRows || []).find((row) => row.id === item.vehicle_id);
  const employee = (employeesRows || []).find((row) => row.id === item.employee_id);
  return {
    DefectID: item.legacy_defect_id || item.id,
    MasinaID: vehicle ? vehicle.legacy_vehicle_id || "" : "",
    NrInmatriculare: vehicle ? vehicle.plate_number || "" : "",
    SoferID: employee ? employee.legacy_sofer_id || "" : "",
    DataRaportare: item.maintenance_date || "",
    Titlu: item.title || "",
    Severitate: mapSeverity(item.severity),
    Status: mapMaintenanceStatus(item.status),
    CostEstimat: numberOrZero(item.estimated_cost),
    CostFinal: numberOrZero(item.final_cost)
  };
}

function mapRevision(item, vehiclesRows, employeesRows) {
  const vehicle = (vehiclesRows || []).find((row) => row.id === item.vehicle_id);
  const employee = (employeesRows || []).find((row) => row.id === item.employee_id);
  return {
    RevizieID: item.legacy_revision_id || item.id,
    MasinaID: vehicle ? vehicle.legacy_vehicle_id || "" : "",
    NrInmatriculare: vehicle ? vehicle.plate_number || "" : "",
    SoferCurentID: employee ? employee.legacy_sofer_id || "" : "",
    SoferID: employee ? employee.legacy_sofer_id || "" : "",
    DataRevizie: item.maintenance_date || "",
    KmLaRevizie: numberOrZero(item.odometer_km),
    TipRevizie: item.revision_type || item.title || "",
    Service: item.service_name || item.supplier || "",
    Cost: numberOrZero(item.final_cost)
  };
}

function buildDocumentRows(items) {
  return (items || []).map((item) => {
    const expDate = parseDateValue(item.DataExpirare);
    const zileRamase = expDate ? diffDays(new Date(), expDate) : null;
    return {
      MasinaID: item.NrInmatriculare || item.MasinaID || "-",
      NrInmatriculare: item.NrInmatriculare || "",
      TipDocument: item.TipDocument || "-",
      DataExpirare: item.DataExpirare || "",
      zileRamase,
      nivel: buildLevel(zileRamase)
    };
  }).filter((item) => item.zileRamase !== null && item.zileRamase <= 30);
}

function buildVehicleDocumentRows(items) {
  const results = [];
  (items || []).forEach((item) => {
    [
      { field: "ITPExpiraLa", label: "ITP" },
      { field: "RCAExpiraLa", label: "RCA" },
      { field: "RovinietaExpiraLa", label: "Rovinieta" }
    ].forEach((doc) => {
      const expDate = parseDateValue(item[doc.field]);
      if (!expDate) return;
      const zileRamase = diffDays(new Date(), expDate);
      if (zileRamase > 30) return;
      results.push({
        MasinaID: item.NrInmatriculare || item.MasinaID || "-",
        NrInmatriculare: item.NrInmatriculare || "",
        TipDocument: doc.label,
        DataExpirare: item[doc.field],
        zileRamase,
        nivel: buildLevel(zileRamase)
      });
    });
  });
  return results;
}

async function getDefaultOrganization() {
  if (cachedOrganization) return cachedOrganization;

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
  if (!organization) throw new Error("Nu exista organizatie configurata pentru Supabase.");
  cachedOrganization = organization;
  return organization;
}

function sumByField(items, fieldName) {
  return (items || []).reduce((total, item) => total + numberOrZero(item && item[fieldName]), 0);
}

function sortByDateDesc(items, fieldName) {
  return (items || []).slice().sort((a, b) => {
    const dateA = parseDateValue(a && a[fieldName]);
    const dateB = parseDateValue(b && b[fieldName]);
    return (dateB ? dateB.getTime() : 0) - (dateA ? dateA.getTime() : 0);
  });
}

function parseDateValue(value) {
  if (!value) return null;
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) return value;
  const textValue = String(value).trim();
  const ro = textValue.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (ro) return new Date(Number(ro[3]), Number(ro[2]) - 1, Number(ro[1]));
  const parsed = new Date(textValue);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function diffDays(fromDate, toDate) {
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const end = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function buildLevel(days) {
  if (days === null || Number.isNaN(Number(days))) return "INFO";
  if (days < 0) return "EXPIRAT";
  if (days <= 7) return "CRITIC";
  if (days <= 14) return "URGENT";
  if (days <= 30) return "ATENTIE";
  return "INFO";
}

function normalizeDateKey(value) {
  const date = parseDateValue(value);
  if (!date) return "";
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function mapAssignmentStatus(value) {
  const normalized = normalizeStatus(value);
  if (normalized === "ACTIVE") return "ACTIVA";
  if (normalized === "INACTIVE") return "INACTIVA";
  return normalized;
}

function mapMaintenanceStatus(value) {
  const normalized = normalizeStatus(value);
  if (!normalized || normalized === "OPEN") return "RAPORTAT";
  if (normalized === "IN_PROGRESS") return "IN LUCRU";
  if (normalized === "RESOLVED") return "REZOLVAT";
  if (normalized === "CLOSED") return "INCHIS";
  return normalized;
}

function mapSeverity(value) {
  const normalized = normalizeStatus(value);
  if (normalized === "CRITICA") return "HIGH";
  if (normalized === "MEDIE") return "MEDIUM";
  if (normalized === "MICA") return "LOW";
  return normalized || "LOW";
}

function normalizeRole(value) {
  return text(value).toUpperCase();
}

function normalizeStatus(value) {
  return text(value).toUpperCase();
}

function numberOrZero(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value) {
  return String(value || "").trim();
}

module.exports = {
  getDashboardSummary
};
