"use strict";

exports.handler = async (event) => {
  let params = JSON.parse(event.body);
  let response = null;

  if (!params) {
    response = {
      statusCode: 501,
      body: JSON.stringify({
        results:
          "No se recibieron parámetros para establecer la base de la caja.",
      }),
    };
  } else {
    const MySQLDAO = require("./MySQLDAO");

    let MySQLDAOInstance = new MySQLDAO();

    let result = await MySQLDAOInstance.putCashBoxBase("cash_box", params);

    response = {
      statusCode: 200,
      body: JSON.stringify({ results: result }),
    };
  }
  return response;
};
