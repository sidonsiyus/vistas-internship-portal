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
    r.attendance || '',
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
    companyName: record.companyName,
    location: record.location,
    startDate: record.startDate,
    endDate: record.endDate,
    duration: record.duration,
    attendance: record.attendance,
    status: record.status,
    certificateCollected: record.certificateCollected,
    remarks: record.remarks,
    updatedAt: new Date().toISOString()
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors', // Standard for Apps Script Webhooks
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return { success: true };
  } catch (err) {
    console.error('Google Sheets Webhook Sync failed:', err);
    return { success: false, error: err.message };
  }
}
