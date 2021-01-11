const mysql = require("mysql");

let MySQLInstance;

class MySQLDAO {
  constructor() {
    this.connection = this.createConnection();
    /*
    if (!MySQLInstance && this.connection.status) {
      MySQLInstance = this;
      this.connection = this.createConnection();
    } else {
      return MySQLInstance;
    }*/
  }

  createConnection() {
    return mysql.createConnection({
      host: process.env.HOST,
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
    });
  }

  getCashBoxStatus() {
    let conn = this.connection;
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
  }

  getAllMovements() {
    let conn = this.connection;
    return new Promise((resolve, reject) => {
      conn.query(
        `SELECT m.id AS movement_id, md.id AS movement_detail_id, m.payment, m.cash_back,
         o.name AS operation, c.denomination, c.value, md.quantity, deop.name AS movement,
         m.created_at
        FROM movements m JOIN movements_details md
        JOIN operations o ON m.operations_id = o.id
        JOIN cashbox c ON c.id = md.cashbox_id
        JOIN detail_operation deop ON deop.id = md.detail_operation_id 
        ORDER BY md.id DESC;`,
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
  }

  emptyCashBox(denominations) {
    const size = denominations.length;
    let conn = this.connection;
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
  }

  setCashBoxBase(operationData) {
    let conn = this.connection;
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
  }

  paymentRegister(operationData, cashbox) {
    let conn = this.connection;
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
  }

  getPreviousCashBoxStatus(date_required) {
    let conn = this.connection;
    return new Promise((resolve, reject) => {
      conn.query(
        `SELECT m.id, m.payment, m.cash_back, m.operations_id, m.created_at, md.cashbox_id,
         md.detail_operation_id, md.quantity, c.denomination
        FROM movements m
        JOIN movements_details md ON m.id = md.movements_id
        JOIN cashbox c ON c.id = md.cashbox_id
        WHERE m.created_at <= "${date_required}"
        ORDER BY m.created_at DESC;`,
        function (error, results) {
          let response = {};
          conn.end();
          if (error) {
            response = {
              statusCode: 501,
              body: JSON.stringify({ results: error }),
            };
            reject(response);
          }
          response = {
            statusCode: 200,
            body: JSON.stringify({ results: results }),
          };
          resolve(response);
        }
      );
    });
  }

  getCurrentDenominations() {
    let conn = this.connection;
    return new Promise((resolve, reject) => {
      conn.query(
        `SELECT id, quantity
        FROM cashbox
        WHERE quantity > 0
        ORDER BY id;`,
        function (error, results) {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  getAllDenominationsCurrentQuantity() {
    let conn = this.connection;
    return new Promise((resolve, reject) => {
      conn.query(
        `SELECT id, quantity, value, denomination, 0 AS subtracted
        FROM cashbox
        ORDER BY id;`,
        function (error, results) {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }
}

module.exports = MySQLDAO;
