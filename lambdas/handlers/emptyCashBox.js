const MySQLDAO = require("../models/MySQLDAO");

exports.handler = async (event) => {
  let result_body = {};
  let MySQLDAOInstance = new MySQLDAO();
  await MySQLDAOInstance.emptyCashBox()
    .then(
      (result) => {
        result_body = result;
      },
      (err) => {
        result_body = err;
      }
    )
    .catch((except) => {
      result_body = except;
    });

  const response = {
    statusCode: 200,
    body: JSON.stringify({ results: result_body }),
  };
  return response;
};
