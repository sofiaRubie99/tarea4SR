"use strict";
const amqp = require('amqplib');
const headers = require('./headersCORS'); // Si usas un archivo para CORS, inclúyelo correctamente

exports.handler = async function (event, context) {
  try {
    // Conectar al servidor RabbitMQ
    const connection = await amqp.connect(process.env.CLOUDAMQP_URL); // Cambia la URL si es necesario
    const channel = await connection.createChannel();

    // Nombre de la cola
    const queue = 'bookstore';

    // Asegúrate de que la cola exista
    await channel.assertQueue(queue, { durable: true });

    // Recoger un mensaje de la cola
    const message = await new Promise((resolve) => {
      channel.consume(queue, (msg) => {
        if (msg) {
          resolve(msg.content.toString()); // Retorna el mensaje si existe
          channel.ack(msg); // Acknowledge el mensaje
        } else {
          resolve(null); // No hay mensajes
        }
      });
    });

    // Cierra la conexión
    await channel.close();
    await connection.close();

    // Respuesta
    if (message) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message }),
        headers: headers,
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'The queue is empty.' }),
        headers: headers,
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error in the function' }),
    };
  }
};
