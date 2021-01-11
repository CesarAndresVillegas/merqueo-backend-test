exports.paymentRegister = async (operationData, cashbox, connection) => {
  let conn = connection;
  return new Promise((resolve, reject) => {
    conn.beginTransaction(function (err) {
      if (err) {
        conn.end();
        reject(err);
      }

      let movement_params = {
        payment: operationData.total_payment,
        cash_back: operationData.cash_back,
        operations_id: 1,
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
          let cashbox_query = `UPDATE cashbox SET quantity = CASE id
                 WHEN 1 THEN ${Number(cashbox[0].quantity)} 
                 WHEN 2 THEN ${Number(cashbox[1].quantity)}
                 WHEN 3 THEN ${Number(cashbox[2].quantity)} 
                 WHEN 4 THEN ${Number(cashbox[3].quantity)}
                 WHEN 5 THEN ${Number(cashbox[4].quantity)} 
                 WHEN 6 THEN ${Number(cashbox[5].quantity)}
                 WHEN 7 THEN ${Number(cashbox[6].quantity)} 
                 WHEN 8 THEN ${Number(cashbox[7].quantity)}
                 WHEN 9 THEN ${Number(cashbox[8].quantity)} 
                 WHEN 10 THEN ${Number(cashbox[9].quantity)}
                 WHEN 11 THEN ${Number(cashbox[10].quantity)}
                 ELSE quantity
                 END
                 WHERE id IN(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);`;

          conn.query(cashbox_query, function (error, results, fields) {
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

            for (let i = 0; i < 11; i++) {
              if (cashbox[i].subtracted != 0) {
                parameters += ` (${movement_id}, ${i + 1}, ${
                  cashbox[i].subtracted
                }, 2 ),`;
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
                resolve(true);
              });
            });
          });
        }
      );
    });
  });
};
