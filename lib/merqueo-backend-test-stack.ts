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
    //layers
    //
    const mysqlLayer = new lambda.LayerVersion(this, "mysqlLayer", {
      code: lambda.Code.fromAsset("layers/mysql.zip"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
      layerVersionName: "mysql",
      description: "Layer used to access mysql from node lambda functions",
    });

    // lambdas template
    //
    const getCashBoxCurrentState = new lambda.Function(
      this,
      "getCashBoxCurrentState",
      {
        code: lambda.Code.fromAsset("lambdas"),
        environment: {
          TABLE_NAME: "dbd_table_1",
        },
        functionName: "getCashBoxCurrentState",
        handler: "getCashBoxCurrentState.handler",
        layers: [mysqlLayer],
        role: roleMerqueoLambda,
        runtime: lambda.Runtime.NODEJS_12_X,
      }
    );

    const getKardex = new lambda.Function(this, "getKardex", {
      code: lambda.Code.fromAsset("lambdas"),
      environment: {
        TABLE_NAME: "dbd_table_1",
      },
      functionName: "getKardex",
      handler: "getKardex.handler",
      layers: [mysqlLayer],
      role: roleMerqueoLambda,
      runtime: lambda.Runtime.NODEJS_12_X,
    });

    const getMovements = new lambda.Function(this, "getMovements", {
      code: lambda.Code.fromAsset("lambdas"),
      environment: {
        TABLE_NAME: "dbd_table_1",
      },
      functionName: "getMovements",
      handler: "getMovements.handler",
      layers: [mysqlLayer],
      role: roleMerqueoLambda,
      runtime: lambda.Runtime.NODEJS_12_X,
    });

    const postPay = new lambda.Function(this, "postPay", {
      code: lambda.Code.fromAsset("lambdas"),
      environment: {
        TABLE_NAME: "dbd_table_1",
      },
      functionName: "postPay",
      handler: "postPay.handler",
      layers: [mysqlLayer],
      role: roleMerqueoLambda,
      runtime: lambda.Runtime.NODEJS_12_X,
    });

    const putCashBoxBase = new lambda.Function(this, "putCashBoxBase", {
      code: lambda.Code.fromAsset("lambdas"),
      environment: {
        TABLE_NAME: "dbd_table_1",
      },
      functionName: "putCashBoxBase",
      handler: "putCashBoxBase.handler",
      layers: [mysqlLayer],
      role: roleMerqueoLambda,
      runtime: lambda.Runtime.NODEJS_12_X,
    });

    const putCashBoxEmpty = new lambda.Function(this, "putCashBoxEmpty", {
      code: lambda.Code.fromAsset("lambdas"),
      environment: {
        TABLE_NAME: "dbd_table_1",
      },
      functionName: "putCashBoxEmpty",
      handler: "putCashBoxEmpty.handler",
      layers: [mysqlLayer],
      role: roleMerqueoLambda,
      runtime: lambda.Runtime.NODEJS_12_X,
    });

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
    const getKardexIntegration = new apigw.LambdaIntegration(getKardex);
    const getMovementsIntegration = new apigw.LambdaIntegration(getMovements);
    const postPayIntegration = new apigw.LambdaIntegration(postPay);
    const putCashBoxBaseIntegration = new apigw.LambdaIntegration(
      putCashBoxBase
    );
    const putCashBoxEmptyIntegration = new apigw.LambdaIntegration(
      putCashBoxEmpty
    );

    const apiMerqueoBase = apiMerqueo.root.addResource("merqueo");

    const apiGetCashBox = apiMerqueoBase.addResource("cash_box");
    apiGetCashBox.addMethod("GET", getCashBoxCurrentStateIntegration);

    const apiPostPay = apiGetCashBox.addResource("payment");
    apiPostPay.addMethod("POST", postPayIntegration);

    const apiPutCashBoxBase = apiGetCashBox.addResource("set_base");
    apiPutCashBoxBase.addMethod("PUT", putCashBoxBaseIntegration);

    const apiPutCashBoxEmpty = apiGetCashBox.addResource("empty");
    apiPutCashBoxEmpty.addMethod("PUT", putCashBoxEmptyIntegration);

    const apiGetMovements = apiMerqueoBase.addResource("movements");
    apiGetMovements.addMethod("GET", getMovementsIntegration);

    const apiGetKardex = apiGetMovements
      .addResource("kardex")
      .addResource("{date}");
    apiGetKardex.addMethod("GET", getKardexIntegration);
  }
}
