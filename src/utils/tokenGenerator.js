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

export function calculateQueueMetrics(appointments) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayApts = appointments.filter(a => a.appointmentDate === todayStr);
  
  const completed = todayApts.filter(a => a.status === 'COMPLETED');
  const waiting = todayApts.filter(a => a.status === 'WAITING');
  const inProgress = todayApts.filter(a => a.status === 'IN_PROGRESS' || a.status === 'CALLED');
  const noShow = todayApts.filter(a => a.status === 'NO_SHOW');
  const cancelled = todayApts.filter(a => a.status === 'CANCELLED');

  const totalDurations = completed.reduce((acc, curr) => acc + (curr.durationMinutes || 11), 0);
  const avgDuration = completed.length > 0 ? Math.round(totalDurations / completed.length) : 11;

  const totalWaitMinutes = waiting.length * avgDuration;

  return {
    totalToday: todayApts.length,
    completedCount: completed.length,
    waitingCount: waiting.length + inProgress.length,
    upcomingCount: waiting.length,
    noShowCount: noShow.length,
    cancelledCount: cancelled.length,
    avgDurationMinutes: avgDuration,
    totalWaitMinutes,
  };
}
