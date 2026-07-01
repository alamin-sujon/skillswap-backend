import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpTemplateService {
  generateOtpHtml({
    otp,
    userName,
    expiryMinutes,
    supportEmail,
    companyName,
  }: {
    otp: number;
    userName?: string;
    expiryMinutes?: number;
    supportEmail?: string;
    companyName?: string;
  }): string {
    return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
 
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial, Helvetica, sans-serif;color:#000000;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="padding:32px;">
          <tr>
            <td style="font-size:18px;font-weight:bold;padding-bottom:24px;">
              ${companyName || 'Your Company'}
            </td>
          </tr>

          <tr>
            <td style="font-size:15px;padding-bottom:12px;">
              Hello ${userName || 'User'},
            </td>
          </tr>

          <tr>
            <td style="font-size:14px;line-height:1.6;padding-bottom:24px;">
              Use the one-time password below to complete your request.
              This code is valid for a limited time.
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:20px 0;">
              <div style="font-size:32px;font-weight:bold;letter-spacing:6px;">
                ${otp}
              </div>
            </td>
          </tr>

          <tr>
            <td style="font-size:13px;line-height:1.6;padding-top:12px;padding-bottom:24px;">
              This code will expire in <strong>${expiryMinutes || 5} minutes</strong>.
              If you did not request this code, please ignore this email.
            </td>
          </tr>

          <tr>
            <td style="font-size:12px;padding-top:24px;">
              Need help? Contact us at
              <a href="mailto:${supportEmail || 'support@example.com'}" style="color:#000000;text-decoration:underline;">
                ${supportEmail || 'support@example.com'}
              </a>
            </td>
          </tr>

          <tr>
            <td style="font-size:11px;color:#555555;padding-top:32px;">
              This email was sent by ${companyName || 'Your Company'}.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}
