// /netlify/functions/authorGetAll.js
"use strict";
const headers = require('./headersCORS');
const rabbitPromise = require('./rabbitMQ');

async function getAllMessages() {
  try {
    // Conectar al servidor RabbitMQ
    const connection = await amqp.connect('amqp://localhost'); // Cambia la URL si es necesario
    const channel = await connection.createChannel();

    // Nombre de la cola
    const queue = 'myQueue';

    // Asegúrate de que la cola exista
    await channel.assertQueue(queue, { durable: true });

    // Consumiendo mensajes
    console.log('Esperando mensajes en la cola:', queue);
    channel.consume(queue, (msg) => {
      if (msg) {
        // Procesar mensaje
        console.log('Mensaje recibido:', msg.content.toString());
        // Acknowledge el mensaje
        channel.ack(msg);
      }
    });

    // Deja que el proceso continúe para recibir mensajes
  } catch (error) {
    console.error('Error:', error);
  }
}

getAllMessages();
