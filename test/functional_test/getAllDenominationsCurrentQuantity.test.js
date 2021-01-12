const mysql = require("mysql");
const lambdaTest = require("../../lambdas/models/getAllDenominationsCurrentQuantity");
const databaseConnectionParams = require("../../test_database_credentials");

describe("getAllDenominationsCurrentQuantity Integration", () => {
  const connection = mysql.createConnection({
    host: databaseConnectionParams.testDbCredentials.HOST,
    user: databaseConnectionParams.testDbCredentials.USER,
    password: databaseConnectionParams.testDbCredentials.PASSWORD,
    database: databaseConnectionParams.testDbCredentials.DATABASE,
  });

  test("Regular get request", async () => {
    const response = await lambdaTest.getAllDenominationsCurrentQuantity(
      connection
    );
    expect(typeof response).toBe("object");
  });
});
