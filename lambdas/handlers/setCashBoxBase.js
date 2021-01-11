const MySQLDAO = require("../models/MySQLDAO");

exports.handler = async (event) => {
  let response = {};
  let MySQLDAOInstance;
  try {
    const body = JSON.parse(event.body);
    const operationData = await getOperationData(body);
    MySQLDAOInstance = new MySQLDAO();
    let currentDenominations = await MySQLDAOInstance.getCurrentDenominations(
      operationData
    );
    if (currentDenominations.length == 0) {
      await MySQLDAOInstance.setCashBoxBase(operationData)
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
          results: "La caja debe estar vacía para poder establecer una base",
        }),
      };
    }
  } catch (error) {
    response = {
      statusCode: 500,
      body: JSON.stringify({ results: error }),
    };
  }

  if (MySQLDAOInstance && MySQLDAOInstance.connection) {
    MySQLDAOInstance.connection.end();
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
    moneda_50: moneda_50,
    payment: payment,
  };
};
