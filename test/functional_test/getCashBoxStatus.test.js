const mysql = require("mysql");
const lambdaTest = require("../../lambdas/models/getCashBoxStatus");
const databaseConnectionParams = require("../../test_database_credentials");

describe("getCashBoxStatus Integration", () => {
  const connection = mysql.createConnection({
    host: databaseConnectionParams.testDbCredentials.HOST,
    user: databaseConnectionParams.testDbCredentials.USER,
    password: databaseConnectionParams.testDbCredentials.PASSWORD,
    database: databaseConnectionParams.testDbCredentials.DATABASE,
  });

  test("Regular get request", async () => {
    const response = await lambdaTest.getCashBoxStatus(connection);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).results.length).toBe(11);
  });
});
