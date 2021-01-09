"use strict";

exports.handler = async (event) => {
  const MySQLDAO = require("./MySQLDAO");

  let MySQLDAOInstance = new MySQLDAO();

  let result = await MySQLDAOInstance.notImplemented("operations");

  return {
    statusCode: 404,
    body: JSON.stringify({ results: result, requirement: 4 }),
  };
};
