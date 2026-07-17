class TimeManage {
  constructor(data = {}) {
    this.userNo = data.USERNO || null;
    this.date_ = data.DATE_ || null;
    this.status = data.STATUS || null;
    this.startHour = data.STARTHOUR || null;
    this.startMin = data.STARTMIN || null;
    this.endHour = data.ENDHOUR || null;
    this.endMin = data.ENDMIN || null;
    this.udtDate = data.UDTDATE || null;
    this.reason = data.REASON || null;
  }

  static fromDbRow(row) {
    return row ? new TimeManage(row) : null;
  }

  toJSON() {
    return {
      userNo: this.userNo,
      date_: this.date_,
      status: this.status,
      startHour: this.startHour,
      startMin: this.startMin,
      endHour: this.endHour,
      endMin: this.endMin,
      udtDate: this.udtDate,
      reason: this.reason
    };
  }
}

module.exports = TimeManage;