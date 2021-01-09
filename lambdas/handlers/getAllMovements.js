const MySQLDAO = require("../models/MySQLDAO");

exports.handler = async (event) => {
  let MySQLDAOInstance = new MySQLDAO();
  let result = await MySQLDAOInstance.getAllMovements();
  const response = {
    statusCode: 200,
    body: JSON.stringify({ results: result }),
  };
  return response;
};
