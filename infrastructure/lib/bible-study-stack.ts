import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class SiloeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for audio files and study resources
    const resourcesBucket = new s3.Bucket(this, 'SiloeResources', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
    });

    // CloudFront distribution for resources
    const distribution = new cloudfront.Distribution(this, 'SiloeDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(resourcesBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
    });

    // DynamoDB Tables
    const studiesTable = new dynamodb.Table(this, 'StudiesTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
    });

    studiesTable.addGlobalSecondaryIndex({
      indexName: 'UserStudiesIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });

    const journalTable = new dynamodb.Table(this, 'JournalTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'entryDate', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const studyPlansTable = new dynamodb.Table(this, 'StudyPlansTable', {
      partitionKey: { name: 'planId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const progressTable = new dynamodb.Table(this, 'ProgressTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'chapterId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // OpenSearch Domain for cross-references and search
    const openSearchDomain = new opensearch.Domain(this, 'SiloeSearch', {
      version: opensearch.EngineVersion.OPENSEARCH_2_5,
      capacity: {
        dataNodes: 1,
        dataNodeInstanceType: 't3.small.search',
      },
      ebs: {
        volumeSize: 10,
      },
      zoneAwareness: {
        enabled: false,
      },
      enforceHttps: true,
      nodeToNodeEncryption: true,
      encryptionAtRest: {
        enabled: true,
      },
    });

    // Lambda Functions
    const generateStudyFunction = new NodejsFunction(this, 'GenerateStudyFunction', {
      entry: '../backend/functions/generateStudy.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(5),
      environment: {
        STUDIES_TABLE: studiesTable.tableName,
        OPENSEARCH_DOMAIN: openSearchDomain.domainEndpoint,
        RESOURCES_BUCKET: resourcesBucket.bucketName,
      },
    });

    const journalFunction = new NodejsFunction(this, 'JournalFunction', {
      entry: '../backend/functions/journal.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        JOURNAL_TABLE: journalTable.tableName,
      },
    });

    const studyPlanFunction = new NodejsFunction(this, 'StudyPlanFunction', {
      entry: '../backend/functions/studyPlan.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        STUDY_PLANS_TABLE: studyPlansTable.tableName,
      },
    });

    const progressFunction = new NodejsFunction(this, 'ProgressFunction', {
      entry: '../backend/functions/progress.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PROGRESS_TABLE: progressTable.tableName,
      },
    });

    const crossReferenceFunction = new NodejsFunction(this, 'CrossReferenceFunction', {
      entry: '../backend/functions/crossReference.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        OPENSEARCH_DOMAIN: openSearchDomain.domainEndpoint,
      },
    });

    // Grant permissions
    studiesTable.grantReadWriteData(generateStudyFunction);
    journalTable.grantReadWriteData(journalFunction);
    studyPlansTable.grantReadWriteData(studyPlanFunction);
    progressTable.grantReadWriteData(progressFunction);
    resourcesBucket.grantRead(generateStudyFunction);

    // Bedrock permissions
    const bedrockPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['bedrock:InvokeModel'],
      resources: ['*'],
    });

    [generateStudyFunction, journalFunction, studyPlanFunction, crossReferenceFunction]
      .forEach(fn => fn.addToRolePolicy(bedrockPolicy));

    // API Gateway
    const api = new apigateway.RestApi(this, 'SiloeAPI', {
      restApiName: 'Siloe Bible Study API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // API Resources
    const studies = api.root.addResource('studies');
    const journal = api.root.addResource('journal');
    const plans = api.root.addResource('plans');
    const progress = api.root.addResource('progress');
    const crossRefs = api.root.addResource('cross-references');

    // Add methods
    [
      { resource: studies, function: generateStudyFunction },
      { resource: journal, function: journalFunction },
      { resource: plans, function: studyPlanFunction },
      { resource: progress, function: progressFunction },
      { resource: crossRefs, function: crossReferenceFunction },
    ].forEach(({ resource, function: fn }) => {
      resource.addMethod('GET', new apigateway.LambdaIntegration(fn));
      resource.addMethod('POST', new apigateway.LambdaIntegration(fn));
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'ResourcesUrl', { value: distribution.distributionDomainName });
  }
}
