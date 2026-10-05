// server/index.mjs — Hogwarts Duel 3D Standalone WebSocket Game Server
import http from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'

const PORT = parseInt(process.env.PORT || '5181', 10)

/**
 * @type {Map<string, {
 *   code: string,
 *   host: { ws: WebSocket, id: string, name: string, role: string, deck: string[], joinedAt: number },
 *   guest: { ws: WebSocket, id: string, name: string, role: string, deck: string[], joinedAt: number } | null,
 *   status: 'LOBBY' | 'DUELING' | 'FINISHED',
 *   createdAt: number,
 *   lastActivityAt: number,
 *   disconnectTimeout?: any
 * }>}
 */
const rooms = new Map()

// 1. Create HTTP Server
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`)

  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'ok',
      service: 'Hogwarts Duel 3D Game Server',
      activeRooms: rooms.size,
      timestamp: Date.now(),
      uptimeSeconds: Math.round(process.uptime()),
    }))
    return
  }

  if (url.pathname === '/api/rooms') {
    const openRooms = Array.from(rooms.values())
      .filter((r) => r.status === 'LOBBY' && !r.guest)
      .map((r) => ({
        code: r.code,
        hostName: r.host.name,
        hostDeck: r.host.deck,
        createdAt: r.createdAt,
      }))

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ rooms: openRooms }))
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Endpoint not found' }))
})

// 2. Create WebSocket Server attached to HTTP Server
const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
  let currentRoomCode = null
  let duelistRole = null

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString())
      handleClientMessage(ws, data)
    } catch (err) {
      console.error('[Server] Lỗi giải mã tin nhắn JSON:', err)
    }
  })

  ws.on('close', () => {
    if (currentRoomCode) {
      handleClientDisconnect(ws, currentRoomCode, duelistRole)
    }
  })

  function handleClientMessage(socket, data) {
    const { type, code, payload } = data

    switch (type) {
      case 'ping': {
        socket.send(JSON.stringify({ type: 'pong', originTime: payload?.timestamp, serverTime: Date.now() }))
        break
      }

      case 'create_room': {
        const roomCode = (code || `HOGW-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase().trim()
        
        // Remove existing room with same code if empty
        if (rooms.has(roomCode)) {
          const old = rooms.get(roomCode)
          if (old.host.ws !== socket) {
            socket.send(JSON.stringify({ type: 'error', message: 'Mã phòng đã tồn tại!' }))
            return
          }
        }

        const duelist = {
          ws: socket,
          id: payload?.duelistId || `host-${Date.now()}`,
          name: payload?.name || 'Harry Potter',
          role: 'host',
          deck: payload?.deck || [],
          joinedAt: Date.now(),
        }

        const newRoom = {
          code: roomCode,
          host: duelist,
          guest: null,
          status: 'LOBBY',
          createdAt: Date.now(),
          lastActivityAt: Date.now(),
        }

        rooms.set(roomCode, newRoom)
        currentRoomCode = roomCode
        duelistRole = 'host'

        console.log(`🏰 [Server] Phòng mới được tạo: ${roomCode} bởi Chủ phòng ${duelist.name}`)
        socket.send(JSON.stringify({
          type: 'room_created',
          code: roomCode,
          payload: { isHost: true },
        }))
        break
      }

      case 'join_room': {
        const roomCode = (code || '').toUpperCase().trim()
        const room = rooms.get(roomCode)

        if (!room) {
          socket.send(JSON.stringify({ type: 'error', message: `Không tìm thấy phòng ${roomCode}!` }))
          return
        }

        if (room.status !== 'LOBBY' || room.guest) {
          socket.send(JSON.stringify({ type: 'error', message: `Phòng ${roomCode} đã đủ 2 người đấu!` }))
          return
        }

        const guestDuelist = {
          ws: socket,
          id: payload?.duelistId || `guest-${Date.now()}`,
          name: payload?.name || 'Đối Thủ (Khách)',
          role: 'guest',
          deck: payload?.deck || [],
          joinedAt: Date.now(),
        }

        room.guest = guestDuelist
        room.status = 'DUELING'
        room.lastActivityAt = Date.now()
        currentRoomCode = roomCode
        duelistRole = 'guest'

        console.log(`⚡ [Server] Đối thủ ${guestDuelist.name} đã vào phòng ${roomCode}! Trận đấu bắt đầu!`)

        // Notify Guest
        socket.send(JSON.stringify({
          type: 'room_joined',
          code: roomCode,
          payload: {
            isHost: false,
            opponent: { name: room.host.name, deck: room.host.deck },
          },
        }))

        // Notify Host
        if (room.host.ws.readyState === WebSocket.OPEN) {
          room.host.ws.send(JSON.stringify({
            type: 'opponent_joined',
            code: roomCode,
            payload: {
              opponent: { name: guestDuelist.name, deck: guestDuelist.deck },
            },
          }))
        }
        break
      }

      case 'game_message': {
        if (!currentRoomCode) return
        const room = rooms.get(currentRoomCode)
        if (!room) return

        room.lastActivityAt = Date.now()
        const target = duelistRole === 'host' ? room.guest : room.host
        if (target && target.ws.readyState === WebSocket.OPEN) {
          target.ws.send(JSON.stringify({
            type: 'game_message',
            code: currentRoomCode,
            payload: payload,
          }))
        }
        break
      }

      case 'leave_room': {
        if (currentRoomCode) {
          handleClientDisconnect(socket, currentRoomCode, duelistRole)
          currentRoomCode = null
          duelistRole = null
        }
        break
      }
    }
  }

  function handleClientDisconnect(socket, roomCode, role) {
    const room = rooms.get(roomCode)
    if (!room) return

    console.log(`🔌 [Server] Người chơi (${role}) đã rời phòng ${roomCode}`)
    const opponent = role === 'host' ? room.guest : room.host

    if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
      opponent.ws.send(JSON.stringify({
        type: 'opponent_disconnected',
        code: roomCode,
        payload: { role, message: 'Đối thủ đã mất kết nối' },
      }))
    }

    // Start 15s cleanup timeout
    if (room.disconnectTimeout) clearTimeout(room.disconnectTimeout)
    room.disconnectTimeout = setTimeout(() => {
      rooms.delete(roomCode)
      console.log(`🧹 [Server] Đã dọn dẹp phòng ${roomCode}`)
    }, 15000)
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`)
  console.log(`🏰 HOGWARTS DUEL 3D DEDICATED GAME SERVER IS RUNNING`)
  console.log(`📡 WebSocket & REST API: http://127.0.0.1:${PORT}`)
  console.log(`⚡ Sẵn sàng tiếp nhận phòng đấu & đồng bộ ma thuật!`)
  console.log(`======================================================\n`)
})
