// src/multiplayer_deck.ts — Hogwarts Duel Multiplayer 4-Spell Deck Loadout System
export interface SpellMeta {
  key: string
  name: string
  subName: string
  manaCost: number
  cooldown: number
  color: string
  hotkeySingle: string
  svg: string
  desc: string
}

export const CANONICAL_SPELL_METAS: Record<string, SpellMeta> = {
  expelliarmus: {
    key: 'expelliarmus',
    name: 'Expelliarmus',
    subName: 'Tước Khí Giới',
    manaCost: 15,
    cooldown: 3.0,
    color: '#f5cf73',
    hotkeySingle: '1',
    desc: 'Tước đũa phép đối thủ (1.8s)',
    svg: `<svg class="dock-rune-svg" viewBox="0 0 32 32" fill="none"><path d="M12 5 L22 13 L10 17 L21 27" stroke="#f5cf73" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="5" r="1.6" fill="#ffffff"/><circle cx="21" cy="27" r="1.6" fill="#f5cf73"/></svg>`
  },
  protego: {
    key: 'protego',
    name: 'Protego',
    subName: 'Khiên Chắn',
    manaCost: 12,
    cooldown: 4.0,
    color: '#70a1ff',
    hotkeySingle: '2',
    desc: 'Dựng khiên ma thuật đỡ phép (1.8s)',
    svg: `<svg class="dock-rune-svg" viewBox="0 0 32 32" fill="none"><path d="M5 24 C8 11, 24 11, 27 24" stroke="#70a1ff" stroke-width="2.8" stroke-linecap="round"/><circle cx="16" cy="13.5" r="1.8" fill="#ffffff"/></svg>`
  },
  stupefy: {
    key: 'stupefy',
    name: 'Stupefy',
    subName: 'Choáng Váng',
    manaCost: 14,
    cooldown: 6.0,
    color: '#ff4757',
    hotkeySingle: '3',
    desc: 'Làm choáng tê liệt đối thủ (1.8s)',
    svg: `<svg class="dock-rune-svg" viewBox="0 0 32 32" fill="none"><path d="M5 16 C9 9, 13 23, 16 16 C19 9, 23 23, 27 16" stroke="#ff4757" stroke-width="2.6" stroke-linecap="round"/><circle cx="5" cy="16" r="1.5" fill="#ffffff"/><circle cx="27" cy="16" r="1.5" fill="#ff4757"/></svg>`
  },
  obliviate: {
    key: 'obliviate',
    name: 'Obliviate',
    subName: 'Xoá Trí Nhớ',
    manaCost: 18,
    cooldown: 6.5,
    color: '#00d2d3',
    hotkeySingle: '4',
    desc: 'Nhiễu loạn tâm trí & khóa phép (2.0s)',
    svg: `<svg class="dock-rune-svg" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="10" stroke="#00d2d3" stroke-width="2.6"/><circle cx="16" cy="6" r="1.6" fill="#ffffff"/></svg>`
  },
  petrificus: {
    key: 'petrificus',
    name: 'Petrificus Totalus',
    subName: 'Tê Liệt',
    manaCost: 20,
    cooldown: 8.0,
    color: '#f1c40f',
    hotkeySingle: '5',
    desc: 'Hóa đá trói cứng thân thể (2.2s)',
    svg: `<svg class="dock-rune-svg" viewBox="0 0 32 32" fill="none"><path d="M16 6 L16 26 M10 20 L16 26 L22 20" stroke="#f1c40f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="6" r="1.6" fill="#ffffff"/></svg>`
  },
  sectumsempra: {
    key: 'sectumsempra',
    name: 'Sectumsempra',
    subName: 'Đao Hắc Ám',
    manaCost: 22,
    cooldown: 9.0,
    color: '#e056fd',
    hotkeySingle: '6',
    desc: 'Chém sâu gây xuất huyết & choáng nhẹ',
    svg: `<svg class="dock-rune-svg" viewBox="0 0 32 32" fill="none"><path d="M6 16 L26 16 M20 10 L26 16 L20 22" stroke="#e056fd" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="16" r="1.6" fill="#ffffff"/></svg>`
  },
  confringo: {
    key: 'confringo',
    name: 'Confringo',
    subName: 'Bùa Nổ Lửa',
    manaCost: 26,
    cooldown: 10.0,
    color: '#ff9f43',
    hotkeySingle: '7',
    desc: 'Kích nổ diện rộng hất văng cực mạnh',
    svg: `<svg class="dock-rune-svg" viewBox="0 0 32 32" fill="none"><polygon points="16,6 26,24 6,24" stroke="#ff9f43" stroke-width="2.6" fill="none" stroke-linejoin="round"/><circle cx="16" cy="6" r="1.6" fill="#ffffff"/></svg>`
  },
  expecto_patronum: {
    key: 'expecto_patronum',
    name: 'Expecto Patronum',
    subName: 'Thần Hộ Mệnh',
    manaCost: 40,
    cooldown: 14.0,
    color: '#54a0ff',
    hotkeySingle: '8',
    desc: 'Hươu bạc xua tan tà khí + Hồi 8 HP',
    svg: `<svg class="dock-rune-svg" viewBox="0 0 32 32" fill="none"><circle cx="13" cy="19" r="7" stroke="#54a0ff" stroke-width="2.4"/><path d="M18 14 L26 6 M20 6 L26 6 L26 12" stroke="#54a0ff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="26" cy="6" r="1.6" fill="#ffffff"/></svg>`
  },
  avadakedavra: {
    key: 'avadakedavra',
    name: 'Avada Kedavra',
    subName: 'Lời Nguyền Tử Thần',
    manaCost: 55,
    cooldown: 20.0,
    color: '#2ed573',
    hotkeySingle: '9',
    desc: 'Tử quang kết liễu tối thượng',
    svg: `<svg class="dock-rune-svg" viewBox="0 0 32 32" fill="none"><path d="M11 6 L21 12 L11 18 L21 26" stroke="#2ed573" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11" cy="6" r="1.8" fill="#ffffff"/><circle cx="21" cy="26" r="1.8" fill="#2ed573"/></svg>`
  }
}

export const ALL_CANONICAL_SPELL_KEYS = [
  'expelliarmus',
  'protego',
  'stupefy',
  'obliviate',
  'petrificus',
  'sectumsempra',
  'confringo',
  'expecto_patronum',
  'avadakedavra'
]

export const DEFAULT_MULTIPLAYER_DECK = [
  'expelliarmus',
  'protego',
  'stupefy',
  'confringo'
]

const STORAGE_KEY = 'hogwarts_duel_multiplayer_deck_v1'

export class MultiplayerDeckManager {
  private equippedSpells: string[] = []
  private onDeckChangeCallbacks: ((deck: string[]) => void)[] = []

  constructor() {
    this.loadSavedDeck()
  }

  public getDeck(): string[] {
    return [...this.equippedSpells]
  }

  public onDeckChange(cb: (deck: string[]) => void) {
    this.onDeckChangeCallbacks.push(cb)
  }

  private notifyChange() {
    for (const cb of this.onDeckChangeCallbacks) {
      cb(this.getDeck())
    }
  }

  private loadSavedDeck() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length === 4) {
          const valid = parsed.every((k: string) => ALL_CANONICAL_SPELL_KEYS.includes(k))
          if (valid) {
            this.equippedSpells = parsed
            return
          }
        }
      }
    } catch (_) {}
    this.equippedSpells = [...DEFAULT_MULTIPLAYER_DECK]
  }

  private saveDeck() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.equippedSpells))
    } catch (_) {}
    this.notifyChange()
  }

  public equipSpell(spellKey: string): boolean {
    if (!ALL_CANONICAL_SPELL_KEYS.includes(spellKey)) return false
    if (this.equippedSpells.includes(spellKey)) return false
    if (this.equippedSpells.length >= 4) return false

    this.equippedSpells.push(spellKey)
    this.saveDeck()
    this.renderLobbyUI()
    return true
  }

  public unequipSpell(spellKey: string): boolean {
    const idx = this.equippedSpells.indexOf(spellKey)
    if (idx === -1) return false

    this.equippedSpells.splice(idx, 1)
    this.saveDeck()
    this.renderLobbyUI()
    return true
  }

  public toggleSpell(spellKey: string): 'equipped' | 'unequipped' | 'full' {
    if (this.equippedSpells.includes(spellKey)) {
      this.unequipSpell(spellKey)
      return 'unequipped'
    } else {
      if (this.equippedSpells.length >= 4) {
        return 'full'
      }
      this.equipSpell(spellKey)
      return 'equipped'
    }
  }

  public isDeckComplete(): boolean {
    return this.equippedSpells.length === 4
  }

  // --- Render Lobby Deck Builder UI ---
  public renderLobbyUI() {
    const stripEl = document.getElementById('equipped-slots-strip')
    const poolEl = document.getElementById('deck-pool-grid')
    const counterEl = document.getElementById('deck-counter-badge')

    // 1. Counter badge
    if (counterEl) {
      const count = this.equippedSpells.length
      counterEl.textContent = `${count} / 4 BÙA ĐÃ CHỌN`
      if (count === 4) {
        counterEl.className = 'deck-counter-badge counter-full'
      } else {
        counterEl.className = 'deck-counter-badge counter-partial'
      }
    }

    // 2. Equipped 4 slots strip
    if (stripEl) {
      stripEl.innerHTML = ''
      for (let i = 0; i < 4; i++) {
        const spellKey = this.equippedSpells[i]
        const slotEl = document.createElement('div')
        slotEl.className = `deck-slot-card ${spellKey ? 'slot-occupied' : 'slot-empty'}`

        if (spellKey) {
          const meta = CANONICAL_SPELL_METAS[spellKey]
          slotEl.innerHTML = `
            <div class="slot-badge-hotkey">[${i + 1}]</div>
            <button class="slot-remove-btn" title="Bỏ chọn bùa này" data-spell="${spellKey}">✕</button>
            <div class="slot-rune-frame" style="--rune-glow: ${meta.color};">
              ${meta.svg}
            </div>
            <div class="slot-info-wrap">
              <span class="slot-spell-name" style="color: ${meta.color};">${meta.name}</span>
              <span class="slot-spell-sub">${meta.subName}</span>
            </div>
            <div class="slot-tags-row">
              <span class="slot-tag-mana">${meta.manaCost}💎</span>
              <span class="slot-tag-cd">⏳${meta.cooldown.toFixed(1)}s</span>
            </div>
          `
          const removeBtn = slotEl.querySelector('.slot-remove-btn')
          removeBtn?.addEventListener('click', (e) => {
            e.stopPropagation()
            this.unequipSpell(spellKey)
          })
          slotEl.addEventListener('click', () => {
            this.unequipSpell(spellKey)
          })
        } else {
          slotEl.innerHTML = `
            <div class="slot-badge-hotkey">[${i + 1}]</div>
            <div class="empty-slot-icon">➕</div>
            <span class="empty-slot-text">Ô Trống</span>
            <span class="empty-slot-sub">Chọn bùa dưới</span>
          `
        }
        stripEl.appendChild(slotEl)
      }
    }

    // 3. Selection pool of 9 spells
    if (poolEl) {
      poolEl.innerHTML = ''
      for (const key of ALL_CANONICAL_SPELL_KEYS) {
        const meta = CANONICAL_SPELL_METAS[key]
        const isEquipped = this.equippedSpells.includes(key)
        const equippedIdx = this.equippedSpells.indexOf(key)

        const card = document.createElement('div')
        card.className = `pool-spell-card ${isEquipped ? 'is-equipped' : 'is-available'}`
        card.dataset.spell = key
        card.innerHTML = `
          <div class="pool-card-glow" style="--pool-glow: ${meta.color};"></div>
          <div class="pool-rune-frame" style="--rune-glow: ${meta.color};">
            ${meta.svg}
          </div>
          <div class="pool-card-content">
            <div class="pool-card-title-row">
              <span class="pool-spell-name">${meta.name}</span>
              ${isEquipped ? `<span class="pool-equipped-pill">[${equippedIdx + 1}] ✓</span>` : ''}
            </div>
            <span class="pool-spell-sub">${meta.subName}</span>
            <div class="pool-card-meta-row">
              <span class="pool-tag-mana">${meta.manaCost}💎</span>
              <span class="pool-tag-cd">⏳${meta.cooldown.toFixed(1)}s</span>
            </div>
          </div>
        `

        card.addEventListener('click', () => {
          const result = this.toggleSpell(key)
          if (result === 'full') {
            const builderSection = document.getElementById('multiplayer-deck-section')
            if (builderSection) {
              builderSection.classList.remove('deck-shake-error')
              void builderSection.offsetWidth
              builderSection.classList.add('deck-shake-error')
            }
            if (counterEl) {
              counterEl.textContent = 'ĐÃ CHỌN ĐỦ 4 BÙA! BỎ 1 BÙA ĐỂ ĐỔI'
              setTimeout(() => {
                if (counterEl) counterEl.textContent = `${this.equippedSpells.length} / 4 BÙA ĐÃ CHỌN`
              }, 1600)
            }
          }
        })

        poolEl.appendChild(card)
      }
    }
  }

  // --- Render In-Game Spell Cooldown Dock ---
  public renderDockForMultiplayer(onSlotClick: (spellKey: string) => void) {
    const dock = document.getElementById('spell-cooldown-dock')
    if (!dock) return

    dock.innerHTML = ''
    dock.setAttribute('title', 'Bấm phím [1-4] hoặc click ô để thi triển · Chế độ Đấu Online (4 Bùa Đã Chọn)')

    this.equippedSpells.forEach((key, idx) => {
      const meta = CANONICAL_SPELL_METAS[key]
      if (!meta) return

      const btn = document.createElement('button')
      btn.className = 'dock-slot'
      btn.dataset.spell = key
      btn.title = `[${idx + 1}] ${meta.name} · ${meta.subName} (Hồi: ${meta.cooldown.toFixed(1)}s · ${meta.manaCost} MP)`
      btn.innerHTML = `
        <div class="dock-slot-glow" style="--dock-glow: ${meta.color};"></div>
        <div class="dock-rune-box">
          ${meta.svg}
        </div>
        <span class="dock-hotkey">${idx + 1}</span>
        <span class="dock-mana-cost">${meta.manaCost}</span>
        <div class="dock-cd-sweep"></div>
        <span class="dock-cd-timer"></span>
      `

      btn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        onSlotClick(key)
      })

      dock.appendChild(btn)
    })
  }

  public renderDockForSinglePlayer(onSlotClick: (spellKey: string) => void) {
    const dock = document.getElementById('spell-cooldown-dock')
    if (!dock) return

    dock.innerHTML = ''
    dock.setAttribute('title', 'Bấm phím [1-9] hoặc click ô để thi triển · Bùa càng mạnh hồi chiêu càng lâu')

    ALL_CANONICAL_SPELL_KEYS.forEach((key, idx) => {
      const meta = CANONICAL_SPELL_METAS[key]
      if (!meta) return

      const btn = document.createElement('button')
      btn.className = 'dock-slot'
      btn.dataset.spell = key
      btn.title = `[${idx + 1}] ${meta.name} · ${meta.subName} (Hồi: ${meta.cooldown.toFixed(1)}s · ${meta.manaCost} MP)`
      btn.innerHTML = `
        <div class="dock-slot-glow" style="--dock-glow: ${meta.color};"></div>
        <div class="dock-rune-box">
          ${meta.svg}
        </div>
        <span class="dock-hotkey">${idx + 1}</span>
        <span class="dock-mana-cost">${meta.manaCost}</span>
        <div class="dock-cd-sweep"></div>
        <span class="dock-cd-timer"></span>
      `

      btn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        onSlotClick(key)
      })

      dock.appendChild(btn)
    })
  }
}
