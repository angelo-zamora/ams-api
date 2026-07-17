/**
 * ============================================
 * Logger
 * ログ出力
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class Logger {

    info(message) {
        console.log(
            `[INFO] ${new Date().toISOString()} ${message}`
        );
    }

    warn(message) {
        console.warn(
            `[WARN] ${new Date().toISOString()} ${message}`
        );
    }

    error(error) {
        console.error(
            `[ERROR] ${new Date().toISOString()}`,
            error
        );
    }

}

module.exports = new Logger();