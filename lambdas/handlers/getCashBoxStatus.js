const MySQLDAO = require("../models/MySQLDAO");

exports.handler = async (event) => {
  let response = {};
  try {
    let MySQLDAOInstance = new MySQLDAO();
    let result = await MySQLDAOInstance.getCashBoxStatus();
    response = result;
  } catch (error) {
    response = {
      statusCode: 500,
      body: JSON.stringify({ results: error }),
    };
  }
  return response;
};
