const MySQLDAO = require("../models/MySQLDAO");

exports.handler = async (event) => {
  let response = {};
  const body = JSON.parse(event.body);
  const currentPayment = await getOperationData(body);
  let MySQLDAOInstance = new MySQLDAO();
  if (currentPayment.cash_back > 0) {
    const currentDenominations = await MySQLDAOInstance.getAllDenominationsCurrentQuantity();
    const currentCashbox = await formatPayment(
      currentPayment,
      currentDenominations
    );
    console.log("********************************");
    console.log("********************************");
    console.log(currentDenominations);
    console.log("********************************");
    console.log("********************************");
    await MySQLDAOInstance.paymentRegister(currentPayment, currentDenominations)
      .then(
        (result) => {
          response = {
            statusCode: 200,
            body: JSON.stringify({ results: result }),
          };
        },
        (err) => {
          response = {
            statusCode: 401,
            body: JSON.stringify({ results: err }),
          };
        }
      )
      .catch((except) => {
        response = {
          statusCode: 501,
          body: JSON.stringify({ results: except }),
        };
      });
  } else {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        results:
          "Petición errónea, los billetes enviados suman un monto menor al pago requerido",
      }),
    };
  }

  return response;
};

const getOperationData = async (body) => {
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

const formatPayment = async (currentPayment, currentDenominations) => {
  return true;
};
