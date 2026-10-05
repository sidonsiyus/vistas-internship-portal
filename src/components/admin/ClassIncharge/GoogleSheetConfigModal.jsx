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
  Activity
} from 'lucide-react';
import Modal from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { testGoogleSheetWebhook } from '../../../utils/internshipExcelSync';

export default function GoogleSheetConfigModal({ isOpen, onClose }) {
  const { 
    googleSheetWebhookUrl, 
    setGoogleSheetWebhookUrl, 
    syncWithGoogleSheet, 
    pushClassToGoogleSheet, 
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

  // Resilient, Two-Way Google Apps Script
  const appsScriptCode = `/**
 * VISTAS Portal Two-Way Google Sheet Synchronizer
 * Handles:
 * 1. PING: Test connectivity
 * 2. POST: Push single student or batch class updates from portal to Google Sheet
 * 3. GET:  Pull latest spreadsheet rows into portal
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = e.parameter ? e.parameter.sheetName : null;
    
    if (e.parameter && e.parameter.action === "PING") {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Connected to Google Sheet: " + ss.getName(),
        sheets: ss.getSheets().map(function(s) { return s.getName(); })
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (sheetName) {
      var sheet = findSheet(ss, sheetName);
      var rows = getSheetRecords(sheet);
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        sheetName: sheet.getName(), 
        records: rows 
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      var allRecords = [];
      var sheets = ss.getSheets();
      for (var s = 0; s < sheets.length; s++) {
        allRecords = allRecords.concat(getSheetRecords(sheets[s]));
      }
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        records: allRecords 
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
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
    
    // PING Connectivity Test
    if (data.action === "PING") {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Connected to Google Sheet: " + ss.getName(),
        sheets: ss.getSheets().map(function(s) { return s.getName(); })
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var sheet = findSheet(ss, data.sheetName);
    var colMap = getColumnMapping(sheet);
    
    // Batch Update Mode
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
    
    // Single Student Update Mode
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

// Resilient Sheet Tab Finder: Matches casing, trailing spaces, or hyphens
function findSheet(ss, sheetName) {
  if (!sheetName) return ss.getSheets()[0];
  
  var sheet = ss.getSheetByName(sheetName);
  if (sheet) return sheet;
  
  var cleanTarget = String(sheetName).trim().toLowerCase();
  var sheets = ss.getSheets();
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
  
  // If tab doesn't exist, create it matching that specific class format
  var newSheet = ss.insertSheet(sheetName);
  if (cleanTarget.indexOf('2c') !== -1) {
    newSheet.appendRow(["SNO", "REG NO", "NAME", "COMPANY NAME", "LOCATION", "START DATE", "END DATE", "DURATION", "ATTENDANCE", "STATUS", "CERTIFICATE COLLECTED", "REMARKS"]);
  } else {
    newSheet.appendRow(["REG NO", "NAME", "COMPANY NAME", "LOCATION", "START DATE", "END DATE", "DURATION", "ATTENDANCE", "STATUS", "CERTIFICATE COLLECTED", "REMARKS"]);
  }
  return newSheet;
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
    setGoogleSheetWebhookUrl(urlInput.trim());
    showToast('Google Sheet Webhook URL saved!', 'success');
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      showToast('Please enter your Webhook URL first', 'error');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGoogleSheetWebhook(urlInput.trim());
      setTestResult(res);
      if (res.success) {
        setGoogleSheetWebhookUrl(urlInput.trim());
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
          {googleSheetWebhookUrl && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleManualPull}
                disabled={isPulling}
                className="px-3 py-1.5 rounded-lg font-bold text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Fetch any direct changes made in Google Sheet"
              >
                <DownloadCloud className={`w-3.5 h-3.5 text-blue-600 ${isPulling ? 'animate-bounce' : ''}`} />
                <span>{isPulling ? 'Pulling...' : 'Pull from Sheet'}</span>
              </button>

              <button
                type="button"
                onClick={handleManualPush}
                disabled={isPushing}
                className="px-3 py-1.5 rounded-lg font-bold text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Push current class roster to Google Sheet"
              >
                <UploadCloud className={`w-3.5 h-3.5 ${isPushing ? 'animate-bounce' : ''}`} />
                <span>{isPushing ? 'Pushing...' : 'Push to Sheet'}</span>
              </button>
            </div>
          )}
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
              <div className={`mt-2 p-3 rounded-xl border flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="text-[11px] leading-relaxed">
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
                    <div>
                      <div className="font-bold">Connection Check Failed</div>
                      <div>{testResult.error}</div>
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
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>How to connect your Google Sheet in 2 minutes:</span>
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

          <ol className="text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal pl-4 leading-relaxed text-[11px]">
            <li>Open your Google Sheet in your web browser.</li>
            <li>In the top menu, click <strong>Extensions &gt; Apps Script</strong>.</li>
            <li>In the script editor, delete any existing code, paste the copied script, and click the <strong>Save (Disk)</strong> icon.</li>
            <li>Click the blue <strong>Deploy &gt; New deployment</strong> button (top right).</li>
            <li>Click the gear icon next to "Select type" and choose <strong>Web app</strong>. Configure:
              <ul className="list-disc pl-4 pt-0.5 space-y-0.5 text-slate-500 font-medium">
                <li><strong>Execute as:</strong> Me (your Google account)</li>
                <li><strong>Who has access:</strong> <span className="text-blue-600 dark:text-blue-400 font-bold">Anyone</span> (crucial so the portal can sync without Google login prompts)</li>
              </ul>
            </li>
            <li>Click <strong>Deploy</strong> (authorize permissions if prompted), copy the <strong>Web App URL</strong>, and paste it into the box above!</li>
          </ol>
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
