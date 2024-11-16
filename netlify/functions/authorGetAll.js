"use strict";
const amqp = require('amqplib');
const headers = require('./headersCORS'); // Si usas un archivo para CORS, inclúyelo correctamente
const rabbitPromise = require('./rabbitMQ');

exports.handler = async function (event, context) {
  try {
    // Conectar al servidor RabbitMQ
    const connection = await amqp.connect(process.env.CLOUDAMQP_URL);
    const channel = await connection.createChannel();

    // Nombre de la cola
    const queue = 'bookstore';

    // Asegúrate de que la cola exista
    await channel.assertQueue(queue, { durable: true });

    // Obtener un mensaje de la cola
    const msg = await channel.get(queue, { noAck: false });

    let response;
    if (msg) {
      // Si hay un mensaje, procesarlo
      response = msg.content.toString();
      channel.ack(msg); // Confirmar que el mensaje fue procesado
    } else {
      // Si no hay mensajes
      response = 'The queue is empty.';
    }

    // Cierra la conexión
    await channel.close();
    await connection.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: response }),
      headers: headers,
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error in the function' }),
    };
  }
};
