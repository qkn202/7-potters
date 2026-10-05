// src/network.ts — Hogwarts Duel Realtime Network Manager (Supabase Realtime + BroadcastChannel + Server Relay)
import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js'

export type NetworkMessageType =
  | 'hello'
  | 'welcome'
  | 'loadout'
  | 'cast'
  | 'dodge'
  | 'shield'
  | 'damage_sync'
  | 'clash_mash'
  | 'clash_win'
  | 'rematch'
  | 'leave'
  | 'ping'
  | 'pong'

export interface NetworkMessage {
  type: NetworkMessageType
  sender: 'host' | 'guest'
  payload?: any
  timestamp: number
}

export interface OpenRoomInfo {
  code: string
  hostName: string
  hostDeck?: string[]
  createdAt: number
}

export type NetworkEventHandler = (msg: NetworkMessage) => void

// Shared Supabase project credentials (matching 7-Potters & Undercover Hogwarts)
const SUPABASE_URL = 'https://fxucyrofcsuqtlkukcrx.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_zEiG2Py5kDmGhkTgw0uWIA_We0rOCGu'

export class DuelNetwork {
  public isHost: boolean = false
  public roomCode: string = ''
  public isConnected: boolean = false
  public isConnecting: boolean = false
  public latencyMs: number = 0
  public myPlayerId: string = ''

  private supabase: SupabaseClient
  private roomChannel: RealtimeChannel | null = null
  private lobbyChannel: RealtimeChannel | null = null
  private broadcastChannel: BroadcastChannel | null = null
  private localSocket: WebSocket | null = null

  private messageHandlers: NetworkEventHandler[] = []
  private connectHandlers: Array<(isHost: boolean, roomCode: string) => void> = []
  private disconnectHandlers: Array<(reason?: string) => void> = []
  private openRoomsHandlers: Array<(rooms: OpenRoomInfo[]) => void> = []
  private opponentPresenceHandlers: Array<(opponent: any) => void> = []

  private pingInterval: any = null
  private heartbeatInterval: any = null
  private disconnectGraceTimer: any = null
  private openRoomsCache: Map<string, OpenRoomInfo> = new Map()

  constructor() {
    this.myPlayerId = `duelist_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 20, // 20 events/sec for smooth 60fps spell duels
        },
      },
    })

    // Automatically listen to global lobby room announcements
    this.initLobbyListener()
  }

  public onMessage(handler: NetworkEventHandler) {
    this.messageHandlers.push(handler)
  }

  public onConnect(handler: (isHost: boolean, roomCode: string) => void) {
    this.connectHandlers.push(handler)
  }

  public onDisconnect(handler: (reason?: string) => void) {
    this.disconnectHandlers.push(handler)
  }

  public onOpenRoomsChange(handler: (rooms: OpenRoomInfo[]) => void) {
    this.openRoomsHandlers.push(handler)
  }

  public onOpponentPresence(handler: (opponent: any) => void) {
    this.opponentPresenceHandlers.push(handler)
  }

  /**
   * Lấy danh sách các phòng đấu đang mở chờ đối thủ
   */
  public getOpenRooms(): OpenRoomInfo[] {
    const now = Date.now()
    // Lọc các phòng tạo trong vòng 30 phút qua
    return Array.from(this.openRoomsCache.values())
      .filter((r) => now - r.createdAt < 30 * 60 * 1000 && r.code !== this.roomCode)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * Khởi tạo kênh Sảnh Chờ Toàn Cầu để nhận thông báo phòng mới
   */
  private initLobbyListener() {
    try {
      this.lobbyChannel = this.supabase.channel('duel-global-lobby', {
        config: {
          presence: { key: this.myPlayerId },
          broadcast: { self: false },
        },
      })

      this.lobbyChannel.on('presence', { event: 'sync' }, () => {
        const state = this.lobbyChannel?.presenceState() || {}
        this.openRoomsCache.clear()

        for (const key in state) {
          const presences = state[key] as any[]
          if (presences && presences.length > 0) {
            for (const p of presences) {
              if (p.roomCode && p.isHost && p.status === 'LOBBY') {
                this.openRoomsCache.set(p.roomCode, {
                  code: p.roomCode,
                  hostName: p.duelistName || 'Harry Potter',
                  hostDeck: p.deck || [],
                  createdAt: p.createdAt || Date.now(),
                })
              }
            }
          }
        }
        this.notifyOpenRooms()
      })

      this.lobbyChannel.on('broadcast', { event: 'room_event' }, (payload: any) => {
        const { action, room } = payload.payload || {}
        if (action === 'room_opened' && room?.code) {
          this.openRoomsCache.set(room.code, room)
          this.notifyOpenRooms()
        } else if (action === 'room_closed' && room?.code) {
          this.openRoomsCache.delete(room.code)
          this.notifyOpenRooms()
        }
      })

      this.lobbyChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 [Lobby] Đã kết nối kênh Sảnh Chờ toàn cầu Supabase Realtime!')
        }
      })
    } catch (err) {
      console.warn('⚠️ [Lobby] Lỗi kết nối sảnh chờ:', err)
    }
  }

  private notifyOpenRooms() {
    const list = this.getOpenRooms()
    this.openRoomsHandlers.forEach((h) => h(list))
  }

  /**
   * Tạo phòng đấu mới (Host)
   */
  public async createRoom(customCode?: string, duelistName?: string, deck?: string[]): Promise<string> {
    this.disconnect()
    this.isHost = true
    this.isConnecting = true
    const code = customCode || `HOGW-${Math.floor(1000 + Math.random() * 9000)}`
    this.roomCode = code.toUpperCase().trim()

    // 1. Setup local BroadcastChannel bridge (instant local multi-tab connection)
    this.setupBroadcastChannel(this.roomCode)

    // 2. Setup Supabase Realtime Room Channel
    await this.setupSupabaseRoomChannel(true, duelistName, deck)

    // 3. Publish to Global Lobby Presence so other players can see this room
    if (this.lobbyChannel && this.lobbyChannel.state === 'joined') {
      try {
        await this.lobbyChannel.track({
          roomCode: this.roomCode,
          isHost: true,
          status: 'LOBBY',
          duelistName: duelistName || 'Harry (Bạn)',
          deck: deck || [],
          createdAt: Date.now(),
        })

        this.lobbyChannel.send({
          type: 'broadcast',
          event: 'room_event',
          payload: {
            action: 'room_opened',
            room: {
              code: this.roomCode,
              hostName: duelistName || 'Harry (Bạn)',
              hostDeck: deck || [],
              createdAt: Date.now(),
            },
          },
        })
      } catch (e) {
        // ignore
      }
    }

    console.log(`🏰 [Network] Phòng online WebRTC & Supabase đã sẵn sàng! Mã: ${this.roomCode}`)
    return this.roomCode
  }

  /**
   * Gia nhập phòng đấu đã có (Guest)
   */
  public async joinRoom(roomCode: string, duelistName?: string, deck?: string[]): Promise<boolean> {
    this.disconnect()
    this.isHost = false
    this.isConnecting = true
    this.roomCode = roomCode.toUpperCase().trim()

    // 1. Setup local BroadcastChannel bridge
    this.setupBroadcastChannel(this.roomCode)

    // 2. Setup Supabase Realtime Room Channel
    const connected = await this.setupSupabaseRoomChannel(false, duelistName, deck)

    // Send greeting over broadcast channel immediately & retry periodically until connected
    let attempts = 0
    const helloInterval = setInterval(() => {
      if (this.isConnected) {
        clearInterval(helloInterval)
        return
      }
      attempts++
      if (attempts > 20) {
        clearInterval(helloInterval)
        return
      }
      this.send({
        type: 'hello',
        sender: 'guest',
        payload: { ready: true, duelistName, deck },
        timestamp: Date.now(),
      })
    }, 250)

    if (connected) {
      this.send({
        type: 'hello',
        sender: 'guest',
        payload: { ready: true, duelistName, deck },
        timestamp: Date.now(),
      })
    }

    return connected
  }

  private setupSupabaseRoomChannel(isHost: boolean, duelistName?: string, deck?: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const channelName = `duel-room-${this.roomCode.toLowerCase()}`
        this.roomChannel = this.supabase.channel(channelName, {
          config: {
            presence: { key: this.myPlayerId },
            broadcast: { self: false },
          },
        })

        // Listen for all game messages
        this.roomChannel.on('broadcast', { event: 'game_message' }, (payload: any) => {
          const msg = payload.payload as NetworkMessage
          if (msg && msg.sender !== (this.isHost ? 'host' : 'guest')) {
            this.handleIncomingMessage(msg)
            if (!this.isConnected) {
              this.handleConnected()
            }
          }
        })

        // Track presence to detect join/leave
        this.roomChannel.on('presence', { event: 'sync' }, () => {
          const presenceState = this.roomChannel?.presenceState() || {}
          for (const key in presenceState) {
            if (key !== this.myPlayerId) {
              const list = presenceState[key] as any[]
              if (list && list.length > 0) {
                const opponent = list[0]
                this.opponentPresenceHandlers.forEach((h) => h(opponent))
                if (!this.isConnected) {
                  this.handleConnected()
                }
              }
            }
          }
        })

        this.roomChannel.on('presence', { event: 'join' }, (payload: any) => {
          const key = payload?.key
          if (key && key !== this.myPlayerId) {
            console.log(`⚡ [Network] Đối thủ đã vào phòng (${key})!`)
            if (this.disconnectGraceTimer) {
              clearTimeout(this.disconnectGraceTimer)
              this.disconnectGraceTimer = null
              console.log('🔄 [Network] Đối thủ đã tái kết nối thành công!')
            }
            this.handleConnected()
            this.send({
              type: this.isHost ? 'welcome' : 'hello',
              sender: this.isHost ? 'host' : 'guest',
              payload: { ready: true, duelistName, deck },
              timestamp: Date.now(),
            })
          }
        })

        this.roomChannel.on('presence', { event: 'leave' }, (payload: any) => {
          const key = payload?.key
          if (key && key !== this.myPlayerId) {
            console.log(`⚠️ [Network] Đối thủ tạm thời ngắt kết nối (${key}). Bắt đầu đếm thời gian chờ tái kết nối...`)
            // Start 15s grace timer before declaring match disconnect
            if (this.disconnectGraceTimer) clearTimeout(this.disconnectGraceTimer)
            this.disconnectGraceTimer = setTimeout(() => {
              this.handleDisconnected('Đối thủ đã rời khỏi phòng đấu')
            }, 15000)
          }
        })

        this.roomChannel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ [Network] Đã đăng ký phòng đấu Supabase: ${channelName}`)
            await this.roomChannel?.track({
              duelistId: this.myPlayerId,
              isHost,
              duelistName: duelistName || (isHost ? 'Chủ Phòng' : 'Khách Đấu'),
              deck: deck || [],
              joinedAt: Date.now(),
            })
            this.startHeartbeat()
            resolve(true)
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn(`⚠️ [Network] Supabase Room status: ${status}`)
            resolve(false)
          }
        })
      } catch (err) {
        console.warn('⚠️ [Network] Supabase room channel error:', err)
        resolve(false)
      }
    })
  }

  private setupBroadcastChannel(roomCode: string) {
    if (typeof BroadcastChannel === 'undefined') return

    try {
      this.broadcastChannel = new BroadcastChannel(`hogwarts-room-${roomCode}`)
      this.broadcastChannel.onmessage = (event) => {
        const msg = event.data as NetworkMessage
        // Don't receive own messages
        if (msg && msg.sender !== (this.isHost ? 'host' : 'guest')) {
          this.handleIncomingMessage(msg)
          if (!this.isConnected) {
            this.handleConnected()
            if (this.isHost && msg.type === 'hello') {
              this.sendBroadcast({
                type: 'welcome',
                sender: 'host',
                timestamp: Date.now(),
              })
            }
          }
        }
      }
    } catch (err) {
      console.warn('BroadcastChannel not supported:', err)
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.roomChannel && this.roomChannel.state === 'joined') {
        this.send({
          type: 'ping',
          sender: this.isHost ? 'host' : 'guest',
          timestamp: Date.now(),
        })
      }
    }, 4000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private handleConnected() {
    if (this.isConnected) return
    this.isConnected = true
    this.isConnecting = false
    console.log(`🎮 [Network] Sẵn sàng thi đấu Online! (Vai trò: ${this.isHost ? 'Chủ Phòng' : 'Khách Đấu'})`)

    // Notify Lobby channel that room is now busy
    if (this.isHost && this.lobbyChannel && this.lobbyChannel.state === 'joined') {
      try {
        this.lobbyChannel.send({
          type: 'broadcast',
          event: 'room_event',
          payload: {
            action: 'room_closed',
            room: { code: this.roomCode },
          },
        })
      } catch (e) {}
    }

    this.connectHandlers.forEach((h) => h(this.isHost, this.roomCode))

    // Start periodic keepalive ping
    if (this.pingInterval) clearInterval(this.pingInterval)
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'ping',
          sender: this.isHost ? 'host' : 'guest',
          timestamp: Date.now(),
        })
      }
    }, 3000)
  }

  private handleDisconnected(reason?: string) {
    if (!this.isConnected && !this.isConnecting) return
    this.isConnected = false
    this.isConnecting = false
    this.stopHeartbeat()
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    this.disconnectHandlers.forEach((h) => h(reason))
  }

  private handleIncomingMessage(msg: NetworkMessage) {
    if (!msg || !msg.type) return

    // Handle internal latency ping/pong
    if (msg.type === 'ping') {
      this.send({
        type: 'pong',
        sender: this.isHost ? 'host' : 'guest',
        payload: { originTime: msg.timestamp },
        timestamp: Date.now(),
      })
      return
    }

    if (msg.type === 'pong' && msg.payload?.originTime) {
      this.latencyMs = Math.max(1, Math.round((Date.now() - msg.payload.originTime) / 2))
      return
    }

    // Trigger registered game event handlers
    this.messageHandlers.forEach((handler) => {
      try {
        handler(msg)
      } catch (err) {
        console.error('Error in network message handler:', err)
      }
    })
  }

  /**
   * Gửi thông điệp tới đối thủ (ưu tiên Supabase Realtime, đồng thời loopback BroadcastChannel)
   */
  public send(msg: { type: NetworkMessageType; payload?: any; sender?: 'host' | 'guest'; timestamp?: number }) {
    const fullMsg: NetworkMessage = {
      type: msg.type,
      payload: msg.payload,
      sender: msg.sender || (this.isHost ? 'host' : 'guest'),
      timestamp: msg.timestamp || Date.now(),
    }

    let sent = false

    // 1. Send via Supabase Realtime Channel
    if (this.roomChannel && this.roomChannel.state === 'joined') {
      try {
        this.roomChannel.send({
          type: 'broadcast',
          event: 'game_message',
          payload: fullMsg,
        })
        sent = true
      } catch (e) {
        sent = false
      }
    }

    // 2. Also broadcast on local channel for local multi-tab or fallback
    this.sendBroadcast(fullMsg)
    return sent
  }

  private sendBroadcast(fullMsg: NetworkMessage) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(fullMsg)
      } catch (e) {
        // ignore
      }
    }
  }

  public disconnect() {
    this.isConnected = false
    this.isConnecting = false
    this.stopHeartbeat()

    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }

    if (this.disconnectGraceTimer) {
      clearTimeout(this.disconnectGraceTimer)
      this.disconnectGraceTimer = null
    }

    // Notify Lobby channel that room is closed if host
    if (this.isHost && this.lobbyChannel && this.lobbyChannel.state === 'joined') {
      try {
        this.lobbyChannel.send({
          type: 'broadcast',
          event: 'room_event',
          payload: {
            action: 'room_closed',
            room: { code: this.roomCode },
          },
        })
      } catch (e) {}
    }

    if (this.roomChannel) {
      try {
        this.supabase.removeChannel(this.roomChannel)
      } catch (e) {}
      this.roomChannel = null
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close()
      } catch (e) {}
      this.broadcastChannel = null
    }

    if (this.localSocket) {
      try {
        this.localSocket.close()
      } catch (e) {}
      this.localSocket = null
    }
  }
}
