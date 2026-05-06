const PLUNK_API_URL = 'https://next-api.useplunk.com/v1/send';

async function sendEmail(opts: { to: string; subject: string; body: string }) {
  const apiKey = process.env.PLUNK_API_KEY;
  if (!apiKey) {
    throw new Error('PLUNK_API_KEY is not configured');
  }

  const from = process.env.PLUNK_FROM_EMAIL ?? process.env.PORTAL_CONTACT_EMAIL ?? 'admin@shegymz.com';

  const response = await fetch(PLUNK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      to: opts.to,
      subject: opts.subject,
      body: opts.body,
      from,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Plunk API error ${response.status}: ${text}`);
  }
}

export async function sendPortalOtpEmail(args: {
  email: string;
  otpCode: string;
  expiresInMinutes: number;
}): Promise<void> {
  await sendEmail({
    to: args.email,
    subject: 'Your SheGymZ secure code',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color:#351229;">
        <h2 style="color:#351229;">Your SheGymZ secure code</h2>
        <p>Use the secure code below to continue creating your member account.</p>
        <div style="margin:24px 0;padding:18px 24px;background:#f5f1ec;border-radius:16px;font-size:32px;font-weight:bold;letter-spacing:0.25em;text-align:center;color:#351229;">
          ${args.otpCode}
        </div>
        <p>This code expires in ${args.expiresInMinutes} minutes.</p>
        <p>If you did not request this code, you can ignore this email.</p>
      </div>
    `,
  });
}
