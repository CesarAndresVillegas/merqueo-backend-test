const MySQLDAO = require("../models/MySQLDAO");

exports.handler = async (event) => {
  let response = {};
  let MySQLDAOInstance;

  try {
    MySQLDAOInstance = new MySQLDAO();
    let currentDenominations = await MySQLDAOInstance.getCurrentDenominations();
    if (currentDenominations.length) {
      await MySQLDAOInstance.emptyCashBox(currentDenominations)
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
    } else {
      response = {
        statusCode: 200,
        body: JSON.stringify({ results: "La caja ya se encuentra vacía." }),
      };
    }
  } catch (error) {
    response = {
      statusCode: 500,
      body: JSON.stringify({ results: error }),
    };
  }

  if (MySQLDAOInstance && MySQLDAOInstance.connection) {
    MySQLDAOInstance.connection.end();
  }

  return response;
};
