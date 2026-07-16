const graphClient = require("../utils/GraphClient");

/**
 * ============================================
 * Microsoft Graph Service
 * Microsoft Graphサービス
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
}

module.exports = new GraphService();