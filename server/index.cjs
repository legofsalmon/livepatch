// Live Patch sync relay: a y-websocket server with a shared-token gate.
//
// Run it anywhere Node runs:
//   cloud:  LIVEPATCH_TOKEN=change-me PORT=1234 npm start
//   venue:  same command on a laptop; point devices at ws://<laptop-ip>:1234
//
// Docs are held in memory while clients are connected; the clients' local
// IndexedDB copies are the durable source of truth and re-sync on connect.
const http = require('http')
const { WebSocketServer } = require('ws')
const { setupWSConnection } = require('y-websocket/bin/utils')

const PORT = Number(process.env.PORT || 1234)
const HOST = process.env.HOST || '0.0.0.0'
const TOKEN = process.env.LIVEPATCH_TOKEN || ''

if (!TOKEN) {
  console.warn(
    'WARNING: LIVEPATCH_TOKEN is not set — the relay will accept any client. ' +
      'Set a token for anything beyond a trusted local network.'
  )
}

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Live Patch sync relay is running\n')
})

const wss = new WebSocketServer({ noServer: true })
wss.on('connection', setupWSConnection)

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, 'http://localhost')
  const token = url.searchParams.get('token') || ''
  if (TOKEN && token !== TOKEN) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
    return
  }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req))
})

server.listen(PORT, HOST, () => {
  console.log(`Live Patch relay listening on ${HOST}:${PORT} (token ${TOKEN ? 'set' : 'NOT set'})`)
})
