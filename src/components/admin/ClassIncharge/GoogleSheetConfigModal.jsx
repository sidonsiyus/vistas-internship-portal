import React, { useState } from 'react';
import { Sheet, Link, Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';
import Modal from '../../common/Modal';
import { useApp } from '../../../context/AppContext';

export default function GoogleSheetConfigModal({ isOpen, onClose }) {
  const { googleSheetWebhookUrl, setGoogleSheetWebhookUrl, showToast } = useApp();
  const [urlInput, setUrlInput] = useState(googleSheetWebhookUrl || '');
  const [copiedScript, setCopiedScript] = useState(false);

  const appsScriptCode = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = data.sheetName || "Sheet1";
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["REG NO", "NAME", "COMPANY NAME", "LOCATION", "START DATE", "END DATE", "DURATION", "ATTENDANCE", "STATUS", "CERTIFICATE COLLECTED", "REMARKS"]);
    }
    
    var regNo = String(data.regNo).trim();
    var values = sheet.getDataRange().getValues();
    var rowIndex = -1;
    
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]).replace('.0','').trim() == regNo) {
        rowIndex = i + 1;
        break;
      }
    }
    
    var rowData = [
      data.regNo,
      data.studentName,
      data.companyName,
      data.location,
      data.startDate,
      data.endDate,
      data.duration,
      data.attendance,
      data.status,
      data.certificateCollected,
      data.remarks
    ];
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, 11).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message })).setMimeType(ContentService.MimeType.JSON);
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
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Sheets Live Auto-Sync Configuration"
      subtitle="Connect your active Google Sheet to enable real-time synchronization whenever changes are saved"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        
        {/* Webhook URL Input */}
        <form onSubmit={handleSaveUrl} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
              Leave blank if you prefer exporting to Excel (.xlsx) instead of live syncing.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </form>

        {/* Step-by-Step Instructions & Script Copy */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>How to set up in 2 minutes:</span>
            </div>
            
            <button
              type="button"
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Copied Script!' : 'Copy Apps Script'}</span>
            </button>
          </div>

          <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal pl-4 leading-relaxed">
            <li>Open your Google Sheet in browser.</li>
            <li>Click <strong>Extensions &gt; Apps Script</strong> in the menu.</li>
            <li>Paste the copied script and click <strong>Save</strong>.</li>
            <li>Click <strong>Deploy &gt; New deployment</strong>.</li>
            <li>Select type: <strong>Web app</strong>. Execute as: <strong>Me</strong>. Who has access: <strong>Anyone</strong>.</li>
            <li>Click <strong>Deploy</strong> and copy the generated Web App URL into the box above.</li>
          </ol>
        </div>

      </div>
    </Modal>
  );
}
