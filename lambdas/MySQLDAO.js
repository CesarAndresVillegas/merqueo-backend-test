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

  getCashBoxCurrentState() {
    return new Promise((resolve) => {
      this.connection.query(
        `SELECT billete_100000, billete_50000, billete_20000, billete_10000, billete_5000,
         billete_1000, billete_500, billete_200, billete_100, billete_50 FROM cash_box`,
        function (err, results) {
          resolve(results);
        }
      );
    });
  }

  putCashBoxBase(table, params) {
    return new Promise((resolve) => {
      let param1 = params.billete_100000
        ? " billete_100000 = " + params.billete_100000
        : " billete_100000 = " + 0;
      let param2 = params.billete_50000
        ? " billete_50000 = " + params.billete_50000
        : " billete_50000 = " + 0;
      let param3 = params.billete_20000
        ? " billete_20000 = " + params.billete_20000
        : " billete_20000 = " + 0;
      let param4 = params.billete_10000
        ? " billete_10000 = " + params.billete_10000
        : " billete_10000 = " + 0;
      let param5 = params.billete_5000
        ? " billete_5000 = " + params.billete_5000
        : " billete_5000 = " + 0;
      let param6 = params.billete_1000
        ? " billete_1000 = " + params.billete_1000
        : " billete_1000 = " + 0;
      let param7 = params.billete_500
        ? " billete_500 = " + params.billete_500
        : " billete_500 = " + 0;
      let param8 = params.billete_200
        ? " billete_200 = " + params.billete_200
        : " billete_200 = " + 0;
      let param9 = params.billete_100
        ? " billete_100 = " + params.billete_100
        : " billete_100 = " + 0;
      let param10 = params.billete_50
        ? " billete_50 = " + params.billete_50
        : " billete_50 = " + 0;

      let today = new Date();
      let year = today.getFullYear().toString();
      let month =
        today.getMonth().length > 1
          ? (today.getMonth() + 1).toString()
          : "0" + (today.getMonth() + 1);
      let day =
        today.getDate().length > 1
          ? today.getDate().toString()
          : "0" + today.getDate();
      let hours = (today.getHours() - 5).toString();
      let minutes = today.getMinutes().toString();
      let seconds = today.getSeconds().toString();

      let currentDate =
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds;

      this.connection.query(
        `UPDATE ${table} SET ${param1}, ${param2}, ${param3}, ${param4}, ${param5}, ${param6}, ${param7}, ${param8}, ${param9}, ${param10}, updated_at = "${currentDate}"`,
        function (err, results) {
          resolve(results);
        }
      );
    });
  }

  putCashBoxBase(table, params) {
    return new Promise((resolve) => {
      let param1 = " billete_100000 = 0";
      let param2 = " billete_50000 = 0";
      let param3 = " billete_20000 = 0";
      let param4 = " billete_10000 = 0";
      let param5 = " billete_5000 = 0";
      let param6 = " billete_1000 = 0";
      let param7 = " billete_500 = 0";
      let param8 = " billete_200 = 0";
      let param9 = " billete_100 = 0";
      let param10 = " billete_50 = 0";

      let today = new Date();
      let year = today.getFullYear().toString();
      let month =
        today.getMonth().length > 1
          ? (today.getMonth() + 1).toString()
          : "0" + (today.getMonth() + 1);
      let day =
        today.getDate().length > 1
          ? today.getDate().toString()
          : "0" + today.getDate();
      let hours = (today.getHours() - 5).toString();
      let minutes = today.getMinutes().toString();
      let seconds = today.getSeconds().toString();

      let currentDate =
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds;

      this.connection.query(
        `UPDATE ${table} SET ${param1}, ${param2}, ${param3}, ${param4}, ${param5}, ${param6}, ${param7}, ${param8}, ${param9}, ${param10}, updated_at = "${currentDate}"`,
        function (err, results) {
          resolve(results);
        }
      );
    });
  }
}

module.exports = MySQLDAO;
