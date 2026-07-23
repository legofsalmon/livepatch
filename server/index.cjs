// Live Patch sync relay: a y-websocket server with a shared-token gate and
// attachment storage.
//
// Run it anywhere Node runs:
//   cloud:  LIVEPATCH_TOKEN=change-me PORT=1234 npm start
//   venue:  same command on a laptop; point devices at ws://<laptop-ip>:1234
//
// Docs are held in memory while clients are connected; the clients' local
// IndexedDB copies are the durable source of truth and re-sync on connect.
// Attachments (lineup files) are stored on disk under DATA_DIR.
const http = require('http')
const fs = require('fs')
const path = require('path')
const { WebSocketServer } = require('ws')
const { setupWSConnection } = require('y-websocket/bin/utils')

const PORT = Number(process.env.PORT || 1234)
const HOST = process.env.HOST || '0.0.0.0'
const TOKEN = process.env.LIVEPATCH_TOKEN || ''
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')
const FILES_DIR = path.join(DATA_DIR, 'files')
const MAX_FILE_BYTES = Number(process.env.MAX_FILE_BYTES || 25 * 1024 * 1024)

fs.mkdirSync(FILES_DIR, { recursive: true })

if (!TOKEN) {
  console.warn(
    'WARNING: LIVEPATCH_TOKEN is not set — the relay will accept any client. ' +
      'Set a token for anything beyond a trusted local network.'
  )
}

const authorized = (url) => !TOKEN || url.searchParams.get('token') === TOKEN

const FILE_ID_RE = /^[a-zA-Z0-9-]{1,64}$/

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-File-Name',
}

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { ...CORS_HEADERS, ...headers })
  res.end(body)
}

const fileMetaPath = (id) => path.join(FILES_DIR, `${id}.json`)
const fileDataPath = (id) => path.join(FILES_DIR, `${id}.bin`)

const handleFileRequest = (req, res, url, id) => {
  if (!FILE_ID_RE.test(id)) return send(res, 400, 'Bad file id\n')
  if (!authorized(url)) return send(res, 401, 'Unauthorized\n')

  if (req.method === 'PUT') {
    const name = decodeURIComponent(req.headers['x-file-name'] || 'file')
    const type = req.headers['content-type'] || 'application/octet-stream'
    const declared = Number(req.headers['content-length'] || 0)
    if (declared > MAX_FILE_BYTES) return send(res, 413, 'File too large\n')

    const out = fs.createWriteStream(fileDataPath(id))
    let received = 0
    let aborted = false
    req.on('data', (chunk) => {
      received += chunk.length
      if (received > MAX_FILE_BYTES && !aborted) {
        aborted = true
        out.destroy()
        fs.rm(fileDataPath(id), { force: true }, () => {})
        send(res, 413, 'File too large\n')
        req.destroy()
      }
    })
    req.pipe(out)
    out.on('finish', () => {
      if (aborted) return
      const meta = { name, type, size: received }
      fs.writeFile(fileMetaPath(id), JSON.stringify(meta), (err) => {
        if (err) return send(res, 500, 'Failed to store metadata\n')
        send(res, 200, JSON.stringify({ id, ...meta }), { 'Content-Type': 'application/json' })
      })
    })
    out.on('error', () => {
      if (!aborted) send(res, 500, 'Failed to store file\n')
    })
    return
  }

  if (req.method === 'GET') {
    fs.readFile(fileMetaPath(id), 'utf8', (err, raw) => {
      if (err) return send(res, 404, 'Not found\n')
      const meta = JSON.parse(raw)
      const stream = fs.createReadStream(fileDataPath(id))
      stream.on('error', () => send(res, 404, 'Not found\n'))
      stream.on('open', () => {
        res.writeHead(200, {
          ...CORS_HEADERS,
          'Content-Type': meta.type,
          'Content-Length': meta.size,
          'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(meta.name)}`,
          'Cache-Control': 'private, max-age=31536000, immutable',
        })
        stream.pipe(res)
      })
    })
    return
  }

  if (req.method === 'DELETE') {
    fs.rm(fileDataPath(id), { force: true }, () => {
      fs.rm(fileMetaPath(id), { force: true }, () => send(res, 204, null))
    })
    return
  }

  send(res, 405, 'Method not allowed\n')
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')

  if (req.method === 'OPTIONS') return send(res, 204, null)

  const fileMatch = url.pathname.match(/^\/files\/([^/]+)$/)
  if (fileMatch) return handleFileRequest(req, res, url, fileMatch[1])

  if (url.pathname === '/healthz') {
    return send(res, 200, 'ok\n', { 'Content-Type': 'text/plain' })
  }

  send(res, 200, 'Live Patch sync relay is running\n', { 'Content-Type': 'text/plain' })
})

const wss = new WebSocketServer({ noServer: true })
wss.on('connection', setupWSConnection)

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, 'http://localhost')
  if (!authorized(url)) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
    return
  }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req))
})

server.listen(PORT, HOST, () => {
  console.log(`Live Patch relay listening on ${HOST}:${PORT} (token ${TOKEN ? 'set' : 'NOT set'})`)
})
