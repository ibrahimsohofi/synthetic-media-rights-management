import nodemailer from 'nodemailer';

if (!process.env.SMTP_HOST) {
  throw new Error('SMTP_HOST is not defined');
}

if (!process.env.SMTP_PORT) {
  throw new Error('SMTP_PORT is not defined');
}

if (!process.env.SMTP_USER) {
  throw new Error('SMTP_USER is not defined');
}

if (!process.env.SMTP_PASSWORD) {
  throw new Error('SMTP_PASSWORD is not defined');
}

if (!process.env.ALERT_EMAIL_FROM) {
  throw new Error('ALERT_EMAIL_FROM is not defined');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmailAlert(
  recipients: string[],
  message: string,
  subject?: string
): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.ALERT_EMAIL_FROM,
      to: recipients.join(', '),
      subject: subject || 'System Alert',
      text: message,
      html: formatAlertEmail(message),
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send email alert:', error);
    throw error;
  }
}

function formatAlertEmail(message: string): string {
  const data = JSON.parse(message);
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .alert {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
          }
          .alert-header {
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .alert-title {
            font-size: 18px;
            font-weight: bold;
            color: #e74c3c;
            margin: 0;
          }
          .alert-timestamp {
            color: #666;
            font-size: 12px;
          }
          .alert-body {
            margin: 15px 0;
          }
          .alert-metric {
            margin: 10px 0;
          }
          .alert-metric-label {
            font-weight: bold;
          }
          .alert-footer {
            font-size: 12px;
            color: #666;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="alert">
          <div class="alert-header">
            <h2 class="alert-title">${data.title}</h2>
            <div class="alert-timestamp">${new Date(data.timestamp).toLocaleString()}</div>
          </div>
          <div class="alert-body">
            <div class="alert-metric">
              <span class="alert-metric-label">Type:</span> ${data.type}
            </div>
            ${Object.entries(data.data)
              .map(
                ([key, value]) => `
                <div class="alert-metric">
                  <span class="alert-metric-label">${formatKey(key)}:</span> ${formatValue(value)}
                </div>
              `
              )
              .join('')}
          </div>
          <div class="alert-footer">
            This is an automated alert from the monitoring system. Please do not reply to this email.
          </div>
        </div>
      </body>
    </html>
  `;
}

function formatKey(key: string): string {
  return key
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
} 