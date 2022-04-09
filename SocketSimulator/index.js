require('dotenv').config({path: __dirname + '/.env'})
const ws = require('aws-lambda-ws-server');

const clients = {};
const handler = ws.handler({
    connect: async ({ id, event }) => {
        clients[id] = true;
        console.log('connected', id);
        return { statusCode: 200 };
    },
    disconnect: async ({ id }) => {
        delete clients[id];
        console.log('disconnect', id);
        return { statusCode: 200 };
    },
    default: async ({ message, id }) => {
        console.log('default', message);
        return { statusCode: 200 };
    },
    echo: async ({ message, id, context }) => {
        const { postToConnection } = context;
        await postToConnection(message, id);
        console.log('echo', message);
        return { statusCode: 200 };
    },
    sendmessage: async (req) => {
        // console.log('req: ', req);
        const { message, id, context } = req;
        const clientIDs = Object.keys(clients);
        console.log('sendmessage to all clients: ', clientIDs);

        const msgPack = {
            senderId: id,
            message: message.text
        };

        await Promise.all(clientIDs.map(recipientId =>
            context.postToConnection(msgPack, recipientId)
        ));

        return { statusCode: 200 };
    },
});
exports.handler = ws(handler);