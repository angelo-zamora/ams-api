class UserMembersResponse {
    constructor(members, locale) {
        if (!members || members.length === 0) {
            this.members = false;
        } else {
            this.members = members.map(m => ({
                userNo: m.USERNO || "",
                userName: m.USERNAME || "",
                department: m.DEPARTMENT || "",
                workspace: m.WORKSPACE || null,
                projectName: m.PROJECTNAME || null,
                projectCode: m.PROJECTCODE || null,
                flexFileName: m.FLEXFILENAME || "",
                mailAddress: m.MAILADDRESS || ""
            }));
        }
    }
}

module.exports = UserMembersResponse;