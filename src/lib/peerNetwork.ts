import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';
import type { NetworkMessage, Player, GameState } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fxucyrofcsuqtlkukcrx.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_zEiG2Py5kDmGhkTgw0uWIA_We0rOCGu';

export class SevenPottersNetwork {
  private supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;
  private roomCode: string = '';
  private myPlayerId: string = '';
  private hostPresent: boolean = true;
  private hostDisconnectedAt: number | null = null;
  private hostDisconnectTimer: any = null;
  private heartbeatInterval: any = null;

  public onMessageReceived?: (msg: NetworkMessage) => void;
  public onConnectionStatusChange?: (status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR', errorMsg?: string) => void;
  public onPeerJoined?: (peerId: string) => void;
  public onPeerLeft?: (peerId: string, playerId: string) => void;
  public onHostDisconnected?: (disconnectedAt: number) => void;
  public onHostReconnected?: () => void;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
    });
  }

  public isSocketHealthy(): boolean {
    if (!this.channel) return false;
    const isJoined = this.channel.state === 'joined';
    const isSocketConnected = (this.supabase as any)?.realtime?.isConnected?.() ?? true;
    return isJoined && isSocketConnected;
  }

  private checkIsHostInPresence(): boolean {
    if (!this.channel) return false;
    const presenceState = this.channel.presenceState() || {};
    for (const key in presenceState) {
      const list = presenceState[key] as any[];
      if (list && list.some((p) => p.isHost || p.isGM)) {
        return true;
      }
    }
    return false;
  }

  public isPlayerInPresence(playerId: string): boolean {
    if (!this.channel) return false;
    const presenceState = this.channel.presenceState() || {};
    return !!presenceState[playerId];
  }

  public getPresentPlayerIds(): string[] {
    if (!this.channel) return [];
    const presenceState = this.channel.presenceState() || {};
    return Object.keys(presenceState);
  }

  private startHeartbeat(isHost: boolean) {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.channel && this.channel.state === 'joined') {
        if (isHost) {
          this.broadcast({
            type: 'PING',
            senderId: this.myPlayerId,
            payload: { timestamp: Date.now() },
          });
        }
      }
    }, 12000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Host initializes room channel via Supabase Realtime
   */
  public async initHost(roomCode: string, hostPlayer: Player): Promise<string> {
    this.roomCode = roomCode.toUpperCase();
    this.myPlayerId = hostPlayer.id;

    this.onConnectionStatusChange?.('CONNECTING');

    return new Promise((resolve, reject) => {
      let isSettled = false;
      const timeout = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          this.onConnectionStatusChange?.('ERROR', 'Không thể kết nối máy chủ Supabase. Vui lòng kiểm tra lại mạng!');
          reject(new Error('Host init timeout'));
        }
      }, 10000);

      try {
        if (this.channel) {
          this.supabase.removeChannel(this.channel);
        }

        const channelName = `seven-potters-${this.roomCode.toLowerCase()}`;
        this.channel = this.supabase.channel(channelName, {
          config: {
            presence: { key: this.myPlayerId },
            broadcast: { self: false },
          },
        });

        // Listen for all broadcast messages
        this.channel.on('broadcast', { event: 'game_message' }, (payload: any) => {
          const msg = payload.payload as NetworkMessage;
          if (msg && msg.senderId !== this.myPlayerId) {
            this.handleIncomingMessage(msg);
          }
        });

        // Track presence to detect join/leave
        this.channel.on('presence', { event: 'join' }, (payload: any) => {
          const key = payload?.key;
          if (key && key !== this.myPlayerId) {
            console.log('[7-Potters Host] Player joined presence:', key);
            this.onPeerJoined?.(key);
          }
        });

        this.channel.on('presence', { event: 'leave' }, (payload: any) => {
          const key = payload?.key;
          if (key && key !== this.myPlayerId) {
            console.log('[7-Potters Host] Player left presence:', key);
            this.onPeerLeft?.(key, key);
          }
        });

        this.channel.subscribe(async (status) => {
          console.log('[7-Potters Host] Channel status:', status);
          if (status === 'SUBSCRIBED') {
            if (!isSettled) {
              isSettled = true;
              clearTimeout(timeout);
              await this.channel?.track({
                id: this.myPlayerId,
                name: hostPlayer.name,
                isHost: true,
                isGM: hostPlayer.isGM,
                onlineAt: Date.now(),
              });
              this.startHeartbeat(true);
              this.onConnectionStatusChange?.('CONNECTED');
              this.broadcast({
                type: 'HOST_RECONNECTED',
                senderId: this.myPlayerId,
                payload: { timestamp: Date.now() },
              });
              resolve(this.roomCode);
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            if (!isSettled) {
              isSettled = true;
              clearTimeout(timeout);
              this.onConnectionStatusChange?.('ERROR', 'Lỗi kết nối kênh phòng.');
              reject(new Error(`Supabase host channel ${status}`));
            }
          }
        });
      } catch (err: any) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeout);
          this.onConnectionStatusChange?.('ERROR', err?.message || 'Lỗi khởi tạo phòng.');
          reject(err);
        }
      }
    });
  }

  /**
   * Client joins room via room code
   */
  public async initClient(roomCode: string, player: Player): Promise<void> {
    this.roomCode = roomCode.toUpperCase();
    this.myPlayerId = player.id;

    this.onConnectionStatusChange?.('CONNECTING');

    return new Promise((resolve, reject) => {
      let isSettled = false;
      const timeout = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          this.onConnectionStatusChange?.(
            'ERROR',
            `Không thể kết nối tới phòng "${this.roomCode}". Vui lòng kiểm tra lại mã phòng!`
          );
          reject(new Error(`Timeout connecting to room ${this.roomCode}`));
        }
      }, 10000);

      try {
        if (this.channel) {
          this.supabase.removeChannel(this.channel);
        }

        const channelName = `seven-potters-${this.roomCode.toLowerCase()}`;
        this.channel = this.supabase.channel(channelName, {
          config: {
            presence: { key: this.myPlayerId },
            broadcast: { self: false },
          },
        });

        this.channel.on('broadcast', { event: 'game_message' }, (payload: any) => {
          const msg = payload.payload as NetworkMessage;
          if (msg && msg.senderId !== this.myPlayerId) {
            this.handleIncomingMessage(msg);
          }
        });

        this.channel.on('presence', { event: 'sync' }, () => {
          const hostOnline = this.checkIsHostInPresence();

          if (hostOnline) {
            if (this.hostDisconnectTimer) {
              clearTimeout(this.hostDisconnectTimer);
              this.hostDisconnectTimer = null;
            }
            if (!this.hostPresent) {
              console.log('[7-Potters Client] Host detected back online via presence.');
              this.hostPresent = true;
              this.hostDisconnectedAt = null;
              this.onHostReconnected?.();
            }
          } else {
            if (this.hostPresent && !this.hostDisconnectTimer) {
              console.log('[7-Potters Client] Host presence not found in sync, starting 6s grace timer...');
              this.hostDisconnectTimer = setTimeout(() => {
                this.hostDisconnectTimer = null;
                if (!this.checkIsHostInPresence()) {
                  console.log('[7-Potters Client] Host presence confirmed lost after 6s grace period.');
                  this.hostPresent = false;
                  this.hostDisconnectedAt = Date.now();
                  this.onHostDisconnected?.(this.hostDisconnectedAt);
                }
              }, 6000);
            }
          }
        });

        this.channel.on('presence', { event: 'leave' }, (payload: any) => {
          const leftPresences = payload?.leftPresences;
          const hostLeft = Array.isArray(leftPresences) && leftPresences.some((p: any) => p?.isHost || p?.isGM);
          if (hostLeft) {
            if (this.hostPresent && !this.hostDisconnectTimer) {
              console.log('[7-Potters Client] Host leave event received, starting 6s grace timer...');
              this.hostDisconnectTimer = setTimeout(() => {
                this.hostDisconnectTimer = null;
                if (!this.checkIsHostInPresence()) {
                  console.log('[7-Potters Client] Host confirmed left after grace period.');
                  this.hostPresent = false;
                  this.hostDisconnectedAt = Date.now();
                  this.onHostDisconnected?.(this.hostDisconnectedAt);
                }
              }, 6000);
            }
          }
        });

        this.channel.subscribe(async (status) => {
          console.log('[7-Potters Client] Channel status:', status);
          if (status === 'SUBSCRIBED') {
            if (!isSettled) {
              isSettled = true;
              clearTimeout(timeout);

              await this.channel?.track({
                id: this.myPlayerId,
                name: player.name,
                isHost: false,
                isGM: player.isGM,
                onlineAt: Date.now(),
              });

              this.startHeartbeat(false);
              this.hostPresent = true;
              this.hostDisconnectedAt = null;
              this.onHostReconnected?.();
              this.onConnectionStatusChange?.('CONNECTED');

              // Send Join Request to Host immediately
              this.sendToHost({
                type: 'JOIN_REQUEST',
                senderId: this.myPlayerId,
                payload: player,
              });

              resolve();
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            if (!isSettled) {
              isSettled = true;
              clearTimeout(timeout);
              this.onConnectionStatusChange?.('ERROR', 'Không thể kết nối kênh phòng.');
              reject(new Error(`Supabase client ${status}`));
            }
          }
        });
      } catch (err: any) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeout);
          this.onConnectionStatusChange?.('ERROR', err?.message || 'Lỗi tham gia phòng.');
          reject(err);
        }
      }
    });
  }

  public async reconnectHostIfNeeded(hostPlayer?: Player): Promise<void> {
    if (!this.channel || this.channel.state !== 'joined' || !this.isSocketHealthy()) {
      console.log('[7-Potters Host] Channel dead or disconnected. Re-subscribing...');
      if (this.roomCode && hostPlayer) {
        try {
          await this.initHost(this.roomCode, hostPlayer);
        } catch (e) {
          console.warn('[7-Potters Host] Failed to re-init host:', e);
        }
      } else if (this.channel) {
        this.channel.subscribe();
      }
    } else {
      if (hostPlayer) {
        this.channel.track({
          id: this.myPlayerId,
          name: hostPlayer.name,
          isHost: true,
          isGM: hostPlayer.isGM,
          onlineAt: Date.now(),
        }).catch(() => {});
      }
      this.broadcast({
        type: 'HOST_RECONNECTED',
        senderId: this.myPlayerId,
        payload: { timestamp: Date.now() },
      });
    }
  }

  public async reconnectClient(roomCode: string, player: Player): Promise<boolean> {
    this.roomCode = roomCode.toUpperCase();
    this.myPlayerId = player.id;

    console.log('[7-Potters Client] Reconnecting client to room:', this.roomCode);

    if (this.channel && this.channel.state === 'joined') {
      this.channel.track({
        id: this.myPlayerId,
        name: player.name,
        isHost: false,
        isGM: player.isGM,
        onlineAt: Date.now(),
      }).catch(() => {});

      this.sendToHost({
        type: 'JOIN_REQUEST',
        senderId: this.myPlayerId,
        payload: player,
      });
      return true;
    }

    try {
      await this.initClient(roomCode, player);
      return true;
    } catch (e) {
      console.warn('[7-Potters Client] Reconnect failed:', e);
      return false;
    }
  }

  public broadcastRoomState(state: GameState): void {
    const msg: NetworkMessage = {
      type: 'ROOM_STATE_SYNC',
      senderId: this.myPlayerId,
      payload: state,
    };
    this.broadcast(msg);
  }

  public sendToHost(msg: NetworkMessage): void {
    this.broadcast(msg);
  }

  public sendAction(actionName: string, targetId: string): void {
    this.sendToHost({
      type: 'ACTION_SUBMIT',
      senderId: this.myPlayerId,
      payload: { actionName, targetId },
    });
  }

  public sendInstantSkill(actionName: string, targetId: string): void {
    this.sendToHost({
      type: 'INSTANT_SKILL_SUBMIT',
      senderId: this.myPlayerId,
      payload: { actionName, targetId },
    });
  }

  public sendInterruptChoice(choiceId: string): void {
    this.sendToHost({
      type: 'INTERRUPT_CHOICE_SUBMIT',
      senderId: this.myPlayerId,
      payload: { choiceId },
    });
  }

  public sendPlayerLeft(): void {
    this.sendToHost({
      type: 'PLAYER_LEFT',
      senderId: this.myPlayerId,
      payload: { playerId: this.myPlayerId },
    });
  }

  public sendKickPlayer(targetId: string): void {
    this.broadcast({
      type: 'KICK_PLAYER',
      senderId: this.myPlayerId,
      payload: { targetId },
    });
  }

  public broadcast(msg: NetworkMessage): void {
    if (!this.channel) return;
    this.channel.send({
      type: 'broadcast',
      event: 'game_message',
      payload: msg,
    });
  }

  private handleIncomingMessage(msg: NetworkMessage) {
    if (this.onMessageReceived) {
      this.onMessageReceived(msg);
    }
  }

  public destroy(): void {
    this.stopHeartbeat();
    if (this.hostDisconnectTimer) {
      clearTimeout(this.hostDisconnectTimer);
      this.hostDisconnectTimer = null;
    }
    if (this.channel) {
      const chan = this.channel;
      this.channel = null;
      try {
        chan.untrack().finally(() => {
          try {
            this.supabase.removeChannel(chan);
          } catch (e) {
            console.warn('[7-Potters] Channel remove warning:', e);
          }
        });
      } catch (e) {
        try {
          this.supabase.removeChannel(chan);
        } catch (e2) {
          console.warn('[7-Potters] Channel remove warning:', e2);
        }
      }
    }
  }
}
