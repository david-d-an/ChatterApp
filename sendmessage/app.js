const { TABLE_NAME } = process.env;
const { GetSDK } = require('./AwsFactory');
const aws = GetSDK();
const ddb = new aws.DynamoDB.DocumentClient({ 
  apiVersion: '2012-08-10', 
  region: 'us-east-2',
});

// console.log('ddb.config: ', JSON.stringify(ddb));
// console.log('ddb.config.region: ', ddb.config.region);
// console.log('ddb.config.endpoint: ', ddb.config.endpoint);
// console.log('ddb.config.accessKeyId: ', ddb.config.accessKeyId);
// console.log('ddb.config.secretAccessKey: ', ddb.config.secretAccessKey);

exports.handler = async event => {
  let connectionData;

  try {
    connectionData = await ddb.scan({ 
      TableName: TABLE_NAME, 
      ProjectionExpression: 'connectionId' 
    }).promise();
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }
  
  const apigwManagementApi = new aws.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  
  const postData = JSON.parse(event.body).data;
  // console.log('# postData: ', postData);
  
  const postCalls = connectionData.Items.map(async ({ connectionId }) => {
    // console.log('############ connectionId: ', connectionId);
    try {
      // Send the message back to all connected clients
      await apigwManagementApi.postToConnection({ 
        ConnectionId: connectionId, 
        Data: postData 
      }).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        await ddb.delete({ 
          TableName: TABLE_NAME, 
          Key: { connectionId } }
        ).promise();
      } else {
        throw e;
      }
    }
  });
  
  try {
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};
