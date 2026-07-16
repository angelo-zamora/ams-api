function getClientType(config) {
  return (config && config.client ? config.client : process.env.DB_CLIENT || 'mysql').toLowerCase();
}

function getTodayDateExpression(client) {
  if (!client) {
    return 'CURDATE()';
  }

  return client.toLowerCase() === 'oracle' ? 'TRUNC(SYSDATE)' : 'CURDATE()';
}

function getDateTruncExpression(client, columnName) {
  const normalizedClient = (client || 'mysql').toLowerCase();

  return normalizedClient === 'oracle' ? `TRUNC(${columnName})` : `DATE(${columnName})`;
}

function getCurrentTimestampExpression(client) {
  const normalizedClient = (client || 'mysql').toLowerCase();

  return normalizedClient === 'oracle' ? 'SYSDATE' : 'NOW()';
}

function buildHistoryQuery(client, limit) {
  const normalizedClient = (client || 'mysql').toLowerCase();
  const limitValue = Number(limit || 30);

  if (normalizedClient === 'oracle') {
    return `
      SELECT
        clock_in,
        clock_out
      FROM attendance
      WHERE employee_email = :employeeEmail
      ORDER BY clock_in DESC
      FETCH FIRST ${limitValue} ROWS ONLY
    `;
  }

  return `
    SELECT
      clock_in,
      clock_out
    FROM attendance
    WHERE employee_email = ?
    ORDER BY clock_in DESC
    LIMIT ?
  `;
}

module.exports = {
  getClientType,
  getTodayDateExpression,
  getDateTruncExpression,
  getCurrentTimestampExpression,
  buildHistoryQuery
};
