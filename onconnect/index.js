const { GetSDK } = require('./AwsFactory');
const aws = GetSDK();
const ddb = new aws.DynamoDB.DocumentClient({ 
  apiVersion: '2012-08-10'
});

exports.handler = async event => {

  
  const putParams = {
    TableName: process.env.TABLE_NAME,
    Item: {
      connectionId: event.requestContext.connectionId
    }
  };

  console.log(`# onConnect: connectionId: ${putParams.Item.connectionId}`);

  try {
    // Register the connection ID to DynamoDB
    await ddb.put(putParams).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(err) };
  }

  return { statusCode: 200, body: 'Connected.' };
};
