const { ConnectorClient, MicrosoftAppCredentials } = require('botframework-connector');
/**
 * ============================================
 * Bot Framework Service
 * ============================================
 */
class BotService {

    constructor() {
        // Teams service URL (Defaults to Americas, but can be configured for other regions)
        this.serviceUrl = process.env.TEAMS_SERVICE_URL || 'https://smba.trafficmanager.net/amer/';
        MicrosoftAppCredentials.trustServiceUrl(this.serviceUrl);
    }
    /**
     * Send a Proactive Message via Bot Framework
     */
    async sendProactiveMessage(userObjectId, messageText) {

        if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET || !process.env.AZURE_TENANT_ID) {
            throw new Error("Missing bot credentials (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, or AZURE_TENANT_ID).");
        }
        const credentials = new MicrosoftAppCredentials(process.env.AZURE_CLIENT_ID, process.env.AZURE_CLIENT_SECRET, process.env.AZURE_TENANT_ID);
        const client = new ConnectorClient(credentials, { baseUri: this.serviceUrl });
        const conversationParameters = {
            isGroup: false,
            bot: { id: process.env.AZURE_CLIENT_ID },
            members: [{ id: userObjectId }],
            tenantId: process.env.AZURE_TENANT_ID
        };
        const response = await client.conversations.createConversation(conversationParameters);
        const activity = {
            type: 'message',
            text: messageText
        };
        await client.conversations.sendToConversation(response.id, activity);
    }

    /**
     * Send a reminder request to the Teams Bot's internal /api/reminders/trigger endpoint.
     * The Bot handles all Adaptive Card logic and proactive message delivery.
     *
     * @param {string} userObjectId   Entra Object ID (aadObjectId) of the target user
     * @param {string} reminderType   One of the REMINDER_TYPE constants
     * @param {string} [tenantId]     Optional tenant ID
     * @param {string} [locale]       Optional locale string (e.g. "ja-JP")
     */
    async sendReminderToBot(userObjectId, reminderType, tenantId, locale) {
        const botEndpoint = process.env.BOT_REMINDER_ENDPOINT;
        const apiKey = process.env.BOT_REMINDER_API_KEY;

        if (!botEndpoint || !apiKey) {
            throw new Error('[BotService] Missing BOT_REMINDER_ENDPOINT or BOT_REMINDER_API_KEY environment variables.');
        }

        const url = `${botEndpoint}/api/reminders/trigger`;
        const body = JSON.stringify({ reminderType, userObjectId, tenantId, locale });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                },
                body,
            });

            if (response.ok) {
                console.log(`[BotService] ✅ Reminder sent: ${reminderType} → ${userObjectId}`);
                return;
            }

            const text = await response.text().catch(() => '');
            console.error(`[BotService] ❌ Reminder failed (${response.status}): ${reminderType} → ${userObjectId}. Response: ${text}`);
        } catch (err) {
            console.error(`[BotService] ❌ Reminder failed with error: ${err.message} for ${reminderType} → ${userObjectId}`);
            throw err;
        }
    }
}
module.exports = new BotService();
