const mysql = require("mysql");
const lambdaTest = require("../../lambdas/models/emptyCashBox");
const databaseConnectionParams = require("../../test_database_credentials");

describe("emptyCashBox Integration", () => {
  const connection = mysql.createConnection({
    host: databaseConnectionParams.testDbCredentials.HOST,
    user: databaseConnectionParams.testDbCredentials.USER,
    password: databaseConnectionParams.testDbCredentials.PASSWORD,
    database: databaseConnectionParams.testDbCredentials.DATABASE,
  });

  test("Regular get request", async () => {
    const inputTest = [
      { id: 1, quantity: "1" },
      { id: 2, quantity: "1" },
      { id: 3, quantity: "1" },
      { id: 4, quantity: "1" },
      { id: 5, quantity: "1" },
      { id: 6, quantity: "1" },
    ];

    const response = await lambdaTest.emptyCashBox(inputTest, connection);
    expect(response).toBe("La caja se vació correctamente");
  });
});
