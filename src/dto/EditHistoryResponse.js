/**
 * ============================================
 * Edit History Response DTO
 * Author: CRESS-INFO Ephraim
 * Date: 2026/09/10
 * ============================================
 */
class EditHistoryResponse {

    constructor(editHistory) {
        if (Array.isArray(editHistory) && editHistory.length > 0) {
            this.editHistory = editHistory;
        } else {
            this.editHistory = [];
        }
    }

}

module.exports = EditHistoryResponse;
