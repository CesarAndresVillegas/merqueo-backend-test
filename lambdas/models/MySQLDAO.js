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
          if (error) reject(error);
          resolve(results);
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
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  emptyCashBox() {
    let conn = this.connection;
    return new Promise((resolve, reject) => {
      conn.beginTransaction(function (err) {
        if (err) {
          throw err;
        }
        conn.query(
          `SELECT id, quantity
          FROM cashbox
          WHERE quantity > 0
          ORDER BY id;`,
          function (error, results, fields) {
            if (error) {
              return conn.rollback(function () {
                conn.end();
                reject(error);
              });
            }
            let denominations_to_register = { results: results };
            const denominations = denominations_to_register.results;
            const size = denominations.length;

            if (size == 0) {
              return conn.rollback(function () {
                conn.end();
                reject("La caja se encuentra vacía");
              });
            }

            let movement_params = {
              payment: 0,
              cash_back: 0,
              operations_id: 3,
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

                conn.query(
                  `UPDATE cashbox SET quantity = 0`,
                  function (error, results, fields) {
                    if (error) {
                      return conn.rollback(function () {
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
                          reject(error);
                          // throw error;
                        });
                      }

                      conn.commit(function (err) {
                        if (err) {
                          return conn.rollback(function () {
                            throw err;
                          });
                        }
                        conn.end();
                        resolve(true);
                      });
                    });
                  }
                );
              }
            );
          }
        );
      });
    });
  }

  setCashBoxBase(denominations_to_add) {
    const {
      billete_100000 = 0,
      billete_50000 = 0,
      billete_20000 = 0,
      billete_10000 = 0,
      billete_5000 = 0,
      billete_1000 = 0,
      moneda_1000 = 0,
      moneda_500 = 0,
      moneda_200 = 0,
      moneda_100 = 0,
      moneda_50 = 0,
    } = denominations_to_add;
    let conn = this.connection;
    return new Promise((resolve, reject) => {
      conn.beginTransaction(function (err) {
        if (err) {
          throw err;
        }
        conn.query(
          `SELECT id, quantity
          FROM cashbox
          WHERE quantity > 0
          ORDER BY id;`,
          function (error, results, fields) {
            if (error) {
              return conn.rollback(function () {
                conn.end();
                reject(error);
              });
            }
            let denominations_to_register = { results: results };
            const denominations = denominations_to_register.results;
            const size = denominations.length;

            if (size > 0) {
              return conn.rollback(function () {
                conn.end();
                reject("Debe primero limpiar la caja");
              });
            }

            let payment =
              billete_100000 * 100000 +
              billete_50000 * 50000 +
              billete_20000 * 20000 +
              billete_10000 * 10000 +
              billete_5000 * 5000 +
              billete_1000 * 1000 +
              moneda_1000 * 1000 +
              moneda_500 * 500 +
              moneda_200 * 200 +
              moneda_100 * 100 +
              moneda_50 * 50;
            let movement_params = {
              payment: payment,
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
                 WHEN 1 THEN ${billete_100000} 
                 WHEN 2 THEN ${billete_50000}
                 WHEN 3 THEN ${billete_20000} 
                 WHEN 4 THEN ${billete_10000}
                 WHEN 5 THEN ${billete_5000} 
                 WHEN 6 THEN ${billete_1000}
                 WHEN 7 THEN ${moneda_1000} 
                 WHEN 8 THEN ${moneda_500}
                 WHEN 9 THEN ${moneda_200} 
                 WHEN 10 THEN ${moneda_100}
                 WHEN 11 THEN ${moneda_50}
                 ELSE quantity
                 END
                 WHERE id IN(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);`;

                conn.query(casbox_query, function (error, results, fields) {
                  if (error) {
                    return conn.rollback(function () {
                      reject(error);
                    });
                  }

                  let insertQuery =
                    "INSERT INTO movements_details (movements_id, cashbox_id, quantity, detail_operation_id) VALUES";

                  let parameters = "";

                  let denominations_array = [
                    billete_100000,
                    billete_50000,
                    billete_20000,
                    billete_10000,
                    billete_5000,
                    billete_1000,
                    moneda_1000,
                    moneda_500,
                    moneda_200,
                    moneda_100,
                    moneda_50,
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
                        reject(error);
                        // throw error;
                      });
                    }

                    conn.commit(function (err) {
                      if (err) {
                        return conn.rollback(function () {
                          throw err;
                        });
                      }
                      conn.end();
                      resolve(true);
                    });
                  });
                });
              }
            );
          }
        );
      });
    });
  }

  paymentRegister(denominations_to_add) {
    const {
      billete_100000 = 0,
      billete_50000 = 0,
      billete_20000 = 0,
      billete_10000 = 0,
      billete_5000 = 0,
      billete_1000 = 0,
      moneda_1000 = 0,
      moneda_500 = 0,
      moneda_200 = 0,
      moneda_100 = 0,
      moneda_50 = 0,
      total_payment = 0,
      cash_back = 0,
    } = denominations_to_add;
    let conn = this.connection;
    return new Promise((resolve, reject) => {
      conn.beginTransaction(function (err) {
        if (err) {
          throw err;
        }
        conn.query(
          `SELECT id, quantity
          FROM cashbox
          WHERE quantity > 0
          ORDER BY id;`,
          function (error, results, fields) {
            if (error) {
              return conn.rollback(function () {
                conn.end();
                reject(error);
              });
            }
            let denominations_to_register = { results: results };
            const denominations = denominations_to_register.results;
            const size = denominations.length;

            let payment =
              billete_100000 * 100000 +
              billete_50000 * 50000 +
              billete_20000 * 20000 +
              billete_10000 * 10000 +
              billete_5000 * 5000 +
              billete_1000 * 1000 +
              moneda_1000 * 1000 +
              moneda_500 * 500 +
              moneda_200 * 200 +
              moneda_100 * 100 +
              moneda_50 * 50;
            let movement_params = {
              payment: total_payment,
              cash_back: cash_back,
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
                 WHEN 1 THEN ${billete_100000} 
                 WHEN 2 THEN ${billete_50000}
                 WHEN 3 THEN ${billete_20000} 
                 WHEN 4 THEN ${billete_10000}
                 WHEN 5 THEN ${billete_5000} 
                 WHEN 6 THEN ${billete_1000}
                 WHEN 7 THEN ${moneda_1000} 
                 WHEN 8 THEN ${moneda_500}
                 WHEN 9 THEN ${moneda_200} 
                 WHEN 10 THEN ${moneda_100}
                 WHEN 11 THEN ${moneda_50}
                 ELSE quantity
                 END
                 WHERE id IN(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);`;

                conn.query(cashbox_query, function (error, results, fields) {
                  if (error) {
                    return conn.rollback(function () {
                      reject(error);
                    });
                  }

                  let insertQuery =
                    "INSERT INTO movements_details (movements_id, cashbox_id, quantity, detail_operation_id) VALUES";

                  let parameters = "";

                  let denominations_array = [
                    billete_100000,
                    billete_50000,
                    billete_20000,
                    billete_10000,
                    billete_5000,
                    billete_1000,
                    moneda_1000,
                    moneda_500,
                    moneda_200,
                    moneda_100,
                    moneda_50,
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
                        reject(error);
                        // throw error;
                      });
                    }

                    conn.commit(function (err) {
                      if (err) {
                        return conn.rollback(function () {
                          throw err;
                        });
                      }
                      conn.end();
                      resolve(true);
                    });
                  });
                });
              }
            );
          }
        );
      });
    });
  }
}

module.exports = MySQLDAO;
