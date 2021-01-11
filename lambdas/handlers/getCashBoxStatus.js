const MySQLDAO = require("../models/MySQLDAO");

exports.handler = async (event) => {
  let response = {};
  let MySQLDAOInstance;
  try {
    MySQLDAOInstance = new MySQLDAO();
    let result = await MySQLDAOInstance.getCashBoxStatus();
    response = result;
  } catch (error) {
    response = {
      statusCode: 500,
      body: JSON.stringify({ results: error }),
    };
  }

  if (MySQLDAOInstance && MySQLDAOInstance.MySQLDAOInstance.connection) {
    MySQLDAOInstance.connection.end();
  }

  return response;
};
