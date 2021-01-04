"use strict";

exports.handler = async (event) => {
  const MySQLDAO = require("./MySQLDAO");

  let MySQLDAOInstance = new MySQLDAO();

  let result = await MySQLDAOInstance.putCashBoxEmpty("cash_box");

  return {
    statusCode: 200,
    body: JSON.stringify({ results: result }),
  };
};
