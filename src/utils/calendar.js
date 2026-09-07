export function downloadIcsFile(appointment) {
  const { tokenNumber, studentName, appointmentDate, appointmentTime, category, description } = appointment;
  
  // Basic ICS format generator
  const title = `VISTAS Internship Consultation (${tokenNumber})`;
  const summary = `Consultation with Internship Coordinator - Token ${tokenNumber}`;
  const details = `Category: ${category}\\nDescription: ${description || 'N/A'}\\nStudent: ${studentName}`;
  const location = `VISTAS Internship Coordinator Office, Admin Block`;

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
