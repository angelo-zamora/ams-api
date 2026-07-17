/**
 * ============================================
 * Token Repository
 * トークン保存リポジトリ
 * ============================================
 */
class TokenRepository {
    constructor() {
        this.store = new Map();
    }

    get(userNo) {
        return this.store.get(userNo) || null;
    }

    set(userNo, token) {
        this.store.set(userNo, token);
        return token;
    }

    remove(userNo) {
        this.store.delete(userNo);
    }
}

module.exports = new TokenRepository();
module.exports.TokenRepository = TokenRepository;
