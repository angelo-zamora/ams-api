const querystring = require('querystring');

if (typeof fetch === 'undefined') {
    try {
        // node 18+ has global fetch; fall back to node-fetch when unavailable
        global.fetch = require('node-fetch');
    } catch (e) {
        // will surface when attempting to call fetch
    }
}
// Optional SMTP fallback for local testing
let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch (e) {
    nodemailer = null;
}

async function getToken() {
    const tokenUrl = process.env.MS_URL_TOKEN;
    if (!tokenUrl) throw new Error('MS_URL_TOKEN not configured');

    // Prefer client credentials (app-only) when a client secret is provided.
    const useAppCredentials = !!process.env.MS_CLIENT_SECRET;

    let body;
    if (useAppCredentials) {
        body = {
            client_id: process.env.MS_CLIENT_ID,
            client_secret: process.env.MS_CLIENT_SECRET,
            scope: process.env.MS_SCOPE || 'https://graph.microsoft.com/.default',
            grant_type: 'client_credentials'
        };
    } else {
        // Fallback to ROPC (username/password). This often fails when MFA is required.
        body = {
            client_id: process.env.MS_CLIENT_ID,
            client_secret: process.env.MS_CLIENT_SECRET,
            scope: process.env.MS_SCOPE,
            grant_type: 'password',
            username: process.env.MS_USER_EMAIL,
            password: process.env.MS_USER_PASSWORD,
        };
    }

    const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: querystring.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Token request failed: ${res.status} ${text}`);
    }

    const payload = await res.json();
    if (!payload.access_token) throw new Error('No access_token in token response');
    return payload.access_token;
}

async function sendMail(toRecipients, subject, htmlBody) {
    if (!Array.isArray(toRecipients)) throw new Error('toRecipients must be an array');
    // If SMTP is configured, use it for local/dev testing
    if (process.env.MS_SMTP_HOST) {
        if (!nodemailer) throw new Error('nodemailer is not installed. Run `npm install nodemailer`.');
        const smtpHost = process.env.MS_SMTP_HOST;
        const smtpPort = parseInt(process.env.MS_SMTP_PORT || '587', 10);
        const secure = (process.env.MS_SMTP_SECURE || 'false') === 'true';
        const authUser = process.env.MS_SMTP_USER || process.env.MS_USER_EMAIL;
        const authPass = process.env.MS_SMTP_PASSWORD || process.env.MS_USER_PASSWORD;

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure,
            auth: authUser && authPass ? { user: authUser, pass: authPass } : undefined,
        });

        const fromAddress = process.env.MS_SMTP_FROM || process.env.MS_USER_EMAIL || authUser;

        const info = await transporter.sendMail({
            from: fromAddress,
            to: toRecipients.join(','),
            subject,
            html: htmlBody,
        });

        return info;
    }

    const token = await getToken();

    // If using app credentials, send via the /users/{sender}/sendMail endpoint
    const useAppCredentials = !!process.env.MS_CLIENT_SECRET;
    let url;
    if (useAppCredentials) {
        const root = (process.env.MS_URL_EMAIL_ROOT || 'https://graph.microsoft.com/v1.0').replace(/\/$/, '');
        if (!process.env.MS_USER_EMAIL) throw new Error('MS_USER_EMAIL must be set when using app credentials');
        url = `${root}/users/${encodeURIComponent(process.env.MS_USER_EMAIL)}/sendMail`;
    } else {
        url = process.env.MS_URL_EMAIL || 'https://graph.microsoft.com/v1.0/me/sendMail';
    }

    const message = {
        message: {
            subject,
            body: {
                contentType: 'HTML',
                content: htmlBody,
            },
            toRecipients: toRecipients.map(email => ({ emailAddress: { address: email } })),
        },
        saveToSentItems: true
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`sendMail failed: ${res.status} ${text}`);
    }

    return true;
}

module.exports = { sendMail };
