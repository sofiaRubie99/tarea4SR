"use strict";
const amqp = require('amqplib'); // Asegúrate de que esta línea esté presente
const headers = require('./headersCORS');  // Si usas un archivo para CORS, asegúrate de que esté bien configurado
const rabbitPromise = require('./rabbitMQ');

exports.handler = async function(event, context) {
  try {
    // Conectar al servidor RabbitMQ
    const connection = await amqp.connect(process.env.CLOUDAMQP_URL); // Cambia la URL si es necesario
    const channel = await connection.createChannel();

    // Nombre de la cola
    const queue = 'bookstore';

    // Asegúrate de que la cola exista
    await channel.assertQueue(queue, { durable: true });

    // Recoger todos los mensajes en la cola
    let messages = [];
    channel.consume(queue, (msg) => {
      if (msg) {
        messages.push(msg.content.toString());  // Almacena el mensaje en el arreglo
        channel.ack(msg);  // Acknowledge el mensaje
      }
    });

    // Asegúrate de que todos los mensajes se procesen
    await new Promise(resolve => setTimeout(resolve, 5000));  // Espera un poco para que los mensajes sean procesados

    // Devolver la respuesta HTTP
    return {
      statusCode: 200,
      body: JSON.stringify({ messages }),
      headers: headers,  // Incluye los headers CORS si es necesario
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error en la función' }),
    };
  }
};
