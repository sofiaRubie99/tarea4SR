// /netlify/functions/authorGetAll.js
"use strict";
const headers = require('./headersCORS');
const rabbitPromise = require('./rabbitMQ');

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    const channel = await rabbitPromise();
    const request = `{'method':'GET_ALL'}`;
    
    // Set up a temporary queue to receive the response
    const responseQueue = await channel.assertQueue('', { exclusive: true });
    
    // Send the request message to the "bookstore" queue
    await channel.sendToQueue("bookstore", Buffer.from(request), {
      replyTo: responseQueue.queue,
    });

    // Wait for the response from RabbitMQ
    const authors = await new Promise((resolve, reject) => {
      channel.consume(
        responseQueue.queue,
        (msg) => {
          if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
            resolve(data);
            channel.ack(msg);
          }
        },
        { noAck: false }
      );
    });

    return { statusCode: 200, headers, body: JSON.stringify(authors) };
  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify(error) };
  }
};
