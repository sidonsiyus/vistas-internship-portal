import React, { useState } from 'react';
import { 
  Sheet, 
  Link, 
  Copy, 
  Check, 
  ExternalLink, 
  HelpCircle, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';
import Modal from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { testGoogleSheetWebhook, sanitizeAppsScriptUrl, exportInternshipWorkbook } from '../../../utils/internshipExcelSync';

export default function GoogleSheetConfigModal({ isOpen, onClose }) {
  const { 
    googleSheetWebhookUrl, 
    setGoogleSheetWebhookUrl, 
    syncWithGoogleSheet, 
    pushClassToGoogleSheet, 
    pushAllClassesToGoogleSheet,
    internshipRecords = [],
    selectedClassIncharge,
    lastGSheetSyncTime,
    showToast 
  } = useApp();

  const [urlInput, setUrlInput] = useState(googleSheetWebhookUrl || '');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPushingAll, setIsPushingAll] = useState(false);

  // Resilient, Two-Way Google Apps Script (Supports Brand New or Existing Google Sheets)
  const appsScriptCode = `/**
 * VISTAS Portal Two-Way Google Sheet Synchronizer
 * Handles:
 * 1. PING: Test connectivity & return sheet name + tab list
 * 2. SYNC_ALL_CLASSES: One-click setup of all 14 class tabs + Overview dashboard
 * 3. BATCH_UPDATE_CLASS: Push single class updates from portal to Google Sheet
 * 4. UPDATE_STUDENT_INTERNSHIP: Push single student record updates
 * 5. GET: Pull latest spreadsheet rows into portal
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = e.parameter ? e.parameter.sheetName : null;
    var callback = e.parameter ? e.parameter.callback : null;
    var outputData = null;
    
    // Connectivity Ping
    if (e.parameter && e.parameter.action === "PING") {
      outputData = { 
        status: "success", 
        message: "Connected to Google Sheet: " + ss.getName(),
        sheets: ss.getSheets().map(function(s) { return s.getName(); })
      };
    } else if (sheetName) {
      // Pull specific class
      var sheet = findSheet(ss, sheetName);
      var rows = getSheetRecords(sheet);
      outputData = { 
        status: "success", 
        sheetName: sheet.getName(), 
        records: rows 
      };
    } else {
      // Pull all classes (skips Overview & Dashboard tabs)
      var allRecords = [];
      var sheets = ss.getSheets();
      for (var s = 0; s < sheets.length; s++) {
        var sName = sheets[s].getName();
        if (sName.toLowerCase().indexOf('overview') !== -1 || sName.toLowerCase().indexOf('dashboard') !== -1) {
          continue;
        }
        allRecords = allRecords.concat(getSheetRecords(sheets[s]));
      }
      outputData = { 
        status: "success", 
        records: allRecords 
      };
    }

    if (callback) {
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(outputData) + ");")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(JSON.stringify(outputData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    var errObj = { status: "error", message: err.toString() };
    if (e && e.parameter && e.parameter.callback) {
      return ContentService.createTextOutput(e.parameter.callback + "(" + JSON.stringify(errObj) + ");")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(JSON.stringify(errObj))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : null;
    var data = null;
    
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (parseErr) {
        data = e.parameter;
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    if (!data) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No data payload received" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. PING Connectivity Test
    if (data.action === "PING") {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Connected to Google Sheet: " + ss.getName(),
        sheets: ss.getSheets().map(function(s) { return s.getName(); })
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. FRESH SETUP: SYNC ALL 14 CLASSES & DASHBOARD AT ONCE
    if (data.action === "SYNC_ALL_CLASSES" && Array.isArray(data.classes)) {
      var summaryList = [];
      var totalSynced = 0;

      for (var c = 0; c < data.classes.length; c++) {
        var cData = data.classes[c];
        var cSheet = findSheet(ss, cData.className);
        var recs = cData.records || [];
        
        formatAndPopulateSheet(cSheet, cData.className, recs);
        totalSynced += recs.length;
        
        var comp = recs.filter(function(r) { return (r.status || '').toLowerCase().indexOf('complete') !== -1; }).length;
        var ong = recs.filter(function(r) { return (r.status || '').toLowerCase().indexOf('ongoing') !== -1; }).length;
        var notSt = recs.length - comp - ong;
        var certs = recs.filter(function(r) { 
          var cert = (r.certificateCollected || '').toLowerCase();
          return cert === 'yes' || cert === 'collected';
        }).length;

        summaryList.push([
          cData.className,
          recs.length,
          comp,
          ong,
          notSt,
          certs,
          recs.length > 0 ? Math.round((comp / recs.length) * 100) + "%" : "0%"
        ]);
      }

      // Build Overview & Summary dashboard tab
      buildOverviewSheet(ss, summaryList);

      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Synchronized " + data.classes.length + " classes with " + totalSynced + " students into Google Sheet!",
        totalSynced: totalSynced,
        classesCount: data.classes.length
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var sheet = findSheet(ss, data.sheetName);
    var colMap = getColumnMapping(sheet);
    
    // 3. BATCH UPDATE SINGLE CLASS
    if (data.action === "BATCH_UPDATE_CLASS" && Array.isArray(data.records)) {
      var updatedCount = 0;
      for (var k = 0; k < data.records.length; k++) {
        var rec = data.records[k];
        var rIdx = findRowIndex(sheet, rec.regNo, rec.studentName, colMap);
        writeRowWithColMap(sheet, rIdx, colMap, rec);
        updatedCount++;
      }
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        updatedCount: updatedCount, 
        sheetName: sheet.getName() 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 4. SINGLE STUDENT UPDATE
    var rowIndex = findRowIndex(sheet, data.regNo, data.studentName, colMap);
    writeRowWithColMap(sheet, rowIndex, colMap, data);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      rowIndex: rowIndex, 
      sheetName: sheet.getName(),
      studentName: data.studentName
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Resilient Sheet Tab Finder: Matches casing, trailing spaces, or creates if missing
function findSheet(ss, sheetName) {
  if (!sheetName) return ss.getSheets()[0];
  
  var cleanTarget = String(sheetName).trim().toLowerCase();
  var sheets = ss.getSheets();

  // If brand new spreadsheet with only empty 'Sheet1', rename it!
  if (sheets.length === 1 && sheets[0].getName().toLowerCase() === 'sheet1' && sheets[0].getLastRow() <= 1) {
    sheets[0].setName(sheetName);
    formatHeaders(sheets[0]);
    return sheets[0];
  }

  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().trim().toLowerCase() === cleanTarget) {
      return sheets[i];
    }
  }
  
  var alphaTarget = cleanTarget.replace(/[^a-z0-9]/g, '');
  for (var j = 0; j < sheets.length; j++) {
    var alphaName = sheets[j].getName().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (alphaName === alphaTarget) {
      return sheets[j];
    }
  }
  
  // Tab doesn't exist, create it with standardized columns
  var newSheet = ss.insertSheet(sheetName);
  formatHeaders(newSheet);
  return newSheet;
}

// Format Headers cleanly with Dark Navy background, white bold text, freeze row 1
function formatHeaders(sheet) {
  var headers = [
    "REG NO", "NAME", "COMPANY NAME", "LOCATION",
    "START DATE", "END DATE", "DURATION", "ATTENDANCE",
    "STATUS", "CERTIFICATE COLLECTED", "REMARKS"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0F172A");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

// Bulk Populates a Sheet Tab cleanly
function formatAndPopulateSheet(sheet, sheetName, records) {
  var headers = [
    "REG NO", "NAME", "COMPANY NAME", "LOCATION",
    "START DATE", "END DATE", "DURATION", "ATTENDANCE",
    "STATUS", "CERTIFICATE COLLECTED", "REMARKS"
  ];

  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0F172A");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  if (records && records.length > 0) {
    var rows = records.map(function(r) {
      return [
        String(r.regNo || '').replace('.0','').trim(),
        r.studentName || '',
        r.companyName || '',
        r.location || '',
        r.startDate || '',
        r.endDate || '',
        r.duration || '',
        r.attendance || '',
        r.status || 'Not Started',
        r.certificateCollected || 'No',
        r.remarks || ''
      ];
    });
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    sheet.getRange(2, 1, rows.length, 1).setNumberFormat("@");
    sheet.getRange(2, 9, rows.length, 2).setHorizontalAlignment("center");
  }

  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }
}

// Creates / Updates Overview & Summary Dashboard tab
function buildOverviewSheet(ss, summaryList) {
  var overviewSheet = ss.getSheetByName("Overview & Summary");
  if (!overviewSheet) {
    overviewSheet = ss.insertSheet("Overview & Summary", 0);
  } else {
    overviewSheet.clear();
  }

  var titleRange = overviewSheet.getRange(1, 1, 1, 7);
  titleRange.merge();
  titleRange.setValue("VELS INSTITUTE OF SCIENCE, TECHNOLOGY & ADVANCED STUDIES (VISTAS) - INTERNSHIP DASHBOARD");
  titleRange.setBackground("#1E3A8A");
  titleRange.setFontColor("#FFFFFF");
  titleRange.setFontWeight("bold");
  titleRange.setHorizontalAlignment("center");

  var subRange = overviewSheet.getRange(2, 1, 1, 7);
  subRange.merge();
  subRange.setValue("Two-Way Live Tracking Database • Synced on: " + Utilities.formatDate(new Date(), "GMT+05:30", "dd/MM/yyyy HH:mm:ss"));
  subRange.setBackground("#F1F5F9");
  subRange.setFontColor("#475569");
  subRange.setFontSize(9);
  subRange.setHorizontalAlignment("center");

  var headers = ["Class / Section", "Total Enrolled", "Completed", "Ongoing", "Not Started", "Certs Collected", "Completion Rate"];
  overviewSheet.getRange(4, 1, 1, headers.length).setValues([headers]);
  var hdrRange = overviewSheet.getRange(4, 1, 1, headers.length);
  hdrRange.setBackground("#0F172A");
  hdrRange.setFontColor("#FFFFFF");
  hdrRange.setFontWeight("bold");
  hdrRange.setHorizontalAlignment("center");

  if (summaryList && summaryList.length > 0) {
    overviewSheet.getRange(5, 1, summaryList.length, headers.length).setValues(summaryList);
    overviewSheet.getRange(5, 2, summaryList.length, 6).setHorizontalAlignment("center");
  }

  for (var c = 1; c <= headers.length; c++) {
    overviewSheet.autoResizeColumn(c);
  }
}

// Dynamic Header Column Mapping: Detects exact column structure for any class (e.g. AERO 2A vs BBA 2C with SNO)
function getColumnMapping(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length === 0) return null;
  
  var headerRowIdx = 0;
  for (var r = 0; r < Math.min(4, data.length); r++) {
    var rowText = data[r].join(' ').toUpperCase();
    if (rowText.includes('REG') || rowText.includes('NAME') || rowText.includes('COMPANY')) {
      headerRowIdx = r;
      break;
    }
  }

  var headers = data[headerRowIdx];
  var map = {
    headerRowIdx: headerRowIdx,
    sno: -1,
    regNo: -1,
    studentName: -1,
    companyName: -1,
    location: -1,
    startDate: -1,
    endDate: -1,
    duration: -1,
    attendance: -1,
    status: -1,
    certificateCollected: -1,
    remarks: -1,
    totalCols: headers.length
  };

  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || '').toUpperCase().trim();
    if (!h) continue;

    if (h === 'SNO' || h === 'S.NO' || h === 'SL' || h === 'SL NO' || h === 'SI.NO' || h === 'S NO' || h === 'S. NO') {
      map.sno = c;
    } else if (h.includes('REG') || h.includes('ROLL') || h.includes('REGISTER')) {
      map.regNo = c;
    } else if (h.includes('ATTEND')) {
      map.attendance = c;
    } else if (h.includes('STUDENT') || h === 'NAME' || h.includes('NAME OF')) {
      map.studentName = c;
    } else if (h.includes('COMP') || h.includes('ORGAN') || h.includes('FIRM') || h.includes('INDUSTRY')) {
      map.companyName = c;
    } else if (h.includes('LOC') || h.includes('CITY') || h.includes('PLACE')) {
      map.location = c;
    } else if (h.includes('START') || h.includes('FROM')) {
      map.startDate = c;
    } else if ((h.includes('END') && !h.includes('ATTEND')) || h.includes('TO DATE')) {
      map.endDate = c;
    } else if (h.includes('DUR') || h.includes('PERIOD') || h.includes('DAYS')) {
      map.duration = c;
    } else if (h.includes('STATUS')) {
      map.status = c;
    } else if (h.includes('CERT')) {
      map.certificateCollected = c;
    } else if (h.includes('REMARK') || h.includes('NOTE') || h.includes('COMMENT')) {
      map.remarks = c;
    }
  }

  // Fallbacks if not found by header text
  if (map.regNo === -1) map.regNo = (map.sno === 0) ? 1 : 0;
  if (map.studentName === -1) map.studentName = (map.regNo === 1) ? 2 : 1;
  if (map.companyName === -1) map.companyName = map.studentName + 1;
  if (map.location === -1) map.location = map.companyName + 1;
  if (map.startDate === -1) map.startDate = map.location + 1;
  if (map.endDate === -1) map.endDate = map.startDate + 1;
  if (map.duration === -1) map.duration = map.endDate + 1;
  if (map.attendance === -1) map.attendance = map.duration + 1;
  if (map.status === -1) map.status = map.attendance + 1;
  if (map.certificateCollected === -1) map.certificateCollected = map.status + 1;
  if (map.remarks === -1) map.remarks = map.certificateCollected + 1;

  return map;
}

// Resilient Row Finder: searches designated regNo column and studentName column
function findRowIndex(sheet, regNo, studentName, colMap) {
  var values = sheet.getDataRange().getValues();
  var startRow = (colMap && colMap.headerRowIdx !== undefined) ? colMap.headerRowIdx + 1 : 1;
  if (values.length <= startRow) return -1;
  
  var cleanReg = String(regNo || '').replace('.0', '').replace(/[^0-9]/g, '').trim();
  var cleanName = String(studentName || '').toLowerCase().trim();
  var regCol = (colMap && colMap.regNo >= 0) ? colMap.regNo : 0;
  var nameCol = (colMap && colMap.studentName >= 0) ? colMap.studentName : 1;

  if (cleanReg) {
    for (var r = startRow; r < values.length; r++) {
      var cellReg = String(values[r][regCol] || '').replace('.0', '').replace(/[^0-9]/g, '').trim();
      if (cellReg && cellReg === cleanReg) {
        return r + 1;
      }
    }
    if (regCol !== 0) {
      for (var r1 = startRow; r1 < values.length; r1++) {
        var cell0 = String(values[r1][0] || '').replace('.0', '').replace(/[^0-9]/g, '').trim();
        if (cell0 && cell0 === cleanReg) return r1 + 1;
      }
    }
  }
  
  if (cleanName && cleanName.length > 2) {
    for (var k = startRow; k < values.length; k++) {
      var rowName = String(values[k][nameCol] || values[k][1] || values[k][0] || '').toLowerCase().trim();
      if (rowName === cleanName || (rowName.length > 4 && (cleanName.includes(rowName) || rowName.includes(cleanName)))) {
        return k + 1;
      }
    }
  }
  
  return -1;
}

// Write row matching that specific class tab's exact column layout
function writeRowWithColMap(sheet, rowIndex, colMap, rec) {
  var numCols = Math.max(sheet.getLastColumn(), colMap.totalCols, 11);
  if (colMap.sno >= 0 && numCols < 12) numCols = 12;

  if (sheet.getMaxColumns() < numCols) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), numCols - sheet.getMaxColumns());
  }

  if (rowIndex > 0) {
    var rowRange = sheet.getRange(rowIndex, 1, 1, numCols);
    var rowVals = rowRange.getValues()[0];

    if (colMap.regNo >= 0) rowVals[colMap.regNo] = String(rec.regNo || '').replace('.0','').trim();
    if (colMap.studentName >= 0) rowVals[colMap.studentName] = rec.studentName || '';
    if (colMap.companyName >= 0) rowVals[colMap.companyName] = rec.companyName || '';
    if (colMap.location >= 0) rowVals[colMap.location] = rec.location || '';
    if (colMap.startDate >= 0) rowVals[colMap.startDate] = rec.startDate || '';
    if (colMap.endDate >= 0) rowVals[colMap.endDate] = rec.endDate || '';
    if (colMap.duration >= 0) rowVals[colMap.duration] = rec.duration || '';
    if (colMap.attendance >= 0) rowVals[colMap.attendance] = rec.attendance || '';
    if (colMap.status >= 0) rowVals[colMap.status] = rec.status || 'Not Started';
    if (colMap.certificateCollected >= 0) rowVals[colMap.certificateCollected] = rec.certificateCollected || 'No';
    if (colMap.remarks >= 0) rowVals[colMap.remarks] = rec.remarks || '';

    rowRange.setValues([rowVals]);
  } else {
    var newRow = new Array(numCols).fill('');
    if (colMap.sno >= 0) {
      newRow[colMap.sno] = Math.max(1, sheet.getLastRow() - colMap.headerRowIdx);
    }
    if (colMap.regNo >= 0) newRow[colMap.regNo] = String(rec.regNo || '').replace('.0','').trim();
    if (colMap.studentName >= 0) newRow[colMap.studentName] = rec.studentName || '';
    if (colMap.companyName >= 0) newRow[colMap.companyName] = rec.companyName || '';
    if (colMap.location >= 0) newRow[colMap.location] = rec.location || '';
    if (colMap.startDate >= 0) newRow[colMap.startDate] = rec.startDate || '';
    if (colMap.endDate >= 0) newRow[colMap.endDate] = rec.endDate || '';
    if (colMap.duration >= 0) newRow[colMap.duration] = rec.duration || '';
    if (colMap.attendance >= 0) newRow[colMap.attendance] = rec.attendance || '';
    if (colMap.status >= 0) newRow[colMap.status] = rec.status || 'Not Started';
    if (colMap.certificateCollected >= 0) newRow[colMap.certificateCollected] = rec.certificateCollected || 'No';
    if (colMap.remarks >= 0) newRow[colMap.remarks] = rec.remarks || '';

    sheet.appendRow(newRow);
  }
}

// Get rows from sheet tab using dynamic column mapping
function getSheetRecords(sheet) {
  var sName = sheet.getName();
  var colMap = getColumnMapping(sheet);
  var values = sheet.getDataRange().getValues();
  var startRow = (colMap && colMap.headerRowIdx !== undefined) ? colMap.headerRowIdx + 1 : 1;
  if (values.length <= startRow) return [];
  
  var records = [];
  for (var i = startRow; i < values.length; i++) {
    var row = values[i];
    var regNo = (colMap.regNo >= 0 && row[colMap.regNo] !== undefined) ? String(row[colMap.regNo] || '').replace('.0','').trim() : '';
    var studentName = (colMap.studentName >= 0 && row[colMap.studentName] !== undefined) ? String(row[colMap.studentName] || '').trim() : '';
    
    // Skip empty rows or section divider rows (e.g. 'AUGUST', 'MAY (1)')
    if (!regNo && !studentName) continue;
    if (regNo && !/\d/.test(regNo) && !studentName) continue;
    
    records.push({
      className: sName,
      regNo: regNo,
      studentName: studentName,
      companyName: (colMap.companyName >= 0 && row[colMap.companyName] !== undefined) ? String(row[colMap.companyName] || '').trim() : '',
      location: (colMap.location >= 0 && row[colMap.location] !== undefined) ? String(row[colMap.location] || '').trim() : '',
      startDate: (colMap.startDate >= 0 && row[colMap.startDate] !== undefined) ? String(row[colMap.startDate] || '').trim() : '',
      endDate: (colMap.endDate >= 0 && row[colMap.endDate] !== undefined) ? String(row[colMap.endDate] || '').trim() : '',
      duration: (colMap.duration >= 0 && row[colMap.duration] !== undefined) ? String(row[colMap.duration] || '').trim() : '',
      attendance: (colMap.attendance >= 0 && row[colMap.attendance] !== undefined) ? String(row[colMap.attendance] || '').trim() : '',
      status: (colMap.status >= 0 && row[colMap.status] !== undefined) ? String(row[colMap.status] || 'Not Started').trim() : 'Not Started',
      certificateCollected: (colMap.certificateCollected >= 0 && row[colMap.certificateCollected] !== undefined) ? String(row[colMap.certificateCollected] || 'No').trim() : 'No',
      remarks: (colMap.remarks >= 0 && row[colMap.remarks] !== undefined) ? String(row[colMap.remarks] || '').trim() : ''
    });
  }
  return records;
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    showToast('Two-Way Apps Script code copied!', 'success');
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSaveUrl = (e) => {
    e.preventDefault();
    const clean = sanitizeAppsScriptUrl(urlInput.trim());
    setUrlInput(clean);
    setGoogleSheetWebhookUrl(clean);
    showToast('Google Sheet Webhook URL saved!', 'success');
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      showToast('Please enter your Webhook URL first', 'error');
      return;
    }
    const clean = sanitizeAppsScriptUrl(urlInput.trim());
    setUrlInput(clean);
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGoogleSheetWebhook(clean);
      setTestResult(res);
      if (res.success) {
        setGoogleSheetWebhookUrl(res.cleanUrl || clean);
        showToast('Webhook verified successfully!', 'success');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleManualPull = async () => {
    if (!urlInput.trim()) {
      showToast('Please enter a Webhook URL first', 'error');
      return;
    }
    setGoogleSheetWebhookUrl(urlInput.trim());
    setIsPulling(true);
    try {
      await syncWithGoogleSheet(selectedClassIncharge);
    } finally {
      setIsPulling(false);
    }
  };

  const handleManualPush = async () => {
    if (!urlInput.trim()) {
      showToast('Please enter a Webhook URL first', 'error');
      return;
    }
    if (!selectedClassIncharge) {
      showToast('Please select a class first', 'error');
      return;
    }
    setGoogleSheetWebhookUrl(urlInput.trim());
    setIsPushing(true);
    try {
      await pushClassToGoogleSheet(selectedClassIncharge);
    } finally {
      setIsPushing(false);
    }
  };

  const handlePushAllClasses = async () => {
    if (!urlInput.trim()) {
      showToast('Please enter a Webhook URL first', 'error');
      return;
    }
    setGoogleSheetWebhookUrl(urlInput.trim());
    setIsPushingAll(true);
    try {
      await pushAllClassesToGoogleSheet();
    } finally {
      setIsPushingAll(false);
    }
  };

  const handleDownloadMasterTemplate = () => {
    try {
      const filename = exportInternshipWorkbook(internshipRecords);
      showToast(`Downloaded master template (${filename})`, 'success');
    } catch (err) {
      showToast('Failed to download template: ' + err.message, 'error');
    }
  };

  const isDocsUrl = urlInput.includes('docs.google.com/spreadsheets');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Sheets Two-Way Manual Sync"
      subtitle="Manual bidirectional sync: Push class roster updates to Google Sheets or pull spreadsheet edits into the portal on demand"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs font-sans">
        
        {/* Status Indicator */}
        <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          googleSheetWebhookUrl 
            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full shrink-0 ${
              googleSheetWebhookUrl ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                {googleSheetWebhookUrl ? 'Manual Two-Way Sync Ready' : 'Sync Not Configured'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {lastGSheetSyncTime 
                  ? `Last synchronized: ${new Date(lastGSheetSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Manual sync mode: Click "Push to Sheet" or "Pull from Sheet" whenever you want to update'}
              </div>
            </div>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {googleSheetWebhookUrl && (
              <>
                <button
                  type="button"
                  onClick={handleManualPull}
                  disabled={isPulling}
                  className="px-2.5 py-1.5 rounded-lg font-bold text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Fetch any direct changes made in Google Sheet"
                >
                  <DownloadCloud className={`w-3.5 h-3.5 text-blue-600 ${isPulling ? 'animate-bounce' : ''}`} />
                  <span>{isPulling ? 'Pulling...' : 'Pull Sheet'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleManualPush}
                  disabled={isPushing}
                  className="px-2.5 py-1.5 rounded-lg font-bold text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title={`Push ${selectedClassIncharge || 'current'} class roster to Google Sheet`}
                >
                  <UploadCloud className={`w-3.5 h-3.5 text-emerald-600 ${isPushing ? 'animate-bounce' : ''}`} />
                  <span>{isPushing ? 'Pushing...' : `Push ${selectedClassIncharge || 'Class'}`}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePushAllClasses}
                  disabled={isPushingAll}
                  className="px-3 py-1.5 rounded-lg font-bold text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Push entire 14-class database and initialize Overview dashboard in Google Sheet"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-emerald-200 ${isPushingAll ? 'animate-spin' : ''}`} />
                  <span>{isPushingAll ? 'Setting up...' : 'Push All 14 Classes'}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleDownloadMasterTemplate}
              className="px-2.5 py-1.5 rounded-lg font-bold text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download pre-formatted .xlsx file with all 14 class tabs ready to import into Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Webhook URL Input & Test Button */}
        <form onSubmit={handleSaveUrl} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Google Apps Script Web App URL *
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                script.google.com/macros/s/.../exec
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/60 border rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    isDocsUrl 
                      ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20'
                      : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={!urlInput.trim() || isTesting}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Activity className={`w-3.5 h-3.5 text-blue-600 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Save
              </button>
            </div>

            {/* Warning if user pasted docs.google.com URL */}
            {isDocsUrl && (
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl flex items-start gap-2.5 text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Notice:</strong> You pasted the browser link to your Google Sheet (<code>docs.google.com</code>). 
                  To allow the website to write directly to your sheet, Google requires the <strong>Apps Script Web App URL</strong> (which starts with <code>https://script.google.com/macros/s/.../exec</code>). 
                  Please follow the quick 2-minute steps below to copy and deploy your script!
                </div>
              </div>
            )}

            {/* Test Feedback Result */}
            {testResult && (
              <div className={`mt-2 p-3.5 rounded-xl border flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="text-[11px] leading-relaxed flex-1">
                  {testResult.success ? (
                    <div>
                      <div className="font-bold">{testResult.message}</div>
                      {Array.isArray(testResult.sheets) && (
                        <div className="text-[10px] mt-1 text-emerald-700 dark:text-emerald-300">
                          Detected tabs: {testResult.sheets.slice(0, 8).join(', ')}{testResult.sheets.length > 8 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="font-bold text-xs text-rose-900 dark:text-rose-100">Connection Check Failed</div>
                      <div className="text-rose-800 dark:text-rose-200 leading-normal">{testResult.error}</div>
                      
                      {testResult.url && (
                        <div className="pt-1.5 border-t border-rose-200 dark:border-rose-800/80 flex flex-wrap items-center gap-2">
                          <a
                            href={`${testResult.url}?action=PING`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] shadow-2xs transition-all"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>1. Click Here to Authorize in New Tab</span>
                          </a>
                          <span className="text-[10px] text-rose-700 dark:text-rose-300">
                            (If you see "Review permissions" or "Go to project (unsafe)", click Allow, then click Test Connection again!)
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Step-by-Step Instructions & Script Copy */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Setup Clean Google Sheet in 2 Minutes (Two-Way Sync):</span>
            </div>
            
            <button
              type="button"
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-xs cursor-pointer"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Copied Two-Way Script!' : 'Copy Apps Script'}</span>
            </button>
          </div>

          <ol className="text-slate-600 dark:text-slate-400 space-y-2 list-decimal pl-4 leading-relaxed text-[11px]">
            <li>
              <strong>Create a new Google Sheet:</strong> Open <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-bold underline">sheets.new</a> in your browser (or use your existing sheet).
            </li>
            <li>
              In your Google Sheet menu, click <strong>Extensions &gt; Apps Script</strong>.
            </li>
            <li>
              In the script editor, delete any existing code, paste the <strong>copied Apps Script</strong>, and click the <strong>Save</strong> (Disk 💾) icon.
            </li>
            <li>
              Click the blue <strong>Deploy &gt; New deployment</strong> button (top right). Choose <strong>Web app</strong> and set:
              <ul className="list-disc pl-4 pt-1 space-y-0.5 text-slate-700 dark:text-slate-300 font-medium">
                <li><strong>Execute as:</strong> Me (your Google account)</li>
                <li><strong>Who has access:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">Anyone</span> (allows bidirectional sync without OAuth popups)</li>
              </ul>
            </li>
            <li>
              Click <strong>Deploy</strong>. If Google shows <em>"Authorization required"</em>:
              <ul className="list-disc pl-4 pt-0.5 space-y-0.5 text-slate-700 dark:text-slate-300">
                <li>Click <strong>Authorize access</strong> &gt; pick your Google account</li>
                <li>Click <strong>Advanced</strong> (bottom left) &gt; click <strong>Go to ... (unsafe)</strong> &gt; click <strong>Allow</strong></li>
              </ul>
              Then copy the <strong>Web App URL</strong> (make sure it ends with <code>/exec</code>, NOT <code>/dev</code>) and paste it into the box above.
            </li>
            <li>
              Click <strong>Push All 14 Classes</strong> above! The script will automatically format and create all 14 class tabs, standardized columns (Col A to K), and a master <strong>Overview Dashboard</strong>!
            </li>
          </ol>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>🔄 <strong>Two-Way Control:</strong> Click <strong>Push</strong> to send portal updates to Google Sheets, or <strong>Pull</strong> to load spreadsheet changes into the portal.</span>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </Modal>
  );
}
