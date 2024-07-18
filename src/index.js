'use strict';

const WebSocket = require('ws');
const jwt = require('jsonwebtoken')

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    const server = strapi.server.httpServer;
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
      console.log('WebSocket connection established');
      
      const token = req.url.split('token=')[1];

      if (!token) {
        ws.close();
        console.log('WebSocket connection closed because no token found');
        return;
      }

      try {
        const jwtKey = strapi.config.get('plugin.users-permissions.jwtSecret')
        jwt.verify(token, jwtKey)
      }catch (e) { 
        ws.close();
        console.log('WebSocket connection closed because token is invalid');
        return;
      }

      ws.on('message', message => {
        ws.send(message); // Echo back the received message
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });
    });

    console.log('WebSocket server is running');
  },
};
