// /netlify/functions/rabbitMQ.js
"use strict";
const amqp = require('amqplib');

module.exports = async () => { 
  const conn = await amqp.connect(process.env.CLOUDAMQP_URL);
  const channel = await conn.createChannel();
  return channel;
};
