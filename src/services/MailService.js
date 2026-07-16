const graphService = require("../graph/GraphService");
const Constants = require("../helpers/Constants");
const config = require("../config/AppConfig");
const dateHelper = require("../helpers/DateHelper");
/**
 * ============================================
 * Mail Service
 * メールサービス
 * ============================================
 */
class MailService {

    async sendClockIn(accessToken, employee, now) {

        await graphService.sendMail(

            accessToken,
            {
                subject: Constants.SUBJECT_MAIL.CLOCK_IN,
                body: `
                    社員番号: ${employee.USERNO}<br>
                    日付: ${dateHelper.date(now)}<br>
                    時間: ${dateHelper.time(now)}
                `,
                to: [
                    process.env.ATTENDANCE_MAIL
                ]
            }
        );
    }

    async sendClockOut(accessToken, employee) {
        //
    }

}

module.exports = new MailService();