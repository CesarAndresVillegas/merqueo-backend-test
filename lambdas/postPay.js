"use strict";

exports.handler = async (event) => {
  const MySQLDAO = require("./MySQLDAO");

  let MySQLDAOInstance = new MySQLDAO();

  let result = await MySQLDAOInstance.getCashBoxCurrentState("operations");

  return {
    statusCode: 200,
    body: JSON.stringify({ results: result, requirement: 4 }),
  };
};
