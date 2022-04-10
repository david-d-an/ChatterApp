require('dotenv').config({path: __dirname + '/.env'})
const ws = require('aws-lambda-ws-server');
const { handler: onConnect } = require('../onconnect');
const { handler: onDisonnect } = require('../ondisconnect');
const { handler: sendMessage } = require('../sendmessage');

// const clients = {};
const handler = ws.handler({
    connect: async ({ id, event }) => {
        console.log(`\nSimulating Gateway Routing:`);
        console.log(`$connect> Client: ${id}`);

        // clients[id] = true;
        onConnect(event);

        return { statusCode: 200 };
    },
    disconnect: async ({ id, event }) => {
        console.log(`\nSimulating Gateway Routing:`);
        console.log(`$disconnect> Client: ${id}`);

        // delete clients[id];
        onDisonnect(event);

        return { statusCode: 200 };
    },
    default: async ({ message, id, event, context }) => {
        console.log(`\nSimulating Gateway Routing:`);
        console.log(`$default> Client: ${id}`);

        return { statusCode: 200 };
    },
    echo: async ({ message, id, context }) => {
        const methodName = 'echo';
        console.log(`\nSimulating Gateway Routing:`);
        console.log(`${methodName}> Client: ${id}`);

        const { postToConnection } = context;
        await postToConnection(message, id);

        return { statusCode: 200 };
    },
    sendmessage: async (req) => {
        // console.log('req: ', req);
        const { id, event } = req;

        const methodName = 'sendmessage';
        console.log(`\nSimulating Gateway Routing:`);
        console.log(`${methodName}> Client: ${id}`);

        // const clientIDs = Object.keys(clients);        
        // const msgPack = {
        //     senderId: id,
        //     message: message.text
        // };

        // console.log(`${methodName}> message to clients: ${clientIDs}`);
        // await Promise.all(clientIDs.map(recipientId =>
        //     context.postToConnection(msgPack, recipientId)
        // ));

        const requestContext = {
            stage: 'stage',
            domainName: `localhost`,
            secure: false
        }
        const port = process.env.PORT || 5000;
        const updatedEvent = {...event, port, requestContext };
        sendMessage(updatedEvent);

        return { statusCode: 200 };
    },
});
exports.handler = ws(handler);