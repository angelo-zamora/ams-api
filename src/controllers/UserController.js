const UserInfoResponse = require("../dto/UserInfoResponse");
const userService = require("../services/UserService");
const UserMembersResponse = require("../dto/UserMembersResponse");

class UserController {

    async getUserInfo(session, locale){
        const userInfo = await userService.getUserInfo(session, locale);
        return new UserInfoResponse(userInfo, locale);
    }

    async getUserMembers(session, locale) {
        const members = await userService.getUserMembers(session, locale);
        return new UserMembersResponse(members, locale);
    }
    
}

module.exports = new UserController();
