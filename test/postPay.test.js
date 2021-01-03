const lambdaTest = require("../lambdas/postPay");

test("correct greeting is generated", async () => {
  const expected = {
    body: {
      results: [
        {
          id: 1,
          denomination: 100000,
          quantity: 0,
          created_at: null,
          updated_at: null,
        },
        {
          id: 2,
          denomination: 50000,
          quantity: 0,
          created_at: null,
          updated_at: null,
        },
        {
          id: 3,
          denomination: 20000,
          quantity: 0,
          created_at: null,
          updated_at: null,
        },
        {
          id: 4,
          denomination: 10000,
          quantity: 0,
          created_at: null,
          updated_at: null,
        },
        {
          id: 5,
          denomination: 5000,
          quantity: 0,
          created_at: null,
          updated_at: null,
        },
        {
          id: 6,
          denomination: 1000,
          quantity: 0,
          created_at: null,
          updated_at: null,
        },
        {
          id: 7,
          denomination: 500,
          quantity: 0,
          created_at: null,
          updated_at: null,
        },
        {
          id: 8,
          denomination: 200,
          quantity: 0,
          created_at: null,
          updated_at: null,
        },
        {
          id: 9,
          denomination: 100,
          quantity: 0,
          created_at: null,
          updated_at: null,
        },
        {
          id: 10,
          denomination: 50,
          quantity: 0,
          created_at: null,
          updated_at: null,
        },
      ],
      requirement: 4,
    },
    statusCode: 200,
  };

  const response = await lambdaTest.handler();

  expect(response.statusCode).toBe(expected.statusCode);
  expect(response.body).toBe(JSON.stringify(expected.body));
});
