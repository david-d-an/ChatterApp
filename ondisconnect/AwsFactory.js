const AWS = require('aws-sdk');
const { 
  DYNAMO_END_POINT, 
  AWS_REGION_NAME, 
  ACCESS_KEY_ID, 
  SECRET_ACCESS_KEY 
} = process.env;

exports.GetSDK = () => {
// console.log('# AWS_REGION_NAME: ', AWS_REGION_NAME);
// console.log('# DYNAMO_END_POINT: ', DYNAMO_END_POINT);
// console.log('# TABLE_NAME: ', TABLE_NAME);
// console.log('# ACCESS_KEY_ID: ', ACCESS_KEY_ID);
// console.log('# SECRET_ACCESS_KEY: ', SECRET_ACCESS_KEY);
  if (AWS_REGION_NAME === 'local') {
    console.log('Activating local DynamoDB');
    AWS.config.update({
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
      region: 'us-east-2',
      endpoint: DYNAMO_END_POINT
    });
  }
  return AWS;
};

exports.GetAPI = (sdk, ctx) => new sdk.ApiGatewayManagementApi({
  apiVersion: '2018-11-29',
  endpoint: ctx.domainName + '/' + ctx.stage
});