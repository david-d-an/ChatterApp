const AWS = require('aws-sdk');
const { 
  DYNAMO_END_POINT, 
  AWS_REGION_NAME, 
} = process.env;

exports.GetSDK = () => {
// console.log('# AWS_REGION_NAME: ', AWS_REGION_NAME);
// console.log('# DYNAMO_END_POINT: ', DYNAMO_END_POINT);
  if (AWS_REGION_NAME === 'local') {
    console.log('Activating local DynamoDB');
    AWS.config.update({
      region: AWS_REGION_NAME,
      endpoint: DYNAMO_END_POINT
    });
  }
  return AWS;
};

exports.GetAPI = (sdk, ctx) => new sdk.ApiGatewayManagementApi({
  apiVersion: '2018-11-29',
  endpoint: ctx.domainName + '/' + ctx.stage
});