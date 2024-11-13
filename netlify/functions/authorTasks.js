// /netlify/functions/authorTasks.js
"use strict";
const rabbitPromise = require('./rabbitMQ');
const headers = require('./headersCORS');
const url = 'https://your-frontend-site.com/api/author';

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    const channel = await rabbitPromise();
    let message = await channel.get("bookstore", { noAck: true });

    while (message) {
      const request = JSON.parse(message.content.toString());

      switch (request.method) {
        case "DELETE":
          await fetch(`${url}/delete/${request.id}`, { 
            method: "DELETE", 
            headers: { "Content-type": "application/json" } 
          });
          break;

        case "UPDATE":
          await fetch(`${url}/update/${request.id}`, { 
            method: "PUT", 
            headers: { "Content-type": "application/json" }, 
            body: JSON.stringify(request.body) 
          });
          break;

        case "INSERT":
          await fetch(`${url}/add`, { 
            method: "POST", 
            headers: { "Content-type": "application/json" }, 
            body: JSON.stringify(request.body) 
          });
          break;

        case "GET_ALL":
          const response = await fetch(`${url}/all`, { method: "GET", headers: { "Content-type": "application/json" } });
          const authors = await response.json();
          console.log("Authors fetched:", authors);
          break;
      }
      message = await channel.get("bookstore", { noAck: true });
    }

    return { statusCode: 200, headers, body: 'OK' };
  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify(error) };
  }
};
