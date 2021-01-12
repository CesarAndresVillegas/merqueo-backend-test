exports.formatedDate = async (datoToValidate) => {
  try {
    return new Date(datoToValidate)
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "");
  } catch (err) {
    return false;
  }
};

exports.getOperationData = async (body) => {
  const {
    billete_100000 = 0,
    billete_50000 = 0,
    billete_20000 = 0,
    billete_10000 = 0,
    billete_5000 = 0,
    billete_1000 = 0,
    moneda_1000 = 0,
    moneda_500 = 0,
    moneda_200 = 0,
    moneda_100 = 0,
    moneda_50 = 0,
    total_payment = 0,
  } = body;

  let payment =
    billete_100000 * 100000 +
    billete_50000 * 50000 +
    billete_20000 * 20000 +
    billete_10000 * 10000 +
    billete_5000 * 5000 +
    billete_1000 * 1000 +
    moneda_1000 * 1000 +
    moneda_500 * 500 +
    moneda_200 * 200 +
    moneda_100 * 100 +
    moneda_50 * 50;

  return {
    billete_100000: billete_100000,
    billete_50000: billete_50000,
    billete_20000: billete_20000,
    billete_10000: billete_10000,
    billete_5000: billete_5000,
    billete_1000: billete_1000,
    moneda_1000: moneda_1000,
    moneda_500: moneda_500,
    moneda_200: moneda_200,
    moneda_100: moneda_100,
    moneda_50: moneda_100,
    payment: payment,
    total_payment: total_payment,
    cash_back: payment - total_payment,
  };
};
