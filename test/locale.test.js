const assert = require("assert");
const LocaleHelper = require("../src/helpers/LocaleHelper");
const ClockInResponse = require("../src/dto/ClockInResponse");
const ResponseHelper = require("../src/helpers/ResponseHelper");

const employee = {
  USERNO: 1,
  USERNAME: "Alice",
  MAILADDRESS: "alice@example.com"
};

const request = {
  headers: {
    get(name) {
      if (name === "x-locale") return "ja";
      return null;
    }
  }
};

assert.strictEqual(LocaleHelper.resolveLocale(request), "ja");
assert.strictEqual(LocaleHelper.translate("CLOCK_IN_COMPLETED", "en"), "Clock In completed.");
assert.strictEqual(LocaleHelper.translate("CLOCK_IN_COMPLETED", "ja"), "出勤が完了しました。");

const clockInResponse = new ClockInResponse(employee, "ja");
assert.strictEqual(clockInResponse.message, "出勤が完了しました。");

const errorResponse = ResponseHelper.serverError(new Error("ALREADY_CLOCKED_IN"), "ja");
assert.strictEqual(errorResponse.jsonBody.message, "すでに出勤済みです。");

console.log("locale tests passed");
