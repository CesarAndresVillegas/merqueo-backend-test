const lambdaTest = require("../lambdas/putCashBoxBase");

test("correct greeting is generated", async () => {
  const expected = {
    body: { requirement: 1 },
    statusCode: 200,
  };

  const response = await lambdaTest.handler();

  expect(response.statusCode).toBe(expected.statusCode);
  expect(response.body).toBe(JSON.stringify(expected.body));
});
