export function downloadIcsFile(appointment) {
  const { tokenNumber, studentName, appointmentDate, appointmentTime, category, description, consultationMode, meetingLink } = appointment;
  const isOnline = consultationMode === 'ONLINE';

  // Basic ICS format generator
  const title = `VISTAS ${isOnline ? 'Online ' : ''}Internship Consultation (${tokenNumber})`;
  const summary = `${isOnline ? 'Online ' : ''}Consultation with Internship Coordinator - Token ${tokenNumber}`;
  const details = `Mode: ${isOnline ? 'Online Video Consultation' : 'In-Person (7th Floor Staff Room)'}\\nDate/Time: ${appointmentDate} ${appointmentTime}\\nCategory: ${category}\\n${isOnline && meetingLink ? `Meeting Link: ${meetingLink}\\n` : ''}Description: ${description || 'N/A'}\\nStudent: ${studentName}`;
  const location = isOnline
    ? (meetingLink || 'Online Video Consultation (Link via Student Portal)')
    : `VISTAS Internship Coordinator Office, 7th Floor Staff Room`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VISTAS University//Internship Consultation System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${tokenNumber}-${Date.now()}@vistas.edu.in`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `VISTAS_Consultation_${tokenNumber}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
