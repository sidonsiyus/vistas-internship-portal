/**
 * Utility functions for generating dynamic consultation time slots
 * and converting between 12-hour and 24-hour time strings.
 */

/**
 * Converts a time string (e.g. "15:30", "3:30 PM", "03:30 PM", "11:00 AM")
 * into total minutes from midnight (0 - 1439).
 */
export function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const trimmed = timeStr.trim();

  // Check 12-hour format with AM/PM
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const modifier = match12[3].toUpperCase();

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // Check 24-hour format (e.g. "15:30" or "09:00")
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return 0;
}

/**
 * Formats total minutes from midnight into 12-hour format: "hh:mm A" (e.g. "03:30 PM").
 */
export function minutesToTime12(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  let hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const modifier = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const paddedH = String(hours).padStart(2, '0');
  const paddedM = String(minutes).padStart(2, '0');

  return `${paddedH}:${paddedM} ${modifier}`;
}

/**
 * Formats any input time ("15:30" or "3:30 PM") into standard 12-hour string (e.g. "03:30 PM").
 */
export function formatTimeDisplay(timeStr) {
  if (!timeStr) return '03:30 PM';
  return minutesToTime12(timeToMinutes(timeStr));
}

/**
 * Generates an array of regular consultation slots between startTime and endTime.
 * @param {Object} options
 * @param {string} options.startTime - e.g. "15:30"
 * @param {string} options.endTime - e.g. "17:30"
 * @param {number} options.slotDuration - e.g. 10, 15, 20, 30 in minutes
 * @param {string} [options.breakStartTime] - e.g. "16:15"
 * @param {string} [options.breakEndTime] - e.g. "16:30"
 * @returns {Array<{ time: string, value: string, startMinutes: number, endMinutes: number, isBreak: boolean }>}
 */
export function generateRegularSlots({
  startTime = '15:30',
  endTime = '17:30',
  slotDuration = 15,
  breakStartTime,
  breakEndTime
} = {}) {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const duration = Math.max(5, parseInt(slotDuration, 10) || 15);

  const breakStartMin = breakStartTime ? timeToMinutes(breakStartTime) : null;
  const breakEndMin = breakEndTime ? timeToMinutes(breakEndTime) : null;

  const slots = [];
  let curr = startMin;

  while (curr + duration <= endMin) {
    const next = curr + duration;
    const isBreak = breakStartMin !== null && breakEndMin !== null &&
      curr >= breakStartMin && next <= breakEndMin;

    const formattedTime = minutesToTime12(curr);

    slots.push({
      time: formattedTime,
      value: formattedTime,
      startMinutes: curr,
      endMinutes: next,
      isBreak
    });

    curr = next;
  }

  return slots;
}

/**
 * Generates emergency slots that precede the regular consultation start time.
 * Regular hours start strictly at 3:30 PM (15:30). Emergency slots are early sessions only.
 */
export function generateEmergencySlots(regularStartTime = '15:30') {
  const regularStartMin = timeToMinutes(regularStartTime);

  // Standard emergency checkpoints across the campus day (prior to afternoon regular hours)
  const candidateTimes = ['11:00 AM', '11:30 AM', '01:30 PM', '02:30 PM'];

  return candidateTimes
    .filter(t => timeToMinutes(t) < regularStartMin)
    .map(t => ({
      time: `${t} (Emergency Only)`,
      value: t
    }));
}

/**
 * Calculates the next active working day for the coordinator, skipping weekends/holidays.
 */
export function getNextActiveWorkingDay(currentDateStr, workingDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], dateOverrides = {}) {
  const base = currentDateStr ? new Date(currentDateStr + 'T00:00:00') : new Date();
  
  for (let i = 1; i <= 14; i++) {
    const candidate = new Date(base);
    candidate.setDate(base.getDate() + i);

    const yearStr = candidate.getFullYear();
    const monthStr = String(candidate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(candidate.getDate()).padStart(2, '0');
    const isoDate = `${yearStr}-${monthStr}-${dayStr}`;

    const weekday = candidate.toLocaleDateString('en-US', { weekday: 'short' });
    const override = dateOverrides[isoDate];
    const isOverrideWorking = override && (typeof override === 'string' ? override === 'WORKING' : override.type === 'WORKING');
    const isOverrideHoliday = override && (typeof override === 'string' ? override === 'HOLIDAY' : override.type === 'HOLIDAY');

    const isStandardWorkingDay = workingDays.includes(weekday);
    const isWorkingDay = isOverrideWorking || (!isOverrideHoliday && isStandardWorkingDay);

    if (isWorkingDay) {
      return {
        isoDate,
        formattedDate: candidate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
        weekday
      };
    }
  }

  // Fallback next day
  const fallback = new Date(base);
  fallback.setDate(base.getDate() + 1);
  const isoFallback = fallback.toISOString().split('T')[0];
  return {
    isoDate: isoFallback,
    formattedDate: fallback.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    weekday: fallback.toLocaleDateString('en-US', { weekday: 'short' })
  };
}

/**
 * Returns a list of upcoming active working days for scheduling.
 */
export function getUpcomingActiveDays(startDateStr, count = 7, workingDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], dateOverrides = {}) {
  const base = startDateStr ? new Date(startDateStr + 'T00:00:00') : new Date();
  const list = [];
  let dayOffset = 1;

  while (list.length < count && dayOffset <= 30) {
    const candidate = new Date(base);
    candidate.setDate(base.getDate() + dayOffset);

    const yearStr = candidate.getFullYear();
    const monthStr = String(candidate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(candidate.getDate()).padStart(2, '0');
    const isoDate = `${yearStr}-${monthStr}-${dayStr}`;

    const weekday = candidate.toLocaleDateString('en-US', { weekday: 'short' });
    const override = dateOverrides[isoDate];
    const isOverrideWorking = override && (typeof override === 'string' ? override === 'WORKING' : override.type === 'WORKING');
    const isOverrideHoliday = override && (typeof override === 'string' ? override === 'HOLIDAY' : override.type === 'HOLIDAY');

    const isStandardWorkingDay = workingDays.includes(weekday);
    const isWorkingDay = isOverrideWorking || (!isOverrideHoliday && isStandardWorkingDay);

    if (isWorkingDay) {
      list.push({
        isoDate,
        formattedDate: candidate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        weekday
      });
    }
    dayOffset++;
  }

  return list;
}
