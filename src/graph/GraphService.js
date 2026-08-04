const graphClient = require("../utils/GraphClient");
const graphConfig = require("../config/GraphConfig");

/**
 * ============================================
 * Microsoft Graph Service
 * ============================================
 */
class GraphService {

    constructor() {
        this.appOnlyClient = null;
        this.objectIdCache = new Map();
    }

    /**
     * Current Logged In User
     */
    async getCurrentUser(accessToken) {

        const client = graphClient.create(accessToken);

        const user = await client.api("/me").get();

        return {
            id: user.id,
            displayName: user.displayName,
            email: user.mail || user.userPrincipalName,
            employeeId: user.employeeId || "",
            userPrincipalName: user.userPrincipalName

        };
    }

    /**
     * Send Email as Logged-in User
     */
    async sendMail(accessToken, mail) {

        const client = graphClient.create(accessToken);

        await client.api("/me/sendMail").post({

            message: {
                subject: mail.subject,
                body: {
                    contentType: "HTML",
                    content: mail.body
                },
                toRecipients: mail.to.map(address => ({
                    emailAddress: {
                        address
                    }
                }))
            }
        });
    }

    /**
     * Get an App-Only Graph Client using Client Secret (Singleton reuse)
     */
    getAppOnlyClient() {
        if (!this.appOnlyClient) {
            const { ClientSecretCredential } = require("@azure/identity");
            const { TokenCredentialAuthenticationProvider } = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
            const { Client } = require("@microsoft/microsoft-graph-client");
            
            const credential = new ClientSecretCredential(
                graphConfig.tenantId,
                graphConfig.clientId,
                graphConfig.clientSecret
            );

            const authProvider = new TokenCredentialAuthenticationProvider(credential, {
                scopes: ["https://graph.microsoft.com/.default"]
            });

            this.appOnlyClient = Client.initWithMiddleware({ authProvider });
        }

        return this.appOnlyClient;
    }

    /**
     * Get User Object ID via Graph API with memory caching
     */
    async getUserObjectId(email) {
        if (!email) return null;
        const normalizedEmail = email.toLowerCase().trim();

        if (this.objectIdCache.has(normalizedEmail)) {
            return this.objectIdCache.get(normalizedEmail);
        }

        try {
            const client = this.getAppOnlyClient();

            // Select only necessary field 'id' to optimize response size
            const user = await client.api(`/users/${normalizedEmail}`).select("id").get();

            if (user && user.id) {
                this.objectIdCache.set(normalizedEmail, user.id);
                return user.id;
            }
        } catch (error) {
            console.error(`[GraphService] Error fetching object ID for ${email}:`, error.message);
        }

        return null;
    }
}

module.exports = new GraphService();
