const userRepository = require("../repositories/UserRepository");
const employeeService = require("./EmployeeService");
const localeHelper = require("../helpers/LocaleHelper");
const validator = require("../validators/UserValidator");

class UserService {

    async getUserInfo(session, locale) {

        const email = session.currentUser.email;
        const employee = await employeeService.validateEmployee(email, locale);
        const userInfo = await userRepository.getUserInfo(employee.USERNO);
        validator.validateUserInfo(userInfo);

        return userInfo;
    }

    
}

module.exports = new UserService();
