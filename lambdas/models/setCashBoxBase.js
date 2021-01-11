exports.setCashBoxBase = async (operationData, connection) => {
  let conn = connection;
  return new Promise((resolve, reject) => {
    conn.beginTransaction(function (err) {
      if (err) {
        conn.end();
        reject(err);
      }

      let movement_params = {
        payment: operationData.payment,
        cash_back: 0,
        operations_id: 2,
      };
      conn.query(
        `INSERT INTO movements SET ?`,
        movement_params,
        function (error, results, fields) {
          if (error) {
            return conn.rollback(function () {
              conn.end();
              reject(error);
            });
          }

          let movement_id = results.insertId;
          let casbox_query = `UPDATE cashbox SET quantity = CASE id
                 WHEN 1 THEN ${operationData.billete_100000} 
                 WHEN 2 THEN ${operationData.billete_50000}
                 WHEN 3 THEN ${operationData.billete_20000} 
                 WHEN 4 THEN ${operationData.billete_10000}
                 WHEN 5 THEN ${operationData.billete_5000} 
                 WHEN 6 THEN ${operationData.billete_1000}
                 WHEN 7 THEN ${operationData.moneda_1000} 
                 WHEN 8 THEN ${operationData.moneda_500}
                 WHEN 9 THEN ${operationData.moneda_200} 
                 WHEN 10 THEN ${operationData.moneda_100}
                 WHEN 11 THEN ${operationData.moneda_50}
                 ELSE quantity
                 END
                 WHERE id IN(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);`;

          conn.query(casbox_query, function (error, results, fields) {
            if (error) {
              return conn.rollback(function () {
                conn.end();
                reject(error);
              });
            }

            let insertQuery =
              "INSERT INTO movements_details (movements_id, cashbox_id, quantity, detail_operation_id) VALUES";

            let parameters = "";

            let denominations_array = [
              operationData.billete_100000,
              operationData.billete_50000,
              operationData.billete_20000,
              operationData.billete_10000,
              operationData.billete_5000,
              operationData.billete_1000,
              operationData.moneda_1000,
              operationData.moneda_500,
              operationData.moneda_200,
              operationData.moneda_100,
              operationData.moneda_50,
            ];

            for (let i = 0; i < 11; i++) {
              if (denominations_array[i] !== 0) {
                parameters += ` (${movement_id}, ${i + 1}, ${
                  denominations_array[i]
                }, 1 ),`;
              }
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
                resolve("Se estableció correctamente la base");
              });
            });
          });
        }
      );
    });
  });
};
