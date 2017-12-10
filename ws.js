'use strict'

const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: process.env.PORT || 3000 })

module.exports = function publish(type, payload) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type,
        payload
      }))
    }
  })
}
