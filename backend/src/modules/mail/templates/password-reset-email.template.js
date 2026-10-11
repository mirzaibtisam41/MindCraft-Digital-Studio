import { escapeHtmlUtil } from '#src/utils/index.js';

export function buildPasswordResetEmailTemplate({
  name,
  resetUrl,
  expiresInMinutes,
}) {
  const safeName = escapeHtmlUtil({ value: name });
  const safeUrl = escapeHtmlUtil({ value: resetUrl });
  const footer = `This link expires in ${expiresInMinutes} minutes and works only once. If you did not request a password reset, you can ignore this email.`;

  return {
    subject: 'Reset your Mindcraft Digital Studio password',
    text: `Hi ${name},

We received a request to reset your Mindcraft Digital Studio password. Open this link to choose a new one:

${resetUrl}

${footer}`,
    html: `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#0b0b10;font-family:Arial,Helvetica,sans-serif;color:#e7e7ee;">
    <div style="max-width:520px;margin:0 auto;background:#15151d;border-radius:12px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:22px;">Reset your password</h1>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.5;">Hi ${safeName},</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.5;">We received a request to reset your password. Click the button below to choose a new one.</p>
      <p style="margin:0 0 24px;"><a href="${safeUrl}" style="display:inline-block;background:#7c5cff;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:bold;">Reset password</a></p>
      <p style="margin:0 0 24px;font-size:13px;line-height:1.5;word-break:break-all;color:#a1a1b5;">${safeUrl}</p>
      <p style="margin:0;font-size:13px;line-height:1.5;color:#a1a1b5;">${footer}</p>
    </div>
  </body>
</html>`,
  };
}
