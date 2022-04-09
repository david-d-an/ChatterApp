require('dotenv').config({path: __dirname + '/.env'})
const ws = require('aws-lambda-ws-server');
const { handler: onConnect } = require('../onconnect/app');
// const { handler: onDisonnect } = require('../ondisconnect/app');
// const { handler: sendMessage } = require('../sendmessage/app');

const clients = {};
const handler = ws.handler({
    connect: async ({ id, event }) => {
        console.log(`\nSimulating Gateway Routing:`);
        console.log(`$connect> Client: ${id}`);
        clients[id] = true;
        return { statusCode: 200 };
    },
    disconnect: async ({ id }) => {
        console.log(`\nSimulating Gateway Routing:`);
        console.log(`$disconnect> Client: ${id}`);
        delete clients[id];
        return { statusCode: 200 };
    },
    default: async ({ message, id }) => {
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
        const { message, id, context } = req;

        const methodName = 'sendmessage';
        console.log(`\nSimulating Gateway Routing:`);
        console.log(`${methodName}> Client: ${id}`);

        const clientIDs = Object.keys(clients);        
        const msgPack = {
            senderId: id,
            message: message.text
        };
        
        console.log(`${methodName}> message to clients: ${clientIDs}`);
        await Promise.all(clientIDs.map(recipientId =>
            context.postToConnection(msgPack, recipientId)
        ));

        return { statusCode: 200 };
    },
});
exports.handler = ws(handler);