const UserInfoResponse = require("../dto/UserInfoResponse");
const userService = require("../services/UserService");

class UserController {

    async getUserInfo(session, locale){
        const userInfo = await userService.getUserInfo(session, locale);
        return new UserInfoResponse(userInfo, locale);
    }
    
}

module.exports = new UserController();
