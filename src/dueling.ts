import * as THREE from 'three'

if (typeof window !== 'undefined') {
  ;(window as any).THREE = THREE
}

// Post-processing imports for Bloom/Glow effects
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { LegoDuelist } from './lego_character'
import { HogwartsDuelingStage } from './dueling_stage'
import {
  CHARACTER_ROSTER,
  type DuelistCharacter,
  type GauntletTier,
  type GauntletEntry,
  GAUNTLET_TIERS,
  generateGauntletRoster,
  getCharacter,
  createCharacterWand,
} from './characters'
import { DuelNetwork, type NetworkMessage } from './network'
import { MultiplayerDeckManager } from './multiplayer_deck'
import {
  createVfx8SpellTextures,
  Vfx8Textures,
  AdvancedSpellVisuals,
  buildSectumsempraVisuals,
  buildPetrificusVisuals,
  buildConfringoVisuals,
  buildImmobulusVisuals,
  buildMorsmordreVisuals,
  buildLevicorpusVisuals,
  buildObliviateVisuals,
  buildExpectoPatronumVisuals,
  animate8SpellVisuals,
} from './vfx_spells'

// --- Web Audio Synthesizer (Zero asset dependencies) ---
// Helper function for Three.js texture color space compatibility
function setTextureColorSpace(tex: THREE.CanvasTexture) {
  if ('colorSpace' in tex) {
    tex.colorSpace = THREE.SRGBColorSpace
  } else if ('encoding' in tex) {
    ;(tex as any).encoding = 3001
  }
}

class MagicAudio {
  private ctx: AudioContext | null = null
  public isMuted = false

  toggleMute(): boolean {
    this.isMuted = !this.isMuted
    return this.isMuted
  }

  playClick() {
    if (this.isMuted) return
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05)
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    } catch (err) { console.warn('[MagicAudio] Error:', err) }
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  playDrawSizzle() {
    if (this.isMuted) return
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(450 + Math.random() * 250, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(850 + Math.random() * 300, ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.09)
    } catch (err) { console.warn('[MagicAudio] Error:', err) }
  }

  playArmedSelect() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime
      const chord = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6 crystal chime
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.035)
        gain.gain.setValueAtTime(0.08, now + i * 0.035)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.035 + 0.32)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.035)
        osc.stop(now + i * 0.035 + 0.35)
      })
    } catch (err) { console.warn('[MagicAudio] Error:', err) }
  }

  playDrawFizzle() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(280, now)
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.28)
      gain.gain.setValueAtTime(0.16, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.30)
    } catch (err) { console.warn('[MagicAudio] Error:', err) }
  }

  playSpellCast(type: string) {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      if (type === 'expelliarmus') {
        // High-voltage supersonic crackling whip + thunderous discharge
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(1750, now)
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.16)
        gain.gain.setValueAtTime(0.75, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.20)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.22)

        // Electrical discharge noise burst
        const bufferSize = Math.floor(ctx.sampleRate * 0.12)
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025))
        }
        const noise = ctx.createBufferSource()
        noise.buffer = buffer
        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(2400, now)
        filter.Q.setValueAtTime(3.0, now)
        const noiseGain = ctx.createGain()
        noiseGain.gain.setValueAtTime(0.45, now)
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
        noise.connect(filter)
        filter.connect(noiseGain)
        noiseGain.connect(ctx.destination)
        noise.start(now)
      } else if (type === 'protego') {
        // Prismatic crystalline harmonic resonance (C6 + E6 + G6 chord)
        const freqs = [1046.5, 1318.5, 1567.98]
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, now)
          osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.45)
          gain.gain.setValueAtTime(0.25 / (idx + 1), now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now)
          osc.stop(now + 0.68)
        })
      } else if (type === 'incendio') {
        // Roaring dragon flame ignition: heavy combustion sweep + low rumble
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(260, now)
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.45)
        gain.gain.setValueAtTime(0.85, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.48)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.50)

        // Low-pass roaring blowtorch noise
        const bufferSize = Math.floor(ctx.sampleRate * 0.4)
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
        }
        const noise = ctx.createBufferSource()
        noise.buffer = buffer
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(550, now)
        filter.frequency.exponentialRampToValueAtTime(90, now + 0.4)
        const noiseGain = ctx.createGain()
        noiseGain.gain.setValueAtTime(0.65, now)
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
        noise.connect(filter)
        filter.connect(noiseGain)
        noiseGain.connect(ctx.destination)
        noise.start(now)
      } else if (type === 'stupefy') {
        // Stupefy: Concentrated kinetic acoustic shock dive + cosmic harmonic bell
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(750, now)
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.32)
        gain.gain.setValueAtTime(0.75, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.36)

        // Resonant bell chime
        const chime = ctx.createOscillator()
        const chimeGain = ctx.createGain()
        chime.type = 'sine'
        chime.frequency.setValueAtTime(1860, now)
        chime.frequency.exponentialRampToValueAtTime(1400, now + 0.4)
        chimeGain.gain.setValueAtTime(0.35, now)
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
        chime.connect(chimeGain)
        chimeGain.connect(ctx.destination)
        chime.start(now)
        chime.stop(now + 0.42)
      } else if (type === 'avadakedavra') {
        // Avada Kedavra: Deep visceral sub-bass doom + high screaming death wind + violent electric whip crack
        const subOsc = ctx.createOscillator()
        const subGain = ctx.createGain()
        subOsc.type = 'sine'
        subOsc.frequency.setValueAtTime(65, now)
        subOsc.frequency.exponentialRampToValueAtTime(26, now + 0.55)
        subGain.gain.setValueAtTime(0.9, now)
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.60)
        subOsc.connect(subGain)
        subGain.connect(ctx.destination)
        subOsc.start(now)
        subOsc.stop(now + 0.65)

        // Supersonic violent emerald whip crack
        const whipOsc = ctx.createOscillator()
        const whipGain = ctx.createGain()
        whipOsc.type = 'sawtooth'
        whipOsc.frequency.setValueAtTime(2200, now)
        whipOsc.frequency.exponentialRampToValueAtTime(80, now + 0.22)
        whipGain.gain.setValueAtTime(0.85, now)
        whipGain.gain.exponentialRampToValueAtTime(0.01, now + 0.26)
        whipOsc.connect(whipGain)
        whipGain.connect(ctx.destination)
        whipOsc.start(now)
        whipOsc.stop(now + 0.28)

        // Thunderous discharge noise burst
        const bufferSize = Math.floor(ctx.sampleRate * 0.22)
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05))
        }
        const noise = ctx.createBufferSource()
        noise.buffer = buffer
        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(1400, now)
        filter.Q.setValueAtTime(1.8, now)
        const noiseGain = ctx.createGain()
        noiseGain.gain.setValueAtTime(0.7, now)
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22)
        noise.connect(filter)
        filter.connect(noiseGain)
        noiseGain.connect(ctx.destination)
        noise.start(now)
      } else if (type === 'sectumsempra') {
        // Sectumsempra: Supersonic razor-sharp air-cleaving blade whoosh + cutting whip
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(3200, now)
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.16)
        gain.gain.setValueAtTime(0.85, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.20)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.22)

        // Whipping air-shear noise
        const bufferSize = Math.floor(ctx.sampleRate * 0.15)
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.035))
        }
        const noise = ctx.createBufferSource()
        noise.buffer = buffer
        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(2600, now)
        filter.Q.setValueAtTime(3.5, now)
        const noiseGain = ctx.createGain()
        noiseGain.gain.setValueAtTime(0.55, now)
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14)
        noise.connect(filter)
        filter.connect(noiseGain)
        noiseGain.connect(ctx.destination)
        noise.start(now)
      } else if (type === 'petrificus') {
        // Petrificus Totalus: Deep earthen grinding rumbling + supersonic stone whistle sweep
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(520, now)
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.22)
        gain.gain.setValueAtTime(0.75, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.28)

        // Earthen grinding friction noise
        const bufferSize = Math.floor(ctx.sampleRate * 0.20)
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05))
        }
        const noise = ctx.createBufferSource()
        noise.buffer = buffer
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(650, now)
        const noiseGain = ctx.createGain()
        noiseGain.gain.setValueAtTime(0.65, now)
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.20)
        noise.connect(filter)
        filter.connect(noiseGain)
        noiseGain.connect(ctx.destination)
        noise.start(now)
      }
    } catch (err) { console.warn('[MagicAudio] Error:', err) }
  }

  playImpactBoom(_colorHex: number = 0xffffff, type: string = 'generic') {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      // 1. Deep Sub-bass Drop (85Hz down to 20Hz) - visceral chest punch
      const subOsc = ctx.createOscillator()
      const subGain = ctx.createGain()
      subOsc.type = 'sine'
      subOsc.frequency.setValueAtTime(
        type === 'incendio' ? 110 : (type === 'stupefy' ? 75 : (type === 'avadakedavra' ? 50 : (type === 'sectumsempra' ? 135 : (type === 'petrificus' ? 65 : (type === 'confringo' ? 48 : 95))))),
        now
      )
      const subDuration = type === 'confringo' ? 0.58 : 0.45
      subOsc.frequency.exponentialRampToValueAtTime(type === 'confringo' ? 16 : 20, now + subDuration)
      subGain.gain.setValueAtTime(type === 'confringo' ? 1.05 : 0.95, now)
      subGain.gain.exponentialRampToValueAtTime(0.001, now + subDuration + 0.03)
      subOsc.connect(subGain)
      subGain.connect(ctx.destination)
      subOsc.start(now)
      subOsc.stop(now + subDuration + 0.05)

      // 2. Concussive Noise Crack / Explosion Blast
      const bufferSize = Math.floor(ctx.sampleRate * (type === 'confringo' ? 0.35 : 0.28))
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.055))
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      if (type === 'expelliarmus') {
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(1600, now)
        filter.Q.setValueAtTime(2.0, now)
      } else if (type === 'incendio') {
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(700, now)
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.28)
      } else if (type === 'confringo') {
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(2600, now)
        filter.frequency.exponentialRampToValueAtTime(90, now + 0.35)
      } else {
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(950, now)
        filter.frequency.exponentialRampToValueAtTime(140, now + 0.24)
      }

      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(type === 'confringo' ? 0.98 : 0.85, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + (type === 'confringo' ? 0.35 : 0.28))

      noise.connect(filter)
      filter.connect(noiseGain)
      noiseGain.connect(ctx.destination)
      noise.start(now)
    } catch (err) { console.warn('[MagicAudio] Error:', err) }
  }

  playHitSound() {
    this.playImpactBoom(0xffffff, 'generic')
  }

  playParryChime() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1174.66, now) // D6
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.4) // A6
      gain.gain.setValueAtTime(0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.46)
    } catch (err) { console.warn('[MagicAudio] Error:', err) }
  }

  playClashPulse() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(140, now)
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.22)
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.23)
    } catch (err) { console.warn('[MagicAudio] Error:', err) }
  }

  playFanfare() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.50] // C E G C
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.12)
        gain.gain.setValueAtTime(0.25, now + idx * 0.12)
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.4)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.12)
        osc.stop(now + idx * 0.12 + 0.45)
      })
    } catch (err) { console.warn('[MagicAudio] Error:', err) }
  }

  playManaEmpty() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(115, now)
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.24)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.28)
    } catch (err) { console.warn('[MagicAudio] Error:', err) }
  }

  playManaSurge() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, now) // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.28) // A5
      gain.gain.setValueAtTime(0.22, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.34)
    } catch (err) { console.warn('[MagicAudio] Error:', err) }
  }

  /**
   * Clean up AudioContext to prevent memory leaks
   */

  /**
   * Recursively dispose all geometries and materials in a THREE.Group
   * to prevent memory leaks when swapping character models
   */
  private disposeGroup(group: THREE.Group | null) {
    if (!group) return
    group.traverse((obj) => {
      if ((obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose()
      }
      if ((obj as THREE.Mesh).material) {
        const mat = (obj as THREE.Mesh).material
        if (Array.isArray(mat)) {
          mat.forEach(m => m.dispose())
        } else {
          mat.dispose()
        }
      }
    })
  }

  public dispose() {
    if (this.ctx) {
      this.ctx.close().catch(() => {/* ignore close errors */})
      this.ctx = null
    }
  }
}

// --- Gesture Recognition Types & Engine ---
export interface SpellGesture {
  name: string
  displayName: string
  symbol: string
  damage: number
  manaCost: number
  cooldown: number // Cooldown duration in seconds
  color: number
  description: string
}

// ============================================================================
// GAME CONSTANTS (TypeScript - extracted magic numbers)
// ============================================================================

// Spell Damage Values (Rebalanced for intense 1 - 2 minute wizarding duel pacing)
const SPELL_DAMAGE = {
  EXPELLIARMUS: 8,       // Fast aerodynamic jet, disarms & breaks cadence
  PROTEGO: 0,            // Shield (absorbs 100%, perfect parry reflects)
  INCENDIO: 11,          // Fire vortex
  STUPEFY: 6,            // Concussive shockwave + 1.8s stun (CC)
  AVADA_KEDAVRA: 26,     // Ultimate killing curse beam (~1/4 HP, heavy tension)
  SECTUMSEMPRA: 12,      // Laceration cut + bleed over time
  PETRIFICUS: 7,         // Rigid body-bind + 2.2s lockdown (CC)
  CONFRINGO: 14,         // Fiery concussive blast detonation (highest burst)
  OBLIVIATE: 0,          // Disruption & amnesia silence
  EXPECTO_PATRONUM: 15,  // Pure celestial light + 8 HP heal recovery
} as const

// Spell Mana Costs (Every spell costs mana, heavy curses consume substantial mana)
const SPELL_MANA = {
  EXPELLIARMUS: 15,      // Standard disarming hex
  PROTEGO: 12,           // Quick protective barrier
  INCENDIO: 18,          // Flame vortex
  STUPEFY: 14,           // Stun bolt
  AVADA_KEDAVRA: 55,     // Ultimate killing curse (~55% mana pool)
  SECTUMSEMPRA: 22,      // Slashing curse + bleed
  PETRIFICUS: 20,        // Full body-bind stone curse
  CONFRINGO: 26,         // Detonation blast burst
  OBLIVIATE: 18,         // Memory erasure disruption
  EXPECTO_PATRONUM: 40,  // Patronus stag ultimate + heal
} as const

// Spell Cooldowns (Seconds — Bùa càng mạnh cooldown càng lâu)
const SPELL_COOLDOWN = {
  EXPELLIARMUS: 3.0,     // ⚡ Tia chớp cơ bản - hồi nhanh 3.0s
  PROTEGO: 4.0,          // 🛡️ Khiên bảo vệ (khiên 1.8s + hồi 2.2s) - 4.0s
  STUPEFY: 6.0,          // 💫 Bùa choáng 1.8s - hồi 6.0s (tránh stun-lock)
  OBLIVIATE: 6.5,        // 🌀 Bùa lãng quên câm lặng 2.0s - hồi 6.5s
  PETRIFICUS: 8.0,       // 🔒 Trói buộc hóa đá 2.2s + sát thương - hồi 8.0s
  SECTUMSEMPRA: 9.0,     // 🩸 Lời nguyền chém máu xuất huyết - hồi 9.0s
  CONFRINGO: 10.0,       // 💥 Bùa nổ bộc phá sát thương lớn - hồi 10.0s
  EXPECTO_PATRONUM: 14.0,// 🦌 Thần hộ mệnh hồi máu + sát thương - hồi 14.0s
  AVADA_KEDAVRA: 20.0,   // 💀 Lời nguyền chết chóc tối thượng - hồi 20.0s
} as const

// Spell Colors (hex)
const SPELL_COLORS = {
  EXPELLIARMUS: 0xff3838,
  PROTEGO: 0x38b6ff,
  INCENDIO: 0xff7b25,
  STUPEFY: 0xffe600,
  AVADA_KEDAVRA: 0x047857,
  SECTUMSEMPRA: 0x8b0000,
  PETRIFICUS: 0x9ca3af,
  CONFRINGO: 0xff8c00,
  IMMOBULUS: 0x60a5fa,
  MORSMORDRE: 0x22c55e,
  LEVICORPUS: 0xa855f7,
  OBLIVIATE: 0x06b6d4,
} as const

// Projectile Speeds
const PROJECTILE_SPEED = {
  EXPELLIARMUS: 16.0,   // High-speed aerodynamic dazzling scarlet jet (Book Canon)
  PROTEGO: 0,           // Shield (no projectile)
  INCENDIO: 10.5,
  STUPEFY: 13.5,
  AVADA_KEDAVRA: 0,     // Beam hold
} as const

// Beam Hold Durations (seconds)
const BEAM_HOLD_DURATION = {
  AVADA_KEDAVRA: 2.80,
} as const

// Player Stats (Balanced for 1-2 minute duel duration)
const PLAYER_STATS = {
  MAX_HP: 100,
  MATCH_DURATION: 120,       // seconds (2 minutes standard duel)
  DODGE_WINDOW: 0.35,        // seconds
  SHIELD_DURATION: 2.2,      // seconds
  STUN_DURATION: 1.8,        // seconds
} as const

// Enemy AI (Rhythmic casting cadence: decision every ~4s)
const ENEMY_AI = {
  THINK_INTERVAL: 1.6,       // seconds between AI decisions
  REACTION_TIME: 0.45,       // seconds to react to player spells
  TELEGRAPH_DURATION: 1.25,  // seconds warning before casting
  AVADA_KEDAVRA_COOLDOWN: 16.0, // seconds between AK casts
} as const

// VFX
const VFX = {
  PARTICLE_COUNT: 400,
  SHOCKWAVE_POOL_SIZE: 8,
  DETONATION_POOL_SIZE: 4,
  CAM_RECOIL_INTENSITY: 0.35,
  FLASH_DURATION: 85,         // ms
} as const


// --- Spell Definitions ---
const SPELL_DECK: Record<string, SpellGesture> = {
  expelliarmus: {
    name: 'expelliarmus',
    displayName: 'EXPELLIARMUS!',
    symbol: '⚡',
    damage: SPELL_DAMAGE.EXPELLIARMUS,
    manaCost: SPELL_MANA.EXPELLIARMUS,
    cooldown: SPELL_COOLDOWN.EXPELLIARMUS,
    color: SPELL_COLORS.EXPELLIARMUS,
    description: 'Tước đũa đối thủ, phá thế niệm chú và phản đòn nhanh (Hồi 3.0s)',
  },
  protego: {
    name: 'protego',
    displayName: 'PROTEGO!',
    symbol: '🛡️',
    damage: SPELL_DAMAGE.PROTEGO,
    manaCost: SPELL_MANA.PROTEGO,
    cooldown: SPELL_COOLDOWN.PROTEGO,
    color: SPELL_COLORS.PROTEGO,
    description: 'Khiên bảo vệ hóa giải 100% sát thương, phản đòn khi chặn chuẩn xác (Hồi 4.0s)',
  },
  stupefy: {
    name: 'stupefy',
    displayName: 'STUPEFY!',
    symbol: '💫',
    damage: SPELL_DAMAGE.STUPEFY,
    manaCost: SPELL_MANA.STUPEFY,
    cooldown: SPELL_COOLDOWN.STUPEFY,
    color: SPELL_COLORS.STUPEFY,
    description: 'Bùa choáng váng làm đối thủ bất động trong 1.8 giây (Hồi 6.0s)',
  },
  obliviate: {
    name: 'obliviate',
    displayName: 'OBLIVIATE!',
    symbol: '🌀',
    damage: SPELL_DAMAGE.OBLIVIATE,
    manaCost: SPELL_MANA.OBLIVIATE,
    cooldown: SPELL_COOLDOWN.OBLIVIATE,
    color: 0x06b6d4,  // Cyan - memory wipe
    description: 'Bùa Xóa Ký Ức — Hủy chiêu đối thủ và gây mất phương hướng 2.0 giây (Hồi 6.5s)',
  },
  petrificus: {
    name: 'petrificus',
    displayName: 'PETRIFICUS TOTALUS!',
    symbol: '🔒',
    damage: SPELL_DAMAGE.PETRIFICUS,
    manaCost: SPELL_MANA.PETRIFICUS,
    cooldown: SPELL_COOLDOWN.PETRIFICUS,
    color: 0x9ca3af,  // Gray - stone binding
    description: 'Thần Chú Trói Buộc — Đông cứng toàn thân đối thủ trong 2.2 giây (Hồi 8.0s)',
  },
  sectumsempra: {
    name: 'sectumsempra',
    displayName: 'SECTUMSEMPRA!',
    symbol: '🩸',
    damage: SPELL_DAMAGE.SECTUMSEMPRA,
    manaCost: SPELL_MANA.SECTUMSEMPRA,
    cooldown: SPELL_COOLDOWN.SECTUMSEMPRA,
    color: 0x8b0000,  // Dark crimson - blood color
    description: 'Lời Nguyền Máu — Nhát chém sâu gây sát thương và xuất huyết (Hồi 9.0s)',
  },
  confringo: {
    name: 'confringo',
    displayName: 'CONFRINGO!',
    symbol: '💥',
    damage: SPELL_DAMAGE.CONFRINGO,
    manaCost: SPELL_MANA.CONFRINGO,
    cooldown: SPELL_COOLDOWN.CONFRINGO,
    color: 0xff8c00,  // Orange explosion
    description: 'Bùa Nổ Tan — Sóng xung kích bộc phá tầm trung uy lực (Hồi 10.0s)',
  },
  expecto_patronum: {
    name: 'expecto_patronum',
    displayName: 'EXPECTO PATRONUM!',
    symbol: '🦌',
    damage: SPELL_DAMAGE.EXPECTO_PATRONUM,
    manaCost: SPELL_MANA.EXPECTO_PATRONUM,
    cooldown: SPELL_COOLDOWN.EXPECTO_PATRONUM,
    color: 0xf0f8ff,  // White/Silver - pure light
    description: 'Thần Hộ Mệnh — Ánh sáng bạch ngân xua tan bóng tối và hồi 8% sinh lực (Hồi 14.0s)',
  },
  avadakedavra: {
    name: 'avadakedavra',
    displayName: 'AVADA KEDAVRA!',
    symbol: '💀',
    damage: SPELL_DAMAGE.AVADA_KEDAVRA,
    manaCost: SPELL_MANA.AVADA_KEDAVRA,
    cooldown: SPELL_COOLDOWN.AVADA_KEDAVRA,
    color: SPELL_COLORS.AVADA_KEDAVRA,
    description: 'Lời Nguyền Chết Chóc — Đại kỹ năng hắc ám sát thương cực mạnh (Hồi 20.0s)',
  },
}

// --- Gesture Rune Drawing Requirements & Visual Templates ---
export interface SpellRuneTemplate {
  name: string
  displayName: string
  symbol: string
  colorHex: string
  keyName: string
  instruction: string
  points: { x: number; y: number }[] // Normalized coordinates centered at (0, 0), range approx -0.45 to 0.45
  svgRune: string
}

export const SPELL_RUNE_TEMPLATES: Record<string, SpellRuneTemplate> = {
  expelliarmus: {
    name: 'expelliarmus',
    displayName: 'EXPELLIARMUS!',
    symbol: '⚡',
    colorHex: '#f5cf73',
    keyName: '[1]',
    instruction: 'Ấn Tia Sét: Zigzag 2 góc gập dứt khoát',
    points: [
      { x: -0.22, y: -0.42 },
      { x: 0.28, y: -0.06 },
      { x: -0.18, y: 0.04 },
      { x: 0.32, y: 0.44 }
    ],
    svgRune: `<svg class="spell-rune-icon" viewBox="0 0 32 32" fill="none"><path d="M12 5 L22 13 L10 17 L21 27" stroke="#f5cf73" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="5" r="1.6" fill="#ffffff"/><circle cx="21" cy="27" r="1.6" fill="#f5cf73"/></svg>`,
  },
  protego: {
    name: 'protego',
    displayName: 'PROTEGO!',
    symbol: '🛡️',
    colorHex: '#70a1ff',
    keyName: '[2]',
    instruction: 'Ấn Vòm Khiên: Đường cung cong vút hướng lên (⌒)',
    points: (() => {
      const pts = []
      for (let a = Math.PI * 0.95; a >= Math.PI * 0.05; a -= 0.16) {
        pts.push({ x: 0.42 * Math.cos(a), y: 0.35 - 0.72 * Math.sin(a) })
      }
      return pts
    })(),
    svgRune: `<svg class="spell-rune-icon" viewBox="0 0 32 32" fill="none"><path d="M5 24 C8 11, 24 11, 27 24" stroke="#70a1ff" stroke-width="2.8" stroke-linecap="round"/><circle cx="16" cy="13.5" r="1.8" fill="#ffffff"/><line x1="8" y1="24" x2="24" y2="24" stroke="rgba(112, 161, 255, 0.4)" stroke-width="1.2" stroke-dasharray="2,2"/></svg>`,
  },
  stupefy: {
    name: 'stupefy',
    displayName: 'STUPEFY!',
    symbol: '💫',
    colorHex: '#ff4757',
    keyName: '[3]',
    instruction: 'Ấn Làn Sóng: Gợn sóng ngang ma thuật (~)',
    points: (() => {
      const pts = []
      for (let x = -0.44; x <= 0.44; x += 0.06) {
        pts.push({ x, y: Math.sin((x + 0.44) * 7.5) * 0.20 })
      }
      return pts
    })(),
    svgRune: `<svg class="spell-rune-icon" viewBox="0 0 32 32" fill="none"><path d="M5 16 C9 9, 13 23, 16 16 C19 9, 23 23, 27 16" stroke="#ff4757" stroke-width="2.6" stroke-linecap="round"/><circle cx="5" cy="16" r="1.5" fill="#ffffff"/><circle cx="27" cy="16" r="1.5" fill="#ff4757"/></svg>`,
  },
  avadakedavra: {
    name: 'avadakedavra',
    displayName: 'AVADA KEDAVRA!',
    symbol: '💀',
    colorHex: '#2ed573',
    keyName: '[9/K]',
    instruction: 'Ấn Chết Chóc: Tia sét nhọn sắc 3 góc gập',
    points: [
      { x: -0.20, y: -0.44 },
      { x: 0.28, y: -0.22 },
      { x: -0.24, y: 0.02 },
      { x: 0.22, y: 0.22 },
      { x: -0.12, y: 0.46 }
    ],
    svgRune: `<svg class="spell-rune-icon" viewBox="0 0 32 32" fill="none"><path d="M11 5 L22 11 L9 17 L23 22 L11 27" stroke="#2ed573" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11" cy="5" r="1.6" fill="#ffffff"/><circle cx="11" cy="27" r="1.6" fill="#2ed573"/></svg>`,
  },
  obliviate: {
    name: 'obliviate',
    displayName: 'OBLIVIATE!',
    symbol: '🌀',
    colorHex: '#00d2d3',
    keyName: '[4]',
    instruction: 'Ấn Lãng Quên: Vòng tròn tròn đều khép kín (◯)',
    points: (() => {
      const pts = []
      for (let a = 0; a <= Math.PI * 2.05; a += 0.22) {
        pts.push({ x: 0.38 * Math.cos(a), y: 0.38 * Math.sin(a) })
      }
      return pts
    })(),
    svgRune: `<svg class="spell-rune-icon" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="10" stroke="#00d2d3" stroke-width="2.6"/><circle cx="16" cy="6" r="1.6" fill="#ffffff"/><path d="M16 11 A5 5 0 0 1 19 16" stroke="rgba(0, 210, 211, 0.6)" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  },
  petrificus: {
    name: 'petrificus',
    displayName: 'PETRIFICUS TOTALUS!',
    symbol: '🔒',
    colorHex: '#a4b0be',
    keyName: '[5]',
    instruction: 'Ấn Trói Buộc: Vạch thẳng dứt khoát từ trên xuống (┃)',
    points: [
      { x: 0, y: -0.44 },
      { x: 0, y: 0.44 }
    ],
    svgRune: `<svg class="spell-rune-icon" viewBox="0 0 32 32" fill="none"><line x1="16" y1="5" x2="16" y2="27" stroke="#a4b0be" stroke-width="3" stroke-linecap="round"/><path d="M11 21 L16 27 L21 21" stroke="#a4b0be" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="5" r="1.5" fill="#ffffff"/></svg>`,
  },
  sectumsempra: {
    name: 'sectumsempra',
    displayName: 'SECTUMSEMPRA!',
    symbol: '🩸',
    colorHex: '#e84118',
    keyName: '[6]',
    instruction: 'Ấn Kiếm Khí: Vạch chém ngang dứt khoát (━)',
    points: [
      { x: -0.44, y: 0 },
      { x: 0.44, y: 0 }
    ],
    svgRune: `<svg class="spell-rune-icon" viewBox="0 0 32 32" fill="none"><line x1="5" y1="16" x2="27" y2="16" stroke="#e84118" stroke-width="3" stroke-linecap="round"/><path d="M21 11 L27 16 L21 21" stroke="#e84118" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="5" cy="16" r="1.5" fill="#ffffff"/></svg>`,
  },
  confringo: {
    name: 'confringo',
    displayName: 'CONFRINGO!',
    symbol: '💥',
    colorHex: '#ffa502',
    keyName: '[7]',
    instruction: 'Ấn Bộc Phá: Hình tam giác khép kín (△)',
    points: [
      { x: 0, y: -0.42 },
      { x: 0.40, y: 0.38 },
      { x: -0.40, y: 0.38 },
      { x: 0, y: -0.42 }
    ],
    svgRune: `<svg class="spell-rune-icon" viewBox="0 0 32 32" fill="none"><polygon points="16,6 27,25 5,25" stroke="#ffa502" stroke-width="2.6" stroke-linejoin="round"/><circle cx="16" cy="6" r="1.6" fill="#ffffff"/><circle cx="16" cy="18" r="1.5" fill="rgba(255, 165, 2, 0.7)"/></svg>`,
  },
  expecto_patronum: {
    name: 'expecto_patronum',
    displayName: 'EXPECTO PATRONUM!',
    symbol: '🦌',
    colorHex: '#ffffff',
    keyName: '[8/P]',
    instruction: 'Ấn Hộ Mệnh: Vòng tròn hất vút lên góc trời (◯↗)',
    points: (() => {
      const pts = []
      for (let a = 0; a <= Math.PI * 1.75; a += 0.22) {
        pts.push({ x: 0.28 * Math.cos(a), y: 0.10 + 0.28 * Math.sin(a) })
      }
      pts.push({ x: 0.16, y: -0.14 })
      pts.push({ x: 0.30, y: -0.30 })
      pts.push({ x: 0.44, y: -0.44 })
      return pts
    })(),
    svgRune: `<svg class="spell-rune-icon" viewBox="0 0 32 32" fill="none"><path d="M19 19 A7 7 0 1 1 15 12 L27 5" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="27" cy="5" r="1.6" fill="#ffeaa7"/><path d="M22 5 L27 5 L27 10" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
}

// --- Dynamic 3D Projectile Structure ---
// --- Parametric 3D Helix Curve for Volumetric Double Helix ---
class HelixCurve3D extends THREE.Curve<THREE.Vector3> {
  constructor(public radius: number, public turns: number, public length: number, public phase: number = 0) {
    super()
  }
  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const y = -this.length * 0.5 + t * this.length
    const angle = t * this.turns * Math.PI * 2 + this.phase
    const x = Math.cos(angle) * this.radius
    const z = Math.sin(angle) * this.radius
    return optionalTarget.set(x, y, z)
  }
}

interface Projectile {
  mesh: THREE.Group
  direction: THREE.Vector3
  speed: number
  spell: SpellGesture
  isPlayer: boolean
  active: boolean
  progress: number
  light: THREE.PointLight
  startPos: THREE.Vector3
  targetPos: THREE.Vector3

  // 1. Expelliarmus (Continuous Lightning Lance - Sketch 1)
  beamCore?: THREE.Mesh
  beamSheath?: THREE.Mesh
  beamOuterGlow?: THREE.Mesh
  laserFins?: THREE.Mesh[]
  lightningLines?: THREE.Line[]
  doubleHelixGold?: any
  doubleHelixCrimson?: any
  doubleHelixGoldSpark?: any
  lanceGroup?: THREE.Group
  groundReflectionRibbon?: THREE.Mesh
  floorReflectionGroup?: THREE.Group
  originalDist?: number
  helixAngle?: number
  extraLights?: THREE.PointLight[]
  headSpark?: THREE.Sprite
  headDiamond?: THREE.Sprite
  headAnamorphic?: THREE.Sprite
  targetSpark?: THREE.Sprite
  targetDiamond?: THREE.Sprite
  targetAnamorphic?: THREE.Sprite
  machCones?: any[]
  beamHolding?: boolean
  beamHoldTimer?: number

  // 2. Incendio (Massive Fire Spiral Vortex & Smoke - Sketch 2)
  fireCore?: THREE.Mesh
  fireConnectingStream?: THREE.Mesh
  flameVortexSprites?: THREE.Sprite[]
  smokeSprites?: THREE.Sprite[]
  flameTailSprites?: THREE.Sprite[]
  groundScorchMesh?: THREE.Mesh
  incendio3DVortex?: THREE.Group

  // 3. Stupefy (Epic Celestial Gravity Singularity - Sketch 3)
  stupefyNucleus?: THREE.Mesh
  stupefyAura?: THREE.Mesh
  stupefyOuterHalo?: THREE.Mesh
  stupefyCrossFlare?: THREE.Sprite
  gyroRings?: THREE.Mesh[]
  sonicRings?: THREE.Mesh[]

  // 4. Avada Kedavra (Unforgivable Killing Curse - Concept Sketch 4)
  skullSprite?: THREE.Sprite
  skullGlow?: THREE.Sprite
  mouthFlash?: THREE.Sprite
  skull3DMesh?: THREE.Group
  skullMistSprites?: THREE.Sprite[]
  skullVaporSprites?: THREE.Sprite[]
  floorLightningLines?: THREE.Line[]
  floorLightningTubes?: THREE.Mesh[]
  skullLightningTethers?: THREE.Line[]
  shroudSprites?: THREE.Sprite[]
  starburstSprite?: THREE.Sprite
  vRedSpark?: THREE.Sprite
  vRedCorona?: THREE.Sprite
  detailedTrunk?: THREE.Vector3[]

  // 5. Advanced 8 Spells Visuals (Sectumsempra, Petrificus, Confringo, Immobulus, Morsmordre, Levicorpus, Obliviate, Expecto Patronum)
  advancedVisuals?: AdvancedSpellVisuals
}

interface VfxParticle {
  active: boolean
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  r: number
  g: number
  b: number
  size: number
  life: number
  maxLife: number
  drag: number
  gravity: number
}

interface VfxShockwave {
  mesh: THREE.Mesh
  active: boolean
  progress: number
  duration: number
  maxRadius: number
}

interface VfxDetonation {
  sprite: THREE.Sprite
  active: boolean
  progress: number
  duration: number
  maxScale: number
}

// --- Active Wand Crowd Control Aura System ---
interface ActiveWandAura {
  group: THREE.Group
  parent: THREE.Group
  spellName: string
  elapsed: number
  duration: number
  update: (delta: number) => boolean
}

class WandHelixCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    public startZ: number,
    public endZ: number,
    public baseRadius: number,
    public bulgeRadius: number,
    public turns: number,
    public phase: number
  ) {
    super()
  }
  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const z = this.startZ + (this.endZ - this.startZ) * t
    const r = this.baseRadius + this.bulgeRadius * Math.sin(t * Math.PI)
    const angle = t * this.turns * Math.PI * 2 + this.phase
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    return optionalTarget.set(x, y, z)
  }
}

// --- Main 3D Single Player Dueling Game Engine ---
class HogwartsSinglePlayerGame {
  private container: HTMLElement
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer!: any
  private clock: THREE.Clock
  private audio: MagicAudio
  private activeWandAuras: ActiveWandAura[] = []

  // 3D Procedural LEGO Duelists & Dynamic Animations
  private playerGroup!: THREE.Group
  private playerLego!: LegoDuelist
  private playerBasePos = new THREE.Vector3(-1.38, -0.85, 1.25)
  private playerLeanX = 0
  private playerLeanY = 0
  private targetPlayerLeanX = 0
  private targetPlayerLeanY = 0
  private playerCastProgress = 0
  private playerFlinch = 0
  private playerDodgeTimer = 0
  private keyState: Record<string, boolean> = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
    Space: false,
  }

  private opponentGroup!: THREE.Group
  private opponentLego!: LegoDuelist
  private opponentBasePos = new THREE.Vector3(0.95, -0.85, -3.45)
  private opponentLeanX = 0
  private opponentLeanY = 0
  private targetOpponentLeanX = 0
  private targetOpponentLeanY = 0
  private opponentDodgeCooldown = 0
  private opponentCastProgress = 0
  private opponentFlinch = 0
  private opponentWandTip!: THREE.Group
  private opponentLight!: THREE.PointLight
  private voldemort2005GLB: THREE.Group | null = null
  private voldemort2005BaseY: number = 0
  private voldemortWandTip: THREE.Group | null = null

  // 3D GLB Character Roster & Custom Models
  public selectedPlayerChar: string = 'harry'
  public selectedOpponentChar: string = 'voldemort'
  private playerCharGLB: THREE.Group | null = null
  private playerCharBaseY: number = 0
  private playerWandTip: THREE.Group | null = null
  private opponentCharGLB: THREE.Group | null = null
  private opponentCharBaseY: number = 0
  private charGlbCache: Map<string, THREE.Group> = new Map()

  // Cinematic VFX Engine
  private vfxTextures!: {
    spark: THREE.CanvasTexture
    corona: THREE.CanvasTexture
    shockwave: THREE.CanvasTexture
    shieldHex: THREE.CanvasTexture
    explosion: THREE.CanvasTexture
    flame: THREE.CanvasTexture
    fireSpiral: THREE.Texture
    smokePuff: THREE.Texture
    anamorphicFlare: THREE.CanvasTexture
    shieldRippleTarget: THREE.CanvasTexture
    beamTrail: THREE.CanvasTexture
    laserBeam: THREE.CanvasTexture
    runeCircle: THREE.CanvasTexture
    runeCircleInner: THREE.CanvasTexture
    scorchDecal: THREE.Texture
    celestialStar: THREE.CanvasTexture
    skullMist: THREE.Texture
    emeraldStarburst: THREE.Texture
    darkSmoke: THREE.Texture
    avadaRune: THREE.Texture
  }
  private vfx8Textures!: Vfx8Textures
  private gltfLoader = new GLTFLoader()
  private phantomSkull3DTemplate: THREE.Group | null = null
  private incendioVortex3DTemplate: THREE.Group | null = null
  private patronusStag3DTemplate: THREE.Group | null = null
  private avadaDeathPhantom3DTemplate: THREE.Group | null = null
  private vfxParticles: VfxParticle[] = []
  private vfxPointsMesh!: THREE.Points
  private vfxGeoPositions!: Float32Array
  private vfxGeoColors!: Float32Array
  private shockwavePool: VfxShockwave[] = []
  private detonationPool: VfxDetonation[] = []

  // 3D Scene Entities
  private backgroundMesh!: THREE.Mesh
  private duelingStage!: HogwartsDuelingStage
  private clashCoreSprite!: THREE.Sprite
  private shockwaveMesh!: THREE.Mesh
  private wandLight!: THREE.PointLight
  private clashLight!: THREE.PointLight
  private impactLight!: THREE.PointLight
  private sparkPoints!: THREE.Points
  private sparkPositions!: Float32Array
  private sparkVelocities!: Float32Array
  private candles: THREE.Group[] = []
  private static readonly MAX_DISARMED_WANDS = 10  // Max disarmed wands to prevent unbounded growth
  private disarmedWands: Array<{ mesh: THREE.Object3D; vel: THREE.Vector3; rotVel: THREE.Vector3; life: number }> = []

  // Dynamic 3D Defense & Projectiles
  private playerShieldMesh!: THREE.Mesh
  private playerInnerShieldMesh!: THREE.Mesh
  private playerShieldRim!: THREE.Mesh
  private playerShieldRing!: THREE.Mesh
  private playerShieldRing2!: THREE.Mesh
  private playerRuneMesh!: THREE.Mesh
  private playerRuneInnerMesh!: THREE.Mesh

  private enemyShieldMesh!: THREE.Mesh
  private enemyInnerShieldMesh!: THREE.Mesh
  private enemyShieldRim!: THREE.Mesh
  private enemyShieldRing!: THREE.Mesh
  private enemyShieldRing2!: THREE.Mesh
  private enemyRuneMesh!: THREE.Mesh
  private enemyRuneInnerMesh!: THREE.Mesh
  private projectiles: Projectile[] = []

  // Camera Parallax
  private targetCamX = 0
  private targetCamY = 0

  // 2D Wand Tracing Canvas & Spell Requirement System
  private wandCanvas: HTMLCanvasElement
  private wandCtx: CanvasRenderingContext2D
  private isDrawing = false
  private drawnPoints: { x: number; y: number }[] = []
  public activeArmedSpell: string = 'expelliarmus'
  private miniCanvas: HTMLCanvasElement | null = null
  private miniCanvasCtx: CanvasRenderingContext2D | null = null
  private promptStatusTimeout: number | null = null
  private promptPreviewTimeout: number | null = null
  private fizzleParticles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string }[] = []

  // Game Mode & Multiplayer Network State
  public gameMode: 'menu' | 'single' | 'multiplayer' = 'menu'
  public network: DuelNetwork = new DuelNetwork()
  public isHost: boolean = false
  public currentRoomCode: string = ''
  public deckManager: MultiplayerDeckManager = new MultiplayerDeckManager()
  public selectedMultiplayerSpells: string[] = this.deckManager.getDeck()
  public opponentMultiplayerSpells: string[] = []

  // Game & AI State (HP, Mana & Timers)
  public gauntletRoster: GauntletEntry[] = []
  public currentRoundIndex: number = 0 // 0 = Ải 1, 1 = Ải 2, ..., 4 = Ải 5
  public currentTier: GauntletTier = GAUNTLET_TIERS[0]
  private playerHp = 100
  private maxPlayerHp = 100
  private ghostPlayerHp = 100
  private enemyHp = 100
  private maxEnemyHp = 100
  private ghostEnemyHp = 100
  public playerMana = 100
  public maxPlayerMana = 100
  public enemyMana = 100
  public maxEnemyMana = 100
  private manaRegenRate = 10 // +10 MP / sec passive recovery
  private matchTimer = 120
  private currentRound = 1
  private intermissionTimer: any = null
  private playerShieldActiveUntil = 0
  private enemyShieldActiveUntil = 0
  private enemyStunnedUntil = 0
  private enemyCCType: 'petrificus' | 'stupefy' | 'expelliarmus' | 'obliviate' | 'immobulus' | 'levicorpus' | null = null
  private enemyCCName = ''
  private enemyCCDuration = 0

  private playerStunnedUntil = 0
  private playerCCType: 'petrificus' | 'stupefy' | 'expelliarmus' | 'obliviate' | 'immobulus' | 'levicorpus' | null = null
  private playerCCName = ''
  private playerCCDuration = 0
  public playerCooldowns: Record<string, number> = {}
  public enemyCooldowns: Record<string, number> = {}
  private enemyNextActionTime = 12.0
  public aiDisabled = true
  private enemyTelegraphTime = 0
  private enemyCurrentCast: SpellGesture | null = null

  // Priori Incantatem Clash Mode
  private inClashMode = false
  private clashProgress = 0.5 // 0.0 (enemy wins) to 1.0 (player wins)
  private clashStartTime = 0

  // Match Statistics
  private perfectCount = 0
  private clashesWon = 0
  private matchOver = false

  // Constants
  private readonly HARRY_WAND = new THREE.Vector3(-1.38, -0.05, 1.25)
  private readonly ENEMY_WAND = new THREE.Vector3(0.55, -0.05, -3.45)
  private readonly CLASH_CENTER = new THREE.Vector3(-0.415, -0.45, -1.10)

  private getHarryWandWorldPos(): THREE.Vector3 {
    if (this.playerWandTip) {
      if (this.playerGroup) this.playerGroup.updateMatrixWorld(true)
      const v = new THREE.Vector3()
      this.playerWandTip.getWorldPosition(v)
      return v
    }
    if (this.playerLego?.wandTipGroup) {
      if (this.playerGroup) this.playerGroup.updateMatrixWorld(true)
      const v = new THREE.Vector3()
      this.playerLego.wandTipGroup.getWorldPosition(v)
      return v
    }
    return this.HARRY_WAND
  }

  private getDracoWandWorldPos(): THREE.Vector3 {
    if (this.voldemortWandTip) {
      if (this.opponentGroup) this.opponentGroup.updateMatrixWorld(true)
      const v = new THREE.Vector3()
      this.voldemortWandTip.getWorldPosition(v)
      return v
    }
    if (this.opponentLego?.wandTipGroup) {
      if (this.opponentGroup) this.opponentGroup.updateMatrixWorld(true)
      const v = new THREE.Vector3()
      this.opponentLego.wandTipGroup.getWorldPosition(v)
      return v
    }
    return this.ENEMY_WAND
  }

  constructor() {
    this.container = document.getElementById('webgl-container') ?? document.createElement('div')
    this.wandCanvas = document.getElementById('wand-canvas') as HTMLCanvasElement ?? document.createElement('canvas')
    this.wandCtx = this.wandCanvas.getContext('2d')!
    this.clock = new THREE.Clock()
    this.clock.start()  // Ensure clock is started
    this.audio = new MagicAudio()
    ;(window as any).duelingGame = this
    this.vfx8Textures = createVfx8SpellTextures()

    this.deckManager.onDeckChange((deck) => {
      this.selectedMultiplayerSpells = deck
    })

    // 1. Setup Three.js Scene & Spectator Camera matching concept sketch
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0x131722, 0.003)

    const aspect = window.innerWidth / window.innerHeight
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 100)  // Wider FOV for dramatic side view
    // Auto-detect device and orientation for camera mode
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
    const isPortrait = window.innerHeight > window.innerWidth
    this.cameraMode = isPortrait ? 'portrait' : (isMobile ? 'mobile' : 'cinematic')
    this.camera.fov = isPortrait ? 68 : 55
    this.camera.position.copy(this.CAMERA_POSITIONS[this.cameraMode].pos)
    this.camera.lookAt(this.CAMERA_POSITIONS[this.cameraMode].look)
    this.camera.updateProjectionMatrix()

    // 2. Initialize WebGPU with automatic WebGL2 Fallback
    this.initRenderer().then(() => {
      // Build 2.5D Diorama Arena & Entities
      this.buildSceneLighting()
      this.buildStageLayers()
      this.buildFloatingCandles()
      this.buildMagicBeamClash()
      this.buildVfxTextures()
      this.buildParticleSystem()
      this.buildShieldMeshes()
      // buildSkeletalCharacters MUST come first (creates playerLego/opponentLego)
      this.buildSkeletalCharacters()
      // buildCastVfx uses playerLego.wandTipGroup, so must come after
      this.buildCastVfx()
      
      // Setup post-processing (Bloom) for magical glow effects
      this.setupPostProcessing()
      
      this.setupParallaxListeners()
      this.setupCameraToggle()
      this.setupGestureCanvas()
      this.setupSpellWheelControls()
      this.setupMobileControls()
      this.setupClashControls()
      this.setupModalControls()

      // 4. Setup Main Menu & Match Timer Loop
      this.updateHpBars()
      this.setupMainMenu()
      this.startMatchTimerLoop()

      // Store resize handler reference for cleanup
      this.resizeHandler = () => this.onWindowResize()
      window.addEventListener('resize', this.resizeHandler)
      
      // Cleanup on page unload (prevent memory leaks)
      window.addEventListener('beforeunload', () => {
        if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler)
        this.clock?.stop()
        this.renderer?.dispose()
      })
      ;(window as any).game = this
      ;(window as any).duelingGame = {
        instance: this,
        get playerMana() { return this.instance.playerMana },
        set playerMana(val: number) { this.instance.playerMana = val },
        get enemyMana() { return this.instance.enemyMana },
        set enemyMana(val: number) { this.instance.enemyMana = val },
        get playerHp() { return this.instance.playerHp },
        get enemyHp() { return this.instance.enemyHp },
        setLean: (x: number, y: number) => {
          this.targetPlayerLeanX = x
          this.playerLeanX = x
          this.targetPlayerLeanY = y
          this.playerLeanY = y
        },
        castPlayerSpell: (spellKey: string, acc: number = 95) => this.castPlayerSpell(spellKey, acc),
        castExpelliarmus: () => this.castPlayerSpell('expelliarmus', 90),
        castStupefy: () => this.castPlayerSpell('stupefy', 90),
        castProtego: () => this.castPlayerSpell('protego', 100),
        castAvadaKedavra: () => this.castPlayerSpell('avadakedavra', 75),  // Harder to cast
        castSpell: (name: string) => this.castPlayerSpell(name, 90),
        armSpell: (name: string) => this.setArmedSpell(name),
        getActiveArmedSpell: () => this.activeArmedSpell,
        simulateDrawStroke: (pts: { x: number; y: number }[]) => {
          if (!pts || pts.length === 0) return
          this.startDrawing(pts[0].x, pts[0].y)
          for (let i = 1; i < pts.length; i++) {
            this.drawMove(pts[i].x, pts[i].y)
          }
          this.endDrawing()
        },
        applyCrowdControlToPlayer: (type: any, dur: number, name: string) => this.applyCrowdControlToPlayer(type, dur, name),
        applyCrowdControlToOpponent: (type: any, dur: number, name: string) => this.applyCrowdControlToOpponent(type, dur, name),
        get playerStunnedUntil() { return this.instance.playerStunnedUntil },
        get enemyStunnedUntil() { return this.instance.enemyStunnedUntil },
        get playerCooldowns() { return this.instance.playerCooldowns },
        get enemyCooldowns() { return this.instance.enemyCooldowns },
        get deckManager() { return this.instance.deckManager },
        get selectedMultiplayerSpells() { return this.instance.selectedMultiplayerSpells },
        get opponentMultiplayerSpells() { return this.instance.opponentMultiplayerSpells },
        get gameMode() { return this.instance.gameMode },
        get network() { return this.instance.network },
        get currentRoomCode() { return this.instance.currentRoomCode },
        startMultiplayerMatch: (isHost: boolean, roomCode: string) => this.startMultiplayerMatch(isHost, roomCode),
        showMainMenu: () => this.showMainMenu(),
        equipMultiplayerSpell: (spellKey: string) => this.deckManager.equipSpell(spellKey),
        unequipMultiplayerSpell: (spellKey: string) => this.deckManager.unequipSpell(spellKey),
        toggleMultiplayerSpell: (spellKey: string) => this.deckManager.toggleSpell(spellKey),
        get playerLego() { return this.instance.playerLego },
        get opponentLego() { return this.instance.opponentLego },
        triggerPlayerDodge: () => this.triggerPlayerDodge(),
        setAiDisabled: (val: boolean) => { this.aiDisabled = val },
        resetHp: () => {
          this.playerHp = 100
          this.enemyHp = 100
          this.playerMana = 100
          this.enemyMana = 100
          this.matchOver = false
          this.matchTimer = 120
          this.updateHpBars()
          const clock = document.getElementById('duel-clock')
          if (clock) clock.textContent = '02:00'
        },
      }
      this.animate()
    }).catch(err => {
      console.error('💥 [Hogwarts 2.5D] Initialization Error:', err)
    })
  }

  private async initRenderer(): Promise<void> {
    try {
      const glRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      })
      glRenderer.setSize(window.innerWidth, window.innerHeight)
      glRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      glRenderer.shadowMap.enabled = true
      glRenderer.shadowMap.type = THREE.PCFSoftShadowMap
      glRenderer.toneMapping = THREE.ACESFilmicToneMapping
      glRenderer.toneMappingExposure = 1.25
      this.renderer = glRenderer
      this.container.appendChild(this.renderer.domElement)
      console.log('⚡ [Hogwarts 2.5D] High-Performance Renderer initialized successfully with Bloom!')
      this.updateEngineBadge('⚡ 2.5D WEBGPU DIORAMA')
    } catch (err) {
      console.warn('⚠️ [Renderer] WebGLRenderer unavailable in this environment, using Canvas/Mock fallback:', err)
      const dummyCanvas = document.createElement('canvas')
      dummyCanvas.width = window.innerWidth || 800
      dummyCanvas.height = window.innerHeight || 600
      this.container.appendChild(dummyCanvas)
    }
  }

  private updateEngineBadge(text: string) {
    let badge = document.getElementById('render-engine-badge')
    if (!badge) {
      badge = document.createElement('div')
      badge.id = 'render-engine-badge'
      badge.style.cssText = `
        position: fixed;
        bottom: 12px;
        left: 16px;
        z-index: 80;
        font-family: 'Cinzel', serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #fde68a;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(245, 158, 11, 0.45);
        border-radius: 6px;
        padding: 4px 10px;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
        pointer-events: none;
      `
      document.body.appendChild(badge)
    }
    badge.textContent = text
  }

  // --- Dynamic Lighting ---
  private buildSceneLighting() {
    // Warm, golden ambient light flooding the Great Hall
    const ambient = new THREE.AmbientLight(0xffeed6, 1.45)
    this.scene.add(ambient)

    // Studio Lights - 3-Point Setup + Stained Glass Moonlight Fill
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.6)
    keyLight.position.set(2.5, 4.8, 2.8)
    this.scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.6)
    fillLight.position.set(-3.0, 3.2, 2.2)
    this.scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.1)
    rimLight.position.set(0, 4.0, -1.0)
    this.scene.add(rimLight)

    this.wandLight = new THREE.PointLight(0xff4422, 2.8, 6)
    this.wandLight.position.copy(this.HARRY_WAND)
    this.scene.add(this.wandLight)

    this.opponentLight = new THREE.PointLight(0x00ff88, 0.25, 3)
    this.opponentLight.position.copy(this.ENEMY_WAND)
    this.scene.add(this.opponentLight)

    this.clashLight = new THREE.PointLight(0xfff0aa, 0, 14)
    this.clashLight.position.copy(this.CLASH_CENTER)
    this.scene.add(this.clashLight)

    this.impactLight = new THREE.PointLight(0xffffff, 0, 15)
    this.scene.add(this.impactLight)
  }


  // ============================================================================
  // POST-PROCESSING: Bloom/Glow for magical effects
  // ============================================================================
  private setupPostProcessing() {
    // Create effect composer for post-processing pipeline
    this.composer = new EffectComposer(this.renderer)

    // Pass 1: Render scene to texture
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)

    // Pass 2: Unreal Bloom for magical glow effects
    // strength = glow intensity (higher = more glow)
    // radius = glow spread (higher = larger glow area)
    // threshold = minimum brightness to apply bloom (0-1)
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.baseBloomStrength,  // strength: 0.8 base glow
      0.4,                    // radius: spread of the glow
      0.85                    // threshold: only bright things glow
    )
    this.composer.addPass(this.bloomPass)

    // Pass 3: Output pass with tone mapping (important for HDR)
    const outputPass = new OutputPass()
    this.composer.addPass(outputPass)

    console.log('✨ [Hogwarts 2.5D] Bloom post-processing initialized!')
  }

  // Dynamic bloom control for spell impacts
  private triggerBloomFlash(intensity: number, duration: number = 0.3) {
    if (!this.bloomPass) return
    
    const animate = () => {
      if (this.bloomPass && this.bloomPass.strength > this.baseBloomStrength + 0.1) {
        this.bloomPass.strength -= 0.08
        requestAnimationFrame(animate)
      } else if (this.bloomPass) {
        this.bloomPass.strength = this.baseBloomStrength
      }
    }
    
    this.bloomPass.strength = intensity
    setTimeout(animate, duration * 1000)
  }
  // --- Full 3D Hogwarts Great Hall & Dueling Runway ---
  private buildStageLayers() {
    // Subtle, warm distant atmosphere instead of thick black fog
    this.scene.fog = new THREE.FogExp2(0x1a1612, 0.005)

    // Build full 3D Hogwarts Dueling Runway Platform & Great Hall Architecture
    this.duelingStage = new HogwartsDuelingStage()
    this.scene.add(this.duelingStage.group)
  }

  // --- Procedural 3D LEGO Minifigure Duelists ---
  private buildSkeletalCharacters() {
    const createContactShadowTex = (w = 128, h = 64) => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      const grad = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2 - 4)
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.98)')
      grad.addColorStop(0.3, 'rgba(0, 0, 0, 0.78)')
      grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.28)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
      return new THREE.CanvasTexture(canvas)
    }

    // 1. Build LEGO Harry Potter (Foreground Player Model - Balanced 1.15 Scale)
    this.playerGroup = new THREE.Group()
    this.playerGroup.position.copy(this.playerBasePos)
    this.playerGroup.rotation.y = Math.PI - 0.38 // Angled along runway facing Voldemort!

    this.playerLego = new LegoDuelist(false) // Harry Potter
    this.playerLego.group.scale.set(1.15, 1.15, 1.15)
    this.playerGroup.add(this.playerLego.group)

    // Soft contact shadow under Harry
    const harryShadowMat = new THREE.MeshBasicMaterial({
      map: createContactShadowTex(128, 64),
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    })
    const harryShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.60, 0.36), harryShadowMat)
    harryShadow.rotation.x = -Math.PI / 2
    harryShadow.position.set(0, 0.005, 0)
    this.playerGroup.add(harryShadow)

    // Attach Wand Light to Harry's wand tip (wandMuzzleSprite is added in buildCastVfx)
    this.wandLight.position.set(0, 0, 0)
    this.playerLego.wandTipGroup.add(this.wandLight)
    this.scene.add(this.playerGroup)

    // 2. Build LEGO Lord Voldemort (Opponent Runway Model - Imposing 1.40 Scale)
    this.opponentGroup = new THREE.Group()
    this.opponentGroup.position.copy(this.opponentBasePos)
    this.opponentGroup.rotation.y = -0.38 // Facing forward down the runway towards Harry & camera!

    this.opponentLego = new LegoDuelist(true) // Lord Voldemort
    this.opponentLego.group.scale.set(1.40, 1.40, 1.40)
    this.opponentGroup.add(this.opponentLego.group)

    // Soft contact shadow under Voldemort
    const voldyShadowMat = new THREE.MeshBasicMaterial({
      map: createContactShadowTex(128, 64),
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    })
    const voldyShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.42), voldyShadowMat)
    voldyShadow.rotation.x = -Math.PI / 2
    voldyShadow.position.set(0, 0.005, 0)
    this.opponentGroup.add(voldyShadow)

    // Attach Opponent Wand Tip, Light & Charging Aura to Voldemort's wand tip!
    this.opponentWandTip = this.opponentLego.wandTipGroup
    this.opponentLight.position.set(0, 0, 0)
    this.opponentWandTip.add(this.opponentLight)
    if (this.dracoAuraSprite) {
      this.dracoAuraSprite.position.set(0, 0, 0)
      this.opponentWandTip.add(this.dracoAuraSprite)
    }

    // Stun stars directly above Voldemort's head
    if (this.stunStarsGroup) {
      this.stunStarsGroup.position.set(0, 1.95, 0)
      this.opponentGroup.add(this.stunStarsGroup)
    }

    this.scene.add(this.opponentGroup)
  }

  // --- Floating Candles ---
  private buildFloatingCandles() {
    this.candles = []
    const candleGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.22, 8)
    const candleMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      roughness: 0.35,
      emissive: 0xd97706,
      emissiveIntensity: 0.20,
    })

    const flameCanvas = document.createElement('canvas')
    flameCanvas.width = 64
    flameCanvas.height = 64
    const fctx = flameCanvas.getContext('2d')!
    const grad = fctx.createRadialGradient(32, 40, 2, 32, 36, 26)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(0.30, '#fffa65')
    grad.addColorStop(0.65, '#f59e0b')
    grad.addColorStop(0.90, '#d97706')
    grad.addColorStop(1, 'rgba(217, 119, 6, 0)')
    fctx.fillStyle = grad
    fctx.fillRect(0, 0, 64, 64)
    const flameTexture = new THREE.CanvasTexture(flameCanvas)

    const flameMat = new THREE.SpriteMaterial({
      map: flameTexture,
      blending: THREE.AdditiveBlending,
      color: 0xffdd77,
    })

    const candleTiers = [
      { count: 12, zMin: 0.2, zMax: 2.2, yMin: 1.65, yMax: 2.35, xMin: -3.4, xMax: 2.5 },
      { count: 14, zMin: -1.5, zMax: 0.2, yMin: 1.85, yMax: 2.75, xMin: -3.8, xMax: 3.8 },
      { count: 12, zMin: -3.4, zMax: -1.5, yMin: 2.10, yMax: 3.10, xMin: -4.0, xMax: 4.0 },
      { count: 10, zMin: -5.4, zMax: -3.4, yMin: 2.40, yMax: 3.45, xMin: -4.2, xMax: 4.2 },
    ]

    candleTiers.forEach((tier) => {
      for (let i = 0; i < tier.count; i++) {
        const group = new THREE.Group()
        const candle = new THREE.Mesh(candleGeo, candleMat)
        group.add(candle)

        const flame = new THREE.Sprite(flameMat)
        flame.scale.set(0.12, 0.18, 1)
        flame.position.set(0, 0.16, 0)
        group.add(flame)

        const frac = i / tier.count
        const x = tier.xMin + frac * (tier.xMax - tier.xMin) + (Math.random() - 0.5) * 0.35
        const y = tier.yMin + Math.random() * (tier.yMax - tier.yMin)
        const z = tier.zMin + Math.random() * (tier.zMax - tier.zMin)

        group.position.set(x, y, z)
        group.userData = { baseY: y, phase: Math.random() * Math.PI * 2, speed: 1.2 + Math.random() * 1.4 }
        this.candles.push(group)
        this.scene.add(group)
      }
    })
  }

  // --- Cinematic VFX Engine: Procedural Textures & Particle System ---
  private buildVfxTextures() {
    // 1. Spark Texture (Pure white radial falloff with 4-point star glint for vertex color brilliance)
    const sparkCanvas = document.createElement('canvas')
    sparkCanvas.width = 64
    sparkCanvas.height = 64
    const sctx = sparkCanvas.getContext('2d')!
    const sgrad = sctx.createRadialGradient(32, 32, 1, 32, 32, 30)
    sgrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
    sgrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.95)')
    sgrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.45)')
    sgrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
    sctx.fillStyle = sgrad
    sctx.fillRect(0, 0, 64, 64)
    sctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    sctx.lineWidth = 2.0
    sctx.beginPath()
    sctx.moveTo(32, 4); sctx.lineTo(32, 60)
    sctx.moveTo(4, 32); sctx.lineTo(60, 32)
    sctx.stroke()
    const spark = new THREE.CanvasTexture(sparkCanvas)

    // 2. Corona Flare Texture (Soft voluminous magical aura with hot center)
    const coronaCanvas = document.createElement('canvas')
    coronaCanvas.width = 128
    coronaCanvas.height = 128
    const cctx = coronaCanvas.getContext('2d')!
    const cgrad = cctx.createRadialGradient(64, 64, 4, 64, 64, 62)
    cgrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
    cgrad.addColorStop(0.18, 'rgba(255, 255, 255, 0.85)')
    cgrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.45)')
    cgrad.addColorStop(0.75, 'rgba(255, 255, 255, 0.15)')
    cgrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
    cctx.fillStyle = cgrad
    cctx.fillRect(0, 0, 128, 128)
    const corona = new THREE.CanvasTexture(coronaCanvas)

    // 3. Shockwave Ring Texture (Thin sharp outer rim with feathered inner glow)
    const shockCanvas = document.createElement('canvas')
    shockCanvas.width = 128
    shockCanvas.height = 128
    const skctx = shockCanvas.getContext('2d')!
    skctx.clearRect(0, 0, 128, 128)
    skctx.beginPath()
    skctx.arc(64, 64, 52, 0, Math.PI * 2)
    skctx.lineWidth = 8
    skctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
    skctx.stroke()
    skctx.beginPath()
    skctx.arc(64, 64, 50, 0, Math.PI * 2)
    skctx.lineWidth = 14
    skctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    skctx.stroke()
    const shockwave = new THREE.CanvasTexture(shockCanvas)

    // 4. Hexagonal Energy Shield Pattern (1024x1024 crisp glowing crystal cells - Matching Sketch 4)
    const hexCanvas = document.createElement('canvas')
    hexCanvas.width = 1024
    hexCanvas.height = 1024
    const hctx = hexCanvas.getContext('2d')!
    hctx.clearRect(0, 0, 1024, 1024)

    const hexR = 56
    const hexH = hexR * Math.sqrt(3)
    const drawHex = (cx: number, cy: number, cellIdx: number) => {
      hctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        const x = cx + hexR * Math.cos(angle)
        const y = cy + hexR * Math.sin(angle)
        if (i === 0) hctx.moveTo(x, y)
        else hctx.lineTo(x, y)
      }
      hctx.closePath()

      // High transparency iridescent crystal prism sheen inside each cell (Matching Sketch 4)
      const hexGrad = hctx.createRadialGradient(cx, cy, 2, cx, cy, hexR)
      const prismColors = [
        'rgba(70, 235, 255, 0.08)',
        'rgba(90, 255, 190, 0.07)',
        'rgba(180, 130, 255, 0.06)',
        'rgba(255, 230, 130, 0.05)',
      ]
      hexGrad.addColorStop(0, prismColors[cellIdx % prismColors.length])
      hexGrad.addColorStop(0.65, 'rgba(70, 235, 255, 0.02)')
      hexGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      hctx.fillStyle = hexGrad
      hctx.fill()

      // Radiant sharp glowing electric cyan border (slender & crisp)
      hctx.strokeStyle = 'rgba(78, 243, 255, 0.95)'
      hctx.lineWidth = 1.8
      hctx.stroke()
    }

    let cellCount = 0
    for (let y = -hexH; y < 1024 + hexH; y += hexH) {
      for (let x = -hexR * 3; x < 1024 + hexR * 3; x += hexR * 3) {
        drawHex(x, y, cellCount++)
        drawHex(x + hexR * 1.5, y + hexH / 2, cellCount++)
      }
    }
    const shieldHex = new THREE.CanvasTexture(hexCanvas)
    shieldHex.wrapS = THREE.RepeatWrapping
    shieldHex.wrapT = THREE.RepeatWrapping
    shieldHex.repeat.set(3.2, 1.6)

    // 5. Explosion Starburst Texture (256x256 grayscale for dynamic spell tinting)
    const expCanvas = document.createElement('canvas')
    expCanvas.width = 256
    expCanvas.height = 256
    const ectx = expCanvas.getContext('2d')!
    ectx.clearRect(0, 0, 256, 256)
    const egrad = ectx.createRadialGradient(128, 128, 4, 128, 128, 124)
    egrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
    egrad.addColorStop(0.18, 'rgba(255, 255, 255, 0.95)')
    egrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.60)')
    egrad.addColorStop(0.78, 'rgba(255, 255, 255, 0.20)')
    egrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ectx.fillStyle = egrad
    ectx.fillRect(0, 0, 256, 256)
    ectx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
    for (let r = 0; r < 24; r++) {
      const angle = (r / 24) * Math.PI * 2
      const len = 75 + Math.random() * 50
      ectx.lineWidth = (r % 2 === 0) ? 3.5 : 1.8
      ectx.beginPath()
      ectx.moveTo(128, 128)
      ectx.lineTo(128 + Math.cos(angle) * len, 128 + Math.sin(angle) * len)
      ectx.stroke()
    }
    const explosion = new THREE.CanvasTexture(expCanvas)

    // 6. Volumetric Beam Trail Segment Texture (128x128)
    const trailCanvas = document.createElement('canvas')
    trailCanvas.width = 128
    trailCanvas.height = 128
    const tctx = trailCanvas.getContext('2d')!
    const tgrad = tctx.createRadialGradient(64, 64, 4, 64, 64, 60)
    tgrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
    tgrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.82)')
    tgrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.32)')
    tgrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
    tctx.fillStyle = tgrad
    tctx.fillRect(0, 0, 128, 128)
    const beamTrail = new THREE.CanvasTexture(trailCanvas)

    // 6b. Continuous Longitudinal Laser Plasma Beam Texture (128x512)
    const laserCanvas = document.createElement('canvas')
    laserCanvas.width = 128
    laserCanvas.height = 512
    const lzctx = laserCanvas.getContext('2d')!
    lzctx.clearRect(0, 0, 128, 512)

    // Base horizontal laser gradient across width (X)
    const lzGrad = lzctx.createLinearGradient(0, 0, 128, 0)
    lzGrad.addColorStop(0, 'rgba(255, 0, 20, 0)')
    lzGrad.addColorStop(0.18, 'rgba(255, 20, 40, 0.28)')
    lzGrad.addColorStop(0.36, 'rgba(255, 30, 60, 0.85)')
    lzGrad.addColorStop(0.46, 'rgba(255, 220, 230, 0.98)')
    lzGrad.addColorStop(0.50, 'rgba(255, 255, 255, 1.0)') // Searing white core line
    lzGrad.addColorStop(0.54, 'rgba(255, 220, 230, 0.98)')
    lzGrad.addColorStop(0.64, 'rgba(255, 30, 60, 0.85)')
    lzGrad.addColorStop(0.82, 'rgba(255, 20, 40, 0.28)')
    lzGrad.addColorStop(1, 'rgba(255, 0, 20, 0)')
    lzctx.fillStyle = lzGrad
    lzctx.fillRect(0, 0, 128, 512)

    // Add high-frequency electrical plasma streaks along Y
    for (let s = 0; s < 45; s++) {
      const y = Math.random() * 512
      const len = 30 + Math.random() * 90
      const x = 52 + Math.random() * 24
      lzctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
      lzctx.fillRect(x, y, 2 + Math.random() * 3, len)
    }

    const laserBeam = new THREE.CanvasTexture(laserCanvas)
    laserBeam.wrapS = THREE.ClampToEdgeWrapping
    laserBeam.wrapT = THREE.RepeatWrapping
    laserBeam.repeat.set(1, 3)

    // 7. Flame Billboard Texture (128x128)
    const flameCanvas = document.createElement('canvas')
    flameCanvas.width = 128
    flameCanvas.height = 128
    const fctx = flameCanvas.getContext('2d')!
    const fgrad = fctx.createRadialGradient(64, 64, 5, 64, 64, 58)
    fgrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
    fgrad.addColorStop(0.28, 'rgba(255, 225, 110, 0.92)')
    fgrad.addColorStop(0.65, 'rgba(255, 110, 15, 0.65)')
    fgrad.addColorStop(1, 'rgba(255, 40, 0, 0)')
    fctx.fillStyle = fgrad
    fctx.fillRect(0, 0, 128, 128)
    fctx.strokeStyle = 'rgba(255, 255, 200, 0.75)'
    fctx.lineWidth = 2.5
    fctx.beginPath()
    for (let a = 0; a < Math.PI * 4; a += 0.2) {
      const dist = 5 + a * 4
      fctx.lineTo(64 + Math.cos(a) * dist, 64 + Math.sin(a) * dist)
    }
    fctx.stroke()
    const flame = new THREE.CanvasTexture(flameCanvas)

    // 8. Fire Spiral Vortex Texture (512x512 Organic Flame Vortex - Matching Incendio Sketch 2)
    const spiralCanvas = document.createElement('canvas')
    spiralCanvas.width = 512
    spiralCanvas.height = 512
    const spctx = spiralCanvas.getContext('2d')!
    spctx.clearRect(0, 0, 512, 512)

    // Warm golden-amber center core
    const spGrad = spctx.createRadialGradient(256, 256, 8, 256, 256, 240)
    spGrad.addColorStop(0, 'rgba(255, 240, 150, 0.95)')
    spGrad.addColorStop(0.18, 'rgba(255, 175, 30, 0.85)')
    spGrad.addColorStop(0.48, 'rgba(235, 75, 10, 0.50)')
    spGrad.addColorStop(0.78, 'rgba(180, 25, 0, 0.15)')
    spGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    spctx.fillStyle = spGrad
    spctx.fillRect(0, 0, 512, 512)

    // Draw 6 organic swirling Archimedean flame arms curling inwards
    for (let arm = 0; arm < 6; arm++) {
      const startAngle = (arm * Math.PI) / 3
      spctx.save()
      spctx.beginPath()
      for (let t = 0; t < Math.PI * 2.6; t += 0.06) {
        const rad = 14 + Math.pow(t, 1.45) * 45
        const ang = startAngle + t
        const wobble = Math.sin(t * 8.0) * (3 + t * 4)
        const x = 256 + Math.cos(ang) * (rad + wobble)
        const y = 256 + Math.sin(ang) * (rad + wobble)
        if (t === 0) spctx.moveTo(x, y)
        else spctx.lineTo(x, y)
      }
      spctx.strokeStyle = arm % 2 === 0 ? 'rgba(255, 225, 110, 0.88)' : 'rgba(255, 115, 20, 0.75)'
      spctx.lineWidth = arm % 2 === 0 ? 16 : 22
      spctx.lineCap = 'round'
      spctx.stroke()

      // Inner intense core vein of the flame arm
      spctx.beginPath()
      for (let t = 0.2; t < Math.PI * 2.2; t += 0.08) {
        const rad = 14 + Math.pow(t, 1.45) * 45
        const ang = startAngle + t
        const x = 256 + Math.cos(ang) * rad
        const y = 256 + Math.sin(ang) * rad
        if (t === 0.2) spctx.moveTo(x, y)
        else spctx.lineTo(x, y)
      }
      spctx.strokeStyle = 'rgba(255, 250, 200, 0.92)'
      spctx.lineWidth = 6
      spctx.stroke()
      spctx.restore()
    }
    const fireSpiral = new THREE.CanvasTexture(spiralCanvas)

    // 9. Billowing Dark Volumetric Smoke Texture (256x256 Multi-Lobed Charcoal - Matching Incendio Sketch 2)
    const smokeCanvas = document.createElement('canvas')
    smokeCanvas.width = 256
    smokeCanvas.height = 256
    const smctx = smokeCanvas.getContext('2d')!
    smctx.clearRect(0, 0, 256, 256)
    const smokeLobes = [
      { x: 128, y: 128, r: 105, alpha: 0.90 },
      { x: 95, y: 105, r: 85, alpha: 0.82 },
      { x: 165, y: 115, r: 90, alpha: 0.78 },
      { x: 110, y: 160, r: 88, alpha: 0.80 },
      { x: 155, y: 150, r: 82, alpha: 0.75 },
    ]
    smokeLobes.forEach(lobe => {
      const grad = smctx.createRadialGradient(lobe.x, lobe.y, 4, lobe.x, lobe.y, lobe.r)
      grad.addColorStop(0, `rgba(22, 17, 14, ${lobe.alpha})`)
      grad.addColorStop(0.45, `rgba(18, 14, 11, ${lobe.alpha * 0.75})`)
      grad.addColorStop(0.80, `rgba(12, 9, 7, ${lobe.alpha * 0.30})`)
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      smctx.fillStyle = grad
      smctx.beginPath()
      smctx.arc(lobe.x, lobe.y, lobe.r, 0, Math.PI * 2)
      smctx.fill()
    })
    const smokePuff = new THREE.CanvasTexture(smokeCanvas)

    // 10. Piercing Needle-Sharp Anamorphic Lens Flare Star Texture (512x512 - Matching Stupefy Sketch 3)
    const flareCanvas = document.createElement('canvas')
    flareCanvas.width = 512
    flareCanvas.height = 512
    const flctx = flareCanvas.getContext('2d')!
    flctx.clearRect(0, 0, 512, 512)

    // Compact celestial core bloom
    const flGrad = flctx.createRadialGradient(256, 256, 2, 256, 256, 42)
    flGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
    flGrad.addColorStop(0.25, 'rgba(100, 240, 255, 0.90)')
    flGrad.addColorStop(0.65, 'rgba(0, 140, 255, 0.35)')
    flGrad.addColorStop(1, 'rgba(0, 50, 200, 0)')
    flctx.fillStyle = flGrad
    flctx.beginPath()
    flctx.arc(256, 256, 42, 0, Math.PI * 2)
    flctx.fill()

    // Razor-thin horizontal anamorphic flare ray
    flctx.beginPath()
    flctx.moveTo(0, 256); flctx.lineTo(512, 256)
    flctx.strokeStyle = 'rgba(0, 220, 255, 0.65)'
    flctx.lineWidth = 4.0
    flctx.stroke()
    flctx.beginPath()
    flctx.moveTo(12, 256); flctx.lineTo(500, 256)
    flctx.strokeStyle = 'rgba(255, 255, 255, 0.98)'
    flctx.lineWidth = 1.4
    flctx.stroke()

    // Slender vertical flare ray
    flctx.beginPath()
    flctx.moveTo(256, 32); flctx.lineTo(256, 480)
    flctx.strokeStyle = 'rgba(0, 210, 255, 0.55)'
    flctx.lineWidth = 3.0
    flctx.stroke()
    flctx.beginPath()
    flctx.moveTo(256, 48); flctx.lineTo(256, 464)
    flctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
    flctx.lineWidth = 1.2
    flctx.stroke()

    // Subtle 45-degree diamond glints
    flctx.strokeStyle = 'rgba(0, 220, 255, 0.35)'
    flctx.lineWidth = 1.0
    flctx.beginPath(); flctx.moveTo(120, 120); flctx.lineTo(392, 392); flctx.stroke()
    flctx.beginPath(); flctx.moveTo(392, 120); flctx.lineTo(120, 392); flctx.stroke()
    const anamorphicFlare = new THREE.CanvasTexture(flareCanvas)

    // 11. Concentric Water Ripple Shield Target (256x256 - matching Protego sketch 4)
    const ripCanvas = document.createElement('canvas')
    ripCanvas.width = 256
    ripCanvas.height = 256
    const ripctx = ripCanvas.getContext('2d')!
    ripctx.clearRect(0, 0, 256, 256)
    const ripRadii = [25, 50, 75, 100, 120]
    ripRadii.forEach((r, idx) => {
      ripctx.beginPath()
      ripctx.arc(128, 128, r, 0, Math.PI * 2)
      ripctx.strokeStyle = `rgba(100, 245, 255, ${0.9 - idx * 0.15})`
      ripctx.lineWidth = 3.5 - idx * 0.4
      ripctx.stroke()
    })
    const ripGrad = ripctx.createRadialGradient(128, 128, 2, 128, 128, 40)
    ripGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
    ripGrad.addColorStop(0.5, 'rgba(78, 243, 255, 0.75)')
    ripGrad.addColorStop(1, 'rgba(78, 243, 255, 0)')
    ripctx.fillStyle = ripGrad
    ripctx.beginPath()
    ripctx.arc(128, 128, 40, 0, Math.PI * 2)
    ripctx.fill()
    const shieldRippleTarget = new THREE.CanvasTexture(ripCanvas)

    // 12. Runic Magic Circle Texture (512x512 - matching Protego sketch 4 floor array)
    const runeCanvas = document.createElement('canvas')
    runeCanvas.width = 512
    runeCanvas.height = 512
    const rctx = runeCanvas.getContext('2d')!
    rctx.clearRect(0, 0, 512, 512)
    rctx.strokeStyle = 'rgba(78, 243, 255, 0.98)'
    rctx.lineWidth = 4.0
    rctx.beginPath(); rctx.arc(256, 256, 244, 0, Math.PI * 2); rctx.stroke()
    rctx.lineWidth = 2.5
    rctx.beginPath(); rctx.arc(256, 256, 228, 0, Math.PI * 2); rctx.stroke()
    rctx.beginPath(); rctx.arc(256, 256, 175, 0, Math.PI * 2); rctx.stroke()
    rctx.beginPath(); rctx.arc(256, 256, 105, 0, Math.PI * 2); rctx.stroke()
    rctx.beginPath(); rctx.arc(256, 256, 45, 0, Math.PI * 2); rctx.stroke()

    // 24 Runic characters / rays along the outer border
    rctx.lineWidth = 2.2
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12
      const x1 = 256 + Math.cos(a) * 175
      const y1 = 256 + Math.sin(a) * 175
      const x2 = 256 + Math.cos(a) * 228
      const y2 = 256 + Math.sin(a) * 228
      rctx.beginPath()
      rctx.moveTo(x1, y1); rctx.lineTo(x2, y2)
      rctx.stroke()

      // Small runic dots
      const rDotX = 256 + Math.cos(a + Math.PI / 24) * 201
      const rDotY = 256 + Math.sin(a + Math.PI / 24) * 201
      rctx.beginPath()
      rctx.arc(rDotX, rDotY, 4, 0, Math.PI * 2)
      rctx.fillStyle = 'rgba(78, 243, 255, 0.95)'
      rctx.fill()
    }
    const runeCircle = new THREE.CanvasTexture(runeCanvas)

    // 13. Inner Runic Star Ring Texture (256x256)
    const runeInnerCanvas = document.createElement('canvas')
    runeInnerCanvas.width = 256
    runeInnerCanvas.height = 256
    const rictx = runeInnerCanvas.getContext('2d')!
    rictx.clearRect(0, 0, 256, 256)
    rictx.strokeStyle = 'rgba(120, 245, 255, 0.95)'
    rictx.lineWidth = 2.0
    rictx.beginPath(); rictx.arc(128, 128, 100, 0, Math.PI * 2); rictx.stroke()
    rictx.beginPath(); rictx.arc(128, 128, 70, 0, Math.PI * 2); rictx.stroke()
    // 8-pointed magic star
    rictx.beginPath()
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4
      const rOuter = 96
      const rInner = 42
      const xOuter = 128 + Math.cos(a) * rOuter
      const yOuter = 128 + Math.sin(a) * rOuter
      const aMid = a + Math.PI / 8
      const xInner = 128 + Math.cos(aMid) * rInner
      const yInner = 128 + Math.sin(aMid) * rInner
      if (i === 0) rictx.moveTo(xOuter, yOuter)
      else rictx.lineTo(xOuter, yOuter)
      rictx.lineTo(xInner, yInner)
    }
    rictx.closePath()
    rictx.stroke()
    const runeCircleInner = new THREE.CanvasTexture(runeInnerCanvas)

    // 14. Scorched Floor Decal Texture (128x128)
    const scorchCanvas = document.createElement('canvas')
    scorchCanvas.width = 128
    scorchCanvas.height = 128
    const scctx = scorchCanvas.getContext('2d')!
    const scGrad = scctx.createRadialGradient(64, 64, 8, 64, 64, 62)
    scGrad.addColorStop(0, 'rgba(255, 140, 30, 0.95)')
    scGrad.addColorStop(0.35, 'rgba(230, 60, 10, 0.75)')
    scGrad.addColorStop(0.7, 'rgba(40, 10, 5, 0.45)')
    scGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    scctx.fillStyle = scGrad
    scctx.fillRect(0, 0, 128, 128)
    const scorchDecal = new THREE.CanvasTexture(scorchCanvas)

    // 15. Luminous Celestial Star Orb Texture (512x512 - Matching Stupefy Sketch 3)
    const celCanvas = document.createElement('canvas')
    celCanvas.width = 512
    celCanvas.height = 512
    const celctx = celCanvas.getContext('2d')!
    celctx.clearRect(0, 0, 512, 512)

    // Cosmic outer azure glow
    const celGradOuter = celctx.createRadialGradient(256, 256, 12, 256, 256, 245)
    celGradOuter.addColorStop(0, 'rgba(0, 240, 255, 0.95)')
    celGradOuter.addColorStop(0.25, 'rgba(0, 160, 255, 0.80)')
    celGradOuter.addColorStop(0.55, 'rgba(0, 70, 230, 0.35)')
    celGradOuter.addColorStop(0.85, 'rgba(10, 15, 120, 0.10)')
    celGradOuter.addColorStop(1, 'rgba(0, 0, 0, 0)')
    celctx.fillStyle = celGradOuter
    celctx.beginPath()
    celctx.arc(256, 256, 245, 0, Math.PI * 2)
    celctx.fill()

    // Celestial energy tendrils / swirling nebula
    for (let arm = 0; arm < 6; arm++) {
      const aStart = (arm * Math.PI) / 3
      celctx.beginPath()
      for (let t = 0; t < Math.PI * 1.8; t += 0.08) {
        const rad = 20 + t * 45
        const ang = aStart + t
        const x = 256 + Math.cos(ang) * rad
        const y = 256 + Math.sin(ang) * rad
        if (t === 0) celctx.moveTo(x, y)
        else celctx.lineTo(x, y)
      }
      celctx.strokeStyle = 'rgba(120, 245, 255, 0.65)'
      celctx.lineWidth = 14
      celctx.lineCap = 'round'
      celctx.stroke()
    }

    // Brilliant white-cyan celestial star point core
    const celGradCore = celctx.createRadialGradient(256, 256, 2, 256, 256, 48)
    celGradCore.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
    celGradCore.addColorStop(0.35, 'rgba(180, 250, 255, 0.95)')
    celGradCore.addColorStop(0.75, 'rgba(0, 220, 255, 0.70)')
    celGradCore.addColorStop(1, 'rgba(0, 200, 255, 0)')
    celctx.fillStyle = celGradCore
    celctx.beginPath()
    celctx.arc(256, 256, 48, 0, Math.PI * 2)
    celctx.fill()
    const celestialStar = new THREE.CanvasTexture(celCanvas)

    // 17. Ethereal Green Phantom Skull Mist (512x512 - Concept Sketch 4 Voldemort/Dark Mark Skull)
    const skullCanvas = document.createElement('canvas')
    skullCanvas.width = 512
    skullCanvas.height = 512
    const skCtx = skullCanvas.getContext('2d')!
    skCtx.clearRect(0, 0, 512, 512)

    // Soft billowing background fog strictly constrained within a circular radius
    const skBgGrad = skCtx.createRadialGradient(256, 240, 15, 256, 240, 205)
    skBgGrad.addColorStop(0, 'rgba(34, 197, 94, 0.38)')
    skBgGrad.addColorStop(0.4, 'rgba(16, 185, 129, 0.18)')
    skBgGrad.addColorStop(0.75, 'rgba(5, 46, 22, 0.04)')
    skBgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    skCtx.fillStyle = skBgGrad
    skCtx.beginPath()
    skCtx.arc(256, 240, 205, 0, Math.PI * 2)
    skCtx.fill()

    // Paint organic smoke cloud helper
    const paintSkCloud = (x: number, y: number, r: number, alpha: number) => {
      skCtx.save()
      const g = skCtx.createRadialGradient(x, y, r * 0.1, x, y, r)
      g.addColorStop(0, `rgba(180, 240, 210, ${alpha})`)
      g.addColorStop(0.5, `rgba(34, 197, 94, ${alpha * 0.6})`)
      g.addColorStop(1, 'rgba(0, 0, 0, 0)')
      skCtx.fillStyle = g
      skCtx.beginPath()
      skCtx.arc(x, y, r, 0, Math.PI * 2)
      skCtx.fill()
      skCtx.restore()
    }

    // Billowing wisps & clouds rising around cranium
    const skClouds = [
      { x: 190, y: 110, r: 80, a: 0.28 },
      { x: 256, y: 85, r: 95, a: 0.35 },
      { x: 322, y: 110, r: 80, a: 0.28 },
      { x: 140, y: 160, r: 70, a: 0.22 },
      { x: 372, y: 160, r: 70, a: 0.22 },
      { x: 120, y: 220, r: 60, a: 0.20 },
      { x: 392, y: 220, r: 60, a: 0.20 },
      { x: 256, y: 50, r: 75, a: 0.25 },
      { x: 210, y: 40, r: 60, a: 0.20 },
      { x: 302, y: 40, r: 60, a: 0.20 },
    ]
    for (const c of skClouds) paintSkCloud(c.x, c.y, c.r, c.a)

    // Realistic Anatomical Dark Mark Skull Contour
    const traceAnatomicalSkull = (c: CanvasRenderingContext2D) => {
      c.beginPath()
      c.moveTo(256, 115) // cranium apex
      c.bezierCurveTo(340, 115, 385, 160, 380, 215)
      c.bezierCurveTo(375, 235, 355, 245, 350, 255)
      c.bezierCurveTo(375, 270, 370, 295, 350, 310)
      c.bezierCurveTo(335, 322, 325, 335, 310, 355)
      c.bezierCurveTo(285, 375, 227, 375, 202, 355)
      c.bezierCurveTo(187, 335, 177, 322, 162, 310)
      c.bezierCurveTo(142, 295, 137, 270, 162, 255)
      c.bezierCurveTo(157, 245, 137, 235, 132, 215)
      c.bezierCurveTo(127, 160, 172, 115, 256, 115)
      c.closePath()
    }

    // Base Volumetric Skull Fog
    skCtx.save()
    traceAnatomicalSkull(skCtx)
    skCtx.fillStyle = 'rgba(16, 185, 129, 0.45)'
    skCtx.filter = 'blur(14px)'
    skCtx.fill()

    traceAnatomicalSkull(skCtx)
    const skullGrad = skCtx.createRadialGradient(256, 210, 25, 256, 230, 165)
    skullGrad.addColorStop(0, 'rgba(235, 255, 245, 0.95)')
    skullGrad.addColorStop(0.35, 'rgba(74, 222, 128, 0.85)')
    skullGrad.addColorStop(0.70, 'rgba(16, 140, 60, 0.65)')
    skullGrad.addColorStop(0.95, 'rgba(5, 50, 20, 0.25)')
    skullGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    skCtx.fillStyle = skullGrad
    skCtx.filter = 'blur(4px)'
    skCtx.fill()

    // Sharp volumetric highlights along cranium, cheekbones and jaw
    skCtx.filter = 'none'
    skCtx.shadowColor = '#00ff44'
    skCtx.shadowBlur = 18
    skCtx.strokeStyle = 'rgba(134, 239, 172, 0.70)'
    skCtx.lineWidth = 3.5
    traceAnatomicalSkull(skCtx)
    skCtx.stroke()
    skCtx.restore()

    // Menacing Angled Hollow Eye Sockets
    skCtx.save()
    skCtx.beginPath()
    skCtx.moveTo(185, 210)
    skCtx.bezierCurveTo(212, 208, 232, 224, 238, 250)
    skCtx.bezierCurveTo(225, 270, 192, 264, 178, 245)
    skCtx.bezierCurveTo(170, 230, 175, 218, 185, 210)
    skCtx.closePath()
    skCtx.fillStyle = '#010802'
    skCtx.shadowColor = '#00ff44'
    skCtx.shadowBlur = 18
    skCtx.fill()

    skCtx.beginPath()
    skCtx.moveTo(327, 210)
    skCtx.bezierCurveTo(300, 208, 280, 224, 274, 250)
    skCtx.bezierCurveTo(287, 270, 320, 264, 334, 245)
    skCtx.bezierCurveTo(342, 230, 337, 218, 327, 210)
    skCtx.closePath()
    skCtx.fillStyle = '#010802'
    skCtx.shadowColor = '#00ff44'
    skCtx.shadowBlur = 18
    skCtx.fill()

    // Searing glowing brow ridge highlights
    skCtx.shadowBlur = 10
    skCtx.strokeStyle = 'rgba(240, 253, 244, 0.95)'
    skCtx.lineWidth = 3.0
    skCtx.beginPath()
    skCtx.moveTo(175, 208)
    skCtx.bezierCurveTo(202, 204, 228, 218, 240, 246)
    skCtx.stroke()
    skCtx.beginPath()
    skCtx.moveTo(337, 208)
    skCtx.bezierCurveTo(310, 204, 284, 218, 272, 246)
    skCtx.stroke()

    // Inverted Piriform Nasal Cavity
    skCtx.beginPath()
    skCtx.moveTo(256, 265)
    skCtx.bezierCurveTo(268, 282, 272, 304, 262, 310)
    skCtx.bezierCurveTo(256, 314, 256, 314, 250, 310)
    skCtx.bezierCurveTo(240, 304, 244, 282, 256, 265)
    skCtx.fillStyle = '#010802'
    skCtx.shadowBlur = 14
    skCtx.fill()
    skCtx.strokeStyle = 'rgba(220, 255, 235, 0.85)'
    skCtx.lineWidth = 2.0
    skCtx.stroke()
    skCtx.restore()

    // Skeletal Teeth & Open Maxilla
    skCtx.save()
    skCtx.beginPath()
    skCtx.ellipse(256, 355, 52, 18, 0, 0, Math.PI * 2)
    skCtx.fillStyle = '#010802'
    skCtx.shadowColor = '#00ff44'
    skCtx.shadowBlur = 14
    skCtx.fill()

    const teethX = [218, 229, 241, 256, 271, 283, 294]
    for (let i = 0; i < teethX.length; i++) {
      const x = teethX[i]
      const len = (i === 1 || i === 5) ? 24 : 18
      skCtx.beginPath()
      skCtx.moveTo(x - 4.5, 344)
      skCtx.lineTo(x, 344 + len)
      skCtx.lineTo(x + 4.5, 344)
      skCtx.fillStyle = 'rgba(240, 253, 244, 0.95)'
      skCtx.shadowColor = '#00ff44'
      skCtx.shadowBlur = 8
      skCtx.fill()
      skCtx.strokeStyle = 'rgba(74, 222, 128, 0.85)'
      skCtx.lineWidth = 1.2
      skCtx.stroke()
    }

    const bTeethX = [224, 236, 248, 264, 276, 288]
    for (let i = 0; i < bTeethX.length; i++) {
      const x = bTeethX[i]
      const len = (i === 2 || i === 3) ? 16 : 12
      skCtx.beginPath()
      skCtx.moveTo(x - 4, 370)
      skCtx.lineTo(x, 370 - len)
      skCtx.lineTo(x + 4, 370)
      skCtx.fillStyle = 'rgba(220, 252, 231, 0.9)'
      skCtx.fill()
    }
    skCtx.restore()

    for (let j = 0; j < 7; j++) {
      paintSkCloud(215 + j * 14, 385 + (j % 2) * 15, 35, 0.25)
    }
    const skullMist = new THREE.CanvasTexture(skullCanvas)

    // 18. Emerald Wand Starburst Flash Texture (256x256 - Concept Sketch 4 Wand Tip Flash)
    const starburstCanvas = document.createElement('canvas')
    starburstCanvas.width = 256
    starburstCanvas.height = 256
    const sbCtx = starburstCanvas.getContext('2d')!
    sbCtx.clearRect(0, 0, 256, 256)

    const sbGrad = sbCtx.createRadialGradient(128, 128, 5, 128, 128, 120)
    sbGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
    sbGrad.addColorStop(0.20, 'rgba(110, 231, 183, 0.85)')
    sbGrad.addColorStop(0.50, 'rgba(34, 197, 94, 0.45)')
    sbGrad.addColorStop(0.85, 'rgba(5, 46, 22, 0.12)')
    sbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    sbCtx.fillStyle = sbGrad
    sbCtx.beginPath()
    sbCtx.arc(128, 128, 120, 0, Math.PI * 2)
    sbCtx.fill()

    sbCtx.save()
    sbCtx.translate(128, 128)
    const spikeDefs = [
      { count: 4, len: 120, w: 9, rot: 0, col: '#ffffff' },
      { count: 4, len: 95, w: 7, rot: Math.PI / 4, col: '#a3e635' },
      { count: 8, len: 65, w: 4, rot: Math.PI / 8, col: '#4ade80' },
    ]
    for (const def of spikeDefs) {
      for (let i = 0; i < def.count; i++) {
        sbCtx.save()
        sbCtx.rotate(def.rot + i * (Math.PI * 2 / def.count))
        sbCtx.beginPath()
        sbCtx.moveTo(0, -def.w * 0.5)
        sbCtx.lineTo(def.len, 0)
        sbCtx.lineTo(0, def.w * 0.5)
        sbCtx.closePath()
        const sGrad = sbCtx.createLinearGradient(0, 0, def.len, 0)
        sGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
        sGrad.addColorStop(0.35, def.col)
        sGrad.addColorStop(1, 'rgba(34, 197, 94, 0)')
        sbCtx.fillStyle = sGrad
        sbCtx.shadowColor = '#00ff44'
        sbCtx.shadowBlur = 10
        sbCtx.fill()
        sbCtx.restore()
      }
    }
    sbCtx.restore()

    sbCtx.save()
    sbCtx.fillStyle = '#ffffff'
    sbCtx.beginPath()
    sbCtx.arc(128, 128, 14, 0, Math.PI * 2)
    sbCtx.shadowColor = '#ffffff'
    sbCtx.shadowBlur = 15
    sbCtx.fill()
    sbCtx.restore()
    const emeraldStarburst = new THREE.CanvasTexture(starburstCanvas)

    // 19. Dark Shadow Smoke Shroud (256x256 - Voldemort Shadow Aura in Sketch 4)
    const darkCanvas = document.createElement('canvas')
    darkCanvas.width = 256
    darkCanvas.height = 256
    const dkCtx = darkCanvas.getContext('2d')!

    const darkBlobs = [
      { x: 128, y: 128, r: 110, a: 0.85 },
      { x: 105, y: 115, r: 85, a: 0.75 },
      { x: 150, y: 120, r: 80, a: 0.75 },
      { x: 120, y: 145, r: 90, a: 0.70 },
      { x: 145, y: 150, r: 75, a: 0.65 },
      { x: 95, y: 135, r: 70, a: 0.60 },
    ]
    for (const b of darkBlobs) {
      const g = dkCtx.createRadialGradient(b.x, b.y, b.r * 0.15, b.x, b.y, b.r)
      g.addColorStop(0, `rgba(15, 8, 20, ${b.a})`)
      g.addColorStop(0.55, `rgba(25, 12, 32, ${b.a * 0.65})`)
      g.addColorStop(0.85, `rgba(10, 5, 15, ${b.a * 0.25})`)
      g.addColorStop(1, 'rgba(0, 0, 0, 0)')
      dkCtx.fillStyle = g
      dkCtx.beginPath()
      dkCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      dkCtx.fill()
    }
    // Load textures with error handling - fallback to canvas textures if external assets fail
    const texLoader = new THREE.TextureLoader()
    const loadTextureWithFallback = (url: string, fallbackTexture: THREE.CanvasTexture): THREE.Texture => {
      try {
        const loaded = texLoader.load(url)
        console.log(`✨ [Hogwarts 2.5D] Loaded texture: ${url}`)
        return loaded
      } catch (e) {
        console.warn(`⚠️ [Hogwarts 2.5D] Failed to load ${url}, using fallback`)
        return fallbackTexture
      }
    }
    const blenderSkull = texLoader.load('/assets/dueling/phantom_skull_spectral.png', undefined, undefined, () => skullMist)
    const blenderDarkSmoke = texLoader.load('/assets/dueling/voldemort_dark_shroud.png', undefined, undefined, () => new THREE.CanvasTexture(darkCanvas))
    const blenderStarburst = texLoader.load('/assets/dueling/wand_starburst_flash.png', undefined, undefined, () => emeraldStarburst)
    const blenderFireSpiral = loadTextureWithFallback('/assets/dueling/blender_fire_spiral.png', fireSpiral)
    const blenderVolumetricSmoke = loadTextureWithFallback('/assets/dueling/blender_dark_smoke.png', smokePuff)
    const blenderMagmaScorch = loadTextureWithFallback('/assets/dueling/blender_magma_scorch.png', scorchDecal)
    const blenderAvadaRune = loadTextureWithFallback('/assets/dueling/blender_avada_rune.png', runeCircle)

    // Load 3D Phantom Skull with proper error handling and fallback
    this.gltfLoader.load(
      '/assets/dueling/phantom_skull.glb',
      (gltf) => {
        this.phantomSkull3DTemplate = gltf.scene
        this.phantomSkull3DTemplate.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh
            m.material = new THREE.MeshBasicMaterial({
              color: 0x00ff44,
              transparent: true,
              opacity: 0.94,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            })
          }
        })
        console.log('✨ [Blender Production] 3D Phantom Skull Model Loaded!')
      },
      undefined,
      (error) => {
        console.warn('⚠️ [Hogwarts 2.5D] Failed to load phantom_skull.glb, using procedural fallback:', error)
        this.phantomSkull3DTemplate = null
      }
    )

    // Load 3D Incendio Fire Vortex Model (Blender Python Pipeline)
    this.gltfLoader.load(
      '/assets/dueling/incendio_vortex.glb',
      (gltf) => {
        this.incendioVortex3DTemplate = gltf.scene
        this.incendioVortex3DTemplate.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh
            m.material = new THREE.MeshBasicMaterial({
              color: 0xff6600,
              transparent: true,
              opacity: 0.95,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            })
          }
        })
        console.log('🔥 [Blender Production] 3D Incendio Fire Vortex Model Loaded!')
      },
      undefined,
      (error) => {
        console.warn('⚠️ [Hogwarts 2.5D] Failed to load incendio_vortex.glb:', error)
        this.incendioVortex3DTemplate = null
      }
    )

    // Load 3D Patronus Silver Stag Model (Blender Python Pipeline)
    this.gltfLoader.load(
      '/assets/dueling/patronus_stag.glb',
      (gltf) => {
        this.patronusStag3DTemplate = gltf.scene
        this.patronusStag3DTemplate.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh
            m.material = new THREE.MeshStandardMaterial({
              color: 0xecfeff,
              emissive: 0x38bdf8,
              emissiveIntensity: 0.42,
              roughness: 0.20,
              metalness: 0.25,
              transparent: true,
              opacity: 0.94,
            })
          }
        })
        console.log('🦌 [Blender Production] 3D Patronus Stag Model Loaded!')
      },
      undefined,
      (error) => {
        console.warn('⚠️ [Hogwarts 2.5D] Failed to load patronus_stag.glb, using fallback:', error)
        this.patronusStag3DTemplate = null
      }
    )

    // Load 3D Avada Death Phantom (Pure Anatomical Skull matching lightning beam)
    this.gltfLoader.load(
      '/assets/dueling/avada_death_phantom.glb',
      (gltf) => {
        this.avadaDeathPhantom3DTemplate = gltf.scene
        this.avadaDeathPhantom3DTemplate.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh
            if (m.name.includes('SoulEyes')) {
              m.material = new THREE.MeshBasicMaterial({
                color: 0xecfeff,        // White-hot incandescent mint (matches beam core)
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
              })
            } else if (m.name.includes('PlasmaConduit') || m.name.includes('Conduit')) {
              m.material = new THREE.MeshBasicMaterial({
                color: 0xecfeff,        // White-hot plasma core leaping out of agape mouth
                transparent: true,
                opacity: 0.98,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
              })
            } else if (m.name.includes('SkullVoid') || m.name.includes('Void')) {
              m.material = new THREE.MeshBasicMaterial({
                color: 0x000603,        // Sinister pitch black cavity void for eye & nose holes
                depthWrite: true,
              })
            } else {
              m.material = new THREE.MeshStandardMaterial({
                color: 0x012e1b,        // Deep sinister emerald viridian base matching lightning sheath
                emissive: 0x047857,     // Saturated Glowing Emerald Emission matching lightning sheath
                emissiveIntensity: 1.85, // Electric luminescence matching the curse storm
                roughness: 0.42,        // Bone texture (not shiny plastic or translucent glass)
                metalness: 0.08,
                depthWrite: true,
              })
            }
          }
        })
        console.log('💀 [Blender Production] Pure Anatomical Avada Phantom Skull Loaded (Lightning Matched)!')
      },
      undefined,
      (error) => {
        console.warn('⚠️ [Hogwarts 2.5D] Failed to load avada_death_phantom.glb, using fallback:', error)
        this.avadaDeathPhantom3DTemplate = null
      }
    )

    // Initialize & Load Authentic 3D GLB Characters for Player & Opponent
    this.setupCharacterSelectionUI()
    this.loadDuelistCharacter(this.selectedPlayerChar, false)
    this.loadDuelistCharacter(this.selectedOpponentChar, true)

    this.vfxTextures = {
      spark,
      corona,
      shockwave,
      shieldHex,
      explosion,
      flame,
      fireSpiral: blenderFireSpiral,
      smokePuff: blenderVolumetricSmoke,
      anamorphicFlare,
      shieldRippleTarget,
      beamTrail,
      laserBeam,
      runeCircle,
      runeCircleInner,
      scorchDecal: blenderMagmaScorch,
      celestialStar,
      skullMist: blenderSkull,
      emeraldStarburst: blenderStarburst,
      darkSmoke: blenderDarkSmoke,
      avadaRune: blenderAvadaRune,
    }
    this.vfx8Textures = createVfx8SpellTextures()
  }

  // =========================================================================
  // DYNAMIC 6-CHARACTER ROSTER & GLB LOADER SYSTEM
  // =========================================================================

  /**
   * Loads and equips any of the 6 authentic 3D GLB duelist models into the arena.
   */
  public async loadDuelistCharacter(charId: string, isOpponent: boolean): Promise<THREE.Group | null> {
    const char = getCharacter(charId) || (isOpponent ? getCharacter('voldemort') : getCharacter('harry'))

    try {
      // 1. Retrieve or load template from GLTF cache
      let template = this.charGlbCache.get(char.id)
      if (!template) {
        const gltf = await this.gltfLoader.loadAsync(`/assets/dueling/${char.modelFile}`)
        template = gltf.scene
        this.charGlbCache.set(char.id, template)
      }

      // 2. Clone model instance
      const model = template.clone(true)
      model.name = isOpponent ? `Opponent_${char.id}` : `Player_${char.id}`

      // 3. Setup PBR double-sided materials, shadows, and eye/accent glows
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          m.castShadow = true
          m.receiveShadow = true
          if (m.material) {
            const rawMat = Array.isArray(m.material) ? m.material[0] : m.material
            const mat = rawMat.clone() as THREE.MeshStandardMaterial
            mat.side = THREE.DoubleSide
            m.material = mat

            const matName = (mat.name || '').toLowerCase()
            const meshName = (m.name || '').toLowerCase()

            if (matName.includes('cape') || meshName === 'object_3' || matName.includes('cloth')) {
              mat.roughness = 0.90
              mat.metalness = 0.05
            } else if (matName.includes('head') || matName.includes('hand')) {
              mat.roughness = 0.28
              mat.metalness = 0.02
            } else if (matName.includes('glass')) {
              mat.roughness = 0.12
              mat.metalness = 0.85
            }

            // Character special accents
            if (char.id === 'moody' && (matName.includes('blue') || matName.includes('eye'))) {
              mat.emissive = new THREE.Color(0x00d2d3)
              mat.emissiveIntensity = 2.0
            } else if ((char.id === 'voldemort' || char.id === 'death_eater') && (matName.includes('red') || matName.includes('glow'))) {
              mat.emissive = new THREE.Color(0xff2222)
              mat.emissiveIntensity = 2.2
            }
          }
        }
      })

      // 4. Calculate dimensions & normalize scale
      const box = new THREE.Box3().setFromObject(model)
      const size = new THREE.Vector3()
      box.getSize(size)

      // Opponents are placed further down the runway (scale ~1.45)
      // Players stand in the foreground (scale ~1.25)
      const targetHeight = isOpponent ? 1.45 : 1.25
      const s = targetHeight / (size.y || 1)
      model.scale.set(s, s, s)

      // Align feet onto table surface (y = 0 in parent group)
      const updatedBox = new THREE.Box3().setFromObject(model)
      const baseY = -updatedBox.min.y
      model.position.y = baseY

      // 5. Create and attach custom wand to character's right hand
      const { wandGroup, wandTip } = createCharacterWand(char)
      model.add(wandGroup)

      // 6. Slot into Scene & Transfer Lights/Auras
      if (isOpponent) {
        if (this.opponentCharGLB && this.opponentGroup) {
          if (this.opponentLight && this.voldemortWandTip) this.voldemortWandTip.remove(this.opponentLight)
          if (this.dracoAuraSprite && this.voldemortWandTip) this.voldemortWandTip.remove(this.dracoAuraSprite)
          this.disposeGroup(this.opponentCharGLB)
          this.opponentGroup.remove(this.opponentCharGLB)
        }
        this.opponentCharGLB = model
        this.voldemort2005GLB = model // alias for compatibility
        this.opponentCharBaseY = baseY
        this.voldemort2005BaseY = baseY // alias
        this.voldemortWandTip = wandTip

        if (this.opponentLight) wandTip.add(this.opponentLight)
        if (this.dracoAuraSprite) wandTip.add(this.dracoAuraSprite)

        this.opponentGroup.add(model)
        if (this.opponentLego?.group) this.opponentLego.group.visible = false

        // Update Opponent HUD
        this.updateOpponentHUD(char)
        console.log(`⚔️ [Character Roster] Opponent 3D GLB Activated: ${char.name} (${char.house})`)
      } else {
        if (this.playerCharGLB && this.playerGroup) {
          if (this.wandLight && this.playerWandTip) this.playerWandTip.remove(this.wandLight)
          if (this.wandMuzzleSprite && this.playerWandTip) this.playerWandTip.remove(this.wandMuzzleSprite)
          this.disposeGroup(this.playerCharGLB)
          this.playerGroup.remove(this.playerCharGLB)
        }
        this.playerCharGLB = model
        this.playerCharBaseY = baseY
        this.playerWandTip = wandTip

        if (this.wandLight) wandTip.add(this.wandLight)
        if (this.wandMuzzleSprite) wandTip.add(this.wandMuzzleSprite)

        this.playerGroup.add(model)
        if (this.playerLego?.group) this.playerLego.group.visible = false

        // Update Player HUD
        this.updatePlayerHUD(char)
        console.log(`🧙‍♂️ [Character Roster] Player 3D GLB Activated: ${char.name} (${char.house})`)
      }

      return model
    } catch (err) {
      console.warn(`⚠️ [Character Roster] Failed to load GLB for ${char.name}, keeping procedural fallback:`, err)
      return null
    }
  }

  private updatePlayerHUD(char: DuelistCharacter) {
    const nameEl = document.getElementById('player-display-name')
    if (nameEl) nameEl.textContent = char.name

    const houseBadge = document.querySelector('.player-info .house-tag-badge') as HTMLElement
    if (houseBadge) {
      houseBadge.className = `house-tag-badge ${char.houseTagClass}`
      houseBadge.textContent = char.house
    }

    const houseIcon = document.querySelector('.player-frame .avatar-house-icon')
    if (houseIcon) houseIcon.textContent = char.houseIcon

    const avatarImg = document.querySelector('.player-frame .hud-avatar-img') as HTMLImageElement
    if (avatarImg) avatarImg.src = char.avatarUrl

    const levelBadge = document.querySelector('.player-bracket .avatar-level-badge')
    if (levelBadge) levelBadge.textContent = char.badgeText
  }

  private updateOpponentHUD(char: DuelistCharacter) {
    const nameEl = document.getElementById('enemy-display-name')
    if (nameEl) nameEl.textContent = char.name

    const houseBadge = document.querySelector('.enemy-info .house-tag-badge') as HTMLElement
    if (houseBadge) {
      houseBadge.className = `house-tag-badge ${char.houseTagClass}`
      houseBadge.textContent = char.house
    }

    const houseIcon = document.querySelector('.enemy-frame .avatar-house-icon')
    if (houseIcon) houseIcon.textContent = char.houseIcon

    const avatarImg = document.querySelector('.enemy-frame .hud-avatar-img') as HTMLImageElement
    if (avatarImg) avatarImg.src = char.avatarUrl

    const levelBadge = document.querySelector('.enemy-bracket .avatar-level-badge')
    if (levelBadge) levelBadge.textContent = char.badgeText
  }

  public getOpponentName(): string {
    return getCharacter(this.selectedOpponentChar).name
  }

  public getPlayerName(): string {
    return getCharacter(this.selectedPlayerChar).name
  }

  private setupCharacterSelectionUI() {
    // Generate initial gauntlet roster
    this.gauntletRoster = generateGauntletRoster(this.selectedPlayerChar)
    this.renderGauntletLadderPreview()

    // 1. Player selection in Main Menu
    const playerBtns = document.querySelectorAll('#player-char-selector .char-thumb-btn')
    playerBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const charId = (btn as HTMLElement).dataset.char
        if (!charId) return
        this.selectedPlayerChar = charId
        this.audio.playClick()

        // Highlight active button
        playerBtns.forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')

        // Regenerate Gauntlet with new player chosen
        this.gauntletRoster = generateGauntletRoster(this.selectedPlayerChar)
        this.renderGauntletLadderPreview()

        // Sync modal selector
        document.querySelectorAll('#ingame-player-selector .char-thumb-btn').forEach((b) => {
          b.classList.toggle('active', (b as HTMLElement).dataset.char === charId)
        })

        // Update preview header in menu
        this.updateMenuMatchupPreview()
      })
    })

    // 2. Reroll 5 Gauntlet Opponents Button
    document.getElementById('btn-reroll-gauntlet')?.addEventListener('click', (e) => {
      e.stopPropagation()
      this.audio.playClick()
      this.gauntletRoster = generateGauntletRoster(this.selectedPlayerChar)
      this.renderGauntletLadderPreview()
      this.updateMenuMatchupPreview()
      this.showCombatNumber('🎲 ĐÃ ĐỔI 5 ĐỐI THỦ RANDOM!', window.innerWidth / 2, window.innerHeight * 0.45, 'parry')
    })

    // 3. In-Game Character Swap Modal Controls
    const swapModal = document.getElementById('char-swap-modal')
    const openSwapBtn = document.getElementById('btn-open-char-swap')
    const closeSwapBtn = document.getElementById('btn-close-char-swap')
    const applySwapBtn = document.getElementById('btn-apply-char-swap')

    openSwapBtn?.addEventListener('click', () => {
      this.audio.playClick()
      swapModal?.classList.remove('hidden')
    })

    closeSwapBtn?.addEventListener('click', () => {
      this.audio.playClick()
      swapModal?.classList.add('hidden')
    })

    // In-game modal buttons
    document.querySelectorAll('#ingame-player-selector .char-thumb-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const charId = (btn as HTMLElement).dataset.char
        if (!charId) return
        this.selectedPlayerChar = charId
        this.audio.playClick()
        document.querySelectorAll('#ingame-player-selector .char-thumb-btn').forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')
        playerBtns.forEach((b) => b.classList.toggle('active', (b as HTMLElement).dataset.char === charId))
        this.gauntletRoster = generateGauntletRoster(this.selectedPlayerChar)
        this.renderGauntletLadderPreview()
        this.updateMenuMatchupPreview()
      })
    })

    document.querySelectorAll('#ingame-opponent-selector .char-thumb-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const charId = (btn as HTMLElement).dataset.char
        if (!charId) return
        this.selectedOpponentChar = charId
        this.audio.playClick()
        document.querySelectorAll('#ingame-opponent-selector .char-thumb-btn').forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')
        this.updateMenuMatchupPreview()
      })
    })

    applySwapBtn?.addEventListener('click', async () => {
      this.audio.playSpellCast('protego')
      swapModal?.classList.add('hidden')
      await this.loadDuelistCharacter(this.selectedPlayerChar, false)
      await this.loadDuelistCharacter(this.selectedOpponentChar, true)
      const p = getCharacter(this.selectedPlayerChar)
      const o = getCharacter(this.selectedOpponentChar)
      this.showCombatNumber(`ĐÃ CHỌN: ${p.name} VS ${o.name}`, window.innerWidth / 2, window.innerHeight * 0.45, 'crit')
    })

    this.updateMenuMatchupPreview()
  }

  public renderGauntletLadderPreview() {
    const container = document.getElementById('gauntlet-ladder-preview')
    if (!container) return
    container.innerHTML = ''

    this.gauntletRoster.forEach((entry) => {
      const isBoss = entry.tier.tierNumber === 5
      const card = document.createElement('div')
      card.className = `gauntlet-step-card ${isBoss ? 'boss-step-card' : ''}`
      card.title = `${entry.tier.tierBadge}: ${entry.char.fullName}\n- Sát thương: ${(entry.tier.damageMultiplier * 100).toFixed(0)}%\n- Tốc độ bùa: ${entry.tier.telegraphTime}s\n- Lời khuyên: ${entry.tier.advice}`

      card.innerHTML = `
        <span class="gauntlet-step-badge">ẢI ${entry.tier.tierNumber}${isBoss ? ' · BOSS' : ''}</span>
        <div class="gauntlet-avatar-wrap">
          <img src="${entry.char.avatarUrl}" class="gauntlet-avatar-img" alt="${entry.char.name}" />
          <span class="gauntlet-house-icon">${entry.char.houseIcon}</span>
        </div>
        <span class="gauntlet-char-name">${entry.char.name.split(' ')[0]}</span>
        <span class="gauntlet-tier-pill ${entry.tier.tagClass}">${entry.tier.tierName}</span>
        <span class="gauntlet-hp-pill">❤️ ${entry.tier.maxHp} HP</span>
      `
      container.appendChild(card)
    })
  }

  public renderOpenLobbyRooms(rooms: any[]) {
    const badge = document.getElementById('open-rooms-count-badge')
    const container = document.getElementById('open-rooms-list-container')
    if (!container) return

    if (badge) {
      badge.textContent = `${rooms.length} phòng`
    }

    if (!rooms || rooms.length === 0) {
      container.innerHTML = `
        <div class="open-rooms-empty" id="open-rooms-empty-state">
          <span>Chưa có phòng nào đang mở. Bấm "Mở Phòng" để tạo phòng đón bạn bè!</span>
        </div>
      `
      return
    }

    container.innerHTML = ''
    rooms.forEach((r) => {
      const card = document.createElement('div')
      card.className = 'open-room-card'
      
      const spellsHtml = (r.hostDeck || [])
        .slice(0, 4)
        .map((s: string) => `<span class="open-room-spell-mini-badge">${s}</span>`)
        .join('')

      card.innerHTML = `
        <div class="open-room-left">
          <span class="open-room-code-tag">${r.code}</span>
          <span class="open-room-host-tag">🧙 Chủ phòng: <strong>${r.hostName || 'Harry Potter'}</strong></span>
          <div class="open-room-spells-preview">${spellsHtml}</div>
        </div>
        <button class="btn-quick-duel" data-code="${r.code}">
          ⚡ THÁCH ĐẤU
        </button>
      `

      const duelBtn = card.querySelector('.btn-quick-duel')
      duelBtn?.addEventListener('click', async () => {
        this.audio.playClick()
        if (!this.deckManager.isDeckComplete()) {
          this.audio.playDrawFizzle()
          this.showCombatNumber('⚠️ CHƯA ĐỦ 4 BÙA!', window.innerWidth / 2, window.innerHeight * 0.4, 'mana')
          this.showToast('VUI LÒNG CHỌN ĐỦ 4 BÙA!', 'Bạn cần chọn đủ 4 bùa trước khi thách đấu phòng này!')
          return
        }
        const input = document.getElementById('input-join-code') as HTMLInputElement
        if (input) input.value = r.code
        const joinBtn = document.getElementById('btn-join-room')
        joinBtn?.click()
      })

      container.appendChild(card)
    })
  }

  private updateMenuMatchupPreview() {
    const p = getCharacter(this.selectedPlayerChar)
    const bossEntry = this.gauntletRoster && this.gauntletRoster.length > 0
      ? this.gauntletRoster[this.gauntletRoster.length - 1]
      : null
    const boss = bossEntry ? bossEntry.char : getCharacter(this.selectedOpponentChar)

    const titleEl = document.getElementById('menu-match-title')
    if (titleEl) titleEl.textContent = `${p.name} · CHINH PHỤC 5 ẢI`

    const subEl = document.getElementById('menu-match-sub')
    if (subEl) subEl.textContent = `Hạ gục 5 đối thủ ngẫu nhiên · Trùm tối thượng: ${boss.name} (Ải 5)`

    const pFace = document.getElementById('menu-player-face') as HTMLImageElement
    if (pFace) pFace.src = p.avatarUrl
    const pBadge = document.getElementById('menu-player-name-badge')
    if (pBadge) pBadge.textContent = p.name.split(' ')[0]

    const oFace = document.getElementById('menu-enemy-face') as HTMLImageElement
    if (oFace) oFace.src = boss.avatarUrl
    const oBadge = document.getElementById('menu-enemy-name-badge')
    if (oBadge) oBadge.textContent = `BOSS: ${boss.name.split(' ')[0]}`

    const pLabel = document.getElementById('label-player-char-name')
    if (pLabel) pLabel.textContent = `${p.name} (${p.house})`
  }

  private buildParticleSystem() {
    const maxParticles = 400
    this.vfxGeoPositions = new Float32Array(maxParticles * 3)
    this.vfxGeoColors = new Float32Array(maxParticles * 3)

    for (let i = 0; i < maxParticles; i++) {
      this.vfxGeoPositions[i * 3] = 9999
      this.vfxGeoPositions[i * 3 + 1] = 9999
      this.vfxGeoPositions[i * 3 + 2] = 9999

      this.vfxGeoColors[i * 3] = 1
      this.vfxGeoColors[i * 3 + 1] = 1
      this.vfxGeoColors[i * 3 + 2] = 1

      this.vfxParticles.push({
        active: false,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        r: 1,
        g: 1,
        b: 1,
        size: 0.16,
        life: 0,
        maxLife: 1,
        drag: 0.95,
        gravity: 0.5,
      })
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(this.vfxGeoPositions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(this.vfxGeoColors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      map: this.vfxTextures.spark,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    this.vfxPointsMesh = new THREE.Points(geo, mat)
    this.scene.add(this.vfxPointsMesh)

    // Build Shockwave Rings Pool (8 instances)
    const shockGeo = new THREE.RingGeometry(0.1, 0.45, 32)
    for (let s = 0; s < 8; s++) {
      const shockMat = new THREE.MeshBasicMaterial({
        map: this.vfxTextures.shockwave,
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const mesh = new THREE.Mesh(shockGeo, shockMat)
      mesh.visible = false
      this.scene.add(mesh)
      this.shockwavePool.push({
        mesh,
        active: false,
        progress: 0,
        duration: 0.45,
        maxRadius: 2.2,
      })
    }

    // Build Detonation Explosion Pool (4 instances)
    for (let d = 0; d < 4; d++) {
      const expMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.explosion,
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const sprite = new THREE.Sprite(expMat)
      sprite.visible = false
      this.scene.add(sprite)
      this.detonationPool.push({
        sprite,
        active: false,
        progress: 0,
        duration: 0.35,
        maxScale: 4.5,
      })
    }
  }

  private triggerScreenFlash(colorHex: number) {
    const flash = document.getElementById('impact-flash')
    if (!flash) return
    const col = new THREE.Color(colorHex)
    flash.style.background = `radial-gradient(circle at center, rgba(255, 255, 255, 0.95) 0%, rgba(${Math.round(col.r * 255)}, ${Math.round(col.g * 255)}, ${Math.round(col.b * 255)}, 0.65) 45%, rgba(0, 0, 0, 0.5) 100%)`
    flash.classList.remove('flash-active')
    void flash.offsetWidth
    flash.classList.add('flash-active')
    setTimeout(() => flash.classList.remove('flash-active'), 85)
  }

  private spawnParticle(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    r: number,
    g: number,
    b: number,
    size: number,
    maxLife: number,
    drag: number = 0.94,
    gravity: number = 0.5
  ) {
    const p = this.vfxParticles.find(item => !item.active)
    if (!p) return
    p.active = true
    p.x = x
    p.y = y
    p.z = z
    p.vx = vx
    p.vy = vy
    p.vz = vz
    p.r = r
    p.g = g
    p.b = b
    p.size = size
    p.life = maxLife
    p.maxLife = maxLife
    p.drag = drag
    p.gravity = gravity
  }

  private spawnMuzzleVfx(origin: THREE.Vector3, colorHex: number, count = 16) {
    const color = new THREE.Color(colorHex)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const speed = 1.2 + Math.random() * 2.5
      this.spawnParticle(
        origin.x + (Math.random() - 0.5) * 0.08,
        origin.y + (Math.random() - 0.5) * 0.08,
        origin.z + (Math.random() - 0.5) * 0.08,
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.sin(phi) * Math.sin(theta) + 0.3,
        speed * Math.cos(phi),
        color.r,
        color.g,
        color.b,
        0.10 + Math.random() * 0.06,
        0.35 + Math.random() * 0.35,
        0.92,
        0.6
      )
    }
  }

  private cleanupProjectile(p: Projectile) {
    p.active = false
    this.scene.remove(p.mesh)
    if (p.groundScorchMesh) this.scene.remove(p.groundScorchMesh)
    if (p.groundReflectionRibbon) this.scene.remove(p.groundReflectionRibbon)
    if (p.floorReflectionGroup) this.scene.remove(p.floorReflectionGroup)
    if (p.extraLights) {
      for (const l of p.extraLights) this.scene.remove(l)
    }
    if (p.beamHolding) {
      if (this.playerLego) {
        this.playerLego.isChanneling = false
        this.playerLego.isTargetChanneling = false
      }
      if (this.opponentLego) {
        this.opponentLego.isChanneling = false
        this.opponentLego.isTargetChanneling = false
      }
    }
  }

  // --- CROWD CONTROL (CC) ENGINE: SYMMETRICAL APPLIED TO BOTH SIDES ---
  public applyCrowdControlToPlayer(
    ccType: 'petrificus' | 'stupefy' | 'expelliarmus' | 'obliviate' | 'immobulus' | 'levicorpus',
    duration: number,
    displayName: string
  ) {
    const time = this.clock?.getElapsedTime() ?? (performance.now() * 0.001)
    this.playerStunnedUntil = time + duration
    this.playerCCType = ccType
    this.playerCCName = displayName
    this.playerCCDuration = duration

    // 1. Minifigure 3D Animation Dispatch
    if (this.playerLego) {
      if (ccType === 'petrificus' || ccType === 'immobulus') {
        this.playerLego.setPetrified(true)
      } else if (ccType === 'stupefy' || ccType === 'levicorpus') {
        this.playerLego.setStunned(true)
      } else if (ccType === 'obliviate') {
        this.playerLego.setConfused(true)
      } else if (ccType === 'expelliarmus') {
        this.playerLego.isDisarmed = true
        this.playerLego.setWandVisible(false)
      }
    }

    // 2. Clear Active Gesture Drawing
    this.drawnPoints = []
    if (this.wandCtx) {
      this.wandCtx.clearRect(0, 0, this.wandCanvas.width, this.wandCanvas.height)
    }

    // 3. UI Display
    this.showPlayerCCStatusUI(ccType, displayName, duration)
    this.audio.playDrawFizzle()
  }

  public applyCrowdControlToOpponent(
    ccType: 'petrificus' | 'stupefy' | 'expelliarmus' | 'obliviate' | 'immobulus' | 'levicorpus',
    duration: number,
    displayName: string
  ) {
    const time = this.clock?.getElapsedTime() ?? (performance.now() * 0.001)
    this.enemyStunnedUntil = time + duration
    this.enemyCCType = ccType
    this.enemyCCName = displayName
    this.enemyCCDuration = duration

    // 1. Interrupt any in-progress enemy cast immediately
    this.enemyCurrentCast = null
    this.opponentCastProgress = 0
    document.getElementById('enemy-telegraph')?.classList.add('hidden')
    if (this.dracoAuraSprite) this.dracoAuraSprite.material.opacity = 0

    // 2. Minifigure 3D Animation Dispatch
    if (this.opponentLego) {
      if (ccType === 'petrificus' || ccType === 'immobulus') {
        this.opponentLego.setPetrified(true)
      } else if (ccType === 'stupefy' || ccType === 'levicorpus') {
        this.opponentLego.setStunned(true)
      } else if (ccType === 'obliviate') {
        this.opponentLego.setConfused(true)
      } else if (ccType === 'expelliarmus') {
        this.opponentLego.isDisarmed = true
        this.opponentLego.setWandVisible(false)
      }
    }

    // 3. UI Display
    this.showEnemyCCStatusUI(ccType, displayName, duration)
  }

  private showPlayerCCStatusUI(ccType: string, displayName: string, duration: number) {
    const overlay = document.getElementById('player-cc-overlay')
    if (!overlay) return

    overlay.classList.remove('hidden', 'cc-theme-ice', 'cc-theme-stun', 'cc-theme-disarm', 'cc-theme-confuse')
    let icon = '🔒'
    let themeClass = 'cc-theme-ice'
    let desc = 'Đũa phép bị khóa cứng · Không thể thi triển phép thuật!'

    if (ccType === 'petrificus' || ccType === 'immobulus') {
      icon = '🧊'
      themeClass = 'cc-theme-ice'
      desc = 'Toàn thân đông cứng như đá · Bị khóa đũa phép & bất động hoàn toàn!'
    } else if (ccType === 'stupefy' || ccType === 'levicorpus') {
      icon = '⚡'
      themeClass = 'cc-theme-stun'
      desc = 'Bị trúng bùa choáng · Choáng váng và khóa niệm phép!'
    } else if (ccType === 'expelliarmus') {
      icon = '🪄'
      themeClass = 'cc-theme-disarm'
      desc = 'Đũa phép bị tước văng đi · Không thể xuất bùa cho đến khi đũa bay trở lại!'
    } else if (ccType === 'obliviate') {
      icon = '🌀'
      themeClass = 'cc-theme-confuse'
      desc = 'Bị xóa ký ức & lú lẫn · Mất phương hướng và khóa đũa phép!'
    }

    overlay.classList.add(themeClass)
    const iconEl = document.getElementById('player-cc-icon')
    if (iconEl) iconEl.textContent = icon
    const titleEl = document.getElementById('player-cc-title')
    if (titleEl) titleEl.textContent = displayName.toUpperCase()
    const descEl = document.getElementById('player-cc-desc')
    if (descEl) descEl.textContent = desc
    const timerEl = document.getElementById('player-cc-timer-val')
    if (timerEl) timerEl.textContent = `${duration.toFixed(1)}s`
    const barEl = document.getElementById('player-cc-progress-bar')
    if (barEl) barEl.style.width = '100%'

    this.updatePromptStatus('fail', `⚠️ BỊ KHỐNG CHẾ (${displayName.toUpperCase()})! ĐŨA PHÉP ĐANG BỊ KHÓA`)
  }

  private updatePlayerCCUI(remain: number) {
    const timerEl = document.getElementById('player-cc-timer-val')
    if (timerEl) timerEl.textContent = `${Math.max(0, remain).toFixed(1)}s`
    const barEl = document.getElementById('player-cc-progress-bar')
    if (barEl && this.playerCCDuration > 0) {
      const pct = Math.max(0, Math.min(100, (remain / this.playerCCDuration) * 100))
      barEl.style.width = `${pct}%`
    }
  }

  private hidePlayerCCUI() {
    const overlay = document.getElementById('player-cc-overlay')
    if (overlay) overlay.classList.add('hidden')
  }

  private showEnemyCCStatusUI(ccType: string, displayName: string, duration: number) {
    const statusEl = document.getElementById('enemy-cc-status')
    if (!statusEl) return

    statusEl.classList.remove('hidden', 'cc-theme-ice', 'cc-theme-stun', 'cc-theme-disarm', 'cc-theme-confuse')
    let icon = '🧊'
    let themeClass = 'cc-theme-ice'
    let desc = 'Đối thủ bị ngắt niệm chiêu & khóa đũa phép'

    if (ccType === 'petrificus' || ccType === 'immobulus') {
      icon = '🧊'
      themeClass = 'cc-theme-ice'
      desc = 'Đối thủ bị trói cứng như đá · Bất động & khóa xuất chiêu'
    } else if (ccType === 'stupefy' || ccType === 'levicorpus') {
      icon = '⚡'
      themeClass = 'cc-theme-stun'
      desc = 'Đối thủ bị choáng váng · Ngắt chiêu thức & ngả nghiêng'
    } else if (ccType === 'expelliarmus') {
      icon = '🪄'
      themeClass = 'cc-theme-disarm'
      desc = 'Đối thủ bị tước đũa phép · Tay không thể xuất chiêu'
    } else if (ccType === 'obliviate') {
      icon = '🌀'
      themeClass = 'cc-theme-confuse'
      desc = 'Đối thủ bị xóa ký ức · Mất phương hướng & ngắt niệm chú'
    }

    statusEl.classList.add(themeClass)
    const iconEl = document.getElementById('enemy-cc-icon')
    if (iconEl) iconEl.textContent = icon
    const titleEl = document.getElementById('enemy-cc-title')
    if (titleEl) titleEl.textContent = `${displayName.toUpperCase()} (${duration.toFixed(1)}s)`
    const descEl = document.getElementById('enemy-cc-desc')
    if (descEl) descEl.textContent = desc
    const timerEl = document.getElementById('enemy-cc-timer-val')
    if (timerEl) timerEl.textContent = `${duration.toFixed(1)}s`
    const barEl = document.getElementById('enemy-cc-progress-bar')
    if (barEl) barEl.style.width = '100%'
  }

  private updateEnemyCCUI(remain: number) {
    const timerEl = document.getElementById('enemy-cc-timer-val')
    if (timerEl) timerEl.textContent = `${Math.max(0, remain).toFixed(1)}s`
    const barEl = document.getElementById('enemy-cc-progress-bar')
    if (barEl && this.enemyCCDuration > 0) {
      const pct = Math.max(0, Math.min(100, (remain / this.enemyCCDuration) * 100))
      barEl.style.width = `${pct}%`
    }
  }

  private hideEnemyCCUI() {
    const statusEl = document.getElementById('enemy-cc-status')
    if (statusEl) statusEl.classList.add('hidden')
  }

  private updateCooldownsUI(time: number) {
    // 1. Real-time updates for Spell Cooldown Dock
    const dockSlots = document.querySelectorAll('.dock-slot')
    dockSlots.forEach((slot) => {
      const sKey = (slot as HTMLElement).dataset.spell
      if (!sKey) return
      const spell = SPELL_DECK[sKey]
      if (!spell) return

      const cdUntil = this.playerCooldowns[sKey] || 0
      const remain = cdUntil - time
      const timerEl = slot.querySelector('.dock-cd-timer')
      const sweepEl = slot.querySelector('.dock-cd-sweep') as HTMLElement | null

      if (remain > 0) {
        slot.classList.add('is-cooldown')
        const progressPct = Math.min(100, Math.max(0, (remain / (spell.cooldown || 3.0)) * 100))
        if (timerEl) {
          timerEl.textContent = remain >= 10 ? `${remain.toFixed(0)}s` : `${remain.toFixed(1)}s`
        }
        if (sweepEl) {
          sweepEl.style.height = `${progressPct}%`
        }
      } else {
        if (slot.classList.contains('is-cooldown')) {
          slot.classList.remove('is-cooldown')
          slot.classList.add('dock-slot-ready')
          setTimeout(() => slot.classList.remove('dock-slot-ready'), 600)
        }
        if (timerEl && timerEl.textContent !== '') {
          timerEl.textContent = ''
        }
        if (sweepEl && sweepEl.style.height !== '0%') {
          sweepEl.style.height = '0%'
        }
      }

      // Check mana pool readiness
      if (this.playerMana < spell.manaCost) {
        slot.classList.add('is-out-of-mana')
      } else {
        slot.classList.remove('is-out-of-mana')
      }
    })

    // 2. Real-time updates for Spell Grimoire Modal (when open)
    const grimoireModal = document.getElementById('spell-grimoire-modal')
    if (grimoireModal && !grimoireModal.classList.contains('hidden')) {
      const grimoireItems = grimoireModal.querySelectorAll('.grimoire-item')
      grimoireItems.forEach((item) => {
        const sKey = (item as HTMLElement).dataset.spell
        if (!sKey) return
        const spell = SPELL_DECK[sKey]
        if (!spell) return

        const cdUntil = this.playerCooldowns[sKey] || 0
        const remain = cdUntil - time
        const liveOverlay = item.querySelector('.grimoire-live-cd') as HTMLElement | null

        if (remain > 0) {
          item.classList.add('is-cooling-down')
          if (liveOverlay) {
            liveOverlay.classList.remove('hidden')
            const numEl = liveOverlay.querySelector('.grimoire-live-cd-num')
            if (numEl) numEl.textContent = `${remain.toFixed(1)}s`
          }
        } else {
          item.classList.remove('is-cooling-down')
          if (liveOverlay && !liveOverlay.classList.contains('hidden')) {
            liveOverlay.classList.add('hidden')
          }
        }

        // Highlight equipped vs unequipped in multiplayer mode
        if (this.gameMode === 'multiplayer') {
          if (this.selectedMultiplayerSpells.includes(sKey)) {
            item.classList.add('is-multi-equipped')
            item.classList.remove('is-multi-unequipped')
          } else {
            item.classList.remove('is-multi-equipped')
            item.classList.add('is-multi-unequipped')
          }
        } else {
          item.classList.remove('is-multi-equipped')
          item.classList.remove('is-multi-unequipped')
        }
      })
    }
  }

  private disarmDuelist(isOpponent: boolean) {
    const duelist = isOpponent ? this.opponentLego : this.playerLego
    if (!duelist) return

    // Apply CC lockout
    if (isOpponent) {
      this.applyCrowdControlToOpponent('expelliarmus', 2.4, 'TƯỚC ĐŨA PHÉP')
    } else {
      this.applyCrowdControlToPlayer('expelliarmus', 2.4, 'TƯỚC ĐŨA PHÉP')
    }

    // 1. Minifigure enters shocked disarmed posture (arms open, head back, empty hands)
    duelist.isDisarmed = true
    duelist.setWandVisible(false)

    // 2. Exact wand hand position
    const origin = isOpponent
      ? (this.opponentGroup ? this.opponentGroup.position.clone().add(new THREE.Vector3(0.18, 0.78, 0)) : this.getDracoWandWorldPos())
      : this.getHarryWandWorldPos()

    // 3. Launch tumbling 3D wand with realistic physics arc
    this.spawnDisarmedWand(origin, isOpponent)

    // 4. Return wand after 2.4 seconds with sparkling whoosh
    setTimeout(() => {
      if (duelist) {
        duelist.setWandVisible(true)
        duelist.isDisarmed = false
        const handPos = isOpponent
          ? (this.opponentGroup ? this.opponentGroup.position.clone().add(new THREE.Vector3(0.18, 0.78, 0)) : this.getDracoWandWorldPos())
          : this.getHarryWandWorldPos()
        for (let s = 0; s < 14; s++) {
          this.spawnParticle(
            handPos.x + (Math.random() - 0.5) * 0.22,
            handPos.y + (Math.random() - 0.5) * 0.22,
            handPos.z + (Math.random() - 0.5) * 0.22,
            (Math.random() - 0.5) * 1.6,
            0.6 + Math.random() * 1.8,
            (Math.random() - 0.5) * 1.6,
            1.0, 0.88, 0.25,
            0.12, 0.35, 0.9, 0
          )
        }
      }
    }, 2400)
  }

  private spawnDisarmedWand(origin: THREE.Vector3, isOpponent: boolean) {
    const wandGroup = new THREE.Group()

    const wandMat = new THREE.MeshStandardMaterial({
      color: isOpponent ? 0xedebe6 : 0x3d2112, // Voldemort's bone-white yew vs Harry's dark holly
      roughness: 0.32,
      metalness: 0.12,
    })

    // Rounded Pommel
    const pommelGeo = new THREE.SphereGeometry(0.016, 12, 12)
    const pommel = new THREE.Mesh(pommelGeo, wandMat)
    wandGroup.add(pommel)

    // Turned Handle Grip
    const gripGeo = new THREE.CylinderGeometry(0.011, 0.015, 0.09, 14)
    gripGeo.translate(0, 0.045, 0)
    const grip = new THREE.Mesh(gripGeo, wandMat)
    wandGroup.add(grip)

    // Tapered Wand Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.005, 0.011, 0.28, 16)
    shaftGeo.translate(0, 0.23, 0)
    const shaft = new THREE.Mesh(shaftGeo, wandMat)
    wandGroup.add(shaft)

    // Glowing Wand Tip
    const tipGeo = new THREE.SphereGeometry(0.008, 8, 8)
    const tipMat = new THREE.MeshBasicMaterial({
      color: isOpponent ? 0x00ff88 : 0xff3b30,
    })
    const tip = new THREE.Mesh(tipGeo, tipMat)
    tip.position.set(0, 0.37, 0)
    wandGroup.add(tip)

    // Glowing Golden Sparkler Sprite attached to flying wand
    const wandSparkMat = new THREE.SpriteMaterial({
      map: this.vfxTextures.spark,
      color: 0xfbbf24,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    })
    const wandSpark = new THREE.Sprite(wandSparkMat)
    wandSpark.scale.set(0.32, 0.32, 1)
    wandSpark.position.set(0, 0.37, 0)
    wandGroup.add(wandSpark)

    wandGroup.position.copy(origin)
    this.scene.add(wandGroup)

    const dirZ = isOpponent ? 1.8 : -1.8
    
    // Cap disarmed wands to prevent unbounded array growth
    if (this.disarmedWands.length >= HogwartsSinglePlayerGame.MAX_DISARMED_WANDS) {
      const oldest = this.disarmedWands.shift()
      if (oldest) {
        this.scene.remove(oldest.mesh)
        this.disposeGroup(oldest.mesh as THREE.Group)
      }
    }
    
    this.disarmedWands.push({
      mesh: wandGroup,
      vel: new THREE.Vector3((Math.random() - 0.5) * 1.5, 5.4, dirZ),
      rotVel: new THREE.Vector3(18.0, 8.0, 14.0),
      life: 2.4,
    })
  }

  private spawnImpactExplosion(origin: THREE.Vector3, colorHex: number, isShield = false, spellName = 'generic') {
    const color = new THREE.Color(colorHex)
    const count = isShield ? 70 : (spellName === 'incendio' ? 85 : 65)

    // Flash shield mesh if deflection
    if (isShield) {
      if (origin.z > -1 && this.playerShieldMesh) {
        ;(this.playerShieldMesh.material as THREE.MeshBasicMaterial).opacity = 1.0
        if (this.playerShieldRing) (this.playerShieldRing.material as THREE.MeshBasicMaterial).opacity = 1.0
        if (this.playerShieldRing2) (this.playerShieldRing2.material as THREE.MeshBasicMaterial).opacity = 1.0
      } else if (origin.z <= -1 && this.enemyShieldMesh) {
        ;(this.enemyShieldMesh.material as THREE.MeshBasicMaterial).opacity = 1.0
        if (this.enemyShieldRing) (this.enemyShieldRing.material as THREE.MeshBasicMaterial).opacity = 1.0
        if (this.enemyShieldRing2) (this.enemyShieldRing2.material as THREE.MeshBasicMaterial).opacity = 1.0
      }
    }

    // 1. Blinding Detonation Fireball Blast Sprite (Skipped for confringo and expecto_patronum)
    if (spellName !== 'confringo' && spellName !== 'expecto_patronum') {
      const det = this.detonationPool.find(item => !item.active)
      if (det) {
        det.active = true
        det.progress = 0
        det.duration = isShield ? 0.38 : (spellName === 'incendio' ? 0.52 : (spellName === 'stupefy' ? 0.42 : 0.35))
        det.maxScale = isShield ? 4.8 : (spellName === 'incendio' ? 5.8 : (spellName === 'stupefy' ? 4.8 : 4.5))
        det.sprite.position.copy(origin)
        det.sprite.scale.set(0.6, 0.6, 1)
        det.sprite.material.color.setHex(colorHex)
        det.sprite.material.opacity = 1.0
        det.sprite.visible = true
      }
    }

    // 2. Violent Screen Flash Overlay (Warm incendiary orange for Confringo)
    if (spellName === 'confringo') {
      this.triggerScreenFlash(0xff5500)
    } else if (spellName !== 'expecto_patronum') {
      this.triggerScreenFlash(colorHex)
    }
    
    // 2b. Bloom flash for magical impact glow
    const bloomIntensity = spellName === 'avadakedavra' ? 2.5 : 
                          spellName === 'incendio' ? 2.0 : 
                          spellName === 'confringo' ? 1.6 :
                          spellName === 'expecto_patronum' ? 0.65 :
                          spellName === 'expelliarmus' ? 1.2 :
                          isShield ? 1.5 : 1.8
    if (bloomIntensity > 0) {
      this.triggerBloomFlash(bloomIntensity, 0.32)
    }

    // 3. Cinematic Sub-Bass Impact Boom
    this.audio.playImpactBoom(colorHex, isShield ? 'protego' : spellName)

    // 4. Concussive Screen Rumble Trauma
    this.triggerScreenShake()
    this.camRecoil = Math.max(this.camRecoil, isShield ? 0.42 : (spellName === 'confringo' ? 0.52 : 0.35))

    // 5. Dedicated Hall Illumination Blast (Intense warm firelight for confringo)
    if (this.impactLight) {
      this.impactLight.position.copy(origin)
      this.impactLight.color.setHex(spellName === 'confringo' ? 0xff5500 : colorHex)
      this.impactLight.intensity = isShield ? 30.0 : (spellName === 'confringo' ? 32.0 : (spellName === 'expecto_patronum' ? 5.0 : (spellName === 'expelliarmus' ? 8.0 : 25.0)))
    }

    // 6. Concussive Shockwave Rings Tailored Per Spell
    if (isShield) {
      // Parry deflection shockwave
      this.spawnShockwave(origin, colorHex, 3.6, 0.45)
    } else if (spellName === 'stupefy') {
      // Sonic concentric rings expanding to 4.8m across hall
      this.spawnShockwave(origin, 0xffea00, 4.8, 0.65)
      this.spawnShockwave(new THREE.Vector3(origin.x, -0.80, origin.z), 0x00f0ff, 4.5, 0.60)
    } else if (spellName === 'incendio') {
      // Fiery blast ring on ground
      this.spawnShockwave(new THREE.Vector3(origin.x, -0.80, origin.z), 0xff4500, 4.2, 0.65)
      this.spawnShockwave(origin, 0xffbb00, 3.4, 0.50)
    } else if (spellName === 'sectumsempra') {
      // Sectumsempra Blood-cleaving Laceration Shockwaves (Matching Concept Sketch)
      this.spawnShockwave(origin, 0x8b0000, 4.6, 0.45)
      this.spawnShockwave(origin, 0xff1e38, 3.4, 0.35)
      this.spawnShockwave(new THREE.Vector3(origin.x, -0.80, origin.z), 0x550000, 3.8, 0.40)
    } else if (spellName === 'avadakedavra') {
      // Avada Kedavra: Deep Emerald Apocalyptic Shockwaves & Table Runes
      this.spawnShockwave(origin, 0x047857, 5.2, 0.55)
      this.spawnShockwave(origin, 0x059669, 4.0, 0.45)
      this.spawnShockwave(new THREE.Vector3(origin.x, -0.80, origin.z), 0x02593d, 4.8, 0.50)
      this.spawnShockwave(origin, 0xecfeff, 2.5, 0.30)
    } else if (spellName === 'confringo') {
      // Confringo has its dedicated 3D Ground Shockwave Ring in spawnConfringoBlast,
      // skipping camera-facing billboard shockwave rings to avoid washing out the visual!
    } else if (spellName === 'expecto_patronum') {
      // Expecto Patronum: Pure silvery celestial stardust dissipation - STRICTLY NO CIRCULAR RINGS!
      for (let s = 0; s < 45; s++) {
        const spreadX = (Math.random() - 0.5) * 3.5
        const spreadY = (Math.random() - 0.2) * 2.5
        const spreadZ = (Math.random() - 0.5) * 3.5
        this.spawnParticle(
          origin.x, origin.y + 0.4, origin.z,
          spreadX, spreadY, spreadZ,
          0.85, 0.95, 1.0,
          0.20, 0.65, 0.92, 0.1
        )
      }
    } else {
      // Expelliarmus electric burst
      this.spawnShockwave(origin, 0xff1e38, 3.8, 0.45)
      this.spawnShockwave(origin, 0xffffff, 2.8, 0.35)
      this.spawnShockwave(new THREE.Vector3(origin.x, -0.80, origin.z), 0xff1e38, 3.2, 0.40)
    }

    // 7. Shrapnel / Embers / Ricochet Deflection Sparks
    if (isShield) {
      // 360° Deflection fan of ricochet sparks spraying backward toward the attacker!
      const backwardZ = origin.z < -2 ? 1 : -1
      for (let i = 0; i < count; i++) {
        const spreadX = (Math.random() - 0.5) * 4.5
        const spreadY = (Math.random() - 0.2) * 3.5
        const spreadZ = backwardZ * (3.5 + Math.random() * 5.0)
        this.spawnParticle(
          origin.x,
          origin.y,
          origin.z,
          spreadX,
          spreadY,
          spreadZ,
          color.r + (Math.random() - 0.5) * 0.2,
          color.g + (Math.random() - 0.5) * 0.2,
          color.b + (Math.random() - 0.5) * 0.2,
          0.18 + Math.random() * 0.12,
          0.50 + Math.random() * 0.45,
          0.92,
          1.2
        )
      }
    } else if (spellName === 'sectumsempra') {
      // Arterial Blood Spray Fountain (120-degree cutting fan with dripping blood droplets)
      for (let i = 0; i < 95; i++) {
        const theta = Math.random() * Math.PI * 2
        const speed = 2.5 + Math.random() * 6.5
        const isDark = Math.random() < 0.35
        this.spawnParticle(
          origin.x,
          origin.y,
          origin.z,
          Math.cos(theta) * speed,
          1.5 + Math.random() * 4.5,
          Math.sin(theta) * speed,
          isDark ? 0.45 : 1.0,
          isDark ? 0.04 : 0.12,
          isDark ? 0.04 : 0.12,
          0.24 + Math.random() * 0.16,
          0.65 + Math.random() * 0.45,
          0.92,
          2.6 // Heavy blood droplets fall down with gravity
        )
      }
    } else if (spellName === 'confringo') {
      // Violent Radial Magma Shrapnel & Concussive Blast Sparks
      for (let i = 0; i < 110; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const speed = 3.5 + Math.random() * 8.5
        const isWhiteHot = Math.random() < 0.25
        const isRedMagma = Math.random() < 0.50
        this.spawnParticle(
          origin.x,
          origin.y,
          origin.z,
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.abs(Math.sin(phi) * Math.sin(theta)) * speed + 1.2,
          Math.cos(phi) * speed,
          isWhiteHot ? 1.0 : (isRedMagma ? 0.95 : 1.0),
          isWhiteHot ? 0.95 : (isRedMagma ? 0.25 : 0.65),
          isWhiteHot ? 0.80 : 0.05,
          0.25 + Math.random() * 0.18,
          0.70 + Math.random() * 0.55,
          0.94,
          2.2
        )
      }
    } else if (spellName === 'incendio') {
      // Fiery volcanic fountain erupting upward with black smoke
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2
        const speed = 2.0 + Math.random() * 5.5
        this.spawnParticle(
          origin.x,
          origin.y,
          origin.z,
          Math.cos(theta) * speed,
          3.5 + Math.random() * 4.5,
          Math.sin(theta) * speed,
          1.0,
          0.45 + Math.random() * 0.45,
          0.05,
          0.22 + Math.random() * 0.14,
          0.65 + Math.random() * 0.55,
          0.94,
          -0.8 // Embers drift upward
        )
      }
    } else {
      // Expelliarmus & Stupefy sparks
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const speed = 2.5 + Math.random() * 6.5
        this.spawnParticle(
          origin.x,
          origin.y,
          origin.z,
          speed * Math.sin(phi) * Math.cos(theta),
          speed * Math.sin(phi) * Math.sin(theta) + 0.8,
          speed * Math.cos(phi),
          color.r + (Math.random() - 0.5) * 0.2,
          color.g + (Math.random() - 0.5) * 0.2,
          color.b + (Math.random() - 0.5) * 0.2,
          0.16 + Math.random() * 0.10,
          0.50 + Math.random() * 0.50,
          0.91,
          1.5
        )
      }
    }
  }

  private spawnShockwave(pos: THREE.Vector3, colorHex: number, maxRadius = 1.6, duration = 0.45) {
    const sw = this.shockwavePool.find(item => !item.active)
    if (!sw) return
    sw.active = true
    sw.progress = 0
    sw.duration = duration
    sw.maxRadius = maxRadius
    sw.mesh.position.copy(pos)
    sw.mesh.quaternion.copy(this.camera.quaternion)
    sw.mesh.scale.set(0.1, 0.1, 1)
    const mat = sw.mesh.material as THREE.MeshBasicMaterial
    mat.color.setHex(colorHex)
    mat.opacity = 0.95
    sw.mesh.visible = true
  }

  private updateVfx(delta: number, _time: number) {
    // 1. Update Particles
    for (let i = 0; i < this.vfxParticles.length; i++) {
      const p = this.vfxParticles[i]
      const idx = i * 3
      if (!p.active) {
        this.vfxGeoPositions[idx] = 9999
        this.vfxGeoPositions[idx + 1] = 9999
        this.vfxGeoPositions[idx + 2] = 9999
        continue
      }

      p.life -= delta
      if (p.life <= 0) {
        p.active = false
        this.vfxGeoPositions[idx] = 9999
        this.vfxGeoPositions[idx + 1] = 9999
        this.vfxGeoPositions[idx + 2] = 9999
        continue
      }

      p.vx *= p.drag
      p.vy *= p.drag
      p.vz *= p.drag
      p.vy -= p.gravity * delta

      p.x += p.vx * delta
      p.y += p.vy * delta
      p.z += p.vz * delta

      this.vfxGeoPositions[idx] = p.x
      this.vfxGeoPositions[idx + 1] = p.y
      this.vfxGeoPositions[idx + 2] = p.z

      const lifeRatio = p.life / p.maxLife
      this.vfxGeoColors[idx] = p.r * lifeRatio
      this.vfxGeoColors[idx + 1] = p.g * lifeRatio
      this.vfxGeoColors[idx + 2] = p.b * lifeRatio
    }

    if (this.vfxPointsMesh) {
      this.vfxPointsMesh.geometry.attributes.position.needsUpdate = true
      this.vfxPointsMesh.geometry.attributes.color.needsUpdate = true
    }

    // 2. Update Shockwaves
    for (const sw of this.shockwavePool) {
      if (!sw.active) continue
      sw.progress += delta / sw.duration
      if (sw.progress >= 1.0) {
        sw.active = false
        sw.mesh.visible = false
        continue
      }

      const currentScale = 0.2 + sw.progress * sw.maxRadius
      sw.mesh.scale.set(currentScale, currentScale, 1)
      const mat = sw.mesh.material as THREE.MeshBasicMaterial
      mat.opacity = (1.0 - sw.progress) * 0.95
    }

    // 3. Update Detonation Explosions
    for (const det of this.detonationPool) {
      if (!det.active) continue
      det.progress += delta / det.duration
      if (det.progress >= 1.0) {
        det.active = false
        det.sprite.visible = false
        continue
      }

      const t = det.progress
      const currentScale = 0.6 + Math.sin(t * Math.PI * 0.5) * det.maxScale
      det.sprite.scale.set(currentScale, currentScale, 1)
      det.sprite.material.opacity = (1.0 - t * t) * 0.95
    }

    // 4. Fade Impact Light
    if (this.impactLight && this.impactLight.intensity > 0) {
      this.impactLight.intensity = Math.max(0, this.impactLight.intensity - delta * 45.0)
    }
  }

  // --- Sectumsempra Unhealable Laceration Wounds (Matching Concept Sketch) ---
  private spawnSectumsempraWoundDecals(targetPos: THREE.Vector3) {
    const woundGroup = new THREE.Group()
    const slashMat = new THREE.MeshBasicMaterial({
      map: this.vfx8Textures.bloodSlash,
      color: 0xff0028,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.98,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const slashAngles = [-0.55, 0.22, -0.85]
    const yOffsets = [0.18, -0.06, -0.28]
    const spans = [1.25, 0.95, 1.15]
    for (let i = 0; i < 3; i++) {
      const slash = new THREE.Mesh(new THREE.PlaneGeometry(spans[i], 0.38), slashMat.clone())
      slash.rotation.z = slashAngles[i]
      slash.position.set((i - 1) * 0.12, yOffsets[i], 0.22)
      woundGroup.add(slash)
    }
    woundGroup.position.copy(targetPos)
    this.scene.add(woundGroup)

    let elapsed = 0
    const duration = 2.4
    const woundTimer = setInterval(() => {
      elapsed += 0.05
      const progress = elapsed / duration
      woundGroup.children.forEach(c => {
        if (c instanceof THREE.Mesh) {
          ;(c.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1.0 - progress) * 0.98)
          c.scale.multiplyScalar(1.004)
        }
      })
      if (progress >= 1.0) {
        clearInterval(woundTimer)
        this.scene.remove(woundGroup)
      }
    }, 50)
  }

  // --- Petrificus Totalus: Canon Full Body-Bind Curse (Direct Target Effect, No Projectile) ---
  public applyPetrificusDirect(targetLego: LegoDuelist) {
    if (!targetLego) return

    const isPlayer = targetLego === this.playerLego
    const time = this.clock?.getElapsedTime() ?? 0
    this.audio.playHitSound()

    // 1. Trigger Canon Full Body-Bind (Limbs lock rigid like a board, original face/robes preserved!)
    targetLego.setPetrified(true)

    // Damage & UI (Rebalanced: 7 DMG + 2.5s lockdown)
    const finalDmg = SPELL_DAMAGE.PETRIFICUS
    if (isPlayer) {
      this.playerHp = Math.max(0, this.playerHp - finalDmg)
      this.updateHpBars()
      this.showCombatNumber('BẠN BỊ HÓA ĐÁ!', window.innerWidth * 0.35, window.innerHeight * 0.45, 'player')
      this.showCombatNumber(`-${finalDmg}`, window.innerWidth * 0.35, window.innerHeight * 0.52, 'player')
      this.applyCrowdControlToPlayer('petrificus', 2.5, 'HÓA ĐÁ TOÀN THÂN')
      if (this.playerHp <= 0) this.handleMatchEnd(false)
    } else {
      this.applyCrowdControlToOpponent('petrificus', 2.5, 'HÓA ĐÁ TOÀN THÂN')
      this.enemyHp = Math.max(0, this.enemyHp - finalDmg)
      this.updateHpBars()
      this.showCombatNumber('PETRIFIED! (TRÓI TOÀN THÂN)', window.innerWidth * 0.68, window.innerHeight * 0.38, 'crit')
      this.showCombatNumber(`-${finalDmg}`, window.innerWidth * 0.68, window.innerHeight * 0.44, 'enemy')
      if (this.enemyHp <= 0) this.handleMatchEnd(true)
    }

    const bindingGroup = new THREE.Group()
    const parentGroup = targetLego === this.playerLego ? this.playerGroup : this.opponentGroup
    parentGroup.add(bindingGroup)
    bindingGroup.position.set(0, 0, 0)

    // Inward Imploding Clamp Shockwave Ring at Waist
    const clampRingGeo = new THREE.RingGeometry(0.75, 0.85, 32)
    const clampRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    })
    const clampRing = new THREE.Mesh(clampRingGeo, clampRingMat)
    clampRing.position.set(0, 0.78, 0)
    clampRing.rotation.x = Math.PI * 0.5
    bindingGroup.add(clampRing)

    // 2. Luminous Ethereal Runic Binding Band Material (Sleek ribbons with crisp runes, no bloom washout)
    const bandMat = new THREE.MeshStandardMaterial({
      map: this.vfx8Textures.stoneBinding,
      color: 0xffffff,
      emissive: 0x0284c7, // Deep sky blue glow
      emissiveIntensity: 0.28,
      roughness: 0.35,
      metalness: 0.25,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    })

    const edgeGlowMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd, // Soft ice cyan-white
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.75,
    })

    // Sleek runic ribbon bands conforming cleanly to Lego duelist silhouette (matching in-game concept)
    const bandConfigs = [
      { y: 0.20, rad: 0.36, tube: 0.015, tiltX: 0.05, tiltZ: -0.04 }, // Ankles
      { y: 0.48, rad: 0.38, tube: 0.016, tiltX: -0.06, tiltZ: 0.04 }, // Knees
      { y: 0.78, rad: 0.38, tube: 0.018, tiltX: 0.04, tiltZ: 0.02 },  // Waist
      { y: 1.12, rad: 0.42, tube: 0.018, tiltX: -0.18, tiltZ: 0.22 }, // Diagonal cross 1
      { y: 1.12, rad: 0.42, tube: 0.018, tiltX: 0.16, tiltZ: -0.20 }, // Diagonal cross 2
    ]

    const bands: THREE.Mesh[] = []
    bandConfigs.forEach(cfg => {
      const torusGeo = new THREE.TorusGeometry(cfg.rad, cfg.tube, 10, 40)
      const band = new THREE.Mesh(torusGeo, bandMat)
      band.position.y = cfg.y
      band.rotation.x = Math.PI * 0.5 + cfg.tiltX
      band.rotation.z = cfg.tiltZ
      bindingGroup.add(band)
      bands.push(band)

      // Sleek glowing runic edge wires
      const edgeGeo1 = new THREE.TorusGeometry(cfg.rad + cfg.tube * 0.90, 0.0035, 6, 40)
      const edgeMesh1 = new THREE.Mesh(edgeGeo1, edgeGlowMat)
      edgeMesh1.position.y = cfg.y
      edgeMesh1.rotation.copy(band.rotation)
      bindingGroup.add(edgeMesh1)

      const edgeGeo2 = new THREE.TorusGeometry(cfg.rad - cfg.tube * 0.90, 0.0035, 6, 40)
      const edgeMesh2 = new THREE.Mesh(edgeGeo2, edgeGlowMat)
      edgeMesh2.position.y = cfg.y
      edgeMesh2.rotation.copy(band.rotation)
      bindingGroup.add(edgeMesh2)
    })

    // 3. Continuous 3D Helical Spiral Binding Energy Thread Intertwining all bands
    const helixPts: THREE.Vector3[] = []
    const turns = 2.4
    const helixHeight = 1.25
    for (let i = 0; i <= 60; i++) {
      const t = i / 60
      const angle = t * turns * Math.PI * 2
      const rad = 0.39 + Math.sin(t * Math.PI) * 0.03
      const hy = 0.16 + t * helixHeight
      helixPts.push(new THREE.Vector3(Math.cos(angle) * rad, hy, Math.sin(angle) * rad))
    }
    const helixCurve = new THREE.CatmullRomCurve3(helixPts)
    const helixGeo = new THREE.TubeGeometry(helixCurve, 60, 0.010, 6, false)
    const helixMesh = new THREE.Mesh(helixGeo, bandMat)
    bindingGroup.add(helixMesh)
    bands.push(helixMesh)

    // 4. Crackling Magical Binding Sparks & Lightning Arcs (Matching concept art)
    const sparkLines: THREE.Line[] = []
    const sparkMat = new THREE.LineBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    })

    for (let sp = 0; sp < 10; sp++) {
      const spPts: THREE.Vector3[] = []
      const startAngle = (sp / 10) * Math.PI * 2
      const startY = 0.25 + (sp % 4) * 0.32
      const r = 0.42 + Math.random() * 0.08
      for (let p = 0; p < 5; p++) {
        const segAngle = startAngle + (Math.random() - 0.5) * 0.4
        const segY = startY + (p * 0.08) + (Math.random() - 0.5) * 0.05
        spPts.push(new THREE.Vector3(Math.cos(segAngle) * r, segY, Math.sin(segAngle) * r))
      }
      const spGeo = new THREE.BufferGeometry().setFromPoints(spPts)
      const spLine = new THREE.Line(spGeo, sparkMat)
      bindingGroup.add(spLine)
      sparkLines.push(spLine)
    }

    // 5. Glowing Runic Magic Seal on Wood Table Surface
    const sealGeo = new THREE.RingGeometry(0.32, 0.68, 36)
    const sealMat = new THREE.MeshBasicMaterial({
      map: this.vfx8Textures.stoneBinding,
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    })
    const sealMesh = new THREE.Mesh(sealGeo, sealMat)
    sealMesh.rotation.x = -Math.PI * 0.5
    sealMesh.position.y = 0.015
    bindingGroup.add(sealMesh)

    // 6. Constriction Snap & Dissipation Lifecycle (Duration: 3.2s)
    let elapsed = 0
    const duration = 3.2
    bindingGroup.scale.set(1.22, 1.0, 1.22) // Initial expanded state

    const petrificusTimer = setInterval(() => {
      elapsed += 0.05
      const progress = elapsed / duration

      // Snap clamp over the first 0.16s
      if (elapsed < 0.16) {
        const cFrac = elapsed / 0.16
        const sc = 1.22 - 0.22 * Math.sin(cFrac * Math.PI * 0.5)
        bindingGroup.scale.set(sc, 1.0, sc)
        clampRing.scale.setScalar(1.0 - cFrac * 0.55)
        clampRingMat.opacity = 0.95 * (1.0 - cFrac)
      } else {
        bindingGroup.scale.set(1.0, 1.0, 1.0)
        clampRing.visible = false
      }

      // Dynamic rotation of bands & spark jitter
      bands.forEach((b, idx) => {
        b.rotation.z += (idx % 2 === 0 ? 0.004 : -0.004)
      })

      sparkLines.forEach(sl => {
        sl.rotation.y += 0.04
        sl.visible = Math.random() > 0.15
      })

      sealMesh.rotation.z += 0.008

      // At end of duration: Dissolve in shimmering silver sparks and release duelist!
      if (progress >= 1.0) {
        clearInterval(petrificusTimer)
        const worldPos = parentGroup.position.clone().add(new THREE.Vector3(0, 0.75, 0))
        this.spawnImpactExplosion(worldPos, 0x38bdf8, false, 'generic')
        targetLego.setPetrified(false)
        parentGroup.remove(bindingGroup)
      }
    }, 50)
  }

  private spawnPetrificusBinding(targetLego: LegoDuelist) {
    this.applyPetrificusDirect(targetLego)
  }

  // --- Stupefy: Canon Stunning Spell (Bùa Choáng - Direct Target Effect, No Projectile) ---
  public applyStupefyDirect(targetLego: LegoDuelist) {
    if (!targetLego) return

    const isPlayer = targetLego === this.playerLego
    const time = this.clock?.getElapsedTime() ?? 0
    this.audio.playHitSound()

    // 1. Trigger Stun State (Helpless drunken wobble kinematics)
    targetLego.setStunned(true)

    // Damage & Combat UI (Rebalanced: 6 DMG + 1.8s stun)
    const finalDmg = SPELL_DAMAGE.STUPEFY
    if (isPlayer) {
      this.playerHp = Math.max(0, this.playerHp - finalDmg)
      this.updateHpBars()
      this.showCombatNumber('BẠN BỊ CHOÁNG!', window.innerWidth * 0.35, window.innerHeight * 0.45, 'player')
      this.showCombatNumber(`-${finalDmg}`, window.innerWidth * 0.35, window.innerHeight * 0.52, 'player')
      this.applyCrowdControlToPlayer('stupefy', 2.0, 'CHOÁNG VÁNG')
      if (this.playerHp <= 0) this.handleMatchEnd(false)
    } else {
      this.applyCrowdControlToOpponent('stupefy', 2.0, 'CHOÁNG VÁNG')
      this.enemyHp = Math.max(0, this.enemyHp - finalDmg)
      this.updateHpBars()
      this.showCombatNumber('STUNNED! (CHOÁNG VÁNG)', window.innerWidth * 0.68, window.innerHeight * 0.38, 'crit')
      this.showCombatNumber(`-${finalDmg}`, window.innerWidth * 0.68, window.innerHeight * 0.44, 'enemy')
      if (this.enemyHp <= 0) this.handleMatchEnd(true)
    }

    const parentGroup = targetLego === this.playerLego ? this.playerGroup : this.opponentGroup
    const stupefyGroup = new THREE.Group()
    parentGroup.add(stupefyGroup)

    // 2. Sudden Concussive Detonation on Chest (y = 0.95)
    const chestY = 0.95
    const flashGeo = new THREE.SphereGeometry(0.38, 16, 16)
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xff2222,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    })
    const flashMesh = new THREE.Mesh(flashGeo, flashMat)
    flashMesh.position.set(0, chestY, 0)
    stupefyGroup.add(flashMesh)

    // Expanding Horizontal Concussive Shockwave Ring at Chest
    const shockGeo = new THREE.RingGeometry(0.12, 0.42, 32)
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    })
    const shockRing = new THREE.Mesh(shockGeo, shockMat)
    shockRing.position.set(0, chestY, 0)
    shockRing.rotation.x = Math.PI * 0.5
    stupefyGroup.add(shockRing)

    // 20 High-Velocity Radial Concussive Sparks
    const sparks: { mesh: THREE.Mesh; vel: THREE.Vector3 }[] = []
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      blending: THREE.AdditiveBlending,
    })
    for (let i = 0; i < 20; i++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.025), sparkMat)
      sp.position.set(0, chestY, 0)
      stupefyGroup.add(sp)
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI * 0.6
      const spSpeed = 1.2 + Math.random() * 1.8
      const vel = new THREE.Vector3(
        Math.cos(theta) * Math.cos(phi) * spSpeed,
        Math.sin(phi) * spSpeed,
        Math.sin(theta) * Math.cos(phi) * spSpeed
      )
      sparks.push({ mesh: sp, vel })
    }

    // 3. Orbiting Halo of 5 Glowing 3D Golden Dizzy Stars around Head (y = 1.68)
    const haloGroup = new THREE.Group()
    haloGroup.position.set(0, 1.68, 0)
    stupefyGroup.add(haloGroup)

    // Golden Orbit Ring (Tilted celestial ellipse)
    const orbitRingGeo = new THREE.TorusGeometry(0.28, 0.007, 8, 48)
    const orbitRingMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    })
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat)
    orbitRing.rotation.x = Math.PI * 0.42
    orbitRing.rotation.z = 0.22
    haloGroup.add(orbitRing)

    // 5 Faceted 3D Golden Stars
    const starMeshes: THREE.Mesh[] = []
    const starCount = 5
    const starGeo = new THREE.OctahedronGeometry(0.065, 1) // Faceted 3D diamond star
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.95,
      roughness: 0.15,
      metalness: 0.85,
    })

    for (let s = 0; s < starCount; s++) {
      const star = new THREE.Mesh(starGeo, starMat)
      const angle = (s / starCount) * Math.PI * 2
      const r = 0.28
      star.position.set(Math.cos(angle) * r, Math.sin(angle * 2) * 0.03, Math.sin(angle) * r)
      haloGroup.add(star)
      starMeshes.push(star)
    }

    // 4. Stun Lifecycle (2.4s)
    let elapsed = 0
    const duration = 2.4
    const stupefyTimer = setInterval(() => {
      elapsed += 0.05
      const progress = elapsed / duration

      // Flash & Shockwave decay
      if (elapsed < 0.35) {
        const fProg = elapsed / 0.35
        flashMesh.scale.setScalar(1.0 + fProg * 1.5)
        flashMat.opacity = 0.95 * (1.0 - fProg)
        shockRing.scale.setScalar(1.0 + fProg * 3.2)
        shockMat.opacity = 0.95 * (1.0 - fProg)
      } else {
        flashMesh.visible = false
        shockRing.visible = false
      }

      // Spark movement
      sparks.forEach(sp => {
        sp.mesh.position.addScaledVector(sp.vel, 0.05)
        sp.vel.multiplyScalar(0.92)
        sp.mesh.scale.multiplyScalar(0.94)
      })

      // Fast Orbit Rotation of Dizzy Stars
      haloGroup.rotation.y += 0.14
      starMeshes.forEach((st, idx) => {
        st.rotation.x += 0.08
        st.rotation.y += 0.12
        const pulse = 1.0 + 0.15 * Math.sin(elapsed * 12 + idx)
        st.scale.setScalar(pulse)
      })

      // End of Stun Duration
      if (progress >= 1.0) {
        clearInterval(stupefyTimer)
        targetLego.setStunned(false)
        const worldPos = parentGroup.position.clone().add(new THREE.Vector3(0, 1.68, 0))
        this.spawnImpactExplosion(worldPos, 0xfbbf24, false, 'generic')
        parentGroup.remove(stupefyGroup)
      }
    }, 50)
  }

  // --- Obliviate: Canon Memory Charm (Bùa Xóa Ký Ức - Direct Target Effect, No Projectile) ---
  public applyObliviateDirect(targetLego: LegoDuelist) {
    if (!targetLego) return

    const isPlayer = targetLego === this.playerLego
    const time = this.clock?.getElapsedTime() ?? 0
    this.audio.playHitSound()

    // 1. Trigger Confused / Amnesia State (Glazed blank sway kinematics)
    targetLego.setConfused(true)

    // Combat UI & Debuff
    if (isPlayer) {
      this.showCombatNumber('MẤT TRÍ NHỚ!', window.innerWidth * 0.35, window.innerHeight * 0.45, 'player')
      this.showToast('OBLIVIATE!', 'Bạn bị trúng bùa lãng quên! Mất phương hướng trong 2.0s')
      this.applyCrowdControlToPlayer('obliviate', 2.0, 'XÓA KÝ ỨC / LÚ LẪN')
    } else {
      this.applyCrowdControlToOpponent('obliviate', 2.0, 'XÓA KÝ ỨC / LÚ LẪN')
      this.showCombatNumber('OBLIVIATE! (MẤT TRÍ NHỚ)', window.innerWidth * 0.68, window.innerHeight * 0.38, 'crit')
      this.showToast('OBLIVIATE ACTIVATED!', 'Đối thủ bị xóa sạch ký ức! Hủy niệm phép và mất phương hướng trong 2.0s')
    }

    const parentGroup = targetLego === this.playerLego ? this.playerGroup : this.opponentGroup
    const obliviateGroup = new THREE.Group()
    parentGroup.add(obliviateGroup)

    // 2. Psychic Resonance Pulse Rings from Temples (y = 1.45)
    const templeY = 1.45
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    })

    const pulseRings: THREE.Mesh[] = []
    const pulseGeo = new THREE.RingGeometry(0.06, 0.18, 32)
    // Left temple & Right temple
    const leftRing = new THREE.Mesh(pulseGeo, pulseMat)
    leftRing.position.set(-0.16, templeY, 0)
    leftRing.rotation.y = Math.PI * 0.5
    obliviateGroup.add(leftRing)
    pulseRings.push(leftRing)

    const rightRing = new THREE.Mesh(pulseGeo, pulseMat)
    rightRing.position.set(0.16, templeY, 0)
    rightRing.rotation.y = -Math.PI * 0.5
    obliviateGroup.add(rightRing)
    pulseRings.push(rightRing)

    // 3. 3D Pensieve Memory Vortex Disk rotating above Crown (y = 1.68)
    const crownY = 1.68
    const vortexGeo = new THREE.PlaneGeometry(0.75, 0.75)
    const vortexMat = new THREE.MeshBasicMaterial({
      map: this.vfx8Textures.memorySpiral,
      color: 0x67e8f9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const vortexMesh = new THREE.Mesh(vortexGeo, vortexMat)
    vortexMesh.rotation.x = -Math.PI * 0.5
    vortexMesh.position.set(0, crownY + 0.05, 0)
    obliviateGroup.add(vortexMesh)

    // 4. Undulating 3D Silvery Thought Strands (Pensieve Memory Ribbons being extracted)
    const filamentCurves: { curve: THREE.CatmullRomCurve3; mesh: THREE.Mesh; baseAngle: number; height: number }[] = []
    const filamentMat = new THREE.MeshStandardMaterial({
      color: 0xf0fdfa,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.75,
      roughness: 0.2,
      metalness: 0.35,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    })

    const strandCount = 5
    for (let i = 0; i < strandCount; i++) {
      const baseAngle = (i / strandCount) * Math.PI * 2
      const pts: THREE.Vector3[] = []
      const strandH = 0.42 + Math.random() * 0.28
      for (let p = 0; p <= 8; p++) {
        const t = p / 8
        const angle = baseAngle + t * Math.PI * 1.5
        const rad = 0.08 + t * 0.16
        const py = 1.42 + t * strandH
        pts.push(new THREE.Vector3(Math.cos(angle) * rad, py, Math.sin(angle) * rad))
      }
      const curve = new THREE.CatmullRomCurve3(pts)
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.007, 6, false)
      const tubeMesh = new THREE.Mesh(tubeGeo, filamentMat)
      obliviateGroup.add(tubeMesh)
      filamentCurves.push({ curve, mesh: tubeMesh, baseAngle, height: strandH })
    }

    // 5. Floating Thought Particles / Fairy Sparks drifting upwards
    const sparkMotes: { mesh: THREE.Mesh; vel: THREE.Vector3 }[] = []
    const sparkMoteMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
    })
    for (let i = 0; i < 18; i++) {
      const sm = new THREE.Mesh(new THREE.OctahedronGeometry(0.025, 0), sparkMoteMat)
      const a = Math.random() * Math.PI * 2
      const r = 0.08 + Math.random() * 0.18
      sm.position.set(Math.cos(a) * r, crownY + Math.random() * 0.15, Math.sin(a) * r)
      obliviateGroup.add(sm)
      sparkMotes.push({
        mesh: sm,
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.08, 0.20 + Math.random() * 0.3, (Math.random() - 0.5) * 0.08),
      })
    }

    // 6. Memory Extraction Lifecycle (2.8s)
    let elapsed = 0
    const duration = 2.8
    const obliviateTimer = setInterval(() => {
      elapsed += 0.05
      const progress = elapsed / duration

      // Psychic temple pulse expansion
      if (elapsed < 0.45) {
        const pFrac = elapsed / 0.45
        pulseRings.forEach(pr => {
          pr.scale.setScalar(1.0 + pFrac * 2.5)
          ;(pr.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1.0 - pFrac)
        })
      } else {
        pulseRings.forEach(pr => (pr.visible = false))
      }

      // Memory vortex rotation & subtle breathe
      vortexMesh.rotation.z += 0.06
      const vScale = 1.0 + 0.12 * Math.sin(elapsed * 6)
      vortexMesh.scale.set(vScale, vScale, 1.0)

      // Animate undulating memory filaments (twisting upwards)
      filamentCurves.forEach((fc) => {
        const pts: THREE.Vector3[] = []
        for (let p = 0; p <= 8; p++) {
          const t = p / 8
          const angle = fc.baseAngle + t * Math.PI * 1.5 + elapsed * 2.2
          const rad = 0.08 + t * 0.16 + Math.sin(elapsed * 4 + p) * 0.02
          const py = 1.42 + t * fc.height + Math.cos(elapsed * 3 + p) * 0.02
          pts.push(new THREE.Vector3(Math.cos(angle) * rad, py, Math.sin(angle) * rad))
        }
        fc.curve.points = pts
        fc.mesh.geometry.dispose()
        fc.mesh.geometry = new THREE.TubeGeometry(fc.curve, 24, 0.007, 6, false)
      })

      // Spark motes floating up
      sparkMotes.forEach(sm => {
        sm.mesh.position.addScaledVector(sm.vel, 0.05)
        sm.mesh.scale.multiplyScalar(0.97)
        if (sm.mesh.position.y > crownY + 0.6) {
          sm.mesh.position.y = crownY + Math.random() * 0.08
        }
      })

      // End of Obliviate Duration
      if (progress >= 1.0) {
        clearInterval(obliviateTimer)
        targetLego.setConfused(false)
        const worldPos = parentGroup.position.clone().add(new THREE.Vector3(0, crownY, 0))
        this.spawnImpactExplosion(worldPos, 0x38bdf8, false, 'generic')
        parentGroup.remove(obliviateGroup)
      }
    }, 50)
  }

  // --- Crowd Control Wand Aura Visual Effect (Hiệu ứng bao quanh đũa phép khi niệm skill khống chế) ---
  // Attaches directly to the caster's wristRightPivot (wand shaft extends along Z from z = 0.04 to z = 0.38)
  public spawnWandCCVfx(isPlayer: boolean, spellName: string) {
    const casterLego = isPlayer ? this.playerLego : this.opponentLego
    if (!casterLego || !casterLego.wristRightPivot) return

    const auraGroup = new THREE.Group()
    casterLego.wristRightPivot.add(auraGroup)

    const duration = 0.65 // Lifespan in seconds matching the wand flourish
    const matsToFade: { mat: THREE.Material; baseOpacity: number }[] = []

    if (spellName === 'petrificus') {
      // === PETRIFICUS TOTALUS WAND AURA ===
      // Lore: Crackling cyan-blue runic binding rings & electric arcs coiling tightly along shaft
      const coilGroup = new THREE.Group()
      auraGroup.add(coilGroup)

      const coil1Mat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      })
      const coil1Mesh = new THREE.Mesh(
        new THREE.TubeGeometry(new WandHelixCurve(0.04, 0.38, 0.024, 0.006, 4.5, 0), 48, 0.0035, 8, false),
        coil1Mat
      )
      coilGroup.add(coil1Mesh)
      matsToFade.push({ mat: coil1Mat, baseOpacity: 0.95 })

      const coil2Mat = new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      })
      const coil2Mesh = new THREE.Mesh(
        new THREE.TubeGeometry(new WandHelixCurve(0.04, 0.38, 0.027, 0.004, -3.5, Math.PI * 0.5), 48, 0.0024, 8, false),
        coil2Mat
      )
      coilGroup.add(coil2Mesh)
      matsToFade.push({ mat: coil2Mat, baseOpacity: 0.85 })

      // Runic Binding Bands along the Shaft
      const rings: THREE.Mesh[] = []
      const ringZPositions = [0.12, 0.22, 0.32]
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.90,
        blending: THREE.AdditiveBlending,
      })
      matsToFade.push({ mat: ringMat, baseOpacity: 0.90 })

      for (const rz of ringZPositions) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.026, 0.0022, 8, 24),
          ringMat
        )
        ring.position.set(0, 0, rz)
        auraGroup.add(ring)
        rings.push(ring)
      }

      // Jittering Electric Lightning Arcs hugging the Wand
      const lightningCount = 4
      const lightningLines: { line: THREE.Line; zMin: number; zMax: number }[] = []
      const lightMat = new THREE.LineBasicMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      })
      matsToFade.push({ mat: lightMat, baseOpacity: 0.95 })

      for (let i = 0; i < lightningCount; i++) {
        const zMin = 0.05 + (i / lightningCount) * 0.20
        const zMax = zMin + 0.12
        const pts: THREE.Vector3[] = []
        for (let s = 0; s <= 5; s++) {
          const t = s / 5
          const z = zMin + (zMax - zMin) * t
          const a = (i * Math.PI * 0.5) + t * Math.PI
          const r = 0.022 + (Math.random() - 0.5) * 0.012
          pts.push(new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), z))
        }
        const geom = new THREE.BufferGeometry().setFromPoints(pts)
        const line = new THREE.Line(geom, lightMat)
        auraGroup.add(line)
        lightningLines.push({ line, zMin, zMax })
      }

      // Paralyzing Tip Nova at z = 0.38
      const tipMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      })
      matsToFade.push({ mat: tipMat, baseOpacity: 0.95 })
      const tipNova = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.042, 0),
        tipMat
      )
      tipNova.scale.set(1.0, 1.0, 0.25)
      tipNova.position.set(0, 0, 0.38)
      auraGroup.add(tipNova)

      // Light flash on wand
      casterLego.wandLight.color.setHex(0x38bdf8)
      casterLego.wandLight.intensity = 11.0

      // Register active aura
      this.activeWandAuras.push({
        group: auraGroup,
        parent: casterLego.wristRightPivot,
        spellName: 'petrificus',
        elapsed: 0,
        duration,
        update: (delta: number) => {
          coilGroup.rotation.z += delta * 15.0
          tipNova.rotation.z += delta * 18.0

          const curElapsed = this.getAuraElapsed(auraGroup)
          rings.forEach((r, idx) => {
            r.rotation.z += (idx % 2 === 0 ? delta * 8.0 : -delta * 8.0)
            const sc = 1.0 + 0.12 * Math.sin(curElapsed * 25.0 + idx)
            r.scale.set(sc, sc, 1.0)
          })

          lightningLines.forEach(({ line, zMin, zMax }, i) => {
            if (Math.random() > 0.3) {
              const pts: THREE.Vector3[] = []
              for (let s = 0; s <= 5; s++) {
                const t = s / 5
                const z = zMin + (zMax - zMin) * t
                const a = (i * Math.PI * 0.5) + t * Math.PI + Math.sin(s * 2)
                const r = 0.024 + (Math.random() - 0.5) * 0.016
                pts.push(new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), z))
              }
              line.geometry.setFromPoints(pts)
            }
          })

          return this.applyAuraFadeAndScale(auraGroup, matsToFade, duration, curElapsed)
        }
      })

    } else if (spellName === 'stupefy') {
      // === STUPEFY WAND AURA ===
      // Lore: Blazing crimson-scarlet plasma swirl with spinning golden micro-sparks radiating around wand
      const fireGroup = new THREE.Group()
      auraGroup.add(fireGroup)

      // Outer Crimson Flame Spiral
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0xff1e1e,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      })
      const flameMesh = new THREE.Mesh(
        new THREE.TubeGeometry(new WandHelixCurve(0.04, 0.38, 0.028, 0.008, 4.0, 0), 48, 0.0045, 8, false),
        flameMat
      )
      fireGroup.add(flameMesh)
      matsToFade.push({ mat: flameMat, baseOpacity: 0.95 })

      // Inner Golden Ignition Core Ribbon
      const goldMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      })
      const goldMesh = new THREE.Mesh(
        new THREE.TubeGeometry(new WandHelixCurve(0.04, 0.38, 0.020, 0.004, -3.2, Math.PI * 0.4), 48, 0.0028, 8, false),
        goldMat
      )
      fireGroup.add(goldMesh)
      matsToFade.push({ mat: goldMat, baseOpacity: 0.95 })

      // 16 Orbiting Fiery Embers
      interface WandSpark {
        mesh: THREE.Mesh
        baseR: number
        angle: number
        orbitSpeed: number
        zProgress: number
        zSpeed: number
      }
      const sparks: WandSpark[] = []
      const sparkColors = [0xff2222, 0xf97316, 0xfbbf24, 0xffea00]
      for (let i = 0; i < 16; i++) {
        const sMat = new THREE.MeshBasicMaterial({
          color: sparkColors[i % sparkColors.length],
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
        })
        matsToFade.push({ mat: sMat, baseOpacity: 0.95 })
        const sm = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.008 + (i % 3) * 0.003, 0),
          sMat
        )
        auraGroup.add(sm)
        sparks.push({
          mesh: sm,
          baseR: 0.024 + (i % 4) * 0.008,
          angle: (i / 16) * Math.PI * 2,
          orbitSpeed: 18.0 + (i % 5) * 4.0,
          zProgress: i / 16,
          zSpeed: 1.8 + (i % 3) * 0.6,
        })
      }

      // Concussive Orange Rings along Wand (z = 0.16, 0.28)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      })
      matsToFade.push({ mat: ringMat, baseOpacity: 0.85 })
      const rings: THREE.Mesh[] = []
      for (const rz of [0.16, 0.28]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.030, 0.0028, 8, 24), ringMat)
        ring.position.set(0, 0, rz)
        auraGroup.add(ring)
        rings.push(ring)
      }

      // Solar Corona at Wand Tip (z = 0.38)
      const tipMat = new THREE.MeshBasicMaterial({
        color: 0xff2222,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      })
      matsToFade.push({ mat: tipMat, baseOpacity: 0.95 })
      const tipFlare = new THREE.Mesh(new THREE.OctahedronGeometry(0.052, 0), tipMat)
      tipFlare.scale.set(1.0, 1.0, 0.2)
      tipFlare.position.set(0, 0, 0.38)
      auraGroup.add(tipFlare)

      // Light flash on wand
      casterLego.wandLight.color.setHex(0xff2222)
      casterLego.wandLight.intensity = 13.0

      this.activeWandAuras.push({
        group: auraGroup,
        parent: casterLego.wristRightPivot,
        spellName: 'stupefy',
        elapsed: 0,
        duration,
        update: (delta: number) => {
          fireGroup.rotation.z += delta * 22.0
          tipFlare.rotation.z += delta * 24.0

          for (const sp of sparks) {
            sp.angle += delta * sp.orbitSpeed
            sp.zProgress = (sp.zProgress + delta * sp.zSpeed) % 1.0
            const currentZ = 0.04 + 0.34 * sp.zProgress
            const currentR = sp.baseR + 0.006 * Math.sin(sp.angle * 2.0)
            sp.mesh.position.set(
              currentR * Math.cos(sp.angle),
              currentR * Math.sin(sp.angle),
              currentZ
            )
          }

          const curElapsed = this.getAuraElapsed(auraGroup)
          rings.forEach((r, idx) => {
            r.rotation.z += (idx % 2 === 0 ? delta * 12.0 : -delta * 12.0)
            const sc = 1.0 + 0.15 * Math.sin(curElapsed * 30.0 + idx)
            r.scale.set(sc, sc, 1.0)
          })

          return this.applyAuraFadeAndScale(auraGroup, matsToFade, duration, curElapsed)
        }
      })

    } else if (spellName === 'obliviate') {
      // === OBLIVIATE WAND AURA ===
      // Lore: Ethereal silvery-cyan Pensieve mist ribbon spiraling up wand with floating silvery thought sparks
      const mistGroup = new THREE.Group()
      auraGroup.add(mistGroup)

      // Flowing Pensieve Mist Ribbon
      const mistMat = new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
      })
      const mistMesh = new THREE.Mesh(
        new THREE.TubeGeometry(new WandHelixCurve(0.04, 0.38, 0.030, 0.006, 3.2, 0), 48, 0.0042, 8, false),
        mistMat
      )
      mistGroup.add(mistMesh)
      matsToFade.push({ mat: mistMat, baseOpacity: 0.88 })

      // Silvery Inner Thought Thread
      const silverMat = new THREE.MeshBasicMaterial({
        color: 0xf8fafc,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
      })
      const silverMesh = new THREE.Mesh(
        new THREE.TubeGeometry(new WandHelixCurve(0.04, 0.38, 0.022, 0.003, -2.6, Math.PI * 0.6), 48, 0.0022, 8, false),
        silverMat
      )
      mistGroup.add(silverMesh)
      matsToFade.push({ mat: silverMat, baseOpacity: 0.92 })

      // 14 Floating Silvery Thought Droplets / Wisps
      interface WandWisp {
        mesh: THREE.Mesh
        baseR: number
        angle: number
        orbitSpeed: number
        zProgress: number
        zSpeed: number
        wobble: number
      }
      const wisps: WandWisp[] = []
      const wispMat = new THREE.MeshBasicMaterial({
        color: 0xa5f3fc,
        transparent: true,
        opacity: 0.90,
        blending: THREE.AdditiveBlending,
      })
      matsToFade.push({ mat: wispMat, baseOpacity: 0.90 })

      for (let i = 0; i < 14; i++) {
        const wm = new THREE.Mesh(
          new THREE.SphereGeometry(0.007 + (i % 3) * 0.002, 8, 8),
          wispMat
        )
        auraGroup.add(wm)
        wisps.push({
          mesh: wm,
          baseR: 0.026 + (i % 3) * 0.009,
          angle: (i / 14) * Math.PI * 2,
          orbitSpeed: 8.0 + (i % 4) * 3.0,
          zProgress: i / 14,
          zSpeed: 1.2 + (i % 3) * 0.4,
          wobble: Math.random() * Math.PI * 2,
        })
      }

      // Concentric Thought Halo at Tip (z = 0.38)
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xccfbf1,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
      matsToFade.push({ mat: haloMat, baseOpacity: 0.92 })
      const tipHalo = new THREE.Mesh(new THREE.RingGeometry(0.015, 0.048, 32), haloMat)
      tipHalo.position.set(0, 0, 0.38)
      auraGroup.add(tipHalo)

      // Pearl Orb at Wand Tip
      const pearlMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      })
      matsToFade.push({ mat: pearlMat, baseOpacity: 0.95 })
      const tipPearl = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 12), pearlMat)
      tipPearl.position.set(0, 0, 0.38)
      auraGroup.add(tipPearl)

      // Light flash on wand
      casterLego.wandLight.color.setHex(0x67e8f9)
      casterLego.wandLight.intensity = 10.0

      this.activeWandAuras.push({
        group: auraGroup,
        parent: casterLego.wristRightPivot,
        spellName: 'obliviate',
        elapsed: 0,
        duration,
        update: (delta: number) => {
          mistGroup.rotation.z += delta * 9.0
          tipHalo.rotation.z += delta * 10.0

          for (const w of wisps) {
            w.angle += delta * w.orbitSpeed
            w.zProgress = (w.zProgress + delta * w.zSpeed) % 1.0
            const currentZ = 0.04 + 0.34 * w.zProgress
            const currentR = w.baseR + 0.007 * Math.sin(w.angle * 3.0 + w.wobble)
            w.mesh.position.set(
              currentR * Math.cos(w.angle),
              currentR * Math.sin(w.angle),
              currentZ
            )
          }

          const curElapsed = this.getAuraElapsed(auraGroup)
          return this.applyAuraFadeAndScale(auraGroup, matsToFade, duration, curElapsed)
        }
      })
    }
  }

  private getAuraElapsed(auraGroup: THREE.Group): number {
    const aura = this.activeWandAuras.find(a => a.group === auraGroup)
    return aura ? aura.elapsed : 0
  }

  private applyAuraFadeAndScale(
    auraGroup: THREE.Group,
    mats: { mat: THREE.Material; baseOpacity: number }[],
    duration: number,
    elapsed: number
  ): boolean {
    if (elapsed >= duration) return false

    // Scale lifecycle: rapid flourish expansion in first 0.12s, then steady
    if (elapsed < 0.12) {
      const frac = elapsed / 0.12
      const sc = 0.70 + 0.45 * Math.sin(frac * Math.PI * 0.5)
      auraGroup.scale.set(sc, sc, 1.0)
    } else {
      auraGroup.scale.set(1.0, 1.0, 1.0)
    }

    // Opacity fade lifecycle
    let fade = 1.0
    if (elapsed < 0.08) {
      fade = elapsed / 0.08
    } else if (elapsed > 0.42) {
      fade = Math.max(0, 1.0 - (elapsed - 0.42) / (duration - 0.42))
    }

    for (const item of mats) {
      ;(item.mat as THREE.MeshBasicMaterial).opacity = item.baseOpacity * fade
    }

    return true
  }

  // --- Confringo: The Blasting Curse (Bùa Nổ Tan - Phím 8) Detonation Explosion ---
  // Faithfully matches Concept Sheet 1 (Bottom-Left Panel) with 99% Visual Fidelity:
  // 1. "FIERY EXPLOSIVE BURST": Volumetric cauliflower flame cluster with incandescent yellow core & orange lobes
  // 2. "EXPANDING SHOCKWAVE": Concentric glowing golden-orange ground shockwave ring expanding across table
  // 3. "EXPLOSIVE SPARKERS": High-velocity directional needle spark streaks radiating in starburst angles
  // 4. "MOLTEN MAGMA SPARKS": Basalt rock fragments & incandescent molten ember droplets
  // 5. "THICK BLACK SMOKE PLUME": Dense charcoal soot clouds billowing vertically into Great Hall rafters
  // 6. Concussive target knockback & flinch on Voldemort (Completely removed blinding white blowout explosion)
  private spawnConfringoBlast(origin: THREE.Vector3, _targetLego?: LegoDuelist) {
    const blastGroup = new THREE.Group()
    this.scene.add(blastGroup)

    // 1. Concussive Target Knockback & Camera Trauma
    if (_targetLego === this.playerLego) {
      this.playerFlinch = 1.0
    } else {
      this.opponentFlinch = 1.0
    }
    this.camRecoil = Math.max(this.camRecoil, 0.52)

    const burstBaseY = -0.72
    const burstZ = origin.z
    const burstX = origin.x
    const burstY = Math.max(-0.35, origin.y) // Centered at chest impact height

    // 1b. Inner Incandescent White-Hot Flash Billboard (Additive ignition flare)
    const flashMat = new THREE.SpriteMaterial({
      map: this.vfx8Textures.confringoBlast,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const flashSprite = new THREE.Sprite(flashMat)
    flashSprite.renderOrder = 24
    flashSprite.position.set(burstX, burstY, burstZ)
    flashSprite.scale.set(0.4, 0.4, 1.0)
    blastGroup.add(flashSprite)

    // 2. Primary Master Stylized Volumetric Billboard ("FIERY EXPLOSIVE BURST")
    // AdditiveBlending ensures the incandescent cauliflower fire blossoms with radiant brilliance
    const masterMat = new THREE.SpriteMaterial({
      map: this.vfx8Textures.confringoBlast,
      transparent: true,
      opacity: 0.98,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const masterSprite = new THREE.Sprite(masterMat)
    masterSprite.renderOrder = 22
    masterSprite.position.set(burstX, burstY, burstZ)
    masterSprite.scale.set(0.4, 0.4, 1.0)
    blastGroup.add(masterSprite)

    // 3. Directional High-Velocity Starburst Sparkers ("EXPLOSIVE SPARKERS")
    // Emitting 28 radiant high-speed camera-facing sparks in full 360-degree sphere
    for (let i = 0; i < 28; i++) {
      const ang = (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.2
      const pitch = (Math.random() - 0.3) * Math.PI * 0.45
      const spd = 7.0 + Math.random() * 8.5
      const vx = Math.cos(ang) * Math.cos(pitch) * spd
      const vy = Math.sin(pitch) * spd * 0.8 + 1.4
      const vz = Math.sin(ang) * Math.cos(pitch) * spd
      this.spawnParticle(
        burstX,
        burstY,
        burstZ,
        vx, vy, vz,
        1.0, 0.85 + Math.random() * 0.15, 0.15,
        0.24 + Math.random() * 0.12,
        0.45 + Math.random() * 0.30,
        0.90,
        0.8
      )
    }

    // 4. Concentric Ground Shockwave Ring on Mahogany Table Surface (y = -0.808)
    const shockwaveRingGeo = new THREE.RingGeometry(0.35, 0.55, 48)
    const shockwaveRingMat = new THREE.MeshBasicMaterial({
      color: 0xff7700,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    })
    const shockwaveRing = new THREE.Mesh(shockwaveRingGeo, shockwaveRingMat)
    shockwaveRing.rotation.x = -Math.PI * 0.5
    shockwaveRing.position.set(burstX, -0.808, burstZ)
    blastGroup.add(shockwaveRing)

    // Inner brilliant yellow-amber shockwave ring
    const innerRingGeo = new THREE.RingGeometry(0.20, 0.35, 48)
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    })
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat)
    innerRing.rotation.x = -Math.PI * 0.5
    innerRing.position.set(burstX, -0.806, burstZ)
    blastGroup.add(innerRing)

    // 5. Charred Table Scorch Decal with Smoldering Ember Fissures
    const scorchCanvas = document.createElement('canvas')
    scorchCanvas.width = 256
    scorchCanvas.height = 256
    const sctx2 = scorchCanvas.getContext('2d')!
    sctx2.clearRect(0, 0, 256, 256)

    // Basalt burned wood mark
    const bGrad = sctx2.createRadialGradient(128, 128, 10, 128, 128, 120)
    bGrad.addColorStop(0, 'rgba(15, 15, 17, 0.98)')
    bGrad.addColorStop(0.55, 'rgba(28, 25, 23, 0.92)')
    bGrad.addColorStop(0.85, 'rgba(68, 64, 60, 0.50)')
    bGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    sctx2.fillStyle = bGrad
    sctx2.beginPath()
    sctx2.arc(128, 128, 120, 0, Math.PI * 2)
    sctx2.fill()

    // Glowing orange ember veins
    sctx2.strokeStyle = '#ff5500'
    sctx2.lineWidth = 3.5
    sctx2.shadowColor = '#ff2200'
    sctx2.shadowBlur = 10
    for (let c = 0; c < 8; c++) {
      const ang = (c / 8) * Math.PI * 2
      sctx2.beginPath()
      sctx2.moveTo(128, 128)
      sctx2.lineTo(128 + Math.cos(ang) * 95, 128 + Math.sin(ang) * 95)
      sctx2.stroke()
    }
    const scorchTex = new THREE.CanvasTexture(scorchCanvas)

    const scorchGeo = new THREE.PlaneGeometry(2.4, 2.4)
    const scorchMat = new THREE.MeshStandardMaterial({
      map: scorchTex,
      transparent: true,
      opacity: 0.95,
      roughness: 0.8,
      emissive: 0xff3300,
      emissiveIntensity: 0.35,
      depthWrite: false,
    })
    const scorchMesh = new THREE.Mesh(scorchGeo, scorchMat)
    scorchMesh.rotation.x = -Math.PI * 0.5
    scorchMesh.position.set(burstX, -0.818, burstZ)
    this.scene.add(scorchMesh)

    // 6. 18 Radial Molten Magma Basalt Rock Shards ("MẢNH VỠ MAGMA")
    const shardGeo = new THREE.DodecahedronGeometry(0.035, 0)
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      emissive: 0xff4500,
      emissiveIntensity: 0.48,
      roughness: 0.35,
      metalness: 0.25,
    })
    const shards: { mesh: THREE.Mesh; vx: number; vy: number; vz: number; rotX: number; rotY: number; life: number; maxLife: number }[] = []

    for (let i = 0; i < 18; i++) {
      const sm = new THREE.Mesh(shardGeo, shardMat.clone())
      const sScale = 0.5 + Math.random() * 0.5
      sm.scale.setScalar(sScale)
      sm.position.set(burstX, burstBaseY + 0.15, burstZ)
      blastGroup.add(sm)

      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const speed = 2.5 + Math.random() * 4.5
      shards.push({
        mesh: sm,
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.abs(Math.sin(phi) * Math.sin(theta)) * speed * 0.8 + 0.8,
        vz: Math.cos(phi) * speed,
        rotX: (Math.random() - 0.5) * 12.0,
        rotY: (Math.random() - 0.5) * 12.0,
        life: 0,
        maxLife: 1.2 + Math.random() * 0.4,
      })
    }

    // 7. Billowing Dark Charcoal Smoke Column ("CỘT KHÓI ĐEN")
    // Authentic soft atmospheric charcoal soot clouds with Gaussian falloff
    const puffCanvas = document.createElement('canvas')
    puffCanvas.width = 128
    puffCanvas.height = 128
    const pctx = puffCanvas.getContext('2d')!
    pctx.clearRect(0, 0, 128, 128)
    const pgrad = pctx.createRadialGradient(64, 64, 4, 64, 64, 60)
    pgrad.addColorStop(0, 'rgba(24, 24, 27, 0.85)')
    pgrad.addColorStop(0.35, 'rgba(39, 39, 42, 0.60)')
    pgrad.addColorStop(0.70, 'rgba(63, 63, 70, 0.20)')
    pgrad.addColorStop(1, 'rgba(63, 63, 70, 0)')
    pctx.fillStyle = pgrad
    pctx.beginPath()
    pctx.arc(64, 64, 60, 0, Math.PI * 2)
    pctx.fill()
    const puffTex = new THREE.CanvasTexture(puffCanvas)

    const smokePuffs: { sprite: THREE.Sprite; vx: number; vy: number; vz: number; rotSpeed: number; maxLife: number; life: number }[] = []

    for (let k = 0; k < 12; k++) {
      const puffMat = new THREE.SpriteMaterial({
        map: puffTex,
        transparent: true,
        opacity: 0.80,
        blending: THREE.NormalBlending,
        depthWrite: false,
      })
      const puff = new THREE.Sprite(puffMat)
      puff.renderOrder = 23
      puff.position.set(
        burstX + (Math.random() - 0.5) * 0.35,
        burstY + (Math.random() - 0.5) * 0.25,
        burstZ + (Math.random() - 0.5) * 0.35
      )
      const baseScale = 1.0 + Math.random() * 0.5
      puff.scale.set(baseScale, baseScale, 1.0)
      blastGroup.add(puff)

      smokePuffs.push({
        sprite: puff,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 1.4 + Math.random() * 1.6,
        vz: (Math.random() - 0.5) * 0.6,
        rotSpeed: (Math.random() - 0.5) * 1.5,
        maxLife: 2.2 + Math.random() * 0.5,
        life: 0,
      })
    }

    // 8. Lifecycle Update Timer (Runs over 2.6 seconds)
    let elapsed = 0
    const blastTimer = setInterval(() => {
      elapsed += 0.033
      const dt = 0.033

      // A. Inner Incandescent Flash & Master Volumetric Billboard Animation
      if (elapsed < 0.08) {
        const fSc = 0.4 + (elapsed / 0.08) * 2.2
        flashSprite.scale.set(fSc, fSc, 1.0)
        flashMat.opacity = 1.0
      } else if (elapsed < 0.22) {
        const fFrac = (elapsed - 0.08) / 0.14
        flashSprite.scale.set(2.6 + fFrac * 0.4, 2.6 + fFrac * 0.4, 1.0)
        flashMat.opacity = Math.max(0, 1.0 - fFrac)
      } else {
        flashSprite.visible = false
      }

      if (elapsed < 0.12) {
        // Fast blossoming expansion
        const sc = 0.4 + (elapsed / 0.12) * 2.8 // expands to 3.2m
        masterSprite.scale.set(sc, sc, 1.0)
      } else if (elapsed <= 1.40) {
        // Living, vibrant stylized flame cloud gently breathing
        const breath = 1.0 + Math.sin((elapsed - 0.12) * 5.5) * 0.035
        masterSprite.scale.set(3.2 * breath, 3.2 * breath, 1.0)
      } else {
        // Smooth dissolve into rising smoke
        const fadeFrac = Math.max(0, 1.0 - (elapsed - 1.40) / 0.95)
        masterSprite.scale.set(3.2 * (0.85 + fadeFrac * 0.15), 3.2 * (0.85 + fadeFrac * 0.15), 1.0)
        masterMat.opacity = fadeFrac * 0.98
        if (fadeFrac <= 0.01) masterSprite.visible = false
      }

      // B. Ground Shockwave Ring Expanding Across Table
      if (elapsed < 0.55) {
        const rFrac = elapsed / 0.55
        const rScale = 0.4 + rFrac * 3.8
        shockwaveRing.scale.set(rScale, rScale, 1.0)
        innerRing.scale.set(rScale * 0.85, rScale * 0.85, 1.0)
        shockwaveRingMat.opacity = (1.0 - rFrac) * 0.95
        innerRingMat.opacity = (1.0 - rFrac) * 0.92
      } else {
        shockwaveRing.visible = false
        innerRing.visible = false
      }

      // D. Billowing Smoke Column Rising
      smokePuffs.forEach(sp => {
        sp.life += dt
        sp.sprite.position.x += sp.vx * dt
        sp.sprite.position.y += sp.vy * dt
        sp.sprite.position.z += sp.vz * dt
        sp.sprite.material.rotation += sp.rotSpeed * dt
        sp.vy = Math.max(0.4, sp.vy - dt * 0.5)

        const lifeFrac = sp.life / sp.maxLife
        const puffScale = 1.2 + lifeFrac * 2.2
        sp.sprite.scale.set(puffScale, puffScale, 1.0)
        sp.sprite.material.opacity = Math.max(0, (1.0 - lifeFrac * lifeFrac) * 0.85)
      })

      // E. Radial Magma Shards Flying and Resting on Table
      shards.forEach(sh => {
        sh.life += dt
        sh.mesh.position.x += sh.vx * dt
        sh.mesh.position.y += sh.vy * dt
        sh.mesh.position.z += sh.vz * dt
        sh.vy -= 4.2 * dt // gravity
        sh.mesh.rotation.x += sh.rotX * dt
        sh.mesh.rotation.y += sh.rotY * dt

        if (sh.mesh.position.y <= -0.80) {
          sh.mesh.position.y = -0.80
          sh.vx *= 0.35
          sh.vz *= 0.35
          sh.vy = 0
        }

        const shFrac = sh.life / sh.maxLife
        ;(sh.mesh.material as THREE.MeshStandardMaterial).opacity = Math.max(0, 1.0 - shFrac)
      })

      // F. Charred Scorch Decal Cooling & Fading
      if (elapsed > 1.2) {
        const coolFrac = (elapsed - 1.2) / 1.4
        scorchMat.emissiveIntensity = Math.max(0, (1.0 - coolFrac) * 0.35)
        scorchMat.opacity = Math.max(0, (1.0 - coolFrac) * 0.95)
      }

      // End lifecycle after 2.6s
      if (elapsed >= 2.6) {
        clearInterval(blastTimer)
        this.scene.remove(blastGroup)
        this.scene.remove(scorchMesh)
      }
    }, 33)
  }

  // --- Dynamic Full-Body 360° Shields ---
  private buildShieldMeshes() {
    // 1. Full-Body Spherical Forcefield (Radius 2.30m enclosing Harry 100% from head, raised wand, to cape and floor)
    const playerShieldGeo = new THREE.SphereGeometry(2.30, 48, 36)
    const playerInnerGeo = new THREE.SphereGeometry(2.18, 36, 28)
    const playerRimGeo = new THREE.SphereGeometry(2.32, 48, 36)
    const playerRingGeo = new THREE.RingGeometry(2.26, 2.38, 64)
    const playerRing2Geo = new THREE.RingGeometry(2.24, 2.36, 64)

    const playerCenterY = -0.20
    const pBase = new THREE.Vector3(this.playerBasePos.x, playerCenterY, this.playerBasePos.z)

    // Outer Hexagonal Crystal Shield
    const playerMat = new THREE.MeshBasicMaterial({
      map: this.vfxTextures.shieldHex,
      color: 0x38b6ff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.playerShieldMesh = new THREE.Mesh(playerShieldGeo, playerMat)
    this.playerShieldMesh.position.copy(pBase)
    this.playerShieldMesh.renderOrder = 20
    this.scene.add(this.playerShieldMesh)

    // Radiant Silhouette / Fresnel Rim Glow
    const playerRimMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.playerShieldRim = new THREE.Mesh(playerRimGeo, playerRimMat)
    this.playerShieldRim.position.copy(pBase)
    this.playerShieldRim.renderOrder = 22
    this.scene.add(this.playerShieldRim)

    // Inner crystalline sphere for rich 3D volumetric depth
    const playerInnerMat = new THREE.MeshBasicMaterial({
      color: 0x1177ff,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.playerInnerShieldMesh = new THREE.Mesh(playerInnerGeo, playerInnerMat)
    this.playerInnerShieldMesh.position.copy(pBase)
    this.playerInnerShieldMesh.renderOrder = 18
    this.scene.add(this.playerInnerShieldMesh)

    // Equator Energy Ring 1 (Horizontal)
    const playerRingMat = new THREE.MeshBasicMaterial({
      map: this.vfxTextures.shockwave,
      color: 0x66ccff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.playerShieldRing = new THREE.Mesh(playerRingGeo, playerRingMat)
    this.playerShieldRing.rotation.x = Math.PI / 2
    this.playerShieldRing.position.copy(pBase)
    this.playerShieldRing.renderOrder = 24
    this.scene.add(this.playerShieldRing)

    // Equator Energy Ring 2 (Inclined Gyroscopic Latitude Band)
    const playerRing2Mat = new THREE.MeshBasicMaterial({
      map: this.vfxTextures.shockwave,
      color: 0x00e1ff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.playerShieldRing2 = new THREE.Mesh(playerRing2Geo, playerRing2Mat)
    this.playerShieldRing2.rotation.x = Math.PI / 2.35
    this.playerShieldRing2.rotation.y = 0.45
    this.playerShieldRing2.position.copy(pBase)
    this.playerShieldRing2.renderOrder = 24
    this.scene.add(this.playerShieldRing2)

    // Player Ground Outer Runic Circle (diameter 4.8m on marble floor y = -0.835)
    const runeOuterGeo = new THREE.PlaneGeometry(4.8, 4.8)
    const playerRuneMat = new THREE.MeshBasicMaterial({
      map: this.vfxTextures.runeCircle,
      color: 0x38b6ff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.playerRuneMesh = new THREE.Mesh(runeOuterGeo, playerRuneMat)
    this.playerRuneMesh.rotation.x = -Math.PI / 2
    this.playerRuneMesh.position.set(this.playerBasePos.x, -0.835, this.playerBasePos.z)
    this.playerRuneMesh.renderOrder = 5
    this.scene.add(this.playerRuneMesh)

    // Player Ground Inner Runic Star Ring (diameter 3.2m)
    const runeInnerGeo = new THREE.PlaneGeometry(3.2, 3.2)
    const playerRuneInnerMat = new THREE.MeshBasicMaterial({
      map: this.vfxTextures.runeCircleInner,
      color: 0x66d9ff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.playerRuneInnerMesh = new THREE.Mesh(runeInnerGeo, playerRuneInnerMat)
    this.playerRuneInnerMesh.rotation.x = -Math.PI / 2
    this.playerRuneInnerMesh.position.set(this.playerBasePos.x, -0.834, this.playerBasePos.z)
    this.playerRuneInnerMesh.renderOrder = 6
    this.scene.add(this.playerRuneInnerMesh)

    // 2. Enemy (Voldemort) Full-Body Spherical Forcefield (Radius 2.40m enclosing Voldemort 100%)
    const enemyShieldGeo = new THREE.SphereGeometry(2.40, 48, 36)
    const enemyInnerGeo = new THREE.SphereGeometry(2.28, 36, 28)
    const enemyRimGeo = new THREE.SphereGeometry(2.42, 48, 36)
    const enemyRingGeo = new THREE.RingGeometry(2.36, 2.48, 64)
    const enemyRing2Geo = new THREE.RingGeometry(2.34, 2.46, 64)

    const enemyCenterY = -0.15
    const eBase = new THREE.Vector3(this.opponentBasePos.x, enemyCenterY, this.opponentBasePos.z)

    const enemyMat = new THREE.MeshBasicMaterial({
      map: this.vfxTextures.shieldHex,
      color: 0x00ff88,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.enemyShieldMesh = new THREE.Mesh(enemyShieldGeo, enemyMat)
    this.enemyShieldMesh.position.copy(eBase)
    this.enemyShieldMesh.renderOrder = 20
    this.scene.add(this.enemyShieldMesh)

    const enemyRimMat = new THREE.MeshBasicMaterial({
      color: 0x33ffaa,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.enemyShieldRim = new THREE.Mesh(enemyRimGeo, enemyRimMat)
    this.enemyShieldRim.position.copy(eBase)
    this.enemyShieldRim.renderOrder = 22
    this.scene.add(this.enemyShieldRim)

    const enemyInnerMat = new THREE.MeshBasicMaterial({
      color: 0x009944,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.enemyInnerShieldMesh = new THREE.Mesh(enemyInnerGeo, enemyInnerMat)
    this.enemyInnerShieldMesh.position.copy(eBase)
    this.enemyInnerShieldMesh.renderOrder = 18
    this.scene.add(this.enemyInnerShieldMesh)

    const enemyRingMat = new THREE.MeshBasicMaterial({
      map: this.vfxTextures.shockwave,
      color: 0x44ffaa,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.enemyShieldRing = new THREE.Mesh(enemyRingGeo, enemyRingMat)
    this.enemyShieldRing.rotation.x = Math.PI / 2
    this.enemyShieldRing.position.copy(eBase)
    this.enemyShieldRing.renderOrder = 24
    this.scene.add(this.enemyShieldRing)

    const enemyRing2Mat = new THREE.MeshBasicMaterial({
      map: this.vfxTextures.shockwave,
      color: 0x22ffcc,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.enemyShieldRing2 = new THREE.Mesh(enemyRing2Geo, enemyRing2Mat)
    this.enemyShieldRing2.rotation.x = Math.PI / 2.35
    this.enemyShieldRing2.rotation.y = -0.45
    this.enemyShieldRing2.position.copy(eBase)
    this.enemyShieldRing2.renderOrder = 24
    this.scene.add(this.enemyShieldRing2)

    // Enemy Outer Runic Circle (diameter 4.8m)
    const enemyRuneOuterGeo = new THREE.PlaneGeometry(4.8, 4.8)
    const enemyRuneMat = new THREE.MeshBasicMaterial({
      map: this.vfxTextures.runeCircle,
      color: 0x00ff88,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.enemyRuneMesh = new THREE.Mesh(enemyRuneOuterGeo, enemyRuneMat)
    this.enemyRuneMesh.rotation.x = -Math.PI / 2
    this.enemyRuneMesh.position.set(this.opponentBasePos.x, -0.835, this.opponentBasePos.z)
    this.enemyRuneMesh.renderOrder = 5
    this.scene.add(this.enemyRuneMesh)

    // Enemy Inner Runic Star Ring (diameter 3.2m)
    const enemyRuneInnerGeo = new THREE.PlaneGeometry(3.2, 3.2)
    const enemyRuneInnerMat = new THREE.MeshBasicMaterial({
      map: this.vfxTextures.runeCircleInner,
      color: 0x44ffaa,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.enemyRuneInnerMesh = new THREE.Mesh(enemyRuneInnerGeo, enemyRuneInnerMat)
    this.enemyRuneInnerMesh.rotation.x = -Math.PI / 2
    this.enemyRuneInnerMesh.position.set(this.opponentBasePos.x, -0.834, this.opponentBasePos.z)
    this.enemyRuneInnerMesh.renderOrder = 6
    this.scene.add(this.enemyRuneInnerMesh)
  }

  // --- 3D Beam Clash Core & Particle Emitter ---
  private buildMagicBeamClash() {
    const starCanvas = document.createElement('canvas')
    starCanvas.width = 128
    starCanvas.height = 128
    const sctx = starCanvas.getContext('2d')!
    const sgrad = sctx.createRadialGradient(64, 64, 4, 64, 64, 60)
    sgrad.addColorStop(0, '#ffffff')
    sgrad.addColorStop(0.2, '#fff2a8')
    sgrad.addColorStop(0.5, '#ffaa00')
    sgrad.addColorStop(1, 'rgba(255, 170, 0, 0)')
    sctx.fillStyle = sgrad
    sctx.fillRect(0, 0, 128, 128)
    const starTexture = new THREE.CanvasTexture(starCanvas)

    const starMat = new THREE.SpriteMaterial({
      map: starTexture,
      blending: THREE.AdditiveBlending,
      color: 0xffffff,
    })
    this.clashCoreSprite = new THREE.Sprite(starMat)
    this.clashCoreSprite.scale.set(1.4, 1.4, 1)
    this.clashCoreSprite.position.copy(this.CLASH_CENTER)
    this.scene.add(this.clashCoreSprite)

    const ringGeo = new THREE.RingGeometry(0.2, 0.4, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf5cf73,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    })
    this.shockwaveMesh = new THREE.Mesh(ringGeo, ringMat)
    this.shockwaveMesh.rotation.x = Math.PI / 2
    this.shockwaveMesh.position.set(this.CLASH_CENTER.x, -0.85, this.CLASH_CENTER.z)
    this.scene.add(this.shockwaveMesh)

    const sparkCount = 200
    const sparkGeo = new THREE.BufferGeometry()
    this.sparkPositions = new Float32Array(sparkCount * 3)
    this.sparkVelocities = new Float32Array(sparkCount * 3)

    for (let i = 0; i < sparkCount; i++) {
      this.sparkPositions[i * 3] = this.CLASH_CENTER.x
      this.sparkPositions[i * 3 + 1] = this.CLASH_CENTER.y
      this.sparkPositions[i * 3 + 2] = this.CLASH_CENTER.z

      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const speed = 0.8 + Math.random() * 2.2
      this.sparkVelocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta)
      this.sparkVelocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta)
      this.sparkVelocities[i * 3 + 2] = speed * Math.cos(phi)
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(this.sparkPositions, 3))
    const sparkMat = new THREE.PointsMaterial({
      color: 0xfffa65,
      size: 0.045,
      blending: THREE.AdditiveBlending,
      transparent: true,
    })
    this.sparkPoints = new THREE.Points(sparkGeo, sparkMat)
    this.scene.add(this.sparkPoints)
  }

  // --- Dynamic 3D Cast Flash & Muzzle Effects ---
  private wandMuzzleSprite!: THREE.Sprite
  private dracoAuraSprite!: THREE.Sprite
  private stunStarsGroup!: THREE.Group
    // Post-processing
  private composer!: EffectComposer
  private bloomPass!: UnrealBloomPass
  private baseBloomStrength = 0.22  // Balanced, atmospheric glow level
  private targetBloomStrength = 0.22
  
  // Camera modes: 'cinematic' (over-shoulder) vs 'side' (90 degree)
  private cameraMode: 'cinematic' | 'side' | 'mobile' | 'portrait' = 'cinematic'
  
  // Camera positions for each mode
  private readonly CAMERA_POSITIONS = {
    // Cinematic: Over-shoulder from Harry's right POV, dramatic angle with clear line of sight down the table (Desktop default)
    cinematic: { pos: new THREE.Vector3(-0.95, 0.42, 3.40), look: new THREE.Vector3(-0.05, -0.05, -3.20) },
    // Side: 90-degree view from the audience seats (Desktop alternative)
    side: { pos: new THREE.Vector3(-5.5, 0.35, 0.5), look: new THREE.Vector3(0, -0.1, 0.5) },
    // Mobile: Landscape view optimized for wider screens
    mobile: { pos: new THREE.Vector3(-4.5, 0.6, 0.3), look: new THREE.Vector3(0, -0.05, 0.3) },
    // Portrait: Vertical mobile view framing Harry in foreground, arena in center, Voldemort in background
    portrait: { pos: new THREE.Vector3(-1.35, 1.40, 3.75), look: new THREE.Vector3(0, 0.05, -1.8) }
  }
  
  private camRecoil = 0
  private resizeHandler: (() => void) | null = null

  private buildCastVfx() {
    // 1. Harry Wand Muzzle Flare
    const flareCanvas = document.createElement('canvas')
    flareCanvas.width = 128
    flareCanvas.height = 128
    const fctx = flareCanvas.getContext('2d')!
    const fgrad = fctx.createRadialGradient(64, 64, 4, 64, 64, 60)
    fgrad.addColorStop(0, '#ffffff')
    fgrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.95)')
    fgrad.addColorStop(0.75, 'rgba(255, 255, 255, 0.40)')
    fgrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
    fctx.fillStyle = fgrad
    fctx.fillRect(0, 0, 128, 128)
    const flareTexture = new THREE.CanvasTexture(flareCanvas)

    this.wandMuzzleSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: flareTexture,
      blending: THREE.AdditiveBlending,
      color: 0xffffff,
      transparent: true,
      opacity: 0,
    }))
    this.wandMuzzleSprite.scale.set(0.65, 0.65, 1)
    if (this.playerLego?.wandTipGroup) {
      this.wandMuzzleSprite.position.set(0, 0, 0)
      this.playerLego.wandTipGroup.add(this.wandMuzzleSprite)
    } else {
      this.wandMuzzleSprite.position.copy(this.HARRY_WAND)
      this.scene.add(this.wandMuzzleSprite)
    }

    // 2. Draco Charging Aura Vortex
    const auraCanvas = document.createElement('canvas')
    auraCanvas.width = 128
    auraCanvas.height = 128
    const actx = auraCanvas.getContext('2d')!
    const agrad = actx.createRadialGradient(64, 64, 10, 64, 64, 60)
    agrad.addColorStop(0, '#00ff88')
    agrad.addColorStop(0.5, 'rgba(0, 255, 136, 0.5)')
    agrad.addColorStop(1, 'rgba(0, 255, 136, 0)')
    actx.fillStyle = agrad
    actx.fillRect(0, 0, 128, 128)
    const auraTexture = new THREE.CanvasTexture(auraCanvas)

    this.dracoAuraSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: auraTexture,
      blending: THREE.AdditiveBlending,
      color: 0x00ff88,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }))
    this.dracoAuraSprite.scale.set(0.22, 0.22, 1)
    if (this.opponentWandTip) {
      this.dracoAuraSprite.position.set(0, 0, 0)
      this.opponentWandTip.add(this.dracoAuraSprite)
    } else {
      this.dracoAuraSprite.position.copy(this.opponentBasePos)
      this.scene.add(this.dracoAuraSprite)
    }

    // 3. Stun Orbiting Stars
    this.stunStarsGroup = new THREE.Group()
    if (this.opponentGroup) {
      this.stunStarsGroup.position.set(0, 1.95, 0)
      this.opponentGroup.add(this.stunStarsGroup)
    } else {
      this.stunStarsGroup.position.set(0.35, 1.2, -3.45)
      this.scene.add(this.stunStarsGroup)
    }
    for (let s = 0; s < 3; s++) {
      const starMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.08, 0),
        new THREE.MeshBasicMaterial({ color: 0xffea00 })
      )
      const angle = (s / 3) * Math.PI * 2
      starMesh.position.set(Math.cos(angle) * 0.35, 0, Math.sin(angle) * 0.35)
      this.stunStarsGroup.add(starMesh)
    }
    this.stunStarsGroup.visible = false
    this.scene.add(this.stunStarsGroup)
  }

  // --- Projectile Creation & Firing ---
  private fireProjectile(spell: SpellGesture, isPlayer: boolean) {
    this.audio.playSpellCast(spell.name)

    const startPos = isPlayer
      ? this.getHarryWandWorldPos().clone()
      : (this.opponentGroup ? this.opponentGroup.position.clone().add(new THREE.Vector3(0, 0.72, 0)) : this.getDracoWandWorldPos().clone())
    const targetPos = isPlayer
      ? (this.opponentGroup ? this.opponentGroup.position.clone().add(new THREE.Vector3(0, 0.72, 0)) : this.getDracoWandWorldPos().clone())
      : (this.playerGroup ? this.playerGroup.position.clone().add(new THREE.Vector3(0, 0.55, 0)) : this.getHarryWandWorldPos().clone())
    const direction = targetPos.clone().sub(startPos).normalize()
    const totalDist = startPos.distanceTo(targetPos)

    const group = new THREE.Group()

    let speed = 16.0
    let beamCore: THREE.Mesh | undefined
    let beamSheath: THREE.Mesh | undefined
    let beamOuterGlow: THREE.Mesh | undefined
    let laserFins: THREE.Mesh[] | undefined
    let lanceGroup: THREE.Group | undefined
    let groundReflectionRibbon: THREE.Mesh | undefined
    let floorReflectionGroup: THREE.Group | undefined
    let machCones: any[] | undefined
    let lightningLines: THREE.Line[] | undefined
    let headSpark: THREE.Sprite | undefined
    let headDiamond: THREE.Sprite | undefined
    let beamHolding = false
    let beamHoldTimer = 0

    let fireCore: THREE.Mesh | undefined
    let fireConnectingStream: THREE.Mesh | undefined
    let flameVortexSprites: THREE.Sprite[] | undefined
    let smokeSprites: THREE.Sprite[] | undefined
    let flameTailSprites: THREE.Sprite[] | undefined
    let groundScorchMesh: THREE.Mesh | undefined
    let incendio3DVortex: THREE.Group | undefined

    let doubleHelixGold: any
    let doubleHelixCrimson: any
    let doubleHelixGoldSpark: any
    let headAnamorphic: THREE.Sprite | undefined
    let targetSpark: THREE.Sprite | undefined
    let targetDiamond: THREE.Sprite | undefined
    let targetAnamorphic: THREE.Sprite | undefined
    const extraLights: THREE.PointLight[] = []

    let stupefyNucleus: THREE.Mesh | undefined
    let stupefyAura: THREE.Mesh | undefined
    let stupefyOuterHalo: THREE.Mesh | undefined
    let stupefyCrossFlare: THREE.Sprite | undefined
    let gyroRings: THREE.Mesh[] | undefined
    let sonicRings: THREE.Mesh[] | undefined

    let skullSprite: THREE.Sprite | undefined
    let skullGlow: THREE.Sprite | undefined
    let mouthFlash: THREE.Sprite | undefined
    let skull3DMesh: THREE.Group | undefined
    let skullMistSprites: THREE.Sprite[] | undefined
    let skullVaporSprites: THREE.Sprite[] | undefined
    let floorLightningLines: THREE.Line[] | undefined
    let floorLightningTubes: THREE.Mesh[] | undefined
    let skullLightningTethers: THREE.Line[] | undefined
    let shroudSprites: THREE.Sprite[] | undefined
    let starburstSprite: THREE.Sprite | undefined
    let vRedSpark: THREE.Sprite | undefined
    let vRedCorona: THREE.Sprite | undefined
    let detailedTrunk: THREE.Vector3[] | undefined
    let advancedVisuals: AdvancedSpellVisuals | undefined

    let lightColor = spell.color
    let lightIntensity = 22.0
    let lightDist = 14.0

    if (spell.name === 'expelliarmus') {
      // --- 1. CANON EXPELLIARMUS: High-Speed Aerodynamic Dazzling Scarlet Jet (Book Canon) ---
      // J.K. Rowling Canon: "A jet of dazzling scarlet light blasted from his wand..."
      // Supersonic aerodynamic lance of ruby light streaking swiftly across the dueling table!
      speed = PROJECTILE_SPEED.EXPELLIARMUS || 16.0
      group.position.copy(startPos)
      lightColor = 0xff1e38
      lightIntensity = 3.6
      lightDist = 8.5

      lanceGroup = new THREE.Group()
      lanceGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)

      // A. Incandescent White-Hot Lance Core (needle-sharp elongated teardrop)
      const coreGeo = new THREE.CylinderGeometry(0.045, 0.015, 2.2, 16)
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
      })
      beamCore = new THREE.Mesh(coreGeo, coreMat)
      lanceGroup.add(beamCore)

      // B. Searing Scarlet Inner Sheath (saturated brilliant ruby plasma)
      const sheathGeo = new THREE.CylinderGeometry(0.12, 0.04, 2.4, 16)
      const sheathMat = new THREE.MeshBasicMaterial({
        color: 0xff0028,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
      })
      beamSheath = new THREE.Mesh(sheathGeo, sheathMat)
      lanceGroup.add(beamSheath)

      // C. Radiant Crimson Outer Corona Aura (soft volumetric ruby envelope)
      const outerGeo = new THREE.CylinderGeometry(0.26, 0.08, 2.8, 16)
      const outerMat = new THREE.MeshBasicMaterial({
        color: 0xff1e38,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
      })
      beamOuterGlow = new THREE.Mesh(outerGeo, outerMat)
      lanceGroup.add(beamOuterGlow)

      // D. Twin Intertwined Helical Plasma Ribbons (Amber-Gold & Scarlet)
      const lanceLen = 2.20
      const goldCurve = new HelixCurve3D(0.16, 2.5, lanceLen, 0)
      const goldGeo = new THREE.TubeGeometry(goldCurve, 64, 0.012, 8, false)
      const goldMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24, // Radiant amber-gold
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
      doubleHelixGold = new THREE.Mesh(goldGeo, goldMat)
      lanceGroup.add(doubleHelixGold)

      const crimsonCurve = new HelixCurve3D(0.16, 2.5, lanceLen, Math.PI)
      const crimsonGeo = new THREE.TubeGeometry(crimsonCurve, 64, 0.010, 8, false)
      const crimsonMat = new THREE.MeshBasicMaterial({
        color: 0xff1e38, // Intense scarlet-crimson
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
      })
      doubleHelixCrimson = new THREE.Mesh(crimsonGeo, crimsonMat)
      lanceGroup.add(doubleHelixCrimson)

      group.add(lanceGroup)

      // E. Piercing Tip Optical Flare & Starburst (Mounted forward on the lance tip)
      const tipOffset = direction.clone().multiplyScalar(1.10)

      // Front Incandescent Diamond Nucleus Sphere
      const headNucleusGeo = new THREE.SphereGeometry(0.08, 16, 16)
      const headNucleusMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const headNucleusMesh = new THREE.Mesh(headNucleusGeo, headNucleusMat)
      headNucleusMesh.position.copy(tipOffset)
      group.add(headNucleusMesh)

      // Front Radiant Ruby Corona Sphere
      const headCoronaGeo = new THREE.SphereGeometry(0.18, 16, 16)
      const headCoronaMat = new THREE.MeshBasicMaterial({
        color: 0xff0028,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
      const headCoronaMesh = new THREE.Mesh(headCoronaGeo, headCoronaMat)
      headCoronaMesh.position.copy(tipOffset)
      group.add(headCoronaMesh)

      // Anamorphic horizontal optical flare streak
      const flareMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.anamorphicFlare,
        color: 0xff2a4a,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
      headAnamorphic = new THREE.Sprite(flareMat)
      headAnamorphic.scale.set(2.6, 0.35, 1)
      headAnamorphic.position.copy(tipOffset)
      group.add(headAnamorphic)

      // Sharp white starburst spark
      const starMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.spark,
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      headSpark = new THREE.Sprite(starMat)
      headSpark.scale.set(0.95, 0.95, 1)
      headSpark.position.copy(tipOffset)
      group.add(headSpark)

      // Crimson circular diamond corona
      const coronaMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.corona,
        color: 0xff1e38,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
      })
      headDiamond = new THREE.Sprite(coronaMat)
      headDiamond.scale.set(1.25, 1.25, 1)
      headDiamond.position.copy(tipOffset)
      group.add(headDiamond)
    } else if (spell.name === 'avadakedavra') {
      // --- 4. AVADA KEDAVRA: Violent Jagged Emerald Lightning & Ethereal Phantom Skull (Exact Concept Sketch 4) ---
      speed = 0
      beamHolding = true
      beamHoldTimer = 2.80 // 2800ms sustained cinematic lightning storm
      lightColor = 0x059669
      lightIntensity = 3.5
      lightDist = 6.5

      // Position group at midpoint between caster wand and target
      const midPos = startPos.clone().lerp(targetPos, 0.5)
      group.position.copy(midPos)

      lanceGroup = new THREE.Group()
      lanceGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)

      // A. Multi-Forked Electric Lighting Group
      laserFins = []

      // B. Violent Jagged Fractal Lightning Core & Sheath (Shooting directly through the screaming phantom skull)
      // Anchor waypoints: Harry's wand -> Mid-air leap -> Piercing skull throat -> Blasting screaming mouth -> Voldemort
      const trunkPoints: THREE.Vector3[] = [
        new THREE.Vector3(0.0, -totalDist * 0.50, 0.0), // Harry's wand tip
        new THREE.Vector3(-0.10, -totalDist * 0.35, 0.06), // Shoot forward & leap up-left
        new THREE.Vector3(0.04, -totalDist * 0.20, -0.04), // Acute zig entering center alignment
        new THREE.Vector3(0.0, -0.40, 0.0), // Entering rear skull / throat conduit
        new THREE.Vector3(0.0, 0.0, 0.0), // Dead center piercing screaming mouth!
        new THREE.Vector3(0.0, 0.40, 0.0), // Blasting straight out through open jaw!
        new THREE.Vector3(-0.06, totalDist * 0.22, 0.05), // Surges forward toward Voldemort
        new THREE.Vector3(0.04, totalDist * 0.36, -0.03), // Clean acute zig toward Voldemort
        new THREE.Vector3(0.0, totalDist * 0.50, 0.0), // Striking Voldemort!
      ]
      // Subdivide each segment with 2 jittered high-voltage micro-steps
      detailedTrunk = []
      for (let i = 0; i < trunkPoints.length - 1; i++) {
        detailedTrunk.push(trunkPoints[i])
        const p0 = trunkPoints[i]
        const p1 = trunkPoints[i + 1]
        for (let step = 1; step <= 2; step++) {
          const frac = step / 3
          const mid = p0.clone().lerp(p1, frac)
          // Inside the skull conduit (between Y = -0.42 and +0.42), constrain jitter so beam shoots straight and cleanly through the mouth
          const isInsideSkull = Math.abs(mid.y) < 0.42
          const jitterScale = isInsideSkull ? 0.005 : 0.08
          mid.x += (Math.random() - 0.5) * jitterScale
          mid.z += (Math.random() - 0.5) * jitterScale
          detailedTrunk.push(mid)
        }
      }
      detailedTrunk.push(trunkPoints[trunkPoints.length - 1])
      const trunkCurve = new THREE.CatmullRomCurve3(detailedTrunk, false, 'catmullrom', 0.0)

      // White-Hot Searing Jagged Plasma Core Tube
      const coreGeo = new THREE.TubeGeometry(trunkCurve, 64, 0.012, 8, false)
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xecfeff,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      beamCore = new THREE.Mesh(coreGeo, coreMat)
      lanceGroup.add(beamCore)

      // Deep Menacing Emerald Jagged Sheath Tube
      const auraGeo = new THREE.TubeGeometry(trunkCurve, 64, 0.042, 8, false)
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0x047857,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      beamSheath = new THREE.Mesh(auraGeo, auraMat)
      lanceGroup.add(beamSheath)

      // Deep Viridian Dark Glow Halo
      const outerGeo = new THREE.TubeGeometry(trunkCurve, 64, 0.085, 8, false)
      const outerMat = new THREE.MeshBasicMaterial({
        color: 0x02593d,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      beamOuterGlow = new THREE.Mesh(outerGeo, outerMat)
      lanceGroup.add(beamOuterGlow)

      // C. 12 Branching Fractal Jagged Lightning Arcs leaping OFF the Main Trunk
      lightningLines = []
      const arcColors = [0xecfeff, 0x047857, 0x059669, 0x10b981, 0xffffff, 0x047857, 0x02593d, 0x059669, 0xecfeff, 0x047857, 0x10b981, 0x059669]
      const branchOrigins = [2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 16, 17]
      const branchDirs = [
        new THREE.Vector3(-0.45, 0.40, 0.20),
        new THREE.Vector3(0.35, -0.38, -0.15),
        new THREE.Vector3(-0.55, -0.15, 0.25),
        new THREE.Vector3(0.50, 0.20, -0.20),
        new THREE.Vector3(-0.35, 0.45, -0.15),
        new THREE.Vector3(0.25, -0.35, 0.25),
        new THREE.Vector3(-0.40, -0.25, -0.20),
        new THREE.Vector3(0.35, 0.35, 0.15),
        new THREE.Vector3(-0.30, 0.30, 0.30),
        new THREE.Vector3(0.28, -0.25, -0.25),
        new THREE.Vector3(-0.25, -0.40, 0.15),
        new THREE.Vector3(0.30, 0.40, -0.15),
      ]
      for (let a = 0; a < 12; a++) {
        const segCount = 20
        const points: THREE.Vector3[] = []
        const origIdx = Math.min(branchOrigins[a], detailedTrunk.length - 1)
        const root = detailedTrunk[origIdx].clone()
        const bDir = branchDirs[a]
        points.push(root)
        let curr = root.clone()
        for (let i = 1; i <= segCount; i++) {
          curr = curr.clone().add(bDir.clone().multiplyScalar(0.045))
          curr.x += (Math.random() - 0.5) * 0.08
          curr.y += (Math.random() - 0.5) * 0.08
          curr.z += (Math.random() - 0.5) * 0.08
          points.push(curr)
        }
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
        const lineMat = new THREE.LineBasicMaterial({
          color: arcColors[a],
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.95,
        })
        const line = new THREE.Line(lineGeo, lineMat)
        lanceGroup.add(line)
        lightningLines.push(line)
      }
      group.add(lanceGroup)

      // D. Menacing Ethereal Anatomical Phantom Skull (Shot directly through by the Avada Beam)
      // At y = 0.40, the open screaming mouth aligns exactly at y = 0.0 with the piercing beam
      const skullCenter = new THREE.Vector3(0.0, 0.40, 0.0)

      // Layer 1: Anatomical Spectral Skull with deep black socket voids & incandescent soul embers
      const skullMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.skullMist,
        color: 0xffffff, // Pure white preserves full emerald hues, sharp teeth, and void eye sockets
        blending: THREE.NormalBlending,
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
      })
      skullSprite = new THREE.Sprite(skullMat)
      skullSprite.scale.set(2.1, 2.35, 1)
      skullSprite.position.copy(skullCenter)
      group.add(skullSprite)

      // Layer 2: Luminescent Emerald Spectral Flame Glow
      const skullGlowMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.skullMist,
        color: 0x34d399, // Vibrant emerald flame glow
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
      })
      skullGlow = new THREE.Sprite(skullGlowMat)
      skullGlow.scale.set(2.25, 2.50, 1)
      skullGlow.position.copy(skullCenter)
      group.add(skullGlow)

      // Layer 3: Deep Viridian Phantom Corona Aura
      const skullAuraMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.corona,
        color: 0x047857,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      })
      const skullAura = new THREE.Sprite(skullAuraMat)
      skullAura.scale.set(3.4, 3.4, 1)
      skullAura.position.copy(skullCenter)
      group.add(skullAura)

      // Layer 4: Erupting White-Hot Plasma Core Burst at the screaming mouth exit (y = 0.0)
      const mouthFlashMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.emeraldStarburst,
        color: 0xecfeff,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
      mouthFlash = new THREE.Sprite(mouthFlashMat)
      mouthFlash.scale.set(1.3, 1.3, 1)
      mouthFlash.position.set(skullCenter.x, -0.02, skullCenter.z + 0.25)
      group.add(mouthFlash)

      // D2. High-Voltage Fractal Lightning Arcs linking Skull Cranium directly into the Beam Core (Airborne only, ZERO floor contact)
      skullLightningTethers = []
      const tetherConfigs = [
        { from: new THREE.Vector3(0.0, 0.35, -0.05), trunkIdx: 7, col: 0xecfeff },    // Crown -> Upper arc
        { from: new THREE.Vector3(-0.24, 0.10, 0.08), trunkIdx: 8, col: 0x059669 },   // Left temple -> Beam
        { from: new THREE.Vector3(0.24, 0.10, 0.08), trunkIdx: 10, col: 0x047857 },   // Right temple -> Beam
        { from: new THREE.Vector3(0.0, -0.38, 0.14), trunkIdx: 11, col: 0xecfeff },    // Jaw -> Erupting Beam Core
      ]

      for (let t = 0; t < tetherConfigs.length; t++) {
        const tc = tetherConfigs[t]
        const pStart = skullCenter.clone().add(tc.from)
        let pEnd: THREE.Vector3
        if (detailedTrunk && lanceGroup) {
          const rawTrunk = detailedTrunk[Math.min(tc.trunkIdx, detailedTrunk.length - 1)]
          pEnd = rawTrunk.clone().applyQuaternion(lanceGroup.quaternion)
        } else {
          pEnd = new THREE.Vector3(skullCenter.x, skullCenter.y - 0.18, skullCenter.z)
        }

        const pts: THREE.Vector3[] = []
        const count = 10
        for (let i = 0; i < count; i++) {
          const frac = i / (count - 1)
          const p = pStart.clone().lerp(pEnd, frac)
          if (i > 0 && i < count - 1) {
            p.x += (Math.random() - 0.5) * 0.04
            p.y += (Math.random() - 0.5) * 0.04
            p.z += (Math.random() - 0.5) * 0.04
          }
          pts.push(p)
        }
        const tGeo = new THREE.BufferGeometry().setFromPoints(pts)
        const tMat = new THREE.LineBasicMaterial({
          color: tc.col,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.95,
        })
        const tLine = new THREE.Line(tGeo, tMat)
        group.add(tLine)
        skullLightningTethers.push(tLine)
      }

      // Ectoplasmic Green Wisps hovering in mid-air around the skull
      skullVaporSprites = []
      for (let v = 0; v < 16; v++) {
        const vMat = new THREE.SpriteMaterial({
          map: this.vfxTextures.smokePuff,
          color: v % 2 === 0 ? 0x047857 : 0x059669,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.45,
          depthWrite: false,
        })
        const vSp = new THREE.Sprite(vMat)
        const vAng = (v / 16) * Math.PI * 2
        const vRad = 0.42 + (v % 3) * 0.16
        vSp.position.set(
          skullCenter.x + Math.cos(vAng) * vRad,
          skullCenter.y + Math.sin(vAng * 2) * 0.22,
          skullCenter.z + Math.sin(vAng) * vRad * 0.6
        )
        const vScale = 0.85 + Math.random() * 0.45
        vSp.scale.set(vScale, vScale, 1)
        group.add(vSp)
        skullVaporSprites.push(vSp)
      }

      // Soft Green Mist Wisps hovering around the skull cranium
      skullMistSprites = []
      const baseMistOffsets = [
        new THREE.Vector3(-0.25, 0.28, 0.08),
        new THREE.Vector3(0.25, 0.28, -0.08),
        new THREE.Vector3(0.0, 0.42, 0.0),
        new THREE.Vector3(-0.18, -0.22, 0.10),
        new THREE.Vector3(0.18, -0.22, -0.05),
      ]
      for (let m = 0; m < baseMistOffsets.length; m++) {
        const mMat = new THREE.SpriteMaterial({
          map: this.vfxTextures.smokePuff,
          color: 0x047857,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.32,
          depthWrite: false,
        })
        const mSp = new THREE.Sprite(mMat)
        mSp.scale.set(1.1, 1.1, 1)
        mSp.position.set(
          skullCenter.x + baseMistOffsets[m].x,
          skullCenter.y + baseMistOffsets[m].y,
          skullCenter.z + baseMistOffsets[m].z
        )
        group.add(mSp)
        skullMistSprites.push(mSp)
      }

      // E. Muzzle Lens Flare & Needle Starburst at Harry's Wand Tip (Exploding rays matching Reference Image)
      const casterLocalPos = direction.clone().multiplyScalar(-totalDist * 0.5)
      const targetLocalPos = direction.clone().multiplyScalar(totalDist * 0.5)

      // Needle Starburst Sprite (Anti-aliased procedural needle rays)
      const sbMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.emeraldStarburst,
        color: 0xecfeff,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
      starburstSprite = new THREE.Sprite(sbMat)
      starburstSprite.scale.set(1.15, 1.15, 1)
      starburstSprite.position.copy(casterLocalPos)
      group.add(starburstSprite)

      // Anamorphic horizontal emerald laser streak
      const anamorphicMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.anamorphicFlare,
        color: 0x059669,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
      headAnamorphic = new THREE.Sprite(anamorphicMat)
      headAnamorphic.scale.set(1.10, 0.08, 1)
      headAnamorphic.position.copy(casterLocalPos)
      group.add(headAnamorphic)

      // Sharp white glint
      const starMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.spark,
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      headSpark = new THREE.Sprite(starMat)
      headSpark.scale.set(0.18, 0.18, 1)
      headSpark.position.copy(casterLocalPos)
      group.add(headSpark)

      // Emerald Corona Aura
      const diamondMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.corona,
        color: 0x047857,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
      headDiamond = new THREE.Sprite(diamondMat)
      headDiamond.scale.set(0.40, 0.40, 1)
      headDiamond.position.copy(casterLocalPos)
      group.add(headDiamond)

      // F. Target Impact Flares & Voldemort Swirling Shadow Shroud
      const redAnamorphicMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.anamorphicFlare,
        color: 0xff1e1e,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.90,
        depthWrite: false,
      })
      targetAnamorphic = new THREE.Sprite(redAnamorphicMat)
      targetAnamorphic.scale.set(1.4, 0.16, 1)
      targetAnamorphic.position.copy(targetLocalPos)
      group.add(targetAnamorphic)

      targetSpark = new THREE.Sprite(starMat.clone())
      targetSpark.scale.set(0.65, 0.65, 1)
      targetSpark.position.copy(targetLocalPos)
      group.add(targetSpark)

      const redDiamondMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.corona,
        color: 0xff2222,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.90,
        depthWrite: false,
      })
      targetDiamond = new THREE.Sprite(redDiamondMat)
      targetDiamond.scale.set(0.95, 0.95, 1)
      targetDiamond.position.copy(targetLocalPos)
      group.add(targetDiamond)

      // Swirling Dark Smoke Shroud around Voldemort (Matching Reference Image)
      shroudSprites = []
      const darkMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.darkSmoke,
        color: 0x06070a,
        blending: THREE.NormalBlending,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
      for (let s = 0; s < 24; s++) {
        const shSp = new THREE.Sprite(darkMat.clone())
        shSp.scale.set(3.4 + Math.random() * 0.8, 3.4 + Math.random() * 0.8, 1)
        shSp.position.set(
          targetLocalPos.x + (Math.random() - 0.5) * 0.90,
          targetLocalPos.y + (Math.random() - 0.5) * 0.75,
          targetLocalPos.z + (Math.random() - 0.5) * 0.45
        )
        group.add(shSp)
        shroudSprites.push(shSp)
      }

      // Voldemort Wand Tip Position (holding defensive wand forward on Voldemort's right)
      const vWandPos = new THREE.Vector3(targetLocalPos.x - 0.32, targetLocalPos.y + 0.18, targetLocalPos.z + 0.18)

      // Brilliant Red Defensive Wand Spark at Voldemort's Wand Tip (Matching Reference Image)
      vRedSpark = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.vfxTextures.spark,
        color: 0xff2222,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }))
      vRedSpark.scale.set(1.1, 1.1, 1)
      vRedSpark.position.copy(vWandPos)
      group.add(vRedSpark)

      // Red defensive corona aura at Voldemort's wand tip
      vRedCorona = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.vfxTextures.corona,
        color: 0xff3311,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }))
      vRedCorona.scale.set(1.5, 1.5, 1)
      vRedCorona.position.copy(vWandPos)
      group.add(vRedCorona)

      // G. Clean Table Floor (All floor effects and runes removed for clean dark table aesthetic)
      const groundMid = startPos.clone().lerp(targetPos, 0.5)

      // Dynamic Lights: Harry's wand, Skull center, Voldemort's wand
      const lightCaster = new THREE.PointLight(0x047857, 1.8, 3.8)
      lightCaster.position.copy(startPos).add(direction.clone().multiplyScalar(0.40))
      this.scene.add(lightCaster)
      extraLights.push(lightCaster)

      const lightSkull = new THREE.PointLight(0x059669, 3.2, 5.2)
      lightSkull.position.set(groundMid.x - 0.45, -0.15, groundMid.z)
      this.scene.add(lightSkull)
      extraLights.push(lightSkull)

      // Voldemort's wand red defensive light
      const lightTarget = new THREE.PointLight(0xef4444, 2.8, 3.8)
      lightTarget.position.copy(vWandPos)
      this.scene.add(lightTarget)
      extraLights.push(lightTarget)

      if (isPlayer && this.playerLego && this.opponentLego) {
        this.playerLego.isChanneling = true
        this.opponentLego.isTargetChanneling = true
      }
    } else if (spell.name === 'incendio') {
      // --- 2. INCENDIO: Giant 3.2m Roaring Fire Spiral Vortex & Smoke (Sketch 2) ---
      speed = 10.5
      group.position.copy(startPos)
      lightColor = 0xff5500
      lightIntensity = 34.0
      lightDist = 20.0

      // A. Molten golden-amber liquid flame core (diameter 0.44m, warm flame color)
      const fireCoreGeo = new THREE.SphereGeometry(0.22, 20, 20)
      const fireCoreMat = new THREE.MeshBasicMaterial({
        color: 0xffd044,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      fireCore = new THREE.Mesh(fireCoreGeo, fireCoreMat)
      group.add(fireCore)

      // B. Giant Archimedean Fire Spiral Vortex Discs (diameter up to 3.2m - Matching Sketch 2)
      flameVortexSprites = []
      const spiralColors = [0xffea55, 0xff8811, 0xff4400, 0xff2200]
      for (let s = 0; s < 4; s++) {
        const spMat = new THREE.SpriteMaterial({
          map: this.vfxTextures.fireSpiral,
          color: spiralColors[s],
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.95 - s * 0.12,
          rotation: (s * Math.PI) / 4,
          depthWrite: false,
        })
        const spSprite = new THREE.Sprite(spMat)
        // Starts compact near wand and scales smoothly in flight
        spSprite.scale.set(1.2, 1.2, 1)
        spSprite.position.set(0, 0, -(s * 0.12))
        group.add(spSprite)
        flameVortexSprites.push(spSprite)
      }

      // C. Thick Volumetric Dark Smoke Clouds billowing above/behind (Matching Sketch 2)
      smokeSprites = []
      for (let k = 0; k < 6; k++) {
        const smMat = new THREE.SpriteMaterial({
          map: this.vfxTextures.smokePuff,
          transparent: true,
          opacity: 0.85 - k * 0.08,
          rotation: Math.random() * Math.PI * 2,
          blending: THREE.NormalBlending, // NORMAL BLENDING makes dark smoke truly dark!
          depthWrite: false,
        })
        const smSprite = new THREE.Sprite(smMat)
        const smScale = 2.0 + k * 0.25
        smSprite.scale.set(smScale, smScale, 1)
        // Positioned above and trailing behind the vortex towards the ceiling
        smSprite.position.set(
          (Math.random() - 0.5) * 0.5,
          0.8 + k * 0.35,
          -(0.2 + k * 0.4)
        )
        group.add(smSprite)
        smokeSprites.push(smSprite)
      }

      // D. Wand Connection Flame Jet Cone (Stream connecting wand to vortex)
      const streamGeo = new THREE.CylinderGeometry(0.04, 0.45, 1.2, 16)
      streamGeo.translate(0, -0.6, 0)
      const streamMat = new THREE.MeshBasicMaterial({
        map: this.vfxTextures.flame,
        color: 0xff8800,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
      fireConnectingStream = new THREE.Mesh(streamGeo, streamMat)
      fireConnectingStream.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
      group.add(fireConnectingStream)

      // E. Trailing Dragon Fire Tail Comets
      flameTailSprites = []
      for (let t = 0; t < 5; t++) {
        const tMat = new THREE.SpriteMaterial({
          map: this.vfxTextures.flame,
          color: 0xff5500,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.82 - t * 0.14,
          rotation: Math.random() * Math.PI * 2,
          depthWrite: false,
        })
        const tSprite = new THREE.Sprite(tMat)
        const tailScale = 1.1 - t * 0.15
        tSprite.scale.set(tailScale, tailScale, 1)
        tSprite.position.copy(direction.clone().multiplyScalar(-(0.3 + t * 0.25)))
        group.add(tSprite)
        flameTailSprites.push(tSprite)
      }

      // F. Ground Scorch Decal Tracking on Floor (y = -0.835)
      const scorchGeo = new THREE.PlaneGeometry(2.6, 3.4)
      const scorchMat = new THREE.MeshBasicMaterial({
        map: this.vfxTextures.scorchDecal,
        color: 0xff5500,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
      groundScorchMesh = new THREE.Mesh(scorchGeo, scorchMat)
      groundScorchMesh.rotation.x = -Math.PI / 2
      groundScorchMesh.position.set(startPos.x, -0.835, startPos.z)
      this.scene.add(groundScorchMesh)

      // G. 3D Blender Procedural Fire Tornado Model
      if (this.incendioVortex3DTemplate) {
        incendio3DVortex = this.incendioVortex3DTemplate.clone(true)
        incendio3DVortex.scale.set(0.70, 0.70, 0.70)
        incendio3DVortex.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction)
        group.add(incendio3DVortex)
      }

    } else if (spell.name === 'sectumsempra') {
      speed = 17.0
      group.position.copy(startPos)
      lightColor = 0xff1111
      lightIntensity = 38.0
      lightDist = 16.0
      advancedVisuals = buildSectumsempraVisuals(group, direction, this.vfx8Textures)
    } else if (spell.name === 'petrificus') {
      speed = 14.5
      group.position.copy(startPos)
      lightColor = 0xd1d5db
      lightIntensity = 28.0
      lightDist = 14.0
      advancedVisuals = buildPetrificusVisuals(group, direction, this.vfx8Textures)
    } else if (spell.name === 'confringo') {
      speed = 16.0
      group.position.copy(startPos)
      lightColor = 0xff6600
      lightIntensity = 28.0
      lightDist = 16.0
      advancedVisuals = buildConfringoVisuals(group, direction, this.vfx8Textures)
    } else if (spell.name === 'immobulus') {
      speed = 15.0
      group.position.copy(startPos)
      lightColor = 0x38bdf8
      lightIntensity = 32.0
      lightDist = 16.0
      advancedVisuals = buildImmobulusVisuals(group, direction, this.vfx8Textures)
    } else if (spell.name === 'morsmordre') {
      speed = 12.0
      group.position.copy(startPos)
      lightColor = 0x22c55e
      lightIntensity = 45.0
      lightDist = 22.0
      advancedVisuals = buildMorsmordreVisuals(group, direction, this.vfx8Textures, this.phantomSkull3DTemplate)
    } else if (spell.name === 'levicorpus') {
      speed = 16.5
      group.position.copy(startPos)
      lightColor = 0xa855f7
      lightIntensity = 34.0
      lightDist = 16.0
      advancedVisuals = buildLevicorpusVisuals(group, direction, this.vfx8Textures)
    } else if (spell.name === 'obliviate') {
      speed = 15.0
      group.position.copy(startPos)
      lightColor = 0x06b6d4
      lightIntensity = 30.0
      lightDist = 16.0
      advancedVisuals = buildObliviateVisuals(group, direction, this.vfx8Textures)
    } else if (spell.name === 'expecto_patronum') {
      speed = 8.5
      group.position.copy(startPos)
      lightColor = 0xb0e0e6
      lightIntensity = 3.5
      lightDist = 12.0
      advancedVisuals = buildExpectoPatronumVisuals(group, direction, this.vfx8Textures, this.patronusStag3DTemplate)
    } else {
      // --- 3. STUPEFY: Celestial Singularity, 4 Gyro Rings & Giant Sonic Crescents (Sketch 3) ---
      speed = 13.5
      group.position.copy(startPos)
      lightColor = 0xffea00
      lightIntensity = 32.0
      lightDist = 18.0

      // A. White-hot dense gravity nucleus (compact miniature star)
      const nucGeo = new THREE.SphereGeometry(0.12, 24, 24)
      const nucMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      stupefyNucleus = new THREE.Mesh(nucGeo, nucMat)
      group.add(stupefyNucleus)

      // B. Electric cyan event horizon aura (celestial azure star)
      const coronaGeo = new THREE.SphereGeometry(0.24, 24, 24)
      const coronaMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
      })
      stupefyAura = new THREE.Mesh(coronaGeo, coronaMat)
      group.add(stupefyAura)

      // C. Deep celestial gravitational distort halo
      const haloGeo = new THREE.SphereGeometry(0.40, 24, 24)
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x0033cc,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
      })
      stupefyOuterHalo = new THREE.Mesh(haloGeo, haloMat)
      group.add(stupefyOuterHalo)

      // D. Piercing Anamorphic 4-Ray Lens Flare Cross (Matching Sketch 3)
      const flareMat = new THREE.SpriteMaterial({
        map: this.vfxTextures.anamorphicFlare,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
      stupefyCrossFlare = new THREE.Sprite(flareMat)
      stupefyCrossFlare.scale.set(2.2, 2.2, 1)
      group.add(stupefyCrossFlare)

      // E. 4 Intertwined Golden Filigree Gyroscopic Orbital Rings (Matching Sketch 3)
      gyroRings = []
      const ringGeo = new THREE.TorusGeometry(0.92, 0.022, 16, 64)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
      const ringAngles = [
        new THREE.Euler(Math.PI * 0.25, Math.PI * 0.1, 0),
        new THREE.Euler(-Math.PI * 0.28, Math.PI * 0.42, 0),
        new THREE.Euler(Math.PI * 0.12, -Math.PI * 0.38, Math.PI * 0.22),
        new THREE.Euler(Math.PI * 0.48, Math.PI * 0.18, -Math.PI * 0.28),
      ]
      for (let g = 0; g < 4; g++) {
        const gMesh = new THREE.Mesh(ringGeo, ringMat)
        gMesh.rotation.copy(ringAngles[g])
        group.add(gMesh)
        gyroRings.push(gMesh)
      }

      // F. Giant Golden Sonic Crescent Shockwaves (Matching Sketch 3)
      sonicRings = []
      const ringRadii = [
        { inner: 1.2, outer: 1.45 },
        { inner: 1.7, outer: 2.0 },
        { inner: 2.3, outer: 2.65 },
      ]
      for (let r = 0; r < 3; r++) {
        const sMat = new THREE.MeshBasicMaterial({
          map: this.vfxTextures.shockwave,
          color: 0xffd033,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.82 - r * 0.18,
          depthWrite: false,
        })
        const sMesh = new THREE.Mesh(new THREE.RingGeometry(ringRadii[r].inner, ringRadii[r].outer, 48), sMat)
        sMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction)
        group.add(sMesh)
        sonicRings.push(sMesh)
      }
    }

    // Dynamic Hall Illumination Point Light
    const light = new THREE.PointLight(lightColor, lightIntensity, lightDist)
    group.add(light)

    this.scene.add(group)

    this.projectiles.push({
      mesh: group,
      direction,
      speed,
      spell,
      isPlayer,
      active: true,
      progress: 0,
      light,
      startPos,
      targetPos,
      beamCore,
      beamSheath,
      beamOuterGlow,
      laserFins,
      lanceGroup,
      groundReflectionRibbon,
      floorReflectionGroup,
      originalDist: totalDist,
      machCones,
      lightningLines,
      doubleHelixGold,
      doubleHelixCrimson,
      doubleHelixGoldSpark,
      extraLights,
      headSpark,
      headDiamond,
      headAnamorphic,
      targetSpark,
      targetDiamond,
      targetAnamorphic,
      beamHolding,
      beamHoldTimer,
      fireCore,
      fireConnectingStream,
      flameVortexSprites,
      smokeSprites,
      flameTailSprites,
      groundScorchMesh,
      incendio3DVortex,
      stupefyNucleus,
      stupefyAura,
      stupefyOuterHalo,
      stupefyCrossFlare,
      gyroRings,
      sonicRings,
      skullSprite,
      skullGlow,
      mouthFlash,
      skull3DMesh,
      skullMistSprites,
      skullVaporSprites,
      floorLightningLines,
      floorLightningTubes,
      skullLightningTethers,
      detailedTrunk,
      shroudSprites,
      starburstSprite,
      vRedSpark,
      vRedCorona,
      advancedVisuals,
    })

    // Wand Muzzle Flash Sparks Burst (for non-beam projectile spells)
    if (spell.name !== 'avadakedavra') {
      this.spawnMuzzleVfx(startPos, spell.color, 28)
    }

    if (isPlayer) {
      this.playerCastProgress = 1.0
      this.wandLight.color.setHex(spell.color)
      this.wandLight.intensity = spell.name === 'avadakedavra' ? 1.0 : 3.8
      if (this.playerLego?.wandLight) {
        this.playerLego.wandLight.color.setHex(spell.color)
        this.playerLego.wandLight.intensity = 1.8
      }
      if (spell.name !== 'avadakedavra' && this.wandMuzzleSprite) {
        this.wandMuzzleSprite.material.color.setHex(spell.color)
        this.wandMuzzleSprite.material.opacity = 0.95
        this.wandMuzzleSprite.scale.set(0.75, 0.75, 1)
      }
      this.camRecoil = spell.name === 'avadakedavra' ? 0.06 : 0.22
    } else {
      this.opponentCastProgress = 1.0
      if (this.opponentLight) this.opponentLight.intensity = spell.name === 'avadakedavra' ? 0.8 : 1.4
    }
  }

  // --- Player Spellcast (From Gesture Recognition or Button) ---
  public castPlayerSpell(spellKey: string, accuracy: number = 95) {
    if (this.matchOver) {
      this.resetMatch()
    }
    if (this.inClashMode) return

    const time = this.clock?.getElapsedTime() ?? (performance.now() * 0.001)
    if (time < this.playerStunnedUntil) {
      const remaining = (this.playerStunnedUntil - time).toFixed(1)
      this.audio.playDrawFizzle()
      this.showCombatNumber(`🔒 BỊ KHÓA PHÉP (${remaining}s)!`, window.innerWidth * 0.35, window.innerHeight * 0.48, 'mana')
      this.showToast('KHÔNG THỂ THI TRIỂN PHÉP!', `Bạn đang bị dính hiệu ứng ${this.playerCCName}! Đũa phép bị khóa trong ${remaining}s`)
      return
    }

    const spell = SPELL_DECK[spellKey] || SPELL_DECK.expelliarmus
    const manaCost = spell.manaCost || 15

    // In multiplayer mode, enforce that ONLY the 4 equipped spells can be cast!
    if (this.gameMode === 'multiplayer' && !this.selectedMultiplayerSpells.includes(spell.name)) {
      this.audio.playDrawFizzle()
      this.showCombatNumber('🚫 CHƯA TRANG BỊ BÙA NÀY!', window.innerWidth * 0.35, window.innerHeight * 0.48, 'mana')
      this.showToast('BÙA CHƯA ĐƯỢC TRANG BỊ!', `Bạn chỉ có thể sử dụng 4 bùa đã chọn trong sảnh chờ Multiplayer!`)
      return
    }

    // Check Spell Cooldown
    const cdUntil = this.playerCooldowns[spell.name] || 0
    if (time < cdUntil) {
      const remaining = (cdUntil - time).toFixed(1)
      this.audio.playDrawFizzle()
      this.showCombatNumber(`⏳ HỒI CHIÊU (${remaining}s)!`, window.innerWidth * 0.35, window.innerHeight * 0.48, 'mana')
      this.showToast('BÙA ĐANG HỒI CHIÊU!', `${spell.displayName} đang trong thời gian hồi! Cần thêm ${remaining}s`)
      const dockSlot = document.querySelector(`.dock-slot[data-spell="${spell.name}"]`)
      if (dockSlot) {
        dockSlot.classList.remove('dock-slot-fizzle')
        void (dockSlot as HTMLElement).offsetWidth // force reflow
        dockSlot.classList.add('dock-slot-fizzle')
      }
      return
    }

    // Check Player Mana Pool
    if (this.playerMana < manaCost) {
      this.audio.playManaEmpty()
      this.triggerManaDepletedVfx(manaCost)
      this.showToast('KHÔNG ĐỦ PHÁP LỰC!', `Cần ${manaCost} MP để thi triển ${spell.displayName}! (Hiện có: ${Math.floor(this.playerMana)} MP)`)
      this.showCombatNumber(`⚠️ CẦN ${manaCost} MP!`, window.innerWidth * 0.35, window.innerHeight * 0.48, 'mana')
      return
    }

    // Deduct Mana, Trigger Cooldown & Visual Pulse Flare
    this.playerMana = Math.max(0, this.playerMana - manaCost)
    this.playerCooldowns[spell.name] = time + (spell.cooldown || 3.0)
    this.triggerManaPulseVfx()
    this.showCombatNumber(`-${manaCost} MP`, window.innerWidth * 0.35, window.innerHeight * 0.48, 'mana')
    this.updateHpBars()

    if (this.gameMode === 'multiplayer' && this.network?.isConnected) {
      this.network.send({ type: 'cast', payload: { spell: spell.name, accuracy } })
    }

    if (spell.name === 'protego') {
      // Activate Shield
      this.audio.playSpellCast('protego')
      this.playerShieldActiveUntil = (this.clock?.getElapsedTime() ?? 0) + 1.8
      this.showToast('PROTEGO ACTIVATED!', 'Khiên bảo vệ đã dựng! Sẵn sàng hóa giải đòn đánh')
      if (this.network?.isConnected) {
        this.network.send({ type: 'shield', payload: { activeUntil: this.playerShieldActiveUntil } })
      }
      return
    }

    // --- CROWD CONTROL SPELLS (Petrificus Totalus, Stupefy, Obliviate) ---
    // Direct target effect on opponent! NO projectile flies across the table!
    if (spell.name === 'petrificus' || spell.name === 'stupefy' || spell.name === 'obliviate') {
      this.playerCastProgress = 1.0
      this.audio.playSpellCast(spell.name)
      const wandPos = this.getHarryWandWorldPos().clone()
      this.spawnMuzzleVfx(wandPos, spell.color, 22)
      if (this.wandMuzzleSprite) {
        this.wandMuzzleSprite.material.opacity = 0.85
        this.wandMuzzleSprite.scale.set(0.65, 0.65, 1)
      }
      this.wandLight.intensity = 3.5
      this.camRecoil = 0.15

      // Wand CC Aura Effect around the caster's wand shaft & tip
      this.spawnWandCCVfx(true, spell.name)

      if (accuracy >= 85) {
        this.perfectCount++
        const refund = 5
        this.playerMana = Math.min(this.maxPlayerMana, this.playerMana + refund)
        this.audio.playManaSurge()
        this.showCombatNumber(`+${refund} MP (XUẤT SẮC)`, window.innerWidth * 0.35, window.innerHeight * 0.42, 'mana')
        this.updateHpBars()
        this.showToast(`PERFECT ${spell.displayName}`, `${spell.description} (+20% Hiệu lực & Hồi 5 MP)`)
      } else {
        this.showToast(`${spell.displayName}`, spell.description)
      }

      if (spell.name === 'petrificus') {
        this.applyPetrificusDirect(this.opponentLego)
      } else if (spell.name === 'stupefy') {
        this.applyStupefyDirect(this.opponentLego)
      } else if (spell.name === 'obliviate') {
        this.applyObliviateDirect(this.opponentLego)
      }
      return
    }

    // Offensive Projectile Spells (Expelliarmus, Avada Kedavra, Sectumsempra, Confringo, Expecto Patronum)
    this.fireProjectile(spell, true)

    if (accuracy >= 85) {
      this.perfectCount++
      const refund = 5
      this.playerMana = Math.min(this.maxPlayerMana, this.playerMana + refund)
      this.audio.playManaSurge()
      this.showCombatNumber(`+${refund} MP (XUẤT SẮC)`, window.innerWidth * 0.35, window.innerHeight * 0.42, 'mana')
      this.updateHpBars()
      this.showToast(`PERFECT ${spell.displayName}`, `${spell.description} (+20% Chí mạng & Hồi 5 MP)`)
    } else {
      this.showToast(`${spell.displayName}`, spell.description)
    }
  }

  // --- Opponent AI Update Loop ---
  private updateOpponentAI(time: number, delta: number) {
    if (this.matchOver || this.inClashMode || this.aiDisabled || this.gameMode === 'menu' || this.gameMode === 'multiplayer') return

    const opp = getCharacter(this.selectedOpponentChar)
    const oppFirstName = opp.name.split(' ')[0]

    // Stun / CC status check
    if (time < this.enemyStunnedUntil) {
      if (this.dracoAuraSprite) this.dracoAuraSprite.material.opacity = 0
      this.enemyCurrentCast = null
      this.opponentCastProgress = 0
      const telegraphElem = document.getElementById('enemy-telegraph')
      if (telegraphElem) telegraphElem.classList.add('hidden')
      return
    } else {
      if (this.stunStarsGroup) this.stunStarsGroup.visible = false
    }

    // Reaction Defense: Shield with Protego based on current tier's shieldChance
    const incomingPlayerSpell = this.projectiles.find(p => p.isPlayer && p.active && p.spell.name !== 'avadakedavra' && p.progress > 0.25 && !(p as any)._shieldEvaluated)
    if (incomingPlayerSpell) {
      (incomingPlayerSpell as any)._shieldEvaluated = true
      const shieldChance = this.currentTier ? this.currentTier.shieldChance : 0.35
      const protegoCD = this.enemyCooldowns['protego'] || 0
      if (!this.aiDisabled && time > this.enemyShieldActiveUntil && time >= protegoCD && Math.random() < shieldChance) {
        if (this.enemyMana >= SPELL_MANA.PROTEGO) {
          this.enemyMana = Math.max(0, this.enemyMana - SPELL_MANA.PROTEGO)
          this.enemyShieldActiveUntil = time + 1.5
          this.enemyCooldowns['protego'] = time + SPELL_COOLDOWN.PROTEGO
          this.audio.playSpellCast('protego')
          this.showCombatNumber(`${oppFirstName} BẬT KHIÊN!`, window.innerWidth * 0.72, window.innerHeight * 0.42, 'parry')
          this.updateHpBars()
        }
      }
    }

    // Attack Decision
    if (time >= this.enemyNextActionTime) {
      const allowedSpells = this.currentTier ? this.currentTier.spellPool : ['expelliarmus', 'stupefy', 'confringo', 'sectumsempra', 'petrificus']
      const pool: string[] = []

      // If boss or dark character has avadakedavra in pool
      if (allowedSpells.includes('avadakedavra') && (this.selectedOpponentChar === 'voldemort' || this.selectedOpponentChar === 'death_eater')) {
        const cd = this.enemyCooldowns['avadakedavra'] || 0
        if (time >= cd && this.enemyMana >= SPELL_MANA.AVADA_KEDAVRA && Math.random() < 0.35) {
          pool.push('avadakedavra')
        }
      }
      // If boss or light character has expecto_patronum in pool
      if (allowedSpells.includes('expecto_patronum') && (this.selectedOpponentChar === 'harry' || this.selectedOpponentChar === 'lupin')) {
        const cd = this.enemyCooldowns['expecto_patronum'] || 0
        if (time >= cd && this.enemyMana >= SPELL_MANA.EXPECTO_PATRONUM && Math.random() < 0.35) {
          pool.push('expecto_patronum')
        }
      }
      if (allowedSpells.includes('obliviate') && time >= (this.enemyCooldowns['obliviate'] || 0) && this.enemyMana >= SPELL_MANA.OBLIVIATE) {
        pool.push('obliviate')
      }
      if (allowedSpells.includes('confringo') && time >= (this.enemyCooldowns['confringo'] || 0) && this.enemyMana >= SPELL_MANA.CONFRINGO) {
        pool.push('confringo')
      }
      if (allowedSpells.includes('sectumsempra') && time >= (this.enemyCooldowns['sectumsempra'] || 0) && this.enemyMana >= SPELL_MANA.SECTUMSEMPRA) {
        pool.push('sectumsempra')
      }
      if (allowedSpells.includes('petrificus') && time >= (this.enemyCooldowns['petrificus'] || 0) && this.enemyMana >= SPELL_MANA.PETRIFICUS) {
        pool.push('petrificus')
      }
      if (allowedSpells.includes('stupefy') && time >= (this.enemyCooldowns['stupefy'] || 0) && this.enemyMana >= SPELL_MANA.STUPEFY) {
        pool.push('stupefy')
      }
      if (allowedSpells.includes('expelliarmus') && time >= (this.enemyCooldowns['expelliarmus'] || 0) && this.enemyMana >= SPELL_MANA.EXPELLIARMUS) {
        pool.push('expelliarmus')
      }

      if (pool.length === 0) {
        this.enemyNextActionTime = time + 1.0
        return
      }

      const chosen = pool[Math.floor(Math.random() * pool.length)]
      this.enemyCurrentCast = SPELL_DECK[chosen]

      const baseTelegraph = this.currentTier ? this.currentTier.telegraphTime : 1.25
      this.enemyTelegraphTime = time + (chosen === 'avadakedavra' ? (baseTelegraph + 0.35) : baseTelegraph)

      const intervalMin = this.currentTier ? this.currentTier.actionIntervalMin : 3.5
      const intervalMax = this.currentTier ? this.currentTier.actionIntervalMax : 5.2
      this.enemyNextActionTime = time + intervalMin + Math.random() * (intervalMax - intervalMin)

      // Show Telegraph Warning & Dynamic Aura
      if (this.dracoAuraSprite) this.dracoAuraSprite.material.opacity = 0.85
      const telegraphElem = document.getElementById('enemy-telegraph')
      if (telegraphElem) {
        telegraphElem.classList.remove('hidden')
        const enemyCastText = document.getElementById('enemy-cast-text')
      if (enemyCastText) enemyCastText.textContent = `${opp.name} ĐANG NIỆM: ${this.enemyCurrentCast.displayName}!`
      }
    }

    // Complete Cast after telegraph
    if (this.enemyCurrentCast && time >= this.enemyTelegraphTime) {
      const castSpell = this.enemyCurrentCast
      this.enemyCurrentCast = null
      if (this.dracoAuraSprite) this.dracoAuraSprite.material.opacity = 0
      document.getElementById('enemy-telegraph')?.classList.add('hidden')

      // Deduct enemy mana and set enemy spell cooldown
      const cost = castSpell.manaCost || 15
      this.enemyMana = Math.max(0, this.enemyMana - cost)
      this.enemyCooldowns[castSpell.name] = time + (castSpell.cooldown || 3.0)
      this.updateHpBars()

      if (castSpell.name === 'petrificus' || castSpell.name === 'stupefy' || castSpell.name === 'obliviate') {
        this.spawnWandCCVfx(false, castSpell.name)
        this.opponentCastProgress = 1.0
        if (castSpell.name === 'petrificus') {
          this.applyPetrificusDirect(this.playerLego)
        } else if (castSpell.name === 'stupefy') {
          this.applyStupefyDirect(this.playerLego)
        } else if (castSpell.name === 'obliviate') {
          this.applyObliviateDirect(this.playerLego)
        }
      } else {
        this.fireProjectile(castSpell, false)
      }
    }
  }

  // --- Projectile Physics & Collision System ---
  private updateProjectiles(delta: number, time: number) {
    const activeProjectiles: Projectile[] = []

    for (const proj of this.projectiles) {
      if (!proj.active) continue

      proj.progress += delta * 1.5

      // 1. CANON EXPELLIARMUS: Aerodynamic Dazzling Scarlet Lance Flight (Book Canon)
      if (proj.spell.name === 'expelliarmus') {
        proj.mesh.position.addScaledVector(proj.direction, proj.speed * delta)

        // Rotate helical plasma ribbons
        if (proj.doubleHelixGold) proj.doubleHelixGold.rotation.y += delta * 18.0
        if (proj.doubleHelixCrimson) proj.doubleHelixCrimson.rotation.y += delta * 18.0

        // Spin and pulse tip lens flare starburst
        if (proj.headSpark) {
          proj.headSpark.material.rotation += delta * 12.0
          const p = 0.38 + Math.sin(time * 30.0) * 0.05
          proj.headSpark.scale.set(p, p, 1)
        }
        if (proj.headAnamorphic) {
          const w = 0.95 + Math.sin(time * 25.0) * 0.10
          proj.headAnamorphic.scale.set(w, 0.12, 1)
        }

        // Aerodynamic trailing ruby flame embers & golden phoenix motes
        for (let s = 0; s < 5; s++) {
          const isGold = Math.random() < 0.40
          const backOffset = proj.direction.clone().multiplyScalar(-(0.25 + Math.random() * 0.75))
          const wakePos = proj.mesh.position.clone().add(backOffset)
          this.spawnParticle(
            wakePos.x + (Math.random() - 0.5) * 0.14,
            wakePos.y + (Math.random() - 0.5) * 0.14,
            wakePos.z + (Math.random() - 0.5) * 0.14,
            (Math.random() - 0.5) * 0.9,
            (Math.random() - 0.5) * 0.9,
            (Math.random() - 0.5) * 0.9,
            isGold ? 1.0 : 1.0,
            isGold ? 0.82 : 0.12,
            isGold ? 0.25 : 0.20,
            0.12 + Math.random() * 0.08,
            0.35 + Math.random() * 0.25,
            0.92,
            0
          )
        }
      }

      // 4. AVADA KEDAVRA ANIMATION & CONTINUOUS JAGGED LIGHTNING / PHANTOM SKULL (Sketch 4)
      if (proj.spell.name === 'avadakedavra') {
        if (proj.beamHolding) {
          // Keep caster and target postures active
          if (proj.isPlayer) {
            if (this.playerLego) this.playerLego.isChanneling = true
            if (this.opponentLego) this.opponentLego.isTargetChanneling = true
          } else {
            if (this.opponentLego) this.opponentLego.isChanneling = true
            if (this.playerLego) this.playerLego.isTargetChanneling = true
          }

          // DYNAMIC REAL-TIME TRACKING: Lock beam ends strictly to wands!
          const currentStart = proj.isPlayer
            ? this.getHarryWandWorldPos()
            : (this.opponentGroup ? this.opponentGroup.position.clone().add(new THREE.Vector3(0, 0.72, 0)) : this.getDracoWandWorldPos())
          const currentTarget = proj.isPlayer
            ? (this.opponentGroup ? this.opponentGroup.position.clone().add(new THREE.Vector3(0, 0.72, 0)) : this.getDracoWandWorldPos())
            : (this.playerGroup ? this.playerGroup.position.clone().add(new THREE.Vector3(0, 0.55, 0)) : this.getHarryWandWorldPos())
          const currentDist = currentStart.distanceTo(currentTarget)
          const currentDir = currentTarget.clone().sub(currentStart).normalize()

          // A. Position & Orient root beam group
          proj.mesh.position.copy(currentStart.clone().lerp(currentTarget, 0.5))
          if (proj.lanceGroup) {
            proj.lanceGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), currentDir)
            const scaleY = currentDist / (proj.originalDist || currentDist)
            proj.lanceGroup.scale.set(1, scaleY, 1)
          }

          // Rapid forward plasma texture streaming
          if (this.vfxTextures.laserBeam) {
            this.vfxTextures.laserBeam.offset.y -= delta * 16.0
          }

          // B. Re-randomize 12 Branching Fractal Jagged Lightning Arcs leaping OFF Main Trunk
          if (proj.lightningLines && proj.detailedTrunk && proj.detailedTrunk.length > 0) {
            const branchOrigins = [2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 16, 17]
            const branchDirs = [
              new THREE.Vector3(-0.45, 0.40, 0.20),
              new THREE.Vector3(0.35, -0.38, -0.15),
              new THREE.Vector3(-0.55, -0.15, 0.25),
              new THREE.Vector3(0.50, 0.20, -0.20),
              new THREE.Vector3(-0.35, 0.45, -0.15),
              new THREE.Vector3(0.25, -0.35, 0.25),
              new THREE.Vector3(-0.40, -0.25, -0.20),
              new THREE.Vector3(0.35, 0.35, 0.15),
              new THREE.Vector3(-0.30, 0.30, 0.30),
              new THREE.Vector3(0.28, -0.25, -0.25),
              new THREE.Vector3(-0.25, -0.40, 0.15),
              new THREE.Vector3(0.30, 0.40, -0.15),
            ]
            for (let a = 0; a < proj.lightningLines.length; a++) {
              const line = proj.lightningLines[a]
              if (!line || !line.geometry) continue
              const posAttr = line.geometry.attributes?.position as THREE.BufferAttribute
              if (!posAttr) continue
              const count = posAttr.count
              const origIdx = Math.min(branchOrigins[a % branchOrigins.length], proj.detailedTrunk.length - 1)
              const root = proj.detailedTrunk[origIdx]
              if (!root) continue
              const bDir = branchDirs[a % branchDirs.length]
              posAttr.setXYZ(0, root.x, root.y, root.z)
              let curr = root.clone()
              for (let i = 1; i < count; i++) {
                curr = curr.clone().add(bDir.clone().multiplyScalar(0.045))
                curr.x += (Math.random() - 0.5) * 0.08
                curr.y += (Math.random() - 0.5) * 0.08
                curr.z += (Math.random() - 0.5) * 0.08
                posAttr.setXYZ(i, curr.x, curr.y, curr.z)
              }
              posAttr.needsUpdate = true
            }
          }

          // D. Ethereal Anatomical Phantom Skull Animation (Positioned directly ON lightning core)
          const scX = 0.0
          const scY = 0.40
          const scZ = 0.0

          // High-frequency electric vibration (tremors of the death curse surging through bone)
          const jitterX = (Math.random() - 0.5) * 0.010
          const jitterY = (Math.random() - 0.5) * 0.010
          const jitterZ = (Math.random() - 0.5) * 0.010
          const bob = Math.sin(time * 3.5) * 0.02

          if (proj.skullSprite) {
            proj.skullSprite.position.set(scX + jitterX, scY + bob + jitterY, scZ + jitterZ)
            const p = 2.10 + Math.sin(time * 5.0) * 0.06
            proj.skullSprite.scale.set(p, p * (2.35 / 2.10), 1)
          }

          if (proj.skullGlow) {
            proj.skullGlow.position.set(scX + jitterX, scY + bob + jitterY, scZ + jitterZ)
            const pg = 2.25 + Math.sin(time * 5.0 + 0.4) * 0.07
            proj.skullGlow.scale.set(pg, pg * (2.50 / 2.25), 1)
          }

          if (proj.mouthFlash) {
            proj.mouthFlash.position.set(scX + jitterX, -0.02 + bob * 0.5 + jitterY, scZ + jitterZ + 0.25)
            const pf = 1.30 + Math.sin(time * 8.0) * 0.22
            proj.mouthFlash.scale.set(pf, pf, 1)
          }

          if (proj.skull3DMesh) {
            proj.skull3DMesh.position.set(scX + jitterX, scY + bob + jitterY, scZ + jitterZ)
            proj.skull3DMesh.rotation.y = 2.85 + Math.sin(time * 2.0) * 0.04
            proj.skull3DMesh.rotation.z = Math.sin(time * 2.8) * 0.02
            proj.skull3DMesh.rotation.x = 0.08 + Math.cos(time * 3.0) * 0.02
          }

          // Active Dynamic Re-jittering of Skull Lightning Arcs connecting Skull directly into the Beam
          if (proj.skullLightningTethers && proj.skullLightningTethers.length > 0) {
            const tOrigins = [
              new THREE.Vector3(0.0, 0.35, -0.05),   // Crown
              new THREE.Vector3(-0.24, 0.10, 0.08),  // Left temple
              new THREE.Vector3(0.24, 0.10, 0.08),   // Right temple
              new THREE.Vector3(0.0, -0.38, 0.14),   // Jaw
            ]
            const skullPosNow = new THREE.Vector3(scX + jitterX, scY + bob + jitterY, scZ + jitterZ)
            for (let t = 0; t < proj.skullLightningTethers.length; t++) {
              const line = proj.skullLightningTethers[t]
              if (!line || !line.geometry) continue
              const origOffset = tOrigins[t % tOrigins.length]
              const pStart = skullPosNow.clone().add(origOffset)
              let pEnd: THREE.Vector3
              if (proj.detailedTrunk && proj.detailedTrunk.length > 0 && proj.lanceGroup) {
                const trunkIdx = [7, 8, 10, 11][t % 4]
                const rawTrunk = proj.detailedTrunk[Math.min(trunkIdx, proj.detailedTrunk.length - 1)]
                if (rawTrunk) {
                  pEnd = rawTrunk.clone().applyQuaternion(proj.lanceGroup.quaternion)
                } else {
                  pEnd = new THREE.Vector3(scX, scY - 0.18, scZ)
                }
              } else {
                pEnd = new THREE.Vector3(scX, scY - 0.18, scZ)
              }

              const pts: THREE.Vector3[] = []
              const count = 10
              for (let i = 0; i < count; i++) {
                const frac = i / (count - 1)
                const p = pStart.clone().lerp(pEnd, frac)
                if (i > 0 && i < count - 1) {
                  p.x += (Math.random() - 0.5) * 0.04
                  p.y += (Math.random() - 0.5) * 0.04
                  p.z += (Math.random() - 0.5) * 0.04
                }
                pts.push(p)
              }
              line.geometry.dispose()
              line.geometry = new THREE.BufferGeometry().setFromPoints(pts)
            }
          }

          // Mid-air Ectoplasmic Vapor Wisps orbiting the skull
          if (proj.skullVaporSprites) {
            for (let v = 0; v < proj.skullVaporSprites.length; v++) {
              const sp = proj.skullVaporSprites[v]
              const orbitSpeed = 1.2 + (v % 3) * 0.3
              const ang = time * orbitSpeed + (v * Math.PI * 2) / proj.skullVaporSprites.length
              const rad = 0.42 + (v % 3) * 0.16
              sp.position.set(
                scX + Math.cos(ang) * rad,
                scY + bob + Math.sin(ang * 2) * 0.22,
                scZ + Math.sin(ang) * rad * 0.6
              )
              sp.material.rotation += delta * (0.8 + v * 0.1)
              sp.material.opacity = 0.35 + Math.sin(time * 3.0 + v) * 0.15
            }
          }

          // Swirl Green Mist Clouds around Skull
          if (proj.skullMistSprites) {
            const baseMistOffsets = [
              [-0.25, 0.28, 0.08],
              [0.25, 0.28, -0.08],
              [0.0, 0.42, 0.0],
              [-0.18, -0.22, 0.10],
              [0.18, -0.22, -0.05],
            ]
            const bob = Math.sin(time * 3.5) * 0.02
            for (let m = 0; m < proj.skullMistSprites.length; m++) {
              const mSp = proj.skullMistSprites[m]
              const bo = baseMistOffsets[m % baseMistOffsets.length]
              mSp.position.set(
                scX + bo[0] + Math.sin(time * 2.5 + m) * 0.05,
                scY + bob + bo[1] + Math.cos(time * 2.5 + m) * 0.05,
                scZ + bo[2]
              )
              mSp.material.rotation += delta * (0.8 + m * 0.3)
              const p = 1.1 + Math.sin(time * 5.0 + m) * 0.08
              mSp.scale.set(p, p, 1)
            }
          }

          // Spawn rising ectoplasmic deep emerald mist particles from skull
          if (Math.random() < 0.75) {
            const skullWorld = currentStart.clone().lerp(currentTarget, 0.5).add(new THREE.Vector3(scX, scY, scZ))
            const isMintSparks = Math.random() < 0.25
            this.spawnParticle(
              skullWorld.x + (Math.random() - 0.5) * 0.60,
              skullWorld.y - 0.2 + Math.random() * 0.50,
              skullWorld.z + (Math.random() - 0.5) * 0.50,
              (Math.random() - 0.5) * 0.4,
              0.8 + Math.random() * 1.5,
              (Math.random() - 0.5) * 0.4,
              isMintSparks ? 0.85 : 0.02,
              isMintSparks ? 1.00 : 0.47,
              isMintSparks ? 0.92 : 0.34,
              0.26 + Math.random() * 0.14,
              0.75,
              0.96,
              -0.4
            )
          }

          // E. Dynamic Muzzle & Target Lens Flare positions
          const localStart = currentDir.clone().multiplyScalar(-currentDist * 0.5)
          const localTarget = currentDir.clone().multiplyScalar(currentDist * 0.5)

          if (proj.starburstSprite) {
            proj.starburstSprite.position.copy(localStart)
            proj.starburstSprite.material.rotation += delta * 14.0
            const p = 2.85 + Math.sin(time * 28) * 0.35
            proj.starburstSprite.scale.set(p, p, 1)
            proj.starburstSprite.renderOrder = 100
          }
          if (proj.headAnamorphic) {
            proj.headAnamorphic.position.copy(localStart)
            const p = 1.10 + Math.sin(time * 25) * 0.15
            proj.headAnamorphic.scale.set(p, 0.09, 1)
          }
          if (proj.headSpark) {
            proj.headSpark.position.copy(localStart)
            proj.headSpark.material.rotation += delta * 24.0
            const p = 0.35 + Math.sin(time * 35) * 0.08
            proj.headSpark.scale.set(p, p, 1)
          }
          if (proj.headDiamond) {
            proj.headDiamond.position.copy(localStart)
            const p = 0.50 + Math.cos(time * 30) * 0.06
            proj.headDiamond.scale.set(p, p, 1)
          }

          // F. Target Impact Flares & Voldemort Swirling Shadow Shroud
          if (proj.targetAnamorphic) {
            proj.targetAnamorphic.position.copy(localTarget)
            const p = 1.3 + Math.sin(time * 35) * 0.15
            proj.targetAnamorphic.scale.set(p, 0.15, 1)
          }
          if (proj.targetSpark) {
            proj.targetSpark.position.copy(localTarget)
            proj.targetSpark.material.rotation += delta * 25.0
            const p = 0.70 + Math.sin(time * 40) * 0.10
            proj.targetSpark.scale.set(p, p, 1)
          }
          if (proj.targetDiamond) {
            proj.targetDiamond.position.copy(localTarget)
            const p = 1.10 + Math.cos(time * 35) * 0.10
            proj.targetDiamond.scale.set(p, p, 1)
          }

          // Voldemort Red Defensive Spark & Corona Flare (Pinpoint counter-spark at wand tip)
          const vWandLocal = new THREE.Vector3(localTarget.x - 0.28, localTarget.y + 0.14, localTarget.z + 0.14)
          if (proj.vRedSpark) {
            proj.vRedSpark.position.copy(vWandLocal)
            const rPulse = 1.35 + Math.sin(time * 30.0) * 0.25
            proj.vRedSpark.scale.set(rPulse, rPulse, 1)
            proj.vRedSpark.material.rotation -= delta * 5.5
            proj.vRedSpark.renderOrder = 100
          }
          if (proj.vRedCorona) {
            proj.vRedCorona.position.copy(vWandLocal)
            const cPulse = 2.25 + Math.sin(time * 20.0) * 0.35
            proj.vRedCorona.scale.set(cPulse, cPulse, 1)
            proj.vRedCorona.renderOrder = 99
          }

          // Rotate & position swirling dark smoke shroud around Voldemort (Billowing shadow vortex)
          if (proj.shroudSprites) {
            const shOffsets = [
              [0.35, 0.20, -0.15],
              [0.45, -0.10, 0.10],
              [0.55, 0.35, -0.10],
              [0.25, 0.50, -0.20],
              [-0.20, 0.30, -0.25],
              [0.40, -0.30, 0.05],
              [-0.35, -0.15, -0.15],
              [0.10, 0.60, -0.10],
              [0.50, 0.10, 0.05],
              [-0.25, 0.45, 0.15],
              [0.65, 0.25, 0.10],
              [-0.45, 0.20, -0.10],
              [0.25, -0.35, 0.15],
              [-0.15, 0.65, -0.05],
            ]
            for (let s = 0; s < proj.shroudSprites.length; s++) {
              const shSp = proj.shroudSprites[s]
              const off = shOffsets[s % shOffsets.length]
              shSp.position.set(
                localTarget.x + off[0] + Math.sin(time * 2.5 + s) * 0.12,
                localTarget.y + off[1] + Math.cos(time * 2.5 + s) * 0.12,
                localTarget.z + off[2]
              )
              shSp.material.rotation += delta * (0.9 + s * 0.16) * (s % 2 === 0 ? 1 : -1)
              const p = 3.65 + Math.sin(time * 3.5 + s) * 0.55
              shSp.scale.set(p, p, 1)
            }
          }

          // Continuous violent emerald & white impact sparks bouncing off target
          for (let s = 0; s < 8; s++) {
            const sparkVel = new THREE.Vector3(
              (Math.random() - 0.5) * 5.0,
              1.0 + Math.random() * 4.2,
              (Math.random() - 0.5) * 5.0
            )
            const isWhite = Math.random() < 0.35
            this.spawnParticle(
              currentTarget.x + (Math.random() - 0.5) * 0.22,
              currentTarget.y + (Math.random() - 0.5) * 0.22,
              currentTarget.z + (Math.random() - 0.5) * 0.22,
              sparkVel.x, sparkVel.y, sparkVel.z,
              isWhite ? 0.92 : 0.02,
              isWhite ? 1.0 : 0.47,
              isWhite ? 0.98 : 0.34,
              0.15 + Math.random() * 0.10,
              0.42,
              0.92,
              1.4
            )
          }

          // G. Dynamic Floor Specular Ribbon & Runway Lighting
          if (proj.floorReflectionGroup) {
            proj.floorReflectionGroup.position.set(
              (currentStart.x + currentTarget.x) * 0.5,
              -0.835,
              (currentStart.z + currentTarget.z) * 0.5
            )
            const fdx = currentTarget.x - currentStart.x
            const fdz = currentTarget.z - currentStart.z
            proj.floorReflectionGroup.rotation.y = Math.atan2(fdx, fdz)
            const scaleY = currentDist / (proj.originalDist || currentDist)
            proj.floorReflectionGroup.scale.set(1, 1, scaleY)
          }

          proj.light.intensity = 0.8 + Math.random() * 0.2
          if (proj.extraLights && proj.extraLights.length >= 3) {
            proj.extraLights[0].position.copy(currentStart).add(currentDir.clone().multiplyScalar(0.40))
            proj.extraLights[0].intensity = 0.6 + Math.random() * 0.15
            proj.extraLights[1].position.set(
              (currentStart.x + currentTarget.x) * 0.5,
              -0.65,
              (currentStart.z + currentTarget.z) * 0.5
            )
            proj.extraLights[1].intensity = 0.7 + Math.random() * 0.2
            proj.extraLights[2].position.copy(currentTarget)
            proj.extraLights[2].intensity = 0.8 + Math.random() * 0.2
          }

          // Lateral electric sparks crackling along the full beam into table runes
          for (let s = 0; s < 8; s++) {
            const t = Math.random()
            const sparkPos = currentStart.clone().lerp(currentTarget, t)
            const isWhiteHot = Math.random() < 0.35
            this.spawnParticle(
              sparkPos.x + (Math.random() - 0.5) * 0.45,
              sparkPos.y + (Math.random() - 0.5) * 0.45,
              sparkPos.z + (Math.random() - 0.5) * 0.45,
              (Math.random() - 0.5) * 5.0,
              (Math.random() - 0.5) * 5.0,
              (Math.random() - 0.5) * 5.0,
              isWhiteHot ? 0.92 : 0.02,
              isWhiteHot ? 1.00 : 0.47,
              isWhiteHot ? 0.98 : 0.34,
              0.16 + Math.random() * 0.08,
              0.38 + Math.random() * 0.25,
              0.90,
              0
            )
          }

          // Check mid-air clash with opponent spell while holding
          const opposing = this.projectiles.find(p => p !== proj && p.active && p.isPlayer !== proj.isPlayer)
          if (opposing && (opposing.spell.name === 'expelliarmus' || opposing.spell.name === 'avadakedavra')) {
            this.cleanupProjectile(proj)
            this.cleanupProjectile(opposing)
            this.spawnImpactExplosion(proj.mesh.position, 0x059669, true, 'generic')
            this.startPrioriIncantatemClash()
            continue
          }

          // Countdown beam hold timer
          proj.beamHoldTimer = (proj.beamHoldTimer || 0) - delta
          if (proj.beamHoldTimer <= 0) {
            // Unforgivable Curse hits target! (Lethal 100 DMG)
            this.cleanupProjectile(proj)

            if (proj.isPlayer) {
              this.opponentFlinch = 1.0
              this.audio.playImpactBoom(0x047857, 'avadakedavra')
              this.triggerScreenShake()
              this.spawnImpactExplosion(currentTarget, 0x047857, false, 'avadakedavra')
              this.spawnDisarmedWand(currentTarget, true)
              this.enemyHp = Math.max(0, this.enemyHp - proj.spell.damage)
              this.updateHpBars()
              this.showCombatNumber(`-${proj.spell.damage}`, window.innerWidth * 0.68, window.innerHeight * 0.45, 'crit')
              this.showCombatNumber('AVADA KEDAVRA!', window.innerWidth * 0.68, window.innerHeight * 0.38, 'crit')
              if (this.enemyHp <= 0) this.handleMatchEnd(true)
            } else {
              this.playerFlinch = 1.0
              this.audio.playImpactBoom(0x047857, 'avadakedavra')
              this.triggerScreenShake()
              this.spawnImpactExplosion(currentTarget, 0x047857, false, 'avadakedavra')
              this.spawnDisarmedWand(currentTarget, false)
              this.playerHp = Math.max(0, this.playerHp - proj.spell.damage)
              this.updateHpBars()
              this.showCombatNumber(`-${proj.spell.damage}`, window.innerWidth * 0.35, window.innerHeight * 0.55, 'player')
              this.showCombatNumber('LETHAL CURSE!', window.innerWidth * 0.35, window.innerHeight * 0.48, 'player')
              if (this.playerHp <= 0) this.handleMatchEnd(false)
            }
            continue
          }
          activeProjectiles.push(proj)
          continue
        }
      }

      // 2. INCENDIO ANIMATION (Matching Sketch 2)
      else if (proj.spell.name === 'incendio') {
        proj.mesh.position.addScaledVector(proj.direction, proj.speed * delta)

        if (proj.fireCore) {
          const cScale = 1.0 + Math.sin(time * 28) * 0.15
          proj.fireCore.scale.setScalar(cScale)
        }

        // Dynamically scale vortex as it moves from wand tip into dueling hall
        const distFromWand = proj.startPos.distanceTo(proj.mesh.position)
        const flightGrow = Math.min(1.0, 0.4 + distFromWand * 0.22)
        const baseVortexScale = 3.2 * flightGrow

        // Rotate Archimedean fire spiral vortex discs at high speed
        if (proj.flameVortexSprites) {
          for (let s = 0; s < proj.flameVortexSprites.length; s++) {
            const sp = proj.flameVortexSprites[s]
            const dir = s % 2 === 0 ? 1 : -1
            sp.material.rotation += delta * (dir * (14.0 + s * 3.0))
            const p = 1.0 + Math.sin(time * 20 + s) * 0.10
            sp.scale.setScalar((baseVortexScale + s * 0.25) * p)
          }
        }

        // Billow dark smoke clouds above and behind
        if (proj.smokeSprites) {
          for (let k = 0; k < proj.smokeSprites.length; k++) {
            const sm = proj.smokeSprites[k]
            sm.material.rotation += delta * (0.8 - k * 0.2)
            sm.position.y += delta * 0.85 // Rises upward towards ceiling
            const smScale = (2.0 + k * 0.25) * flightGrow
            sm.scale.set(smScale, smScale, 1)
          }
        }

        // Connect wand stream to vortex
        if (proj.fireConnectingStream) {
          const currentDist = proj.startPos.distanceTo(proj.mesh.position)
          proj.fireConnectingStream.position.copy(proj.startPos.clone().lerp(proj.mesh.position, 0.5))
          proj.fireConnectingStream.scale.set(1.0, Math.max(0.1, currentDist), 1.0)
        }

        // Trailing flame plumes
        if (proj.flameTailSprites) {
          for (let t = 0; t < proj.flameTailSprites.length; t++) {
            const ts = proj.flameTailSprites[t]
            ts.material.rotation += delta * (8.0 - t)
            const p = 1.0 + Math.cos(time * 20 + t) * 0.2
            ts.scale.setScalar((1.1 - t * 0.15) * p)
          }
        }

        if (proj.groundScorchMesh) {
          proj.groundScorchMesh.position.set(proj.mesh.position.x, -0.835, proj.mesh.position.z)
          const p = 0.95 + Math.sin(time * 18) * 0.15
          proj.groundScorchMesh.scale.setScalar(p)
        }

        // 3D Blender Fire Tornado Vortex Animation
        if (proj.incendio3DVortex) {
          proj.incendio3DVortex.rotation.z += delta * 14.0
          const pulse = 1.0 + Math.sin(time * 24.0) * 0.12
          const s = Math.min(1.4, 0.70 + distFromWand * 0.18) * pulse
          proj.incendio3DVortex.scale.set(s, s, s * 1.1)
        }

        // Raining embers falling DOWNWARD to the floor (Matching Sketch 2)
        for (let s = 0; s < 12; s++) {
          this.spawnParticle(
            proj.mesh.position.x + (Math.random() - 0.5) * 1.2,
            proj.mesh.position.y + (Math.random() - 0.5) * 0.8,
            proj.mesh.position.z + (Math.random() - 0.5) * 1.2,
            (Math.random() - 0.5) * 2.2,
            -(2.2 + Math.random() * 2.8), // Falling DOWNWARDS to floor
            (Math.random() - 0.5) * 2.2,
            1.0, 0.55 + Math.random() * 0.40, 0.05,
            0.18 + Math.random() * 0.12,
            0.60 + Math.random() * 0.45,
            0.94,
            2.5
          )
        }
      }

      // 3. STUPEFY ANIMATION (Matching Sketch 3)
      else {
        proj.mesh.position.addScaledVector(proj.direction, proj.speed * delta)

        if (proj.stupefyNucleus) {
          const p = 1.0 + Math.sin(time * 35) * 0.18
          proj.stupefyNucleus.scale.setScalar(p)
        }
        if (proj.stupefyAura) {
          const p = 1.0 + Math.cos(time * 25) * 0.12
          proj.stupefyAura.scale.setScalar(p)
        }
        if (proj.stupefyOuterHalo) {
          const p = 1.0 + Math.sin(time * 20) * 0.15
          proj.stupefyOuterHalo.scale.setScalar(p)
        }

        // Anamorphic 4-ray cross flare pulse
        if (proj.stupefyCrossFlare) {
          proj.stupefyCrossFlare.material.rotation += delta * 1.5
          const fScale = 2.2 + Math.sin(time * 40) * 0.18
          proj.stupefyCrossFlare.scale.set(fScale, fScale, 1)
        }

        // Spin all 4 golden filigree gyroscopic rings
        if (proj.gyroRings && proj.gyroRings.length >= 4) {
          proj.gyroRings[0].rotation.x += delta * 16.0
          proj.gyroRings[0].rotation.y += delta * 9.0
          proj.gyroRings[1].rotation.y += delta * 18.0
          proj.gyroRings[1].rotation.z += delta * 11.0
          proj.gyroRings[2].rotation.x -= delta * 15.0
          proj.gyroRings[2].rotation.z += delta * 17.0
          proj.gyroRings[3].rotation.y -= delta * 14.0
          proj.gyroRings[3].rotation.x += delta * 12.0
        }

        // Giant golden sonic crescent shockwaves rippling outwards
        if (proj.sonicRings) {
          for (let r = 0; r < proj.sonicRings.length; r++) {
            const sm = proj.sonicRings[r]
            const cycle = (time * 5.0 + r * 0.3) % 1.0
            const currentScale = 1.0 + cycle * 0.65
            sm.scale.set(currentScale, currentScale, 1)
            const mat = sm.material as THREE.MeshBasicMaterial
            mat.opacity = (1.0 - cycle) * 0.90
          }
        }

        // Inward celestial stardust motes & golden orbital glints
        for (let s = 0; s < 6; s++) {
          const a = time * 6.0 + (s * Math.PI) / 3
          const ringRad = 0.92
          this.spawnParticle(
            proj.mesh.position.x + Math.cos(a) * ringRad,
            proj.mesh.position.y + Math.sin(a * 1.4) * 0.40,
            proj.mesh.position.z + Math.sin(a) * ringRad,
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.8,
            1.0, 0.85, 0.15,
            0.14 + Math.random() * 0.08,
            0.35 + Math.random() * 0.25,
            0.92,
            0.1
          )
        }
      }

      // 4. ADVANCED 8 SPELLS PROCEDURAL ANIMATION
      if (proj.advancedVisuals) {
        animate8SpellVisuals(proj.advancedVisuals, time, delta, proj.progress)

        if (proj.spell.name === 'confringo') {
          // Trailing molten embers and volcanic heat sparks streaming behind firebolt
          for (let s = 0; s < 4; s++) {
            this.spawnParticle(
              proj.mesh.position.x + (Math.random() - 0.5) * 0.4,
              proj.mesh.position.y + (Math.random() - 0.5) * 0.4,
              proj.mesh.position.z + (Math.random() - 0.5) * 0.4,
              (Math.random() - 0.5) * 1.8,
              (Math.random() - 0.5) * 1.8,
              (Math.random() - 0.5) * 1.8,
              1.0, 0.55 + Math.random() * 0.35, 0.05,
              0.18 + Math.random() * 0.10,
              0.45 + Math.random() * 0.30,
              0.92,
              1.2
            )
          }
          // Dark charcoal soot motes curling behind in the wake
          if (Math.random() < 0.6) {
            this.spawnParticle(
              proj.mesh.position.x + (Math.random() - 0.5) * 0.3,
              proj.mesh.position.y + (Math.random() - 0.5) * 0.3,
              proj.mesh.position.z + (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.5,
              0.3 + Math.random() * 0.5,
              (Math.random() - 0.5) * 0.5,
              0.14, 0.16, 0.20,
              0.24 + Math.random() * 0.12,
              0.70 + Math.random() * 0.30,
              0.80,
              0.2
            )
          }
        }
      }

      // Check Collision with Mid-Air Clash (If player and enemy spell meet)
      if (proj.isPlayer) {
        const opposing = this.projectiles.find(p => !p.isPlayer && p.active && p.mesh.position.distanceTo(proj.mesh.position) < 0.9)
        if (opposing) {
          proj.active = false
          opposing.active = false
          this.scene.remove(proj.mesh)
          this.scene.remove(opposing.mesh)
          if (proj.groundScorchMesh) this.scene.remove(proj.groundScorchMesh)
          if (opposing.groundScorchMesh) this.scene.remove(opposing.groundScorchMesh)
          this.spawnImpactExplosion(proj.mesh.position, 0xffd700, true, 'generic')
          this.startPrioriIncantatemClash()
          continue
        }
      }

      // Check Impact on Player
      const harryWandPos = this.getHarryWandWorldPos()
      if (!proj.isPlayer && proj.mesh.position.distanceTo(harryWandPos) < 1.35) {
        proj.active = false
        this.scene.remove(proj.mesh)
        if (proj.groundScorchMesh) this.scene.remove(proj.groundScorchMesh)

        // Check if Player Dodged
        if (this.playerDodgeTimer > 0 || Math.abs(this.playerLeanX) > 0.45 || this.playerLeanY > 0.45) {
          this.spawnImpactExplosion(proj.mesh.position, 0xffffff, false, 'generic')
          this.audio.playParryChime()
          this.showCombatNumber('NÉ THÀNH CÔNG (DODGE)!', window.innerWidth * 0.35, window.innerHeight * 0.55, 'crit')
          const surge = 8
          this.playerMana = Math.min(this.maxPlayerMana, this.playerMana + surge)
          this.showCombatNumber(`+${surge} MP SURGE`, window.innerWidth * 0.35, window.innerHeight * 0.48, 'mana')
          this.updateHpBars()
        } else if (time < this.playerShieldActiveUntil) {
          this.spawnImpactExplosion(proj.mesh.position, 0x38b6ff, true, proj.spell.name)
          const timeSinceShield = this.playerShieldActiveUntil - time
          if (timeSinceShield > 1.3) {
            this.audio.playParryChime()
            this.showCombatNumber('PERFECT PARRY!', window.innerWidth * 0.35, window.innerHeight * 0.55, 'parry')
            const refund = 12
            this.playerMana = Math.min(this.maxPlayerMana, this.playerMana + refund)
            this.showCombatNumber(`+${refund} MP (PHẢN ĐÒN)`, window.innerWidth * 0.35, window.innerHeight * 0.48, 'mana')
            this.updateHpBars()
            this.fireProjectile(proj.spell, true)
          } else {
            this.audio.playSpellCast('protego')
            this.showCombatNumber('BLOCKED!', window.innerWidth * 0.35, window.innerHeight * 0.55, 'parry')
          }
        } else {
          this.playerFlinch = 1.0
          this.audio.playHitSound()
          this.triggerScreenShake()
          this.spawnImpactExplosion(proj.mesh.position, proj.spell.color, false, proj.spell.name)
          const mult = (this.gameMode === 'single' && this.currentTier) ? this.currentTier.damageMultiplier : 1.0
          const finalDmg = Math.round(proj.spell.damage * mult)
          this.playerHp = Math.max(0, this.playerHp - finalDmg)
          this.updateHpBars()
          this.showCombatNumber(`-${finalDmg}`, window.innerWidth * 0.35, window.innerHeight * 0.55, 'player')

          if (proj.spell.name === 'confringo') {
            this.spawnConfringoBlast(proj.mesh.position, this.playerLego)
            this.showCombatNumber('BẠN BỊ NỔ TUNG (CONFRINGO)!', window.innerWidth * 0.35, window.innerHeight * 0.45, 'crit')
          } else if (proj.spell.name === 'expelliarmus') {
            this.disarmDuelist(false)
            this.showCombatNumber('BẠN BỊ TƯỚC ĐŨA (DISARMED)!', window.innerWidth * 0.35, window.innerHeight * 0.45, 'crit')
          } else if (proj.spell.name === 'petrificus') {
            this.spawnPetrificusBinding(this.playerLego)
            this.applyCrowdControlToPlayer('petrificus', 2.5, 'HÓA ĐÁ TOÀN THÂN')
            this.showCombatNumber('BẠN BỊ HÓA ĐÁ (PETRIFIED)!', window.innerWidth * 0.35, window.innerHeight * 0.45, 'crit')
          } else if (proj.spell.name === 'stupefy') {
            this.applyCrowdControlToPlayer('stupefy', 2.0, 'CHOÁNG VÁNG')
            this.showCombatNumber('BẠN BỊ CHOÁNG (STUNNED)!', window.innerWidth * 0.35, window.innerHeight * 0.45, 'crit')
          } else if (proj.spell.name === 'obliviate') {
            this.applyCrowdControlToPlayer('obliviate', 2.0, 'XÓA KÝ ỨC / LÚ LẪN')
            this.showCombatNumber('BẠN BỊ LÚ LẪN (CONFUSED)!', window.innerWidth * 0.35, window.innerHeight * 0.45, 'crit')
          } else if (proj.spell.name === 'immobulus') {
            this.applyCrowdControlToPlayer('immobulus', 2.2, 'ĐÓNG BĂNG')
            this.showCombatNumber('BẠN BỊ ĐÓNG BĂNG (FROZEN)!', window.innerWidth * 0.35, window.innerHeight * 0.45, 'crit')
          } else if (proj.spell.name === 'levicorpus') {
            this.applyCrowdControlToPlayer('levicorpus', 2.2, 'TREO NGƯỢC')
            this.showCombatNumber('BẠN BỊ TREO NGƯỢC (LEVITATED)!', window.innerWidth * 0.35, window.innerHeight * 0.45, 'crit')
          }

          if (this.playerHp <= 0) {
            this.handleMatchEnd(false)
          }
        }
        continue
      }

      // Check Impact on Opponent
      const dracoWandPos = this.getDracoWandWorldPos()
      if (proj.isPlayer && proj.mesh.position.distanceTo(dracoWandPos) < 1.35) {
        if (proj.spell.name === 'expecto_patronum') {
          if (!(proj as any)._patronusImpacted) {
            (proj as any)._patronusImpacted = true
            ;(proj as any)._linger = 0.85
            proj.speed = 0.2
            this.opponentFlinch = 1.0
            this.audio.playHitSound()
            this.spawnImpactExplosion(proj.mesh.position, proj.spell.color, false, proj.spell.name)
            const finalDmg = proj.spell.damage
            this.showCombatNumber('PATRONUS PURITY!', window.innerWidth * 0.68, window.innerHeight * 0.4, 'crit')
            this.enemyHp = Math.max(0, this.enemyHp - finalDmg)

            // Holy Recovery: Heals Harry Potter by 8 HP (sustain to prolong match)
            if (this.playerHp < 100) {
              const healAmt = Math.min(8, 100 - this.playerHp)
              this.playerHp += healAmt
              this.showCombatNumber(`+${healAmt} HP HỒI PHỤC`, window.innerWidth * 0.35, window.innerHeight * 0.50, 'parry')
            }

            this.updateHpBars()
            this.showCombatNumber(`-${finalDmg}`, window.innerWidth * 0.68, window.innerHeight * 0.45, 'enemy')
            if (this.enemyHp <= 0) this.handleMatchEnd(true)
          } else {
            ;(proj as any)._linger -= delta
            if (proj.advancedVisuals?.extraData?.stagObj) {
              const stag = proj.advancedVisuals.extraData.stagObj
              stag.rotation.x = -0.38
              stag.position.y = 0.55
              const fade = Math.max(0, (proj as any)._linger / 0.85)
              stag.traverse((c: any) => {
                if (c.isMesh && c.material) {
                  c.material.opacity = fade * 0.94
                }
              })
            }
            if ((proj as any)._linger <= 0) {
              proj.active = false
              this.scene.remove(proj.mesh)
              continue
            }
          }
          activeProjectiles.push(proj)
          continue
        }

        proj.active = false
        this.scene.remove(proj.mesh)
        if (proj.groundScorchMesh) this.scene.remove(proj.groundScorchMesh)

        // Check if Opponent Dodged
        const opp = getCharacter(this.selectedOpponentChar)
        const oppFirstName = opp.name.split(' ')[0]
        if (Math.abs(this.opponentLeanX) > 0.45 || this.opponentLeanY > 0.45) {
          this.spawnImpactExplosion(proj.mesh.position, 0xffffff, false, 'generic')
          this.showCombatNumber(`${oppFirstName} NÉ ĐÒN!`, window.innerWidth * 0.68, window.innerHeight * 0.45, 'parry')
        } else if (time < this.enemyShieldActiveUntil) {
          this.spawnImpactExplosion(proj.mesh.position, 0x00ff88, true, proj.spell.name)
          this.audio.playSpellCast('protego')
          this.showCombatNumber(`${oppFirstName} CHẮN KHIÊN!`, window.innerWidth * 0.68, window.innerHeight * 0.45, 'parry')
        } else {
          this.opponentFlinch = 1.0
          this.audio.playHitSound()
          this.spawnImpactExplosion(proj.mesh.position, proj.spell.color, false, proj.spell.name)
          const finalDmg = proj.spell.damage

          if (proj.spell.name === 'expelliarmus') {
            this.disarmDuelist(true)
            this.showCombatNumber('DISARMED! (BỊ TƯỚC ĐŨA)', window.innerWidth * 0.68, window.innerHeight * 0.38, 'crit')
          } else if (proj.spell.name === 'stupefy') {
            this.applyCrowdControlToOpponent('stupefy', 2.0, 'CHOÁNG VÁNG')
            this.showCombatNumber('STUNNED!', window.innerWidth * 0.68, window.innerHeight * 0.4, 'crit')
          } else if (proj.spell.name === 'petrificus') {
            this.applyCrowdControlToOpponent('petrificus', 2.5, 'HÓA ĐÁ TOÀN THÂN')
            this.showCombatNumber('PETRIFIED (HÓA ĐÁ)!', window.innerWidth * 0.68, window.innerHeight * 0.4, 'crit')
            this.spawnPetrificusBinding(this.opponentLego)
          } else if (proj.spell.name === 'immobulus') {
            this.applyCrowdControlToOpponent('immobulus', 2.2, 'ĐÓNG BĂNG')
            this.showCombatNumber('FROZEN (ĐÓNG BĂNG)!', window.innerWidth * 0.68, window.innerHeight * 0.4, 'crit')
          } else if (proj.spell.name === 'levicorpus') {
            this.applyCrowdControlToOpponent('levicorpus', 2.2, 'TREO NGƯỢC')
            this.showCombatNumber('LEVITATED (TREO NGƯỢC)!', window.innerWidth * 0.68, window.innerHeight * 0.4, 'crit')
          } else if (proj.spell.name === 'obliviate') {
            this.applyCrowdControlToOpponent('obliviate', 2.0, 'XÓA KÝ ỨC / LÚ LẪN')
            this.showCombatNumber('CONFUSED (MẤT TRÍ)!', window.innerWidth * 0.68, window.innerHeight * 0.4, 'crit')
          } else if (proj.spell.name === 'morsmordre') {
            this.showCombatNumber('DARK REIGN CRIT!', window.innerWidth * 0.68, window.innerHeight * 0.4, 'crit')
          } else if (proj.spell.name === 'sectumsempra') {
            this.showCombatNumber('BLEEDING LACERATION!', window.innerWidth * 0.68, window.innerHeight * 0.4, 'crit')
            this.spawnSectumsempraWoundDecals(dracoWandPos)
            let bleedCount = 0
            const bleedTimer = setInterval(() => {
              bleedCount++
              if (this.matchOver || bleedCount > 3) {
                clearInterval(bleedTimer)
                return
              }
              this.enemyHp = Math.max(0, this.enemyHp - 1)
              this.updateHpBars()
              this.showCombatNumber('-1 BLEED', window.innerWidth * 0.68 + (Math.random() - 0.5) * 30, window.innerHeight * 0.45, 'enemy')
              if (this.enemyHp <= 0) {
                clearInterval(bleedTimer)
                this.handleMatchEnd(true)
              }
            }, 1000)
          } else if (proj.spell.name === 'confringo') {
            this.showCombatNumber('BLAST DETONATION (NỔ TAN)!', window.innerWidth * 0.68, window.innerHeight * 0.4, 'crit')
            this.spawnConfringoBlast(proj.mesh.position, this.opponentLego)
          } else if (proj.spell.name === 'expecto_patronum') {
            this.showCombatNumber('PATRONUS PURITY!', window.innerWidth * 0.68, window.innerHeight * 0.4, 'crit')
          }

          this.enemyHp = Math.max(0, this.enemyHp - finalDmg)
          this.updateHpBars()
          this.showCombatNumber(`-${finalDmg}`, window.innerWidth * 0.68, window.innerHeight * 0.45, 'enemy')

          if (this.enemyHp <= 0) {
            this.handleMatchEnd(true)
          }
        }
        continue
      }

      // Cull far projectiles
      if (proj.progress > 4.0) {
        proj.active = false
        this.scene.remove(proj.mesh)
        if (proj.groundScorchMesh) this.scene.remove(proj.groundScorchMesh)
        continue
      }

      activeProjectiles.push(proj)
    }

    this.projectiles = activeProjectiles
  }

  // --- Priori Incantatem Clash Mode ---
  private startPrioriIncantatemClash() {
    this.inClashMode = true
    this.clashProgress = 0.5
    this.clashStartTime = this.clock?.getElapsedTime() ?? 0
    this.audio.playClashPulse()

    const clashHud = document.getElementById('clash-hud')
    clashHud?.classList.remove('hidden')
  }

  private advanceClash(amount: number) {
    if (!this.inClashMode) return
    this.audio.playClashPulse()
    this.clashProgress = Math.min(1.0, Math.max(0.0, this.clashProgress + amount))

    const marker = document.getElementById('clash-glow-marker')
    if (marker) {
      marker.style.left = `${this.clashProgress * 100}%`
    }

    if (this.network?.isConnected) {
        this.network.send({ type: 'clash_mash', payload: { progress: this.clashProgress } })
    }

    // Player Wins Clash
    if (this.clashProgress >= 0.95) {
      this.inClashMode = false
      this.clashesWon++
      document.getElementById('clash-hud')?.classList.add('hidden')

      this.audio.playHitSound()
      this.triggerScreenShake()
      this.enemyHp = Math.max(0, this.enemyHp - 15)
      this.updateHpBars()
      this.showCombatNumber('-15 CLASH SURGE!', window.innerWidth * 0.68, window.innerHeight * 0.42, 'crit')

      if (this.enemyHp <= 0) {
        this.handleMatchEnd(true)
      }
    }
  }

  // --- UI Floating Combat Feedback ---
  private showCombatNumber(text: string, x: number, y: number, type: 'player' | 'enemy' | 'crit' | 'parry' | 'mana') {
    const layer = document.getElementById('combat-text-layer')
    if (!layer) return

    const span = document.createElement('span')
    span.className = `floating-dmg dmg-${type}`
    span.textContent = text
    span.style.left = `${x}px`
    span.style.top = `${y}px`
    layer.appendChild(span)

    setTimeout(() => span.remove(), 1200)
  }

  private triggerManaDepletedVfx(cost: number) {
    const mpContainer = document.querySelector('.stat-bar-container.player-mp') as HTMLElement
    if (mpContainer) {
      mpContainer.classList.remove('mana-depleted-flash')
      void mpContainer.offsetWidth
      mpContainer.classList.add('mana-depleted-flash')
      setTimeout(() => mpContainer.classList.remove('mana-depleted-flash'), 500)
    }
  }

  private triggerManaPulseVfx() {
    const mpFill = document.getElementById('player-mp-bar')
    if (mpFill) {
      mpFill.classList.remove('mana-pulse-anim')
      void mpFill.offsetWidth
      mpFill.classList.add('mana-pulse-anim')
      setTimeout(() => mpFill.classList.remove('mana-pulse-anim'), 400)
    }
  }

  private triggerScreenShake() {
    document.body.classList.remove('screen-shake')
    void document.body.offsetWidth
    document.body.classList.add('screen-shake')
    setTimeout(() => document.body.classList.remove('screen-shake'), 400)
  }

  private showToast(title: string, sub: string) {
    const toast = document.getElementById('gesture-toast')
    if (!toast) return
    const toastTitle = document.getElementById('toast-title')
    const toastSub = document.getElementById('toast-sub')
    if (toastTitle) toastTitle.textContent = title
    if (toastSub) toastSub.textContent = sub
    if (toast) {
      toast.classList.remove('hidden')
      toast.style.animation = 'none'
      void toast.offsetWidth
      toast.style.animation = 'pulseGlow 1.8s infinite alternate ease-in-out'
      setTimeout(() => toast.classList.add('hidden'), 2600)
    }
  }

  private showMatchBanner(title: string, sub: string) {
    const banner = document.getElementById('match-banner')
    if (!banner) return
    const bannerTitle = document.getElementById('banner-title')
    const bannerSub = document.getElementById('banner-sub')
    if (bannerTitle) bannerTitle.textContent = title
    if (bannerSub) bannerSub.textContent = sub
    if (banner) {
      banner.classList.remove('hidden')
      banner.style.animation = 'none'
      void banner.offsetWidth
      banner.style.animation = 'bannerFade 3s ease-in-out forwards'
      setTimeout(() => banner.classList.add('hidden'), 3100)
    }
  }

  private updateHpBars() {
    // Player HP Bar & Trailing Ghost Bar
    const playerBar = document.getElementById('player-hp-bar')
    const playerGhost = document.getElementById('player-hp-ghost')
    const playerText = document.getElementById('player-hp-text')
    if (playerBar && playerText) {
      const pct = Math.max(0, Math.min(100, (this.playerHp / this.maxPlayerHp) * 100))
      playerBar.style.width = `${pct}%`
      playerText.textContent = `${Math.ceil(this.playerHp)} / ${this.maxPlayerHp} HP (${Math.ceil(pct)}%)`
    }
    if (playerGhost) {
      const ghostPct = Math.max(0, Math.min(100, (this.ghostPlayerHp / this.maxPlayerHp) * 100))
      playerGhost.style.width = `${ghostPct}%`
    }

    // Player Mana Bar & Counter
    const playerMpBar = document.getElementById('player-mp-bar')
    const playerMpText = document.getElementById('player-mp-text')
    if (playerMpBar) {
      playerMpBar.style.width = `${Math.max(0, Math.min(100, (this.playerMana / this.maxPlayerMana) * 100))}%`
    }
    if (playerMpText) {
      playerMpText.textContent = `${Math.floor(this.playerMana)} / ${this.maxPlayerMana} MP`
    }

    // Opponent HP Bar & Trailing Ghost Bar
    const enemyBar = document.getElementById('enemy-hp-bar')
    const enemyGhost = document.getElementById('enemy-hp-ghost')
    const enemyText = document.getElementById('enemy-hp-text')
    if (enemyBar && enemyText) {
      const pct = Math.max(0, Math.min(100, (this.enemyHp / this.maxEnemyHp) * 100))
      enemyBar.style.width = `${pct}%`
      enemyText.textContent = `${Math.ceil(this.enemyHp)} / ${this.maxEnemyHp} HP (${Math.ceil(pct)}%)`
    }
    if (enemyGhost) {
      const ghostPct = Math.max(0, Math.min(100, (this.ghostEnemyHp / this.maxEnemyHp) * 100))
      enemyGhost.style.width = `${ghostPct}%`
    }

    // Opponent Mana Bar & Counter
    const enemyMpBar = document.getElementById('enemy-mp-bar')
    const enemyMpText = document.getElementById('enemy-mp-text')
    if (enemyMpBar) {
      enemyMpBar.style.width = `${Math.max(0, Math.min(100, (this.enemyMana / this.maxEnemyMana) * 100))}%`
    }
    if (enemyMpText) {
      enemyMpText.textContent = `${Math.floor(this.enemyMana)} / ${this.maxEnemyMana} MP`
    }

    // Update Spell Wheel Buttons & Mobile Pills Out-of-Mana State
    document.querySelectorAll('.spell-hotspot, .spell-outer-btn, .mobile-spell-pill').forEach((btn) => {
      const el = btn as HTMLElement
      const sKey = el.dataset.spell?.toLowerCase()
      if (sKey && SPELL_DECK[sKey]) {
        if (this.playerMana < SPELL_DECK[sKey].manaCost) {
          el.classList.add('spell-out-of-mana')
        } else {
          el.classList.remove('spell-out-of-mana')
        }
      }
    })

    // Update Gesture Prompt Card Mana Badge Readiness
    const promptManaBadge = document.getElementById('prompt-spell-mana')
    if (promptManaBadge) {
      const activeSpell = SPELL_DECK[this.activeArmedSpell] || SPELL_DECK.expelliarmus
      const cost = activeSpell.manaCost || 15
      promptManaBadge.textContent = `💎 ${cost} MP`
      if (this.playerMana < cost) {
        promptManaBadge.className = 'prompt-mana-badge mana-depleted'
      } else {
        promptManaBadge.className = 'prompt-mana-badge mana-ok'
      }
    }

    if (this.network?.isConnected && this.isHost) {
        this.network.send({
          type: 'damage_sync',
        payload: {
          playerHp: this.playerHp,
          enemyHp: this.enemyHp,
          playerMana: this.playerMana,
          enemyMana: this.enemyMana,
        }
      })
    }
  }

  private handleMatchEnd(victory: boolean) {
    this.matchOver = true
    const modal = document.getElementById('end-match-modal')
    const title = document.getElementById('modal-title')
    const desc = document.getElementById('modal-desc')
    const crest = document.getElementById('modal-crest')

    if (this.gameMode === 'multiplayer') {
      if (victory) {
        this.audio.playFanfare()
        if (crest) crest.textContent = '🏆'
        if (title) title.textContent = 'CHIẾN THẮNG ONLINE!'
        if (desc) desc.textContent = 'Bạn đã hạ gục đối thủ trong trận đấu tay đôi trực tuyến!'
      } else {
        if (crest) crest.textContent = '💀'
        if (title) title.textContent = 'THẤT BẠI TRONG ĐẤU TRƯỜNG!'
        if (desc) desc.textContent = 'Đối thủ đã giành chiến thắng trong trận đấu này!'
      }
      const restartGauntletBtn = document.getElementById('btn-restart-gauntlet')
      if (restartGauntletBtn) restartGauntletBtn.classList.add('hidden')
      const restartBtn = document.getElementById('restart-match-btn')
      if (restartBtn) restartBtn.textContent = 'ĐẤU LẠI TRẬN NÀY'
    } else {
      // Single Player Gauntlet Mode
      const currentEntry = this.gauntletRoster[this.currentRoundIndex]
      const oppName = currentEntry ? currentEntry.char.fullName : 'đối thủ'

      if (victory) {
        if (this.currentRoundIndex < 4) {
          // Rounds 1 to 4: Show Intermission Modal instead of end game!
          this.audio.playFanfare()
          this.showRoundClearIntermission()
          return
        } else {
          // Round 5: Grand Champion Victory!
          this.audio.playFanfare()
          if (crest) crest.textContent = '👑'
          if (title) title.textContent = 'QUÁN QUÂN HOGWARTS TỐI THƯỢNG!'
          if (desc) desc.textContent = `Xuất sắc! Bạn đã vượt qua toàn bộ 5 Ải ma thuật, đánh bại ${this.gauntletRoster.map(e => e.char.name.split(' ')[0]).join(', ')} và vinh danh Đệ Nhất Đấu Thủ Hogwarts!`
          const restartBtn = document.getElementById('restart-match-btn')
          if (restartBtn) restartBtn.textContent = '🔄 CHINH PHỤC LẠI (5 ẢI MỚI)'
          const restartGauntletBtn = document.getElementById('btn-restart-gauntlet')
          if (restartGauntletBtn) restartGauntletBtn.classList.add('hidden')
        }
      } else {
        // Player defeated at current round
        if (crest) crest.textContent = '💀'
        const tierName = currentEntry ? currentEntry.tier.tierName : 'ải đấu'
        if (title) title.textContent = `THẤT BẠI TẠI ẢI ${this.currentRoundIndex + 1}/5!`
        if (desc) desc.textContent = `Bạn đã trúng bùa chú của ${oppName} (${tierName}). Lời khuyên: ${currentEntry?.tier.advice || 'Hãy luyện tập thêm các bùa phản đòn!'}`
        const restartBtn = document.getElementById('restart-match-btn')
        if (restartBtn) restartBtn.textContent = `⚔️ ĐẤU LẠI ẢI ${this.currentRoundIndex + 1}`
        const restartGauntletBtn = document.getElementById('btn-restart-gauntlet')
        if (restartGauntletBtn) restartGauntletBtn.classList.remove('hidden')
      }
    }

    const statTime = document.getElementById('stat-time')
    const statPerfect = document.getElementById('stat-perfect')
    const statClash = document.getElementById('stat-clash')
    if (statTime) statTime.textContent = `${120 - this.matchTimer}s`
    if (statPerfect) statPerfect.textContent = `${this.perfectCount}`
    if (statClash) statClash.textContent = `${this.clashesWon}`

    modal?.classList.remove('hidden')
  }

  // --- Clock Timer (120s / 2-minute duel) ---
  private startMatchTimerLoop() {
    setInterval(() => {
      if (this.gameMode !== 'menu' && this.matchTimer > 0 && !this.matchOver) {
        this.matchTimer--
        const mins = Math.floor(this.matchTimer / 60)
        const secs = this.matchTimer % 60
        const clockElem = document.getElementById('duel-clock')
        if (clockElem) {
          clockElem.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
        }
        if (this.matchTimer <= 0 && !this.matchOver) {
          // Time expired: Evaluate winner by remaining health
          const victory = this.playerHp >= this.enemyHp
          this.handleMatchEnd(victory)
        }
      }
    }, 1000)
  }

  // --- Controls & Listeners ---
    // Toggle between cinematic (over-shoulder) and side (90 degree) camera
  private setupCameraToggle() {
    // Press 'C' to toggle camera
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyC') {
        const modes: Array<'cinematic' | 'side' | 'mobile' | 'portrait'> = ['cinematic', 'side', 'mobile', 'portrait']
        const currentIndex = modes.indexOf(this.cameraMode)
        this.cameraMode = modes[(currentIndex + 1) % modes.length]
        console.log(`📷 Camera mode: ${this.cameraMode}`)
      }
    })
  }

private setupParallaxListeners() {
    window.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / window.innerWidth) - 0.5
      const normY = (e.clientY / window.innerHeight) - 0.5
      this.targetCamX = normX * 0.35
      this.targetCamY = -normY * 0.25
    })
  }

  private setupGestureCanvas() {
    const resizeCanvas = () => {
      this.wandCanvas.width = window.innerWidth
      this.wandCanvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    this.wandCanvas.addEventListener('mousedown', (e) => this.startDrawing(e.clientX, e.clientY))
    this.wandCanvas.addEventListener('mousemove', (e) => this.drawMove(e.clientX, e.clientY))
    window.addEventListener('mouseup', () => this.endDrawing())

    this.wandCanvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      if (touch) this.startDrawing(touch.clientX, touch.clientY)
    }, { passive: false })
    this.wandCanvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      if (touch) this.drawMove(touch.clientX, touch.clientY)
    }, { passive: false })
    window.addEventListener('touchend', () => this.endDrawing())
  }

  private startDrawing(x: number, y: number) {
    if (this.inClashMode) {
      this.advanceClash(0.06)
      return
    }
    const time = this.clock?.getElapsedTime() ?? (performance.now() * 0.001)
    if (time < this.playerStunnedUntil) {
      const remaining = (this.playerStunnedUntil - time).toFixed(1)
      this.wandCtx.clearRect(0, 0, this.wandCanvas.width, this.wandCanvas.height)
      this.audio.playDrawFizzle()
      this.showCombatNumber(`🔒 BỊ KHỐNG CHẾ! (${remaining}s)`, x, y, 'mana')
      this.showToast('BỊ KHỐNG CHẾ!', `Bạn đang bị dính hiệu ứng ${this.playerCCName}! Không thể vung đũa (${remaining}s)`)
      this.isDrawing = false
      return
    }
    this.isDrawing = true
    this.drawnPoints = [{ x, y }]
    this.audio.playDrawSizzle()
  }

  private drawMove(x: number, y: number) {
    if (!this.isDrawing) return
    this.drawnPoints.push({ x, y })

    this.wandCtx.clearRect(0, 0, this.wandCanvas.width, this.wandCanvas.height)
    if (this.drawnPoints.length < 2) return

    this.wandCtx.beginPath()
    this.wandCtx.moveTo(this.drawnPoints[0].x, this.drawnPoints[0].y)
    for (let i = 1; i < this.drawnPoints.length; i++) {
      this.wandCtx.lineTo(this.drawnPoints[i].x, this.drawnPoints[i].y)
    }
    this.wandCtx.strokeStyle = '#ffeaa7'
    this.wandCtx.lineWidth = 6
    this.wandCtx.lineCap = 'round'
    this.wandCtx.lineJoin = 'round'
    this.wandCtx.shadowColor = '#f5cf73'
    this.wandCtx.shadowBlur = 15
    this.wandCtx.stroke()

    this.wandCtx.beginPath()
    this.wandCtx.moveTo(this.drawnPoints[0].x, this.drawnPoints[0].y)
    for (let i = 1; i < this.drawnPoints.length; i++) {
      this.wandCtx.lineTo(this.drawnPoints[i].x, this.drawnPoints[i].y)
    }
    this.wandCtx.strokeStyle = '#ffffff'
    this.wandCtx.lineWidth = 2.5
    this.wandCtx.stroke()

    if (Math.random() < 0.2) {
      this.audio.playDrawSizzle()
    }
  }

  private endDrawing() {
    if (!this.isDrawing) return
    this.isDrawing = false

    const points = [...this.drawnPoints]
    this.drawnPoints = []

    if (points.length < 5) {
      this.wandCtx.clearRect(0, 0, this.wandCanvas.width, this.wandCanvas.height)
      this.updatePromptStatus('warn', 'NÉT VẼ QUÁ NGẮN! HÃY VẼ DỨT KHOÁT')
      return
    }

    // 1. Freehand gesture recognition: evaluate stroke across all 9 spells
    const evalTarget = this.evaluateFreehand(points)

    if (evalTarget.match && evalTarget.spell) {
      // MATCH SUCCESS!
      this.wandCtx.clearRect(0, 0, this.wandCanvas.width, this.wandCanvas.height)
      const spellKey = evalTarget.spell
      const spell = SPELL_DECK[spellKey] || SPELL_DECK.expelliarmus
      this.activeArmedSpell = spellKey
      this.previewSpellInPromptCard(spellKey)
      this.updatePromptStatus('success', `XUẤT THẦN! THI PHÉP ${spell.displayName}`)
      this.castPlayerSpell(spellKey, evalTarget.accuracy ?? 95)
      return
    }

    // 2. FAILED MATCH: REJECT CAST! Stroke didn't match any valid spell symbol
    this.triggerStrokeFizzle(points)
    this.audio.playDrawFizzle()
    const failReason = 'Ký hiệu không khớp thần chú nào! Hãy mở Pháp Điển 📖 để xem nét vẽ.'
    this.updatePromptStatus('fail', failReason)
    this.showToast('THỦ ẤN THẤT BẠI!', failReason)
  }

  // --- Robust Shape & Stroke Analysis ---
  private analyzeStroke(pts: { x: number; y: number }[]) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const p of pts) {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    }
    const width = Math.max(1, maxX - minX)
    const height = Math.max(1, maxY - minY)
    const aspect = width / height

    const start = pts[0]
    const end = pts[pts.length - 1]
    const mid = pts[Math.floor(pts.length / 2)]
    const distToStart = Math.hypot(end.x - start.x, end.y - start.y)
    const maxDim = Math.max(width, height)
    const isClosed = distToStart < maxDim * 0.42 && pts.length > 12

    let xTurns = 0
    let yTurns = 0
    let prevDx = 0
    let prevDy = 0
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x
      const dy = pts[i].y - pts[i - 1].y
      if (Math.abs(dx) > 3) {
        if (prevDx !== 0 && ((prevDx > 0 && dx < 0) || (prevDx < 0 && dx > 0))) {
          xTurns++
        }
        prevDx = dx
      }
      if (Math.abs(dy) > 3) {
        if (prevDy !== 0 && ((prevDy > 0 && dy < 0) || (prevDy < 0 && dy > 0))) {
          yTurns++
        }
        prevDy = dy
      }
    }

    let sharpCorners = 0
    const sampleStep = Math.max(1, Math.floor(pts.length / 16))
    for (let i = sampleStep; i < pts.length - sampleStep; i += sampleStep) {
      const v1x = pts[i].x - pts[i - sampleStep].x
      const v1y = pts[i].y - pts[i - sampleStep].y
      const v2x = pts[i + sampleStep].x - pts[i].x
      const v2y = pts[i + sampleStep].y - pts[i].y
      const dot = v1x * v2x + v1y * v2y
      const mag1 = Math.hypot(v1x, v1y)
      const mag2 = Math.hypot(v2x, v2y)
      if (mag1 > 5 && mag2 > 5) {
        const cosAngle = dot / (mag1 * mag2)
        if (cosAngle < 0.2) {
          sharpCorners++
        }
      }
    }

    return {
      width, height, aspect, start, end, mid, distToStart, isClosed,
      xTurns, yTurns, sharpCorners, minX, maxX, minY, maxY, count: pts.length
    }
  }

  // --- Strict Spell Matching Against Required Gesture ---
  private evaluateSpellMatch(pts: { x: number; y: number }[], targetSpell: string): { match: boolean; spell?: string; accuracy?: number; reason?: string } {
    if (!pts || pts.length < 5) return { match: false, reason: 'Nét vẽ quá ngắn' }
    const a = this.analyzeStroke(pts)

    if (a.width < 35 && a.height < 35) {
      return { match: false, reason: 'Thủ ấn quá nhỏ, hãy vung đũa rộng hơn' }
    }

    switch (targetSpell) {
      case 'expelliarmus': {
        // ⚡ Lightning: 2-3 xTurns, open stroke, substantial height
        if (a.isClosed) return { match: false, reason: 'Expelliarmus không khép kín, hãy vẽ hình tia sét ⚡' }
        if (a.xTurns >= 2 && a.xTurns <= 3 && a.height > 35) {
          const accuracy = Math.min(100, 85 + (a.xTurns === 2 ? 12 : 6))
          return { match: true, spell: 'expelliarmus', accuracy }
        }
        return { match: false, reason: 'Cần vẽ tia sét zic-zắc 2 lần đổi chiều ⚡' }
      }

      case 'avadakedavra': {
        // 💀 Death curse: 3+ sharp jagged turns, aggressive
        if (a.isClosed) return { match: false, reason: 'Avada Kedavra không khép kín, hãy vẽ tia sét tử thần 💀' }
        if ((a.xTurns >= 3 || (a.xTurns >= 2 && a.yTurns >= 2)) && a.height > 55) {
          const accuracy = Math.min(100, 88 + a.xTurns * 3)
          return { match: true, spell: 'avadakedavra', accuracy }
        }
        return { match: false, reason: 'Cần vẽ tia chớp nhọn sắc 3 lần đổi chiều trở lên 💀' }
      }

      case 'protego': {
        // 🛡️ Upward Dome: starts low, rises high, drops low
        if (a.isClosed) return { match: false, reason: 'Protego là vòm khiên cong, không khép kín 🛡️' }
        const risesHigh = a.mid.y < a.start.y - 20 && a.mid.y < a.end.y - 20
        if (risesHigh && a.width > 45) {
          const accuracy = 94
          return { match: true, spell: 'protego', accuracy }
        }
        return { match: false, reason: 'Cần vẽ đường vòm cong hướng lên như chiếc khiên 🛡️' }
      }

      case 'stupefy': {
        // 💫 Wave: wide horizontal ripple with yTurns
        if (a.isClosed) return { match: false, reason: 'Stupefy là làn sóng ma thuật, không khép kín 💫' }
        if (a.width > a.height * 1.15 && a.yTurns >= 1 && a.width > 55) {
          const accuracy = 90
          return { match: true, spell: 'stupefy', accuracy }
        }
        return { match: false, reason: 'Cần vẽ làn sóng lượn ngang mềm mại ~ 💫' }
      }

      case 'sectumsempra': {
        // 🩸 Horizontal slash: very wide, minimal height
        if (a.isClosed) return { match: false, reason: 'Sectumsempra là nhát chém ngang dứt khoát 🩸' }
        if (a.width > 70 && a.height < a.width * 0.38 && a.xTurns === 0 && a.yTurns === 0) {
          const accuracy = 95
          return { match: true, spell: 'sectumsempra', accuracy }
        }
        return { match: false, reason: 'Cần vẽ một vạch chém ngang dứt khoát ━ 🩸' }
      }

      case 'petrificus': {
        // 🔒 Vertical downward thrust: very tall, minimal width, downward
        if (a.isClosed) return { match: false, reason: 'Petrificus là nhát đâm dọc phong ấn 🔒' }
        if (a.height > 70 && a.width < a.height * 0.48 && a.end.y > a.start.y + 35 && a.yTurns === 0) {
          const accuracy = 95
          return { match: true, spell: 'petrificus', accuracy }
        }
        return { match: false, reason: 'Cần vẽ vạch thẳng từ trên cắm thẳng xuống ┃ 🔒' }
      }

      case 'confringo': {
        // 💥 Triangle: closed shape with ~3 sharp corners or peak
        if (!a.isClosed) return { match: false, reason: 'Confringo yêu cầu vẽ hình tam giác khép kín △ 💥' }
        const topPeak = a.minY < a.start.y - 15
        if (a.sharpCorners >= 2 || (topPeak && a.isClosed)) {
          const accuracy = 92
          return { match: true, spell: 'confringo', accuracy }
        }
        return { match: false, reason: 'Cần vẽ hình tam giác góc nhọn khép kín △ 💥' }
      }

      case 'obliviate': {
        // 🌀 Circle: closed smooth loop, balanced aspect ratio
        if (!a.isClosed) return { match: false, reason: 'Obliviate yêu cầu vẽ vòng tròn ký ức khép kín ◯ 🌀' }
        if (a.aspect >= 0.60 && a.aspect <= 1.55 && a.xTurns <= 1) {
          const accuracy = 93
          return { match: true, spell: 'obliviate', accuracy }
        }
        return { match: false, reason: 'Cần vẽ vòng tròn tròn đều khép kín ◯ 🌀' }
      }

      case 'expecto_patronum': {
        // 🦌 Loop with upward flair: loop then tail shooting up
        const finishesHigh = a.end.y < a.minY + a.height * 0.38 && a.end.x > a.minX + a.width * 0.45
        if (!a.isClosed && finishesHigh && a.width > 55 && a.height > 55) {
          const accuracy = 96
          return { match: true, spell: 'expecto_patronum', accuracy }
        }
        return { match: false, reason: 'Cần vẽ vòng tròn rồi vút đũa bay lên góc trên ◯↗ 🦌' }
      }

      default:
        return { match: false, reason: 'Chưa chọn thần chú' }
    }
  }

  // --- Check if freehand stroke matches any spell ---
  private evaluateFreehand(pts: { x: number; y: number }[]): { match: boolean; spell?: string; accuracy?: number } {
    const spellOrder = ['protego', 'obliviate', 'confringo', 'avadakedavra', 'expelliarmus', 'sectumsempra', 'petrificus', 'expecto_patronum', 'stupefy']
    for (const spellKey of spellOrder) {
      const res = this.evaluateSpellMatch(pts, spellKey)
      if (res.match) {
        return { match: true, spell: spellKey, accuracy: res.accuracy }
      }
    }
    return { match: false }
  }

  // --- Fizzle Smoke / Spark Particle Rejection Effect ---
  private triggerStrokeFizzle(points: { x: number; y: number }[]) {
    this.fizzleParticles = []
    const sampleStep = Math.max(1, Math.floor(points.length / 25))
    for (let i = 0; i < points.length; i += sampleStep) {
      const p = points[i]
      for (let k = 0; k < 2; k++) {
        this.fizzleParticles.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.8) * 3,
          life: 1.0,
          maxLife: 0.6 + Math.random() * 0.4,
          color: Math.random() < 0.5 ? '#ff4757' : '#ffa502',
        })
      }
    }
  }

  private updateAndDrawFizzleParticles() {
    if (!this.wandCtx || !this.wandCanvas) return
    this.wandCtx.clearRect(0, 0, this.wandCanvas.width, this.wandCanvas.height)

    const delta = 0.025
    for (let i = this.fizzleParticles.length - 1; i >= 0; i--) {
      const p = this.fizzleParticles[i]
      p.life -= delta / p.maxLife
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.08

      if (p.life <= 0) {
        this.fizzleParticles.splice(i, 1)
        continue
      }

      this.wandCtx.save()
      this.wandCtx.globalAlpha = p.life
      this.wandCtx.fillStyle = p.color
      this.wandCtx.shadowColor = p.color
      this.wandCtx.shadowBlur = 8
      this.wandCtx.beginPath()
      this.wandCtx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2)
      this.wandCtx.fill()
      this.wandCtx.restore()
    }
  }

  // --- Freehand Gesture Prompt Card & Preview Management ---
  public previewSpellInPromptCard(spellKey: string) {
    if (!SPELL_DECK[spellKey] && !SPELL_RUNE_TEMPLATES[spellKey]) return
    const key = spellKey.toLowerCase()
    const template = SPELL_RUNE_TEMPLATES[key] || SPELL_RUNE_TEMPLATES.expelliarmus

    // Update DOM in gesture prompt card
    const iconEl = document.getElementById('prompt-spell-icon')
    if (iconEl) iconEl.innerHTML = template.svgRune

    const titleEl = document.getElementById('prompt-spell-name')
    if (titleEl) {
      titleEl.textContent = template.displayName
      titleEl.style.color = template.colorHex
      titleEl.style.textShadow = `0 0 10px ${template.colorHex}`
    }

    const descEl = document.getElementById('prompt-gesture-instruction')
    if (descEl) descEl.textContent = `Ký hiệu: ${template.instruction}`

    // Update mana cost badge on prompt card
    const manaEl = document.getElementById('prompt-spell-mana')
    const spellObj = SPELL_DECK[key] || SPELL_DECK.expelliarmus
    const cost = spellObj.manaCost || 15
    if (manaEl) {
      manaEl.textContent = `💎 ${cost} MP`
      if (this.playerMana < cost) {
        manaEl.className = 'prompt-mana-badge mana-depleted'
      } else {
        manaEl.className = 'prompt-mana-badge mana-ok'
      }
    }

    this.showToast(template.displayName.toUpperCase(), `Thủ ấn: ${template.instruction} · Tiêu hao: ${cost} MP`)

    // Auto-reset back to general freehand prompt after 4 seconds
    if (this.promptPreviewTimeout) {
      clearTimeout(this.promptPreviewTimeout)
    }
    this.promptPreviewTimeout = window.setTimeout(() => {
      if (!this.isDrawing) {
        this.resetPromptCardDefault()
      }
    }, 4000)
  }

  public resetPromptCardDefault() {
    const iconEl = document.getElementById('prompt-spell-icon')
    if (iconEl) {
      iconEl.innerHTML = `<svg class="spell-rune-icon" viewBox="0 0 32 32" fill="none">
        <path d="M12 5 L22 13 L10 17 L21 27" stroke="#f5cf73" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="5" r="1.6" fill="#ffffff"/>
        <circle cx="21" cy="27" r="1.6" fill="#f5cf73"/>
      </svg>`
    }
    const titleEl = document.getElementById('prompt-spell-name')
    if (titleEl) {
      titleEl.textContent = 'VẼ TỰ DO TRÊN MÀN HÌNH'
      titleEl.style.color = '#ffeaa7'
      titleEl.style.textShadow = '0 0 10px rgba(245, 207, 115, 0.6)'
    }
    const descEl = document.getElementById('prompt-gesture-instruction')
    if (descEl) {
      descEl.textContent = 'Vẽ theo ký hiệu: ⚡ Sét · 🛡️ Vòm · 💫 Sóng · 🩸 Chém · 🔒 Đâm · 💥 Tam giác · 🌀 Vòng · 💀 Avada'
    }
    const manaEl = document.getElementById('prompt-spell-mana')
    if (manaEl) {
      manaEl.textContent = '💎 SẴN SÀNG'
      manaEl.className = 'prompt-mana-badge mana-ok'
    }
    this.updatePromptStatus('ready', 'GIỮ CHUỘT / VUỐT TAY VẼ BẤT KỲ THỦ ẤN NÀO ĐỂ XUẤT CHIÊU')
  }

  public setArmedSpell(spellKey: string) {
    this.previewSpellInPromptCard(spellKey)
  }

  public updatePromptStatus(type: 'ready' | 'drawing' | 'success' | 'fail' | 'warn', text: string) {
    const dot = document.getElementById('prompt-status-dot')
    const statusText = document.getElementById('prompt-status-text')
    const card = document.getElementById('gesture-prompt-card')

    if (dot) {
      dot.className = `prompt-dot dot-${type}`
    }
    if (statusText) {
      statusText.textContent = text
    }

    if (type === 'fail' && card) {
      card.classList.remove('prompt-shake')
      void card.offsetWidth
      card.classList.add('prompt-shake')
      setTimeout(() => card.classList.remove('prompt-shake'), 450)
    }

    if (this.promptStatusTimeout) {
      clearTimeout(this.promptStatusTimeout)
      this.promptStatusTimeout = null
    }

    if (type === 'fail' || type === 'warn' || type === 'success') {
      this.promptStatusTimeout = window.setTimeout(() => {
        if (!this.isDrawing) {
          this.updatePromptStatus('ready', 'VẼ THEO HÌNH MẪU TRÊN MÀN HÌNH ĐỂ THI PHÉP')
        }
      }, 2500)
    }
  }

  // --- Render Animated Magical Rune Guide on Wand Canvas ---
  private renderGestureRuneGuide(time: number) {
    if (this.isDrawing) return

    if (this.fizzleParticles.length > 0) {
      this.updateAndDrawFizzleParticles()
      return
    }

    if (!this.wandCtx || !this.wandCanvas) return
    this.wandCtx.clearRect(0, 0, this.wandCanvas.width, this.wandCanvas.height)

    const cx = this.wandCanvas.width * 0.50
    const cy = this.wandCanvas.height * 0.48
    const size = Math.min(220, Math.min(this.wandCanvas.width, this.wandCanvas.height) * 0.32)

    this.wandCtx.save()

    // 1. Ancient Runic Freehand Focus Ring
    this.wandCtx.beginPath()
    this.wandCtx.arc(cx, cy, size * 0.58, 0, Math.PI * 2)
    this.wandCtx.strokeStyle = 'rgba(212, 175, 55, 0.28)'
    this.wandCtx.lineWidth = 1.5
    this.wandCtx.setLineDash([6, 6])
    this.wandCtx.lineDashOffset = -time * 12
    this.wandCtx.stroke()

    // Inner subtle ring
    this.wandCtx.beginPath()
    this.wandCtx.arc(cx, cy, size * 0.48, 0, Math.PI * 2)
    this.wandCtx.strokeStyle = 'rgba(245, 207, 115, 0.15)'
    this.wandCtx.lineWidth = 1.0
    this.wandCtx.setLineDash([])
    this.wandCtx.stroke()

    // 8 Cardinal and diagonal arcane spark points
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI / 4) + time * 0.12
      const radius = i % 2 === 0 ? size * 0.58 : size * 0.48
      const tx = cx + Math.cos(angle) * radius
      const ty = cy + Math.sin(angle) * radius
      this.wandCtx.fillStyle = i % 2 === 0 ? 'rgba(255, 234, 167, 0.65)' : 'rgba(212, 175, 55, 0.35)'
      this.wandCtx.beginPath()
      this.wandCtx.arc(tx, ty, i % 2 === 0 ? 2.5 : 1.8, 0, Math.PI * 2)
      this.wandCtx.fill()
    }

    // 2. Center Mystic Crosshair Glyphs (subtle)
    const crossSize = size * 0.12
    this.wandCtx.beginPath()
    this.wandCtx.moveTo(cx - crossSize, cy)
    this.wandCtx.lineTo(cx + crossSize, cy)
    this.wandCtx.moveTo(cx, cy - crossSize)
    this.wandCtx.lineTo(cx, cy + crossSize)
    this.wandCtx.strokeStyle = 'rgba(245, 207, 115, 0.25)'
    this.wandCtx.lineWidth = 1.0
    this.wandCtx.stroke()

    // 3. Floating hint text on Canvas
    this.wandCtx.font = 'bold 12.5px Nunito, sans-serif'
    this.wandCtx.fillStyle = 'rgba(255, 234, 167, 0.85)'
    this.wandCtx.textAlign = 'center'
    this.wandCtx.globalAlpha = 0.80 + Math.sin(time * 2.5) * 0.18
    this.wandCtx.fillText('✦ VẼ KÝ HIỆU PHÉP THUẬT ĐỂ XUẤT CHIÊU ✦', cx, cy + size * 0.68)

    this.wandCtx.font = '11px Nunito, sans-serif'
    this.wandCtx.fillStyle = 'rgba(223, 230, 233, 0.70)'
    this.wandCtx.fillText('Vung đũa vẽ tự do trên màn hình · Bấm 📖 Pháp Điển để xem các thế vẽ', cx, cy + size * 0.68 + 18)

    this.wandCtx.restore()
  }

  private setupSpellWheelControls() {
    // Grimoire modal toggle button & backdrop
    const toggleBtn = document.getElementById('btn-toggle-grimoire')
    const closeBtn = document.getElementById('grimoire-close-btn')
    const backdrop = document.getElementById('grimoire-backdrop')
    const modal = document.getElementById('spell-grimoire-modal')

    const openGrimoire = () => {
      if (modal) modal.classList.remove('hidden')
      this.audio.playArmedSelect()
    }
    const closeGrimoire = () => {
      if (modal) modal.classList.add('hidden')
    }

    if (toggleBtn) toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); openGrimoire() })
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeGrimoire() })
    if (backdrop) backdrop.addEventListener('click', (e) => { e.stopPropagation(); closeGrimoire() })

    // Clicking a grimoire item previews that spell's rune in prompt card and closes modal
    document.querySelectorAll('.grimoire-item').forEach((item) => {
      item.addEventListener('click', () => {
        const spell = (item as HTMLElement).dataset.spell
        if (spell) {
          this.previewSpellInPromptCard(spell)
          closeGrimoire()
        }
      })
    })

    // Clicking a dock slot casts that spell directly
    document.querySelectorAll('.dock-slot').forEach((slot) => {
      slot.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const spell = (slot as HTMLElement).dataset.spell
        if (spell) {
          this.castPlayerSpell(spell, 95)
        }
      })
    })

    window.addEventListener('keydown', (e) => {
      if (e.code in this.keyState) {
        this.keyState[e.code] = true
      }
      const time = this.clock?.getElapsedTime() ?? (performance.now() * 0.001)
      const isCCImmobile = time < this.playerStunnedUntil && this.playerCCType !== 'expelliarmus'
      if (!isCCImmobile) {
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
          this.targetPlayerLeanX = -1.0
        } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
          this.targetPlayerLeanX = 1.0
        } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
          this.targetPlayerLeanY = 1.0
        }
      }

      const key = e.key.toLowerCase()
      const code = e.code

      // Key shortcuts for quick preview / cheat sheet
      if (key === 'g' || code === 'KeyG') {
        const modal = document.getElementById('spell-grimoire-modal')
        if (modal && modal.classList.contains('hidden')) {
          openGrimoire()
        } else if (modal) {
          closeGrimoire()
        }
      } else if (this.gameMode === 'multiplayer') {
        const s1 = ['1', 'Digit1', 'Numpad1']
        const s2 = ['2', 'Digit2', 'Numpad2']
        const s3 = ['3', 'Digit3', 'Numpad3']
        const s4 = ['4', 'Digit4', 'Numpad4']
        if (s1.includes(key) || s1.includes(code)) {
          if (this.selectedMultiplayerSpells[0]) this.castPlayerSpell(this.selectedMultiplayerSpells[0], 95)
        } else if (s2.includes(key) || s2.includes(code)) {
          if (this.selectedMultiplayerSpells[1]) this.castPlayerSpell(this.selectedMultiplayerSpells[1], 100)
        } else if (s3.includes(key) || s3.includes(code)) {
          if (this.selectedMultiplayerSpells[2]) this.castPlayerSpell(this.selectedMultiplayerSpells[2], 95)
        } else if (s4.includes(key) || s4.includes(code)) {
          if (this.selectedMultiplayerSpells[3]) this.castPlayerSpell(this.selectedMultiplayerSpells[3], 95)
        }
      } else if (key === '1' || code === 'Digit1' || code === 'Numpad1') this.castPlayerSpell('expelliarmus', 95)
      else if (key === '2' || code === 'Digit2' || code === 'Numpad2') this.castPlayerSpell('protego', 100)
      else if (key === '3' || code === 'Digit3' || code === 'Numpad3') this.castPlayerSpell('stupefy', 95)
      else if (key === '4' || code === 'Digit4' || code === 'Numpad4') this.castPlayerSpell('obliviate', 95)
      else if (key === '5' || code === 'Digit5' || code === 'Numpad5') this.castPlayerSpell('petrificus', 95)
      else if (key === '6' || code === 'Digit6' || code === 'Numpad6') this.castPlayerSpell('sectumsempra', 95)
      else if (key === '7' || code === 'Digit7' || code === 'Numpad7') this.castPlayerSpell('confringo', 95)
      else if (key === '8' || code === 'Digit8' || code === 'Numpad8') this.castPlayerSpell('expecto_patronum', 95)
      else if (key === '9' || code === 'Digit9' || code === 'Numpad9' || key === 'k' || code === 'KeyK') this.castPlayerSpell('avadakedavra', 85)
      else if (key === 'p' || code === 'KeyP') this.castPlayerSpell('expecto_patronum', 95)
      
      else if (e.code === 'Space') {
        if (!isCCImmobile) {
          this.targetPlayerLeanY = 1.0
        }
        this.triggerPlayerDodge()
      }
    })

    // Initialize starting state with general freehand prompt
    this.resetPromptCardDefault()

    window.addEventListener('keyup', (e) => {
      if (e.code in this.keyState) {
        this.keyState[e.code] = false
      }
      if ((e.code === 'KeyA' || e.code === 'ArrowLeft') && this.targetPlayerLeanX < 0) {
        this.targetPlayerLeanX = (this.keyState['KeyD'] || this.keyState['ArrowRight']) ? 1.0 : 0.0
      } else if ((e.code === 'KeyD' || e.code === 'ArrowRight') && this.targetPlayerLeanX > 0) {
        this.targetPlayerLeanX = (this.keyState['KeyA'] || this.keyState['ArrowLeft']) ? -1.0 : 0.0
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown' || e.code === 'Space') {
        if (!this.keyState['KeyS'] && !this.keyState['ArrowDown'] && !this.keyState['Space']) {
          this.targetPlayerLeanY = 0.0
        }
      }
    })
  }

  private triggerPlayerDodge() {
    if (this.playerDodgeTimer > 0 || this.matchOver || this.inClashMode) return
    const time = this.clock?.getElapsedTime() ?? (performance.now() * 0.001)
    if (time < this.playerStunnedUntil && this.playerCCType !== 'expelliarmus') {
      const remaining = (this.playerStunnedUntil - time).toFixed(1)
      this.showCombatNumber(`🔒 BẤT ĐỘNG (${remaining}s)!`, window.innerWidth * 0.35, window.innerHeight * 0.55, 'parry')
      return
    }
    this.playerDodgeTimer = 0.45
    this.audio.playSpellCast('protego')
    this.showCombatNumber('NÉ ĐÒN!', window.innerWidth * 0.35, window.innerHeight * 0.55, 'parry')
  }

  // Mobile Touch Quick Controls (Dodge Left, Duck, Dodge Right)
  private setupMobileControls() {
    const dodgeLeftBtn = document.getElementById('mobile-dodge-left')
    const dodgeDuckBtn = document.getElementById('mobile-dodge-duck')
    const dodgeRightBtn = document.getElementById('mobile-dodge-right')

    let lastDodgeTime = 0
    const triggerDodgeAction = (dir: 'left' | 'duck' | 'right', e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      const now = performance.now()
      if (now - lastDodgeTime < 180) return
      lastDodgeTime = now
      const time = this.clock?.getElapsedTime() ?? (performance.now() * 0.001)
      if (time < this.playerStunnedUntil && this.playerCCType !== 'expelliarmus') {
        const remaining = (this.playerStunnedUntil - time).toFixed(1)
        this.showCombatNumber(`🔒 BẤT ĐỘNG (${remaining}s)!`, window.innerWidth * 0.35, window.innerHeight * 0.55, 'parry')
        return
      }
      if (dir === 'left') {
        this.targetPlayerLeanX = -1.0
        this.triggerPlayerDodge()
        setTimeout(() => { if (this.targetPlayerLeanX < 0) this.targetPlayerLeanX = 0 }, 420)
      } else if (dir === 'duck') {
        this.targetPlayerLeanY = 1.0
        this.triggerPlayerDodge()
        setTimeout(() => { this.targetPlayerLeanY = 0 }, 450)
      } else if (dir === 'right') {
        this.targetPlayerLeanX = 1.0
        this.triggerPlayerDodge()
        setTimeout(() => { if (this.targetPlayerLeanX > 0) this.targetPlayerLeanX = 0 }, 420)
      }
    }

    if (dodgeLeftBtn) {
      dodgeLeftBtn.addEventListener('click', (e) => triggerDodgeAction('left', e))
      dodgeLeftBtn.addEventListener('pointerdown', (e) => triggerDodgeAction('left', e))
    }
    if (dodgeDuckBtn) {
      dodgeDuckBtn.addEventListener('click', (e) => triggerDodgeAction('duck', e))
      dodgeDuckBtn.addEventListener('pointerdown', (e) => triggerDodgeAction('duck', e))
    }
    if (dodgeRightBtn) {
      dodgeRightBtn.addEventListener('click', (e) => triggerDodgeAction('right', e))
      dodgeRightBtn.addEventListener('pointerdown', (e) => triggerDodgeAction('right', e))
    }
  }

  private setupClashControls() {
    const mashBtn = document.getElementById('clash-mash-btn')
    mashBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      this.advanceClash(0.08)
    })
  }

  private setupModalControls() {
    // End Match Modal: Rematch / Restart Buttons
    document.getElementById('restart-match-btn')?.addEventListener('click', () => {
      this.audio.playClick()
      if (this.gameMode === 'single') {
        if (this.currentRoundIndex === 4 && this.playerHp > 0) {
          // Beat Round 5: start new gauntlet run
          this.gauntletRoster = generateGauntletRoster(this.selectedPlayerChar)
          this.renderGauntletLadderPreview()
          this.startGauntletRound(0, true)
        } else {
          // Rematch current round
          this.startGauntletRound(this.currentRoundIndex, true)
        }
      } else {
        this.resetMatch()
      }
    })

    document.getElementById('btn-restart-gauntlet')?.addEventListener('click', () => {
      this.audio.playClick()
      this.gauntletRoster = generateGauntletRoster(this.selectedPlayerChar)
      this.renderGauntletLadderPreview()
      this.startGauntletRound(0, true)
    })

    document.getElementById('modal-menu-btn')?.addEventListener('click', () => {
      this.audio.playClick()
      this.showMainMenu()
    })

    document.getElementById('btn-return-menu')?.addEventListener('click', () => {
      this.audio.playClick()
      this.showMainMenu()
    })

    // Round Clear Intermission Modal Buttons
    document.getElementById('btn-next-round')?.addEventListener('click', () => {
      this.audio.playClick()
      this.advanceToNextRound()
    })

    document.getElementById('btn-intermission-menu')?.addEventListener('click', () => {
      if (this.intermissionTimer) {
        clearInterval(this.intermissionTimer)
        this.intermissionTimer = null
      }
      document.getElementById('round-clear-modal')?.classList.add('hidden')
      this.audio.playClick()
      this.showMainMenu()
    })
  }

  // --- Main Menu & Multiplayer System ---
  private setupMainMenu() {
    // 0. Initialize Multiplayer Deck Builder in Lobby
    this.deckManager.renderLobbyUI()

    // 1. Single Player Button & Card
    const startSingle = () => {
      this.audio.playClick()
      this.startSinglePlayerMatch()
    }
    document.getElementById('btn-play-single')?.addEventListener('click', startSingle)
    document.getElementById('card-mode-single')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.id !== 'btn-play-single' && !target.closest('.character-select-section')) {
        startSingle()
      }
    })

    // 2. Multiplayer Tabs (Host vs Join)
    const tabHost = document.getElementById('tab-host-btn')
    const tabJoin = document.getElementById('tab-join-btn')
    const paneHost = document.getElementById('lobby-host-view')
    const paneJoin = document.getElementById('lobby-join-view')

    tabHost?.addEventListener('click', () => {
      this.audio.playClick()
      tabHost.classList.add('active-tab')
      tabJoin?.classList.remove('active-tab')
      paneHost?.classList.add('active-pane')
      paneJoin?.classList.remove('active-pane')
    })

    tabJoin?.addEventListener('click', () => {
      this.audio.playClick()
      tabJoin.classList.add('active-tab')
      tabHost?.classList.remove('active-tab')
      paneJoin?.classList.add('active-pane')
      paneHost?.classList.remove('active-pane')
    })

    // 3. Start Hosting Button
    const hostBtn = document.getElementById('btn-start-hosting')
    hostBtn?.addEventListener('click', async () => {
      this.audio.playClick()

      if (!this.deckManager.isDeckComplete()) {
        this.audio.playDrawFizzle()
        const remaining = 4 - this.selectedMultiplayerSpells.length
        this.showCombatNumber('⚠️ CHƯA ĐỦ 4 BÙA!', window.innerWidth / 2, window.innerHeight * 0.4, 'mana')
        this.showToast('VUI LÒNG CHỌN ĐỦ 4 BÙA!', `Bạn cần chọn thêm ${remaining} bùa từ kho phép trước khi mở phòng!`)
        const deckSection = document.getElementById('multiplayer-deck-section')
        if (deckSection) {
          deckSection.classList.remove('deck-shake-error')
          void deckSection.offsetWidth
          deckSection.classList.add('deck-shake-error')
        }
        return
      }

      const hostStatus = document.getElementById('host-status-msg')
      if (hostStatus) hostStatus.textContent = 'Đang khởi tạo phòng ma thuật...'
      
      const existingCode = document.getElementById('display-room-code')?.textContent?.trim()
      const duelistName = this.selectedPlayerChar === 'voldemort' ? 'Chúa tể Voldemort' : 'Harry Potter'
      const code = await this.network.createRoom(existingCode, duelistName, this.selectedMultiplayerSpells)
      this.currentRoomCode = code
      const codeDisplay = document.getElementById('display-room-code')
      if (codeDisplay) codeDisplay.textContent = code
      if (hostStatus) hostStatus.textContent = `Đang chờ đối thủ vào phòng: ${code}...`
      if (hostBtn) hostBtn.style.display = 'none'
    })

    // 4. Copy Code & Link
    document.getElementById('btn-copy-room-code')?.addEventListener('click', () => {
      const code = this.currentRoomCode || document.getElementById('display-room-code')?.textContent || ''
      navigator.clipboard?.writeText(code)
      const btn = document.getElementById('btn-copy-room-code')
      if (btn) {
        btn.textContent = '✓ Đã Copy'
        setTimeout(() => { if (btn) btn.textContent = '📋 Copy Mã' }, 2000)
      }
      this.showCombatNumber('ĐÃ CHÉP MÃ PHÒNG!', window.innerWidth / 2, window.innerHeight * 0.4, 'crit')
    })

    document.getElementById('btn-copy-room-link')?.addEventListener('click', () => {
      const code = this.currentRoomCode || document.getElementById('display-room-code')?.textContent || ''
      const url = `${window.location.origin}${window.location.pathname}?room=${code}`
      navigator.clipboard?.writeText(url)
      const btn = document.getElementById('btn-copy-room-link')
      if (btn) {
        btn.textContent = '✓ Đã Copy'
        setTimeout(() => { if (btn) btn.textContent = '🔗 Link Mời' }, 2000)
      }
      this.showCombatNumber('ĐÃ CHÉP LINK MỜI!', window.innerWidth / 2, window.innerHeight * 0.4, 'crit')
    })

    // 5. Join Room Action
    document.getElementById('btn-join-room')?.addEventListener('click', async () => {
      this.audio.playClick()

      if (!this.deckManager.isDeckComplete()) {
        this.audio.playDrawFizzle()
        const remaining = 4 - this.selectedMultiplayerSpells.length
        this.showCombatNumber('⚠️ CHƯA ĐỦ 4 BÙA!', window.innerWidth / 2, window.innerHeight * 0.4, 'mana')
        this.showToast('VUI LÒNG CHỌN ĐỦ 4 BÙA!', `Bạn cần chọn thêm ${remaining} bùa từ kho phép trước khi kết nối!`)
        const deckSection = document.getElementById('multiplayer-deck-section')
        if (deckSection) {
          deckSection.classList.remove('deck-shake-error')
          void deckSection.offsetWidth
          deckSection.classList.add('deck-shake-error')
        }
        return
      }

      const input = document.getElementById('input-join-code') as HTMLInputElement
      const code = input?.value?.trim().toUpperCase()
      if (!code) {
        alert('Vui lòng nhập mã phòng!')
        return
      }
      const statusWrap = document.getElementById('join-lobby-status')
      statusWrap?.classList.remove('hidden')
      const statusMsg = document.getElementById('join-status-msg')
      if (statusMsg) statusMsg.textContent = `Đang kết nối tới phòng ${code}...`

      const duelistName = this.selectedPlayerChar === 'voldemort' ? 'Chúa tể Voldemort' : 'Harry Potter'
      const ok = await this.network.joinRoom(code, duelistName, this.selectedMultiplayerSpells)
      if (!ok && !this.network.isConnected) {
        if (statusMsg) statusMsg.textContent = `Không thể tìm thấy phòng ${code}! Hãy kiểm tra lại mã.`
      }
    })

    // 6. Network Handlers & Lobby Browser
    this.network.onConnect((isHost, roomCode) => {
      this.startMultiplayerMatch(isHost, roomCode)
    })
    this.network.onMessage((msg) => {
      this.handleNetworkMessage(msg)
    })
    this.network.onDisconnect((reason) => {
      this.handleNetworkDisconnect(reason)
    })
    this.network.onOpenRoomsChange((rooms) => {
      this.renderOpenLobbyRooms(rooms)
    })
    document.getElementById('btn-refresh-open-rooms')?.addEventListener('click', () => {
      this.audio.playClick()
      this.renderOpenLobbyRooms(this.network.getOpenRooms())
    })

    // 7. Menu Settings Buttons
    document.getElementById('menu-sound-btn')?.addEventListener('click', () => {
      this.audio.toggleMute()
      const icon = document.getElementById('menu-sound-icon')
      const text = document.getElementById('menu-sound-text')
      if (icon && text) {
        icon.textContent = this.audio.isMuted ? '🔇' : '🔊'
        text.textContent = this.audio.isMuted ? 'ÂM THANH: TẮT' : 'ÂM THANH: BẬT'
      }
    })

    document.getElementById('menu-camera-btn')?.addEventListener('click', () => {
      const modes: Array<'cinematic' | 'side' | 'mobile' | 'portrait'> = ['cinematic', 'side', 'mobile', 'portrait']
      const currentIndex = modes.indexOf(this.cameraMode)
      this.cameraMode = modes[(currentIndex + 1) % modes.length]
      const text = document.getElementById('menu-camera-text')
      if (text) text.textContent = `GÓC MÁY: ${this.cameraMode.toUpperCase()}`
    })

    // 8. Auto-connect if URL has ?room=...
    const urlParams = new URLSearchParams(window.location.search)
    const roomParam = urlParams.get('room')
    if (roomParam) {
      tabJoin?.click()
      const input = document.getElementById('input-join-code') as HTMLInputElement
      if (input) input.value = roomParam.toUpperCase()
      const statusWrap = document.getElementById('join-lobby-status')
      statusWrap?.classList.remove('hidden')
      const statusMsg = document.getElementById('join-status-msg')
      if (statusMsg) statusMsg.textContent = `Phát hiện link phòng ${roomParam}, đang tự động kết nối...`
      this.network.joinRoom(roomParam)
    }
  }

  public async startSinglePlayerMatch() {
    this.gameMode = 'single'
    this.aiDisabled = false
    this.currentRoundIndex = 0
    this.deckManager.renderDockForSinglePlayer((spellKey) => this.castPlayerSpell(spellKey, 95))
    if (!this.gauntletRoster || this.gauntletRoster.length < 5) {
      this.gauntletRoster = generateGauntletRoster(this.selectedPlayerChar)
    }

    document.getElementById('main-menu-overlay')?.classList.add('hidden')
    document.getElementById('hud-overlay')?.classList.remove('hidden')
    document.getElementById('round-clear-modal')?.classList.add('hidden')
    document.getElementById('end-match-modal')?.classList.add('hidden')

    const hintText = document.querySelector('.hud-controls-hint .hint-text')
    if (hintText) {
      hintText.innerHTML = '<strong>A/D</strong>: Né · <strong>S/Space</strong>: Cúi · Vẽ ký hiệu hoặc phím <strong>[1-9]</strong> để xuất chiêu · Bấm <strong>📖 Pháp Điển [G]</strong>'
    }

    // Load active selected player character into the 3D scene & update HUD
    await this.loadDuelistCharacter(this.selectedPlayerChar, false)

    await this.startGauntletRound(0, false)
  }

  public async startGauntletRound(roundIndex: number, isRematch: boolean) {
    if (this.intermissionTimer) {
      clearInterval(this.intermissionTimer)
      this.intermissionTimer = null
    }

    this.currentRoundIndex = Math.max(0, Math.min(4, roundIndex))
    const entry = this.gauntletRoster[this.currentRoundIndex]
    if (!entry) return

    this.selectedOpponentChar = entry.charId
    this.currentTier = entry.tier
    this.maxEnemyHp = entry.tier.maxHp
    this.enemyHp = this.maxEnemyHp
    this.ghostEnemyHp = this.maxEnemyHp
    this.enemyMana = 100
    this.maxEnemyMana = 100

    if (isRematch || this.currentRoundIndex === 0) {
      this.maxPlayerHp = 100
      this.playerHp = 100
      this.ghostPlayerHp = 100
      this.playerMana = 100
      this.maxPlayerMana = 100
    }

    this.matchTimer = 120
    this.matchOver = false
    this.inClashMode = false
    this.enemyCurrentCast = null
    this.enemyTelegraphTime = 0
    this.enemyNextActionTime = (this.clock?.getElapsedTime() ?? 0) + 2.5
    this.aiDisabled = false

    // Clean up projectiles
    for (const p of this.projectiles) {
      if (p.mesh) this.scene.remove(p.mesh)
      if (p.groundScorchMesh) this.scene.remove(p.groundScorchMesh)
    }
    this.projectiles = []

    this.playerStunnedUntil = 0
    this.playerCCType = null
    this.playerCCName = ''
    this.enemyStunnedUntil = 0
    this.enemyCCType = null
    this.enemyCCName = ''
    this.playerCooldowns = {}
    this.enemyCooldowns = {}
    this.hidePlayerCCUI()
    this.hideEnemyCCUI()

    if (this.playerLego) {
      this.playerLego.isChanneling = false
      this.playerLego.isTargetChanneling = false
      this.playerLego.isPetrified = false
      this.playerLego.isStunned = false
      this.playerLego.isConfused = false
      this.playerLego.isDisarmed = false
      this.playerLego.setWandVisible(true)
    }
    if (this.opponentLego) {
      this.opponentLego.isChanneling = false
      this.opponentLego.isTargetChanneling = false
      this.opponentLego.isPetrified = false
      this.opponentLego.isStunned = false
      this.opponentLego.isConfused = false
      this.opponentLego.isDisarmed = false
      this.opponentLego.setWandVisible(true)
    }

    // Hot-swap 3D model for this round's opponent
    await this.loadDuelistCharacter(this.selectedOpponentChar, true)

    // Update HUD
    const modePill = document.getElementById('duel-mode-pill')
    if (modePill) {
      modePill.textContent = `ẢI ${entry.tier.tierNumber}/5 · ${entry.tier.tierName.toUpperCase()}`
    }

    const enemyBadge = document.querySelector('.enemy-bracket .avatar-level-badge')
    if (enemyBadge) {
      enemyBadge.textContent = `ẢI ${entry.tier.tierNumber}`
    }

    const clock = document.getElementById('duel-clock')
    if (clock) clock.textContent = '02:00'

    this.updateHpBars()

    document.getElementById('round-clear-modal')?.classList.add('hidden')
    document.getElementById('end-match-modal')?.classList.add('hidden')

    this.showMatchBanner(
      `ẢI ${entry.tier.tierNumber}/5: ${entry.char.name}!`,
      `Độ khó: ${entry.tier.tierName} (${entry.tier.maxHp} HP) · "${entry.char.quote}"`
    )
  }

  private showRoundClearIntermission() {
    const modal = document.getElementById('round-clear-modal')
    if (!modal) return

    const currentEntry = this.gauntletRoster[this.currentRoundIndex]
    const nextRoundIndex = this.currentRoundIndex + 1
    const nextEntry = this.gauntletRoster[nextRoundIndex]

    const badgeText = document.getElementById('round-clear-badge-text')
    if (badgeText) badgeText.textContent = `ẢI ${currentEntry.tier.tierNumber}/5 HOÀN THÀNH`

    const titleEl = document.getElementById('round-clear-title')
    if (titleEl) titleEl.textContent = 'CHIẾN THẮNG TUYỆT ĐỐI!'

    const subEl = document.getElementById('round-clear-sub')
    if (subEl) subEl.textContent = `Bạn đã hạ gục ${currentEntry.char.fullName} và mở khóa ải tiếp theo!`

    if (nextEntry) {
      const stageBadge = document.getElementById('next-stage-badge')
      if (stageBadge) {
        stageBadge.className = `next-stage-badge ${nextEntry.tier.tagClass}`
        stageBadge.textContent = `${nextEntry.tier.tierBadge}`
      }

      const imgEl = document.getElementById('next-opponent-img') as HTMLImageElement
      if (imgEl) imgEl.src = nextEntry.char.avatarUrl

      const houseIconEl = document.getElementById('next-opponent-house-icon')
      if (houseIconEl) houseIconEl.textContent = nextEntry.char.houseIcon

      const nameEl = document.getElementById('next-opponent-name')
      if (nameEl) nameEl.textContent = nextEntry.char.name

      const houseEl = document.getElementById('next-opponent-house') as HTMLElement
      if (houseEl) {
        houseEl.className = `house-tag-badge ${nextEntry.char.houseTagClass}`
        houseEl.textContent = nextEntry.char.house
      }

      const hpEl = document.getElementById('next-opponent-hp')
      if (hpEl) hpEl.textContent = `${nextEntry.tier.maxHp} HP`

      const reflexEl = document.getElementById('next-opponent-reflex')
      if (reflexEl) reflexEl.textContent = `Casting: ${nextEntry.tier.telegraphTime}s`

      const dodgeEl = document.getElementById('next-opponent-dodge')
      if (dodgeEl) dodgeEl.textContent = `Né: ${Math.round(nextEntry.tier.dodgeChance * 100)}%`

      const specEl = document.getElementById('next-opponent-specialty')
      if (specEl) specEl.textContent = `Lời khuyên: ${nextEntry.tier.advice}`
    }

    modal.classList.remove('hidden')

    // 5-second auto-proceed countdown
    let countdown = 5
    const nextBtnText = document.getElementById('btn-next-round-text')
    if (nextBtnText) nextBtnText.textContent = `TIẾP TỤC ẢI ${nextRoundIndex + 1} (${countdown}s)`

    if (this.intermissionTimer) clearInterval(this.intermissionTimer)
    this.intermissionTimer = setInterval(() => {
      countdown--
      if (countdown > 0) {
        if (nextBtnText) nextBtnText.textContent = `TIẾP TỤC ẢI ${nextRoundIndex + 1} (${countdown}s)`
      } else {
        clearInterval(this.intermissionTimer)
        this.intermissionTimer = null
        this.advanceToNextRound()
      }
    }, 1000)
  }

  public async advanceToNextRound() {
    if (this.intermissionTimer) {
      clearInterval(this.intermissionTimer)
      this.intermissionTimer = null
    }

    // Warrior recovery blessing
    this.playerHp = Math.min(100, this.playerHp + 40)
    this.ghostPlayerHp = this.playerHp
    this.playerMana = Math.min(100, this.playerMana + 50)
    this.updateHpBars()

    const nextIndex = this.currentRoundIndex + 1
    if (nextIndex < this.gauntletRoster.length) {
      await this.startGauntletRound(nextIndex, false)
    }
  }

  public startMultiplayerMatch(isHost: boolean, roomCode: string) {
    this.gameMode = 'multiplayer'
    this.isHost = isHost
    this.currentRoomCode = roomCode
    this.aiDisabled = true
    this.selectedMultiplayerSpells = this.deckManager.getDeck()
    this.deckManager.renderDockForMultiplayer((spellKey) => this.castPlayerSpell(spellKey, 95))
    document.getElementById('main-menu-overlay')?.classList.add('hidden')
    document.getElementById('hud-overlay')?.classList.remove('hidden')
    const modePill = document.getElementById('duel-mode-pill')
    if (modePill) modePill.textContent = 'ONLINE P2P (4 BÙA)'
    const pName = document.getElementById('player-display-name')
    if (pName) pName.textContent = isHost ? 'HARRY (BẠN)' : 'BẠN (GUEST)'
    const eName = document.querySelector('.enemy-info .duelist-name')
    if (eName) eName.textContent = isHost ? 'ĐỐI THỦ (GUEST)' : 'CHỦ PHÒNG (HARRY)'
    const hintText = document.querySelector('.hud-controls-hint .hint-text')
    if (hintText) {
      hintText.innerHTML = '<strong>A/D</strong>: Né · <strong>S/Space</strong>: Cúi · Vẽ ký hiệu hoặc phím <strong>[1-4]</strong> (4 bùa đã chọn) · Bấm <strong>📖 Pháp Điển [G]</strong>'
    }
    this.resetMatch()
    if (this.network?.isConnected) {
      this.network.send({
        type: 'loadout',
        payload: { spells: this.selectedMultiplayerSpells }
      })
    }
    this.showMatchBanner('TRẬN ĐẤU TRỰC TUYẾN!', `Phòng: ${roomCode} · Sẵn sàng thi thố!`)
  }

  public showMainMenu() {
    if (this.intermissionTimer) {
      clearInterval(this.intermissionTimer)
      this.intermissionTimer = null
    }
    if (this.gameMode === 'multiplayer') {
      this.network.disconnect()
    }
    this.gameMode = 'menu'
    this.aiDisabled = true
    this.matchOver = true
    document.getElementById('hud-overlay')?.classList.add('hidden')
    document.getElementById('round-clear-modal')?.classList.add('hidden')
    document.getElementById('end-match-modal')?.classList.add('hidden')
    document.getElementById('clash-hud')?.classList.add('hidden')
    document.getElementById('main-menu-overlay')?.classList.remove('hidden')
    this.deckManager.renderLobbyUI()
    this.deckManager.renderDockForSinglePlayer((spellKey) => this.castPlayerSpell(spellKey, 95))
    this.renderGauntletLadderPreview()
    this.updateMenuMatchupPreview()
    this.renderOpenLobbyRooms(this.network.getOpenRooms())
    const hostBtn = document.getElementById('btn-start-hosting')
    if (hostBtn) hostBtn.style.display = 'flex'
    const hostStatus = document.getElementById('host-status-msg')
    if (hostStatus) hostStatus.textContent = 'Nhấn Mở Phòng để đón bạn bè...'
  }

  private handleNetworkMessage(msg: NetworkMessage) {
    switch (msg.type) {
      case 'loadout': {
        const spells = msg.payload?.spells || []
        this.opponentMultiplayerSpells = spells
        this.showToast('ĐỐI THỦ ĐÃ SẴN SÀNG!', `Đối thủ đã vào phòng với 4 bùa xuất trận!`)
        break
      }
      case 'cast': {
        const spellName = msg.payload?.spell
        const spell = SPELL_DECK[spellName]
        if (spell) {
          this.opponentCastProgress = 1.0
          this.audio.playSpellCast(spellName)
          if (spellName === 'petrificus' || spellName === 'stupefy' || spellName === 'obliviate') {
            this.spawnWandCCVfx(false, spellName)
            if (spellName === 'petrificus') this.applyPetrificusDirect(this.playerLego)
            else if (spellName === 'stupefy') this.applyStupefyDirect(this.playerLego)
            else if (spellName === 'obliviate') this.applyObliviateDirect(this.playerLego)
          } else {
            this.fireProjectile(spell, false)
          }
          this.showCombatNumber(`ĐỐI THỦ: ${spell.displayName}!`, window.innerWidth * 0.7, window.innerHeight * 0.4, 'crit')
        }
        break
      }
      case 'dodge': {
        const dir = msg.payload?.dir
        if (dir === 'left') {
          this.opponentLeanX = -1.0
          setTimeout(() => { if (this.opponentLeanX < 0) this.opponentLeanX = 0 }, 420)
        } else if (dir === 'duck') {
          this.opponentLeanY = 1.0
          setTimeout(() => { this.opponentLeanY = 0 }, 450)
        } else if (dir === 'right') {
          this.opponentLeanX = 1.0
          setTimeout(() => { if (this.opponentLeanX > 0) this.opponentLeanX = 0 }, 420)
        }
        this.showCombatNumber('ĐỐI THỦ NÉ!', window.innerWidth * 0.65, window.innerHeight * 0.45, 'parry')
        break
      }
      case 'shield': {
        this.enemyShieldActiveUntil = msg.payload?.activeUntil || ((this.clock?.getElapsedTime() ?? 0) + 1.8)
        this.audio.playSpellCast('protego')
        this.showCombatNumber('ĐỐI THỦ BẬT KHIÊN!', window.innerWidth * 0.65, window.innerHeight * 0.45, 'parry')
        break
      }
      case 'damage_sync': {
        if (typeof msg.payload?.playerHp === 'number') this.playerHp = msg.payload.playerHp
        if (typeof msg.payload?.enemyHp === 'number') this.enemyHp = msg.payload.enemyHp
        this.updateHpBars()
        break
      }
      case 'clash_mash': {
        if (this.inClashMode) {
          this.clashProgress = Math.max(0.05, Math.min(0.95, this.clashProgress - 0.04))
          const marker = document.getElementById('clash-glow-marker')
          if (marker) marker.style.left = `${this.clashProgress * 100}%`
        }
        break
      }
      case 'rematch': {
        this.resetMatch()
        this.showMatchBanner('ĐẤU LẠI!', 'Đối thủ đã yêu cầu tái đấu!')
        break
      }
    }
  }

  private handleNetworkDisconnect(reason?: string) {
    if (this.gameMode === 'multiplayer') {
      this.showToast('MẤT KẾT NỐI!', reason || 'Đối thủ đã rời khỏi phòng đấu!')
      this.showCombatNumber('ĐỐI THỦ ĐÃ RỜI PHÒNG', window.innerWidth / 2, window.innerHeight * 0.4, 'crit')
      setTimeout(() => {
        this.showMainMenu()
      }, 2500)
    }
  }

  private resetMatch() {
    this.playerHp = 100
    this.ghostPlayerHp = 100
    this.enemyHp = 100
    this.ghostEnemyHp = 100
    this.playerMana = 100
    this.enemyMana = 100
    this.matchTimer = 120
    this.matchOver = false
    this.inClashMode = false
    this.perfectCount = 0
    this.clashesWon = 0
    this.updateHpBars()
    const clock = document.getElementById('duel-clock')
    if (clock) clock.textContent = '02:00'

    if (this.network?.isConnected) {
        this.network.send({ type: 'rematch' })
    }

    // Clean up any lingering projectiles
    for (const p of this.projectiles) {
      if (p.mesh) this.scene.remove(p.mesh)
    }
    this.projectiles = []

    this.playerStunnedUntil = 0
    this.playerCCType = null
    this.playerCCName = ''
    this.playerCCDuration = 0
    this.enemyStunnedUntil = 0
    this.enemyCCType = null
    this.enemyCCName = ''
    this.enemyCCDuration = 0
    this.playerCooldowns = {}
    this.enemyCooldowns = {}
    this.hidePlayerCCUI()
    this.hideEnemyCCUI()

    if (this.playerLego) {
      this.playerLego.isChanneling = false
      this.playerLego.isTargetChanneling = false
      this.playerLego.isPetrified = false
      this.playerLego.isStunned = false
      this.playerLego.isConfused = false
      this.playerLego.isDisarmed = false
      this.playerLego.setWandVisible(true)
    }
    if (this.opponentLego) {
      this.opponentLego.isChanneling = false
      this.opponentLego.isTargetChanneling = false
      this.opponentLego.isPetrified = false
      this.opponentLego.isStunned = false
      this.opponentLego.isConfused = false
      this.opponentLego.isDisarmed = false
      this.opponentLego.setWandVisible(true)
    }

    document.getElementById('end-match-modal')?.classList.add('hidden')
    document.getElementById('clash-hud')?.classList.add('hidden')
    this.showMatchBanner('TRẬN ĐẤU MỚI!', 'Đũa phép sẵn sàng!')
  }

  private onWindowResize() {
    const width = window.innerWidth
    const height = window.innerHeight
    const isPortrait = height > width
    this.camera.aspect = width / height
    this.camera.fov = isPortrait ? 68 : 55
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)

    if (isPortrait && this.cameraMode !== 'portrait') {
      this.cameraMode = 'portrait'
      this.camera.position.copy(this.CAMERA_POSITIONS.portrait.pos)
      this.camera.lookAt(this.CAMERA_POSITIONS.portrait.look)
    } else if (!isPortrait && this.cameraMode === 'portrait') {
      this.cameraMode = 'cinematic'
      this.camera.position.copy(this.CAMERA_POSITIONS.cinematic.pos)
      this.camera.lookAt(this.CAMERA_POSITIONS.cinematic.look)
    }
    
    // Update post-processing composer for new size
    if (this.composer) {
      this.composer.setSize(width, height)
    }
    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height)
    }
  }

  public isPaused: boolean = false

  // --- 60 FPS Engine Render Loop ---
  private animate() {
    requestAnimationFrame(() => this.animate())
    if (this.isPaused) {
      if (this.composer) this.composer.render()
      else this.renderer.render(this.scene, this.camera)
      return
    }

    const delta = Math.min(this.clock.getDelta(), 0.05)
    const time = this.clock?.getElapsedTime() ?? 0

    // --- REALTIME CROWD CONTROL (CC) TICKER & AUTO-RECOVERY ---
    // 1. Player Crowd Control
    if (this.playerStunnedUntil > 0) {
      if (time < this.playerStunnedUntil) {
        const remain = this.playerStunnedUntil - time
        this.updatePlayerCCUI(remain)
      } else {
        this.playerStunnedUntil = 0
        this.playerCCType = null
        this.playerCCName = ''
        this.playerCCDuration = 0
        this.hidePlayerCCUI()
        this.updatePromptStatus('ready', 'ĐÃ HỒI PHỤC! Mau vung đũa vẽ bùa phản công')
        if (this.playerLego) {
          this.playerLego.isPetrified = false
          this.playerLego.isStunned = false
          this.playerLego.isConfused = false
          this.playerLego.isDisarmed = false
          this.playerLego.setWandVisible(true)
        }
      }
    }

    // 2. Opponent Crowd Control
    if (this.enemyStunnedUntil > 0) {
      if (time < this.enemyStunnedUntil) {
        const remain = this.enemyStunnedUntil - time
        this.updateEnemyCCUI(remain)
      } else {
        this.enemyStunnedUntil = 0
        this.enemyCCType = null
        this.enemyCCName = ''
        this.enemyCCDuration = 0
        this.hideEnemyCCUI()
        if (this.opponentLego) {
          this.opponentLego.isPetrified = false
          this.opponentLego.isStunned = false
          this.opponentLego.isConfused = false
          this.opponentLego.isDisarmed = false
          this.opponentLego.setWandVisible(true)
        }
      }
    }

    // Passive Mana Regeneration & Ghost Damage Bar Decay
    if (!this.matchOver && this.gameMode !== 'menu') {
      let needsHudUpdate = false

      if (this.playerMana < this.maxPlayerMana) {
        this.playerMana = Math.min(this.maxPlayerMana, this.playerMana + this.manaRegenRate * delta)
        needsHudUpdate = true
      }
      if (this.enemyMana < this.maxEnemyMana) {
        this.enemyMana = Math.min(this.maxEnemyMana, this.enemyMana + this.manaRegenRate * delta)
        needsHudUpdate = true
      }

      // Smooth ghost HP trailing decay
      if (this.ghostPlayerHp > this.playerHp) {
        this.ghostPlayerHp = Math.max(this.playerHp, this.ghostPlayerHp - delta * 25)
        needsHudUpdate = true
      } else if (this.ghostPlayerHp < this.playerHp) {
        this.ghostPlayerHp = this.playerHp
        needsHudUpdate = true
      }

      if (this.ghostEnemyHp > this.enemyHp) {
        this.ghostEnemyHp = Math.max(this.enemyHp, this.ghostEnemyHp - delta * 25)
        needsHudUpdate = true
      } else if (this.ghostEnemyHp < this.enemyHp) {
        this.ghostEnemyHp = this.enemyHp
        needsHudUpdate = true
      }

      if (needsHudUpdate) {
        this.updateHpBars()
      }
    }

    // Real-time Spell Cooldown & Readiness updates
    this.updateCooldownsUI(time)

    // 1. Cinematic Spectator Camera (Over-the-shoulder looking down antique table at Voldemort)
    this.camRecoil = Math.max(0, this.camRecoil - delta * 3.5)
    
    // Get current camera settings based on mode
    const camSettings = this.CAMERA_POSITIONS[this.cameraMode]
    const baseX = camSettings.pos.x
    const baseY = camSettings.pos.y
    const baseZ = camSettings.pos.z
    const lookX = camSettings.look.x
    const lookY = camSettings.look.y
    const lookZ = camSettings.look.z
    
    // Apply parallax and recoil on top of base position
    const targetX = baseX + this.targetCamX * 0.12
    const targetY = baseY + this.targetCamY * 0.08
    const targetZ = baseZ + this.camRecoil

    this.camera.position.x += (targetX - this.camera.position.x) * 0.08
    this.camera.position.y += (targetY - this.camera.position.y) * 0.08
    this.camera.position.z += (targetZ - this.camera.position.z) * 0.08
    this.camera.lookAt(lookX, lookY, lookZ)

    // 2. Dynamic Player Character Motion (LEGO Harry Potter — Fixed Stance, Leaning/Ducking Dodge)
    if (this.playerGroup && this.playerLego) {
      if (this.playerDodgeTimer > 0) {
        this.playerDodgeTimer = Math.max(0, this.playerDodgeTimer - delta)
      }

      // Smooth interpolation for snappy, responsive dodge kinematics
      this.playerLeanX += (this.targetPlayerLeanX - this.playerLeanX) * Math.min(1, delta * 12.0)
      this.playerLeanY += (this.targetPlayerLeanY - this.playerLeanY) * Math.min(1, delta * 14.0)

      // Character stays strictly on fixed dueling mark (no free walking)
      this.playerGroup.position.copy(this.playerBasePos)
      this.playerGroup.rotation.y = Math.PI - 0.38

      // Pass state to LegoDuelist
      const isPlayerCC = (time < this.playerStunnedUntil)
      this.playerLego.aimOffset.set(this.targetCamX, this.targetCamY)
      this.playerLego.castProgress = isPlayerCC ? 0 : this.playerCastProgress
      this.playerLego.flinchProgress = this.playerFlinch
      this.playerLego.isDefending = !isPlayerCC && (time < this.playerShieldActiveUntil)
      this.playerLego.isClashing = this.inClashMode
      this.playerLego.isPetrified = isPlayerCC && (this.playerCCType === 'petrificus' || this.playerCCType === 'immobulus')
      this.playerLego.isStunned = isPlayerCC && (this.playerCCType === 'stupefy' || this.playerCCType === 'levicorpus')
      this.playerLego.isConfused = isPlayerCC && (this.playerCCType === 'obliviate')
      this.playerLego.isDisarmed = isPlayerCC && (this.playerCCType === 'expelliarmus')
      if (this.playerLego.isDisarmed) {
        this.playerLego.setWandVisible(false)
      } else {
        this.playerLego.setWandVisible(true)
      }
      this.playerLego.leanX = isPlayerCC && (this.playerCCType !== 'expelliarmus') ? 0 : this.playerLeanX
      this.playerLego.leanY = isPlayerCC && (this.playerCCType !== 'expelliarmus') ? 0 : this.playerLeanY

      if (this.playerCastProgress > 0) {
        this.playerCastProgress = Math.max(0, this.playerCastProgress - delta * 3.2)
        const flick = Math.sin(this.playerCastProgress * Math.PI)
        this.playerGroup.position.z = this.playerBasePos.z - flick * 0.12
      } else {
        this.playerGroup.position.z = this.playerBasePos.z
      }

      if (this.playerFlinch > 0) {
        this.playerFlinch = Math.max(0, this.playerFlinch - delta * 4.0)
        this.playerGroup.position.x -= Math.sin(this.playerFlinch * Math.PI * 4) * 0.04
      }

      this.playerLego.update(delta, time, false, 0)
      this.playerLego.applyLeanDodge()

      // Dynamic reactive motion for imported 3D Player duelist model
      if (this.playerCharGLB) {
        const isPetrified = isPlayerCC && (this.playerCCType === 'petrificus' || this.playerCCType === 'immobulus')
        const isStunned = isPlayerCC && (this.playerCCType === 'stupefy' || this.playerCCType === 'levicorpus')
        if (isPetrified) {
          this.playerCharGLB.position.y = this.playerCharBaseY
          this.playerCharGLB.position.x = 0
          this.playerCharGLB.rotation.z = 0
          this.playerCharGLB.rotation.x = 0
        } else if (isStunned) {
          this.playerCharGLB.position.y = this.playerCharBaseY
          this.playerCharGLB.rotation.z = Math.sin(time * 9) * 0.12
          this.playerCharGLB.rotation.x = Math.cos(time * 7) * 0.08
        } else {
          const bob = Math.sin(time * 2.5) * 0.012
          this.playerCharGLB.position.y = this.playerCharBaseY + bob
          this.playerCharGLB.position.x = this.playerLeanX * 0.16
          this.playerCharGLB.rotation.z = this.playerLeanX * 0.12
          if (this.playerCastProgress > 0) {
            this.playerCharGLB.position.z = -this.playerCastProgress * 0.10
            this.playerCharGLB.rotation.x = this.playerCastProgress * 0.08
          } else {
            this.playerCharGLB.position.z = 0
            this.playerCharGLB.rotation.x = 0
          }
        }
      }
    }

    // 3. Dynamic Opponent Character Motion (LEGO Lord Voldemort — Fixed Runway Mark, Reactive AI Dodge)
    if (this.opponentGroup && this.opponentLego) {
      const isEnemyCC = (time < this.enemyStunnedUntil)
      const isTargetedByBeam = this.projectiles.some(p => p.active && p.beamHolding && p.isPlayer)

      // AI reactive dodge: when player spell approaches, Voldemort leans or ducks
      const incomingSpell = this.projectiles.find(p => p.isPlayer && p.active && p.progress > 0.35 && p.progress < 0.85)
      if (!isEnemyCC && incomingSpell && !isTargetedByBeam && this.opponentDodgeCooldown <= 0) {
        const dodgeChance = this.currentTier ? this.currentTier.dodgeChance : 0.50
        if (Math.random() < dodgeChance) {
          this.targetOpponentLeanX = (Math.random() > 0.5 ? 1 : -1) * 0.85
          this.targetOpponentLeanY = Math.random() > 0.5 ? 0.75 : 0
          this.opponentDodgeCooldown = 0.8
        }
      }
      if (isEnemyCC) {
        this.targetOpponentLeanX = 0
        this.targetOpponentLeanY = 0
        this.opponentDodgeCooldown = 0
      } else if (this.opponentDodgeCooldown > 0) {
        this.opponentDodgeCooldown -= delta
        if (this.opponentDodgeCooldown <= 0.2) {
          this.targetOpponentLeanX = 0
          this.targetOpponentLeanY = 0
        }
      }

      this.opponentLeanX += (this.targetOpponentLeanX - this.opponentLeanX) * Math.min(1, delta * 9.0)
      this.opponentLeanY += (this.targetOpponentLeanY - this.opponentLeanY) * Math.min(1, delta * 11.0)

      const flinchKnock = (this.opponentFlinch > 0) ? this.opponentFlinch : 0
      this.opponentGroup.position.x = this.opponentBasePos.x + flinchKnock * 0.25
      this.opponentGroup.position.y = this.opponentBasePos.y
      this.opponentGroup.position.z = this.opponentBasePos.z - flinchKnock * 0.45
      this.opponentGroup.rotation.y = -0.38

      // Decrement cast & flinch progress
      if (this.opponentCastProgress > 0) {
        this.opponentCastProgress = Math.max(0, this.opponentCastProgress - delta * 2.8)
      }
      if (this.opponentFlinch > 0) {
        this.opponentFlinch = Math.max(0, this.opponentFlinch - delta * 4.0)
      }

      this.opponentLego.castProgress = isEnemyCC ? 0 : this.opponentCastProgress
      this.opponentLego.flinchProgress = this.opponentFlinch
      this.opponentLego.isPetrified = isEnemyCC && (this.enemyCCType === 'petrificus' || this.enemyCCType === 'immobulus')
      this.opponentLego.isStunned = isEnemyCC && (this.enemyCCType === 'stupefy' || this.enemyCCType === 'levicorpus')
      this.opponentLego.isConfused = isEnemyCC && (this.enemyCCType === 'obliviate')
      this.opponentLego.isDisarmed = isEnemyCC && (this.enemyCCType === 'expelliarmus')
      if (this.opponentLego.isDisarmed) {
        this.opponentLego.setWandVisible(false)
      } else {
        this.opponentLego.setWandVisible(true)
      }
      this.opponentLego.isClashing = this.inClashMode
      this.opponentLego.isDefending = !isEnemyCC && (time < this.enemyShieldActiveUntil)
      this.opponentLego.leanX = this.opponentLeanX
      this.opponentLego.leanY = this.opponentLeanY

      // Charging stance
      const isCharging = !isEnemyCC && Boolean(this.enemyCurrentCast && time < this.enemyTelegraphTime)
      if (isCharging) {
        this.opponentLight.intensity = 0.85 + Math.sin(time * 15) * 0.20
        if (this.dracoAuraSprite) {
          this.dracoAuraSprite.material.opacity = 0.65
          const sc = 0.22 + Math.sin(time * 15) * 0.04
          this.dracoAuraSprite.scale.set(sc, sc, 1)
        }
      } else {
        this.opponentLight.intensity = 0.15 + Math.sin(time * 6) * 0.04
        if (this.dracoAuraSprite) {
          this.dracoAuraSprite.material.opacity = 0
        }
      }

      // Stunned / Confused positioning
      if (this.opponentLego.isStunned || this.opponentLego.isConfused) {
        const wobble = Math.sin(time * 8.5)
        this.opponentGroup.rotation.z = wobble * 0.08
      } else {
        this.opponentGroup.rotation.z = 0
      }

      this.opponentLego.update(delta, time, false, 0)
      this.opponentLego.applyLeanDodge()

      // Dynamic reactive motion for imported 3D duelist model (Opponent)
      const oppGLB = this.opponentCharGLB || this.voldemort2005GLB
      if (oppGLB) {
        const isPetrified = isEnemyCC && (this.enemyCCType === 'petrificus' || this.enemyCCType === 'immobulus')
        const isStunned = isEnemyCC && (this.enemyCCType === 'stupefy' || this.enemyCCType === 'levicorpus')
        if (isPetrified) {
          oppGLB.position.y = (this.opponentCharBaseY || this.voldemort2005BaseY)
          oppGLB.position.x = 0
          oppGLB.rotation.z = 0
          oppGLB.rotation.x = 0
        } else if (isStunned) {
          oppGLB.position.y = (this.opponentCharBaseY || this.voldemort2005BaseY)
          oppGLB.rotation.z = Math.sin(time * 9) * 0.14
          oppGLB.rotation.x = Math.cos(time * 7) * 0.08
        } else {
          const bob = Math.sin(time * 2.8) * 0.015
          oppGLB.position.y = (this.opponentCharBaseY || this.voldemort2005BaseY) + bob - this.opponentLeanY * 0.12
          oppGLB.position.x = this.opponentLeanX * 0.18
          oppGLB.rotation.z = -this.opponentLeanX * 0.14
          if (this.opponentCastProgress > 0) {
            oppGLB.position.z = this.opponentCastProgress * 0.14
            oppGLB.rotation.x = -this.opponentCastProgress * 0.10
          } else {
            oppGLB.position.z = 0
            oppGLB.rotation.x = 0
          }
        }
      }
    }

    // Update 2.5D Hogwarts Diorama & 3D Runway with Parallax
    if (this.duelingStage) {
      this.duelingStage.update(time, this.targetCamX, this.targetCamY)
    }

    // Fade Wand Muzzle Flare
    if (this.wandMuzzleSprite && this.wandMuzzleSprite.material.opacity > 0) {
      this.wandMuzzleSprite.material.opacity = Math.max(0, this.wandMuzzleSprite.material.opacity - delta * 6.0)
    }

    // Spin Stun Stars
    if (this.stunStarsGroup && this.stunStarsGroup.visible) {
      this.stunStarsGroup.rotation.y += delta * 4.0
    }

    // Update Active Wand CC Auras (swirling around caster's wand shaft & tip)
    for (let i = this.activeWandAuras.length - 1; i >= 0; i--) {
      const aura = this.activeWandAuras[i]
      aura.elapsed += delta
      const alive = aura.update(delta)
      if (!alive || aura.elapsed >= aura.duration) {
        aura.parent.remove(aura.group)
        aura.group.traverse(obj => {
          if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose()
          if ((obj as THREE.Mesh).material) {
            const mat = (obj as THREE.Mesh).material
            if (Array.isArray(mat)) mat.forEach(m => m.dispose())
            else mat.dispose()
          }
        })
        this.activeWandAuras.splice(i, 1)
      }
    }

    // 4. Animate Floating Candles
    for (const candle of this.candles) {
      const { baseY, phase, speed } = candle.userData
      candle.position.y = baseY + Math.sin(time * speed + phase) * 0.06
    }

    // 5. Update Full-Body 360° Shields & Floor Rune Circles Opacity
    if (this.playerShieldMesh && this.playerGroup) {
      const pX = this.playerGroup.position.x
      const pZ = this.playerGroup.position.z
      const centerY = -0.20
      this.playerShieldMesh.position.set(pX, centerY, pZ)
      if (this.playerShieldRim) this.playerShieldRim.position.set(pX, centerY, pZ)
      if (this.playerInnerShieldMesh) this.playerInnerShieldMesh.position.set(pX, centerY, pZ)
      if (this.playerShieldRing) this.playerShieldRing.position.set(pX, centerY, pZ)
      if (this.playerShieldRing2) this.playerShieldRing2.position.set(pX, centerY, pZ)
      if (this.playerRuneMesh) this.playerRuneMesh.position.set(pX, -0.835, pZ)
      if (this.playerRuneInnerMesh) this.playerRuneInnerMesh.position.set(pX, -0.834, pZ)

      const active = time < this.playerShieldActiveUntil
      const targetOp = active ? 0.48 : 0
      const mat = this.playerShieldMesh.material as THREE.MeshBasicMaterial
      mat.opacity += (targetOp - mat.opacity) * 0.2
      this.playerShieldMesh.rotation.y += delta * 0.45

      if (this.playerShieldRim) {
        const rimMat = this.playerShieldRim.material as THREE.MeshBasicMaterial
        rimMat.opacity += (targetOp * 0.70 - rimMat.opacity) * 0.2
        this.playerShieldRim.rotation.y += delta * 0.45
      }
      if (this.playerInnerShieldMesh) {
        const inMat = this.playerInnerShieldMesh.material as THREE.MeshBasicMaterial
        inMat.opacity += (targetOp * 0.12 - inMat.opacity) * 0.2
        this.playerInnerShieldMesh.rotation.y -= delta * 0.35
      }
      if (this.playerShieldRing) {
        const ringMat = this.playerShieldRing.material as THREE.MeshBasicMaterial
        ringMat.opacity += (targetOp * 0.60 - ringMat.opacity) * 0.2
        this.playerShieldRing.rotation.z += delta * 1.2
      }
      if (this.playerShieldRing2) {
        const ring2Mat = this.playerShieldRing2.material as THREE.MeshBasicMaterial
        ring2Mat.opacity += (targetOp * 0.50 - ring2Mat.opacity) * 0.2
        this.playerShieldRing2.rotation.z -= delta * 1.0
      }
      if (this.playerRuneMesh) {
        const rMat = this.playerRuneMesh.material as THREE.MeshBasicMaterial
        rMat.opacity += (targetOp * 0.85 - rMat.opacity) * 0.2
        this.playerRuneMesh.rotation.z += delta * 0.35
      }
      if (this.playerRuneInnerMesh) {
        const riMat = this.playerRuneInnerMesh.material as THREE.MeshBasicMaterial
        riMat.opacity += (targetOp * 0.75 - riMat.opacity) * 0.2
        this.playerRuneInnerMesh.rotation.z -= delta * 0.55
      }

      // If shield is active, spawn defensive ethereal motes rising around Harry
      if (active && Math.random() < 0.65) {
        const ang = Math.random() * Math.PI * 2
        const rad = 0.8 + Math.random() * 1.3
        this.spawnParticle(
          this.playerShieldMesh.position.x + Math.cos(ang) * rad,
          -0.75,
          this.playerShieldMesh.position.z + Math.sin(ang) * rad,
          -Math.sin(ang) * 0.25,
          1.2 + Math.random() * 1.5,
          Math.cos(ang) * 0.25,
          0.35, 0.75, 1.0,
          0.12 + Math.random() * 0.08,
          0.6,
          0.92,
          -0.5
        )
      }
    }

    if (this.enemyShieldMesh && this.opponentGroup) {
      const eX = this.opponentGroup.position.x
      const eZ = this.opponentGroup.position.z
      const centerY = -0.15
      this.enemyShieldMesh.position.set(eX, centerY, eZ)
      if (this.enemyShieldRim) this.enemyShieldRim.position.set(eX, centerY, eZ)
      if (this.enemyInnerShieldMesh) this.enemyInnerShieldMesh.position.set(eX, centerY, eZ)
      if (this.enemyShieldRing) this.enemyShieldRing.position.set(eX, centerY, eZ)
      if (this.enemyShieldRing2) this.enemyShieldRing2.position.set(eX, centerY, eZ)
      if (this.enemyRuneMesh) this.enemyRuneMesh.position.set(eX, -0.835, eZ)
      if (this.enemyRuneInnerMesh) this.enemyRuneInnerMesh.position.set(eX, -0.834, eZ)

      const active = time < this.enemyShieldActiveUntil
      const targetOp = active ? 0.40 : 0
      const mat = this.enemyShieldMesh.material as THREE.MeshBasicMaterial
      mat.opacity += (targetOp - mat.opacity) * 0.2
      this.enemyShieldMesh.rotation.y -= delta * 0.45

      if (this.enemyShieldRim) {
        const rimMat = this.enemyShieldRim.material as THREE.MeshBasicMaterial
        rimMat.opacity += (targetOp * 0.65 - rimMat.opacity) * 0.2
        this.enemyShieldRim.rotation.y -= delta * 0.45
      }
      if (this.enemyInnerShieldMesh) {
        const inMat = this.enemyInnerShieldMesh.material as THREE.MeshBasicMaterial
        inMat.opacity += (targetOp * 0.08 - inMat.opacity) * 0.2
        this.enemyInnerShieldMesh.rotation.y += delta * 0.35
      }
      if (this.enemyShieldRing) {
        const ringMat = this.enemyShieldRing.material as THREE.MeshBasicMaterial
        ringMat.opacity += (targetOp * 0.50 - ringMat.opacity) * 0.2
        this.enemyShieldRing.rotation.z -= delta * 1.2
      }
      if (this.enemyShieldRing2) {
        const ring2Mat = this.enemyShieldRing2.material as THREE.MeshBasicMaterial
        ring2Mat.opacity += (targetOp * 0.45 - ring2Mat.opacity) * 0.2
        this.enemyShieldRing2.rotation.z -= delta * 1.0
      }
      if (this.enemyRuneMesh) {
        const rMat = this.enemyRuneMesh.material as THREE.MeshBasicMaterial
        rMat.opacity += (targetOp * 0.85 - rMat.opacity) * 0.2
        this.enemyRuneMesh.rotation.z -= delta * 0.35
      }
      if (this.enemyRuneInnerMesh) {
        const riMat = this.enemyRuneInnerMesh.material as THREE.MeshBasicMaterial
        riMat.opacity += (targetOp * 0.75 - riMat.opacity) * 0.2
        this.enemyRuneInnerMesh.rotation.z += delta * 0.55
      }
    }

    // 5b. Update Flying Disarmed Wands Physics (Expelliarmus Effect)
    for (let i = this.disarmedWands.length - 1; i >= 0; i--) {
      const w = this.disarmedWands[i]
      w.life -= delta
      w.vel.y -= 14.0 * delta // realistic gravity
      w.mesh.position.addScaledVector(w.vel, delta)
      w.mesh.rotation.x += w.rotVel.x * delta
      w.mesh.rotation.y += w.rotVel.y * delta
      w.mesh.rotation.z += w.rotVel.z * delta

      const tableSurfaceY = -0.74
      if (w.mesh.position.y <= tableSurfaceY) {
        if (Math.abs(w.vel.y) > 0.8) {
          w.mesh.position.y = tableSurfaceY
          w.vel.y = -w.vel.y * 0.40 // realistic bounce with restitution
          w.vel.x *= 0.60
          w.vel.z *= 0.60
          w.rotVel.multiplyScalar(0.65)
          // Table impact sparks
          for (let s = 0; s < 4; s++) {
            this.spawnParticle(
              w.mesh.position.x + (Math.random() - 0.5) * 0.1,
              tableSurfaceY + 0.02,
              w.mesh.position.z + (Math.random() - 0.5) * 0.1,
              (Math.random() - 0.5) * 1.4,
              0.5 + Math.random() * 0.8,
              (Math.random() - 0.5) * 1.4,
              1.0, 0.82, 0.25,
              0.08, 0.25, 0.9, 0
            )
          }
        } else {
          w.mesh.position.y = tableSurfaceY
          w.vel.set(0, 0, 0)
          w.rotVel.set(0, 0, 0)
          w.mesh.rotation.x = Math.PI * 0.5 // Lying flat on the table
        }
      } else {
        // Emit golden sparkler particles from spinning wand in flight
        for (let s = 0; s < 2; s++) {
          this.spawnParticle(
            w.mesh.position.x + (Math.random() - 0.5) * 0.05,
            w.mesh.position.y + (Math.random() - 0.5) * 0.05,
            w.mesh.position.z + (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.8,
            0.6 + Math.random() * 1.2,
            (Math.random() - 0.5) * 0.8,
            1.0, 0.85, 0.25,
            0.12, 0.45, 0.92, 0
          )
        }
      }
      if (w.life <= 0) {
        this.scene.remove(w.mesh)
        this.disposeGroup(w.mesh as THREE.Group)
        this.disarmedWands.splice(i, 1)
      }
    }

    // 6. Update AI & Projectile Physics & Cinematic VFX
    this.updateOpponentAI(time, delta)
    try {
      this.updateProjectiles(delta, time)
    } catch (err) {
      console.warn('Error in updateProjectiles:', err)
    }
    this.updateVfx(delta, time)

    // 7. Clash Mode Animation & Visibility
    if (this.clashCoreSprite) {
      this.clashCoreSprite.visible = this.inClashMode
      if (this.inClashMode) {
        const coreScale = 2.0 + Math.sin(time * 24) * 0.25
        this.clashCoreSprite.scale.set(coreScale, coreScale, 1)
        this.clashCoreSprite.material.rotation += 0.04
      }
    }

    if (this.shockwaveMesh) {
      this.shockwaveMesh.visible = this.inClashMode
      if (this.inClashMode) {
        const ringScale = (time * 1.6) % 2.5 + 0.5
        this.shockwaveMesh.scale.set(ringScale, ringScale, 1)
        const ringMat = this.shockwaveMesh.material as THREE.MeshBasicMaterial
        ringMat.opacity = Math.max(0, 0.7 - (ringScale / 2.5) * 0.7)
      }
    }

    if (this.sparkPoints) {
      this.sparkPoints.visible = this.inClashMode
      if (this.inClashMode && this.sparkPositions && this.sparkVelocities) {
        const count = this.sparkPositions.length / 3
        for (let i = 0; i < count; i++) {
          const idx = i * 3
          this.sparkPositions[idx] += this.sparkVelocities[idx] * delta
          this.sparkPositions[idx + 1] += this.sparkVelocities[idx + 1] * delta - 1.2 * delta
          this.sparkPositions[idx + 2] += this.sparkVelocities[idx + 2] * delta

          if (this.sparkPositions[idx + 1] < -0.9 || Math.random() < 0.02) {
            this.sparkPositions[idx] = this.CLASH_CENTER.x
            this.sparkPositions[idx + 1] = this.CLASH_CENTER.y
            this.sparkPositions[idx + 2] = this.CLASH_CENTER.z
          }
        }
        this.sparkPoints.geometry.attributes.position.needsUpdate = true
      }
    }

    if (this.inClashMode) {
      // Natural enemy pressure in clash
      this.clashProgress = Math.max(0.05, this.clashProgress - 0.06 * delta)
      const marker = document.getElementById('clash-glow-marker')
      if (marker) {
        marker.style.left = `${this.clashProgress * 100}%`
      }
      if (this.clashProgress <= 0.08) {
        // Player loses clash
        this.inClashMode = false
        document.getElementById('clash-hud')?.classList.add('hidden')
        this.playerHp = Math.max(0, this.playerHp - 12)
        this.updateHpBars()
        this.audio.playHitSound()
        this.triggerScreenShake()
        this.showCombatNumber('-12 CLASH LOST!', window.innerWidth * 0.35, window.innerHeight * 0.55, 'player')
        if (this.playerHp <= 0) this.handleMatchEnd(false)
      }
    }

    // 8. Dynamic Lights
    if (this.wandLight) {
      this.wandLight.intensity = (time < this.playerShieldActiveUntil ? 2.0 : 0.6) + Math.sin(time * 14) * 0.1
    }
    if (this.clashLight) {
      this.clashLight.intensity = this.inClashMode ? (6.5 + Math.sin(time * 22) * 0.7) : 0
    }

    // 8b. Dynamic 2D Wand Rune Guide & Spark Trail on Canvas
    this.renderGestureRuneGuide(time)

    // Use post-processing composer for bloom effects
    if (this.composer && this.bloomPass) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }

  /**
   * Clean up all resources - call when destroying the game instance
   * Prevents memory leaks from textures, geometries, materials, and event listeners
   */

  /**
   * Recursively dispose all geometries and materials in a THREE.Group
   * to prevent memory leaks when swapping character models
   */
  private disposeGroup(group: THREE.Group | null) {
    if (!group) return
    group.traverse((obj) => {
      if ((obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose()
      }
      if ((obj as THREE.Mesh).material) {
        const mat = (obj as THREE.Mesh).material
        if (Array.isArray(mat)) {
          mat.forEach(m => m.dispose())
        } else {
          mat.dispose()
        }
      }
    })
  }

  public dispose() {
    // Stop all timers
    if (this.intermissionTimer) {
      clearInterval(this.intermissionTimer)
      this.intermissionTimer = null
    }

    // Dispose renderer and composer
    if (this.composer) {
      this.composer.dispose()
    }
    if (this.renderer) {
      this.renderer.dispose()
    }

    // Dispose VFX textures
    if (this.vfxTextures) {
      const vfxTex = this.vfxTextures as any
      const disposeTexture = (tex: THREE.Texture | undefined) => {
        if (tex) {
          tex.dispose()
        }
      }
      disposeTexture(vfxTex.spark)
      disposeTexture(vfxTex.corona)
      disposeTexture(vfxTex.shockwave)
      disposeTexture(vfxTex.shieldHex)
      disposeTexture(vfxTex.explosion)
      disposeTexture(vfxTex.beamTrail)
      disposeTexture(vfxTex.laserBeam)
      disposeTexture(vfxTex.flame)
      disposeTexture(vfxTex.fireSpiral)
      disposeTexture(vfxTex.smokePuff)
      disposeTexture(vfxTex.anamorphicFlare)
      disposeTexture(vfxTex.shieldRippleTarget)
      disposeTexture(vfxTex.runeCircle)
      disposeTexture(vfxTex.runeCircleInner)
      disposeTexture(vfxTex.scorchDecal)
      disposeTexture(vfxTex.celestialStar)
      disposeTexture(vfxTex.skullMist)
      disposeTexture(vfxTex.emeraldStarburst)
      disposeTexture(vfxTex.darkSmoke)
    }

    // Dispose VFX8 textures
    if (this.vfx8Textures) {
      const vfx8 = this.vfx8Textures as any
      Object.values(vfx8).forEach((tex: any) => {
        if (tex && tex.dispose) {
          tex.dispose()
        }
      })
    }

    // Dispose scene objects
    if (this.scene) {
      this.scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) {
          (obj as THREE.Mesh).geometry.dispose()
        }
        if ((obj as THREE.Mesh).material) {
          const mat = (obj as THREE.Mesh).material
          if (Array.isArray(mat)) {
            mat.forEach(m => m.dispose())
          } else {
            mat.dispose()
          }
        }
      })
      // Clear the scene
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0])
      }
    }

    // Remove event listeners
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('mouseup', this.handleMouseUp)
    window.removeEventListener('touchend', this.handleTouchEnd)

    // Disconnect network
    if (this.network) {
      this.network.disconnect()
    }

    // Dispose audio context
    if (this.audio) {
      this.audio.dispose()
    }

    console.log('[HogwartsDuel] All resources disposed')
  }

  // Placeholder references for event handlers (set in constructor)
  private handleKeyDown: ((e: KeyboardEvent) => void) | null = null
  private handleKeyUp: ((e: KeyboardEvent) => void) | null = null
  private handleMouseMove: ((e: MouseEvent) => void) | null = null
  private handleResize: (() => void) | null = null
  private handleMouseUp: (() => void) | null = null
  private handleTouchEnd: (() => void) | null = null

}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  ;(window as any).duelingGame = new HogwartsSinglePlayerGame()
})
