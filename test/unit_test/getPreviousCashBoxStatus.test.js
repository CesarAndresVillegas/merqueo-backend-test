const getPreviousCashBoxStatus = require("../../lambdas/handlers/getPreviousCashBoxStatus");

describe("getPreviousCashBoxStatus validations", () => {
  test("formatDate validation", async () => {
    const validDate = await getPreviousCashBoxStatus.formatedDate("2020-01-01");
    expect(validDate).toBe("2020-01-01 00:00:00");
  });
});
