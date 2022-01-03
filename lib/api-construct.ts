import * as cdk from '@aws-cdk/core';
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2';
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as lambda from '@aws-cdk/aws-lambda';

export interface ApiConstructProps {
   httpApiId: string;
  routeKey: string;
    httpMethod: apigatewayv2.HttpMethod;
    authorizer: apigatewayv2.IHttpRouteAuthorizer | undefined;
    handler: any
}
export class ApiConstruct extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: ApiConstructProps) {
        super(scope, id);

        const httpApi = apigatewayv2.HttpApi.fromHttpApiAttributes(
            this,
            'Api',
            {httpApiId: props.httpApiId,}
        );

        new apigatewayv2.HttpRoute(this, props.routeKey, {
            httpApi,
            authorizer: props.authorizer,
            integration: new integrations.LambdaProxyIntegration({
                handler: props.handler,
            }),
            routeKey: { key: `${props.httpMethod} /${props.routeKey}` },
        })
    }
}