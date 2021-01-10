const MySQLDAO = require("../models/MySQLDAO");

exports.handler = async (event) => {
  let response = {};
  const body = JSON.parse(event.body);

  let MySQLDAOInstance = new MySQLDAO();
  await MySQLDAOInstance.paymentRegister(body)
    .then(
      (result) => {
        response = {
          statusCode: 200,
          body: JSON.stringify({ results: result }),
        };
      },
      (err) => {
        response = {
          statusCode: 401,
          body: JSON.stringify({ results: err }),
        };
      }
    )
    .catch((except) => {
      response = {
        statusCode: 501,
        body: JSON.stringify({ results: except }),
      };
    });

  return response;
};
