const { TABLE_NAME, AWS_REGION_NAME } = process.env;
const { GetSDK, GetAPI } = require('./AwsFactory');
const aws = GetSDK();
const ddb = new aws.DynamoDB.DocumentClient({ 
  apiVersion: '2012-08-10', 
});

// console.log(`ddb.config.region: ${ddb.config.region}`);
// console.log(`ddb.config.endpoint: ${ddb.config.endpoint}`);

exports.handler = async event => {
  let connectionData;
  // console.log(event.requestContext.domainName + '/' + event.requestContext.stage);

  try {
    connectionData = await ddb.scan({ 
      TableName: TABLE_NAME, 
      ProjectionExpression: 'connectionId' 
    }).promise();
  } catch (e) {
    console.log(`Scanning failed`);
    return { statusCode: 500, body: e.stack };
  }

  const apigwManagementApi = GetAPI(aws, event.requestContext);
  const postData =JSON.parse(event.body).text;

  const postCalls = connectionData.Items.map(async ({ connectionId }) => {
    try {
      // Send the message back to all connected clients

      if (AWS_REGION_NAME === 'local') {
        console.log(`Localhost loopback: posting to connection: ${connectionId}`);
        const postToConnectionBuilder = require('aws-post-to-connection')
        const postToConnection = postToConnectionBuilder(event);
        await postToConnection({ message: postData }, connectionId);
      } else {
        console.log(`Cloud loopback: posting to connection: ${connectionId}`);
        await apigwManagementApi.postToConnection({ 
          ConnectionId: connectionId, 
          Data: postData 
        }).promise();
      }
    } catch (e) {
      if (e.statusCode === 410 || e.message.includes('410')) {
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
