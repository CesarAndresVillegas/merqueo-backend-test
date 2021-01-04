const lambdaTest = require("../lambdas/getKardex");

test("correct greeting is generated", async () => {
  const expected = {
    body: { results: "not implemented", requirement: 6 },
    statusCode: 404,
  };

  const response = await lambdaTest.handler();

  expect(response.statusCode).toBe(expected.statusCode);
  expect(response.body).toBe(JSON.stringify(expected.body));
});
