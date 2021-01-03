const lambdaTest = require("../lambdas/getMovements");

test("correct greeting is generated", async () => {
  const expected = {
    body: { results: [], requirement: 5 },
    statusCode: 200,
  };

  const response = await lambdaTest.handler();

  expect(response.statusCode).toBe(expected.statusCode);
  expect(response.body).toBe(JSON.stringify(expected.body));
});
