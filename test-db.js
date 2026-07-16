const fs = require('fs');
if (fs.existsSync('./local.settings.json')) {
    const settings = JSON.parse(fs.readFileSync('./local.settings.json', 'utf8'));
    if (settings.Values) {
        Object.assign(process.env, settings.Values);
    }
}
const db = require("./src/database/DatabaseFactory");  async function testConnection() {     try {         console.log("Attempting to connect to MySQL...");         const result = await db.getConnection().execute("SELECT 1 FROM DUAL"); const rows = result.rows;         console.log("SUCCESS! Connection is working properly.");         console.log("Result:", rows);         process.exit(0);     } catch (error) {         console.error("ERROR! Failed to connect to MySQL.");         console.error(error);         process.exit(1);     } }  testConnection();
