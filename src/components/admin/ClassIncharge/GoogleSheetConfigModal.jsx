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
  AlertCircle 
} from 'lucide-react';
import Modal from '../../common/Modal';
import { useApp } from '../../../context/AppContext';

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
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  const appsScriptCode = `/**
 * VISTAS Portal Two-Way Google Sheet Synchronizer
 * Handles both GET (Pull from sheet to portal) and POST (Push from portal to sheet)
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = e.parameter ? e.parameter.sheetName : null;
    
    if (sheetName) {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Sheet tab not found: " + sheetName }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var rows = getSheetRecords(sheet);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", sheetName: sheetName, records: rows }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      var allRecords = [];
      var sheets = ss.getSheets();
      for (var s = 0; s < sheets.length; s++) {
        var sh = sheets[s];
        var records = getSheetRecords(sh);
        allRecords = allRecords.concat(records);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", records: allRecords }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

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
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = data.sheetName || "Sheet1";
    var sheet = ss.getSheetByName(sheetName);
    
    var headers = ["REG NO", "NAME", "COMPANY NAME", "LOCATION", "START DATE", "END DATE", "DURATION", "ATTENDANCE", "STATUS", "CERTIFICATE COLLECTED", "REMARKS"];
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
    }
    
    // Batch update mode
    if (data.action === "BATCH_UPDATE_CLASS" && Array.isArray(data.records)) {
      var existingValues = sheet.getDataRange().getValues();
      var regMap = {};
      for (var r = 1; r < existingValues.length; r++) {
        var existingReg = String(existingValues[r][0] || '').replace('.0','').trim();
        if (existingReg) regMap[existingReg] = r + 1;
      }
      
      for (var k = 0; k < data.records.length; k++) {
        var rec = data.records[k];
        var reg = String(rec.regNo || '').replace('.0','').trim();
        var rowArr = [
          reg,
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
        
        if (regMap[reg]) {
          sheet.getRange(regMap[reg], 1, 1, 11).setValues([rowArr]);
        } else {
          sheet.appendRow(rowArr);
          regMap[reg] = sheet.getLastRow();
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: data.records.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Single student update mode
    var regNo = String(data.regNo || '').replace('.0','').trim();
    var values = sheet.getDataRange().getValues();
    var rowIndex = -1;
    
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]).replace('.0','').trim() == regNo) {
        rowIndex = i + 1;
        break;
      }
    }
    
    var rowData = [
      regNo,
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
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, 11).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", rowIndex: rowIndex }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    showToast('Apps Script code copied to clipboard!', 'success');
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSaveUrl = (e) => {
    e.preventDefault();
    setGoogleSheetWebhookUrl(urlInput.trim());
    showToast('Google Sheet Webhook URL saved!', 'success');
  };

  const handleManualPull = async () => {
    if (!urlInput.trim()) {
      showToast('Please enter a Google Sheet Webhook URL first', 'error');
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
      showToast('Please enter a Google Sheet Webhook URL first', 'error');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Sheets Two-Way Auto-Sync"
      subtitle="Full bidirectional sync: Updates in website sync to sheet, and edits in sheet sync back to website"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-xs font-sans">
        
        {/* Status Indicator */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
          googleSheetWebhookUrl 
            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${
              googleSheetWebhookUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`} />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                {googleSheetWebhookUrl ? 'Two-Way Sync Active' : 'Sync Not Configured'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {lastGSheetSyncTime 
                  ? `Last synchronized: ${new Date(lastGSheetSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Changes made in the portal will sync automatically once connected'}
              </div>
            </div>
          </div>

          {/* Sync Trigger Buttons */}
          {googleSheetWebhookUrl && (
            <div className="flex items-center gap-2">
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

        {/* Webhook URL Form */}
        <form onSubmit={handleSaveUrl} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Google Apps Script Web App URL
            </label>
            <div className="relative">
              <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Whenever a class incharge updates status, dates, attendance, or uploads certificates on the portal, it immediately writes into that student's row in your Google Sheet!
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Save URL
            </button>
          </div>
        </form>

        {/* Two-Way Apps Script Instructions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>How to connect your existing Google Sheet (2 minutes):</span>
            </div>
            
            <button
              type="button"
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Copied Two-Way Script!' : 'Copy Apps Script'}</span>
            </button>
          </div>

          <ol className="text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal pl-4 leading-relaxed text-[11px]">
            <li>Open your existing Google Sheet in the browser.</li>
            <li>In the top menu, click <strong>Extensions &gt; Apps Script</strong>.</li>
            <li>Select all existing code in the editor, replace it with the copied script, and click <strong>Save</strong> (disk icon).</li>
            <li>Click <strong>Deploy &gt; New deployment</strong> (blue button top right).</li>
            <li>Choose type: <strong>Web app</strong>. Configure:
              <ul className="list-disc pl-4 pt-0.5 space-y-0.5 text-slate-500">
                <li><strong>Execute as</strong>: Me (your Google account)</li>
                <li><strong>Who has access</strong>: Anyone</li>
              </ul>
            </li>
            <li>Click <strong>Deploy</strong> and copy the generated <strong>Web App URL</strong> into the field above!</li>
          </ol>
        </div>

      </div>
    </Modal>
  );
}
