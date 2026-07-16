/**
 * ============================================
 * Microsoft Graph Configuration
 * Microsoft Graph 構成
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
module.exports = {
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    graphUrl: "https://graph.microsoft.com/v1.0"
};