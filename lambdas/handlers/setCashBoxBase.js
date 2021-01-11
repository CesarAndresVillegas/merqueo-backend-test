const MySQLDAO = require("../models/MySQLDAO");

exports.handler = async (event) => {
  let response = {};
  const body = JSON.parse(event.body);
  console.log("**************************");
  console.log(body);
  console.log("**************************");
  let MySQLDAOInstance = new MySQLDAO();
  let currentDenominations = await MySQLDAOInstance.getCurrentDenominations();
  if (currentDenominations.length) {
    await MySQLDAOInstance.setCashBoxBase(body)
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
      body: JSON.stringify({ results: "Holiiiiiii bety bety" }),
    };
  }

  return response;
};
