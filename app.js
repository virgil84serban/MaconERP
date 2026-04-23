const STORAGE_KEY_SESSION = "manager_flota_session";
const STORAGE_KEY_DEV_ROLE = "manager_flota_dev_role";
const DEV_BYPASS_LOGIN = false;
const SUPABASE_BOOTSTRAP = window.ManagerFlotaSupabase || null;
const DEV_BYPASS_USERS = {
  ADMIN: {
    UserID: "USR-0001",
    Nume: "Virgil Serban",
    Email: "virgil84serban@gmail.com",
    Rol: "ADMIN",
    Status: "ACTIV",
    LinkedSoferID: ""
  },
  MANAGER: {
    UserID: "USR-0002",
    Nume: "Tugurlan Daniel",
    Email: "tugurlan@macongrup.ro",
    Rol: "MANAGER",
    Status: "ACTIV",
    LinkedSoferID: ""
  },
  OFFICE: {
    UserID: "USR-0004",
    Nume: "Office Demo",
    Email: "office@firma.ro",
    Rol: "OFFICE",
    Status: "ACTIV",
    LinkedSoferID: ""
  },
  SOFER: {
    UserID: "USR-0003",
    Nume: "Screciu Gheorghe",
    Email: "screciu@gmail.com",
    Rol: "SOFER",
    Status: "ACTIV",
    LinkedSoferID: "DRV-0003"
  }
};

const elements = {
  authScreen: document.getElementById("authScreen"),
  loginForm: document.getElementById("loginForm"),
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  loginBtn: document.getElementById("loginBtn"),
  loginMessage: document.getElementById("loginMessage"),
  installAppBtn: document.getElementById("installAppBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  devRoleSelect: document.getElementById("devRoleSelect"),
  vehiclePlateOptions: document.getElementById("vehiclePlateOptions"),
  currentUserName: document.getElementById("currentUserName"),
  currentUserRole: document.getElementById("currentUserRole"),
  devTools: document.getElementById("devTools"),
  pageTitle: document.getElementById("pageTitle"),
  pageSubtitle: document.getElementById("pageSubtitle"),
  mobileDriverNav: document.getElementById("mobileDriverNav"),
  mobileDriverLogoutBtn: document.getElementById("mobileDriverLogoutBtn"),
  mobileDriverNavButtons: Array.from(document.querySelectorAll("[data-mobile-section]")),
  dashboardNavCards: Array.from(document.querySelectorAll("[data-nav-section]")),
  utilajOptions: document.getElementById("utilajOptions"),

  loadingState: document.getElementById("loadingState"),
  errorState: document.getElementById("errorState"),
  successState: document.getElementById("successState"),

  labelMasiniActive: document.getElementById("labelMasiniActive"),
  labelMasiniInService: document.getElementById("labelMasiniInService"),
  labelSoferiActivi: document.getElementById("labelSoferiActivi"),
  labelAsignariActive: document.getElementById("labelAsignariActive"),
  labelTotalAlimentari: document.getElementById("labelTotalAlimentari"),
  labelCostTotalAlimentari: document.getElementById("labelCostTotalAlimentari"),
  labelTotalFoiParcurs: document.getElementById("labelTotalFoiParcurs"),
  labelKmTotalParcurs: document.getElementById("labelKmTotalParcurs"),
  labelTotalDocumente: document.getElementById("labelTotalDocumente"),
  labelDocumenteExpirate: document.getElementById("labelDocumenteExpirate"),
  labelDocumenteExpiraIn30Zile: document.getElementById("labelDocumenteExpiraIn30Zile"),
  labelDocumenteExpiraIn7Zile: document.getElementById("labelDocumenteExpiraIn7Zile"),
  labelTotalRevizii: document.getElementById("labelTotalRevizii"),
  labelDefecteDeschise: document.getElementById("labelDefecteDeschise"),
  masiniActive: document.getElementById("masiniActive"),
  masiniInService: document.getElementById("masiniInService"),
  soferiActivi: document.getElementById("soferiActivi"),
  asignariActive: document.getElementById("asignariActive"),
  totalAlimentari: document.getElementById("totalAlimentari"),
  costTotalAlimentari: document.getElementById("costTotalAlimentari"),
  totalFoiParcurs: document.getElementById("totalFoiParcurs"),
  kmTotalParcurs: document.getElementById("kmTotalParcurs"),
  totalDocumente: document.getElementById("totalDocumente"),
  documenteExpirate: document.getElementById("documenteExpirate"),
  documenteExpiraIn30Zile: document.getElementById("documenteExpiraIn30Zile"),
  documenteExpiraIn7Zile: document.getElementById("documenteExpiraIn7Zile"),
  totalRevizii: document.getElementById("totalRevizii"),
  defecteDeschise: document.getElementById("defecteDeschise"),
  foiParcursAzi: document.getElementById("foiParcursAzi"),
  masiniFaraFoaieAzi: document.getElementById("masiniFaraFoaieAzi"),

  operationalStatusText: document.getElementById("operationalStatusText"),
  priorityStatusText: document.getElementById("priorityStatusText"),

  fuelTableBody: document.getElementById("fuelTableBody"),
  tripTableBody: document.getElementById("tripTableBody"),
  tripSheetsModuleBody: document.getElementById("tripSheetsModuleBody"),
  documentsTableBody: document.getElementById("documentsTableBody"),
  defectsTableBody: document.getElementById("defectsTableBody"),
  revisionsTableBody: document.getElementById("revisionsTableBody"),
  tripFilterMasina: document.getElementById("tripFilterMasina"),
  tripFilterSofer: document.getElementById("tripFilterSofer"),
  tripFilterData: document.getElementById("tripFilterData"),
  applyTripFiltersBtn: document.getElementById("applyTripFiltersBtn"),
  tripSheetForm: document.getElementById("tripSheetForm"),
  tripSheetId: document.getElementById("tripSheetId"),
  tripMasinaID: document.getElementById("tripMasinaID"),
  tripVehicleRef: document.getElementById("tripVehicleRef"),
  tripSoferField: document.getElementById("tripSoferField"),
  tripSoferID: document.getElementById("tripSoferID"),
  tripDataPlecare: document.getElementById("tripDataPlecare"),
  tripDestinatie: document.getElementById("tripDestinatie"),
  tripScop: document.getElementById("tripScop"),
  tripKmPlecare: document.getElementById("tripKmPlecare"),
  tripKmSosire: document.getElementById("tripKmSosire"),
  tripKmPhotoUrl: document.getElementById("tripKmPhotoUrl"),
  tripKmPhotoFile: document.getElementById("tripKmPhotoFile"),
  tripKmPhotoPreviewWrap: document.getElementById("tripKmPhotoPreviewWrap"),
  tripKmPhotoPreview: document.getElementById("tripKmPhotoPreview"),
  tripKmPhotoPreviewName: document.getElementById("tripKmPhotoPreviewName"),
  tripOcrKm: document.getElementById("tripOcrKm"),
  tripStatus: document.getElementById("tripStatus"),
  tripControlHint: document.getElementById("tripControlHint"),
  tripSheetMessage: document.getElementById("tripSheetMessage"),
  reportTripVehicleRef: document.getElementById("reportTripVehicleRef"),
  reportTripDateFrom: document.getElementById("reportTripDateFrom"),
  reportTripDateTo: document.getElementById("reportTripDateTo"),
  exportTripExcelBtn: document.getElementById("exportTripExcelBtn"),
  exportTripPdfBtn: document.getElementById("exportTripPdfBtn"),
  tripReportMessage: document.getElementById("tripReportMessage"),
  saveTripSheetBtn: document.getElementById("saveTripSheetBtn"),
  cancelTripEditBtn: document.getElementById("cancelTripEditBtn"),
  deleteTripSheetBtn: document.getElementById("deleteTripSheetBtn"),
  vehiclesTableBody: document.getElementById("vehiclesTableBody"),
  vehicleFilterId: document.getElementById("vehicleFilterId"),
  vehicleFilterPlate: document.getElementById("vehicleFilterPlate"),
  vehicleFilterStatus: document.getElementById("vehicleFilterStatus"),
  applyVehicleFiltersBtn: document.getElementById("applyVehicleFiltersBtn"),
  vehicleForm: document.getElementById("vehicleForm"),
  vehicleMasinaID: document.getElementById("vehicleMasinaID"),
  vehicleNrInmatriculare: document.getElementById("vehicleNrInmatriculare"),
  vehicleMarca: document.getElementById("vehicleMarca"),
  vehicleModel: document.getElementById("vehicleModel"),
  vehicleAn: document.getElementById("vehicleAn"),
  vehicleTipVehicul: document.getElementById("vehicleTipVehicul"),
  vehicleCombustibil: document.getElementById("vehicleCombustibil"),
  vehicleStatus: document.getElementById("vehicleStatus"),
  vehicleKmCurenti: document.getElementById("vehicleKmCurenti"),
  vehicleSoferCurentID: document.getElementById("vehicleSoferCurentID"),
  vehicleITPExpiraLa: document.getElementById("vehicleITPExpiraLa"),
  vehicleRCAExpiraLa: document.getElementById("vehicleRCAExpiraLa"),
  vehicleRovinietaExpiraLa: document.getElementById("vehicleRovinietaExpiraLa"),
  vehicleObservatii: document.getElementById("vehicleObservatii"),
  vehicleMessage: document.getElementById("vehicleMessage"),
  reportVehicleRef: document.getElementById("reportVehicleRef"),
  reportVehicleStatus: document.getElementById("reportVehicleStatus"),
  exportVehicleExcelBtn: document.getElementById("exportVehicleExcelBtn"),
  exportVehiclePdfBtn: document.getElementById("exportVehiclePdfBtn"),
  vehicleReportMessage: document.getElementById("vehicleReportMessage"),
  saveVehicleBtn: document.getElementById("saveVehicleBtn"),
  cancelVehicleEditBtn: document.getElementById("cancelVehicleEditBtn"),
  deleteVehicleBtn: document.getElementById("deleteVehicleBtn"),
  driversTableBody: document.getElementById("driversTableBody"),
  driverFilterId: document.getElementById("driverFilterId"),
  driverFilterName: document.getElementById("driverFilterName"),
  driverFilterStatus: document.getElementById("driverFilterStatus"),
  applyDriverFiltersBtn: document.getElementById("applyDriverFiltersBtn"),
  driverForm: document.getElementById("driverForm"),
  driverSoferID: document.getElementById("driverSoferID"),
  driverUserID: document.getElementById("driverUserID"),
  driverNume: document.getElementById("driverNume"),
  driverTelefon: document.getElementById("driverTelefon"),
  driverCategoriePermis: document.getElementById("driverCategoriePermis"),
  driverStatus: document.getElementById("driverStatus"),
  driverObservatii: document.getElementById("driverObservatii"),
  driverMessage: document.getElementById("driverMessage"),
  reportDriverName: document.getElementById("reportDriverName"),
  reportDriverStatus: document.getElementById("reportDriverStatus"),
  exportDriverExcelBtn: document.getElementById("exportDriverExcelBtn"),
  exportDriverPdfBtn: document.getElementById("exportDriverPdfBtn"),
  driverReportMessage: document.getElementById("driverReportMessage"),
  saveDriverBtn: document.getElementById("saveDriverBtn"),
  cancelDriverEditBtn: document.getElementById("cancelDriverEditBtn"),
  deleteDriverBtn: document.getElementById("deleteDriverBtn"),
  usersTableBody: document.getElementById("usersTableBody"),
  userFilterName: document.getElementById("userFilterName"),
  userFilterRole: document.getElementById("userFilterRole"),
  userFilterStatus: document.getElementById("userFilterStatus"),
  applyUserFiltersBtn: document.getElementById("applyUserFiltersBtn"),
  userForm: document.getElementById("userForm"),
  userUserID: document.getElementById("userUserID"),
  userName: document.getElementById("userName"),
  userEmail: document.getElementById("userEmail"),
  userPassword: document.getElementById("userPassword"),
  userRole: document.getElementById("userRole"),
  userStatus: document.getElementById("userStatus"),
  userObservatii: document.getElementById("userObservatii"),
  userMessage: document.getElementById("userMessage"),
  saveUserBtn: document.getElementById("saveUserBtn"),
  cancelUserEditBtn: document.getElementById("cancelUserEditBtn"),
  deleteUserBtn: document.getElementById("deleteUserBtn"),
  assignmentsTableBody: document.getElementById("assignmentsTableBody"),
  assignmentFilterMasina: document.getElementById("assignmentFilterMasina"),
  assignmentFilterSofer: document.getElementById("assignmentFilterSofer"),
  assignmentFilterStatus: document.getElementById("assignmentFilterStatus"),
  applyAssignmentFiltersBtn: document.getElementById("applyAssignmentFiltersBtn"),
  reportAssignmentVehicleRef: document.getElementById("reportAssignmentVehicleRef"),
  reportAssignmentDateFrom: document.getElementById("reportAssignmentDateFrom"),
  reportAssignmentDateTo: document.getElementById("reportAssignmentDateTo"),
  exportAssignmentExcelBtn: document.getElementById("exportAssignmentExcelBtn"),
  exportAssignmentPdfBtn: document.getElementById("exportAssignmentPdfBtn"),
  assignmentReportMessage: document.getElementById("assignmentReportMessage"),
  assignmentForm: document.getElementById("assignmentForm"),
  assignmentID: document.getElementById("assignmentID"),
  assignmentMasinaID: document.getElementById("assignmentMasinaID"),
  assignmentSoferID: document.getElementById("assignmentSoferID"),
  assignmentDataStart: document.getElementById("assignmentDataStart"),
  assignmentStatus: document.getElementById("assignmentStatus"),
  assignmentMotivIncheiere: document.getElementById("assignmentMotivIncheiere"),
  assignmentObservatii: document.getElementById("assignmentObservatii"),
  assignmentMessage: document.getElementById("assignmentMessage"),
  saveAssignmentBtn: document.getElementById("saveAssignmentBtn"),
  cancelAssignmentEditBtn: document.getElementById("cancelAssignmentEditBtn"),
  deleteAssignmentBtn: document.getElementById("deleteAssignmentBtn"),
  fuelEntriesSectionBody: document.getElementById("fuelEntriesSectionBody"),
  fuelFilterMasina: document.getElementById("fuelFilterMasina"),
  fuelFilterSofer: document.getElementById("fuelFilterSofer"),
  fuelFilterData: document.getElementById("fuelFilterData"),
  applyFuelFiltersBtn: document.getElementById("applyFuelFiltersBtn"),
  fuelForm: document.getElementById("fuelForm"),
  fuelEntryID: document.getElementById("fuelEntryID"),
  fuelMasinaID: document.getElementById("fuelMasinaID"),
  fuelSoferID: document.getElementById("fuelSoferID"),
  fuelData: document.getElementById("fuelData"),
  fuelKmLaAlimentare: document.getElementById("fuelKmLaAlimentare"),
  fuelCantitate: document.getElementById("fuelCantitate"),
  fuelCostTotal: document.getElementById("fuelCostTotal"),
  fuelPretPeLitru: document.getElementById("fuelPretPeLitru"),
  fuelStatie: document.getElementById("fuelStatie"),
  fuelTipCombustibil: document.getElementById("fuelTipCombustibil"),
  fuelObservatii: document.getElementById("fuelObservatii"),
  fuelMessage: document.getElementById("fuelMessage"),
  reportFuelVehicleRef: document.getElementById("reportFuelVehicleRef"),
  reportFuelDateFrom: document.getElementById("reportFuelDateFrom"),
  reportFuelDateTo: document.getElementById("reportFuelDateTo"),
  exportFuelExcelBtn: document.getElementById("exportFuelExcelBtn"),
  exportFuelPdfBtn: document.getElementById("exportFuelPdfBtn"),
  fuelReportMessage: document.getElementById("fuelReportMessage"),
  fuelConsumptionVehicleRef: document.getElementById("fuelConsumptionVehicleRef"),
  fuelConsumptionDateFrom: document.getElementById("fuelConsumptionDateFrom"),
  fuelConsumptionDateTo: document.getElementById("fuelConsumptionDateTo"),
  calculateFuelConsumptionBtn: document.getElementById("calculateFuelConsumptionBtn"),
  fuelConsumptionMessage: document.getElementById("fuelConsumptionMessage"),
  saveFuelBtn: document.getElementById("saveFuelBtn"),
  cancelFuelEditBtn: document.getElementById("cancelFuelEditBtn"),
  deleteFuelBtn: document.getElementById("deleteFuelBtn"),
  documentsSectionBody: document.getElementById("documentsSectionBody"),
  documentFilterMasina: document.getElementById("documentFilterMasina"),
  documentFilterTip: document.getElementById("documentFilterTip"),
  documentFilterStatus: document.getElementById("documentFilterStatus"),
  applyDocumentFiltersBtn: document.getElementById("applyDocumentFiltersBtn"),
  documentForm: document.getElementById("documentForm"),
  documentID: document.getElementById("documentID"),
  documentMasinaID: document.getElementById("documentMasinaID"),
  documentTip: document.getElementById("documentTip"),
  documentSerieNumar: document.getElementById("documentSerieNumar"),
  documentDataEmitere: document.getElementById("documentDataEmitere"),
  documentDataExpirare: document.getElementById("documentDataExpirare"),
  documentCost: document.getElementById("documentCost"),
  documentFurnizor: document.getElementById("documentFurnizor"),
  documentStatus: document.getElementById("documentStatus"),
  documentFisierURL: document.getElementById("documentFisierURL"),
  documentObservatii: document.getElementById("documentObservatii"),
  documentMessage: document.getElementById("documentMessage"),
  saveDocumentBtn: document.getElementById("saveDocumentBtn"),
  cancelDocumentEditBtn: document.getElementById("cancelDocumentEditBtn"),
  deleteDocumentBtn: document.getElementById("deleteDocumentBtn"),
  defectsSectionBody: document.getElementById("defectsSectionBody"),
  defectFilterMasina: document.getElementById("defectFilterMasina"),
  defectFilterSofer: document.getElementById("defectFilterSofer"),
  defectFilterSeveritate: document.getElementById("defectFilterSeveritate"),
  applyDefectFiltersBtn: document.getElementById("applyDefectFiltersBtn"),
  defectForm: document.getElementById("defectForm"),
  defectID: document.getElementById("defectID"),
  defectMasinaID: document.getElementById("defectMasinaID"),
  defectSoferID: document.getElementById("defectSoferID"),
  defectDataRaportare: document.getElementById("defectDataRaportare"),
  defectTitlu: document.getElementById("defectTitlu"),
  defectSeveritate: document.getElementById("defectSeveritate"),
  defectStatus: document.getElementById("defectStatus"),
  defectCostEstimat: document.getElementById("defectCostEstimat"),
  defectCostFinal: document.getElementById("defectCostFinal"),
  defectPozaURL: document.getElementById("defectPozaURL"),
  defectDescriere: document.getElementById("defectDescriere"),
  defectMessage: document.getElementById("defectMessage"),
  reportDefectVehicleRef: document.getElementById("reportDefectVehicleRef"),
  reportDefectDateFrom: document.getElementById("reportDefectDateFrom"),
  reportDefectDateTo: document.getElementById("reportDefectDateTo"),
  exportDefectExcelBtn: document.getElementById("exportDefectExcelBtn"),
  exportDefectPdfBtn: document.getElementById("exportDefectPdfBtn"),
  defectReportMessage: document.getElementById("defectReportMessage"),
  saveDefectBtn: document.getElementById("saveDefectBtn"),
  cancelDefectEditBtn: document.getElementById("cancelDefectEditBtn"),
  deleteDefectBtn: document.getElementById("deleteDefectBtn"),
  tankCapacityValue: document.getElementById("tankCapacityValue"),
  tankCurrentLevelValue: document.getElementById("tankCurrentLevelValue"),
  tankLocationValue: document.getElementById("tankLocationValue"),
  tankFillPercentValue: document.getElementById("tankFillPercentValue"),
  tankGaugeFill: document.getElementById("tankGaugeFill"),
  tankStatusHint: document.getElementById("tankStatusHint"),
  fuelTankOperationForm: document.getElementById("fuelTankOperationForm"),
  fuelTankId: document.getElementById("fuelTankId"),
  fuelTankName: document.getElementById("fuelTankName"),
  fuelTankCapacity: document.getElementById("fuelTankCapacity"),
  fuelTankOperationType: document.getElementById("fuelTankOperationType"),
  fuelTankQuantity: document.getElementById("fuelTankQuantity"),
  fuelTankLocation: document.getElementById("fuelTankLocation"),
  fuelTankUtility: document.getElementById("fuelTankUtility"),
  fuelTankNotes: document.getElementById("fuelTankNotes"),
  fuelTankMessage: document.getElementById("fuelTankMessage"),
  fillTankBtn: document.getElementById("fillTankBtn"),
  dispenseTankBtn: document.getElementById("dispenseTankBtn"),
  cancelFuelTankEditBtn: document.getElementById("cancelFuelTankEditBtn"),
  tankLatestTransactionsBody: document.getElementById("tankLatestTransactionsBody"),
  tankTxnFilterType: document.getElementById("tankTxnFilterType"),
  tankTxnFilterUtility: document.getElementById("tankTxnFilterUtility"),
  tankTxnFilterDate: document.getElementById("tankTxnFilterDate"),
  applyTankTxnFiltersBtn: document.getElementById("applyTankTxnFiltersBtn"),
  tankUtilityTransactionsBody: document.getElementById("tankUtilityTransactionsBody"),
  fuelUtilityForm: document.getElementById("fuelUtilityForm"),
  fuelUtilityTankId: document.getElementById("fuelUtilityTankId"),
  fuelUtilityLevel: document.getElementById("fuelUtilityLevel"),
  fuelUtilityLocation: document.getElementById("fuelUtilityLocation"),
  fuelUtilityTarget: document.getElementById("fuelUtilityTarget"),
  fuelUtilityQuantity: document.getElementById("fuelUtilityQuantity"),
  fuelUtilityNotes: document.getElementById("fuelUtilityNotes"),
  saveFuelUtilityBtn: document.getElementById("saveFuelUtilityBtn"),
  fuelUtilityMessage: document.getElementById("fuelUtilityMessage"),
  exportTankUtilityExcelBtn: document.getElementById("exportTankUtilityExcelBtn"),
  exportTankUtilityPdfBtn: document.getElementById("exportTankUtilityPdfBtn"),
  tankUtilityReportMessage: document.getElementById("tankUtilityReportMessage"),
  tankHistoryFilterType: document.getElementById("tankHistoryFilterType"),
  tankHistoryFilterLocation: document.getElementById("tankHistoryFilterLocation"),
  tankHistoryFilterDate: document.getElementById("tankHistoryFilterDate"),
  applyTankHistoryFiltersBtn: document.getElementById("applyTankHistoryFiltersBtn"),
  tankHistoryBody: document.getElementById("tankHistoryBody"),
  tankHistoryMessage: document.getElementById("tankHistoryMessage"),
  reportTankType: document.getElementById("reportTankType"),
  reportTankLocation: document.getElementById("reportTankLocation"),
  reportTankDateFrom: document.getElementById("reportTankDateFrom"),
  reportTankDateTo: document.getElementById("reportTankDateTo"),
  exportTankExcelBtn: document.getElementById("exportTankExcelBtn"),
  exportTankPdfBtn: document.getElementById("exportTankPdfBtn"),
  tankReportMessage: document.getElementById("tankReportMessage"),
  navButtons: Array.from(document.querySelectorAll("[data-role-allow]")),
  capabilityPills: Array.from(document.querySelectorAll("[data-capability]")),
  vehicleLookupInputs: Array.from(document.querySelectorAll("[data-vehicle-lookup]")),
  appSections: {
    dashboard: document.getElementById("dashboardSection"),
    masini: document.getElementById("masiniSection"),
    soferi: document.getElementById("soferiSection"),
    users: document.getElementById("usersSection"),
    asignari: document.getElementById("asignariSection"),
    alimentari: document.getElementById("alimentariSection"),
    "bazin-motorina": document.getElementById("bazinMotorinaSection"),
    "alimentari-utilaje": document.getElementById("alimentariUtilajeSection"),
    "istoric-bazin": document.getElementById("istoricBazinSection"),
    "foi-parcurs": document.getElementById("foiParcursSection"),
    documente: document.getElementById("documenteSection"),
    defecte: document.getElementById("defecteSection")
  }
};

let tripSheetsState = [];
let selectedTripSheetId = "";
let vehiclesState = [];
let selectedVehicleId = "";
let driversState = [];
let selectedDriverId = "";
let usersState = [];
let selectedUserId = "";
let assignmentsState = [];
let selectedAssignmentId = "";
let fuelEntriesState = [];
let selectedFuelEntryId = "";
let fuelTanksState = [];
let fuelTankTransactionsState = [];
let selectedFuelTankTransactionId = "";
let selectedFuelTankTransactionItem = null;
let documentsState = [];
let selectedDocumentId = "";
let defectsState = [];
let selectedDefectId = "";
let activeSection = "dashboard";
let deferredInstallPrompt = null;
let tripPhotoPreviewObjectUrl = "";
let supabaseBootstrapPromise = null;

document.addEventListener("DOMContentLoaded", () => {
  init().catch((error) => {
    console.error("Initialization failed.", error);
  });
});

async function init() {
  bindEvents();
  registerPwaSupport();
  ensureDevelopmentSession();
  await restoreSession();
  bootstrapSupabase();

  if (getSession()) {
    loadDashboard();
  }
}

function bootstrapSupabase() {
  if (!SUPABASE_BOOTSTRAP || typeof SUPABASE_BOOTSTRAP.init !== "function") {
    return Promise.resolve(null);
  }

  if (!supabaseBootstrapPromise) {
    supabaseBootstrapPromise = SUPABASE_BOOTSTRAP.init().catch((error) => {
      console.warn("Supabase bootstrap failed.", error);
      return null;
    });
  }

  return supabaseBootstrapPromise;
}

function bindEvents() {
  if (elements.loginForm) {
    elements.loginForm.addEventListener("submit", handleLogin);
  }
  if (elements.installAppBtn) {
    elements.installAppBtn.addEventListener("click", handleInstallApp);
  }
  if (elements.refreshBtn) {
    elements.refreshBtn.addEventListener("click", loadDashboard);
  }
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener("click", handleLogout);
  }
  if (elements.mobileDriverLogoutBtn) {
    elements.mobileDriverLogoutBtn.addEventListener("click", handleLogout);
  }
  if (elements.devRoleSelect) {
    elements.devRoleSelect.addEventListener("change", handleDevRoleChange);
  }
  if (elements.applyTripFiltersBtn) {
    elements.applyTripFiltersBtn.addEventListener("click", applyTripSheetFilters);
  }
  if (elements.tripSheetForm) {
    elements.tripSheetForm.addEventListener("submit", handleCreateTripSheet);
  }
  if (elements.cancelTripEditBtn) {
    elements.cancelTripEditBtn.addEventListener("click", resetTripSheetForm);
  }
  if (elements.deleteTripSheetBtn) {
    elements.deleteTripSheetBtn.addEventListener("click", handleDeleteTripSheet);
  }
  if (elements.tripVehicleRef) {
    elements.tripVehicleRef.addEventListener("input", updateTripControlState);
    elements.tripVehicleRef.addEventListener("blur", updateTripControlState);
  }
  if (elements.tripKmPhotoFile) {
    elements.tripKmPhotoFile.addEventListener("change", handleTripPhotoSelection);
  }
  if (elements.applyVehicleFiltersBtn) {
    elements.applyVehicleFiltersBtn.addEventListener("click", applyVehicleFilters);
  }
  if (elements.vehicleForm) {
    elements.vehicleForm.addEventListener("submit", handleVehicleSubmit);
  }
  if (elements.cancelVehicleEditBtn) {
    elements.cancelVehicleEditBtn.addEventListener("click", resetVehicleForm);
  }
  if (elements.exportVehicleExcelBtn) {
    elements.exportVehicleExcelBtn.addEventListener("click", () => handleExportVehicles("excel"));
  }
  if (elements.exportVehiclePdfBtn) {
    elements.exportVehiclePdfBtn.addEventListener("click", () => handleExportVehicles("pdf"));
  }
  if (elements.deleteVehicleBtn) {
    elements.deleteVehicleBtn.addEventListener("click", handleDeleteVehicle);
  }
  if (elements.applyDriverFiltersBtn) {
    elements.applyDriverFiltersBtn.addEventListener("click", applyDriverFilters);
  }
  if (elements.driverForm) {
    elements.driverForm.addEventListener("submit", handleDriverSubmit);
  }
  if (elements.cancelDriverEditBtn) {
    elements.cancelDriverEditBtn.addEventListener("click", resetDriverForm);
  }
  if (elements.deleteDriverBtn) {
    elements.deleteDriverBtn.addEventListener("click", handleDeleteDriver);
  }
  if (elements.exportDriverExcelBtn) {
    elements.exportDriverExcelBtn.addEventListener("click", () => handleExportDrivers("excel"));
  }
  if (elements.exportDriverPdfBtn) {
    elements.exportDriverPdfBtn.addEventListener("click", () => handleExportDrivers("pdf"));
  }
  if (elements.applyUserFiltersBtn) {
    elements.applyUserFiltersBtn.addEventListener("click", applyUserFilters);
  }
  if (elements.userForm) {
    elements.userForm.addEventListener("submit", handleUserSubmit);
  }
  if (elements.cancelUserEditBtn) {
    elements.cancelUserEditBtn.addEventListener("click", resetUserForm);
  }
  if (elements.deleteUserBtn) {
    elements.deleteUserBtn.addEventListener("click", handleDeleteUser);
  }
  if (elements.applyAssignmentFiltersBtn) {
    elements.applyAssignmentFiltersBtn.addEventListener("click", applyAssignmentFilters);
  }
  if (elements.exportAssignmentExcelBtn) {
    elements.exportAssignmentExcelBtn.addEventListener("click", () => handleExportAssignments("excel"));
  }
  if (elements.exportAssignmentPdfBtn) {
    elements.exportAssignmentPdfBtn.addEventListener("click", () => handleExportAssignments("pdf"));
  }
  if (elements.assignmentForm) {
    elements.assignmentForm.addEventListener("submit", handleAssignmentSubmit);
  }
  if (elements.cancelAssignmentEditBtn) {
    elements.cancelAssignmentEditBtn.addEventListener("click", resetAssignmentForm);
  }
  if (elements.deleteAssignmentBtn) {
    elements.deleteAssignmentBtn.addEventListener("click", handleDeleteAssignment);
  }
  if (elements.applyFuelFiltersBtn) {
    elements.applyFuelFiltersBtn.addEventListener("click", applyFuelFilters);
  }
  if (elements.fuelForm) {
    elements.fuelForm.addEventListener("submit", handleFuelSubmit);
  }
  if (elements.cancelFuelEditBtn) {
    elements.cancelFuelEditBtn.addEventListener("click", resetFuelForm);
  }
  if (elements.deleteFuelBtn) {
    elements.deleteFuelBtn.addEventListener("click", handleDeleteFuelEntry);
  }
  if (elements.exportFuelExcelBtn) {
    elements.exportFuelExcelBtn.addEventListener("click", () => handleExportFuel("excel"));
  }
    if (elements.exportFuelPdfBtn) {
      elements.exportFuelPdfBtn.addEventListener("click", () => handleExportFuel("pdf"));
    }
  if (elements.calculateFuelConsumptionBtn) {
      elements.calculateFuelConsumptionBtn.addEventListener("click", handleFuelConsumptionCalculation);
    }
  if (elements.fillTankBtn) {
    elements.fillTankBtn.addEventListener("click", () => handleFuelTankOperation("UMPLERE"));
  }
  if (elements.dispenseTankBtn) {
    elements.dispenseTankBtn.addEventListener("click", () => handleFuelTankOperation("DESCARCARE"));
  }
  if (elements.cancelFuelTankEditBtn) {
    elements.cancelFuelTankEditBtn.addEventListener("click", () => resetFuelTankOperationForm(true));
  }
  if (elements.applyTankTxnFiltersBtn) {
    elements.applyTankTxnFiltersBtn.addEventListener("click", applyFuelTankTransactionFilters);
  }
  if (elements.fuelUtilityForm) {
    elements.fuelUtilityForm.addEventListener("submit", handleFuelUtilitySubmit);
  }
  if (elements.exportTankUtilityExcelBtn) {
    elements.exportTankUtilityExcelBtn.addEventListener("click", () => handleExportTankUtility("excel"));
  }
  if (elements.exportTankUtilityPdfBtn) {
    elements.exportTankUtilityPdfBtn.addEventListener("click", () => handleExportTankUtility("pdf"));
  }
  if (elements.applyTankHistoryFiltersBtn) {
    elements.applyTankHistoryFiltersBtn.addEventListener("click", applyFuelTankHistoryFilters);
  }
  if (elements.exportTankExcelBtn) {
    elements.exportTankExcelBtn.addEventListener("click", () => handleExportTankHistory("excel"));
  }
  if (elements.exportTankPdfBtn) {
    elements.exportTankPdfBtn.addEventListener("click", () => handleExportTankHistory("pdf"));
  }
  if (elements.applyDocumentFiltersBtn) {
    elements.applyDocumentFiltersBtn.addEventListener("click", applyDocumentFilters);
  }
  if (elements.documentForm) {
    elements.documentForm.addEventListener("submit", handleDocumentSubmit);
  }
  if (elements.cancelDocumentEditBtn) {
    elements.cancelDocumentEditBtn.addEventListener("click", resetDocumentForm);
  }
  if (elements.deleteDocumentBtn) {
    elements.deleteDocumentBtn.addEventListener("click", handleDeleteDocument);
  }
  if (elements.applyDefectFiltersBtn) {
    elements.applyDefectFiltersBtn.addEventListener("click", applyDefectFilters);
  }
  if (elements.defectForm) {
    elements.defectForm.addEventListener("submit", handleDefectSubmit);
  }
  if (elements.cancelDefectEditBtn) {
    elements.cancelDefectEditBtn.addEventListener("click", resetDefectForm);
  }
  if (elements.deleteDefectBtn) {
    elements.deleteDefectBtn.addEventListener("click", handleDeleteDefect);
  }
  if (elements.exportTripExcelBtn) {
    elements.exportTripExcelBtn.addEventListener("click", () => handleExportTrips("excel"));
  }
  if (elements.exportTripPdfBtn) {
    elements.exportTripPdfBtn.addEventListener("click", () => handleExportTrips("pdf"));
  }
  if (elements.exportDefectExcelBtn) {
    elements.exportDefectExcelBtn.addEventListener("click", () => handleExportDefects("excel"));
  }
  if (elements.exportDefectPdfBtn) {
    elements.exportDefectPdfBtn.addEventListener("click", () => handleExportDefects("pdf"));
  }
  elements.vehicleLookupInputs.forEach((input) => {
    input.addEventListener("change", handleVehicleLookupInput);
    input.addEventListener("blur", handleVehicleLookupInput);
  });
  elements.navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.style.display === "none") {
        return;
      }
      setActiveSection(button.dataset.section || "dashboard");
    });
  });

  elements.dashboardNavCards.forEach((card) => {
    card.addEventListener("click", () => {
      const targetSection = card.dataset.navSection || "dashboard";
      const scrollTarget = card.dataset.scrollTarget || "";
      setActiveSection(targetSection);
      if (scrollTarget) {
        window.setTimeout(() => {
          const el = document.getElementById(scrollTarget);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 80);
      }
    });
  });

  elements.mobileDriverNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetSection = button.dataset.mobileSection || "foi-parcurs";
      setActiveSection(targetSection);
    });
  });
}

function registerPwaSupport() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        // Nu blocam aplicatia daca SW-ul nu se inregistreaza.
      });
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButtonVisibility();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallButtonVisibility();
    showSuccess("Aplicatia a fost instalata pe dispozitiv.");
  });

  window.addEventListener("resize", () => {
    applySessionToUi(getSession());
  });
}

function isAdminUser(user = getSession()) {
  return String((user && user.Rol) || "").trim().toUpperCase() === "ADMIN";
}

function clearTripPhotoPreview() {
  if (tripPhotoPreviewObjectUrl) {
    URL.revokeObjectURL(tripPhotoPreviewObjectUrl);
    tripPhotoPreviewObjectUrl = "";
  }

  if (elements.tripKmPhotoPreview) {
    elements.tripKmPhotoPreview.removeAttribute("src");
  }
  if (elements.tripKmPhotoPreviewWrap) {
    elements.tripKmPhotoPreviewWrap.classList.add("hidden");
  }
  if (elements.tripKmPhotoPreviewName) {
    elements.tripKmPhotoPreviewName.textContent = "";
  }
}

function handleTripPhotoSelection() {
  const file = elements.tripKmPhotoFile && elements.tripKmPhotoFile.files ? elements.tripKmPhotoFile.files[0] : null;

  clearTripPhotoPreview();

  if (!file) {
    if (elements.tripKmPhotoUrl && String(elements.tripKmPhotoUrl.value || "").startsWith("captured:")) {
      elements.tripKmPhotoUrl.value = "";
    }
    return;
  }

  if (elements.tripKmPhotoUrl && !valueOf(elements.tripKmPhotoUrl)) {
    elements.tripKmPhotoUrl.value = `captured:${file.name}`;
  }

  tripPhotoPreviewObjectUrl = URL.createObjectURL(file);

  if (elements.tripKmPhotoPreview) {
    elements.tripKmPhotoPreview.src = tripPhotoPreviewObjectUrl;
  }
  if (elements.tripKmPhotoPreviewWrap) {
    elements.tripKmPhotoPreviewWrap.classList.remove("hidden");
  }
  if (elements.tripKmPhotoPreviewName) {
    elements.tripKmPhotoPreviewName.textContent = `Poza selectata: ${file.name}`;
  }
}

function prefillDriverVehicleForOperationalForms() {
  const session = getSession();
  if (!session || currentRole() !== "SOFER") {
    return;
  }

  const primaryVehicle = getPrimaryVehicleForSession(session);
  const vehicleRef = primaryVehicle ? String(primaryVehicle.NrInmatriculare || "") : valueOf(elements.tripVehicleRef);
  const vehicleId = primaryVehicle ? String(primaryVehicle.MasinaID || "") : valueOf(elements.tripMasinaID);
  const effectiveSoferId = getEffectiveLinkedSoferId(session) || getDriverIdForVehicleReference(vehicleRef, vehicleId);

  if (elements.tripVehicleRef && !selectedTripSheetId && vehicleRef) {
    elements.tripVehicleRef.value = vehicleRef;
  }
  if (elements.tripMasinaID && !selectedTripSheetId && vehicleId) {
    elements.tripMasinaID.value = vehicleId;
  }
  if (elements.tripSoferID && !selectedTripSheetId && effectiveSoferId) {
    elements.tripSoferID.value = effectiveSoferId;
  }
  if (elements.defectMasinaID && !selectedDefectId && vehicleRef) {
    elements.defectMasinaID.value = vehicleRef;
  }
  if (elements.defectSoferID && !selectedDefectId && effectiveSoferId) {
    elements.defectSoferID.value = effectiveSoferId;
  }
  if (elements.fuelMasinaID && !selectedFuelEntryId && vehicleRef) {
    elements.fuelMasinaID.value = vehicleRef;
  }
  if (elements.fuelSoferID && !selectedFuelEntryId && effectiveSoferId) {
    elements.fuelSoferID.value = effectiveSoferId;
  }

  updateTripControlState();
}

async function handleInstallApp() {
  if (!deferredInstallPrompt) {
    showError("Instalarea aplicatiei nu este disponibila inca pe acest dispozitiv.");
    return;
  }

  deferredInstallPrompt.prompt();
  try {
    await deferredInstallPrompt.userChoice;
  } catch (error) {
    // Ignoram inchiderea dialogului.
  }
  deferredInstallPrompt = null;
  updateInstallButtonVisibility();
}

async function handleLogin(event) {
  event.preventDefault();

  const email = elements.loginEmail ? elements.loginEmail.value.trim() : "";
  const password = elements.loginPassword ? elements.loginPassword.value : "";

  if (!email || !password) {
    setLoginMessage("Introdu emailul si parola.", true);
    return;
  }

  try {
    setLoginMessage("Se verifica datele...", false);
    hideMessages();

    const response = await callLocalAuthEndpoint("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (!response.ok || !response.data || !response.data.user) {
      throw new Error(response.message || "Autentificare esuata.");
    }

    saveSession(response.data.user);
    applySessionToUi(response.data.user);
    setLoginMessage("", false);
    if (elements.loginForm) {
      elements.loginForm.reset();
    }
    showSuccess(`Bun venit, ${response.data.user.Nume || response.data.user.Email || "utilizator"}!`);
    loadDashboard();
  } catch (error) {
    setLoginMessage(getReadableError(error), true);
  }
}

function handleLogout() {
  callLocalAuthEndpoint("/api/logout", {
    method: "POST",
    body: JSON.stringify({})
  }).catch(() => null);
  localStorage.removeItem(STORAGE_KEY_SESSION);
  clearOperationalState();
  applySessionToUi(null);
  hideMessages();
  setLoginMessage("", false);
  showSuccess("Te-ai delogat din aplicatie.");
}

async function handleTestConnection() {
  if (!isAdminUser()) {
    showError("Doar ADMIN poate testa conexiunea API.");
    return;
  }

  try {
    hideMessages();
    const response = await callLocalAuthEndpoint("/api/ping", {
      method: "GET"
    });

    if (!response.ok) {
      throw new Error(response.message || "Conexiune esuata.");
    }

    showSuccess("Conexiune API verificata cu succes.");
  } catch (error) {
    showError(getReadableError(error));
  }
}

async function loadDashboard() {
  if (!getSession()) {
    showError("Autentifica-te pentru a incarca dashboardul.");
    return;
  }

  try {
    hideMessages();
    showLoading(true);
    const session = getSession();
    const response = await listDashboardSummaryData(withSessionPayload({ linkedSoferId: session.LinkedSoferID || "" }));
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut incarca dashboard-ul.");
    }
    const dashboardData = response.data || {};

    await preloadOperationalReferences();
    renderDashboard(dashboardData);
    await loadTripSheetsModule();
    await reloadActiveSectionData();
    showSuccess("Dashboard actualizat.");
  } catch (error) {
    showError(getReadableError(error));
  } finally {
    showLoading(false);
  }
}

async function preloadOperationalReferences() {
  await Promise.all([
    preloadVehicleReferences(),
    preloadDriverReferences(),
    preloadAssignmentReferences()
  ]);
}

async function buildDriverDashboardData(session) {
  const response = await listDashboardSummaryData(withSessionPayload({
    linkedSoferId: getEffectiveLinkedSoferId(session)
  }));
  if (!response.ok) {
    throw new Error(response.message || "Nu am putut incarca dashboard-ul soferului.");
  }
  return response.data || {};
}

async function reloadActiveSectionData() {
  if (activeSection === "masini") return loadVehiclesModule();
  if (activeSection === "soferi") return loadDriversModule();
  if (activeSection === "users") return loadUsersModule();
  if (activeSection === "asignari") return loadAssignmentsModule();
  if (activeSection === "alimentari") return loadFuelModule();
  if (activeSection === "bazin-motorina") return loadFuelTankModule();
  if (activeSection === "alimentari-utilaje") return loadFuelTankModule();
  if (activeSection === "istoric-bazin") return loadFuelTankModule();
  if (activeSection === "foi-parcurs") return loadTripSheetsModule();
  if (activeSection === "documente") return loadDocumentsModule();
  if (activeSection === "defecte") return loadDefectsModule();
  return Promise.resolve();
}

async function preloadVehicleReferences() {
  if (!getSession()) {
    return;
  }

  try {
    const session = getSession();
    const response = await listVehiclesData(withSessionPayload({ linkedSoferId: session.LinkedSoferID || "" }));
    if (response.ok && Array.isArray(response.data && response.data.items)) {
      vehiclesState = response.data.items;
      refreshVehiclePlateOptions();
    }
  } catch (error) {
    // Pastram fallback-ul local si nu blocam dashboardul daca dictionarul de vehicule nu vine.
  }
}

async function preloadDriverReferences() {
  if (!getSession()) {
    return;
  }

  try {
    const response = await listDriversData(withSessionPayload({}));
    if (response.ok && Array.isArray(response.data && response.data.items)) {
      driversState = response.data.items;
    }
  } catch (error) {
    // Nu blocam ecranul daca lista de soferi nu este disponibila.
  }
}

async function preloadAssignmentReferences() {
  if (!getSession()) {
    return;
  }

  try {
    const response = await listAssignmentsData(withSessionPayload({}));
    if (response.ok && Array.isArray(response.data && response.data.items)) {
      assignmentsState = response.data.items;
    }
  } catch (error) {
    // Nu blocam ecranul daca lista de asignari nu este disponibila.
  }
}

function refreshVehiclePlateOptions() {
  if (!elements.vehiclePlateOptions) {
    return;
  }

  const seen = new Set();
  const options = (vehiclesState || [])
    .filter((item) => String(item.NrInmatriculare || "").trim())
    .map((item) => ({
      value: String(item.NrInmatriculare || "").trim(),
      label: [item.Marca, item.Model].filter(Boolean).join(" ")
    }))
    .filter((item) => {
      const key = normalizeVehicleKey(item.value);
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

  elements.vehiclePlateOptions.innerHTML = options.map((item) => {
    const safeValue = escapeHtml(item.value);
    const safeLabel = escapeHtml(item.label || item.value);
    return `<option value="${safeValue}" label="${safeLabel}"></option>`;
  }).join("");

  refreshUtilajOptions();
}

function refreshUtilajOptions() {
  if (!elements.utilajOptions) {
    return;
  }

  const seen = new Set();
  const options = getUtilityVehicles()
    .map((item) => ({
      value: String(item.NrInmatriculare || item.MasinaID || "").trim(),
      label: [item.TipVehicul, item.Marca, item.Model].filter(Boolean).join(" | ")
    }))
    .filter((item) => {
      const key = normalizeVehicleKey(item.value);
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

  elements.utilajOptions.innerHTML = options.map((item) => {
    const safeValue = escapeHtml(item.value);
    const safeLabel = escapeHtml(item.label || item.value);
    return `<option value="${safeValue}" label="${safeLabel}"></option>`;
  }).join("");
}

function getUtilityVehicles() {
  const roadVehicleTypes = ["AUTOTURISM", "AUTOUTILITARA", "CAMION", "DUBA", "VAN", "TRUCK"];
  const explicitUtilityKeywords = ["UTILAJ", "EXCAVATOR", "BULDO", "TRACTOR", "COMPRESOR", "GENERATOR", "MOTOSTIVUITOR", "MINIINCARCATOR", "INCARCATOR", "PLACA", "CILINDRU"];

  return (vehiclesState || []).filter((item) => {
    const type = String(item.TipVehicul || "").trim().toUpperCase();
    if (!type) {
      return false;
    }
    if (explicitUtilityKeywords.some((keyword) => type.includes(keyword))) {
      return true;
    }
    return !roadVehicleTypes.includes(type);
  });
}

async function callLocalAuthEndpoint(path, options) {
  const response = await fetch(path, {
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    ...(options || {})
  });

  const text = await response.text();
  let parsed = null;

  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      throw new Error("API-ul local nu a returnat JSON valid.");
    }
  }

  if (!response.ok) {
    throw new Error((parsed && parsed.message) || `Requestul catre API a esuat (${response.status}).`);
  }

  return parsed || { ok: true };
}

async function callVehiclesApi(method, payload) {
  const response = await fetch("/api/vehicles", {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: method === "GET" ? undefined : JSON.stringify(payload || {})
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Requestul catre Vehicles API a esuat (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Requestul catre Vehicles API a esuat (${response.status}).`);
    }
  }

  return response.json();
}

async function listVehiclesData(payload) {
  const url = new URL("/api/vehicles", window.location.origin);
  url.searchParams.set("_ts", Date.now());

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Nu am putut incarca vehiculele (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Nu am putut incarca vehiculele (${response.status}).`);
    }
  }

  return response.json();
}

function saveVehicleData(payload, isEditMode) {
  return callVehiclesApi(isEditMode ? "PUT" : "POST", payload);
}

function deleteVehicleData(payload) {
  return callVehiclesApi("DELETE", payload);
}

async function callUsersApi(method, payload) {
  const response = await fetch("/api/users", {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: method === "GET" ? undefined : JSON.stringify(payload || {})
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Requestul catre Users API a esuat (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Requestul catre Users API a esuat (${response.status}).`);
    }
  }

  return response.json();
}

async function listUsersData() {
  const url = new URL("/api/users", window.location.origin);
  url.searchParams.set("_ts", Date.now());

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Nu am putut incarca utilizatorii (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Nu am putut incarca utilizatorii (${response.status}).`);
    }
  }

  return response.json();
}

function saveUserData(payload, isEditMode) {
  return callUsersApi(isEditMode ? "PUT" : "POST", payload);
}

function deleteUserData(payload) {
  return callUsersApi("DELETE", payload);
}

async function callDriversApi(method, payload) {
  const response = await fetch("/api/drivers", {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: method === "GET" ? undefined : JSON.stringify(payload || {})
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Requestul catre Drivers API a esuat (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Requestul catre Drivers API a esuat (${response.status}).`);
    }
  }

  return response.json();
}

async function listDriversData(payload) {
  const url = new URL("/api/drivers", window.location.origin);
  url.searchParams.set("_ts", Date.now());

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Nu am putut incarca soferii (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Nu am putut incarca soferii (${response.status}).`);
    }
  }

  return response.json();
}

function saveDriverData(payload, isEditMode) {
  return callDriversApi(isEditMode ? "PUT" : "POST", payload);
}

function deleteDriverData(payload) {
  return callDriversApi("DELETE", payload);
}

async function callFuelEntriesApi(method, payload) {
  const response = await fetch("/api/fuel-entries", {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: method === "GET" ? undefined : JSON.stringify(payload || {})
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Requestul catre Fuel API a esuat (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Requestul catre Fuel API a esuat (${response.status}).`);
    }
  }

  return response.json();
}

async function listFuelEntriesData(payload) {
  const url = new URL("/api/fuel-entries", window.location.origin);
  url.searchParams.set("_ts", Date.now());

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Nu am putut incarca alimentarile (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Nu am putut incarca alimentarile (${response.status}).`);
    }
  }

  return response.json();
}

function saveFuelEntryData(payload, isEditMode) {
  return callFuelEntriesApi(isEditMode ? "PUT" : "POST", payload);
}

function deleteFuelEntryData(payload) {
  return callFuelEntriesApi("DELETE", payload);
}

async function callAssignmentsApi(method, payload) {
  const response = await fetch("/api/assignments", {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: method === "GET" ? undefined : JSON.stringify(payload || {})
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Requestul catre Assignments API a esuat (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Requestul catre Assignments API a esuat (${response.status}).`);
    }
  }

  return response.json();
}

async function listAssignmentsData(payload) {
  const url = new URL("/api/assignments", window.location.origin);
  url.searchParams.set("_ts", Date.now());

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Nu am putut incarca asignarile (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Nu am putut incarca asignarile (${response.status}).`);
    }
  }

  return response.json();
}

function saveAssignmentData(payload, isEditMode) {
  return callAssignmentsApi(isEditMode ? "PUT" : "POST", payload);
}

function deleteAssignmentData(payload) {
  return callAssignmentsApi("DELETE", payload);
}

async function callFuelTanksApi(path, method, payload) {
  const response = await fetch(path, {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: method === "GET" ? undefined : JSON.stringify(payload || {})
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Requestul catre Fuel Tank API a esuat (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Requestul catre Fuel Tank API a esuat (${response.status}).`);
    }
  }

  return response.json();
}

async function listFuelTanksData(payload) {
  const url = new URL("/api/fuel-tanks", window.location.origin);
  url.searchParams.set("_ts", Date.now());

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Nu am putut incarca bazinul (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Nu am putut incarca bazinul (${response.status}).`);
    }
  }

  return response.json();
}

async function listFuelTankTransactionsData(payload) {
  const url = new URL("/api/fuel-tank-transactions", window.location.origin);
  url.searchParams.set("_ts", Date.now());

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Nu am putut incarca tranzactiile de bazin (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Nu am putut incarca tranzactiile de bazin (${response.status}).`);
    }
  }

  return response.json();
}

function createFuelTankTransactionData(payload) {
  return callFuelTanksApi("/api/fuel-tank-transactions", "POST", payload);
}

function saveFuelTankTransactionData(payload, isEditMode) {
  return callFuelTanksApi("/api/fuel-tank-transactions", isEditMode ? "PUT" : "POST", payload);
}

function deleteFuelTankTransactionData(payload) {
  return callFuelTanksApi("/api/fuel-tank-transactions", "DELETE", payload);
}

async function callDocumentsApi(method, payload) {
  const response = await fetch("/api/documents", {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: method === "GET" ? undefined : JSON.stringify(payload || {})
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Requestul catre Documents API a esuat (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Requestul catre Documents API a esuat (${response.status}).`);
    }
  }

  return response.json();
}

async function listDocumentsData(payload) {
  const url = new URL("/api/documents", window.location.origin);
  url.searchParams.set("_ts", Date.now());

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Nu am putut incarca documentele (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Nu am putut incarca documentele (${response.status}).`);
    }
  }

  return response.json();
}

function saveDocumentData(payload, isEditMode) {
  return callDocumentsApi(isEditMode ? "PUT" : "POST", payload);
}

function deleteDocumentData(payload) {
  return callDocumentsApi("DELETE", payload);
}

async function callDefectsApi(method, payload) {
  const response = await fetch("/api/defects", {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: method === "GET" ? undefined : JSON.stringify(payload || {})
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Requestul catre Defects API a esuat (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Requestul catre Defects API a esuat (${response.status}).`);
    }
  }

  return response.json();
}

async function listDefectsData(payload) {
  const url = new URL("/api/defects", window.location.origin);
  url.searchParams.set("_ts", Date.now());

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Nu am putut incarca defectele (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Nu am putut incarca defectele (${response.status}).`);
    }
  }

  return response.json();
}

function saveDefectData(payload, isEditMode) {
  return callDefectsApi(isEditMode ? "PUT" : "POST", payload);
}

function deleteDefectData(payload) {
  return callDefectsApi("DELETE", payload);
}

async function callRevisionsApi(method, payload) {
  const response = await fetch("/api/revisions", {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: method === "GET" ? undefined : JSON.stringify(payload || {})
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Requestul catre Revisions API a esuat (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Requestul catre Revisions API a esuat (${response.status}).`);
    }
  }

  return response.json();
}

async function listRevisionsData(payload) {
  const url = new URL("/api/revisions", window.location.origin);
  url.searchParams.set("_ts", Date.now());

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Nu am putut incarca reviziile (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Nu am putut incarca reviziile (${response.status}).`);
    }
  }

  return response.json();
}

async function listDashboardSummaryData(payload) {
  const url = new URL("/api/dashboard-summary", window.location.origin);
  url.searchParams.set("_ts", Date.now());

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Nu am putut incarca sumarul dashboard (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Nu am putut incarca sumarul dashboard (${response.status}).`);
    }
  }

  return response.json();
}

async function refreshReportSources(sourceKeys, setMessage) {
  const session = getSession();
  if (!session) {
    if (typeof setMessage === "function") {
      setMessage("Autentifica-te pentru a genera raportul.", true);
    }
    return false;
  }

  const uniqueKeys = Array.from(new Set((sourceKeys || []).filter(Boolean)));
  if (!uniqueKeys.length) {
    return true;
  }

  try {
    const results = await Promise.all(uniqueKeys.map(async (key) => {
      let response = null;

      if (key === "vehicles") {
        response = await listVehiclesData(withSessionPayload({ linkedSoferId: session.LinkedSoferID || "" }));
      } else if (key === "drivers") {
        response = await listDriversData(withSessionPayload({}));
      } else if (key === "assignments") {
        response = await listAssignmentsData(withSessionPayload({}));
      } else if (key === "fuel") {
        response = await listFuelEntriesData(withSessionPayload({ linkedSoferId: session.LinkedSoferID || "" }));
      } else if (key === "trips") {
        response = await listTripSheetsData({
          role: session.Rol || "",
          userId: session.UserID || "",
          email: session.Email || "",
          linkedSoferId: session.LinkedSoferID || ""
        });
      } else if (key === "defects") {
        response = await listDefectsData(withSessionPayload({ linkedSoferId: session.LinkedSoferID || "" }));
      } else if (key === "documents") {
        response = await listDocumentsData(withSessionPayload({}));
      } else if (key === "tankTransactions") {
        response = await listFuelTankTransactionsData(withSessionPayload({}));
      }

      return { key, response };
    }));

    results.forEach(({ key, response }) => {
      const items = getItemsFromResponse(response);
      if (!response || !response.ok) {
        throw new Error((response && response.message) || "Nu am putut incarca datele necesare pentru raport.");
      }

      if (key === "vehicles") {
        vehiclesState = items;
        refreshVehiclePlateOptions();
      } else if (key === "drivers") {
        driversState = items;
      } else if (key === "assignments") {
        assignmentsState = items;
      } else if (key === "fuel") {
        fuelEntriesState = items;
      } else if (key === "trips") {
        tripSheetsState = items;
      } else if (key === "defects") {
        defectsState = items;
      } else if (key === "documents") {
        documentsState = items;
      } else if (key === "tankTransactions") {
        fuelTankTransactionsState = items;
      }
    });

    if (uniqueKeys.includes("vehicles") || uniqueKeys.includes("trips")) {
      syncVehicleDerivedMetrics();
    }

    return true;
  } catch (error) {
    if (typeof setMessage === "function") {
      setMessage(getReadableError(error), true);
    }
    return false;
  }
}

async function callTripSheetsApi(method, payload) {
  const response = await fetch("/api/trip-sheets", {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: method === "GET" ? undefined : JSON.stringify(payload || {})
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Requestul catre Trip Sheets API a esuat (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Requestul catre Trip Sheets API a esuat (${response.status}).`);
    }
  }

  return response.json();
}

async function listTripSheetsData(payload) {
  const url = new URL("/api/trip-sheets", window.location.origin);
  url.searchParams.set("_ts", Date.now());

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Nu am putut incarca foile de parcurs (${response.status}).`);
    } catch (error) {
      if (error && error.message && error.message !== "Unexpected end of JSON input") {
        throw error;
      }
      throw new Error(`Nu am putut incarca foile de parcurs (${response.status}).`);
    }
  }

  return response.json();
}

function saveTripSheetData(payload, isEditMode) {
  return callTripSheetsApi(isEditMode ? "PUT" : "POST", payload);
}

function deleteTripSheetData(payload) {
  return callTripSheetsApi("DELETE", payload);
}

function getReadableError(error) {
  if (error && error.message) {
    return error.message;
  }

  return "A aparut o eroare neasteptata.";
}

function getSession() {
  if (DEV_BYPASS_LOGIN) {
    return getDevelopmentUser();
  }

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_SESSION) || "null");
  } catch (error) {
    return null;
  }
}

function saveSession(user) {
  if (DEV_BYPASS_LOGIN) {
    return;
  }

  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
}

async function restoreSession() {
  if (DEV_BYPASS_LOGIN) {
    applySessionToUi(getDevelopmentUser());
    return;
  }

  try {
    const response = await callLocalAuthEndpoint("/api/session", {
      method: "GET"
    });
    if (!response.ok || !response.data || !response.data.user) {
      throw new Error(response.message || "Sesiunea nu a putut fi restaurata.");
    }

    saveSession(response.data.user);
    applySessionToUi(response.data.user);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    applySessionToUi(null);
  }
}

function ensureDevelopmentSession() {
  if (!DEV_BYPASS_LOGIN) {
    return;
  }

  if (elements.devRoleSelect) {
    elements.devRoleSelect.value = getDevelopmentRole();
  }

  applySessionToUi(getDevelopmentUser());
}

function handleDevRoleChange() {
  if (!DEV_BYPASS_LOGIN || !elements.devRoleSelect) {
    return;
  }

  localStorage.setItem(STORAGE_KEY_DEV_ROLE, elements.devRoleSelect.value);
  applySessionToUi(getDevelopmentUser());
  loadDashboard();
}

function getDevelopmentRole() {
  const savedRole = String(localStorage.getItem(STORAGE_KEY_DEV_ROLE) || "ADMIN").trim().toUpperCase();
  return DEV_BYPASS_USERS[savedRole] ? savedRole : "ADMIN";
}

function getDevelopmentUser() {
  return DEV_BYPASS_USERS[getDevelopmentRole()];
}

function applySessionToUi(user) {
  const isLoggedIn = Boolean(user);
  const role = String((user && user.Rol) || "").trim().toUpperCase();
  const mobileDriverMode = isLoggedIn && role === "SOFER" && isMobileViewport();

  if (elements.authScreen) {
    elements.authScreen.classList.toggle("hidden", isLoggedIn);
  }

  setElementText(elements.currentUserName, isLoggedIn ? (user.Nume || user.Email || "Utilizator") : "Neautentificat");
  setElementText(elements.currentUserRole, isLoggedIn ? formatRoleLabel(user.Rol) : "-");
  if (elements.devTools) {
    elements.devTools.classList.toggle("hidden", !DEV_BYPASS_LOGIN);
  }
  document.body.classList.toggle("is-authenticated", isLoggedIn);
  document.body.classList.toggle("role-sofer", role === "SOFER");
  document.body.classList.toggle("mobile-driver-mode", mobileDriverMode);

  updateRoleVisibility(user ? user.Rol : "");
  updateRoleCapabilities(user ? user.Rol : "");
  applyTripSheetRoleRules(user);
  applyVehicleRoleRules(user);
  applyDriverRoleRules(user);
  applyUserRoleRules(user);
  applyAssignmentRoleRules(user);
  applyFuelRoleRules(user);
  applyFuelTankRoleRules(user);
  applyDocumentRoleRules(user);
  applyDefectRoleRules(user);

  if (isLoggedIn && role === "SOFER" && (!activeSection || activeSection === "dashboard")) {
    activeSection = "foi-parcurs";
  } else if (isLoggedIn && role !== "SOFER" && !activeSection) {
    activeSection = "dashboard";
  } else if (!isLoggedIn) {
    activeSection = "dashboard";
  }

  updateInstallButtonVisibility();
  setActiveSection(activeSection);
}

function updateRoleVisibility(role) {
  const normalizedRole = String(role || "").trim().toLowerCase();

  elements.navButtons.forEach((button) => {
    const allowed = String(button.dataset.roleAllow || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const visible = !normalizedRole || allowed.includes(normalizedRole);
    button.style.display = visible ? "" : "none";

    if (!visible && button.dataset.section === activeSection) {
      activeSection = "dashboard";
    }
  });
}

function updateRoleCapabilities(role) {
  const normalizedRole = String(role || "").trim().toLowerCase();
  const canEdit = normalizedRole === "admin" || normalizedRole === "manager" || normalizedRole === "office";
  const canDelete = normalizedRole === "admin";
  const canOperateTank = normalizedRole === "admin" || normalizedRole === "manager" || normalizedRole === "office";

  elements.capabilityPills.forEach((pill) => {
    if (pill.dataset.capability === "edit") {
      pill.classList.toggle("hidden", !canEdit);
    }

    if (pill.dataset.capability === "edit-bazin") {
      pill.classList.toggle("hidden", !canOperateTank);
    }

    if (pill.dataset.capability === "delete") {
      pill.classList.toggle("hidden", !canDelete);
    }
  });
}

function setActiveSection(sectionName) {
  const nextSection = elements.appSections[sectionName] ? sectionName : "dashboard";
  activeSection = nextSection;

  elements.navButtons.forEach((button) => {
    button.classList.toggle("nav-btn--active", button.dataset.section === activeSection);
  });

  Object.entries(elements.appSections).forEach(([key, section]) => {
    if (!section) {
      return;
    }
    section.classList.toggle("hidden", key !== activeSection);
  });

  const activeButton = elements.navButtons.find((button) => button.dataset.section === activeSection);
  if (activeButton) {
    setElementText(elements.pageTitle, activeButton.dataset.title || "Dashboard");
    setElementText(elements.pageSubtitle, activeButton.dataset.subtitle || "");
  }

  if (elements.mobileDriverNav) {
    const showMobileDriverNav = currentRole() === "SOFER" && isMobileViewport();
    elements.mobileDriverNav.classList.toggle("hidden", !showMobileDriverNav);
    elements.mobileDriverNavButtons.forEach((button) => {
      button.classList.toggle("mobile-driver-nav__btn--active", button.dataset.mobileSection === activeSection);
    });
  }

  if (activeSection === "foi-parcurs" && getSession()) {
    loadTripSheetsModule();
  }

  if (activeSection === "masini" && getSession()) {
    loadVehiclesModule();
  }
  if (activeSection === "soferi" && getSession()) {
    loadDriversModule();
  }
  if (activeSection === "users" && getSession()) {
    loadUsersModule();
  }
  if (activeSection === "asignari" && getSession()) {
    loadAssignmentsModule();
  }
  if (activeSection === "alimentari" && getSession()) {
    loadFuelModule();
  }
  if ((activeSection === "bazin-motorina" || activeSection === "alimentari-utilaje" || activeSection === "istoric-bazin") && getSession()) {
    loadFuelTankModule();
  }
  if (activeSection === "documente" && getSession()) {
    loadDocumentsModule();
  }
  if (activeSection === "defecte" && getSession()) {
    loadDefectsModule();
  }
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 820px)").matches;
}

function updateInstallButtonVisibility() {
  if (!elements.installAppBtn) {
    return;
  }

  const canShow = Boolean(getSession()) && Boolean(deferredInstallPrompt);
  elements.installAppBtn.classList.toggle("hidden", !canShow);
}

function formatRoleLabel(role) {
  const normalized = String(role || "").trim().toLowerCase();
  if (!normalized) {
    return "-";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function applyTripSheetRoleRules(user) {
  const role = String((user && user.Rol) || "").trim().toUpperCase();
  const soferId = getEffectiveLinkedSoferId(user);
  const isSofer = role === "SOFER";
  const isMobileDriver = isSofer && document.body.classList.contains("mobile-driver-mode");
  const primaryVehicle = isSofer ? getPrimaryVehicleForSession(user) : null;

  applyModuleRoleRules(user, elements.tripSheetForm, elements.saveTripSheetBtn, elements.cancelTripEditBtn, elements.deleteTripSheetBtn, selectedTripSheetId, true);

  if (elements.tripSoferID) {
    if (isSofer) {
      if (soferId) {
        elements.tripSoferID.value = soferId;
      }
      elements.tripSoferID.readOnly = true;
      elements.tripSoferID.placeholder = soferId || "SoferID din sesiune";
    } else {
      elements.tripSoferID.readOnly = false;
      elements.tripSoferID.placeholder = "SoferID";
    }
  }

  if (elements.tripSoferField) {
    elements.tripSoferField.classList.toggle("hidden", isMobileDriver);
  }

  if (elements.tripFilterSofer) {
    if (isSofer) {
      if (soferId) {
        elements.tripFilterSofer.value = soferId;
      }
      elements.tripFilterSofer.readOnly = true;
      elements.tripFilterSofer.placeholder = soferId || "SoferID din sesiune";
    } else {
      elements.tripFilterSofer.readOnly = false;
      elements.tripFilterSofer.placeholder = "Filtru sofer ID";
    }
  }

  if (elements.tripVehicleRef) {
    if (isSofer && primaryVehicle) {
      elements.tripVehicleRef.value = String(primaryVehicle.NrInmatriculare || "");
      elements.tripVehicleRef.readOnly = true;
      if (elements.tripMasinaID) {
        elements.tripMasinaID.value = String(primaryVehicle.MasinaID || "");
      }
    } else {
      elements.tripVehicleRef.readOnly = false;
    }
    elements.tripVehicleRef.placeholder = "Nr inmatriculare";
  }

  const exportCard = document.getElementById("reportTripVehicleRef") ? document.getElementById("reportTripVehicleRef").closest(".export-card") : null;
  if (exportCard) {
    exportCard.classList.toggle("hidden", !(role === "ADMIN" || role === "MANAGER" || role === "OFFICE"));
  }

  if (isMobileDriver) {
    selectedTripSheetId = "";
    if (elements.tripSheetId) elements.tripSheetId.value = "";
    if (elements.saveTripSheetBtn) elements.saveTripSheetBtn.textContent = "Salveaza foaie";
    if (elements.cancelTripEditBtn) elements.cancelTripEditBtn.classList.add("hidden");
    if (elements.deleteTripSheetBtn) elements.deleteTripSheetBtn.classList.add("hidden");
  }

  updateTripControlState();
}

function applyVehicleRoleRules(user) {
  const role = String((user && user.Rol) || "").trim().toUpperCase();
  const canEdit = role === "ADMIN" || role === "MANAGER" || role === "OFFICE";
  const canDelete = role === "ADMIN";
  const canExport = role === "ADMIN" || role === "MANAGER" || role === "OFFICE";

  if (elements.vehicleForm) {
    Array.from(elements.vehicleForm.elements).forEach((field) => {
      if (!field || field.id === "vehicleMessage" || field.id === "cancelVehicleEditBtn" || field.id === "deleteVehicleBtn") {
        return;
      }
      if (field.tagName === "BUTTON") {
        return;
      }
      field.disabled = !canEdit;
    });
  }

  if (elements.vehicleKmCurenti) {
    elements.vehicleKmCurenti.readOnly = Boolean(selectedVehicleId);
  }

  if (elements.saveVehicleBtn) {
    elements.saveVehicleBtn.classList.toggle("hidden", !canEdit);
  }
  if (elements.cancelVehicleEditBtn) {
    elements.cancelVehicleEditBtn.classList.toggle("hidden", !canEdit || !selectedVehicleId);
  }
  if (elements.deleteVehicleBtn) {
    elements.deleteVehicleBtn.classList.toggle("hidden", !canDelete || !selectedVehicleId);
  }
  const exportCard = document.getElementById("reportVehicleRef") ? document.getElementById("reportVehicleRef").closest(".export-card") : null;
  if (exportCard) {
    exportCard.classList.toggle("hidden", !canExport);
  }

}

function applyDriverRoleRules(user) {
  applyModuleRoleRules(user, elements.driverForm, elements.saveDriverBtn, elements.cancelDriverEditBtn, elements.deleteDriverBtn, selectedDriverId, false);
  const role = String((user && user.Rol) || "").trim().toUpperCase();
  const exportCard = document.getElementById("reportDriverName") ? document.getElementById("reportDriverName").closest(".export-card") : null;
  if (exportCard) {
    exportCard.classList.toggle("hidden", !(role === "ADMIN" || role === "MANAGER" || role === "OFFICE"));
  }
}

function applyUserRoleRules(user) {
  const role = String((user && user.Rol) || "").trim().toUpperCase();
  const canEdit = role === "ADMIN";

  if (elements.userForm) {
    Array.from(elements.userForm.elements).forEach((field) => {
      if (!field || field.tagName === "BUTTON") {
        return;
      }
      field.disabled = !canEdit;
    });
  }

  if (elements.saveUserBtn) {
    elements.saveUserBtn.classList.toggle("hidden", !canEdit);
  }
  if (elements.cancelUserEditBtn) {
    elements.cancelUserEditBtn.classList.toggle("hidden", !canEdit || !selectedUserId);
  }
  if (elements.deleteUserBtn) {
    elements.deleteUserBtn.classList.toggle("hidden", !canEdit || !selectedUserId);
  }
}

function applyAssignmentRoleRules(user) {
  applyModuleRoleRules(user, elements.assignmentForm, elements.saveAssignmentBtn, elements.cancelAssignmentEditBtn, elements.deleteAssignmentBtn, selectedAssignmentId, false);
  const role = String((user && user.Rol) || "").trim().toUpperCase();
  const exportCard = elements.reportAssignmentVehicleRef ? elements.reportAssignmentVehicleRef.closest(".export-card") : null;
  if (exportCard) {
    exportCard.classList.toggle("hidden", !(role === "ADMIN" || role === "MANAGER" || role === "OFFICE"));
  }
}

function applyFuelRoleRules(user) {
  applyModuleRoleRules(user, elements.fuelForm, elements.saveFuelBtn, elements.cancelFuelEditBtn, elements.deleteFuelBtn, selectedFuelEntryId, true);
  const role = String((user && user.Rol) || "").trim().toUpperCase();
  const isSofer = role === "SOFER";
  const isMobileDriver = isSofer && document.body.classList.contains("mobile-driver-mode");
  const soferId = getEffectiveLinkedSoferId(user);
  const primaryVehicle = isSofer ? getPrimaryVehicleForSession(user) : null;
  const exportCard = document.getElementById("reportFuelVehicleRef") ? document.getElementById("reportFuelVehicleRef").closest(".export-card") : null;
  if (exportCard) {
    exportCard.classList.toggle("hidden", !(role === "ADMIN" || role === "MANAGER" || role === "OFFICE"));
  }
  const consumptionCard = elements.fuelConsumptionVehicleRef ? elements.fuelConsumptionVehicleRef.closest(".export-card") : null;
  if (consumptionCard) {
    consumptionCard.classList.toggle("hidden", !(role === "ADMIN" || role === "MANAGER" || role === "OFFICE"));
  }

  if (elements.fuelSoferID) {
    if (isSofer) {
      elements.fuelSoferID.value = soferId || "";
      elements.fuelSoferID.readOnly = true;
    } else {
      elements.fuelSoferID.readOnly = false;
    }
  }

  if (elements.fuelMasinaID) {
    if (isSofer && primaryVehicle) {
      elements.fuelMasinaID.value = String(primaryVehicle.NrInmatriculare || "");
      elements.fuelMasinaID.readOnly = true;
    } else {
      elements.fuelMasinaID.readOnly = false;
    }
  }

  if (isMobileDriver) {
    selectedFuelEntryId = "";
    if (elements.fuelEntryID) elements.fuelEntryID.value = "";
    if (elements.saveFuelBtn) elements.saveFuelBtn.textContent = "Salveaza alimentare";
    if (elements.cancelFuelEditBtn) elements.cancelFuelEditBtn.classList.add("hidden");
    if (elements.deleteFuelBtn) elements.deleteFuelBtn.classList.add("hidden");
  }
}

function applyFuelTankRoleRules(user) {
  const role = String((user && user.Rol) || "").trim().toUpperCase();
  const canFill = role === "ADMIN" || role === "MANAGER" || role === "OFFICE" || role === "SOFER";
  const canDispense = role === "ADMIN" || role === "MANAGER" || role === "OFFICE" || role === "SOFER";
  const canViewHistory = role === "ADMIN" || role === "MANAGER" || role === "OFFICE";
  const canEditTransactions = canEditFuelTankTransactions();
  const tankOperationsWrap = document.querySelector("#bazinMotorinaSection .module-grid--stacked .module-grid");

  if (elements.fillTankBtn) {
    elements.fillTankBtn.classList.toggle("hidden", !canFill);
  }
  if (elements.dispenseTankBtn) {
    elements.dispenseTankBtn.classList.toggle("hidden", !canDispense);
  }
  if (elements.cancelFuelTankEditBtn) {
    elements.cancelFuelTankEditBtn.classList.toggle("hidden", !canEditTransactions || !selectedFuelTankTransactionId);
  }
  if (elements.fuelTankOperationType) {
    elements.fuelTankOperationType.disabled = !(canFill || canDispense);
  }
  if (elements.fuelTankOperationForm) {
    Array.from(elements.fuelTankOperationForm.elements).forEach((field) => {
      if (!field || field.tagName === "BUTTON") return;
      if (field.id === "fuelTankName" || field.id === "fuelTankCapacity") {
        field.disabled = !(canFill || canDispense);
        return;
      }
      field.disabled = !(canFill || canDispense);
    });
  }
  if (elements.fuelUtilityForm) {
    Array.from(elements.fuelUtilityForm.elements).forEach((field) => {
      if (!field || field.tagName === "BUTTON") return;
      field.disabled = !canDispense;
    });
  }

  if (elements.fuelTankMessage && role === "SOFER") {
    setFuelTankMessage("Soferul poate opera bazinul, dar nu vede istoricul complet.", false);
  }

  const utilitySection = elements.appSections["alimentari-utilaje"];
  const historySection = elements.appSections["istoric-bazin"];
  if (tankOperationsWrap) {
    tankOperationsWrap.classList.toggle("hidden", false);
  }
  if (utilitySection) {
    utilitySection.classList.toggle("hidden-by-role", !canViewHistory && !canDispense);
  }
  if (historySection) {
    historySection.classList.toggle("hidden-by-role", !canViewHistory);
  }

  const tankExportCard = elements.reportTankType ? elements.reportTankType.closest(".export-card") : null;
  if (tankExportCard) {
    tankExportCard.classList.toggle("hidden", !canViewHistory);
  }
  const utilityExportCard = elements.exportTankUtilityExcelBtn ? elements.exportTankUtilityExcelBtn.closest(".export-card") : null;
  if (utilityExportCard) {
    utilityExportCard.classList.toggle("hidden", !canViewHistory);
  }
}

function applyDocumentRoleRules(user) {
  applyModuleRoleRules(user, elements.documentForm, elements.saveDocumentBtn, elements.cancelDocumentEditBtn, elements.deleteDocumentBtn, selectedDocumentId, false);
}

function applyDefectRoleRules(user) {
  applyModuleRoleRules(user, elements.defectForm, elements.saveDefectBtn, elements.cancelDefectEditBtn, elements.deleteDefectBtn, selectedDefectId, true);

  const role = String((user && user.Rol) || "").trim().toUpperCase();
  const soferId = getEffectiveLinkedSoferId(user);
  const primaryVehicle = role === "SOFER" ? getPrimaryVehicleForSession(user) : null;
  if (elements.defectSoferID) {
    if (role === "SOFER") {
      elements.defectSoferID.value = soferId;
      elements.defectSoferID.readOnly = true;
    } else {
      elements.defectSoferID.readOnly = false;
    }
  }
  if (elements.defectMasinaID) {
    if (role === "SOFER" && primaryVehicle) {
      elements.defectMasinaID.value = String(primaryVehicle.NrInmatriculare || "");
      elements.defectMasinaID.readOnly = true;
    } else {
      elements.defectMasinaID.readOnly = false;
    }
  }
  const exportCard = document.getElementById("reportDefectVehicleRef") ? document.getElementById("reportDefectVehicleRef").closest(".export-card") : null;
  if (exportCard) {
    exportCard.classList.toggle("hidden", !(role === "ADMIN" || role === "MANAGER" || role === "OFFICE"));
  }
}

function applyModuleRoleRules(user, form, saveBtn, cancelBtn, deleteBtn, selectedId, allowSoferEdit) {
  const role = String((user && user.Rol) || "").trim().toUpperCase();
  const canEdit = role === "ADMIN" || role === "MANAGER" || role === "OFFICE" || (allowSoferEdit && role === "SOFER");
  const canDelete = role === "ADMIN";

  if (form) {
    Array.from(form.elements).forEach((field) => {
      if (!field || field.tagName === "BUTTON") {
        return;
      }
      field.disabled = !canEdit;
    });
  }

  if (saveBtn) {
    saveBtn.classList.toggle("hidden", !canEdit);
  }
  if (cancelBtn) {
    cancelBtn.classList.toggle("hidden", !canEdit || !selectedId);
  }
  if (deleteBtn) {
    deleteBtn.classList.toggle("hidden", !canDelete || !selectedId);
  }
}

function renderDashboard(data) {
  const cards = data.cards || {};
  const extra = data.extra || {};

  setElementText(elements.masiniActive, formatNumber(cards.masiniActive));
  setElementText(elements.masiniInService, formatNumber(cards.masiniInService));
  setElementText(elements.soferiActivi, formatNumber(cards.soferiActivi));
  setElementText(elements.asignariActive, formatNumber(cards.asignariActive));
  setElementText(elements.totalAlimentari, formatNumber(cards.totalAlimentari));
  setElementText(elements.costTotalAlimentari, formatCurrency(cards.costTotalAlimentari));
  setElementText(elements.totalFoiParcurs, formatNumber(cards.totalFoiParcurs));
  setElementText(elements.kmTotalParcurs, formatKm(cards.kmTotalParcurs));
  setElementText(elements.totalDocumente, formatNumber(cards.totalDocumente));
  setElementText(elements.documenteExpirate, formatNumber(cards.documenteExpirate));
  setElementText(elements.documenteExpiraIn30Zile, formatNumber(cards.documenteExpiraIn30Zile));
  setElementText(elements.documenteExpiraIn7Zile, formatNumber(cards.documenteExpiraIn7Zile));
  setElementText(elements.totalRevizii, formatNumber(extra.totalRevizii));
  setElementText(elements.defecteDeschise, formatNumber(extra.defecteDeschise));
  setElementText(elements.foiParcursAzi, formatNumber(extra.foiParcursAzi));
  setElementText(elements.masiniFaraFoaieAzi, formatNumber(extra.masiniFaraFoaieAzi));

  renderInsights(cards, extra);
  renderFuelTable(data.latestFuelEntries || []);
  renderTripTable(data.latestTripSheets || []);
  renderDocumentsTable(data.expiringDocuments || []);
  renderDefectsTable(data.latestDefects || []);
  renderRevisionsTable(data.latestRevisions || []);
  applyDashboardPresentation();
}

function applyDashboardPresentation() {
  const role = currentRole();
  const isSofer = role === "SOFER";

  setElementText(elements.labelMasiniActive, isSofer ? "Masinile mele active" : "Masini active");
  setElementText(elements.labelMasiniInService, isSofer ? "Masinile mele in service" : "Masini in service");
  setElementText(elements.labelSoferiActivi, isSofer ? "Cont activ" : "Soferi activi");
  setElementText(elements.labelAsignariActive, isSofer ? "Asignarile mele active" : "Asignari active");
  setElementText(elements.labelTotalAlimentari, isSofer ? "Alimentarile mele" : "Total alimentari");
  setElementText(elements.labelCostTotalAlimentari, isSofer ? "Cost alimentari" : "Cost total alimentari");
  setElementText(elements.labelTotalFoiParcurs, isSofer ? "Foile mele parcurs" : "Foi de parcurs");
  setElementText(elements.labelKmTotalParcurs, isSofer ? "KM parcursi de mine" : "KM total parcurs");
  setElementText(elements.labelTotalDocumente, isSofer ? "Documente masini asignate" : "Total documente");
  setElementText(elements.labelDocumenteExpirate, "Documente expirate");
  setElementText(elements.labelDocumenteExpiraIn30Zile, "Expira in 30 zile");
  setElementText(elements.labelDocumenteExpiraIn7Zile, "Expira in 7 zile");
  setElementText(elements.labelTotalRevizii, isSofer ? "Revizii masini asignate" : "Total revizii");
  setElementText(elements.labelDefecteDeschise, isSofer ? "Defectele mele deschise" : "Defecte deschise");

  toggleDashboardCardVisibility("soferiActivi", !isSofer);
}

async function loadTripSheetsModule() {
  if (!getSession()) {
    return;
  }

  try {
    const session = getSession();
    const response = await listTripSheetsData({
      role: session.Rol || "",
      userId: session.UserID || "",
      email: session.Email || "",
      linkedSoferId: session.LinkedSoferID || ""
    });

    if (response.ok && Array.isArray(response.data && response.data.items)) {
      tripSheetsState = response.data.items;
      syncVehicleDerivedMetrics();
      updateTripControlState();
      prefillDriverVehicleForOperationalForms();
      applyTripSheetFilters();
      setTripSheetMessage("", false);
      return;
    }

    tripSheetsState = [];
    renderTripSheetsModule([]);
    setTripSheetMessage(response.message || "Lista completa de foi de parcurs nu este disponibila inca.", true);
  } catch (error) {
    tripSheetsState = [];
    renderTripSheetsModule([]);
    setTripSheetMessage(getReadableError(error), true);
  }
}

async function loadVehiclesModule() {
  if (!getSession()) {
    return;
  }

  try {
    const session = getSession();
    const response = await listVehiclesData({
      role: session.Rol || "",
      userId: session.UserID || "",
      email: session.Email || "",
      linkedSoferId: session.LinkedSoferID || ""
    });

    if (response.ok && Array.isArray(response.data && response.data.items)) {
      vehiclesState = response.data.items;
      syncVehicleDerivedMetrics();
      refreshVehiclePlateOptions();
      prefillDriverVehicleForOperationalForms();
      applyVehicleFilters();
      setVehicleMessage("", false);
      return;
    }

    vehiclesState = [];
    refreshVehiclePlateOptions();
    renderVehiclesTable([]);
    setVehicleMessage(response.message || "Lista de masini nu este disponibila inca.", true);
  } catch (error) {
    vehiclesState = [];
    refreshVehiclePlateOptions();
    renderVehiclesTable([]);
    setVehicleMessage("Backendul pentru sectiunea Masini este urmatorul pas.", true);
  }
}

function applyVehicleFilters() {
  const idFilter = valueOf(elements.vehicleFilterId).toLowerCase();
  const plateFilter = valueOf(elements.vehicleFilterPlate).toLowerCase();
  const statusFilter = valueOf(elements.vehicleFilterStatus).toUpperCase();

  const filtered = vehiclesState.filter((item) => {
    const masinaId = String(item.MasinaID || "").toLowerCase();
    const nr = String(item.NrInmatriculare || "").toLowerCase();
    const status = String(item.Status || "").toUpperCase();

    if (idFilter && !masinaId.includes(idFilter) && !nr.includes(idFilter)) {
      return false;
    }
    if (plateFilter && !nr.includes(plateFilter)) {
      return false;
    }
    if (statusFilter && status !== statusFilter) {
      return false;
    }
    return true;
  });

  renderVehiclesTable(filtered);
}

function renderVehiclesTable(items) {
  if (!elements.vehiclesTableBody) {
    return;
  }

  if (!items.length) {
    elements.vehiclesTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-cell">Nu exista masini disponibile.</td>
      </tr>
    `;
    return;
  }

  elements.vehiclesTableBody.innerHTML = items.map((item) => `
    <tr class="trip-row${String(item.MasinaID || "") === selectedVehicleId ? " trip-row--active" : ""}" data-vehicle-id="${escapeHtml(item.MasinaID || "")}">
      <td>${escapeHtml(item.NrInmatriculare || "-")}</td>
      <td>${escapeHtml(item.MasinaID || "-")}</td>
      <td>${escapeHtml(item.TipVehicul || "-")}</td>
      <td>${escapeHtml([item.Marca, item.Model].filter(Boolean).join(" ") || "-")}</td>
      <td>${renderStatusBadge(item.Status)}</td>
      <td>${formatKm(item.KmCurentiDerivati || item.KmCurenti)}</td>
      <td>${escapeHtml(item.SoferCurentID || "-")}</td>
    </tr>
  `).join("");

  Array.from(elements.vehiclesTableBody.querySelectorAll(".trip-row")).forEach((row) => {
    row.addEventListener("click", () => {
      const vehicleId = row.getAttribute("data-vehicle-id") || "";
      const item = vehiclesState.find((entry) => String(entry.MasinaID || "") === vehicleId);
      if (item) {
        populateVehicleForm(item);
      }
    });
  });
}

async function handleVehicleSubmit(event) {
  event.preventDefault();

  const session = getSession();
  const role = String((session && session.Rol) || "").trim().toUpperCase();
  const canEdit = role === "ADMIN" || isManagerLikeRole(role);

  if (!canEdit) {
    setVehicleMessage("Rolul curent are acces doar de citire.", true);
    return;
  }

  const payload = {
    role,
    userId: String((session && session.UserID) || "").trim(),
    MasinaID: valueOf(elements.vehicleMasinaID) || generateSequentialId("MAS", vehiclesState, "MasinaID"),
    NrInmatriculare: valueOf(elements.vehicleNrInmatriculare),
    Marca: valueOf(elements.vehicleMarca),
    Model: valueOf(elements.vehicleModel),
    An: numberOf(elements.vehicleAn),
    TipVehicul: valueOf(elements.vehicleTipVehicul),
    Combustibil: valueOf(elements.vehicleCombustibil),
    Status: valueOf(elements.vehicleStatus),
    KmCurenti: selectedVehicleId
      ? getLatestVehicleKm(valueOf(elements.vehicleNrInmatriculare) || valueOf(elements.vehicleMasinaID))
      : numberOf(elements.vehicleKmCurenti),
    SoferCurentID: valueOf(elements.vehicleSoferCurentID),
    ITPExpiraLa: valueOf(elements.vehicleITPExpiraLa),
    RCAExpiraLa: valueOf(elements.vehicleRCAExpiraLa),
    RovinietaExpiraLa: valueOf(elements.vehicleRovinietaExpiraLa),
    Observatii: valueOf(elements.vehicleObservatii)
  };

  if (!payload.MasinaID || !payload.NrInmatriculare) {
    setVehicleMessage("Numarul de inmatriculare este obligatoriu, iar ID-ul intern se poate genera automat.", true);
    return;
  }

  if (isDuplicateVehiclePlate(payload.NrInmatriculare, selectedVehicleId)) {
    setVehicleMessage("Exista deja o masina cu acest numar de inmatriculare.", true);
    return;
  }

  try {
    const isEditMode = Boolean(selectedVehicleId);
    setVehicleMessage(isEditMode ? "Se actualizeaza masina..." : "Se salveaza masina...", false);

    const response = await saveVehicleData(payload, isEditMode);
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut salva masina.");
    }

    setVehicleMessage(isEditMode ? "Masina a fost actualizata." : "Masina a fost salvata.", false);
    resetVehicleForm(false);
    await loadDashboard();
    await loadVehiclesModule();
  } catch (error) {
    setVehicleMessage(getReadableError(error), true);
  }
}

async function handleDeleteVehicle() {
  const session = getSession();
  const role = String((session && session.Rol) || "").trim().toUpperCase();

  if (role !== "ADMIN") {
    setVehicleMessage("Doar ADMIN poate sterge masini.", true);
    return;
  }

  if (!selectedVehicleId) {
    setVehicleMessage("Selecteaza mai intai o masina din lista.", true);
    return;
  }

  try {
    setVehicleMessage("Se sterge masina...", false);
    const response = await deleteVehicleData({
      role,
      userId: String((session && session.UserID) || "").trim(),
      MasinaID: selectedVehicleId
    });

    if (!response.ok) {
      throw new Error(response.message || "Nu am putut sterge masina.");
    }

    setVehicleMessage("Masina a fost stearsa.", false);
    resetVehicleForm(false);
    await loadDashboard();
    await loadVehiclesModule();
  } catch (error) {
    setVehicleMessage(getReadableError(error), true);
  }
}

function populateVehicleForm(item) {
  selectedVehicleId = String(item.MasinaID || "");

  if (elements.vehicleMasinaID) elements.vehicleMasinaID.value = String(item.MasinaID || "");
  if (elements.vehicleNrInmatriculare) elements.vehicleNrInmatriculare.value = String(item.NrInmatriculare || "");
  if (elements.vehicleMarca) elements.vehicleMarca.value = String(item.Marca || "");
  if (elements.vehicleModel) elements.vehicleModel.value = String(item.Model || "");
  if (elements.vehicleAn) elements.vehicleAn.value = String(item.An || "");
  if (elements.vehicleTipVehicul) elements.vehicleTipVehicul.value = String(item.TipVehicul || "");
  if (elements.vehicleCombustibil) elements.vehicleCombustibil.value = String(item.Combustibil || "");
  if (elements.vehicleStatus) elements.vehicleStatus.value = String(item.Status || "ACTIVA");
  if (elements.vehicleKmCurenti) elements.vehicleKmCurenti.value = String(item.KmCurentiDerivati || item.KmCurenti || "");
  if (elements.vehicleSoferCurentID) elements.vehicleSoferCurentID.value = String(item.SoferCurentID || "");
  if (elements.vehicleITPExpiraLa) elements.vehicleITPExpiraLa.value = normalizeDateInputForCompare(item.ITPExpiraLa);
  if (elements.vehicleRCAExpiraLa) elements.vehicleRCAExpiraLa.value = normalizeDateInputForCompare(item.RCAExpiraLa);
  if (elements.vehicleRovinietaExpiraLa) elements.vehicleRovinietaExpiraLa.value = normalizeDateInputForCompare(item.RovinietaExpiraLa);
  if (elements.vehicleObservatii) elements.vehicleObservatii.value = String(item.Observatii || "");
  if (elements.reportVehicleRef) elements.reportVehicleRef.value = String(item.NrInmatriculare || "");
  if (elements.saveVehicleBtn) elements.saveVehicleBtn.textContent = "Actualizeaza masina";
  if (elements.cancelVehicleEditBtn) elements.cancelVehicleEditBtn.classList.remove("hidden");
  if (elements.deleteVehicleBtn && String((getSession() && getSession().Rol) || "").trim().toUpperCase() === "ADMIN") {
    elements.deleteVehicleBtn.classList.remove("hidden");
  }

  applyVehicleFilters();
  applyVehicleRoleRules(getSession());
  setVehicleMessage("Editezi masina selectata din lista.", false);
}

function resetVehicleForm(clearMessage = true) {
  selectedVehicleId = "";

  if (elements.vehicleForm) {
    elements.vehicleForm.reset();
  }
  if (elements.vehicleMasinaID) {
    elements.vehicleMasinaID.value = "";
  }
  if (elements.vehicleKmCurenti) {
    elements.vehicleKmCurenti.value = "";
    elements.vehicleKmCurenti.readOnly = false;
  }
  if (elements.saveVehicleBtn) {
    elements.saveVehicleBtn.textContent = "Salveaza masina";
  }
  if (elements.cancelVehicleEditBtn) {
    elements.cancelVehicleEditBtn.classList.add("hidden");
  }
  if (elements.deleteVehicleBtn) {
    elements.deleteVehicleBtn.classList.add("hidden");
  }
  if (elements.reportVehicleRef) {
    elements.reportVehicleRef.value = "";
  }

  applyVehicleRoleRules(getSession());
  applyVehicleFilters();

  if (clearMessage) {
    setVehicleMessage("", false);
  }
}

async function loadDriversModule() {
  if (!getSession()) {
    return;
  }

  try {
    const session = getSession();
    const response = await listDriversData({
      role: session.Rol || "",
      userId: session.UserID || "",
      email: session.Email || ""
    });

    if (response.ok && Array.isArray(response.data && response.data.items)) {
      driversState = response.data.items;
      applyDriverFilters();
      setDriverMessage("", false);
      return;
    }

    driversState = [];
    renderDriversTable([]);
    setDriverMessage(response.message || "Lista de soferi nu este disponibila.", true);
  } catch (error) {
    driversState = [];
    renderDriversTable([]);
    setDriverMessage(getReadableError(error), true);
  }
}

function applyDriverFilters() {
  const idFilter = valueOf(elements.driverFilterId).toLowerCase();
  const nameFilter = valueOf(elements.driverFilterName).toLowerCase();
  const statusFilter = valueOf(elements.driverFilterStatus).toUpperCase();

  renderDriversTable(driversState.filter((item) => {
    if (idFilter && !String(item.SoferID || "").toLowerCase().includes(idFilter)) return false;
    if (nameFilter && !String(item.Nume || "").toLowerCase().includes(nameFilter)) return false;
    if (statusFilter && String(item.Status || "").toUpperCase() !== statusFilter) return false;
    return true;
  }));
}

function renderDriversTable(items) {
  renderModuleTable(
    elements.driversTableBody,
    items,
    5,
    "Nu exista soferi disponibili.",
    (item) => `
      <tr class="trip-row${String(item.SoferID || "") === selectedDriverId ? " trip-row--active" : ""}" data-driver-id="${escapeHtml(item.SoferID || "")}">
        <td>${escapeHtml(item.SoferID || "-")}</td>
        <td>${escapeHtml(item.Nume || "-")}</td>
        <td>${escapeHtml(item.Telefon || "-")}</td>
        <td>${escapeHtml(item.CategoriePermis || "-")}</td>
        <td>${renderStatusBadge(item.Status)}</td>
      </tr>
    `
  );

  bindRowSelection(elements.driversTableBody, ".trip-row", "data-driver-id", driversState, "SoferID", populateDriverForm);
}

async function handleDriverSubmit(event) {
  event.preventDefault();
  if (!hasEditAccess()) return setDriverMessage("Rolul curent are acces doar de citire.", true);

  const payload = withSessionPayload({
    SoferID: valueOf(elements.driverSoferID) || generateSequentialId("SOF", driversState, "SoferID"),
    UserID: valueOf(elements.driverUserID),
    Nume: valueOf(elements.driverNume),
    Telefon: valueOf(elements.driverTelefon),
    CategoriePermis: valueOf(elements.driverCategoriePermis),
    Status: valueOf(elements.driverStatus),
    Observatii: valueOf(elements.driverObservatii)
  });

  if (!payload.Nume) {
    return setDriverMessage("Numele soferului este obligatoriu.", true);
  }

  try {
    const isEditMode = Boolean(selectedDriverId);
    setDriverMessage(isEditMode ? "Se actualizeaza soferul..." : "Se salveaza soferul...", false);
    const response = await saveDriverData(payload, isEditMode);
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut salva soferul.");
    }

    setDriverMessage(isEditMode ? "Soferul a fost actualizat." : "Soferul a fost salvat.", false);
    resetDriverForm(false);
    await loadDriversModule();
  } catch (error) {
    setDriverMessage(getReadableError(error), true);
  }
}

async function handleDeleteDriver() {
  if (!hasDeleteAccess()) return setDriverMessage("Doar ADMIN poate sterge soferi.", true);

  if (!selectedDriverId) {
    setDriverMessage("Selecteaza mai intai un sofer din lista.", true);
    return;
  }

  try {
    setDriverMessage("Se sterge soferul...", false);
    const response = await deleteDriverData(withSessionPayload({ SoferID: selectedDriverId }));
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut sterge soferul.");
    }

    setDriverMessage("Soferul a fost sters.", false);
    resetDriverForm(false);
    await loadDriversModule();
  } catch (error) {
    setDriverMessage(getReadableError(error), true);
  }
}

function populateDriverForm(item) {
  selectedDriverId = String(item.SoferID || "");
  if (elements.driverSoferID) elements.driverSoferID.value = selectedDriverId;
  if (elements.driverUserID) elements.driverUserID.value = String(item.UserID || "");
  if (elements.driverNume) elements.driverNume.value = String(item.Nume || "");
  if (elements.driverTelefon) elements.driverTelefon.value = String(item.Telefon || "");
  if (elements.driverCategoriePermis) elements.driverCategoriePermis.value = String(item.CategoriePermis || "");
  if (elements.driverStatus) elements.driverStatus.value = String(item.Status || "ACTIV");
  if (elements.driverObservatii) elements.driverObservatii.value = String(item.Observatii || "");
  if (elements.saveDriverBtn) elements.saveDriverBtn.textContent = "Actualizeaza sofer";
  if (elements.cancelDriverEditBtn) elements.cancelDriverEditBtn.classList.remove("hidden");
  if (elements.deleteDriverBtn && hasDeleteAccess()) elements.deleteDriverBtn.classList.remove("hidden");
  applyDriverFilters();
  applyDriverRoleRules(getSession());
  setDriverMessage("Editezi soferul selectat din lista.", false);
}

function resetDriverForm(clearMessage = true) {
  selectedDriverId = "";
  if (elements.driverForm) elements.driverForm.reset();
  if (elements.driverSoferID) elements.driverSoferID.value = "";
  if (elements.saveDriverBtn) elements.saveDriverBtn.textContent = "Salveaza sofer";
  if (elements.cancelDriverEditBtn) elements.cancelDriverEditBtn.classList.add("hidden");
  if (elements.deleteDriverBtn) elements.deleteDriverBtn.classList.add("hidden");
  applyDriverRoleRules(getSession());
  applyDriverFilters();
  if (clearMessage) setDriverMessage("", false);
}

async function loadUsersModule() {
  if (!getSession()) {
    return;
  }

  try {
    const response = await listUsersData();

    if (response.ok && Array.isArray(response.data && response.data.items)) {
      usersState = response.data.items;
      applyUserFilters();
      setUserMessage("", false);
      return;
    }

    usersState = [];
    renderUsersTable([]);
    setUserMessage(response.message || "Lista de utilizatori nu este disponibila.", true);
  } catch (error) {
    usersState = [];
    renderUsersTable([]);
    setUserMessage(getReadableError(error), true);
  }
}

function applyUserFilters() {
  const nameFilter = valueOf(elements.userFilterName).toLowerCase();
  const roleFilter = valueOf(elements.userFilterRole).toUpperCase();
  const statusFilter = valueOf(elements.userFilterStatus).toUpperCase();

  renderUsersTable(usersState.filter((item) => {
    const name = String(item.Nume || "").toLowerCase();
    const email = String(item.Email || "").toLowerCase();
    const role = String(item.Rol || "").toUpperCase();
    const status = String(item.Status || "").toUpperCase();

    if (nameFilter && !name.includes(nameFilter) && !email.includes(nameFilter)) return false;
    if (roleFilter && role !== roleFilter) return false;
    if (statusFilter && status !== statusFilter) return false;
    return true;
  }));
}

function renderUsersTable(items) {
  renderModuleTable(
    elements.usersTableBody,
    items,
    4,
    "Nu exista utilizatori disponibili.",
    (item) => `
      <tr class="trip-row${String(item.UserID || "") === selectedUserId ? " trip-row--active" : ""}" data-user-id="${escapeHtml(item.UserID || "")}">
        <td>${escapeHtml(item.Nume || "-")}</td>
        <td>${escapeHtml(item.Email || "-")}</td>
        <td>${renderStatusBadge(item.Rol)}</td>
        <td>${renderStatusBadge(item.Status)}</td>
      </tr>
    `
  );

  bindRowSelection(elements.usersTableBody, ".trip-row", "data-user-id", usersState, "UserID", populateUserForm);
}

async function handleUserSubmit(event) {
  event.preventDefault();
  if (!isAdminUser()) return setUserMessage("Doar ADMIN poate administra utilizatori.", true);

  const payload = withSessionPayload({
    UserID: valueOf(elements.userUserID) || generateSequentialId("USR", usersState, "UserID"),
    Nume: valueOf(elements.userName),
    Email: valueOf(elements.userEmail),
    ParolaHash: valueOf(elements.userPassword),
    Rol: valueOf(elements.userRole),
    Status: valueOf(elements.userStatus),
    Observatii: valueOf(elements.userObservatii)
  });

  if (!payload.Nume || !payload.Email || !payload.ParolaHash) {
    return setUserMessage("Numele, emailul si parola sunt obligatorii.", true);
  }

  const duplicateEmail = usersState.some((item) =>
    String(item.Email || "").trim().toLowerCase() === payload.Email.toLowerCase() &&
    String(item.UserID || "") !== selectedUserId
  );
  if (duplicateEmail) {
    return setUserMessage("Exista deja un utilizator cu acest email.", true);
  }

  try {
    const isEditMode = Boolean(selectedUserId);
    setUserMessage(isEditMode ? "Se actualizeaza userul..." : "Se salveaza userul...", false);
    const response = await saveUserData(payload, isEditMode);
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut salva utilizatorul.");
    }

    setUserMessage(isEditMode ? "Userul a fost actualizat." : "Userul a fost salvat.", false);
    resetUserForm(false);
    await loadUsersModule();
  } catch (error) {
    setUserMessage(getReadableError(error), true);
  }
}

async function handleDeleteUser() {
  if (!isAdminUser()) return setUserMessage("Doar ADMIN poate sterge utilizatori.", true);

  if (!selectedUserId) {
    setUserMessage("Selecteaza mai intai un utilizator din lista.", true);
    return;
  }

  try {
    setUserMessage("Se sterge userul...", false);
    const response = await deleteUserData(withSessionPayload({ UserID: selectedUserId }));
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut sterge utilizatorul.");
    }

    setUserMessage("Userul a fost sters.", false);
    resetUserForm(false);
    await loadUsersModule();
  } catch (error) {
    setUserMessage(getReadableError(error), true);
  }
}

function populateUserForm(item) {
  selectedUserId = String(item.UserID || "");
  if (elements.userUserID) elements.userUserID.value = selectedUserId;
  if (elements.userName) elements.userName.value = String(item.Nume || "");
  if (elements.userEmail) elements.userEmail.value = String(item.Email || "");
  if (elements.userPassword) elements.userPassword.value = String(item.ParolaHash || "");
  if (elements.userRole) elements.userRole.value = String(item.Rol || "SOFER");
  if (elements.userStatus) elements.userStatus.value = String(item.Status || "ACTIV");
  if (elements.userObservatii) elements.userObservatii.value = String(item.Observatii || "");
  if (elements.saveUserBtn) elements.saveUserBtn.textContent = "Actualizeaza user";
  if (elements.cancelUserEditBtn) elements.cancelUserEditBtn.classList.remove("hidden");
  if (elements.deleteUserBtn && isAdminUser()) elements.deleteUserBtn.classList.remove("hidden");
  applyUserFilters();
  applyUserRoleRules(getSession());
  setUserMessage("Editezi utilizatorul selectat din lista.", false);
}

function resetUserForm(clearMessage = true) {
  selectedUserId = "";
  if (elements.userForm) elements.userForm.reset();
  if (elements.userUserID) elements.userUserID.value = "";
  if (elements.userRole) elements.userRole.value = "SOFER";
  if (elements.userStatus) elements.userStatus.value = "ACTIV";
  if (elements.saveUserBtn) elements.saveUserBtn.textContent = "Salveaza user";
  if (elements.cancelUserEditBtn) elements.cancelUserEditBtn.classList.add("hidden");
  if (elements.deleteUserBtn) elements.deleteUserBtn.classList.add("hidden");
  applyUserRoleRules(getSession());
  applyUserFilters();
  if (clearMessage) setUserMessage("", false);
}

async function loadAssignmentsModule() {
  if (!getSession()) {
    return;
  }

  try {
    const session = getSession();
    const response = await listAssignmentsData({
      role: session.Rol || "",
      userId: session.UserID || "",
      email: session.Email || ""
    });

    if (response.ok && Array.isArray(response.data && response.data.items)) {
      assignmentsState = response.data.items;
      applyAssignmentFilters();
      prefillDriverVehicleForOperationalForms();
      setAssignmentMessage("", false);
      return;
    }

    assignmentsState = [];
    renderAssignmentsTable([]);
    prefillDriverVehicleForOperationalForms();
    setAssignmentMessage(response.message || "Lista de asignari nu este disponibila.", true);
  } catch (error) {
    assignmentsState = [];
    renderAssignmentsTable([]);
    prefillDriverVehicleForOperationalForms();
    setAssignmentMessage(getReadableError(error), true);
  }
}

function applyAssignmentFilters() {
  const masinaFilter = valueOf(elements.assignmentFilterMasina).toLowerCase();
  const soferFilter = valueOf(elements.assignmentFilterSofer).toLowerCase();
  const statusFilter = valueOf(elements.assignmentFilterStatus).toUpperCase();

  renderAssignmentsTable(assignmentsState.filter((item) => {
    if (masinaFilter && !matchesVehicleFilter(item, masinaFilter)) return false;
    if (soferFilter && !String(item.SoferID || "").toLowerCase().includes(soferFilter)) return false;
    if (statusFilter && String(item.Status || "").toUpperCase() !== statusFilter) return false;
    return true;
  }));
}

function renderAssignmentsTable(items) {
  renderModuleTable(
    elements.assignmentsTableBody,
    items,
    5,
    "Nu exista asignari disponibile.",
    (item) => `
      <tr class="trip-row${String(item.AsignareID || "") === selectedAssignmentId ? " trip-row--active" : ""}" data-assignment-id="${escapeHtml(item.AsignareID || "")}">
        <td>${escapeHtml(item.AsignareID || "-")}</td>
        <td>${escapeHtml(getVehicleDisplayLabel(item))}</td>
        <td>${escapeHtml(item.SoferID || "-")}</td>
        <td>${formatDate(item.DataStart)}</td>
        <td>${renderStatusBadge(item.Status)}</td>
      </tr>
    `
  );

  bindRowSelection(elements.assignmentsTableBody, ".trip-row", "data-assignment-id", assignmentsState, "AsignareID", populateAssignmentForm);
}

async function handleAssignmentSubmit(event) {
  event.preventDefault();
  if (!hasEditAccess()) return setAssignmentMessage("Rolul curent are acces doar de citire.", true);

  const selectedItem = assignmentsState.find((item) => String(item.AsignareID || "") === selectedAssignmentId) || null;
  const resolvedVehicle = resolveVehicleReference(
    valueOf(elements.assignmentMasinaID),
    String((selectedItem && selectedItem.MasinaID) || "")
  );
  const derivedSoferId = getDriverIdForVehicleReference(
    resolvedVehicle.nrInmatriculare || resolvedVehicle.masinaId,
    resolvedVehicle.masinaId || String((selectedItem && selectedItem.MasinaID) || "")
  );
  const effectiveSoferId = valueOf(elements.assignmentSoferID) || derivedSoferId || String((selectedItem && selectedItem.SoferID) || "").trim();

  const payload = withSessionPayload({
    AsignareID: valueOf(elements.assignmentID) || generateSequentialId("ASN", assignmentsState, "AsignareID"),
    MasinaID: resolvedVehicle.masinaId,
    NrInmatriculare: resolvedVehicle.nrInmatriculare,
    SoferID: effectiveSoferId,
    DataStart: valueOf(elements.assignmentDataStart),
    Status: valueOf(elements.assignmentStatus),
    MotivIncheiere: valueOf(elements.assignmentMotivIncheiere),
    Observatii: valueOf(elements.assignmentObservatii)
  });

  if (!payload.MasinaID || !payload.SoferID) {
    return setAssignmentMessage("Nr-ul de inmatriculare / masina si SoferID sunt obligatorii.", true);
  }

  try {
    const isEditMode = Boolean(selectedAssignmentId);
    setAssignmentMessage(isEditMode ? "Se actualizeaza asignarea..." : "Se salveaza asignarea...", false);
    const response = await saveAssignmentData(payload, isEditMode);
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut salva asignarea.");
    }

    setAssignmentMessage(isEditMode ? "Asignarea a fost actualizata." : "Asignarea a fost salvata.", false);
    resetAssignmentForm(false);
    await loadAssignmentsModule();
    await loadVehiclesModule();
  } catch (error) {
    setAssignmentMessage(getReadableError(error), true);
  }
}

async function handleDeleteAssignment() {
  if (!hasDeleteAccess()) return setAssignmentMessage("Doar ADMIN poate sterge asignari.", true);

  if (!selectedAssignmentId) {
    setAssignmentMessage("Selecteaza mai intai o asignare din lista.", true);
    return;
  }

  try {
    setAssignmentMessage("Se sterge asignarea...", false);
    const response = await deleteAssignmentData(withSessionPayload({ AsignareID: selectedAssignmentId }));
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut sterge asignarea.");
    }

    setAssignmentMessage("Asignarea a fost stearsa.", false);
    resetAssignmentForm(false);
    await loadAssignmentsModule();
    await loadVehiclesModule();
  } catch (error) {
    setAssignmentMessage(getReadableError(error), true);
  }
}

function populateAssignmentForm(item) {
  selectedAssignmentId = String(item.AsignareID || "");
  if (elements.assignmentID) elements.assignmentID.value = selectedAssignmentId;
  if (elements.assignmentMasinaID) elements.assignmentMasinaID.value = getVehicleDisplayLabel(item);
  if (elements.assignmentSoferID) elements.assignmentSoferID.value = String(item.SoferID || "");
  if (elements.assignmentDataStart) elements.assignmentDataStart.value = normalizeDateInputForCompare(item.DataStart);
  if (elements.assignmentStatus) elements.assignmentStatus.value = String(item.Status || "ACTIVA");
  if (elements.assignmentMotivIncheiere) elements.assignmentMotivIncheiere.value = String(item.MotivIncheiere || "");
  if (elements.assignmentObservatii) elements.assignmentObservatii.value = String(item.Observatii || "");
  if (elements.saveAssignmentBtn) elements.saveAssignmentBtn.textContent = "Actualizeaza asignare";
  if (elements.cancelAssignmentEditBtn) elements.cancelAssignmentEditBtn.classList.remove("hidden");
  if (elements.deleteAssignmentBtn && hasDeleteAccess()) elements.deleteAssignmentBtn.classList.remove("hidden");
  applyAssignmentFilters();
  applyAssignmentRoleRules(getSession());
  setAssignmentMessage("Editezi asignarea selectata din lista.", false);
}

function resetAssignmentForm(clearMessage = true) {
  selectedAssignmentId = "";
  if (elements.assignmentForm) elements.assignmentForm.reset();
  if (elements.assignmentID) elements.assignmentID.value = "";
  if (elements.saveAssignmentBtn) elements.saveAssignmentBtn.textContent = "Salveaza asignare";
  if (elements.cancelAssignmentEditBtn) elements.cancelAssignmentEditBtn.classList.add("hidden");
  if (elements.deleteAssignmentBtn) elements.deleteAssignmentBtn.classList.add("hidden");
  applyAssignmentRoleRules(getSession());
  applyAssignmentFilters();
  if (clearMessage) setAssignmentMessage("", false);
}

async function loadFuelModule() {
  if (!getSession()) {
    return;
  }

  try {
    const session = getSession();
    const response = await listFuelEntriesData({
      role: session.Rol || "",
      userId: session.UserID || "",
      email: session.Email || "",
      linkedSoferId: session.LinkedSoferID || ""
    });

    if (response.ok && Array.isArray(response.data && response.data.items)) {
      fuelEntriesState = response.data.items;
      applyFuelFilters();
      setFuelMessage("", false);
      return;
    }

    fuelEntriesState = [];
    renderFuelEntriesSection([]);
    setFuelMessage(response.message || "Lista de alimentari nu este disponibila.", true);
  } catch (error) {
    fuelEntriesState = [];
    renderFuelEntriesSection([]);
    setFuelMessage(getReadableError(error), true);
  }
}

function applyFuelFilters() {
  const masinaFilter = valueOf(elements.fuelFilterMasina).toLowerCase();
  const soferFilter = valueOf(elements.fuelFilterSofer).toLowerCase();
  const dataFilter = valueOf(elements.fuelFilterData);
  const fallbackLatestDay = !masinaFilter && !soferFilter && !dataFilter ? getLatestCalendarDayKey(fuelEntriesState, "DataAlimentare") : "";

  renderFuelEntriesSection(fuelEntriesState.filter((item) => {
    if (masinaFilter && !matchesVehicleFilter(item, masinaFilter)) return false;
    if (soferFilter && !String(item.SoferID || "").toLowerCase().includes(soferFilter)) return false;
    if (dataFilter && normalizeDateInputForCompare(item.DataAlimentare) !== dataFilter) return false;
    if (fallbackLatestDay && normalizeDateInputForCompare(item.DataAlimentare) !== fallbackLatestDay) return false;
    return true;
  }));
}

function renderFuelEntriesSection(items) {
  renderModuleTable(
    elements.fuelEntriesSectionBody,
    items,
    6,
    "Nu exista alimentari disponibile.",
    (item) => `
      <tr class="trip-row${String(item.AlimentareID || "") === selectedFuelEntryId ? " trip-row--active" : ""}" data-fuel-id="${escapeHtml(item.AlimentareID || "")}">
        <td>${escapeHtml(item.AlimentareID || "-")}</td>
        <td>${escapeHtml(getVehicleDisplayLabel(item))}</td>
        <td>${escapeHtml(item.SoferID || "-")}</td>
        <td>${formatDate(item.DataAlimentare)}</td>
        <td>${formatNumber(item.CantitateLitri)} L</td>
        <td>${formatCurrency(item.CostTotal)}</td>
      </tr>
    `
  );

  bindRowSelection(elements.fuelEntriesSectionBody, ".trip-row", "data-fuel-id", fuelEntriesState, "AlimentareID", populateFuelForm);
}

async function handleFuelSubmit(event) {
  event.preventDefault();
  const session = getSession();
  const role = currentRole();
  if (!(hasEditAccess() || role === "SOFER")) return setFuelMessage("Rolul curent are acces doar de citire.", true);

  const primaryVehicle = role === "SOFER" ? getPrimaryVehicleForSession(session) : null;
  const resolvedVehicle = resolveVehicleReference(
    valueOf(elements.fuelMasinaID) || String((primaryVehicle && primaryVehicle.NrInmatriculare) || ""),
    String((primaryVehicle && primaryVehicle.MasinaID) || "")
  );
  const sessionSoferId = getEffectiveLinkedSoferId(session);
  const derivedSoferId = role === "SOFER"
    ? (
        getDriverIdForVehicleReference(resolvedVehicle.nrInmatriculare || resolvedVehicle.masinaId, resolvedVehicle.masinaId) ||
        sessionSoferId
      )
    : "";

  const payload = withSessionPayload({
    AlimentareID: valueOf(elements.fuelEntryID) || generateSequentialId("FUL", fuelEntriesState, "AlimentareID"),
    MasinaID: resolvedVehicle.masinaId,
    NrInmatriculare: resolvedVehicle.nrInmatriculare,
    SoferID: role === "SOFER" ? derivedSoferId : valueOf(elements.fuelSoferID),
    DataAlimentare: valueOf(elements.fuelData),
    KmLaAlimentare: numberOf(elements.fuelKmLaAlimentare),
    CantitateLitri: numberOf(elements.fuelCantitate),
    CostTotal: numberOf(elements.fuelCostTotal),
    PretPeLitru: numberOf(elements.fuelPretPeLitru),
    Statie: valueOf(elements.fuelStatie),
    TipCombustibil: valueOf(elements.fuelTipCombustibil),
    Observatii: valueOf(elements.fuelObservatii)
  });

  if (!payload.MasinaID || !payload.SoferID || !payload.DataAlimentare) {
    return setFuelMessage("Nr-ul de inmatriculare / masina, soferul si data sunt obligatorii.", true);
  }

  try {
    const isEditMode = Boolean(selectedFuelEntryId);
    setFuelMessage(isEditMode ? "Se actualizeaza alimentarea..." : "Se salveaza alimentarea...", false);
    const response = await saveFuelEntryData(payload, isEditMode);
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut salva alimentarea.");
    }

    setFuelMessage(isEditMode ? "Alimentarea a fost actualizata." : "Alimentarea a fost salvata.", false);
    resetFuelForm(false);
    await loadFuelModule();
  } catch (error) {
    setFuelMessage(getReadableError(error), true);
  }
}

async function handleDeleteFuelEntry() {
  if (!hasDeleteAccess()) return setFuelMessage("Doar ADMIN poate sterge alimentari.", true);

  if (!selectedFuelEntryId) {
    setFuelMessage("Selecteaza mai intai o alimentare din lista.", true);
    return;
  }

  try {
    setFuelMessage("Se sterge alimentarea...", false);
    const response = await deleteFuelEntryData(withSessionPayload({ AlimentareID: selectedFuelEntryId }));
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut sterge alimentarea.");
    }

    setFuelMessage("Alimentarea a fost stearsa.", false);
    resetFuelForm(false);
    await loadFuelModule();
  } catch (error) {
    setFuelMessage(getReadableError(error), true);
  }
}

function populateFuelForm(item) {
  selectedFuelEntryId = String(item.AlimentareID || "");
  if (elements.fuelEntryID) elements.fuelEntryID.value = selectedFuelEntryId;
  if (elements.fuelMasinaID) elements.fuelMasinaID.value = getVehicleDisplayLabel(item);
  if (elements.fuelSoferID) elements.fuelSoferID.value = String(item.SoferID || "");
  if (elements.fuelData) elements.fuelData.value = normalizeDateInputForCompare(item.DataAlimentare);
  if (elements.fuelKmLaAlimentare) elements.fuelKmLaAlimentare.value = String(item.KmLaAlimentare || "");
  if (elements.fuelCantitate) elements.fuelCantitate.value = String(item.CantitateLitri || "");
  if (elements.fuelCostTotal) elements.fuelCostTotal.value = String(item.CostTotal || "");
  if (elements.fuelPretPeLitru) elements.fuelPretPeLitru.value = String(item.PretPeLitru || "");
  if (elements.fuelStatie) elements.fuelStatie.value = String(item.Statie || "");
  if (elements.fuelTipCombustibil) elements.fuelTipCombustibil.value = String(item.TipCombustibil || "");
  if (elements.fuelObservatii) elements.fuelObservatii.value = String(item.Observatii || "");
  if (elements.saveFuelBtn) elements.saveFuelBtn.textContent = "Actualizeaza alimentare";
  if (elements.cancelFuelEditBtn) elements.cancelFuelEditBtn.classList.remove("hidden");
  if (elements.deleteFuelBtn && hasDeleteAccess()) elements.deleteFuelBtn.classList.remove("hidden");
  applyFuelFilters();
  applyFuelRoleRules(getSession());
  setFuelMessage("Editezi alimentarea selectata din lista.", false);
}

function resetFuelForm(clearMessage = true) {
  selectedFuelEntryId = "";
  if (elements.fuelForm) elements.fuelForm.reset();
  if (elements.fuelEntryID) elements.fuelEntryID.value = "";
  if (elements.saveFuelBtn) elements.saveFuelBtn.textContent = "Salveaza alimentare";
  if (elements.cancelFuelEditBtn) elements.cancelFuelEditBtn.classList.add("hidden");
  if (elements.deleteFuelBtn) elements.deleteFuelBtn.classList.add("hidden");
  applyFuelRoleRules(getSession());
  applyFuelFilters();
  if (clearMessage) setFuelMessage("", false);
}

async function loadFuelTankModule() {
  if (!getSession()) {
    return;
  }

  try {
    const session = getSession();
    const [tankResponse, transactionResponse] = await Promise.all([
      listFuelTanksData({
        role: session.Rol || "",
        userId: session.UserID || "",
        email: session.Email || ""
      }),
      listFuelTankTransactionsData({
        role: session.Rol || "",
        userId: session.UserID || "",
        email: session.Email || ""
      })
    ]);

    if (tankResponse.ok && Array.isArray(tankResponse.data && tankResponse.data.items)) {
      fuelTanksState = tankResponse.data.items;
    } else {
      fuelTanksState = [];
    }

    if (transactionResponse.ok && Array.isArray(transactionResponse.data && transactionResponse.data.items)) {
      fuelTankTransactionsState = transactionResponse.data.items;
    } else {
      fuelTankTransactionsState = [];
    }

    renderFuelTankOverview();
    applyFuelTankTransactionFilters();
    applyFuelTankHistoryFilters();
    syncFuelTankForms();
    setFuelTankMessage("", false);
    setFuelUtilityMessage("", false);
    setFuelTankHistoryMessage("", false);
    setTankUtilityReportMessage("", false);
  } catch (error) {
    fuelTanksState = [];
    fuelTankTransactionsState = [];
    renderFuelTankOverview();
    renderFuelTankTransactions(elements.tankUtilityTransactionsBody, [], "Nu exista alimentari utilaje disponibile.", setFuelUtilityMessage);
    renderFuelTankTransactions(elements.tankLatestTransactionsBody, [], "Nu exista operatiuni inregistrate.", setFuelTankMessage);
    renderFuelTankHistory([]);
    setFuelTankMessage(getReadableError(error), true);
  }
}

function getActiveFuelTank() {
  return (fuelTanksState || [])[0] || null;
}

function renderFuelTankOverview() {
  const tank = getActiveFuelTank();
  const capacity = Number((tank && tank.capacitate_maxima_litri) || (tank && tank.CapacitateMaximaLitri) || 1000);
  const currentLevel = Number((tank && tank.nivel_curent_litri) || (tank && tank.NivelCurentLitri) || 0);
  const location = String((tank && tank.locatie_curenta) || (tank && tank.LocatieCurenta) || "-");
  const percent = capacity > 0 ? Math.max(0, Math.min(100, (currentLevel / capacity) * 100)) : 0;

  setElementText(elements.tankCapacityValue, `${formatNumber(capacity)} L`);
  setElementText(elements.tankCurrentLevelValue, `${formatNumber(currentLevel)} L`);
  setElementText(elements.tankLocationValue, location || "-");
  setElementText(elements.tankFillPercentValue, `${formatNumber(percent)}%`);
  setElementText(
    elements.tankStatusHint,
    tank
      ? `Bazinul ${String(tank.nume || tank.Nume || "Mobil")} este la ${formatNumber(percent)}% si are ${formatNumber(currentLevel)} L disponibili.`
      : "Nu exista inca un bazin configurat in backend."
  );

  if (elements.tankGaugeFill) {
    elements.tankGaugeFill.style.width = `${percent}%`;
  }

  const latestTransactions = sortItemsByDateDesc(fuelTankTransactionsState, "created_at").slice(0, 6);
  renderFuelTankTransactions(elements.tankLatestTransactionsBody, latestTransactions, "Nu exista operatiuni inregistrate.", setFuelTankMessage);
}

function syncFuelTankForms() {
  const tank = getActiveFuelTank();
  const tankId = String((tank && (tank.id || tank.ID || tank.BazinID)) || "");
  const tankName = String((tank && (tank.nume || tank.Nume)) || "Bazin mobil");
  const currentLevel = Number((tank && (tank.nivel_curent_litri || tank.NivelCurentLitri)) || 0);
  const capacity = Number((tank && (tank.capacitate_maxima_litri || tank.CapacitateMaximaLitri)) || 1000);
  const location = String((tank && (tank.locatie_curenta || tank.LocatieCurenta)) || "");

  if (elements.fuelTankId) elements.fuelTankId.value = tankId;
  if (elements.fuelTankName) elements.fuelTankName.value = tankName;
  if (elements.fuelTankCapacity) elements.fuelTankCapacity.value = String(capacity || 1000);
  if (elements.fuelTankLocation && !valueOf(elements.fuelTankLocation)) elements.fuelTankLocation.value = location;
  if (elements.fuelUtilityTankId) elements.fuelUtilityTankId.value = tankId;
  if (elements.fuelUtilityLevel) elements.fuelUtilityLevel.value = `${formatNumber(currentLevel)} L disponibili`;
  if (elements.fuelUtilityLocation && !valueOf(elements.fuelUtilityLocation)) elements.fuelUtilityLocation.value = location;
}

function applyFuelTankTransactionFilters() {
  const typeFilter = valueOf(elements.tankTxnFilterType).toUpperCase();
  const utilityFilter = valueOf(elements.tankTxnFilterUtility).toLowerCase();
  const dateFilter = valueOf(elements.tankTxnFilterDate);

  const filtered = fuelTankTransactionsState.filter((item) => {
    const type = String(item.tip_operatie || item.TipOperatie || "").toUpperCase();
    const utility = String(item.utilaj_alimentat || item.UtilajAlimentat || "").toLowerCase();
    const createdAt = item.created_at || item.CreatedAt;
    if (typeFilter && !type.includes(typeFilter)) return false;
    if (utilityFilter && !utility.includes(utilityFilter)) return false;
    if (dateFilter && normalizeDateInputForCompare(createdAt) !== dateFilter) return false;
    return true;
  });

  renderFuelTankTransactions(elements.tankUtilityTransactionsBody, filtered, "Nu exista alimentari utilaje disponibile.", setFuelUtilityMessage);
}

function applyFuelTankHistoryFilters() {
  const typeFilter = valueOf(elements.tankHistoryFilterType).toUpperCase();
  const locationFilter = valueOf(elements.tankHistoryFilterLocation).toLowerCase();
  const dateFilter = valueOf(elements.tankHistoryFilterDate);

  const filtered = fuelTankTransactionsState.filter((item) => {
    const type = String(item.tip_operatie || item.TipOperatie || "").toUpperCase();
    const location = String(item.locatie || item.Locatie || "").toLowerCase();
    const createdAt = item.created_at || item.CreatedAt;
    if (typeFilter && !type.includes(typeFilter)) return false;
    if (locationFilter && !location.includes(locationFilter)) return false;
    if (dateFilter && normalizeDateInputForCompare(createdAt) !== dateFilter) return false;
    return true;
  });

  renderFuelTankHistory(filtered);
}

function renderFuelTankTransactions(body, items, emptyText, messageFn = setFuelTankMessage) {
  const canEdit = canEditFuelTankTransactions();
  const canDelete = canDeleteFuelTankTransactions();
  const actionCount = (canEdit ? 1 : 0) + (canDelete ? 1 : 0);
  const colspan = 6 + (actionCount ? 1 : 0);
  renderModuleTable(
    body,
    items,
    colspan,
    emptyText,
    (item) => `
      <tr>
        <td>${formatDate(item.created_at || item.CreatedAt)}</td>
        <td>${escapeHtml(String(item.tip_operatie || item.TipOperatie || "-"))}</td>
        <td>${formatNumber(item.cantitate_litri || item.CantitateLitri)} L</td>
        <td>${escapeHtml(String(item.utilaj_alimentat || item.UtilajAlimentat || "-"))}</td>
        <td>${escapeHtml(String(item.locatie || item.Locatie || "-"))}</td>
        <td>${escapeHtml(getTankTransactionUserLabel(item))}</td>
        ${actionCount ? `<td class="table-actions">
          ${canEdit ? `<button class="btn btn--secondary btn--compact" type="button" data-edit-tank-txn="${escapeHtml(String(item.id || item.ID || ""))}">Editeaza</button>` : ""}
          ${canDelete ? `<button class="btn btn--danger btn--compact" type="button" data-delete-tank-txn="${escapeHtml(String(item.id || item.ID || ""))}">Sterge</button>` : ""}
        </td>` : ""}
      </tr>
    `
  );

  bindTankTransactionEditButtons(body, items, messageFn);
  bindTankTransactionDeleteButtons(body, messageFn);
}

function renderFuelTankHistory(items) {
  const canEdit = canEditFuelTankTransactions();
  const canDelete = canDeleteFuelTankTransactions();
  const actionCount = (canEdit ? 1 : 0) + (canDelete ? 1 : 0);
  renderModuleTable(
    elements.tankHistoryBody,
    sortItemsByDateDesc(items, "created_at"),
    7 + (actionCount ? 1 : 0),
    "Nu exista tranzactii de bazin disponibile.",
    (item) => `
      <tr>
        <td>${formatDate(item.created_at || item.CreatedAt)}</td>
        <td>${escapeHtml(String(item.tip_operatie || item.TipOperatie || "-"))}</td>
        <td>${formatNumber(item.cantitate_litri || item.CantitateLitri)} L</td>
        <td>${escapeHtml(String(item.utilaj_alimentat || item.UtilajAlimentat || "-"))}</td>
        <td>${escapeHtml(String(item.locatie || item.Locatie || "-"))}</td>
        <td>${escapeHtml(getTankTransactionUserLabel(item))}</td>
        <td>${escapeHtml(String(item.observatii || item.Observatii || "-"))}</td>
        ${actionCount ? `<td class="table-actions">
          ${canEdit ? `<button class="btn btn--secondary btn--compact" type="button" data-edit-tank-txn="${escapeHtml(String(item.id || item.ID || ""))}">Editeaza</button>` : ""}
          ${canDelete ? `<button class="btn btn--danger btn--compact" type="button" data-delete-tank-txn="${escapeHtml(String(item.id || item.ID || ""))}">Sterge</button>` : ""}
        </td>` : ""}
      </tr>
    `
  );

  bindTankTransactionEditButtons(elements.tankHistoryBody, items, setFuelTankHistoryMessage);
  bindTankTransactionDeleteButtons(elements.tankHistoryBody, setFuelTankHistoryMessage);
}

async function handleFuelTankOperation(operationType) {
  const role = currentRole();
  const canFill = role === "ADMIN" || role === "MANAGER" || role === "OFFICE" || role === "SOFER";
  const canDispense = role === "ADMIN" || role === "MANAGER" || role === "OFFICE" || role === "SOFER";
  const effectiveOperationType = selectedFuelTankTransactionId
    ? (valueOf(elements.fuelTankOperationType) || operationType).toUpperCase()
    : operationType;

  if (effectiveOperationType === "UMPLERE" && !canFill) {
    return setFuelTankMessage("Doar ADMIN, MANAGER, OFFICE sau SOFER pot umple bazinul.", true);
  }
  if (effectiveOperationType === "DESCARCARE" && !canDispense) {
    return setFuelTankMessage("Rolul curent nu poate descarca motorina din bazin.", true);
  }

  const payload = withSessionPayload({
    id: selectedFuelTankTransactionId,
    bazin_id: valueOf(elements.fuelTankId),
    nume: valueOf(elements.fuelTankName),
    capacitate_maxima_litri: numberOf(elements.fuelTankCapacity) || 1000,
    tip_operatie: effectiveOperationType,
    cantitate_litri: numberOf(elements.fuelTankQuantity),
    utilaj_alimentat: effectiveOperationType === "DESCARCARE" ? valueOf(elements.fuelTankUtility) : "",
    locatie: valueOf(elements.fuelTankLocation),
    observatii: valueOf(elements.fuelTankNotes)
  });

  if (!payload.cantitate_litri || !payload.locatie) {
    return setFuelTankMessage("Cantitatea si locatia sunt obligatorii.", true);
  }
  if (effectiveOperationType === "DESCARCARE" && !payload.utilaj_alimentat) {
    return setFuelTankMessage("Selecteaza utilajul alimentat.", true);
  }

  try {
    setFuelTankMessage(selectedFuelTankTransactionId ? "Se actualizeaza tranzactia..." : "Se proceseaza operatiunea...", false);
    const response = await saveFuelTankTransactionData(payload, Boolean(selectedFuelTankTransactionId));
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut procesa operatiunea pe bazin.");
    }
    setFuelTankMessage(
      selectedFuelTankTransactionId
        ? "Tranzactia de bazin a fost actualizata."
        : (effectiveOperationType === "UMPLERE" ? "Bazinul a fost umplut." : "Motorina a fost descarcata catre utilaj."),
      false
    );
    resetFuelTankOperationForm(false);
    await loadFuelTankModule();
  } catch (error) {
    setFuelTankMessage(getReadableError(error), true);
  }
}

async function handleFuelUtilitySubmit(event) {
  event.preventDefault();
  const role = currentRole();
  if (!(role === "ADMIN" || role === "MANAGER" || role === "OFFICE" || role === "SOFER")) {
    return setFuelUtilityMessage("Rolul curent nu poate alimenta utilaje din bazin.", true);
  }

  const payload = withSessionPayload({
    bazin_id: valueOf(elements.fuelUtilityTankId),
    tip_operatie: "DESCARCARE",
    cantitate_litri: numberOf(elements.fuelUtilityQuantity),
    utilaj_alimentat: valueOf(elements.fuelUtilityTarget),
    locatie: valueOf(elements.fuelUtilityLocation),
    observatii: valueOf(elements.fuelUtilityNotes)
  });

  if (!payload.cantitate_litri || !payload.utilaj_alimentat || !payload.locatie) {
    return setFuelUtilityMessage("Utilajul, cantitatea si locatia sunt obligatorii.", true);
  }

  try {
    setFuelUtilityMessage("Se inregistreaza alimentarea utilajului...", false);
    const response = await createFuelTankTransactionData(payload);
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut inregistra alimentarea utilajului.");
    }
    setFuelUtilityMessage("Alimentarea utilajului a fost salvata.", false);
    if (elements.fuelUtilityForm) elements.fuelUtilityForm.reset();
    await loadFuelTankModule();
  } catch (error) {
    setFuelUtilityMessage(getReadableError(error), true);
  }
}

function getTankTransactionUserLabel(item) {
  return String(
    item.creat_de_user_nume ||
    item.CreatDeUserNume ||
    item.creat_de_user_id ||
    item.CreatDeUserID ||
    "-"
  );
}

function getFuelTankTransactionId(item) {
  return String((item && (item.id || item.ID)) || "").trim();
}

function canEditFuelTankTransactions() {
  const role = currentRole();
  return role === "ADMIN" || role === "MANAGER" || role === "OFFICE";
}

function canDeleteFuelTankTransactions() {
  const role = currentRole();
  return role === "ADMIN" || role === "MANAGER" || role === "OFFICE";
}

function bindTankTransactionEditButtons(body, items, messageFn) {
  if (!body || !canEditFuelTankTransactions()) {
    return;
  }

  Array.from(body.querySelectorAll("[data-edit-tank-txn]")).forEach((button) => {
    button.addEventListener("click", () => {
      const transactionId = String(button.getAttribute("data-edit-tank-txn") || "").trim();
      const item = (items || []).find((entry) => getFuelTankTransactionId(entry) === transactionId);
      if (!item) {
        return;
      }
      populateFuelTankTransactionForm(item, messageFn || setFuelTankMessage);
    });
  });
}

function bindTankTransactionDeleteButtons(body, messageFn) {
  if (!body || !canDeleteFuelTankTransactions()) {
    return;
  }

  Array.from(body.querySelectorAll("[data-delete-tank-txn]")).forEach((button) => {
    button.addEventListener("click", async () => {
      const transactionId = String(button.getAttribute("data-delete-tank-txn") || "").trim();
      if (!transactionId) {
        return;
      }
      selectedFuelTankTransactionId = transactionId;
      await handleDeleteFuelTankTransaction(messageFn || setFuelTankMessage);
    });
  });
}

async function handleDeleteFuelTankTransaction(messageFn) {
  if (!canDeleteFuelTankTransactions()) {
    return (messageFn || setFuelTankMessage)("Doar ADMIN, MANAGER sau OFFICE pot sterge tranzactii de bazin.", true);
  }
  if (!selectedFuelTankTransactionId) {
    return (messageFn || setFuelTankMessage)("Selecteaza mai intai o tranzactie.", true);
  }

  try {
    (messageFn || setFuelTankMessage)("Se sterge tranzactia...", false);
    const response = await deleteFuelTankTransactionData(withSessionPayload({ id: selectedFuelTankTransactionId }));
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut sterge tranzactia de bazin.");
    }

    selectedFuelTankTransactionId = "";
    await loadFuelTankModule();
    (messageFn || setFuelTankMessage)("Tranzactia de bazin a fost stearsa.", false);
  } catch (error) {
    (messageFn || setFuelTankMessage)(getReadableError(error), true);
  }
}

function populateFuelTankTransactionForm(item, messageFn) {
  selectedFuelTankTransactionId = getFuelTankTransactionId(item);
  selectedFuelTankTransactionItem = item || null;
  if (elements.fuelTankId) elements.fuelTankId.value = String(item.bazin_id || item.BazinID || item.bazinId || valueOf(elements.fuelTankId) || "");
  if (elements.fuelTankOperationType) elements.fuelTankOperationType.value = String(item.tip_operatie || item.TipOperatie || "UMPLERE").toUpperCase();
  if (elements.fuelTankQuantity) elements.fuelTankQuantity.value = String(item.cantitate_litri || item.CantitateLitri || "");
  if (elements.fuelTankLocation) elements.fuelTankLocation.value = String(item.locatie || item.Locatie || "");
  if (elements.fuelTankUtility) elements.fuelTankUtility.value = String(item.utilaj_alimentat || item.UtilajAlimentat || "");
  if (elements.fuelTankNotes) elements.fuelTankNotes.value = String(item.observatii || item.Observatii || "");
  if (elements.cancelFuelTankEditBtn) elements.cancelFuelTankEditBtn.classList.remove("hidden");
  applyFuelTankRoleRules(getSession());
  setActiveSection("bazin-motorina");
  (messageFn || setFuelTankMessage)("Editezi tranzactia selectata din bazin.", false);
}

function resetFuelTankOperationForm(clearMessage = true) {
  selectedFuelTankTransactionId = "";
  selectedFuelTankTransactionItem = null;
  if (elements.fuelTankOperationForm) elements.fuelTankOperationForm.reset();
  syncFuelTankForms();
  if (elements.cancelFuelTankEditBtn) elements.cancelFuelTankEditBtn.classList.add("hidden");
  applyFuelTankRoleRules(getSession());
  if (clearMessage) setFuelTankMessage("", false);
}

async function handleExportTankUtility(format) {
  const role = currentRole();
  if (!(role === "ADMIN" || role === "MANAGER" || role === "OFFICE")) {
    return setTankUtilityReportMessage("Doar ADMIN, MANAGER sau OFFICE pot exporta alimentarile utilajelor.", true);
  }
  if (!(await refreshReportSources(["tankTransactions"], setTankUtilityReportMessage))) return;

  const typeFilter = valueOf(elements.tankTxnFilterType).toUpperCase();
  const utilityFilter = valueOf(elements.tankTxnFilterUtility).toLowerCase();
  const dateFilter = valueOf(elements.tankTxnFilterDate);

  const rows = sortItemsByDateDesc(
    fuelTankTransactionsState.filter((item) => {
      const type = String(item.tip_operatie || item.TipOperatie || "").toUpperCase();
      const utility = String(item.utilaj_alimentat || item.UtilajAlimentat || "").toLowerCase();
      const createdAt = normalizeDateInputForCompare(item.created_at || item.CreatedAt);
      if (typeFilter && !type.includes(typeFilter)) return false;
      if (utilityFilter && !utility.includes(utilityFilter)) return false;
      if (dateFilter && createdAt !== dateFilter) return false;
      return true;
    }),
    "created_at"
  ).map((item) => ({
    Data: formatDate(item.created_at || item.CreatedAt),
    TipOperatie: String(item.tip_operatie || item.TipOperatie || ""),
    CantitateLitri: formatNumber(item.cantitate_litri || item.CantitateLitri),
    Utilaj: String(item.utilaj_alimentat || item.UtilajAlimentat || "-"),
    Locatie: String(item.locatie || item.Locatie || "-"),
    Utilizator: getTankTransactionUserLabel(item)
  }));

  const columns = [
    { label: "Data", value: "Data" },
    { label: "Tip operatie", value: "TipOperatie" },
    { label: "Cantitate (L)", value: "CantitateLitri" },
    { label: "Utilaj", value: "Utilaj" },
    { label: "Locatie", value: "Locatie" },
    { label: "Utilizator", value: "Utilizator" }
  ];

  exportRowsByFormat("Raport alimentari utilaje", rows, columns, format, "alimentari-utilaje", setTankUtilityReportMessage);
}

async function handleExportTankHistory(format) {
  if (!ensureTankExportAccess(setTankReportMessage)) return;
  if (!(await refreshReportSources(["tankTransactions"], setTankReportMessage))) return;

  const typeFilter = valueOf(elements.reportTankType).toUpperCase();
  const locationFilter = valueOf(elements.reportTankLocation).toLowerCase();
  const dateFrom = valueOf(elements.reportTankDateFrom);
  const dateTo = valueOf(elements.reportTankDateTo);

  const rows = sortItemsByDateDesc(
    fuelTankTransactionsState.filter((item) => {
      const type = String(item.tip_operatie || item.TipOperatie || "").toUpperCase();
      const location = String(item.locatie || item.Locatie || "").toLowerCase();
      const createdAt = normalizeDateInputForCompare(item.created_at || item.CreatedAt);
      if (typeFilter && !type.includes(typeFilter)) return false;
      if (locationFilter && !location.includes(locationFilter)) return false;
      if (dateFrom && createdAt && createdAt < dateFrom) return false;
      if (dateTo && createdAt && createdAt > dateTo) return false;
      return true;
    }),
    "created_at"
  ).map((item) => ({
    Data: formatDate(item.created_at || item.CreatedAt),
    TipOperatie: String(item.tip_operatie || item.TipOperatie || ""),
    CantitateLitri: formatNumber(item.cantitate_litri || item.CantitateLitri),
    Utilaj: String(item.utilaj_alimentat || item.UtilajAlimentat || "-"),
    Locatie: String(item.locatie || item.Locatie || "-"),
    Utilizator: getTankTransactionUserLabel(item),
    Observatii: String(item.observatii || item.Observatii || "")
  }));

  const columns = [
    { label: "Data", value: "Data" },
    { label: "Tip operatie", value: "TipOperatie" },
    { label: "Cantitate (L)", value: "CantitateLitri" },
    { label: "Utilaj", value: "Utilaj" },
    { label: "Locatie", value: "Locatie" },
    { label: "Utilizator", value: "Utilizator" },
    { label: "Observatii", value: "Observatii" }
  ];

  exportRowsByFormat("Istoric bazin motorina", rows, columns, format, "istoric-bazin", setTankReportMessage);
}

async function loadDocumentsModule() {
  if (!getSession()) {
    return;
  }

  try {
    const session = getSession();
    const response = await listDocumentsData({
      role: session.Rol || "",
      userId: session.UserID || "",
      email: session.Email || ""
    });

    if (response.ok && Array.isArray(response.data && response.data.items)) {
      documentsState = response.data.items;
      applyDocumentFilters();
      setDocumentMessage("", false);
      return;
    }

    documentsState = [];
    renderDocumentsSection([]);
    setDocumentMessage(response.message || "Lista de documente nu este disponibila.", true);
  } catch (error) {
    documentsState = [];
    renderDocumentsSection([]);
    setDocumentMessage(getReadableError(error), true);
  }
}

function applyDocumentFilters() {
  const masinaFilter = valueOf(elements.documentFilterMasina).toLowerCase();
  const tipFilter = valueOf(elements.documentFilterTip).toLowerCase();
  const statusFilter = valueOf(elements.documentFilterStatus).toUpperCase();

  renderDocumentsSection(documentsState.filter((item) => {
    if (masinaFilter && !matchesVehicleFilter(item, masinaFilter)) return false;
    if (tipFilter && !String(item.TipDocument || "").toLowerCase().includes(tipFilter)) return false;
    if (statusFilter && String(item.Status || "").toUpperCase() !== statusFilter) return false;
    return true;
  }));
}

function renderDocumentsSection(items) {
  renderModuleTable(
    elements.documentsSectionBody,
    items,
    5,
    "Nu exista documente disponibile.",
    (item) => `
      <tr class="trip-row${String(item.DocumentID || "") === selectedDocumentId ? " trip-row--active" : ""}" data-document-id="${escapeHtml(item.DocumentID || "")}">
        <td>${escapeHtml(item.DocumentID || "-")}</td>
        <td>${escapeHtml(getVehicleDisplayLabel(item))}</td>
        <td>${escapeHtml(item.TipDocument || "-")}</td>
        <td>${formatDate(item.DataExpirare)}</td>
        <td>${renderStatusBadge(item.Status)}</td>
      </tr>
    `
  );

  bindRowSelection(elements.documentsSectionBody, ".trip-row", "data-document-id", documentsState, "DocumentID", populateDocumentForm);
}

async function handleDocumentSubmit(event) {
  event.preventDefault();
  if (!hasEditAccess()) return setDocumentMessage("Rolul curent are acces doar de citire.", true);

  const payload = withSessionPayload({
    DocumentID: valueOf(elements.documentID) || generateSequentialId("DOC", documentsState, "DocumentID"),
    MasinaID: resolveVehicleReference(valueOf(elements.documentMasinaID)).masinaId,
    TipDocument: valueOf(elements.documentTip),
    SerieNumar: valueOf(elements.documentSerieNumar),
    DataEmitere: valueOf(elements.documentDataEmitere),
    DataExpirare: valueOf(elements.documentDataExpirare),
    Cost: numberOf(elements.documentCost),
    Furnizor: valueOf(elements.documentFurnizor),
    Status: valueOf(elements.documentStatus),
    FisierURL: valueOf(elements.documentFisierURL),
    Observatii: valueOf(elements.documentObservatii)
  });

  if (!payload.MasinaID || !payload.TipDocument) {
    return setDocumentMessage("Nr-ul de inmatriculare / masina si tipul documentului sunt obligatorii.", true);
  }

  try {
    const isEditMode = Boolean(selectedDocumentId);
    setDocumentMessage(isEditMode ? "Se actualizeaza documentul..." : "Se salveaza documentul...", false);
    const response = await saveDocumentData(payload, isEditMode);
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut salva documentul.");
    }

    setDocumentMessage(isEditMode ? "Documentul a fost actualizat." : "Documentul a fost salvat.", false);
    resetDocumentForm(false);
    await loadDocumentsModule();
  } catch (error) {
    setDocumentMessage(getReadableError(error), true);
  }
}

async function handleDeleteDocument() {
  if (!hasDeleteAccess()) return setDocumentMessage("Doar ADMIN poate sterge documente.", true);

  if (!selectedDocumentId) {
    setDocumentMessage("Selecteaza mai intai un document din lista.", true);
    return;
  }

  try {
    setDocumentMessage("Se sterge documentul...", false);
    const response = await deleteDocumentData(withSessionPayload({ DocumentID: selectedDocumentId }));
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut sterge documentul.");
    }

    setDocumentMessage("Documentul a fost sters.", false);
    resetDocumentForm(false);
    await loadDocumentsModule();
  } catch (error) {
    setDocumentMessage(getReadableError(error), true);
  }
}

function populateDocumentForm(item) {
  selectedDocumentId = String(item.DocumentID || "");
  if (elements.documentID) elements.documentID.value = selectedDocumentId;
  if (elements.documentMasinaID) elements.documentMasinaID.value = getVehicleDisplayLabel(item);
  if (elements.documentTip) elements.documentTip.value = String(item.TipDocument || "");
  if (elements.documentSerieNumar) elements.documentSerieNumar.value = String(item.SerieNumar || "");
  if (elements.documentDataEmitere) elements.documentDataEmitere.value = normalizeDateInputForCompare(item.DataEmitere);
  if (elements.documentDataExpirare) elements.documentDataExpirare.value = normalizeDateInputForCompare(item.DataExpirare);
  if (elements.documentCost) elements.documentCost.value = String(item.Cost || "");
  if (elements.documentFurnizor) elements.documentFurnizor.value = String(item.Furnizor || "");
  if (elements.documentStatus) elements.documentStatus.value = String(item.Status || "ACTIV");
  if (elements.documentFisierURL) elements.documentFisierURL.value = String(item.FisierURL || "");
  if (elements.documentObservatii) elements.documentObservatii.value = String(item.Observatii || "");
  if (elements.saveDocumentBtn) elements.saveDocumentBtn.textContent = "Actualizeaza document";
  if (elements.cancelDocumentEditBtn) elements.cancelDocumentEditBtn.classList.remove("hidden");
  if (elements.deleteDocumentBtn && hasDeleteAccess()) elements.deleteDocumentBtn.classList.remove("hidden");
  applyDocumentFilters();
  applyDocumentRoleRules(getSession());
  setDocumentMessage("Editezi documentul selectat din lista.", false);
}

function resetDocumentForm(clearMessage = true) {
  selectedDocumentId = "";
  if (elements.documentForm) elements.documentForm.reset();
  if (elements.documentID) elements.documentID.value = "";
  if (elements.saveDocumentBtn) elements.saveDocumentBtn.textContent = "Salveaza document";
  if (elements.cancelDocumentEditBtn) elements.cancelDocumentEditBtn.classList.add("hidden");
  if (elements.deleteDocumentBtn) elements.deleteDocumentBtn.classList.add("hidden");
  applyDocumentRoleRules(getSession());
  applyDocumentFilters();
  if (clearMessage) setDocumentMessage("", false);
}

async function loadDefectsModule() {
  if (!getSession()) {
    return;
  }

  try {
    const session = getSession();
    const response = await listDefectsData({
      role: session.Rol || "",
      userId: session.UserID || "",
      email: session.Email || "",
      linkedSoferId: session.LinkedSoferID || ""
    });

    if (response.ok && Array.isArray(response.data && response.data.items)) {
      defectsState = response.data.items;
      applyDefectFilters();
      setDefectMessage("", false);
      return;
    }

    defectsState = [];
    renderDefectsSection([]);
    setDefectMessage(response.message || "Lista de defecte nu este disponibila.", true);
  } catch (error) {
    defectsState = [];
    renderDefectsSection([]);
    setDefectMessage(getReadableError(error), true);
  }
}

function applyDefectFilters() {
  const masinaFilter = valueOf(elements.defectFilterMasina).toLowerCase();
  const soferFilter = valueOf(elements.defectFilterSofer).toLowerCase();
  const severitateFilter = valueOf(elements.defectFilterSeveritate).toUpperCase();

  renderDefectsSection(defectsState.filter((item) => {
    if (masinaFilter && !matchesVehicleFilter(item, masinaFilter)) return false;
    if (soferFilter && !String(item.SoferID || "").toLowerCase().includes(soferFilter)) return false;
    if (severitateFilter && String(item.Severitate || "").toUpperCase() !== severitateFilter) return false;
    return true;
  }));
}

function renderDefectsSection(items) {
  renderModuleTable(
    elements.defectsSectionBody,
    items,
    5,
    "Nu exista defecte disponibile.",
    (item) => `
      <tr class="trip-row${String(item.DefectID || "") === selectedDefectId ? " trip-row--active" : ""}" data-defect-id="${escapeHtml(item.DefectID || "")}">
        <td>${escapeHtml(item.DefectID || "-")}</td>
        <td>${escapeHtml(getVehicleDisplayLabel(item))}</td>
        <td>${escapeHtml(item.Titlu || "-")}</td>
        <td>${renderSeverityBadge(item.Severitate)}</td>
        <td>${renderStatusBadge(item.Status)}</td>
      </tr>
    `
  );

  bindRowSelection(elements.defectsSectionBody, ".trip-row", "data-defect-id", defectsState, "DefectID", populateDefectForm);
}

async function handleDefectSubmit(event) {
  event.preventDefault();
  const role = currentRole();
  if (!(role === "ADMIN" || isManagerLikeRole(role) || role === "SOFER")) return setDefectMessage("Rolul curent nu poate opera defecte.", true);

  const session = getSession();
  const linkedSoferId = getEffectiveLinkedSoferId(session);
  const resolvedVehicle = resolveVehicleReference(valueOf(elements.defectMasinaID));
  const vehicleSoferId = role === "SOFER"
    ? getDriverIdForVehicleReference(resolvedVehicle.nrInmatriculare || resolvedVehicle.masinaId, resolvedVehicle.masinaId)
    : "";
  const requestRole = role === "SOFER" && (linkedSoferId || vehicleSoferId || valueOf(elements.defectSoferID)) ? "SOFER_APP" : role;
  const payload = withSessionPayload({
    role: requestRole,
    DefectID: valueOf(elements.defectID) || generateSequentialId("DEF", defectsState, "DefectID"),
    MasinaID: resolvedVehicle.masinaId,
    SoferID: role === "SOFER" ? (linkedSoferId || vehicleSoferId || valueOf(elements.defectSoferID)) : valueOf(elements.defectSoferID),
    DataRaportare: valueOf(elements.defectDataRaportare),
    Titlu: valueOf(elements.defectTitlu),
    Severitate: valueOf(elements.defectSeveritate),
    Status: valueOf(elements.defectStatus),
    CostEstimat: numberOf(elements.defectCostEstimat),
    CostFinal: numberOf(elements.defectCostFinal),
    PozaURL: valueOf(elements.defectPozaURL),
    Descriere: valueOf(elements.defectDescriere)
  });

  if (role === "SOFER" && !payload.SoferID) {
    return setDefectMessage("Nu putem identifica automat soferul curent pentru masina selectata. Verifica asignarea activa a masinii.", true);
  }

  if (!payload.MasinaID || !payload.Titlu) {
    return setDefectMessage("Nr-ul de inmatriculare / masina si titlul sunt obligatorii.", true);
  }

  try {
    const isEditMode = Boolean(selectedDefectId);
    setDefectMessage(isEditMode ? "Se actualizeaza defectul..." : "Se salveaza defectul...", false);
    const response = await saveDefectData(payload, isEditMode);
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut salva defectul.");
    }

    setDefectMessage(isEditMode ? "Defectul a fost actualizat." : "Defectul a fost salvat.", false);
    resetDefectForm(false);
    await loadDefectsModule();
  } catch (error) {
    setDefectMessage(getReadableError(error), true);
  }
}

async function handleDeleteDefect() {
  if (!hasDeleteAccess()) return setDefectMessage("Doar ADMIN poate sterge defecte.", true);

  if (!selectedDefectId) {
    setDefectMessage("Selecteaza mai intai un rand din lista.", true);
    return;
  }

  try {
    setDefectMessage("Se sterge defectul...", false);
    const response = await deleteDefectData(withSessionPayload({ DefectID: selectedDefectId }));
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut sterge defectul.");
    }

    setDefectMessage("Defectul a fost sters.", false);
    resetDefectForm(false);
    await loadDefectsModule();
  } catch (error) {
    setDefectMessage(getReadableError(error), true);
  }
}

function populateDefectForm(item) {
  selectedDefectId = String(item.DefectID || "");
  if (elements.defectID) elements.defectID.value = selectedDefectId;
  if (elements.defectMasinaID) elements.defectMasinaID.value = getVehicleDisplayLabel(item);
  if (elements.defectSoferID && !elements.defectSoferID.readOnly) elements.defectSoferID.value = String(item.SoferID || "");
  if (elements.defectDataRaportare) elements.defectDataRaportare.value = normalizeDateInputForCompare(item.DataRaportare);
  if (elements.defectTitlu) elements.defectTitlu.value = String(item.Titlu || "");
  if (elements.defectSeveritate) elements.defectSeveritate.value = String(item.Severitate || "LOW");
  if (elements.defectStatus) elements.defectStatus.value = String(item.Status || "RAPORTAT");
  if (elements.defectCostEstimat) elements.defectCostEstimat.value = String(item.CostEstimat || "");
  if (elements.defectCostFinal) elements.defectCostFinal.value = String(item.CostFinal || "");
  if (elements.defectPozaURL) elements.defectPozaURL.value = String(item.PozaURL || "");
  if (elements.defectDescriere) elements.defectDescriere.value = String(item.Descriere || item.Rezolvare || "");
  if (elements.saveDefectBtn) elements.saveDefectBtn.textContent = "Actualizeaza defect";
  if (elements.cancelDefectEditBtn) elements.cancelDefectEditBtn.classList.remove("hidden");
  if (elements.deleteDefectBtn && hasDeleteAccess()) elements.deleteDefectBtn.classList.remove("hidden");
  applyDefectFilters();
  applyDefectRoleRules(getSession());
  setDefectMessage("Editezi defectul selectat din lista.", false);
}

function resetDefectForm(clearMessage = true) {
  selectedDefectId = "";
  if (elements.defectForm) elements.defectForm.reset();
  if (elements.defectID) elements.defectID.value = "";
  if (elements.saveDefectBtn) elements.saveDefectBtn.textContent = "Salveaza defect";
  if (elements.cancelDefectEditBtn) elements.cancelDefectEditBtn.classList.add("hidden");
  if (elements.deleteDefectBtn) elements.deleteDefectBtn.classList.add("hidden");
  applyDefectRoleRules(getSession());
  prefillDriverVehicleForOperationalForms();
  applyDefectFilters();
  if (clearMessage) setDefectMessage("", false);
}

function applyTripSheetFilters() {
  const masinaFilter = valueOf(elements.tripFilterMasina).toLowerCase();
  const soferFilter = valueOf(elements.tripFilterSofer).toLowerCase();
  const dataFilter = valueOf(elements.tripFilterData);
  const fallbackLatestDay = !masinaFilter && !soferFilter && !dataFilter ? getLatestCalendarDayKey(tripSheetsState, "DataPlecare") : "";

  const filtered = tripSheetsState.filter((item) => {
    const masinaLabel = String(getVehicleDisplayLabel(item) || "").toLowerCase();
    const masinaId = String(item.MasinaID || "").toLowerCase();
    const soferId = String(item.SoferID || "").toLowerCase();
    const dataPlecare = normalizeDateInputForCompare(item.DataPlecare);

    if (masinaFilter && !masinaId.includes(masinaFilter) && !masinaLabel.includes(masinaFilter)) {
      return false;
    }

    if (soferFilter && !soferId.includes(soferFilter)) {
      return false;
    }

    if (dataFilter && dataPlecare !== dataFilter) {
      return false;
    }

    if (fallbackLatestDay && dataPlecare !== fallbackLatestDay) {
      return false;
    }

    return true;
  });

  renderTripSheetsModule(filtered);
}

function renderTripSheetsModule(items) {
  if (!elements.tripSheetsModuleBody) {
    return;
  }

  if (!items.length) {
    elements.tripSheetsModuleBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-cell">Nu exista foi de parcurs disponibile.</td>
      </tr>
    `;
    return;
  }

  elements.tripSheetsModuleBody.innerHTML = items.map((item) => `
    <tr class="trip-row${String(item.FoaieParcursID || "") === selectedTripSheetId ? " trip-row--active" : ""}" data-trip-id="${escapeHtml(item.FoaieParcursID || "")}">
      <td>${escapeHtml(getVehicleDisplayLabel(item))}</td>
      <td>${escapeHtml(item.SoferID || "-")}</td>
      <td>${formatDate(item.DataPlecare)}</td>
      <td>${escapeHtml(item.Destinatie || "-")}</td>
      <td>${escapeHtml(item.ScopDeplasare || "-")}</td>
      <td>${formatKm(item.KmParcursi)}</td>
      <td>${renderStatusBadge(item.Status)}</td>
    </tr>
  `).join("");

  Array.from(elements.tripSheetsModuleBody.querySelectorAll(".trip-row")).forEach((row) => {
    row.addEventListener("click", () => {
      const tripId = row.getAttribute("data-trip-id") || "";
      const item = tripSheetsState.find((entry) => String(entry.FoaieParcursID || "") === tripId);
      if (item) {
        setActiveSection("foi-parcurs");
        populateTripSheetForm(item);
      }
    });
  });
}

async function handleCreateTripSheet(event) {
  event.preventDefault();
  const session = getSession();
  const role = String((session && session.Rol) || "").trim().toUpperCase();
  const sessionUserId = String((session && session.UserID) || "").trim();
  const sessionSoferId = getEffectiveLinkedSoferId(session);
  const forceCreate = role === "SOFER";
  const primaryVehicle = role === "SOFER" ? getPrimaryVehicleForSession(session) : null;
  const isEditMode = !forceCreate && Boolean(valueOf(elements.tripSheetId));
  const selectedItem = tripSheetsState.find((item) => String(item.FoaieParcursID || "") === String(valueOf(elements.tripSheetId) || "").trim()) || null;

  if (forceCreate) {
    selectedTripSheetId = "";
    if (elements.tripSheetId) {
      elements.tripSheetId.value = "";
    }
  }

  const resolvedVehicle = resolveVehicleReference(
    valueOf(elements.tripVehicleRef) || String((primaryVehicle && primaryVehicle.NrInmatriculare) || ""),
    valueOf(elements.tripMasinaID) || String((primaryVehicle && primaryVehicle.MasinaID) || "")
  );
  const latestTrip = isEditMode ? null : getLatestTripForVehicle(resolvedVehicle.masinaId || resolvedVehicle.nrInmatriculare);
  const autoKmPlecare = isEditMode
    ? (numberOf(elements.tripKmPlecare) || Number((selectedItem && selectedItem.KmPlecare) || 0))
    : (latestTrip ? Number(latestTrip.KmSosire || latestTrip.KmPlecare || 0) : getLatestVehicleKm(resolvedVehicle.masinaId || resolvedVehicle.nrInmatriculare));
  const autoLocPlecare = isEditMode
    ? String((selectedItem && selectedItem.LocPlecare) || "").trim()
    : (latestTrip ? String(latestTrip.Destinatie || latestTrip.LocPlecare || "").trim() : "");
  const activeAssignment = role === "SOFER"
    ? findBestAssignmentForVehicle(resolvedVehicle.nrInmatriculare || resolvedVehicle.masinaId, resolvedVehicle.masinaId)
    : null;
  const vehicleSoferId = role === "SOFER"
    ? getDriverIdForVehicleReference(resolvedVehicle.nrInmatriculare || resolvedVehicle.masinaId, resolvedVehicle.masinaId)
    : "";
  if (role === "SOFER" && primaryVehicle && resolvedVehicle.masinaId && String(primaryVehicle.MasinaID || "").trim() !== String(resolvedVehicle.masinaId || "").trim()) {
    setTripSheetMessage("Soferul poate opera doar masina asignata lui.", true);
    return;
  }
  if (role === "SOFER" && sessionSoferId && vehicleSoferId && sessionSoferId !== vehicleSoferId) {
    setTripSheetMessage("Legatura dintre user, sofer si masina nu este consistenta. Verifica asignarea activa.", true);
    return;
  }
  const effectiveSoferId = role === "SOFER"
    ? (
        vehicleSoferId ||
        String((activeAssignment && activeAssignment.SoferID) || "").trim() ||
        sessionSoferId ||
        valueOf(elements.tripSoferID)
      )
    : valueOf(elements.tripSoferID);
  const requestRole = role === "SOFER" && effectiveSoferId ? "SOFER_APP" : role;

  const payload = {
    role: requestRole,
    userId: sessionUserId,
    FoaieParcursID: forceCreate ? generateSequentialId("FOI", tripSheetsState, "FoaieParcursID") : (valueOf(elements.tripSheetId) || generateSequentialId("FOI", tripSheetsState, "FoaieParcursID")),
    MasinaID: resolvedVehicle.masinaId,
    NrInmatriculare: resolvedVehicle.nrInmatriculare,
    SoferID: effectiveSoferId,
    DataPlecare: valueOf(elements.tripDataPlecare),
    LocPlecare: autoLocPlecare,
    Destinatie: valueOf(elements.tripDestinatie),
    ScopDeplasare: valueOf(elements.tripScop),
    KmPlecare: autoKmPlecare,
    KmSosire: numberOf(elements.tripKmSosire),
    KmParcursi: 0,
    Status: valueOf(elements.tripStatus),
    KmPozaURL: valueOf(elements.tripKmPhotoUrl),
    KmOCR: numberOf(elements.tripOcrKm)
  };

  payload.KmParcursi = payload.KmSosire - payload.KmPlecare;

  if (role === "SOFER" && !payload.SoferID) {
    setTripSheetMessage("Nu putem identifica automat soferul curent pentru masina selectata. Verifica asignarea activa a masinii.", true);
    return;
  }

  if (!payload.MasinaID || (!payload.SoferID && role !== "SOFER") || !payload.DataPlecare || !payload.Destinatie) {
    setTripSheetMessage("Completeaza campurile obligatorii si foloseste un numar de inmatriculare cunoscut pentru masina.", true);
    return;
  }

  if (payload.KmPlecare < 0 || payload.KmSosire < 0) {
    setTripSheetMessage("Valorile KM trebuie sa fie pozitive.", true);
    return;
  }

  if (payload.KmSosire && payload.KmPlecare && payload.KmSosire < payload.KmPlecare) {
    setTripSheetMessage("KM sosire nu poate fi mai mic decat KM plecare.", true);
    return;
  }

    try {
    setTripSheetMessage(isEditMode ? "Se actualizeaza foaia de parcurs..." : "Se salveaza foaia de parcurs...", false);

    const response = await saveTripSheetData(payload, isEditMode);

    if (!response.ok) {
      throw new Error(response.message || "Nu am putut salva foaia de parcurs.");
    }

    setTripSheetMessage(isEditMode ? "Foaia de parcurs a fost actualizata." : "Foaia de parcurs a fost salvata.", false);
    resetTripSheetForm(false);
    await loadDashboard();
    await loadTripSheetsModule();
    await loadVehiclesModule();
  } catch (error) {
    setTripSheetMessage(getReadableError(error), true);
  }
}

function populateTripSheetForm(item) {
  selectedTripSheetId = String(item.FoaieParcursID || "");

  if (elements.tripSheetId) {
    elements.tripSheetId.value = selectedTripSheetId;
  }
  if (elements.tripMasinaID) {
    elements.tripMasinaID.value = String(item.MasinaID || "");
  }
  if (elements.tripVehicleRef) {
    elements.tripVehicleRef.value = getVehicleDisplayLabel(item);
  }
  if (elements.tripSoferID && !elements.tripSoferID.readOnly) {
    elements.tripSoferID.value = String(item.SoferID || "");
  }
  if (elements.tripDataPlecare) {
    elements.tripDataPlecare.value = normalizeDateInputForCompare(item.DataPlecare);
  }
  if (elements.tripDestinatie) {
    elements.tripDestinatie.value = String(item.Destinatie || "");
  }
  if (elements.tripScop) {
    elements.tripScop.value = String(item.ScopDeplasare || "");
  }
  if (elements.tripKmPlecare) {
    elements.tripKmPlecare.value = String(item.KmPlecare || "");
  }
  if (elements.tripKmSosire) {
    elements.tripKmSosire.value = String(item.KmSosire || "");
  }
  if (elements.tripStatus) {
    elements.tripStatus.value = String(item.Status || "RAPORTATA");
  }
  if (elements.tripKmPhotoUrl) {
    elements.tripKmPhotoUrl.value = String(item.KmPozaURL || item.PozaKmURL || "");
  }
  if (elements.tripKmPhotoFile) {
    elements.tripKmPhotoFile.value = "";
  }
  clearTripPhotoPreview();
  if (elements.tripOcrKm) {
    elements.tripOcrKm.value = String(item.KmOCR || item.KmValidatOCR || "");
  }
  if (elements.saveTripSheetBtn) {
    elements.saveTripSheetBtn.textContent = "Actualizeaza foaie";
  }
  if (elements.cancelTripEditBtn) {
    elements.cancelTripEditBtn.classList.remove("hidden");
  }
  if (elements.deleteTripSheetBtn && currentRole() === "ADMIN") {
    elements.deleteTripSheetBtn.classList.remove("hidden");
  }

  updateTripControlState();
  applyTripSheetFilters();
  setTripSheetMessage("Editezi foaia selectata din lista.", false);
}

async function handleDeleteTripSheet() {
  if (!hasDeleteAccess()) {
    setTripSheetMessage("Doar ADMIN poate sterge foi de parcurs.", true);
    return;
  }

  if (!selectedTripSheetId) {
    setTripSheetMessage("Selecteaza mai intai un rand din lista.", true);
    return;
  }

  try {
    setTripSheetMessage("Se sterge inregistrarea...", false);
    const response = await deleteTripSheetData(withSessionPayload({ FoaieParcursID: selectedTripSheetId }));
    if (!response.ok) {
      throw new Error(response.message || "Nu am putut sterge foaia de parcurs.");
    }

    setTripSheetMessage("Foaia de parcurs a fost stearsa.", false);
    resetTripSheetForm(false);
    await loadDashboard();
    await loadTripSheetsModule();
    await loadVehiclesModule();
  } catch (error) {
    setTripSheetMessage(getReadableError(error), true);
  }
}

function resetTripSheetForm(clearMessage = true) {
  selectedTripSheetId = "";

  if (elements.tripSheetForm) {
    elements.tripSheetForm.reset();
  }
  if (elements.tripSheetId) {
    elements.tripSheetId.value = "";
  }
  if (elements.saveTripSheetBtn) {
    elements.saveTripSheetBtn.textContent = "Salveaza foaie";
  }
  if (elements.cancelTripEditBtn) {
    elements.cancelTripEditBtn.classList.add("hidden");
  }
  if (elements.deleteTripSheetBtn) {
    elements.deleteTripSheetBtn.classList.add("hidden");
  }
  if (elements.tripMasinaID) {
    elements.tripMasinaID.value = "";
  }
  if (elements.tripOcrKm) {
    elements.tripOcrKm.value = "";
  }
  if (elements.tripKmPhotoFile) {
    elements.tripKmPhotoFile.value = "";
  }
  clearTripPhotoPreview();

  applyTripSheetRoleRules(getSession());
  updateTripControlState();
  prefillDriverVehicleForOperationalForms();
  applyTripSheetFilters();

  if (clearMessage) {
    setTripSheetMessage("", false);
  }
}

function renderInsights(cards, extra) {
  const totalFoiParcurs = Number(cards.totalFoiParcurs || 0);
  const kmTotalParcurs = Number(cards.kmTotalParcurs || 0);
  const documenteExpirate = Number(cards.documenteExpirate || 0);
  const documente30 = Number(cards.documenteExpiraIn30Zile || 0);
  const documenteCritice = Number(cards.documenteExpiraIn7Zile || 0);
  const defecteDeschise = Number(extra.defecteDeschise || 0);

  setElementText(
    elements.operationalStatusText,
    [
      `${formatNumber(totalFoiParcurs)} foi de parcurs`,
      `${formatKm(kmTotalParcurs)}`,
      `${formatNumber(defecteDeschise)} defecte active`
    ].join(" | ")
  );

  if (documenteCritice > 0 || documenteExpirate > 0) {
    setElementText(
      elements.priorityStatusText,
      `${formatNumber(documenteExpirate)} expirate si ${formatNumber(documenteCritice)} documente critice in 7 zile necesita actiune imediata.`
    );
    return;
  }

  setElementText(
    elements.priorityStatusText,
    `${formatNumber(documente30)} documente expira in 30 zile. Niciun document critic momentan.`
  );
}

function renderFuelTable(items) {
  if (!elements.fuelTableBody) {
    return;
  }

  if (!items.length) {
    elements.fuelTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-cell">Nu exista alimentari.</td>
      </tr>
    `;
    return;
  }

  elements.fuelTableBody.innerHTML = items.map((item) => `
    <tr>
      <td>${escapeHtml(getVehicleDisplayLabel(item))}</td>
      <td>${escapeHtml(item.SoferID || "-")}</td>
      <td>${formatDateTime(item.DataAlimentare)}</td>
      <td>${formatNumber(item.CantitateLitri)} L</td>
      <td>${formatCurrency(item.CostTotal)}</td>
    </tr>
  `).join("");
}

function renderTripTable(items) {
  if (!elements.tripTableBody) {
    return;
  }

  if (!items.length) {
    elements.tripTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-cell">Nu exista foi de parcurs.</td>
      </tr>
    `;
    return;
  }

  elements.tripTableBody.innerHTML = items.map((item) => `
    <tr>
      <td>${escapeHtml(getVehicleDisplayLabel(item))}</td>
      <td>${escapeHtml(item.SoferID || "-")}</td>
      <td>${formatDate(item.DataPlecare)}</td>
      <td>${escapeHtml(item.Destinatie || "-")}</td>
      <td>${formatKm(item.KmParcursi)}</td>
    </tr>
  `).join("");
}

function renderDocumentsTable(items) {
  if (!elements.documentsTableBody) {
    return;
  }

  if (!items.length) {
    elements.documentsTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-cell">Nu exista documente in expirare.</td>
      </tr>
    `;
    return;
  }

  elements.documentsTableBody.innerHTML = items.map((item) => `
    <tr>
      <td>${escapeHtml(getVehicleDisplayLabel(item))}</td>
      <td>${escapeHtml(item.TipDocument || "-")}</td>
      <td>${formatDate(item.DataExpirare)}</td>
      <td>${formatDays(item.zileRamase)}</td>
      <td>${renderLevelBadge(item.nivel)}</td>
    </tr>
  `).join("");
}

function renderDefectsTable(items) {
  if (!elements.defectsTableBody) {
    return;
  }

  if (!items.length) {
    elements.defectsTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-cell">Nu exista defecte raportate.</td>
      </tr>
    `;
    return;
  }

  elements.defectsTableBody.innerHTML = items.map((item) => `
    <tr>
      <td>${escapeHtml(getVehicleDisplayLabel(item))}</td>
      <td>${escapeHtml(item.SoferID || "-")}</td>
      <td>${formatDate(item.DataRaportare)}</td>
      <td>${escapeHtml(item.Titlu || "-")}</td>
      <td>${renderSeverityBadge(item.Severitate)}</td>
      <td>${renderStatusBadge(item.Status)}</td>
    </tr>
  `).join("");
}

function renderRevisionsTable(items) {
  if (!elements.revisionsTableBody) {
    return;
  }

  if (!items.length) {
    elements.revisionsTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-cell">Nu exista revizii.</td>
      </tr>
    `;
    return;
  }

  elements.revisionsTableBody.innerHTML = items.map((item) => `
    <tr>
      <td>${escapeHtml(getVehicleDisplayLabel(item))}</td>
      <td>${formatDate(item.DataRevizie)}</td>
      <td>${formatKm(item.KmLaRevizie)}</td>
      <td>${escapeHtml(item.TipRevizie || "-")}</td>
      <td>${escapeHtml(item.Service || "-")}</td>
      <td>${formatCurrency(item.Cost)}</td>
    </tr>
  `).join("");
}

function renderSeverityBadge(value) {
  const normalized = String(value || "").toUpperCase();

  if (normalized === "CRITICA" || normalized === "CRITIC" || normalized === "HIGH" || normalized === "CRITICAL") {
    return `<span class="badge badge--severe">${escapeHtml(normalized || "CRITICA")}</span>`;
  }

  if (normalized === "MEDIE" || normalized === "MEDIU" || normalized === "MEDIUM") {
    return `<span class="badge badge--medium">${escapeHtml(normalized || "MEDIE")}</span>`;
  }

  if (normalized === "MICA" || normalized === "MIC" || normalized === "LOW") {
    return `<span class="badge badge--low">${escapeHtml(normalized || "MICA")}</span>`;
  }

  return `<span class="badge badge--neutral">${escapeHtml(normalized || "INFO")}</span>`;
}

function renderStatusBadge(value) {
  const normalized = String(value || "").toUpperCase();

  if (normalized === "REZOLVAT" || normalized === "INCHIS" || normalized === "INCHEIATA") {
    return `<span class="badge badge--success">${escapeHtml(normalized)}</span>`;
  }

  if (
    normalized === "DESCHIS" ||
    normalized === "DESCHISA" ||
    normalized === "DESCHISĂ" ||
    normalized === "RAPORTAT" ||
    normalized === "NOU" ||
    normalized === "ACTIVA"
  ) {
    return `<span class="badge badge--critic">${escapeHtml(normalized)}</span>`;
  }

  if (normalized === "IN LUCRU" || normalized === "IN_VERIFICARE" || normalized === "IN_REPARATIE") {
    return `<span class="badge badge--urgent">${escapeHtml(normalized)}</span>`;
  }

  return `<span class="badge badge--neutral">${escapeHtml(normalized || "-")}</span>`;
}

function renderLevelBadge(level) {
  const normalized = String(level || "").toUpperCase();

  if (normalized === "EXPIRAT") {
    return `<span class="badge badge--expirat">EXPIRAT</span>`;
  }

  if (normalized === "CRITIC") {
    return `<span class="badge badge--critic">CRITIC</span>`;
  }

  if (normalized === "URGENT") {
    return `<span class="badge badge--urgent">URGENT</span>`;
  }

  if (normalized === "ATENTIE") {
    return `<span class="badge badge--atentie">ATENTIE</span>`;
  }

  return `<span class="badge badge--info">INFO</span>`;
}

function toggleDashboardCardVisibility(valueElementId, visible) {
  const valueElement = elements[valueElementId];
  if (!valueElement) {
    return;
  }
  const card = valueElement.closest(".stat-card");
  if (card) {
    card.classList.toggle("hidden", !visible);
  }
}

function getItemsFromResponse(response) {
  return response && response.ok && Array.isArray(response.data && response.data.items) ? response.data.items : [];
}

function sumItemsByField(items, fieldName) {
  return (items || []).reduce((total, item) => total + Number(item && item[fieldName] ? item[fieldName] : 0), 0);
}

function sortItemsByDateDesc(items, fieldName) {
  return (items || []).slice().sort((a, b) => {
    const dateA = parseDateValue(a && a[fieldName]);
    const dateB = parseDateValue(b && b[fieldName]);
    return (dateB ? dateB.getTime() : 0) - (dateA ? dateA.getTime() : 0);
  });
}

function buildFrontendDocumentRows(items) {
  return (items || []).map((item) => {
    const expDate = parseDateValue(item.DataExpirare);
    const zileRamase = expDate ? diffDaysFrontend(new Date(), expDate) : null;
    return {
      MasinaID: getVehicleDisplayLabel(item),
      TipDocument: item.TipDocument || "-",
      DataExpirare: item.DataExpirare || "",
      zileRamase,
      nivel: buildFrontendLevel(zileRamase)
    };
  }).filter((item) => item.zileRamase !== null && item.zileRamase <= 30);
}

function buildFrontendVehicleDocumentRows(items) {
  const results = [];
  (items || []).forEach((item) => {
    [
      { field: "ITPExpiraLa", label: "ITP" },
      { field: "RCAExpiraLa", label: "RCA" },
      { field: "RovinietaExpiraLa", label: "Rovinieta" }
    ].forEach((doc) => {
      const expDate = parseDateValue(item[doc.field]);
      if (!expDate) {
        return;
      }
      const zileRamase = diffDaysFrontend(new Date(), expDate);
      if (zileRamase > 30) {
        return;
      }
      results.push({
        MasinaID: getVehicleDisplayLabel(item),
        TipDocument: doc.label,
        DataExpirare: item[doc.field],
        zileRamase,
        nivel: buildFrontendLevel(zileRamase)
      });
    });
  });
  return results;
}

function diffDaysFrontend(fromDate, toDate) {
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const end = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function buildFrontendLevel(days) {
  if (days === null || Number.isNaN(Number(days))) return "INFO";
  if (days < 0) return "EXPIRAT";
  if (days <= 7) return "CRITIC";
  if (days <= 14) return "URGENT";
  if (days <= 30) return "ATENTIE";
  return "INFO";
}

function normalizeVehicleKey(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

function buildVehicleIdFromPlate(plate) {
  const normalized = normalizeVehicleKey(plate).replace(/[^A-Z0-9]/g, "");
  return normalized ? `MAS-${normalized.slice(0, 6)}` : "";
}

function generateSequentialId(prefix, items, fieldName) {
  const maxValue = (items || []).reduce((maxId, item) => {
    const raw = String(item && item[fieldName] ? item[fieldName] : "").trim().toUpperCase();
    const match = raw.match(/(\d+)$/);
    if (!match) {
      return maxId;
    }
    return Math.max(maxId, Number(match[1]));
  }, 0);

  return `${prefix}-${String(maxValue + 1).padStart(3, "0")}`;
}

function findVehicleByReference(reference) {
  const normalized = normalizeVehicleKey(reference);
  if (!normalized) {
    return null;
  }

  return vehiclesState.find((item) => {
    return normalizeVehicleKey(item.MasinaID) === normalized || normalizeVehicleKey(item.NrInmatriculare) === normalized;
  }) || null;
}

function resolveVehicleReference(reference, fallbackMasinaId = "") {
  const vehicle = findVehicleByReference(reference) || findVehicleByReference(fallbackMasinaId);
  return {
    vehicle,
    masinaId: vehicle ? String(vehicle.MasinaID || "").trim() : String(fallbackMasinaId || "").trim(),
    nrInmatriculare: vehicle ? String(vehicle.NrInmatriculare || "").trim() : String(reference || "").trim()
  };
}

function handleVehicleLookupInput(event) {
  const input = event && event.target;
  if (!input) {
    return;
  }

  const lookupType = String(input.dataset.vehicleLookup || "").trim();
  const vehicle = findVehicleByReference(input.value);

  if (lookupType === "vehicle") {
    handleVehicleFormLookup(input.value, vehicle);
    return;
  }

  if (!vehicle) {
    if (lookupType === "trip") {
      updateTripControlState();
    }
    return;
  }

  if (lookupType === "assignment") {
    if (elements.assignmentMasinaID) elements.assignmentMasinaID.value = String(vehicle.NrInmatriculare || "");
    if (elements.assignmentSoferID && !valueOf(elements.assignmentSoferID)) elements.assignmentSoferID.value = String(getDriverIdForVehicleReference(vehicle.NrInmatriculare || vehicle.MasinaID, vehicle.MasinaID) || "");
    return;
  }

  if (lookupType === "fuel") {
    if (elements.fuelMasinaID) elements.fuelMasinaID.value = String(vehicle.NrInmatriculare || "");
    if (elements.fuelSoferID && !valueOf(elements.fuelSoferID)) elements.fuelSoferID.value = String(getDriverIdForVehicleReference(vehicle.NrInmatriculare || vehicle.MasinaID, vehicle.MasinaID) || "");
    if (elements.fuelKmLaAlimentare && !valueOf(elements.fuelKmLaAlimentare)) elements.fuelKmLaAlimentare.value = String(getLatestVehicleKm(vehicle) || "");
    return;
  }

  if (lookupType === "trip") {
    if (elements.tripVehicleRef) elements.tripVehicleRef.value = String(vehicle.NrInmatriculare || "");
    if (elements.tripMasinaID) elements.tripMasinaID.value = String(vehicle.MasinaID || "");
    if (elements.tripSoferID && !elements.tripSoferID.readOnly && !valueOf(elements.tripSoferID)) {
      elements.tripSoferID.value = String(vehicle.SoferCurentID || "");
    }
    updateTripControlState();
    return;
  }

  if (lookupType === "document") {
    if (elements.documentMasinaID) elements.documentMasinaID.value = String(vehicle.NrInmatriculare || "");
    return;
  }

  if (lookupType === "defect") {
    if (elements.defectMasinaID) elements.defectMasinaID.value = String(vehicle.NrInmatriculare || "");
    if (elements.defectSoferID && !elements.defectSoferID.readOnly && !valueOf(elements.defectSoferID)) {
      elements.defectSoferID.value = String(vehicle.SoferCurentID || "");
    }
  }
}

function getPrimaryVehicleForSession(user = getSession()) {
  const linkedSoferId = getEffectiveLinkedSoferId(user);
  const typedVehicle = findVehicleByReference(valueOf(elements.tripVehicleRef) || valueOf(elements.tripMasinaID));

  if (linkedSoferId && typedVehicle) {
    const typedVehicleDriverId = getDriverIdForVehicleReference(typedVehicle.NrInmatriculare || typedVehicle.MasinaID, typedVehicle.MasinaID);
    if (typedVehicleDriverId && typedVehicleDriverId === linkedSoferId) {
      return typedVehicle;
    }
  }

  const activeAssignment = linkedSoferId
    ? assignmentsState.find((item) => {
        const sameDriver = String(item.SoferID || "").trim() === linkedSoferId;
        const status = String(item.Status || "").trim().toUpperCase();
        return sameDriver && ["ACTIVA", "ACTIV"].includes(status);
      })
    : null;

  if (activeAssignment) {
    return vehiclesState.find((item) => String(item.MasinaID || "").trim() === String(activeAssignment.MasinaID || "").trim()) || null;
  }

  if (linkedSoferId) {
    const directVehicle = vehiclesState.find((item) => String(item.SoferCurentID || "").trim() === linkedSoferId) || null;
    if (directVehicle) {
      return directVehicle;
    }
  }

  if (!linkedSoferId && typedVehicle) {
    return typedVehicle;
  }
  return null;
}

function getEffectiveLinkedSoferId(user = getSession()) {
  const directId = String((user && user.LinkedSoferID) || "").trim();
  if (directId) {
    return directId;
  }

  const userId = String((user && user.UserID) || "").trim();
  if (!userId) {
    return "";
  }

  const driver = driversState.find((item) => String(item.UserID || "").trim() === userId);
  return driver ? String(driver.SoferID || "").trim() : "";
}

function matchAssignmentToVehicle(item, resolvedVehicle) {
  const assignmentMasinaId = normalizeVehicleKey(item && item.MasinaID);
  const assignmentVehicleLabel = normalizeVehicleKey(getVehicleDisplayLabel(item || {}));
  const assignmentPlate = normalizeVehicleKey(item && item.NrInmatriculare);
  const targetMasinaId = normalizeVehicleKey(resolvedVehicle && resolvedVehicle.masinaId);
  const targetPlate = normalizeVehicleKey(resolvedVehicle && resolvedVehicle.nrInmatriculare);

  return Boolean(
    (targetMasinaId && assignmentMasinaId && targetMasinaId === assignmentMasinaId) ||
    (targetPlate && assignmentPlate && targetPlate === assignmentPlate) ||
    (targetPlate && assignmentVehicleLabel && targetPlate === assignmentVehicleLabel)
  );
}

function findBestAssignmentForVehicle(reference, fallbackMasinaId = "") {
  const resolvedVehicle = resolveVehicleReference(reference, fallbackMasinaId);
  if (!resolvedVehicle.masinaId && !resolvedVehicle.nrInmatriculare) {
    return null;
  }

  const matches = assignmentsState
    .filter((item) => String(item.SoferID || "").trim() && matchAssignmentToVehicle(item, resolvedVehicle))
    .sort((left, right) => {
      const leftActive = ["ACTIVA", "ACTIV"].includes(String(left.Status || "").trim().toUpperCase()) ? 1 : 0;
      const rightActive = ["ACTIVA", "ACTIV"].includes(String(right.Status || "").trim().toUpperCase()) ? 1 : 0;
      if (leftActive !== rightActive) {
        return rightActive - leftActive;
      }
      const leftDate = new Date(left.DataStart || 0).getTime();
      const rightDate = new Date(right.DataStart || 0).getTime();
      return rightDate - leftDate;
    });

  return matches[0] || null;
}

function getDriverIdForVehicleReference(reference, fallbackMasinaId = "") {
  const resolvedVehicle = resolveVehicleReference(reference, fallbackMasinaId);
  const vehicleDriverId = String((resolvedVehicle.vehicle && resolvedVehicle.vehicle.SoferCurentID) || "").trim();
  if (vehicleDriverId) {
    return vehicleDriverId;
  }

  const assignment = findBestAssignmentForVehicle(reference, fallbackMasinaId);
  if (assignment) {
    return String(assignment.SoferID || "").trim();
  }

  return "";
}

function handleVehicleFormLookup(reference, vehicle) {
  const typedPlate = String(reference || "").trim();

  if (vehicle) {
    populateVehicleForm(vehicle);
    if (elements.vehicleNrInmatriculare) {
      elements.vehicleNrInmatriculare.value = String(vehicle.NrInmatriculare || "");
    }
    setVehicleMessage("Datele existente pentru numarul de inmatriculare au fost preluate automat.", false);
    return;
  }

  if (selectedVehicleId) {
    resetVehicleForm(false);
  }

  if (elements.vehicleNrInmatriculare) {
    elements.vehicleNrInmatriculare.value = typedPlate;
  }
  if (elements.vehicleMasinaID) {
    elements.vehicleMasinaID.value = "";
  }
  if (elements.vehicleKmCurenti) {
    const derivedKm = getLatestVehicleKm(typedPlate);
    if (!valueOf(elements.vehicleKmCurenti) || derivedKm > 0) {
      elements.vehicleKmCurenti.value = String(derivedKm || "");
    }
    elements.vehicleKmCurenti.readOnly = false;
  }
  setVehicleMessage("", false);
}

function isDuplicateVehiclePlate(plate, currentVehicleId = "") {
  const normalizedPlate = normalizeVehicleKey(plate);
  const currentId = String(currentVehicleId || "").trim();

  if (!normalizedPlate) {
    return false;
  }

  return vehiclesState.some((item) => {
    const sameVehicle = currentId && String(item.MasinaID || "").trim() === currentId;
    if (sameVehicle) {
      return false;
    }
    return normalizeVehicleKey(item.NrInmatriculare) === normalizedPlate;
  });
}

function getVehicleDisplayLabel(itemOrReference) {
  if (itemOrReference && typeof itemOrReference === "object") {
    if (itemOrReference.NrInmatriculare) {
      return String(itemOrReference.NrInmatriculare || "-");
    }
    const refVehicle = findVehicleByReference(itemOrReference.MasinaID || itemOrReference.NrInmatriculare || "");
    return refVehicle ? String(refVehicle.NrInmatriculare || refVehicle.MasinaID || "-") : String(itemOrReference.MasinaID || "-");
  }

  const vehicle = findVehicleByReference(itemOrReference);
  return vehicle ? String(vehicle.NrInmatriculare || vehicle.MasinaID || "-") : String(itemOrReference || "-");
}

function matchesVehicleFilter(item, filterValue) {
  const filter = normalizeVehicleKey(filterValue);
  if (!filter) {
    return true;
  }

  const displayLabel = normalizeVehicleKey(getVehicleDisplayLabel(item));
  const masinaId = normalizeVehicleKey(item && item.MasinaID);
  const nr = normalizeVehicleKey(item && item.NrInmatriculare);

  return displayLabel.includes(filter) || masinaId.includes(filter) || nr.includes(filter);
}

function getTripSheetsForVehicle(reference, excludingTripId = "") {
  const resolved = resolveVehicleReference(reference, reference);
  const masinaId = normalizeVehicleKey(resolved.masinaId);
  const plate = normalizeVehicleKey(resolved.nrInmatriculare);
  const excluded = String(excludingTripId || "").trim();

  return tripSheetsState.filter((item) => {
    if (excluded && String(item.FoaieParcursID || "").trim() === excluded) {
      return false;
    }
    const itemMasinaId = normalizeVehicleKey(item.MasinaID);
    const itemPlate = normalizeVehicleKey(item.NrInmatriculare);
    return (masinaId && itemMasinaId === masinaId) || (plate && itemPlate === plate);
  });
}

function getLatestVehicleKm(reference) {
  const latestTrip = getLatestTripForVehicle(reference);
  if (!latestTrip) {
    return 0;
  }

  const kmSosire = Number(latestTrip.KmSosire || 0);
  const kmPlecare = Number(latestTrip.KmPlecare || 0);
  return kmSosire || kmPlecare || 0;
}

function getLatestTripForVehicle(reference, excludingTripId = "") {
  const tripEntries = getTripSheetsForVehicle(reference, excludingTripId);
  if (!tripEntries.length) {
    return null;
  }

  return tripEntries
    .slice()
    .sort((left, right) => {
      const leftDate = parseDateValue(left.DataPlecare);
      const rightDate = parseDateValue(right.DataPlecare);
      const timeDiff = (rightDate ? rightDate.getTime() : 0) - (leftDate ? leftDate.getTime() : 0);
      if (timeDiff !== 0) {
        return timeDiff;
      }

      const leftId = String(left.FoaieParcursID || "");
      const rightId = String(right.FoaieParcursID || "");
      return rightId.localeCompare(leftId, undefined, { numeric: true, sensitivity: "base" });
    })[0];
}

function getLatestVehicleStartLocation(reference, excludingTripId = "") {
  const latestTrip = getLatestTripForVehicle(reference, excludingTripId);
  if (!latestTrip) {
    return "";
  }

  return String(latestTrip.Destinatie || latestTrip.LocPlecare || "").trim();
}

function canExportReports() {
  const role = currentRole();
  return role === "ADMIN" || isManagerLikeRole(role);
}

function ensureExportAccess(setMessage) {
  if (!canExportReports()) {
    setMessage("Doar ADMIN, MANAGER si OFFICE pot exporta rapoarte.", true);
    return false;
  }
  return true;
}

function ensureTankExportAccess(setMessage) {
  const role = currentRole();
  if (!(role === "ADMIN" || role === "MANAGER" || role === "OFFICE")) {
    setMessage("Doar ADMIN, MANAGER si OFFICE pot exporta istoricul bazinului.", true);
    return false;
  }
  return true;
}

function filterItemsByVehicleAndDate(items, resolvedVehicle, dateField, dateFrom, dateTo) {
  const masinaId = normalizeVehicleKey(resolvedVehicle.masinaId);
  const nr = normalizeVehicleKey(resolvedVehicle.nrInmatriculare);
  const hasVehicleFilter = Boolean(masinaId || nr);

  return (items || []).filter((item) => {
    const itemMasinaId = normalizeVehicleKey(item.MasinaID);
    const itemNr = normalizeVehicleKey(item.NrInmatriculare || getVehicleDisplayLabel(item));
    const sameVehicle = !hasVehicleFilter || (masinaId && itemMasinaId === masinaId) || (nr && itemNr === nr);
    if (!sameVehicle) return false;

    const compareDate = normalizeDateInputForCompare(item[dateField]);
    if (dateFrom && compareDate && compareDate < dateFrom) return false;
    if (dateTo && compareDate && compareDate > dateTo) return false;
    return true;
  });
}

function sortItemsByDateAsc(items, fieldName) {
  return (items || []).slice().sort((a, b) => {
    const dateA = normalizeDateInputForCompare(a[fieldName]) || "";
    const dateB = normalizeDateInputForCompare(b[fieldName]) || "";
    return dateA.localeCompare(dateB);
  });
}

function calculateFuelConsumptionSummary(resolvedVehicle, dateFrom, dateTo) {
  const filteredFuel = sortItemsByDateAsc(
    filterItemsByVehicleAndDate(fuelEntriesState, resolvedVehicle, "DataAlimentare", dateFrom, dateTo),
    "DataAlimentare"
  );
  const filteredTrips = sortItemsByDateAsc(
    filterItemsByVehicleAndDate(tripSheetsState, resolvedVehicle, "DataPlecare", dateFrom, dateTo),
    "DataPlecare"
  );

  const totalLiters = filteredFuel.reduce((sum, item) => sum + Number(item.CantitateLitri || 0), 0);
  const totalTripKm = filteredTrips.reduce((sum, item) => sum + Number(item.KmParcursi || 0), 0);
  const consumption = totalTripKm > 0 ? (totalLiters / totalTripKm) * 100 : 0;

  return {
    filteredFuel,
    filteredTrips,
    totalLiters,
    totalTripKm,
    consumption
  };
}

function buildVehicleBundleReportCsv(vehicle, range, trips, fuels, defects, documents) {
  const lines = [];
  lines.push(csvLine(["Raport masina", vehicle.nrInmatriculare || vehicle.masinaId || "-"]));
  lines.push(csvLine(["Interval", range.from || "-", range.to || "-"]));
  lines.push("");

  lines.push(csvLine(["FOI PARCURS"]));
  lines.push(csvLine(["Data", "Destinatie", "Scop", "KM plecare", "KM sosire", "Status"]));
  trips.forEach((item) => {
    lines.push(csvLine([
      formatDate(item.DataPlecare),
      item.Destinatie || "",
      item.ScopDeplasare || "",
      item.KmPlecare || "",
      item.KmSosire || "",
      item.Status || ""
    ]));
  });
  lines.push("");

  lines.push(csvLine(["ALIMENTARI"]));
  lines.push(csvLine(["Data", "Sofer", "Litri", "Cost total", "Statie", "Tip combustibil"]));
  fuels.forEach((item) => {
    lines.push(csvLine([
      formatDate(item.DataAlimentare),
      item.SoferID || "",
      item.CantitateLitri || "",
      item.CostTotal || "",
      item.Statie || "",
      item.TipCombustibil || ""
    ]));
  });
  lines.push("");

  lines.push(csvLine(["DEFECTE"]));
  lines.push(csvLine(["Data", "Titlu", "Severitate", "Status", "Cost estimat", "Cost final"]));
  defects.forEach((item) => {
    lines.push(csvLine([
      formatDate(item.DataRaportare),
      item.Titlu || "",
      item.Severitate || "",
      item.Status || "",
      item.CostEstimat || "",
      item.CostFinal || ""
    ]));
  });
  lines.push("");

  lines.push(csvLine(["DOCUMENTE"]));
  lines.push(csvLine(["Tip document", "Data emitere", "Data expirare", "Status", "Furnizor"]));
  documents.forEach((item) => {
    lines.push(csvLine([
      item.TipDocument || "",
      formatDate(item.DataEmitere),
      formatDate(item.DataExpirare),
      item.Status || "",
      item.Furnizor || ""
    ]));
  });

  return "\uFEFF" + lines.join("\r\n");
}

function buildFlatCsv(title, rows, columns, options = {}) {
  const lines = [];
  lines.push(csvLine([title]));
  (options.summaryLines || []).forEach((line) => {
    lines.push(csvLine([line]));
  });
  if ((options.summaryLines || []).length) {
    lines.push("");
  }
  lines.push(csvLine(columns.map((column) => column.label)));
  (rows || []).forEach((row) => {
    lines.push(csvLine(columns.map((column) => {
      const value = typeof column.value === "function" ? column.value(row) : row[column.value];
      return value == null ? "" : value;
    })));
  });
  return "\uFEFF" + lines.join("\r\n");
}

function buildHtmlTable(title, rows, columns, options = {}) {
  const head = columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("");
  const body = (rows || []).map((row) => {
    const tds = columns.map((column) => {
      const value = typeof column.value === "function" ? column.value(row) : row[column.value];
      return `<td>${escapeHtml(value == null ? "" : String(value))}</td>`;
    }).join("");
    return `<tr>${tds}</tr>`;
  }).join("");
  const summary = (options.summaryLines || []).length
    ? `<div style="margin-bottom:16px;">${options.summaryLines.map((line) => `<p style="margin:4px 0;">${escapeHtml(line)}</p>`).join("")}</div>`
    : "";

  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#e2e8f0}h1{margin-bottom:16px}</style></head><body><h1>${escapeHtml(title)}</h1>${summary}<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
}

function downloadExcelFile(content, filename) {
  downloadTextFile(content, filename, "application/vnd.ms-excel;charset=utf-8;");
}

function downloadPdfFromHtml(title, html) {
  const printWindow = window.open("", "_blank", "width=1024,height=768");
  if (!printWindow) {
    throw new Error("Browserul a blocat fereastra pentru PDF. Permite pop-up pentru aplicatie.");
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => {
    printWindow.print();
  }, 250);
}

async function handleExportVehicles(format) {
  if (!ensureExportAccess(setVehicleReportMessage)) return;
  if (!(await refreshReportSources(["vehicles"], setVehicleReportMessage))) return;

  const vehicleFilter = valueOf(elements.reportVehicleRef).toLowerCase();
  const statusFilter = valueOf(elements.reportVehicleStatus).toUpperCase();
  const rows = vehiclesState.filter((item) => {
    if (vehicleFilter && !matchesVehicleFilter(item, vehicleFilter)) return false;
    if (statusFilter && String(item.Status || "").toUpperCase() !== statusFilter) return false;
    return true;
  });

  const columns = [
    { label: "MasinaID", value: "MasinaID" },
    { label: "NrInmatriculare", value: "NrInmatriculare" },
    { label: "Marca", value: "Marca" },
    { label: "Model", value: "Model" },
    { label: "Status", value: "Status" },
    { label: "KmCurenti", value: (row) => row.KmCurentiDerivati || row.KmCurenti || "" },
    { label: "SoferCurentID", value: "SoferCurentID" }
  ];
  exportRowsByFormat("Raport masini", rows, columns, format, "masini", setVehicleReportMessage);
}

async function handleExportDrivers(format) {
  if (!ensureExportAccess(setDriverReportMessage)) return;
  if (!(await refreshReportSources(["drivers"], setDriverReportMessage))) return;

  const nameFilter = valueOf(elements.reportDriverName).toLowerCase();
  const statusFilter = valueOf(elements.reportDriverStatus).toUpperCase();
  const rows = driversState.filter((item) => {
    if (nameFilter && !String(item.Nume || "").toLowerCase().includes(nameFilter)) return false;
    if (statusFilter && String(item.Status || "").toUpperCase() !== statusFilter) return false;
    return true;
  });

  const columns = [
    { label: "SoferID", value: "SoferID" },
    { label: "UserID", value: "UserID" },
    { label: "Nume", value: "Nume" },
    { label: "Telefon", value: "Telefon" },
    { label: "CategoriePermis", value: "CategoriePermis" },
    { label: "Status", value: "Status" }
  ];
  exportRowsByFormat("Raport soferi", rows, columns, format, "soferi", setDriverReportMessage);
}

async function handleExportAssignments(format) {
  if (!ensureExportAccess(setAssignmentReportMessage)) return;
  if (!(await refreshReportSources(["assignments", "vehicles"], setAssignmentReportMessage))) return;

  const resolvedVehicle = resolveVehicleReference(valueOf(elements.reportAssignmentVehicleRef));
  const rows = filterItemsByVehicleAndDate(
    assignmentsState,
    resolvedVehicle,
    "DataStart",
    valueOf(elements.reportAssignmentDateFrom),
    valueOf(elements.reportAssignmentDateTo)
  );
  const columns = [
    { label: "AsignareID", value: "AsignareID" },
    { label: "Masina", value: (row) => getVehicleDisplayLabel(row) },
    { label: "MasinaID", value: "MasinaID" },
    { label: "SoferID", value: "SoferID" },
    { label: "DataStart", value: (row) => formatDate(row.DataStart) },
    { label: "Status", value: "Status" },
    { label: "MotivIncheiere", value: "MotivIncheiere" },
    { label: "Observatii", value: "Observatii" }
  ];
  exportRowsByFormat("Raport asignari", rows, columns, format, "asignari", setAssignmentReportMessage);
}

async function handleExportFuel(format) {
  if (!ensureExportAccess(setFuelReportMessage)) return;
  if (!(await refreshReportSources(["fuel", "vehicles"], setFuelReportMessage))) return;

  const resolvedVehicle = resolveVehicleReference(valueOf(elements.reportFuelVehicleRef));
  const rows = filterItemsByVehicleAndDate(
    fuelEntriesState,
    resolvedVehicle,
    "DataAlimentare",
    valueOf(elements.reportFuelDateFrom),
    valueOf(elements.reportFuelDateTo)
  );
  const columns = [
    { label: "AlimentareID", value: "AlimentareID" },
    { label: "Masina", value: (row) => getVehicleDisplayLabel(row) },
    { label: "SoferID", value: "SoferID" },
    { label: "DataAlimentare", value: (row) => formatDate(row.DataAlimentare) },
    { label: "CantitateLitri", value: "CantitateLitri" },
    { label: "CostTotal", value: "CostTotal" },
    { label: "Statie", value: "Statie" }
  ];
  exportRowsByFormat("Raport alimentari", rows, columns, format, "alimentari", setFuelReportMessage);
}

async function handleExportTrips(format) {
  if (!ensureExportAccess(setTripReportMessage)) return;
  if (!(await refreshReportSources(["trips", "vehicles"], setTripReportMessage))) return;

  const resolvedVehicle = resolveVehicleReference(valueOf(elements.reportTripVehicleRef));
  const rows = sortItemsByDateAsc(filterItemsByVehicleAndDate(
    tripSheetsState,
    resolvedVehicle,
    "DataPlecare",
    valueOf(elements.reportTripDateFrom),
    valueOf(elements.reportTripDateTo)
  ), "DataPlecare");
  const totalKm = rows.reduce((sum, item) => sum + Number(item.KmParcursi || 0), 0);
    const columns = [
        { label: "FoaieParcursID", value: "FoaieParcursID" },
        { label: "Masina", value: (row) => getVehicleDisplayLabel(row) },
        { label: "SoferID", value: "SoferID" },
      { label: "DataPlecare", value: (row) => formatDate(row.DataPlecare) },
      { label: "Destinatie", value: "Destinatie" },
      { label: "ScopDeplasare", value: "ScopDeplasare" },
    { label: "KmPlecare", value: "KmPlecare" },
      { label: "KmSosire", value: "KmSosire" },
      { label: "KmParcursi", value: "KmParcursi" },
        { label: "Status", value: "Status" }
      ];
  exportRowsByFormat(
    "Raport foi parcurs",
    rows,
    columns,
    format,
    "foi-parcurs",
    setTripReportMessage,
    {
      summaryLines: [
        `Filtru masina: ${resolvedVehicle.nrInmatriculare || "Toate masinile"}`,
        `Interval: ${valueOf(elements.reportTripDateFrom) || "-"} -> ${valueOf(elements.reportTripDateTo) || "-"}`,
        `KM total efectuati: ${formatNumber(totalKm)} km`
      ]
    }
  );
}

async function handleExportDefects(format) {
  if (!ensureExportAccess(setDefectReportMessage)) return;
  if (!(await refreshReportSources(["defects", "vehicles"], setDefectReportMessage))) return;

  const resolvedVehicle = resolveVehicleReference(valueOf(elements.reportDefectVehicleRef));
  const rows = filterItemsByVehicleAndDate(
    defectsState,
    resolvedVehicle,
    "DataRaportare",
    valueOf(elements.reportDefectDateFrom),
    valueOf(elements.reportDefectDateTo)
  );
  const columns = [
    { label: "DefectID", value: "DefectID" },
    { label: "Masina", value: (row) => getVehicleDisplayLabel(row) },
    { label: "SoferID", value: "SoferID" },
    { label: "DataRaportare", value: (row) => formatDate(row.DataRaportare) },
    { label: "Titlu", value: "Titlu" },
    { label: "Severitate", value: "Severitate" },
    { label: "Status", value: "Status" }
  ];
  exportRowsByFormat("Raport defecte", rows, columns, format, "defecte", setDefectReportMessage);
}

function handleFuelConsumptionCalculation() {
  if (!ensureExportAccess(setFuelConsumptionMessage)) return;

  refreshReportSources(["fuel", "trips", "vehicles"], setFuelConsumptionMessage)
    .then((ok) => {
      if (!ok) return;

      const resolvedVehicle = resolveVehicleReference(valueOf(elements.fuelConsumptionVehicleRef));
      const dateFrom = valueOf(elements.fuelConsumptionDateFrom);
      const dateTo = valueOf(elements.fuelConsumptionDateTo);

      if (!resolvedVehicle.masinaId && !resolvedVehicle.nrInmatriculare) {
        setFuelConsumptionMessage("Alege o masina cunoscuta pentru calculul consumului.", true);
        return;
      }

      const summary = calculateFuelConsumptionSummary(resolvedVehicle, dateFrom, dateTo);
      if (!summary.filteredFuel.length && !summary.filteredTrips.length) {
        setFuelConsumptionMessage("Nu exista alimentari sau foi de parcurs pentru filtrele selectate.", true);
        return;
      }

      if (!summary.totalTripKm) {
        setFuelConsumptionMessage(`Masina ${resolvedVehicle.nrInmatriculare || resolvedVehicle.masinaId}: ${formatNumber(summary.totalLiters)} L alimentati, dar fara KM suficienti pentru calcul.`, true);
        return;
      }

      setFuelConsumptionMessage(
        `Masina ${resolvedVehicle.nrInmatriculare || resolvedVehicle.masinaId}: ${formatNumber(summary.totalLiters)} L, ${formatNumber(summary.totalTripKm)} km, consum mediu ${summary.consumption.toFixed(2)} L/100 km.`,
        false
      );
    });
}

function exportRowsByFormat(title, rows, columns, format, filenameBase, setMessage, options = {}) {
  if (!rows.length) {
    setMessage("Nu exista date pentru filtrele selectate.", true);
    return;
  }

  try {
    setMessage("Se pregateste exportul...", false);
    if (format === "pdf") {
      downloadPdfFromHtml(title, buildHtmlTable(title, rows, columns, options));
      setMessage("Raportul PDF este pregatit pentru tiparire/salvare.", false);
      return;
    }

    downloadExcelFile(buildFlatCsv(title, rows, columns, options), `${filenameBase}.xls`);
    setMessage("Raportul Excel a fost exportat.", false);
  } catch (error) {
    setMessage(getReadableError(error), true);
  }
}

function csvLine(values) {
  return (values || []).map((value) => {
    const text = String(value == null ? "" : value).replace(/"/g, "\"\"");
    return `"${text}"`;
  }).join(",");
}

function downloadTextFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType || "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function syncVehicleDerivedMetrics() {
  if (!vehiclesState.length) {
    return;
  }

  vehiclesState = vehiclesState.map((item) => {
    const latestKm = getLatestVehicleKm(item);
    return {
      ...item,
      KmCurentiDerivati: latestKm || Number(item.KmCurenti || 0)
    };
  });

  if (selectedVehicleId) {
    const selected = vehiclesState.find((item) => String(item.MasinaID || "") === selectedVehicleId);
    if (selected && elements.vehicleKmCurenti) {
      elements.vehicleKmCurenti.value = String(selected.KmCurentiDerivati || 0);
    }
  }
}

function updateTripControlState() {
  const vehicleReference = valueOf(elements.tripVehicleRef) || valueOf(elements.tripMasinaID);
  const resolved = resolveVehicleReference(vehicleReference, valueOf(elements.tripMasinaID));
  const latestTrip = getLatestTripForVehicle(resolved.masinaId || resolved.nrInmatriculare, selectedTripSheetId);
  const latestKm = latestTrip ? Number(latestTrip.KmSosire || latestTrip.KmPlecare || 0) : getLatestVehicleKm(resolved.masinaId || resolved.nrInmatriculare);
  const latestStartLocation = latestTrip ? String(latestTrip.Destinatie || latestTrip.LocPlecare || "").trim() : "";
  const isMobileDriver = document.body.classList.contains("mobile-driver-mode");
  if (elements.tripMasinaID) {
    elements.tripMasinaID.value = resolved.masinaId;
  }

  if (elements.tripVehicleRef && resolved.nrInmatriculare && document.activeElement !== elements.tripVehicleRef) {
    elements.tripVehicleRef.value = resolved.nrInmatriculare;
  }

  if (elements.tripKmPlecare && !valueOf(elements.tripKmPlecare) && latestKm > 0) {
    elements.tripKmPlecare.value = String(latestKm);
  }

  if (elements.tripControlHint) {
    const parts = [];
    if (resolved.nrInmatriculare) {
      parts.push(`Masina selectata: ${resolved.nrInmatriculare}`);
    }
    if (latestKm > 0) {
      parts.push(`Ultimul KM cunoscut: ${formatNumber(latestKm)}`);
    }
    if (latestStartLocation) {
      parts.push(`Loc plecare automat: ${latestStartLocation}`);
    }
    if (isMobileDriver) {
      parts.push("Poza de bord este optionala.");
    }
    elements.tripControlHint.textContent = parts.join(" | ");
  }
}

function formatNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("ro-RO").format(number);
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 2
  }).format(number);
}

function formatKm(value) {
  const number = Number(value || 0);
  return `${new Intl.NumberFormat("ro-RO").format(number)} km`;
}

function formatDays(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "-";
  }

  if (number < 0) {
    return `${Math.abs(number)} zile trecute`;
  }

  if (number === 0) {
    return "azi";
  }

  if (number === 1) {
    return "1 zi";
  }

  return `${number} zile`;
}

function formatDate(value) {
  const date = parseDateValue(value);

  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function formatDateTime(value) {
  const date = parseDateValue(value);

  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function parseDateValue(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function setLoginMessage(message, isError) {
  if (!elements.loginMessage) {
    return;
  }

  elements.loginMessage.textContent = message;
  elements.loginMessage.style.color = isError ? "#fca5a5" : "#93c5fd";
}

function setTripSheetMessage(message, isError) {
  if (!elements.tripSheetMessage) {
    return;
  }

  elements.tripSheetMessage.textContent = message;
  elements.tripSheetMessage.style.color = isError ? "#fca5a5" : "#93c5fd";
}

function setVehicleMessage(message, isError) {
  if (!elements.vehicleMessage) {
    return;
  }

  elements.vehicleMessage.textContent = message;
  elements.vehicleMessage.style.color = isError ? "#fca5a5" : "#93c5fd";
}

function setVehicleReportMessage(message, isError) {
  setInlineMessage(elements.vehicleReportMessage, message, isError);
}

function setDriverReportMessage(message, isError) {
  setInlineMessage(elements.driverReportMessage, message, isError);
}

function setFuelReportMessage(message, isError) {
  setInlineMessage(elements.fuelReportMessage, message, isError);
}

function setFuelConsumptionMessage(message, isError) {
  setInlineMessage(elements.fuelConsumptionMessage, message, isError);
}

function setTripReportMessage(message, isError) {
  setInlineMessage(elements.tripReportMessage, message, isError);
}

function setAssignmentReportMessage(message, isError) {
  setInlineMessage(elements.assignmentReportMessage, message, isError);
}

function setDefectReportMessage(message, isError) {
  setInlineMessage(elements.defectReportMessage, message, isError);
}

function setDriverMessage(message, isError) {
  setInlineMessage(elements.driverMessage, message, isError);
}

function setUserMessage(message, isError) {
  setInlineMessage(elements.userMessage, message, isError);
}

function setAssignmentMessage(message, isError) {
  setInlineMessage(elements.assignmentMessage, message, isError);
}

function setFuelMessage(message, isError) {
  setInlineMessage(elements.fuelMessage, message, isError);
}

function setFuelTankMessage(message, isError) {
  setInlineMessage(elements.fuelTankMessage, message, isError);
}

function setFuelUtilityMessage(message, isError) {
  setInlineMessage(elements.fuelUtilityMessage, message, isError);
}

function setTankUtilityReportMessage(message, isError) {
  setInlineMessage(elements.tankUtilityReportMessage, message, isError);
}

function setFuelTankHistoryMessage(message, isError) {
  setInlineMessage(elements.tankHistoryMessage, message, isError);
}

function setTankReportMessage(message, isError) {
  setInlineMessage(elements.tankReportMessage, message, isError);
}

function setDocumentMessage(message, isError) {
  setInlineMessage(elements.documentMessage, message, isError);
}

function setDefectMessage(message, isError) {
  setInlineMessage(elements.defectMessage, message, isError);
}

function setInlineMessage(element, message, isError) {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.style.color = isError ? "#fca5a5" : "#93c5fd";
}

function currentRole() {
  return String(((getSession() || {}).Rol) || "").trim().toUpperCase();
}

function isManagerLikeRole(role) {
  const normalizedRole = String(role || "").trim().toUpperCase();
  return normalizedRole === "MANAGER" || normalizedRole === "OFFICE";
}

function hasEditAccess() {
  const role = currentRole();
  return role === "ADMIN" || isManagerLikeRole(role);
}

function hasDeleteAccess() {
  return currentRole() === "ADMIN";
}

function withSessionPayload(payload) {
  const session = getSession() || {};
  return {
    role: session.Rol || "",
    userId: session.UserID || "",
    email: session.Email || "",
    ...(payload || {})
  };
}

function bindRowSelection(container, selector, attributeName, state, key, callback) {
  if (!container) {
    return;
  }

  Array.from(container.querySelectorAll(selector)).forEach((row) => {
    row.addEventListener("click", () => {
      const targetId = row.getAttribute(attributeName) || "";
      const item = state.find((entry) => String(entry[key] || "") === targetId);
      if (item) {
        callback(item);
      }
    });
  });
}

function renderModuleTable(body, items, colspan, emptyText, rowBuilder) {
  if (!body) {
    return;
  }

  if (!items.length) {
    body.innerHTML = `
      <tr>
        <td colspan="${colspan}" class="empty-cell">${emptyText}</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = items.map(rowBuilder).join("");
}

function setStateByKey(stateKey, value) {
  if (stateKey === "fuelTanksState") fuelTanksState = value;
  if (stateKey === "fuelTankTransactionsState") fuelTankTransactionsState = value;
  if (stateKey === "driversState") driversState = value;
  if (stateKey === "usersState") usersState = value;
  if (stateKey === "assignmentsState") assignmentsState = value;
  if (stateKey === "fuelEntriesState") fuelEntriesState = value;
  if (stateKey === "documentsState") documentsState = value;
  if (stateKey === "defectsState") defectsState = value;
}

function clearOperationalState() {
  tripSheetsState = [];
  selectedTripSheetId = "";
  vehiclesState = [];
  selectedVehicleId = "";
  driversState = [];
  selectedDriverId = "";
  usersState = [];
  selectedUserId = "";
  assignmentsState = [];
  selectedAssignmentId = "";
  fuelEntriesState = [];
  selectedFuelEntryId = "";
  fuelTanksState = [];
  fuelTankTransactionsState = [];
  documentsState = [];
  selectedDocumentId = "";
  defectsState = [];
  selectedDefectId = "";
}

function valueOf(element) {
  return element ? String(element.value || "").trim() : "";
}

function numberOf(element) {
  const value = valueOf(element);
  return value ? Number(value) : 0;
}

function normalizeDateInputForCompare(value) {
  const date = parseDateValue(value);
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLatestCalendarDayKey(items, fieldName) {
  return (items || []).reduce((latest, item) => {
    const key = normalizeDateInputForCompare(item && item[fieldName]);
    if (!key) {
      return latest;
    }
    return !latest || key > latest ? key : latest;
  }, "");
}

function setElementText(element, value) {
  if (!element) {
    return;
  }

  element.textContent = value;
}

function showLoading(show) {
  if (elements.loadingState) {
    elements.loadingState.classList.toggle("hidden", !show);
  }
}

function showError(message) {
  if (elements.errorState) {
    elements.errorState.textContent = message;
    elements.errorState.classList.remove("hidden");
  }

  if (elements.successState) {
    elements.successState.classList.add("hidden");
  }
}

function showSuccess(message) {
  if (elements.successState) {
    elements.successState.textContent = message;
    elements.successState.classList.remove("hidden");
  }

  if (elements.errorState) {
    elements.errorState.classList.add("hidden");
  }
}

function hideMessages() {
  if (elements.errorState) {
    elements.errorState.classList.add("hidden");
  }

  if (elements.successState) {
    elements.successState.classList.add("hidden");
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
