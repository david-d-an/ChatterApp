const { TABLE_NAME } = process.env;
const { GetSDK, GetAPI } = require('./AwsFactory');
const aws = GetSDK();
const ddb = new aws.DynamoDB.DocumentClient({ 
  apiVersion: '2012-08-10', 
});

// console.log(`ddb.config.region: ${ddb.config.region}`);
// console.log(`ddb.config.endpoint: ${ddb.config.endpoint}`);

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

  const apigwManagementApi = GetAPI(aws, event.requestContext);
  const postData = JSON.parse(event.body).data;
  // console.log(`# postData: ${postData}`);
  
  const postCalls = connectionData.Items.map(async ({ connectionId }) => {
    // console.log(`# connectionId: ${connectionId}`);
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