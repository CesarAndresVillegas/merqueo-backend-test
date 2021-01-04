const mysql = require("mysql");

let MySQLInstance;

class MySQLDAO {
  constructor() {
    if (!MySQLInstance) {
      MySQLInstance = this;
      this.connection = this.createConnection();
    } else {
      return MySQLInstance;
    }
  }

  createConnection(params) {
    return mysql.createConnection({
      host: process.env.HOST,
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
    });
  }

  findAll(table) {
    return new Promise((resolve) => {
      this.connection.query(`SELECT * FROM ${table}`, function (err, results) {
        resolve(results);
      });
    });
  }
}

module.exports = MySQLDAO;
