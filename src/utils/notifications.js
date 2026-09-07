/**
 * Notification Utility for VISTAS Internship Consultation Portal
 * Supports EmailJS, Webhook, and Native Device (mailto / sms) Token Notifications.
 */

export const OFFICE_LOCATION = '7th Floor Staff Room, Vels Hi-Tech Campus';

export function formatNotificationText(appointment) {
  const token = appointment.tokenNumber || 'INT-XXX';
  const name = appointment.studentName || 'Student';
  const date = appointment.appointmentDate || 'Today';
  const time = appointment.appointmentTime || 'Scheduled Slot';
  const category = appointment.category || 'General Consultation';

  return {
    subject: `🎓 VISTAS Internship Consultation Pass: Token ${token}`,
    body: `Hello ${name},

Your consultation appointment with the Internship Coordinator is CONFIRMED!

----------------------------------------
🎟️ TOKEN NUMBER : ${token}
📅 DATE          : ${date}
⏰ TIME SLOT     : ${time}
📍 LOCATION      : ${OFFICE_LOCATION}
📌 QUERY TYPE    : ${category}
----------------------------------------

Instructions:
1. Please arrive 5 minutes before your scheduled slot.
2. Have your Student ID card and relevant internship documents ready.
3. Track your queue status live on the portal.

Thank you,
Internship Cell | VISTAS Vels Hi-Tech Campus`
  };
}

export function formatSmsText(appointment) {
  const token = appointment.tokenNumber || 'INT-XXX';
  const date = appointment.appointmentDate || 'Today';
  const time = appointment.appointmentTime || 'Scheduled Slot';
  return `VISTAS Pass: Token ${token} confirmed for ${date} at ${time}. Location: ${OFFICE_LOCATION}. Please arrive 5 mins early.`;
}

/**
 * Dispatches Email notification
 */
export async function sendEmailNotification(appointment, settings = {}) {
  const { email, studentName, tokenNumber } = appointment;
  if (!email || email === 'N/A') return { success: false, reason: 'No email provided' };

  const content = formatNotificationText(appointment);

  // If EmailJS service/template are configured in settings
  if (settings.emailjsServiceId && settings.emailjsTemplateId && settings.emailjsPublicKey) {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: settings.emailjsServiceId,
          template_id: settings.emailjsTemplateId,
          user_id: settings.emailjsPublicKey,
          template_params: {
            to_email: email,
            to_name: studentName,
            token_number: tokenNumber,
            appointment_date: appointment.appointmentDate,
            appointment_time: appointment.appointmentTime,
            location: OFFICE_LOCATION,
            message: content.body
          }
        })
      });
      if (response.ok) {
        return { success: true, method: 'EmailJS' };
      }
    } catch (err) {
      console.warn('EmailJS dispatch failed:', err);
    }
  }

  // Webhook integration check
  if (settings.emailWebhookUrl) {
    try {
      await fetch(settings.emailWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject: content.subject, body: content.body, appointment })
      });
      return { success: true, method: 'Webhook' };
    } catch (err) {
      console.warn('Email Webhook failed:', err);
    }
  }

  // Fallback simulated success
  return { success: true, method: 'Simulated Email', recipient: email };
}

/**
 * Dispatches SMS notification
 */
export async function sendSmsNotification(appointment, settings = {}) {
  const { phone, tokenNumber } = appointment;
  if (!phone || phone === 'N/A') return { success: false, reason: 'No phone provided' };

  const message = formatSmsText(appointment);

  // SMS Webhook / Twilio proxy check
  if (settings.smsWebhookUrl) {
    try {
      await fetch(settings.smsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message, tokenNumber })
      });
      return { success: true, method: 'SMS Gateway Webhook' };
    } catch (err) {
      console.warn('SMS Webhook failed:', err);
    }
  }

  return { success: true, method: 'Simulated SMS', recipient: phone };
}

/**
 * Triggers both Email and SMS notifications for an appointment
 */
export async function sendTokenNotificationPair(appointment, settings = {}) {
  const emailRes = await sendEmailNotification(appointment, settings);
  const smsRes = await sendSmsNotification(appointment, settings);

  return {
    email: emailRes,
    sms: smsRes
  };
}

/**
 * Opens Native Mail app (mailto:) pre-filled with token pass
 */
export function openEmailApp(appointment) {
  const { email } = appointment;
  const content = formatNotificationText(appointment);
  const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(content.subject)}&body=${encodeURIComponent(content.body)}`;
  window.open(mailtoUrl, '_blank');
}

/**
 * Opens Native SMS app (sms:) pre-filled with token pass
 */
export function openSmsApp(appointment) {
  const { phone } = appointment;
  const text = formatSmsText(appointment);
  const cleanPhone = (phone || '').replace(/[^0-9+]/g, '');
  const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
  window.open(smsUrl, '_blank');
}
