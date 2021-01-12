const mysql = require("mysql");
const lambdaTest = require("../../lambdas/models/getPreviousCashBoxStatus");
const databaseConnectionParams = require("../../test_database_credentials");

describe("getPreviousCashBoxStatus Integration", () => {
  const connection = mysql.createConnection({
    host: databaseConnectionParams.testDbCredentials.HOST,
    user: databaseConnectionParams.testDbCredentials.USER,
    password: databaseConnectionParams.testDbCredentials.PASSWORD,
    database: databaseConnectionParams.testDbCredentials.DATABASE,
  });

  test("Regular get request", async () => {
    const response = await lambdaTest.getPreviousCashBoxStatus(
      "2000-01-01",
      connection
    );
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).results.length).toBe(0);
    expect(typeof JSON.parse(response.body).results).toBe("object");
  });
});
