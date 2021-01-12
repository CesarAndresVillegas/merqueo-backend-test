const MySQLDAO = require("../models/MySQLDAO");
const cashboxStatus = require("../helpers/variables");
const helperScripts = require("../helpers/helperScripts");

exports.handler = async (event) => {
  let response = {};
  let MySQLDAOInstance;
  try {
    let queryDate = await helperScripts.formatedDate(
      event.queryStringParameters.date_required
    );

    if (queryDate) {
      MySQLDAOInstance = new MySQLDAO();
      let resultBody = await MySQLDAOInstance.getPreviousCashBoxStatus(
        queryDate
      );

      let cashBoxOnSpecificDate = await getDataFromHistorical(
        JSON.parse(resultBody.body).results
      );

      response = {
        statusCode: 200,
        body: JSON.stringify({ results: cashBoxOnSpecificDate }),
      };
    } else {
      response = {
        statusCode: 400,
        body: JSON.stringify({
          results: "La fecha ingresada no tiene un formato válido",
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

const getDataFromHistorical = async (historicalData) => {
  let reArrangedArray = [];
  let currentStatus = {};

  for (let i = 0; i < historicalData.length; i++) {
    if (historicalData[i].operations_id == 3) {
      break;
    } else {
      reArrangedArray.push(historicalData[i]);
    }
  }

  for (let i = reArrangedArray.length - 1; i >= 0; i--) {
    if (reArrangedArray[i].detail_operation_id == 1) {
      if (currentStatus[reArrangedArray[i].denomination]) {
        currentStatus[reArrangedArray[i].denomination] += Number(
          reArrangedArray[i].quantity
        );
      } else {
        currentStatus[`${reArrangedArray[i].denomination}`] = Number(
          reArrangedArray[i].quantity
        );
      }
    } else {
      if (
        currentStatus[reArrangedArray[i].denomination] >=
        Number(reArrangedArray[i].quantity)
      ) {
        currentStatus[reArrangedArray[i].denomination] -= Number(
          reArrangedArray[i].quantity
        );
      }
    }
  }

  return currentStatus;
};
