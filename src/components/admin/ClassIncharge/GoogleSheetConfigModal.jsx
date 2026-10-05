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
    
    // Batch Update Mode
    if (data.action === "BATCH_UPDATE_CLASS" && Array.isArray(data.records)) {
      var updatedCount = 0;
      for (var k = 0; k < data.records.length; k++) {
        var rec = data.records[k];
        var rowArr = [
          String(rec.regNo || '').replace('.0','').trim(),
          rec.studentName || '',
          rec.companyName || '',
          rec.location || '',
          rec.startDate || '',
          rec.endDate || '',
          rec.duration || '',
          rec.attendance || '',
          rec.status || 'Not Started',
          rec.certificateCollected || 'No',
          rec.remarks || ''
        ];
        var rIdx = findRowIndex(sheet, rec.regNo, rec.studentName);
        writeRowData(sheet, rIdx, rowArr);
        updatedCount++;
      }
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        updatedCount: updatedCount, 
        sheetName: sheet.getName() 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Single Student Update Mode
    var rowData = [
      String(data.regNo || '').replace('.0','').trim(),
      data.studentName || '',
      data.companyName || '',
      data.location || '',
      data.startDate || '',
      data.endDate || '',
      data.duration || '',
      data.attendance || '',
      data.status || 'Not Started',
      data.certificateCollected || 'No',
      data.remarks || ''
    ];
    
    var rowIndex = findRowIndex(sheet, data.regNo, data.studentName);
    writeRowData(sheet, rowIndex, rowData);
    
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
  
  // If tab doesn't exist, create it with standard columns
  var newSheet = ss.insertSheet(sheetName);
  newSheet.appendRow(["REG NO", "NAME", "COMPANY NAME", "LOCATION", "START DATE", "END DATE", "DURATION", "ATTENDANCE", "STATUS", "CERTIFICATE COLLECTED", "REMARKS"]);
  return newSheet;
}

// Resilient Row Finder: Searches column A and B for register number or name
function findRowIndex(sheet, regNo, studentName) {
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return -1;
  
  var cleanReg = String(regNo || '').replace('.0', '').replace(/[^0-9]/g, '').trim();
  var cleanName = String(studentName || '').toLowerCase().trim();
  
  if (cleanReg) {
    for (var r = 1; r < values.length; r++) {
      var col0 = String(values[r][0] || '').replace('.0', '').replace(/[^0-9]/g, '').trim();
      var col1 = String(values[r][1] || '').replace('.0', '').replace(/[^0-9]/g, '').trim();
      if (col0 === cleanReg || col1 === cleanReg) {
        return r + 1;
      }
    }
  }
  
  if (cleanName && cleanName.length > 2) {
    for (var k = 1; k < values.length; k++) {
      var rowName = String(values[k][1] || values[k][0] || '').toLowerCase().trim();
      if (rowName === cleanName || (rowName.length > 3 && cleanName.includes(rowName))) {
        return k + 1;
      }
    }
  }
  
  return -1;
}

// Write row with auto column expansion
function writeRowData(sheet, rowIndex, rowData) {
  if (sheet.getMaxColumns() < 11) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 11 - sheet.getMaxColumns());
  }
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, 11).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

// Get rows from sheet tab
function getSheetRecords(sheet) {
  var sName = sheet.getName();
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  var records = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var regNo = String(row[0] || '').replace('.0','').trim();
    if (!regNo && !row[1]) continue;
    
    records.push({
      className: sName,
      regNo: regNo,
      studentName: String(row[1] || '').trim(),
      companyName: String(row[2] || '').trim(),
      location: String(row[3] || '').trim(),
      startDate: String(row[4] || '').trim(),
      endDate: String(row[5] || '').trim(),
      duration: String(row[6] || '').trim(),
      attendance: String(row[7] || '').trim(),
      status: String(row[8] || 'Not Started').trim(),
      certificateCollected: String(row[9] || 'No').trim(),
      remarks: String(row[10] || '').trim()
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
      title="Google Sheets Two-Way Auto-Sync"
      subtitle="Full bidirectional sync: Updates in website sync to sheet, and edits in sheet sync back to website"
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
              googleSheetWebhookUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`} />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                {googleSheetWebhookUrl ? 'Two-Way Sync Configured' : 'Sync Not Configured'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {lastGSheetSyncTime 
                  ? `Last synchronized: ${new Date(lastGSheetSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Changes made in the portal will sync automatically once connected'}
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
