/**
 * Utility to dispatch email alerts for tickets and bug reports
 * Target: siddarth@mhcglobal.info
 */

const TARGET_EMAIL = 'siddarth@mhcglobal.info';

export async function sendTicketEmailAlert(ticket) {
  if (!ticket) return false;

  const subject = `[VISTAS Portal - ${ticket.type === 'BUG_REPORT' ? 'BUG REPORT' : 'FEATURE'}] ${ticket.title} (${ticket.submitterRole === 'STUDENT' ? 'STUDENT' : 'COORDINATOR'})`;

  const payload = {
    _subject: subject,
    _template: 'table',
    _captcha: 'false',
    Ticket_ID: ticket.id,
    Type: ticket.type === 'BUG_REPORT' ? 'Bug Report' : ticket.type === 'FEATURE_REQUEST' ? 'Feature Request' : 'Enhancement',
    Severity_Priority: ticket.priority,
    Affected_Module: ticket.category,
    Submitter_Role: ticket.submitterRole || 'COORDINATOR',
    Submitter_Name: ticket.submitterName || 'Unknown',
    Submitter_Email: ticket.submitterEmail || 'N/A',
    Register_Number: ticket.studentRegisterNumber || 'N/A',
    Title: ticket.title,
    Description: ticket.description,
    Reproduction_Steps: ticket.reproductionSteps || 'N/A',
    Expected_Benefit: ticket.expectedBenefit || 'N/A',
    Browser_Diagnostics: ticket.environment?.browser || 'N/A',
    Screen_Resolution: ticket.environment?.screen || 'N/A',
    Page_URL: ticket.environment?.url || 'N/A',
    Submission_Date: new Date(ticket.createdAt || Date.now()).toLocaleString()
  };

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`[EmailNotifier] Alert dispatched to ${TARGET_EMAIL} for ticket ${ticket.id}`);
      return true;
    } else {
      console.warn(`[EmailNotifier] FormSubmit responded with status ${response.status}`);
      return false;
    }
  } catch (err) {
    // Graceful error logging so offline / network issues don't crash UI
    console.warn(`[EmailNotifier] Could not send email alert to ${TARGET_EMAIL}:`, err);
    return false;
  }
}
