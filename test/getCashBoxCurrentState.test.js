const lambdaTest = require("../lambdas/getCashBoxCurrentState");

test("correct greeting is generated", async () => {
  const expected = {
    body: { requirement: 3 },
    statusCode: 200,
  };

  const response = await lambdaTest.handler();

  expect(response.statusCode).toBe(expected.statusCode);
  expect(response.body).toBe(JSON.stringify(expected.body));
});
