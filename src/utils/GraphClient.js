/**
 * ============================================
 * Microsoft Graph Client
 * Graphクライアント
 * ============================================
 */

const { Client } = require("@microsoft/microsoft-graph-client");

class GraphClient {

    create(accessToken) {

        return Client.init({

            authProvider: (done) => {

                done(null, accessToken);

            }

        });

    }

}

module.exports = new GraphClient();