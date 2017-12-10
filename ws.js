'use strict'

module.exports = app => {
  const expressWs = require('express-ws')(app)
  const wss = expressWs.getWss()

  app.ws('/', (ws, req) => {})

  return function publish(type, payload) {
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type,
          payload
        }))
      }
    })
  }
}
