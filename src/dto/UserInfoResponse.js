const localeHelper = require("../helpers/LocaleHelper");
const constants = require("../helpers/Constants");
const dateHelper = require("../helpers/DateHelper");

class UserInfoResponse {
    constructor(userInfo, locale) {
        if (userInfo) {
            this.userInfo = {
                userNo: userInfo.USERNO || "",
                userName: userInfo.USERNAME || "",
                role: userInfo.ROLE || "",
                department: userInfo.DEPARTMENT || "",
                workspace: userInfo.WORKSPACE || null,
                projectName: userInfo.PROJECTNAME || null,
                projectCode: userInfo.PROJECTCODE || null,
                flexFileName: userInfo.FLEXFILENAME || "",
                mailAddress: userInfo.MAILADDRESS || ""
            };
        } else {
            this.userInfo = null;
        }
    }
}

module.exports = UserInfoResponse;