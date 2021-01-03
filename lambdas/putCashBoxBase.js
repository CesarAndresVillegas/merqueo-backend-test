"use strict";

exports.handler = async (event) => {
  const mysql = require("mysql");

  const conn = mysql.createConnection({
    host: "cavillegas.ctol4ipbd5aj.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "daA*gamj?FDLVn8h",
    database: "merqueo_test",
  });

  const p = new Promise((resolve) => {
    conn.query(
      "UPDATE cash_box SET field1 = new-value1, field2 = new-value2 WHERE ",
      function (err, results) {
        resolve(results);
      }
    );
  });

  const result = await p;

  return {
    statusCode: 200,
    body: JSON.stringify({ results: result, requirement: 1 }),
  };
};
