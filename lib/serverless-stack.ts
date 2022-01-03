import * as cdk from '@aws-cdk/core';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodeLambda from '@aws-cdk/aws-lambda-nodejs';
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2';
import { ApiConstruct, ApiConstructProps } from './api-construct';

export class ServerlessStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
        dotenv.config();

        const envName = 'envName' || this.node.tryGetContext('envName');
        const globalEnvName = 'globalEnvName' || this.node.tryGetContext('globalEnvName');

        const appDir = path.normalize(
            path.join(__dirname, '../', 'apps/')
        );
    // const vpc = new ec2.Vpc(this, 'testing');
    // const cluster = new rds.ServerlessCluster(this, 'AuroraTestingCluster', {
    //   engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
    //   parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.aurora-postgresql10'),
    //   defaultDatabaseName: 'BlogDB',
    //   vpc,
    // });

       const discoverEntry = path.normalize(
            path.join(appDir, 'handlers/', 'handler.ts')
        );
    const testFunction = new nodeLambda.NodejsFunction(this, 'MyLambdaFunction', {
      entry: discoverEntry,
      depsLockFilePath: path.normalize(path.join(appDir, 'yarn.lock')),
      projectRoot: appDir,
      environment: {
        // CLUSTER_ARN: cluster.clusterArn,
        // SECRET_ARN: cluster.secret?.secretArn || '',
        DB_NAME: 'BlogDB',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
      },
      bundling: {
        forceDockerBundling: true,
        nodeModules: [
            // '@aws-sdk/client-dynamodb',
            // '@aws-sdk/lib-dynamodb',
            // '@aws-sdk/util-dynamodb',
            '@middy/core',
            'http-status-codes',
            '@middy/validator',
            '@middy/http-json-body-parser',
            '@middy/http-error-handler'
        ],
      },
                // tracing: lambda.Tracing.ACTIVE,
                // logRetention: logs.RetentionDays.ONE_MONTH,
                timeout: cdk.Duration.seconds(30),
    })

    const discoverProps = {
      httpApiId: `${globalEnvName}-app`,
        routeKey: `${envName}/tenants`,
            httpMethod: apigatewayv2.HttpMethod.GET,
            authorizer: new apigatewayv2.HttpNoneAuthorizer(),
            handler: testFunction,
    } as ApiConstructProps;

    new ApiConstruct(this, 'MyFunction', discoverProps);
    // cluster.grantDataApiAccess(testFunction);
  }
}
