const MySQLDAO = require("../models/MySQLDAO");
const helperScripts = require("../helpers/helperScripts");

exports.handler = async (event) => {
  let response = {};
  let MySQLDAOInstance;
  try {
    const body = JSON.parse(event.body);
    const currentPayment = await helperScripts.getOperationData(body);
    MySQLDAOInstance = new MySQLDAO();
    if (currentPayment.cash_back > 0) {
      const currentDenominations = await MySQLDAOInstance.getAllDenominationsCurrentQuantity();
      const currentCashbox = await formatPayment(
        currentPayment,
        currentDenominations
      );
      let requiredValues = await formatedValues(currentPayment, currentCashbox);

      let cashboxAfterPayment = requiredValues[0];
      let cashbackDenominationsReturned = requiredValues[1];
      let cashbackResidue = requiredValues[2];

      if (cashbackResidue > 0) {
        response = {
          statusCode: 200,
          body: JSON.stringify({
            results:
              "No se tiene cambio para el pago y la combinación de billetes",
          }),
        };
      } else {
        await MySQLDAOInstance.paymentRegister(
          currentPayment,
          cashboxAfterPayment
        )
          .then(
            (result) => {
              response = {
                statusCode: 200,
                body: JSON.stringify({
                  results: cashbackDenominationsReturned,
                  text: "Pago registrado correctamente",
                }),
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
      }
    } else {
      response = {
        statusCode: 200,
        body: JSON.stringify({
          results:
            "Petición errónea, los billetes enviados suman un monto menor al pago requerido",
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

const formatPayment = async (currentPayment, currentDenominations) => {
  for (let i = 0; i < currentDenominations.length; i++) {
    currentDenominations[i].quantity =
      Number(currentDenominations[i].quantity) +
      Number(currentPayment[currentDenominations[i].denomination]);
  }

  return currentDenominations;
};

const formatedValues = async (operationData, cashbox) => {
  let cashbackAux = Number(operationData.cash_back);
  let cashbackQuantity = 0;
  let cashbackDenominationsReturned = [];

  for (let i = 0; i < cashbox.length; i++) {
    if (cashbox[i].value <= cashbackAux && Number(cashbox[i].quantity) > 0) {
      cashbackQuantity =
        cashbackAux / cashbox[i].value -
        (cashbackAux % cashbox[i].value) / cashbox[i].value;

      if (cashbackQuantity <= cashbox[i].quantity) {
        cashbox[i].subtracted = Number(cashbackQuantity);
        cashbox[i].quantity =
          Number(cashbox[i].quantity) - Number(cashbackQuantity);
        cashbackAux =
          Number(cashbackAux) -
          Number(cashbox[i].value) * Number(cashbackQuantity);
        cashbackDenominationsReturned.push({
          bill: `${cashbox[i].denomination}`,
          value: `${cashbox[i].value}`,
          quantity: cashbackQuantity,
        });
      } else {
        cashbox[i].subtracted = cashbox[i].quantity;
        cashbox[i].quantity = 0;
        cashbackAux =
          Number(cashbackAux) -
          Number(cashbox[i].value) * Number(cashbox[i].quantity);
        cashbackDenominationsReturned.push({
          bill: `${cashbox[i].denomination}`,
          value: `${cashbox[i].value}`,
          quantity: cashbox[i].quantity,
        });
      }

      if (cashbackAux == 0) {
        break;
      }
    }
  }

  return [cashbox, cashbackDenominationsReturned, cashbackAux];
};
