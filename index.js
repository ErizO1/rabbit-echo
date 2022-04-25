import amqp from 'amqp-connection-manager';
import dotenv from 'dotenv';
import Log from './log.js';
dotenv.config();

const log = new Log();
let alreadyConnected = false;

const connection = amqp.connect(`amqp://${process.env['RABBIT_USER']}:${process.env['RABBIT_PASSWORD']}@${process.env['RABBIT_HOST']}:${process.env['RABBIT_PORT']}`, {
    reconnectTimeInSeconds: 5,
});

connection.on('connect', () => {
    log.I(`Connected to ${process.env['RABBIT_HOST']}:${process.env['RABBIT_PORT']}`)
    alreadyConnected = true;
})

connection.on('connectFailed', (e) => {
    if (!alreadyConnected) {
        log.E(`Error connecting to ${process.env['RABBIT_HOST']}:${process.env['RABBIT_PORT']}`)
        log.E(JSON.stringify(e))
        process.exit(1)
    }
    log.W(`Reconnection to ${process.env['RABBIT_HOST']}:${process.env['RABBIT_PORT']} has failed. Retrying...`)
})

connection.on('disconnect', () => {
    log.I('Connection closed')
})

connection.createChannel({
    json: true,
    setup: async function (channel) {
        await channel.on('close', () => {
            log.W('Channel closed, reopenning...');
        })

        await channel.on('error', (err) => {
            log.E(`An error occurred: ${err}`);
        })

        await channel.assertQueue(process.env['RABBIT_ECHO_QUEUE']);
        await channel.consume(process.env['RABBIT_ECHO_QUEUE'], function(msg) {
            const replyRoute = msg.properties.replyTo && msg.properties.correlationId;
            const replyRouteDisplay = replyRoute ? `(${msg.properties.replyTo.startsWith('amq.rabbitmq.reply-to') ? 'amq.rabbitmq.reply-to' : replyRoute }:${msg.properties.correlationId})` : 'No Reply';
            const content = msg.properties.contentType === 'application/json' ? JSON.stringify(JSON.parse(msg.content.toString()), null, 0) : msg.content.toString();
            log.L(`Received Message: ${replyRouteDisplay} ${content}`)

            if (replyRoute) {
                channel.sendToQueue(msg.properties.replyTo, Buffer.from(content), { correlationId: msg.properties.correlationId })
            }

        }, { noAck: true })
        log.I(`Consuming ${process.env['RABBIT_ECHO_QUEUE']}`)
    },
  });
