const mysql = require("mysql");
const getCashBoxStatusModel = require("./getCashBoxStatus");
const emptyCashBoxModel = require("./emptyCashBox");
const getAllMovementsModel = require("./getAllMovements");
const setCashBoxBaseModel = require("./setCashBoxBase");
const paymentRegisterModel = require("./paymentRegister");
const getPreviousCashBoxStatusModel = require("./getPreviousCashBoxStatus");
const getCurrentDenominationsModel = require("./getCurrentDenominations");
const getAllDenominationsCurrentQuantityModel = require("./getAllDenominationsCurrentQuantity");

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
    return getCashBoxStatusModel.getCashBoxStatus(conn);
  }

  getAllMovements() {
    let conn = this.connection;
    return getAllMovementsModel.getAllMovements(conn);
  }

  emptyCashBox(denominations) {
    let conn = this.connection;
    return emptyCashBoxModel.emptyCashBox(denominations, conn);
  }

  setCashBoxBase(operationData) {
    let conn = this.connection;
    return setCashBoxBaseModel.setCashBoxBase(operationData, conn);
  }

  paymentRegister(operationData, cashbox) {
    let conn = this.connection;
    return paymentRegisterModel.paymentRegister(operationData, cashbox, conn);
  }

  getPreviousCashBoxStatus(dateRequired) {
    let conn = this.connection;
    return getPreviousCashBoxStatusModel.getPreviousCashBoxStatus(
      dateRequired,
      conn
    );
  }

  getCurrentDenominations() {
    let conn = this.connection;
    return getCurrentDenominationsModel.getCurrentDenominations(conn);
  }

  getAllDenominationsCurrentQuantity() {
    let conn = this.connection;
    return getAllDenominationsCurrentQuantityModel.getAllDenominationsCurrentQuantity(
      conn
    );
  }
}

module.exports = MySQLDAO;
