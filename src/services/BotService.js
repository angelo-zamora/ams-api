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
}
module.exports = new BotService();