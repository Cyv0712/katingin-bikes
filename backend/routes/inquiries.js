const express = require('express');
const router = express.Router();

const LOGO_URL = 'https://www.katinginbikes.com/static_data/Katingin_logo.webp';

// Simple HTML escaper to prevent XSS in email templates
const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};


// POST /api/inquiries - Submit a new financing / unit inquiry
router.post('/', async (req, res) => {
  try {
    let { name, email, contactNumber, unitInterested, message } = req.body;

    // Validation
    if (!name || !email || !contactNumber || !unitInterested) {
      return res.status(400).json({ message: 'Missing required fields: name, email, contactNumber, and unitInterested are required.' });
    }

    // Sanitize inputs before injecting into email HTML
    name = escapeHtml(name);
    email = escapeHtml(email);
    contactNumber = escapeHtml(contactNumber);
    unitInterested = escapeHtml(unitInterested);
    message = escapeHtml(message);

    // Note: Inquiry data is NO LONGER saved to the database to comply with 
    // the Data Privacy Act explicit minimal storage directive. Data is ONLY emailed.

    // 2. Automated Email System via Resend (HTTP API)
    const resendApiKey = process.env.RESEND_API_KEY;
    const receiverEmail = process.env.INQUIRY_RECEIVER_EMAIL;
    // Resend's free tier default sender is onboarding@resend.dev
    const senderEmail = process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev';

    if (resendApiKey && receiverEmail) {
      try {
        const mailOptions = {
          from: `Katingin Bikes <${senderEmail}>`,
          to: receiverEmail,
          subject: `🔔 New Financing Inquiry: ${unitInterested} — ${name}`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #111111; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">

              <!-- Header / Logo Banner -->
              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); padding: 32px 40px; text-align: center; border-bottom: 2px solid #D4AF37;">
                <img src="${LOGO_URL}" alt="Katingin Bikes" style="max-height: 90px; max-width: 280px; object-fit: contain; display: block; margin: 0 auto 12px auto;" />
                <p style="margin: 0; font-size: 11px; letter-spacing: 3px; color: #888888; text-transform: uppercase;">Financing Inquiry Notification</p>
              </div>

              <!-- Body -->
              <div style="padding: 36px 40px;">
                <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">New Application Received</h2>
                <p style="margin: 0 0 28px 0; font-size: 14px; color: #888888; line-height: 1.6;">A potential client has submitted a financing inquiry through the Katingin Bikes website. Their details are listed below.</p>

                <!-- Info Table -->
                <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden;">
                   <tr>
                    <td style="padding: 14px 16px; background-color: #1a1a1a; border-bottom: 1px solid #222; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #888888; text-transform: uppercase; width: 38%;">Applicant Name</td>
                    <td style="padding: 14px 16px; background-color: #1a1a1a; border-bottom: 1px solid #222; font-size: 15px; color: #ffffff; font-weight: 600;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 14px 16px; background-color: #161616; border-bottom: 1px solid #222; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #888888; text-transform: uppercase;">Email Address</td>
                    <td style="padding: 14px 16px; background-color: #161616; border-bottom: 1px solid #222; font-size: 14px; color: #60a5fa;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 14px 16px; background-color: #1a1a1a; border-bottom: 1px solid #222; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #888888; text-transform: uppercase;">Contact Number</td>
                    <td style="padding: 14px 16px; background-color: #1a1a1a; border-bottom: 1px solid #222; font-size: 14px; color: #ffffff;">${contactNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 14px 16px; background-color: #161616; border-bottom: 1px solid #222; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #888888; text-transform: uppercase;">Unit Interested</td>
                    <td style="padding: 14px 16px; background-color: #161616; border-bottom: 1px solid #222; font-size: 15px; color: #D4AF37; font-weight: 700;">${unitInterested}</td>
                  </tr>
                  <tr>
                    <td style="padding: 14px 16px; background-color: #1a1a1a; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #888888; text-transform: uppercase; vertical-align: top;">Message</td>
                    <td style="padding: 14px 16px; background-color: #1a1a1a; font-size: 14px; color: #cccccc; line-height: 1.7;">${message ? message.replace(/\n/g, '<br>') : '<span style="color: #555; font-style: italic;">No message provided</span>'}</td>
                  </tr>
                </table>

                <!-- CTA Note -->
                <div style="margin-top: 28px; padding: 16px 20px; background-color: #1a1500; border-left: 3px solid #D4AF37; border-radius: 4px;">
                  <p style="margin: 0; font-size: 13px; color: #cccccc; line-height: 1.6;">
                    To follow up with this applicant, contact them directly using the <strong style="color: #ffffff;">email address or phone number</strong> listed in their inquiry above.
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="padding: 24px 40px; background-color: #0d0d0d; border-top: 1px solid #222; text-align: center;">
                <p style="margin: 0 0 6px 0; font-size: 13px; color: #555555;">Katingin Bikes &nbsp;|&nbsp; katingin.bikes@gmail.com &nbsp;|&nbsp; 09435509357</p>
                <p style="margin: 0; font-size: 11px; color: #3a3a3a; letter-spacing: 1px;">This is an automated notification from the Katingin Bikes website.</p>
              </div>

            </div>
          `
        };

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify(mailOptions)
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          throw new Error(`Resend API response status ${emailResponse.status}: ${errorText}`);
        }

        const emailResult = await emailResponse.json();
        console.log(`[Resend] Inquiry email successfully dispatched to ${receiverEmail}. ID: ${emailResult.id}`);
      } catch (mailErr) {
        console.error('[Resend] Failed to send inquiry email notification:', mailErr);
        return res.status(500).json({ message: 'Failed to send inquiry email. Please try again later.' });
      }
    } else {
      console.warn('[Resend] Inquiries email not configured. Missing RESEND_API_KEY or INQUIRY_RECEIVER_EMAIL.');
      return res.status(500).json({ message: 'Email system not configured on the server.' });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry submitted successfully via email.',
      data: null // We no longer return the saved object since it isn't saved
    });
  } catch (err) {
    console.error('Error handling inquiry submission:', err);
    res.status(500).json({ message: 'An internal server error occurred while processing your inquiry.' });
  }
});

module.exports = router;
