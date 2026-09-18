const localeHelper = require("../helpers/LocaleHelper");

class UserValidator {

    validateUserInfo(userInfo){
        if (!userInfo) {
            throw new Error("USER_NOT_FOUND");
        }
    }

}

module.exports = new UserValidator();