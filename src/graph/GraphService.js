const graphClient = require("../utils/GraphClient");
const graphConfig = require("../config/GraphConfig");

/**
 * ============================================
 * Microsoft Graph Service
 * ============================================
 */
class GraphService {

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
     * Get an App-Only Graph Client using Client Secret
     */
    getAppOnlyClient() {
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

        return Client.initWithMiddleware({ authProvider });
    }

    /**
     * Get User Object ID via Graph API
     */
    async getUserObjectId(email) {
        const client = this.getAppOnlyClient();

        // Get the target user's Graph Object ID using their email
        const user = await client.api(`/users/${email}`).get();

        return user.id;
    }
}

module.exports = new GraphService();
