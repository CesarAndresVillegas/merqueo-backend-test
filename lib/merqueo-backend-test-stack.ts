import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";
import * as apigw from "@aws-cdk/aws-apigateway";

export class MerqueoBackendTestStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const roleMerqueoLambda = new iam.Role(this, "roleMerqueoLambda", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    roleMerqueoLambda.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: [
          "lambda:InvokeFunction",
          "dynamodb:GetItem",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
      })
    );

    // lambdas template
    //
    const getCashBoxCurrentState = new lambda.Function(
      this,
      "getCashBoxCurrentState",
      {
        code: lambda.Code.fromAsset("lambdas"),
        environment: {
          REGION: "us-east-1",
          TABLE_NAME: "dbd_table_1",
        },
        functionName: "getCashBoxCurrentState",
        handler: "getCashBoxCurrentState.handler",
        role: roleMerqueoLambda,
        runtime: lambda.Runtime.NODEJS_12_X,
      }
    );

    // api template
    //
    const apiMerqueo = new apigw.RestApi(this, "apiMerqueo", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS, // this is also the default
      },
      description:
        "This api expose services required in the merqueo backend test to manage a cashbox.",
      restApiName: "Merquedo CashBox",
    });

    const getCashBoxCurrentStateIntegration = new apigw.LambdaIntegration(
      getCashBoxCurrentState
    );

    const apiMerqueoBase = apiMerqueo.root.addResource("merqueo");

    const apiGetCashBox = apiMerqueoBase.addResource("cash_box");
    apiGetCashBox.addMethod("GET", getCashBoxCurrentStateIntegration);
  }
}
