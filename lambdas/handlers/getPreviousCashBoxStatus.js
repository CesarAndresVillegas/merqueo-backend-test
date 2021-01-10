const MySQLDAO = require("../models/MySQLDAO");

exports.handler = async (event) => {
  let MySQLDAOInstance = new MySQLDAO();
  let result_body = await MySQLDAOInstance.getPreviousCashBoxStatus(
    "2021-01-10 02:51:55"
  );
  const response = {
    statusCode: 200,
    body: JSON.stringify({ results: result_body }),
  };
  return response;
};
