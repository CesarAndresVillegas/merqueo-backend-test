const paymentRegister = require("../../lambdas/handlers/paymentRegister");

describe("paymentRegister validations", () => {
  test("getOperationData", async () => {
    const inputBodyTest = {
      billete_100000: 3,
      billete_20000: 5,
      moneda_1000: 2,
      total_payment: 400700,
    };

    const expectedValue = {
      billete_100000: 3,
      billete_50000: 0,
      billete_20000: 5,
      billete_10000: 0,
      billete_5000: 0,
      billete_1000: 0,
      moneda_1000: 2,
      moneda_500: 0,
      moneda_200: 0,
      moneda_100: 0,
      moneda_50: 0,
      payment: 402000,
      total_payment: 400700,
      cash_back: 1300,
    };

    const responseValue = await paymentRegister.getOperationData(inputBodyTest);
    expect(responseValue).toMatchObject(expectedValue);
  });
});
