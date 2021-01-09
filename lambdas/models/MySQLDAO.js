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

  setCashBoxBase() {
    return "holaaaaaaaaaaa";
  }

  paymentRegister() {
    let conn = this.connection;
    // validaciones
    // obtiene registros modificables
    // inserta en tabla movimientos
    // actualiza caja registradora
    // inserta movimiento con id de movimiento por cada billete actualizado
  }
}

module.exports = MySQLDAO;
