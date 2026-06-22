function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  template.requestId = (e && e.parameter && e.parameter.requestId) || '';
  template.portalUrl = PORTAL_URL;
  return template
    .evaluate()
    .setTitle('出張申請')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function filterTripLists_(userEmail) {
  userEmail = String(userEmail || '').trim().toLowerCase();
  var all = readTripRows_();
  var myTrips = [];
  var pendingApprovals = [];
  for (var i = 0; i < all.length; i++) {
    var row = all[i];
    if (row.applicantEmail === userEmail) myTrips.push(row);
    if (row.status === TRIP_STATUS.SUBMITTED && row.approverEmail === userEmail) {
      pendingApprovals.push(row);
    }
  }
  myTrips.sort(function(a, b) { return (b.updatedAt || '').localeCompare(a.updatedAt || ''); });
  pendingApprovals.sort(function(a, b) { return (a.requestDate || '').localeCompare(b.requestDate || ''); });
  return { myTrips: myTrips, pendingApprovals: pendingApprovals };
}

/** 起動時の軽量データ（申請一覧シートは読まない） */
function getBootstrapAppData() {
  var userEmail = getCurrentUserEmail_();
  var employee = findEmployeeByEmail(userEmail);
  return {
    userEmail: userEmail,
    employee: employee,
    workflowRoutes: getAvailableWorkflowRoutes(),
    workflowLinked: isWorkflowLinked_(),
    statusLabels: TRIP_STATUS,
    settlementLabels: SETTLEMENT_STATUS
  };
}

/** 申請一覧・承認待ち（シート1回読み） */
function getTripListAppData() {
  var userEmail = getCurrentUserEmail_();
  return filterTripLists_(userEmail);
}

/** 申請可否チェック（重い処理を起動後に分離） */
function getSubmitReadinessApi() {
  var userEmail = getCurrentUserEmail_();
  var employee = findEmployeeByEmail(userEmail);
  return getSubmitReadiness_(userEmail, employee);
}

function getInitialAppData() {
  var userEmail = getCurrentUserEmail_();
  var employee = findEmployeeByEmail(userEmail);
  var lists = filterTripLists_(userEmail);
  return {
    userEmail: userEmail,
    employee: employee,
    isApprover: lists.pendingApprovals.length > 0,
    myTrips: lists.myTrips,
    pendingApprovals: lists.pendingApprovals,
    statusLabels: TRIP_STATUS,
    settlementLabels: SETTLEMENT_STATUS,
    workflowRoutes: getAvailableWorkflowRoutes(),
    workflowLinked: isWorkflowLinked_(),
    submitReadiness: getSubmitReadiness_(userEmail, employee)
  };
}

function previewTripWorkflowRouteApi(routeId, applicantEmail) {
  return previewWorkflowRoute_(routeId, applicantEmail || getCurrentUserEmail_());
}
