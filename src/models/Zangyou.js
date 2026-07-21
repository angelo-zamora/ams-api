class Zangyou {
  constructor(data = {}) {
    this.userNo = data.USERNO || null;
    this.reqDate = data.REQDATE || null;
    this.startHour = data.STARTHOUR || null;
    this.startMin = data.STARTMIN || null;
    this.endHour = data.ENDHOUR || null;
    this.endMin = data.ENDMIN || null;
    this.udtDate = data.UDTDATE || null;
    this.udtUser = data.UDTUSER || null;
    this.reason = data.REASON || null;
  }

  static fromDbRow(row) {
    return row ? new Zangyou(row) : null;
  }

  toJSON() {
    return {
      userNo: this.userNo,
      reqDate: this.reqDate,
      startHour: this.startHour,
      startMin: this.startMin,
      endHour: this.endHour,
      endMin: this.endMin,
      udtDate: this.udtDate,
      udtDate: this.udtUser,
      reason: this.reason
    };
  }
}

module.exports = Zangyou;