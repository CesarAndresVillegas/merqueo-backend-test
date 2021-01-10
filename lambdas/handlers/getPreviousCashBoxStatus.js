const MySQLDAO = require("../models/MySQLDAO");
let cashboxStatus = require("../helpers/variables");

exports.handler = async (event) => {
  let response = {};
  try {
    let queryDate = await formatedDate(
      event.queryStringParameters.date_required
    );

    if (queryDate) {
      let MySQLDAOInstance = new MySQLDAO();
      let resultBody = await MySQLDAOInstance.getPreviousCashBoxStatus(
        queryDate
      );

      let chashBoxOnSpecificDate = getDataFromHistorical(resultBody);

      response = {
        statusCode: 200,
        body: JSON.stringify({ results: chashBoxOnSpecificDate }),
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

  return response;
};

const formatedDate = async (datoToValidate) => {
  try {
    return new Date(datoToValidate)
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "");
  } catch (err) {
    return false;
  }
};

const getDataFromHistorical = async (historicalData) => {
  let reArrangedArray = [];

  for (let i = 0; i < historicalData.length; i++) {
    if (historicalData[i].operations_id == 3) {
      break;
    } else {
      reArrangedArray.push(historicalData[i]);
    }
  }

  for (let i = reArrangedArray.length - 1; i >= 0; i--) {
    if (reArrangedArray[i].detail_operation_id == 1) {
      cashboxStatus[reArrangedArray[i].denomination] += Number(
        reArrangedArray[i].quantity
      );
    } else {
      cashboxStatus[reArrangedArray[i].denomination] -= Number(
        reArrangedArray[i].quantity
      );
    }
  }

  return reArrangedArray;
};
