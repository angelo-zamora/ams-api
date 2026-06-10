const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const tenantId = process.env.ENTRA_TENANT_ID || 'common';
const clientId = process.env.ENTRA_CLIENT_ID;

// Configure the JWKS client pointing to Microsoft's keys endpoint.
const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10
});

/**
 * Retrieve the public signing key matching the token's kid
 */
function getSigningKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

/**
 * Validates Microsoft Entra ID (Azure Active Directory) access token.
 * Supports both v1.0 and v2.0 token formats.
 * 
 * @param {string} token - The raw JWT token from the Authorization header
 * @returns {Promise<object>} Decoded token payload if verification succeeds
 */
function validateToken(token) {
  return new Promise((resolve, reject) => {
    if (!clientId) {
      return reject(new Error('Configuration error: ENTRA_CLIENT_ID is not configured in local.settings.json or Environment Variables.'));
    }

    if (!token) {
      return reject(new Error('No token provided'));
    }

    // Decode token without verification to extract header (kid) and payload claims (tid)
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header || !decoded.payload) {
      return reject(new Error('Invalid JWT format'));
    }

    const tokenTenantId = decoded.payload.tid;
    const expectedTenantId = process.env.ENTRA_TENANT_ID || 'common';

    // Establish expected issuers based on the tenant configuration
    const allowedIssuers = [];
    if (expectedTenantId === 'common' || expectedTenantId === 'organizations') {
      if (tokenTenantId) {
        allowedIssuers.push(`https://login.microsoftonline.com/${tokenTenantId}/v2.0`);
        allowedIssuers.push(`https://sts.windows.net/${tokenTenantId}/`);
      }
    } else {
      allowedIssuers.push(`https://login.microsoftonline.com/${expectedTenantId}/v2.0`);
      allowedIssuers.push(`https://sts.windows.net/${expectedTenantId}/`);
    }

    // Audiences list: Support standard Client ID and Client App ID URI (api://<clientId>)
    const allowedAudiences = [
      clientId,
      `api://${clientId}`
    ];

    jwt.verify(
      token,
      getSigningKey,
      {
        audience: allowedAudiences,
        issuer: allowedIssuers,
        algorithms: ['RS256']
      },
      (err, verified) => {
        if (err) {
          return reject(err);
        }
        resolve(verified);
      }
    );
  });
}

/**
 * Extracts bearer token from HTTP request Authorization header
 * 
 * @param {object} request - Azure Function request object
 * @returns {string|null} The token string or null if not present/invalid format
 */
function getBearerToken(request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }

  return null;
}

module.exports = {
  validateToken,
  getBearerToken
};
