exports.emptyCashBox = async (denominations, connection) => {
  const size = denominations.length;
  let conn = connection;
  return new Promise((resolve, reject) => {
    conn.beginTransaction(function (err) {
      if (err) {
        conn.end();
        reject(err);
      }

      conn.query(
        `INSERT INTO movements (payment, cash_back, operations_id) VALUES (0, 0, 3)`,
        function (error, results, fields) {
          if (error) {
            return conn.rollback(function () {
              conn.end();
              reject(error);
            });
          }
          let movement_id = results.insertId;

          conn.query(
            `UPDATE cashbox SET quantity = 0`,
            function (error, results, fields) {
              if (error) {
                return conn.rollback(function () {
                  conn.end();
                  reject(error);
                });
              }

              let insertQuery =
                "INSERT INTO movements_details (movements_id, cashbox_id, quantity, detail_operation_id) VALUES";

              let parameters = "";

              for (let i = 0; i < size; i++) {
                parameters += ` (${movement_id}, ${denominations[i].id}, ${denominations[i].quantity}, 2 ),`;
              }

              insertQuery += parameters;
              insertQuery = insertQuery.replace(/.$/, ";");

              conn.query(insertQuery, function (error, results, fields) {
                if (error) {
                  return conn.rollback(function () {
                    conn.end();
                    reject(error);
                  });
                }

                conn.commit(function (err) {
                  if (err) {
                    return conn.rollback(function () {
                      conn.end();
                      reject(err);
                    });
                  }
                  conn.end();
                  resolve("La caja se vació correctamente");
                });
              });
            }
          );
        }
      );
    });
  });
};
