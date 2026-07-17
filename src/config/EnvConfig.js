const fs = require("fs");
const path = require("path");

class EnvConfig {
    constructor() {
        this.load();
    }

    load() {
        const settingsPath = path.resolve(__dirname, "../../local.settings.json");

        if (!fs.existsSync(settingsPath)) {
            return;
        }

        const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
        const values = settings.Values || {};

        for (const [key, value] of Object.entries(values)) {
            if (!process.env[key] && value !== undefined && value !== null) {
                process.env[key] = String(value);
            }
        }
    }

    get(key) {
        return process.env[key];
    }
}

module.exports = new EnvConfig();
