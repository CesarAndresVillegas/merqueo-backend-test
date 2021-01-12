const denominations = require("../../lambdas/helpers/variables");

describe("Used denominations", () => {
  test("Used denominations validation", async () => {
    const currentDenominations = {
      billete_1000: 0,
      billete_10000: 0,
      billete_100000: 0,
      billete_20000: 0,
      billete_5000: 0,
      billete_50000: 0,
      moneda_100: 0,
      moneda_1000: 0,
      moneda_200: 0,
      moneda_50: 0,
      moneda_500: 0,
    };

    const responseDenominations = denominations.cashboxStatus;
    expect(responseDenominations.billete_100000).toBe(
      currentDenominations.billete_100000
    );
    expect(responseDenominations.billete_50000).toBe(
      currentDenominations.billete_50000
    );
    expect(responseDenominations.billete_20000).toBe(
      currentDenominations.billete_20000
    );
    expect(responseDenominations.billete_10000).toBe(
      currentDenominations.billete_10000
    );
    expect(responseDenominations.billete_5000).toBe(
      currentDenominations.billete_5000
    );
    expect(responseDenominations.billete_1000).toBe(
      currentDenominations.billete_1000
    );
    expect(responseDenominations.moneda_1000).toBe(
      currentDenominations.moneda_1000
    );
    expect(responseDenominations.moneda_500).toBe(
      currentDenominations.moneda_500
    );
    expect(responseDenominations.moneda_200).toBe(
      currentDenominations.moneda_200
    );
    expect(responseDenominations.moneda_100).toBe(
      currentDenominations.moneda_100
    );
    expect(responseDenominations.moneda_50).toBe(
      currentDenominations.moneda_50
    );
  });
});
