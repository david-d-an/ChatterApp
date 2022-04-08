// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-route-keys-connect-disconnect.html
// The $disconnect route is executed after the connection is closed.
// The connection can be closed by the server or by the client. As the connection is already closed when it is executed, 
// $disconnect is a best-effort event. 
// API Gateway will try its best to deliver the $disconnect event to your integration, but it cannot guarantee delivery.

const { GetSDK } = require('./AwsFactory');
const aws = GetSDK();
const ddb = new aws.DynamoDB.DocumentClient({ 
  apiVersion: '2012-08-10', 
  region: process.env.AWS_REGION 
});

exports.handler = async event => {
  const deleteParams = {
    TableName: process.env.TABLE_NAME,
    Key: {
      connectionId: event.requestContext.connectionId
    }
  };

  // console.log(`# onDisconnect: connectionId: ${deleteParams.Item.connectionId}`);

  try {
    // Deregister the connection ID from DynamoDB
    await ddb.delete(deleteParams).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(err) };
  }

  return { statusCode: 200, body: 'Disconnected.' };
};
