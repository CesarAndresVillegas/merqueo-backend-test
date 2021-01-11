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
          conn.end();
          reject(err);
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
                reject("Para establecer una base la caja debe estar limpia");
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
                      conn.end();
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
          }
        );
      });
    });
  }

  paymentRegister(denominations_to_add) {
    let conn = this.connection;
    return new Promise((resolve, reject) => {
      conn.beginTransaction(function (err) {
        if (err) {
          conn.end();
          reject(err);
        }
        let {
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

        let cashback = payment - total_payment;

        if (cashback < 0) {
          return conn.rollback(function () {
            conn.end();
            reject(
              "Petición errónea, los billetes enviados suman un monto menor al pago requerido"
            );
          });
        }
        conn.query(
          `SELECT id, quantity, value, denomination
          FROM cashbox
          ORDER BY id;`,
          function (error, results, fields) {
            if (error) {
              return conn.rollback(function () {
                conn.end();
                reject(error);
              });
            }
            let cashbox = results;

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

                let cashbackAux = Number(cashback);
                let cashbackQuantity = 0;
                let cashback_returned = [];

                for (let i = 0; i < cashbox.length; i++) {
                  if (
                    cashbox[i].value <= cashbackAux &&
                    Number(cashbox[i].quantity) > 0
                  ) {
                    cashbackQuantity =
                      cashbackAux / cashbox[i].value -
                      (cashbackAux % cashbox[i].value) / cashbox[i].value;

                    if (cashbackQuantity <= cashbox[i].quantity) {
                      cashbox[i].quantity =
                        Number(cashbox[i].quantity) - Number(cashbackQuantity);
                      cashbackAux =
                        Number(cashbackAux) -
                        Number(cashbox[i].value) * Number(cashbackQuantity);
                      cashback_returned.push({
                        bill: `${cashbox[i].denomination}`,
                        value: `${cashbox[i].value}`,
                        quantity: cashbackQuantity,
                      });
                    } else {
                      cashbox[i].quantity = 0;
                      cashbackAux =
                        Number(cashbackAux) -
                        Number(cashbox[i].value) * Number(cashbox[i].quantity);
                      cashback_returned.push({
                        bill: `${cashbox[i].denomination}`,
                        value: `${cashbox[i].value}`,
                        quantity: cashbox[i].quantity,
                      });
                    }

                    if (cashbackAux == 0) {
                      break;
                    }
                  }
                }

                if (cashbackAux > 0) {
                  return conn.rollback(function () {
                    conn.end();
                    reject(
                      "No se tiene cambio para el pago y la combinación de billetes"
                    );
                  });
                }

                let movement_id = results.insertId;
                let cashbox_query = `UPDATE cashbox SET quantity = CASE id
                 WHEN 1 THEN ${
                   Number(cashbox[0].quantity) + Number(billete_100000)
                 } 
                 WHEN 2 THEN ${
                   Number(cashbox[1].quantity) + Number(billete_50000)
                 }
                 WHEN 3 THEN ${
                   Number(cashbox[2].quantity) + Number(billete_20000)
                 } 
                 WHEN 4 THEN ${
                   Number(cashbox[3].quantity) + Number(billete_10000)
                 }
                 WHEN 5 THEN ${
                   Number(cashbox[4].quantity) + Number(billete_5000)
                 } 
                 WHEN 6 THEN ${
                   Number(cashbox[5].quantity) + Number(billete_1000)
                 }
                 WHEN 7 THEN ${
                   Number(cashbox[6].quantity) + Number(moneda_1000)
                 } 
                 WHEN 8 THEN ${Number(cashbox[7].quantity) + Number(moneda_500)}
                 WHEN 9 THEN ${
                   Number(cashbox[8].quantity) + Number(moneda_200)
                 } 
                 WHEN 10 THEN ${
                   Number(cashbox[9].quantity) + Number(moneda_100)
                 }
                 WHEN 11 THEN ${
                   Number(cashbox[10].quantity) + Number(moneda_50)
                 }
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

                  for (let i = 0; i < 11; i++) {
                    if (denominations_array[i] !== 0) {
                      parameters += ` (${movement_id}, ${i + 1}, ${
                        cashbox[i].quantity
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
                      let response = {
                        cashback: cashback_returned,
                        text: "Pago registrado correctamente",
                      };
                      resolve(response);
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
}

module.exports = MySQLDAO;
