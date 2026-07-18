import { Resend } from "resend";
import QRCode from "qrcode";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.EMAIL_FROM || "Eventallify <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Any value that lands in an email template must be escaped — event titles,
// user names, etc. are attacker-controllable (an admin account, or anyone
// who can create an event/profile), and this HTML has no sanitizer downstream.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface SendVerificationEmailParams {
  user: {
    email: string;
    name: string;
    [key: string]: unknown;
  };
  url: string;
  token: string;
}

export async function sendVerificationEmail({
  user,
  url,
}: SendVerificationEmailParams) {
  const email = user.email;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="background:linear-gradient(135deg,#18181b,#27272a);padding:32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Eventallify</h1>
          <p style="color:#a1a1aa;margin:8px 0 0;font-size:14px;">Verify your email address</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#27272a;font-size:16px;line-height:24px;margin:0 0 16px;">
            Thanks for signing up! Please verify your email address to get started.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${url}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
              Verify Email Address
            </a>
          </div>
          <p style="color:#71717a;font-size:13px;line-height:20px;margin:0;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
        <div style="background:#f4f4f5;padding:16px 32px;text-align:center;">
          <p style="color:#a1a1aa;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} Eventallify. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your email - Eventallify",
    html,
  });

  // resend does NOT throw on API failure — it returns { error } — so this
  // check is the only thing standing between a bad send and total silence
  if (error) {
    console.error("[email] verification email failed:", error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

interface SendEventRegistrationEmailParams {
  email: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventDescription: string;
  registrationId: string;
  eventId: string;
}

export async function sendEventRegistrationEmail({
  email,
  userName,
  eventTitle,
  eventDate,
  eventVenue,
  eventDescription,
  registrationId,
  eventId,
}: SendEventRegistrationEmailParams) {
  const eventUrl = `${APP_URL}/events/${eventId}`;

  // Encode the registration itself, not the event page — this is what lets
  // staff scan a ticket at the door and check in *this specific* attendee,
  // not just land on a public page anyone's QR code would also produce.
  const checkInUrl = `${APP_URL}/checkin/${registrationId}`;

  const qrDataUrl = await QRCode.toDataURL(checkInUrl, {
    width: 200,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });

  const safeUserName = escapeHtml(userName);
  const safeEventTitle = escapeHtml(eventTitle);
  const safeEventVenue = escapeHtml(eventVenue);
  const safeEventDate = escapeHtml(eventDate);
  const truncatedDescription = eventDescription
    ? eventDescription.slice(0, 200) +
      (eventDescription.length > 200 ? "..." : "")
    : "";
  const safeEventDescription = escapeHtml(truncatedDescription);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="background:linear-gradient(135deg,#18181b,#27272a);padding:32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Eventallify</h1>
          <p style="color:#a1a1aa;margin:8px 0 0;font-size:14px;">Registration Confirmed</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#27272a;font-size:16px;line-height:24px;margin:0 0 24px;">
            Hi <strong>${safeUserName}</strong>, you're all set!
          </p>

          <div style="background:#f4f4f5;border-radius:8px;padding:20px;margin-bottom:24px;">
            <h2 style="color:#18181b;font-size:20px;font-weight:700;margin:0 0 12px;">${safeEventTitle}</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:4px 0;color:#71717a;font-size:14px;width:80px;vertical-align:top;">📅 Date</td>
                <td style="padding:4px 0;color:#27272a;font-size:14px;font-weight:500;">${safeEventDate}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#71717a;font-size:14px;vertical-align:top;">📍 Venue</td>
                <td style="padding:4px 0;color:#27272a;font-size:14px;font-weight:500;">${safeEventVenue}</td>
              </tr>
            </table>
            ${safeEventDescription ? `<p style="color:#52525b;font-size:13px;line-height:20px;margin:12px 0 0;">${safeEventDescription}</p>` : ""}
          </div>

          <div style="text-align:center;margin:24px 0;">
            <p style="color:#71717a;font-size:13px;margin:0 0 12px;">Your QR Code Ticket</p>
            <img src="${qrDataUrl}" alt="QR Code" style="width:200px;height:200px;border-radius:8px;border:1px solid #e4e4e7;" />
            <p style="color:#a1a1aa;font-size:12px;margin:8px 0 0;">Show this at the event entrance</p>
          </div>

          <div style="text-align:center;margin:24px 0 0;">
            <a href="${eventUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
              View Event Details
            </a>
          </div>
        </div>
        <div style="background:#f4f4f5;padding:16px 32px;text-align:center;">
          <p style="color:#a1a1aa;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} Eventallify. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Registration Confirmed: ${eventTitle}`,
    html,
  });

  if (error) {
    console.error("[email] registration email failed:", error);
    throw new Error(`Failed to send registration email: ${error.message}`);
  }
}
