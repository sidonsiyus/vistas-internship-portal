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
 * Export all 13 class tabs or a single class into an Excel (.xlsx) file
 */
export function exportInternshipWorkbook(records, specificClass = null) {
  const wb = XLSX.utils.book_new();
  
  const classesToExport = specificClass ? [specificClass] : ALL_CLASSES;

  classesToExport.forEach(className => {
    const classRecords = records.filter(r => (r.className || '').trim().toUpperCase() === className.trim().toUpperCase());
    
    // Sort by register number
    classRecords.sort((a, b) => (a.regNo || '').localeCompare(b.regNo || ''));

    const sheetData = [
      EXCEL_HEADERS,
      ...classRecords.map(recordToRow)
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Format column widths for readability
    ws['!cols'] = [
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

    XLSX.utils.book_append_sheet(wb, ws, className);
  });

  const filename = specificClass 
    ? `INTERNSHIP_DETAILS_${specificClass.replace(/\s+/g, '_')}.xlsx`
    : `INTERNSHIP_DETAILS_ALL_CLASSES.xlsx`;

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
 * Test connectivity to Google Apps Script Webhook
 */
export async function testGoogleSheetWebhook(webhookUrl) {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, error: 'Please enter a valid URL starting with https://' };
  }

  // Detect if user mistakenly pasted the spreadsheet browser URL
  if (webhookUrl.includes('docs.google.com/spreadsheets')) {
    return {
      success: false,
      isDocsUrl: true,
      error: 'You pasted a Google Spreadsheet link (docs.google.com). To write/push to Google Sheets, you need the Apps Script Web App URL (script.google.com). Follow the 2-minute steps below to deploy it!'
    };
  }

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
      return { success: true, message: data.message, sheets: data.sheets };
    } else {
      return { success: false, error: data.message || 'Script returned an error' };
    }
  } catch (err) {
    // Also try GET ping
    try {
      const getUrl = new URL(webhookUrl);
      getUrl.searchParams.set('action', 'PING');
      const getRes = await fetch(getUrl.toString(), { redirect: 'follow' });
      const getData = await getRes.json();
      if (getData.status === 'success') {
        return { success: true, message: getData.message || 'Connected successfully', sheets: getData.sheets };
      }
    } catch (e) {}

    return {
      success: false,
      error: `Could not reach Apps Script (${err.message}). In Google Apps Script, make sure you clicked 'Deploy > Manage deployments > Edit', and verified 'Who has access' is set to 'Anyone'.`
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
    // 1. Google Apps Script Web App (JSON Endpoint)
    if (webhookUrl.includes('script.google.com')) {
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

        const records = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || (!row[0] && !row[1])) continue;
          records.push({
            className: sheetName || '',
            regNo: String(row[0] || '').replace('.0', '').trim(),
            studentName: String(row[1] || '').trim(),
            companyName: String(row[2] || '').trim(),
            location: String(row[3] || '').trim(),
            startDate: String(row[4] || '').trim(),
            endDate: String(row[5] || '').trim(),
            duration: String(row[6] || '').trim(),
            attendance: formatAttendance(row[7]),
            status: String(row[8] || 'Not Started').trim(),
            certificateCollected: String(row[9] || 'No').trim(),
            remarks: String(row[10] || '').trim()
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
