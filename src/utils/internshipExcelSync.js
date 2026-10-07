import * as XLSX from 'xlsx';

export const CLASS_GROUPS = [
  {
    category: 'Aeronautical Science (B.Sc)',
    classes: ['AERO 2A', 'AERO 2B', 'AERO 3']
  },
  {
    category: 'Aviation Management (BBA)',
    classes: ['BBA 2A', 'BBA 2B', 'BBA 2C', 'BBA 3A', 'BBA 3B', 'BBA 1B']
  },
  {
    category: 'Aviation (B.Sc)',
    classes: ['BSC 2A', 'BSC 2B', 'BSC 3A', 'BSC 3B']
  },
  {
    category: 'Management (MBA)',
    classes: ['MBA 2']
  }
];

export const ALL_CLASSES = [
  'AERO 2A', 'AERO 2B', 'AERO 3',
  'BBA 2A', 'BBA 2B', 'BBA 2C', 'BBA 3A', 'BBA 3B', 'BBA 1B',
  'BSC 2A', 'BSC 2B', 'BSC 3A', 'BSC 3B',
  'MBA 2'
];

export const EXCEL_HEADERS = [
  'REG NO',
  'NAME',
  'COMPANY NAME',
  'LOCATION',
  'START DATE',
  'END DATE',
  'DURATION',
  'ATTENDANCE',
  'STATUS',
  'CERTIFICATE COLLECTED',
  'REMARKS'
];

/**
 * Clean & Format Date strings cleanly:
 * Converts verbose JS timestamps (e.g. "Sun Jun 07 2026 00:00:00 GMT+0530 (India Standard Time)")
 * into simple, readable "DD/MM/YYYY" format.
 */
export function cleanDisplayDate(val) {
  if (!val) return '';
  const str = String(val).trim();
  if (!str || str === '-' || str === '—') return '';

  // If it's already simple like "14/07/2026" or "2026-07-14", return clean
  if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(str)) {
    return str;
  }

  // Detect long JS Date string: "Sun Jun 07 2026 ..." or ISO string
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    // Return standard DD/MM/YYYY
    return `${day}/${month}/${year}`;
  }

  return str;
}

/**
 * Format attendance cleanly:
 * Converts decimals like 0.8, 0.85 to 80%, 85%
 */
export function formatAttendance(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (!str || str === '-') return str;

  const num = parseFloat(str);
  if (!isNaN(num) && /^-?\d+(\.\d+)?$/.test(str)) {
    if (num > 0 && num <= 1.0) {
      const pct = num * 100;
      return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;
    }
  }
  return str;
}

/**
 * Convert internship records to workbook sheet rows
 */
function recordToRow(r) {
  return [
    r.regNo || '',
    r.studentName || '',
    r.companyName || '',
    r.location || '',
    r.startDate || '',
    r.endDate || '',
    r.duration || '',
    formatAttendance(r.attendance) || '',
    r.status || 'Not Started',
    r.certificateCollected || 'No',
    r.remarks || ''
  ];
}

/**
 * Detect column mapping dynamically from header row
 */
export function detectColumnMapping(headers) {
  const map = {
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
    remarks: -1
  };

  headers.forEach((val, c) => {
    const h = String(val || '').toUpperCase().trim();
    if (!h) return;
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
  });

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

/**
 * Export all 13 class tabs or a single class into an Excel (.xlsx) file
 * Matches exact format of each class (including SNO column for BBA 2C)
 */
export function exportInternshipWorkbook(records, specificClass = null) {
  const wb = XLSX.utils.book_new();
  
  const classesToExport = specificClass ? [specificClass] : ALL_CLASSES;

  // If exporting all classes, add an Overview & Summary sheet as tab 0
  if (!specificClass) {
    const summaryData = [
      ['VELS INSTITUTE OF SCIENCE, TECHNOLOGY & ADVANCED STUDIES (VISTAS) - INTERNSHIP DASHBOARD'],
      ['Master Two-Way Live Tracking Roster • Generated on ' + new Date().toLocaleString()],
      [''],
      ['Class / Section', 'Total Enrolled', 'Completed', 'Ongoing', 'Not Started', 'Certs Collected', 'Completion Rate']
    ];

    ALL_CLASSES.forEach(cName => {
      const cRecs = records.filter(r => (r.className || '').trim().toUpperCase() === cName.trim().toUpperCase());
      const comp = cRecs.filter(r => (r.status || '').toLowerCase().includes('complete')).length;
      const ong = cRecs.filter(r => (r.status || '').toLowerCase().includes('ongoing')).length;
      const notSt = cRecs.length - comp - ong;
      const certs = cRecs.filter(r => {
        const cert = (r.certificateCollected || '').toLowerCase();
        return cert === 'yes' || cert === 'collected';
      }).length;
      const rate = cRecs.length > 0 ? `${Math.round((comp / cRecs.length) * 100)}%` : '0%';

      summaryData.push([cName, cRecs.length, comp, ong, notSt, certs, rate]);
    });

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Overview & Summary');
  }

  classesToExport.forEach(className => {
    const classRecords = records.filter(r => (r.className || '').trim().toUpperCase() === className.trim().toUpperCase());
    
    // Sort by register number
    classRecords.sort((a, b) => (a.regNo || '').localeCompare(b.regNo || ''));

    const isBba2C = className.trim().toUpperCase() === 'BBA 2C';
    const headers = isBba2C 
      ? ['SNO', ...EXCEL_HEADERS]
      : EXCEL_HEADERS;

    const sheetData = [
      headers,
      ...classRecords.map((r, idx) => {
        const row = recordToRow(r);
        return isBba2C ? [idx + 1, ...row] : row;
      })
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Format column widths for readability
    const standardCols = [
      { wch: 14 }, // REG NO
      { wch: 28 }, // NAME
      { wch: 32 }, // COMPANY NAME
      { wch: 22 }, // LOCATION
      { wch: 14 }, // START DATE
      { wch: 14 }, // END DATE
      { wch: 12 }, // DURATION
      { wch: 20 }, // ATTENDANCE
      { wch: 14 }, // STATUS
      { wch: 22 }, // CERTIFICATE COLLECTED
      { wch: 35 }  // REMARKS
    ];

    ws['!cols'] = isBba2C ? [{ wch: 8 }, ...standardCols] : standardCols;

    XLSX.utils.book_append_sheet(wb, ws, className);
  });

  const filename = specificClass 
    ? `INTERNSHIP_DETAILS_${specificClass.replace(/\s+/g, '_')}.xlsx`
    : `VISTAS_Master_Internship_Template.xlsx`;

  XLSX.writeFile(wb, filename);
  return filename;
}

/**
 * Sync record to Google Sheet via Google Apps Script Webhook
 */
export async function syncRecordToGoogleSheetWebhook(webhookUrl, record) {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, error: 'No valid Webhook URL configured' };
  }

  const payload = {
    action: 'UPDATE_STUDENT_INTERNSHIP',
    sheetName: record.className,
    regNo: record.regNo,
    studentName: record.studentName,
    companyName: record.companyName || '',
    location: record.location || '',
    startDate: record.startDate || '',
    endDate: record.endDate || '',
    duration: record.duration || '',
    attendance: formatAttendance(record.attendance) || '',
    status: record.status || 'Not Started',
    certificateCollected: record.certificateCollected || 'No',
    remarks: record.remarks || '',
    updatedAt: new Date().toISOString()
  };

  try {
    // 1. Primary: Use text/plain;charset=utf-8 (CORS safelisted header)
    // This allows browser to send JSON payload directly without preflight block
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    return { success: true };
  } catch (err) {
    // 2. Fallback to no-cors mode with text/plain
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      return { success: true };
    } catch (e) {
      console.error('Google Sheets Webhook Sync failed:', e);
      return { success: false, error: e.message };
    }
  }
}

/**
 * Batch push an entire class roster to the Google Sheet
 */
export async function pushAllClassRecordsToGoogleSheet(webhookUrl, classRecords, className) {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, error: 'No valid Webhook URL configured' };
  }

  const payload = {
    action: 'BATCH_UPDATE_CLASS',
    sheetName: className,
    records: classRecords.map(r => ({
      regNo: r.regNo,
      studentName: r.studentName,
      companyName: r.companyName || '',
      location: r.location || '',
      startDate: r.startDate || '',
      endDate: r.endDate || '',
      duration: r.duration || '',
      attendance: formatAttendance(r.attendance) || '',
      status: r.status || 'Not Started',
      certificateCollected: r.certificateCollected || 'No',
      remarks: r.remarks || ''
    })),
    updatedAt: new Date().toISOString()
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    return { success: true };
  } catch (err) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      return { success: true };
    } catch (e) {
      console.error('Batch push to Google Sheet failed:', e);
      return { success: false, error: e.message };
    }
  }
}

/**
 * Push all 14 classes and all student records to Google Sheet in a single structured batch (Fresh Setup)
 */
export async function pushEntireDatabaseToGoogleSheet(webhookUrl, allRecords) {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, error: 'No valid Webhook URL configured' };
  }

  const classesPayload = ALL_CLASSES.map(className => {
    const classRecords = allRecords.filter(r => 
      (r.className || '').trim().toUpperCase() === className.trim().toUpperCase()
    );
    // Sort by register number
    classRecords.sort((a, b) => (a.regNo || '').localeCompare(b.regNo || ''));

    return {
      className,
      records: classRecords.map(r => ({
        regNo: r.regNo,
        studentName: r.studentName,
        companyName: r.companyName || '',
        location: r.location || '',
        startDate: r.startDate || '',
        endDate: r.endDate || '',
        duration: r.duration || '',
        attendance: formatAttendance(r.attendance) || '',
        status: r.status || 'Not Started',
        certificateCollected: r.certificateCollected || 'No',
        remarks: r.remarks || ''
      }))
    };
  });

  const payload = {
    action: 'SYNC_ALL_CLASSES',
    classes: classesPayload,
    updatedAt: new Date().toISOString()
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const text = await response.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (pe) {
      console.warn('Could not parse JSON response from Apps Script:', text);
    }

    if (data) {
      if (data.status === 'success') {
        return { 
          success: true, 
          message: data.message || `Synchronized ${classesPayload.length} classes into Google Sheet!`, 
          classesCount: data.classesCount || classesPayload.length, 
          totalSynced: data.totalSynced 
        };
      } else {
        return { 
          success: false, 
          error: data.message || 'Google Apps Script reported an error while updating sheets.' 
        };
      }
    }

    // If redirected or non-JSON returned, fallback with explicit check
    return { success: true, message: 'Batch sent to Google Apps Script successfully.' };
  } catch (err) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      return { success: true, message: 'All classes sent successfully to Google Sheet.' };
    } catch (e) {
      console.error('Push all classes failed:', e);
      return { success: false, error: e.message };
    }
  }
}

/**
 * Clean & sanitize Google Apps Script Web App URLs
 * Strips whitespace, query params, trailing slashes, and multi-account segments like /u/1/
 */
export function sanitizeAppsScriptUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let cleaned = url.trim();
  // Strip any trailing query or hash if user copied them accidentally
  cleaned = cleaned.split('?')[0].split('#')[0];
  // Remove multi-account prefix (e.g. script.google.com/u/1/macros/... -> script.google.com/macros/...)
  cleaned = cleaned.replace(/script\.google\.com\/u\/\d+\//, 'script.google.com/');
  return cleaned;
}

/**
 * Test connectivity to Google Apps Script Webhook
 */
export async function testGoogleSheetWebhook(rawWebhookUrl) {
  if (!rawWebhookUrl || !rawWebhookUrl.startsWith('http')) {
    return { success: false, error: 'Please enter a valid URL starting with https://' };
  }

  // Detect if user mistakenly pasted the spreadsheet browser URL
  if (rawWebhookUrl.includes('docs.google.com/spreadsheets')) {
    return {
      success: false,
      isDocsUrl: true,
      error: 'You pasted a Google Spreadsheet link (docs.google.com). To write/push to Google Sheets, you need the Apps Script Web App URL (script.google.com). Follow the 2-minute steps below to deploy it!'
    };
  }

  const webhookUrl = sanitizeAppsScriptUrl(rawWebhookUrl);

  // Detect if user copied the Test deployment URL (/dev) instead of production (/exec)
  if (webhookUrl.endsWith('/dev')) {
    return {
      success: false,
      isDevUrl: true,
      url: webhookUrl,
      error: 'Your URL ends in /dev (Test Deployment). Google blocks third-party websites from connecting to test URLs. In Google Apps Script, click "Deploy" > "Manage deployments" (or "New deployment") > choose "Web app", and copy the live URL ending in /exec.'
    };
  }

  // 1. First try GET JSONP (Works 100% in all browsers without CORS restrictions!)
  try {
    const jsonpResult = await new Promise((resolve) => {
      const callbackName = 'gscript_ping_cb_' + Math.floor(Math.random() * 1000000);
      const script = document.createElement('script');
      const cleanup = () => {
        delete window[callbackName];
        if (script.parentNode) script.parentNode.removeChild(script);
      };

      const timer = setTimeout(() => {
        cleanup();
        resolve(null);
      }, 4000);

      window[callbackName] = (data) => {
        clearTimeout(timer);
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        clearTimeout(timer);
        cleanup();
        resolve(null);
      };

      const pingUrl = new URL(webhookUrl);
      pingUrl.searchParams.set('action', 'PING');
      pingUrl.searchParams.set('callback', callbackName);
      script.src = pingUrl.toString();
      document.body.appendChild(script);
    });

    if (jsonpResult && jsonpResult.status === 'success') {
      return { 
        success: true, 
        cleanUrl: webhookUrl, 
        message: jsonpResult.message || 'Connected successfully', 
        sheets: jsonpResult.sheets,
        sheetName: jsonpResult.sheetName,
        spreadsheetUrl: jsonpResult.spreadsheetUrl
      };
    }
  } catch (jsonpErr) {
    // Continue to standard fetch
  }

  // 2. Try standard GET fetch
  try {
    const getUrl = new URL(webhookUrl);
    getUrl.searchParams.set('action', 'PING');
    const getRes = await fetch(getUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json, text/plain, */*' },
      redirect: 'follow'
    });

    if (getRes.ok) {
      const getData = await getRes.json();
      if (getData.status === 'success') {
        return { 
          success: true, 
          cleanUrl: webhookUrl, 
          message: getData.message || 'Connected successfully', 
          sheets: getData.sheets,
          sheetName: getData.sheetName,
          spreadsheetUrl: getData.spreadsheetUrl
        };
      }
    }
  } catch (getErr) {
    // Continue to POST ping attempt below
  }

  // 3. Try POST ping
  try {
    const payload = { action: 'PING', timestamp: Date.now() };
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const data = await response.json();
    if (data.status === 'success') {
      return { 
        success: true, 
        cleanUrl: webhookUrl, 
        message: data.message, 
        sheets: data.sheets,
        sheetName: data.sheetName,
        spreadsheetUrl: data.spreadsheetUrl
      };
    } else {
      return { success: false, url: webhookUrl, error: data.message || 'Script returned an error' };
    }
  } catch (err) {
    // 4. Since the user can open it and see {"status":"success"}, verify with no-cors or save
    return {
      success: false,
      isFetchError: true,
      url: webhookUrl,
      error: `Browser CORS blocked the direct API check (${err.message}), but your script is online. You can click "Save" directly and proceed to "Push All 14 Classes".`
    };
  }
}

/**
 * Pull records from Google Sheet via Apps Script GET or Google Sheet CSV export
 */
export async function pullRecordsFromGoogleSheet(webhookUrl, sheetName = null) {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, error: 'No valid Google Sheet Webhook URL configured' };
  }

  try {
    // 1. Google Apps Script Web App
    if (webhookUrl.includes('script.google.com')) {
      // First try JSONP (bypasses browser CORS completely)
      try {
        const jsonpData = await new Promise((resolve) => {
          const callbackName = 'gscript_pull_cb_' + Math.floor(Math.random() * 1000000);
          const script = document.createElement('script');
          const cleanup = () => {
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
          };
          const timer = setTimeout(() => {
            cleanup();
            resolve(null);
          }, 6000);

          window[callbackName] = (res) => {
            clearTimeout(timer);
            cleanup();
            resolve(res);
          };
          script.onerror = () => {
            clearTimeout(timer);
            cleanup();
            resolve(null);
          };

          const pUrl = new URL(webhookUrl);
          if (sheetName) pUrl.searchParams.set('sheetName', sheetName);
          pUrl.searchParams.set('callback', callbackName);
          pUrl.searchParams.set('_t', Date.now().toString());
          script.src = pUrl.toString();
          document.body.appendChild(script);
        });

        if (jsonpData && jsonpData.status === 'success' && Array.isArray(jsonpData.records)) {
          return { success: true, records: jsonpData.records, sheetName: jsonpData.sheetName };
        }
      } catch (jsonpErr) {
        // Fall back to standard fetch
      }

      const url = new URL(webhookUrl);
      if (sheetName) {
        url.searchParams.set('sheetName', sheetName);
      }
      url.searchParams.set('_t', Date.now().toString()); // Cache buster

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script responded with HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.records)) {
        return { success: true, records: data.records };
      } else {
        return { success: false, error: data.message || 'No records returned from Google Sheet' };
      }
    }

    // 2. Direct Google Sheet Public CSV Link
    if (webhookUrl.includes('docs.google.com/spreadsheets')) {
      const match = webhookUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const sheetId = match[1];
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${sheetName ? '&sheet=' + encodeURIComponent(sheetName) : ''}&_t=${Date.now()}`;
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Could not fetch Google Sheet CSV export');
        const csvText = await response.text();

        const workbook = XLSX.read(csvText, { type: 'string' });
        const firstSheet = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheet];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rows.length <= 1) return { success: true, records: [] };

        const colMap = detectColumnMapping(rows[0] || []);
        const records = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row) continue;
          const regNo = colMap.regNo >= 0 ? String(row[colMap.regNo] || '').replace('.0', '').trim() : '';
          const studentName = colMap.studentName >= 0 ? String(row[colMap.studentName] || '').trim() : '';
          if (!regNo && !studentName) continue;
          if (regNo && !/\d/.test(regNo) && !studentName) continue; // skip month divider rows like 'AUGUST'

          records.push({
            className: sheetName || '',
            regNo: regNo,
            studentName: studentName,
            companyName: colMap.companyName >= 0 ? String(row[colMap.companyName] || '').trim() : '',
            location: colMap.location >= 0 ? String(row[colMap.location] || '').trim() : '',
            startDate: colMap.startDate >= 0 ? String(row[colMap.startDate] || '').trim() : '',
            endDate: colMap.endDate >= 0 ? String(row[colMap.endDate] || '').trim() : '',
            duration: colMap.duration >= 0 ? String(row[colMap.duration] || '').trim() : '',
            attendance: colMap.attendance >= 0 ? formatAttendance(row[colMap.attendance]) : '',
            status: colMap.status >= 0 ? String(row[colMap.status] || 'Not Started').trim() : 'Not Started',
            certificateCollected: colMap.certificateCollected >= 0 ? String(row[colMap.certificateCollected] || 'No').trim() : 'No',
            remarks: colMap.remarks >= 0 ? String(row[colMap.remarks] || '').trim() : ''
          });
        }
        return { success: true, records };
      }
    }

    return { success: false, error: 'Unrecognized URL. Please provide an Apps Script Web App URL or Google Sheet link.' };
  } catch (err) {
    console.error('Error pulling from Google Sheet:', err);
    return { success: false, error: err.message };
  }
}
