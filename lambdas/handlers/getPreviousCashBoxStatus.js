const MySQLDAO = require("../models/MySQLDAO");

exports.handler = async (event) => {
  let response = {};
  try {
    let requiredDate = event.queryStringParameters.date_required;

    let MySQLDAOInstance = new MySQLDAO();
    let result_body = await MySQLDAOInstance.getPreviousCashBoxStatus(
      requiredDate
    );

    let cashboxStatus = {
      billete_100000: 0,
      billete_50000: 0,
      billete_20000: 0,
      billete_10000: 0,
      billete_5000: 0,
      billete_1000: 0,
      moneda_1000: 0,
      moneda_500: 0,
      moneda_200: 0,
      moneda_100: 0,
      moneda_50: 0,
    };

    let re_arranged_array = [];

    for (let i = 0; i < result_body.length; i++) {
      if (result_body[i].operations_id == 3) {
        break;
      } else {
        re_arranged_array.push(result_body[i]);
      }
    }

    for (let i = re_arranged_array.length - 1; i >= 0; i--) {
      if (re_arranged_array[i].detail_operation_id == 1) {
        cashboxStatus[re_arranged_array[i].denomination] += Number(
          re_arranged_array[i].quantity
        );
      } else {
        cashboxStatus[re_arranged_array[i].denomination] -= Number(
          re_arranged_array[i].quantity
        );
      }
    }
    response = {
      statusCode: 200,
      body: JSON.stringify({ results: result_body }),
    };
  } catch (error) {
    response = {
      statusCode: 500,
      body: JSON.stringify({ results: error }),
    };
  }

  return response;
};
