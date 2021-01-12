const mysql = require("mysql");
const lambdaTest = require("../../lambdas/models/getAllMovements");
const databaseConnectionParams = require("../../test_database_credentials");

describe("getAllMovements Integration", () => {
  const connection = mysql.createConnection({
    host: databaseConnectionParams.testDbCredentials.HOST,
    user: databaseConnectionParams.testDbCredentials.USER,
    password: databaseConnectionParams.testDbCredentials.PASSWORD,
    database: databaseConnectionParams.testDbCredentials.DATABASE,
  });

  test("Regular get request", async () => {
    const response = await lambdaTest.getAllMovements(connection);
    expect(response.statusCode).toBe(200);
  });
});
