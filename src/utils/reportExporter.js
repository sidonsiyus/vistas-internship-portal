import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

/**
 * Exports complete report to formatted multi-sheet Excel (.xlsx) file
 */
export function exportReportToExcel(reportData, customFilename = null) {
  const wb = XLSX.utils.book_new();
  const {
    reportType,
    periodLabel,
    metrics,
    hourlySlots,
    dailyBreakdown,
    weeklyBreakdown,
    categoryData,
    departmentData,
    classProgressData,
    sessions
  } = reportData;

  const dateTag = new Date().toISOString().split('T')[0];
  const filename = customFilename || `VISTAS_${reportType.toUpperCase()}_REPORT_${dateTag}.xlsx`;

  // ==========================================
  // SHEET 1: EXECUTIVE KPI SUMMARY
  // ==========================================
  const summaryRows = [
    ['VELS INSTITUTE OF SCIENCE, TECHNOLOGY & ADVANCED STUDIES (VISTAS)'],
    ['Department of Placement & Internship Coordination - Official Report'],
    [''],
    ['REPORT METRIC', 'DETAILS / VALUE'],
    ['Report Type', `${reportType.toUpperCase()} OPERATIONS REPORT`],
    ['Period / Date Range', periodLabel],
    ['Generated On', new Date().toLocaleString()],
    [''],
    ['--- EXECUTIVE CONSULTATION KPIS ---', ''],
    ['Total Consultations Scheduled', metrics.totalCount],
    ['Total Consultations Completed', metrics.completedCount],
    ['Overall Completion Rate', `${metrics.completionRate}%`],
    ['Walk-in Consultations', metrics.walkInCount],
    ['Pre-booked Appointments', metrics.preBookedCount],
    ['No-Show / Unattended Tokens', metrics.noShowCount],
    ['Cancelled Consultations', metrics.cancelledCount],
    ['Average Consultation Duration', `${metrics.avgDuration} Minutes`],
    ['Peak Consultation Period', metrics.peakHour],
    [''],
    ['--- TOP QUERY CATEGORIES ---', 'COUNT', 'SHARE %'],
    ...categoryData.map(c => [c.name, c.value, `${c.percentage}%`]),
    [''],
    ['--- DEPARTMENT PARTICIPATION ---', 'STUDENTS HANDLED', 'SHARE %'],
    ...departmentData.map(d => [d.fullName || d.name, d.count, `${d.percentage}%`])
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 38 }, { wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'KPI Summary');

  // ==========================================
  // SHEET 2: TIMEFRAME FOOTFALL BREAKDOWN
  // ==========================================
  if (reportType === 'daily' && hourlySlots) {
    const hourlyHeaders = ['Hour Slot', 'Pre-Booked (Scheduled)', 'Walk-in Students', 'Total Footfall'];
    const hourlyData = hourlySlots.map(h => [
      h.hour,
      h.scheduled,
      h.walkIn,
      h.total
    ]);
    const wsHourly = XLSX.utils.aoa_to_sheet([hourlyHeaders, ...hourlyData]);
    wsHourly['!cols'] = [{ wch: 16 }, { wch: 24 }, { wch: 20 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, wsHourly, 'Hourly Breakdown');
  } else if (reportType === 'weekly' && dailyBreakdown) {
    const dailyHeaders = ['Day', 'Date', 'Total Consultations', 'Completed', 'Walk-ins', 'No-Shows', 'Completion Rate'];
    const dailyData = dailyBreakdown.map(d => [
      d.day,
      d.date,
      d.total,
      d.completed,
      d.walkIns,
      d.noShow,
      `${d.rate}%`
    ]);
    const wsDaily = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyData]);
    wsDaily['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily Footfall');
  } else if (reportType === 'monthly' && weeklyBreakdown) {
    const weeklyHeaders = ['Week Period', 'Day Range', 'Total Consultations', 'Completed', 'Walk-ins', 'No-Shows'];
    const weeklyData = weeklyBreakdown.map(w => [
      w.week,
      w.range,
      w.total,
      w.completed,
      w.walkIn,
      w.noShow
    ]);
    const wsWeekly = XLSX.utils.aoa_to_sheet([weeklyHeaders, ...weeklyData]);
    wsWeekly['!cols'] = [{ wch: 16 }, { wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsWeekly, 'Weekly Progression');
  }

  // ==========================================
  // SHEET 3: DETAILED SESSION LOGS
  // ==========================================
  const sessionHeaders = [
    'Token #', 'Date', 'Time Slot', 'Student Name', 'Register No',
    'Department', 'Year', 'Query Category', 'Mode', 'Status', 'Company Reference / Purpose'
  ];

  const sessionData = (sessions || []).map(s => [
    s.tokenNumber || 'N/A',
    s.appointmentDate || '',
    s.appointmentTime || '',
    s.studentName || s.leadStudentName || '',
    s.registerNumber || '',
    s.department || '',
    s.year || '',
    s.category || '',
    s.isWalkIn ? 'Walk-in' : 'Pre-booked',
    s.status || 'WAITING',
    s.companyName || s.notes || s.description || ''
  ]);

  const wsSessions = XLSX.utils.aoa_to_sheet([sessionHeaders, ...sessionData]);
  wsSessions['!cols'] = [
    { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 26 }, { wch: 16 },
    { wch: 28 }, { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 32 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSessions, 'Session Logs');

  // ==========================================
  // SHEET 4: CLASS INTERNSHIP PROGRESSION
  // ==========================================
  if (classProgressData && classProgressData.length > 0) {
    const classHeaders = ['Class Name', 'Total Enrolled', 'Completed', 'Ongoing', 'Not Started', 'Certificates Collected', 'Completion Rate'];
    const classData = classProgressData.map(c => [
      c.className,
      c.total,
      c.completed,
      c.ongoing,
      c.notStarted,
      c.certsCollected,
      `${c.completionRate}%`
    ]);
    const wsClass = XLSX.utils.aoa_to_sheet([classHeaders, ...classData]);
    wsClass['!cols'] = [
      { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 24 }, { wch: 18 }
    ];
    XLSX.utils.book_append_sheet(wb, wsClass, 'Internship Progress');
  }

  // Trigger Excel File Download
  XLSX.writeFile(wb, filename);
  return filename;
}

/**
 * Captures report DOM element into a crisp high-resolution PNG image
 */
export async function exportReportToPNG(element, customFilename = null) {
  if (!element) {
    throw new Error('Report container element not found');
  }

  const isDark = document.documentElement.classList.contains('dark');
  const dateTag = new Date().toISOString().split('T')[0];
  const filename = customFilename || `VISTAS_REPORT_${dateTag}.png`;

  // Render using html2canvas with 2x scale for sharp retina clarity
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    onclone: (clonedDoc) => {
      // Ensure cloned elements look pristine
      const clonedEl = clonedDoc.querySelector('[data-report-capture="true"]');
      if (clonedEl) {
        clonedEl.style.padding = '24px';
        clonedEl.style.borderRadius = '16px';
      }
    }
  });

  // Create download link
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return filename;
}
