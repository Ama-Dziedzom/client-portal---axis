import { Resend } from 'resend'
import { serverEnv } from './env'
import { logger } from './logger'

let _resend: Resend | null = null
function getResend() {
    if (!_resend) {
        const apiKey = serverEnv.resendApiKey()
        _resend = new Resend(apiKey || 're_placeholder')
    }
    return _resend
}

interface SendEmailOptions {
    to: string | string[]
    subject: string
    html: string
    replyTo?: string
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
    try {
        const fromName = serverEnv.resendFromName()
        const fromEmail = serverEnv.resendFromEmail()

        if (!fromEmail) {
            logger.warn('Email', 'RESEND_FROM_EMAIL not configured. Email will not be sent.')
            return null
        }

        const { data, error } = await getResend().emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            replyTo,
        })

        if (error) {
            logger.error('Email', 'Resend error', error)
            throw error
        }

        return data
    } catch (error) {
        logger.error('Email', 'Failed to send email', error)
        throw error
    }
}


// Email templates
export function invoicePaidEmail(clientName: string, invoiceNumber: string, amount: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f7f4f1; padding: 40px 20px; margin: 0; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e0da; }
        .header { background: #2F402C; padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 24px; margin: 0; letter-spacing: -0.01em; }
        .header p { color: rgba(255,255,255,0.7); font-size: 13px; margin: 8px 0 0; }
        .body { padding: 32px; }
        .body h2 { color: #1a1a1a; font-size: 20px; margin: 0 0 8px; }
        .body p { color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
        .badge { display: inline-block; background: #dcfce7; color: #16a34a; padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 600; }
        .footer { padding: 24px 32px; border-top: 1px solid #e5e0da; text-align: center; }
        .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Axis Living</h1>
          <p>Client Portal</p>
        </div>
        <div class="body">
          <h2>Payment Received</h2>
          <p>Hi ${clientName},</p>
          <p>We've received your payment for invoice <strong>${invoiceNumber}</strong> in the amount of <strong>${amount}</strong>.</p>
          <p><span class="badge">✓ Paid</span></p>
          <p>Thank you for your prompt payment. If you have any questions, please don't hesitate to reach out through your portal.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Axis Living. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function newMessageEmail(clientName: string, senderName: string, projectTitle: string, portalUrl: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f7f4f1; padding: 40px 20px; margin: 0; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e0da; }
        .header { background: #2F402C; padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 24px; margin: 0; }
        .header p { color: rgba(255,255,255,0.7); font-size: 13px; margin: 8px 0 0; }
        .body { padding: 32px; }
        .body h2 { color: #1a1a1a; font-size: 20px; margin: 0 0 8px; }
        .body p { color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
        .btn { display: inline-block; background: #2F402C; color: #ffffff; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600; }
        .footer { padding: 24px 32px; border-top: 1px solid #e5e0da; text-align: center; }
        .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Axis Living</h1>
          <p>Client Portal</p>
        </div>
        <div class="body">
          <h2>New Message</h2>
          <p>Hi ${clientName},</p>
          <p><strong>${senderName}</strong> sent you a new message regarding <strong>${projectTitle}</strong>.</p>
          <p>
            <a href="${portalUrl}/messages" class="btn">View Message</a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Axis Living. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
