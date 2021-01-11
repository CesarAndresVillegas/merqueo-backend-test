const getCashBoxStatus = async (connection) => {
  let conn = connection;
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT denomination, value, quantity
        FROM cashbox
        ORDER BY id;`,
      function (error, results) {
        let response = {};
        if (error) {
          response = {
            statusCode: 501,
            body: JSON.stringify({ results: error }),
          };
          reject(response);
        }
        conn.end();
        response = {
          statusCode: 200,
          body: JSON.stringify({ results: results }),
        };
        resolve(response);
      }
    );
  });
};
