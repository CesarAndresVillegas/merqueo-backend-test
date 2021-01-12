# Welcome to your CDK TypeScript project!

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`MerqueoBackendTestStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

To run unit test you need use `npm run build` and `npm test -- --forceExit --detectOpenHandles`.

The `secret_manager-ts` file has database conn params, and most be not added on repository file, but
in this case, and by merqueo backend test will be added.

The file `test_database_credentials.js` has a test database params.

API POSTMAN documentatión `https://documenter.getpostman.com/view/5967669/TVt2e4gz`

Aplication information `https://docs.google.com/document/d/1Mm67-8nDIfRWAeHid9ab8Wt-iRoKUzrADP0Yqv-Az8w/edit?usp=sharing`
