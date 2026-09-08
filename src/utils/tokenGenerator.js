export function generateNextTokenNumber(appointments = []) {
  let maxSeq = 0;
  appointments.forEach(apt => {
    if (apt.tokenNumber && apt.tokenNumber.startsWith('INT-')) {
      const numPart = parseInt(apt.tokenNumber.replace('INT-', ''), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  });

  const nextSeq = maxSeq + 1;
  return `INT-${String(nextSeq).padStart(3, '0')}`;
}

export function calculateEstimatedWaitTime(queuePosition, avgDurationMinutes = 11) {
  if (queuePosition <= 0) return 0;
  return Math.max(2, queuePosition * avgDurationMinutes);
}

export function formatMinutesToReadable(minutes) {
  if (minutes < 1) return 'Less than a minute';
  if (minutes < 60) return `Approx. ${minutes} min${minutes === 1 ? '' : 's'}`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} hr${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} min` : ''}`;
}

export function calculateQueueMetrics(appointments = []) {
  const now = new Date();
  const yearStr = now.getFullYear();
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');
  const dayStr = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yearStr}-${monthStr}-${dayStr}`;

  const isMatchingDay = (dateVal) => {
    if (!dateVal) return false;
    if (typeof dateVal === 'string') {
      if (dateVal.startsWith(todayStr)) return true;
      const m = dateVal.match(/^\d{4}-\d{2}-\d{2}/);
      if (m && m[0] === todayStr) return true;
    }
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}` === todayStr;
      }
    } catch (e) {}
    return false;
  };

  // 1. Total Booked Today: Non-cancelled appointments booked for today OR created/booked on today
  const bookedTodayApts = appointments.filter(a => {
    if (a.status === 'CANCELLED') return false;
    return isMatchingDay(a.appointmentDate) || isMatchingDay(a.createdAt);
  });

  // 2. Active Queue: Students currently waiting or called in line
  const waitingList = appointments.filter(a => a.status === 'WAITING' || a.status === 'CALLED');
  const inProgress = appointments.find(a => a.status === 'IN_PROGRESS');

  // Completed consultations
  const completed = appointments.filter(a => a.status === 'COMPLETED');
  const noShow = appointments.filter(a => a.status === 'NO_SHOW');
  const cancelled = appointments.filter(a => a.status === 'CANCELLED');

  const totalDurations = completed.reduce((acc, curr) => acc + (curr.durationMinutes || 11), 0);
  const avgDuration = completed.length > 0 ? Math.round(totalDurations / completed.length) : 11;
  const totalWaitMinutes = waitingList.length * avgDuration;

  return {
    totalToday: bookedTodayApts.length,
    completedCount: completed.length,
    waitingCount: waitingList.length,
    upcomingCount: waitingList.filter(a => a.status === 'WAITING').length,
    inProgressCount: inProgress ? 1 : 0,
    noShowCount: noShow.length,
    cancelledCount: cancelled.length,
    avgDurationMinutes: avgDuration,
    totalWaitMinutes,
  };
}
