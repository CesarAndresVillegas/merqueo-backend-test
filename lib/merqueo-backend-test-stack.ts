import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";

export class CavMpbStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const secret = secretsmanager.Secret.fromSecretAttributes(
      this,
      "ImportedSecret",
      {
        secretArn:
          "arn:aws:secretsmanager:us-east-1:258052043838:secret:merqueo_params-MTDNow",
      }
    );

    const environmentLambdaVars = {
      HOST: secret.secretValueFromJson("HOST").toString(),
      USER: secret.secretValueFromJson("USER").toString(),
      PASSWORD: secret.secretValueFromJson("PASSWORD").toString(),
      DATABASE: secret.secretValueFromJson("DATABASE").toString(),
    };

    const roleMerqueoLambda = new iam.Role(this, "roleMerqueoBackendLambda", {
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
    const emptyCashBox = new lambda.Function(this, "emptyCashBoxMerqueo", {
      code: lambda.Code.fromAsset("lambdas"),
      environment: environmentLambdaVars,
      functionName: "emptyCashBoxMerqueo",
      handler: "handlers/emptyCashBox.handler",
      layers: [mysqlLayer],
      role: roleMerqueoLambda,
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(15),
    });

    const getAllMovements = new lambda.Function(
      this,
      "getAllMovementsMerqueo",
      {
        code: lambda.Code.fromAsset("lambdas"),
        environment: environmentLambdaVars,
        functionName: "getAllMovementsMerqueo",
        handler: "handlers/getAllMovements.handler",
        layers: [mysqlLayer],
        role: roleMerqueoLambda,
        runtime: lambda.Runtime.NODEJS_12_X,
        timeout: cdk.Duration.seconds(15),
      }
    );

    const getCashBoxStatus = new lambda.Function(
      this,
      "getCashBoxStatusMerqueo",
      {
        code: lambda.Code.fromAsset("lambdas"),
        environment: environmentLambdaVars,
        functionName: "getCashBoxStatusMerqueo",
        handler: "handlers/getCashBoxStatus.handler",
        layers: [mysqlLayer],
        role: roleMerqueoLambda,
        runtime: lambda.Runtime.NODEJS_12_X,
        timeout: cdk.Duration.seconds(15),
      }
    );

    const getPreviousCashBoxStatus = new lambda.Function(
      this,
      "getPreviousCashBoxStatusMerqueo",
      {
        code: lambda.Code.fromAsset("lambdas"),
        environment: environmentLambdaVars,
        functionName: "getPreviousCashBoxStatusMerqueo",
        handler: "handlers/getPreviousCashBoxStatus.handler",
        layers: [mysqlLayer],
        role: roleMerqueoLambda,
        runtime: lambda.Runtime.NODEJS_12_X,
        timeout: cdk.Duration.seconds(15),
      }
    );

    const paymentRegister = new lambda.Function(
      this,
      "paymentRegisterMerqueo",
      {
        code: lambda.Code.fromAsset("lambdas"),
        environment: environmentLambdaVars,
        functionName: "paymentRegisterMerqueo",
        handler: "handlers/paymentRegister.handler",
        layers: [mysqlLayer],
        role: roleMerqueoLambda,
        runtime: lambda.Runtime.NODEJS_12_X,
        timeout: cdk.Duration.seconds(15),
      }
    );

    const setCashBoxBase = new lambda.Function(this, "setCashBoxBaseMerqueo", {
      code: lambda.Code.fromAsset("lambdas"),
      environment: environmentLambdaVars,
      functionName: "setCashBoxBaseMerqueo",
      handler: "handlers/setCashBoxBase.handler",
      layers: [mysqlLayer],
      role: roleMerqueoLambda,
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(15),
    });

    // api template
    //
    const apiMPB = new apigw.RestApi(this, "apiTestMerqueo", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS, // this is also the default
      },
      description: "Basic API Gateway for merqueo test.",
      restApiName: "Merqueo API",
    });

    const emptyCashBoxIntegration = new apigw.LambdaIntegration(emptyCashBox);
    const getAllMovementsIntegration = new apigw.LambdaIntegration(
      getAllMovements
    );
    const getCashBoxStatusIntegration = new apigw.LambdaIntegration(
      getCashBoxStatus
    );
    const getPreviousCashBoxStatusIntegration = new apigw.LambdaIntegration(
      getPreviousCashBoxStatus
    );
    const paymentRegisterIntegration = new apigw.LambdaIntegration(
      paymentRegister
    );
    const setCashBoxBaseIntegration = new apigw.LambdaIntegration(
      setCashBoxBase
    );

    const apiMPBBase = apiMPB.root.addResource("merqueo");

    const apiCashBoxBase = apiMPBBase.addResource("cash_box");

    const apiEmptyCashBox = apiCashBoxBase.addResource("empty");
    apiEmptyCashBox.addMethod("POST", emptyCashBoxIntegration);

    const apiGetCashBoxStatus = apiCashBoxBase.addResource("get_status");
    apiGetCashBoxStatus.addMethod("GET", getCashBoxStatusIntegration);

    const apiSetCashBoxBase = apiCashBoxBase.addResource("set_base");
    apiSetCashBoxBase.addMethod("POST", setCashBoxBaseIntegration);

    const apiGetPreviousStatus = apiCashBoxBase.addResource("get_previous");
    apiGetPreviousStatus.addMethod("GET", getPreviousCashBoxStatusIntegration);

    const apiGetAllMovements = apiMPBBase.addResource("get_movements");
    apiGetAllMovements.addMethod("GET", getAllMovementsIntegration);

    const apiPaymentRegister = apiMPBBase.addResource("payment_register");
    apiPaymentRegister.addMethod("POST", paymentRegisterIntegration);
  }
}
