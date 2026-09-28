# 7 Potters - Game Logic Simulation Engine

> **Document Version:** 1.0
> **Source:** `/Users/khang/7-potters/src/lib/GameContext.tsx` & `/Users/khang/7-potters/src/lib/roles.ts`
> **Purpose:** Comprehensive game logic reference for building simulation engine

---

## Table of Contents

1. [Game Phases & Flow](#1-game-phases--flow)
2. [Faction Balance](#2-faction-balance)
3. [Protection Mechanics](#3-protection-mechanics)
4. [Kill Mechanics](#4-kill-mechanics)
5. [Info & Control Effects](#5-info--control-effects)
6. [Death Effects](#6-death-effects)
7. [Special Abilities](#7-special-abilities)
8. [Weasley Items](#8-weasley-items)
9. [Win Conditions](#9-win-conditions)
10. [Resolution Order](#10-resolution-order)
11. [Edge Cases](#11-edge-cases)

---

## 1. Game Phases & Flow

### Phase Types

| Phase | Description | Key Actions |
|-------|-------------|-------------|
| `LOBBY` | Pre-game lobby | Join, assign roles, add bots |
| `NIGHT` | Night action phase | Kills, protection, info, escort |
| `DAY` | Day discussion/voting | Public debate, vote to lynch |
| `END` | Game over | Winner declared |

### Night Order of Operations (Sequence)

```
1. Death Eater kills (Voldemort leads, Bellatrix double kill)
2. Dumbledore protection check
3. Snape Sectumsempra interception
4. Hagrid escort protection
5. Regular escort protection
6. Kingsley save (50% coin flip)
7. Death effects resolution (Tonks morph, Mundungus swap)
```

### Day Flow

```
1. Players discuss and vote (Expelliarmus)
2. Resolve votes (highest votes = lynched)
3. Death effects check (Bellatrix revenge, Lucius lock)
4. Check win condition
5. Advance to next night if game continues
```

### Flight Stages (Progressive Difficulty)

| Stage | Sky Event | Modifier | Effect |
|-------|-----------|----------|--------|
| 1 | Bầu Trời Surrey Tĩnh Lặng | `PERFECT_DISGUISE` | Escort evades kill safely |
| 2 | Tầng Mây Giông & Sấm Chớp | `TURBULENCE_BLIND` | Escort evades kill safely |
| 3 | Vòng Vây Hắc Ám | `VOLDEMORT_AMBUSH` | Double kill available |
| 4 | Trạm Trung Chuyển | `SAFE_HAVEN` | Polyjuice expires |
| 5 | Trạm Khóa Cảng | `APPROACH_SHIELD` | Hagrid escort works |
| 6 | Hang Sóc | `BURROW_SHIELD` | HPH victory if Harry alive |

---

## 2. Faction Balance

### OPTIMAL_BALANCE_SPEC

Determined via Monte Carlo simulation (10,000 games).

| Players | 4T Count | HPH Count | Stages | Notes |
|---------|----------|-----------|--------|-------|
| 4 | 1 | 3 | 4 | - |
| 5 | 1 | 4 | 4 | - |
| 6 | 2 | 4 | 4 | - |
| 7 | 2 | 5 | 5 | - |
| 8 | 3 | 5 | 5 | - |
| 9 | 3 | 6 | 5 | - |
| 10 | 4 | 6 | 5 | - |
| 11 | 4 | 7 | 6 | - |
| 12 | 4 | 8 | 6 | Phục kích kép (Double ambush) |
| 13 | 5 | 8 | 6 | - |
| 14 | 5 | 9 | 6 | Extra Weasley item |
| 15 | 5 | 10 | 6 | Extra Weasley item |

---

## 3. Protection Mechanics

### Protection Priority Order (Highest to Lowest)

```
1. DUMBLEDORE_SHIELD      → Blocks all kills, cannot protect same person 2 nights
2. SNAPE_INTERCEPT        → Snipe intercepts kill (only if target was targeted)
3. GOLDEN_FLAME           → Harry auto-saves from Voldemort ONLY (one-time)
4. HAGRID_ESCORT          → Hagrid dies instead (2HP mechanic)
5. RON_WEASLEY_SACRIFICE  → Ron dies for Harry (only Harry, no escort)
6. ESCORT_EVADE           → Escort evades kill safely (Stage 1-2 only)
7. ESCORT_SACRIFICE       → Escort dies in place (Stage 3+)
```

### Detailed Protection Rules

#### Dumbledore Protection
- **Action:** "bảo vệ" (protect)
- **Target:** Any player (including self)
- **Constraint:** Cannot protect same player 2 nights in a row
- **Effect:** Blocks ALL death eater kills on protected target
- **Skill State:** `DUMBLEDORE_SHIELDED_R{round}`

#### Snape Sectumsempra
- **Action:** "sectumsempra" / "bọc lót"
- **Target:** Any player
- **Effect A (if target is attacked):** Intercepts kill, saves target
- **Effect B (if target NOT attacked):** Stray spell damages target, silences for next round
- **Collateral:** `SECTUMSEMPRA_SILENCED_R{round+1}` on stray victim
- **Constraint:** Snape is immune to identity reveals (Bế Quan Bí Thuật)

#### Golden Flame (Tia Lửa Vàng)
- **Trigger:** Harry Potter attacked by Voldemort
- **Effect:** Auto-saves Harry from Voldemort ONLY
- **Constraint:** Does NOT save others, does NOT silence Voldemort
- **One-time:** `goldenFlameUsed` flag after trigger
- **State:** `GOLDEN_FLAME_TRIGGERED`

#### Hagrid Protection (Bảo Kê)
- **Action:** "bảo kê" (escort)
- **Effect:** Hagrid takes the kill instead of target
- **Constraint:** Hagrid has 2HP (needs 2 kills to die)
- **Special:** Works even when Golden Flame is spent

#### Ron Weasley Sacrifice
- **Trigger:** Harry Potter targeted by any death eater
- **Effect:** Ron automatically dies in Harry's place
- **Constraint:** Only works if Ron is alive AND no escort protecting Harry

#### Escort Protection (Bay Hộ Tống)
- **Action:** "bay hộ tống"
- **Stage 1-2 (`PERFECT_DISGUISE`/`TURBULENCE_BLIND`):** Escort evades safely
- **Stage 3+:** Escort dies heroically to save target

---

## 4. Kill Mechanics

### Death Eater Kill Resolution

```
1. Voldemort submits kill → Primary target
2. Other 4T submit kills → Vote counting
3. Bellatrix Double Kill → If Bellatrix lynched previous day
4. Large Room Ambush → If N>=12 AND Stage 3
5. Lucius Silence → If Lucius lynched, Voldemort silenced next night
6. Peru Darkness → If George powder active, ALL kills blocked
```

### Kill Voting System

```typescript
killVoteCounts[targetId] = number of 4T votes for that target;
```

- **Voldemort Vote:** Always primary (unless "NONE")
- **Other 4T Votes:** Used for:
  - Determining second kill (if double kill active)
  - Fallback if Voldemort is dead/silenced
- **Tie Resolution:** Higher vote count wins
- **"NONE" Vote:** Abstain from killing

### Double Kill Conditions

| Condition | Source | Max Targets |
|-----------|--------|-------------|
| Bellatrix Lynched | Revenge curse | 2 |
| Stage 3 + N>=12 | Voldemort Ambush | 2 |
| Both active | Combined | 2 |

### Direct Kill Characters

#### Moody (Alastor Moody)
- **Action:** "Bắn Lén" (shoot)
- **Phase:** DAY only (during vote)
- **Constraint:** One-shot (ammo exhausted after use)
- **Effect:** Kills target immediately
- **Friendly Fire:** If target is HPH, Moody dies too
- **Skill State:** `{playerId}_MOODY`

#### Fleur (Fleur Delacour)
- **Action:** "Chém Kiếm" (sword strike)
- **Phase:** NIGHT
- **Effect:** Instant kill, no protection possible
- **Friendly Fire:** If target is HPH, Fleur dies
- **Skill State:** `{playerId}_FLEUR_R{round}`

#### Fenrir Bite (Fenrir Greyback)
- **Action:** "Cắn" (bite)
- **Phase:** NIGHT
- **Constraint:** One-time use per game
- **Effect:** Converts target to Werewolf (NEUTRAL faction)
- **Skill State:** `{playerId}_FENRIR`

---

## 5. Info & Control Effects

### Information Roles

#### Hermione Granger
- **Action:** "Soi Danh Tính" (identity reveal)
- **Phase:** NIGHT
- **Target:** Any player (except Harry/Voldemort)
- **Returns:** Role name (Snape shows as special)
- **Constraint:** Cannot reveal Harry or Voldemort
- **Skill State:** `{playerId}_HERMIONE_R{round}`

#### Arthur Weasley
- **Action:** "Soi Phe" (faction reveal)
- **Phase:** NIGHT
- **Target:** Any player
- **Returns:** Faction (HPH/4T/NEUTRAL)
- **Skill State:** `{playerId}_ARTHUR_R{round}`

#### Pettigrew (Peter Pettigrew)
- **Action:** "Đánh Hơi" (sniff)
- **Phase:** NIGHT
- **Target:** HPH members only
- **Returns:**
  - Harry Potter → "ĐÍCH DANH HARRY POTTER"
  - Ron Weasley → "ĐÍCH DANH RON WEASLEY"
  - Special role → "Nhân Vật Đặc Biệt"
  - Normal HPH → "Không phải Đặc Biệt"
- **Constraint:** Cannot kill Harry (Life Debt prevents action)
- **Skill State:** `{playerId}_PETTIGREW_R{round}`

### Control Effects

#### Fred Weasley (Fainting Fancies)
- **Action:** "Tặng Kẹo" (give candy)
- **Phase:** NIGHT
- **Effect:** Target loses vote ability next round
- **Skill State:** `{playerId}_FRED_R{round}`
- **Victim State:** `{targetId}_FRED_CANDY_R{round+1}`

#### George Weasley (Peru Darkness Powder)
- **Action:** "Rải Bột" (spread powder)
- **Phase:** NIGHT
- **Effect:** ALL death eater kills blocked this night
- **Skill State:** `{playerId}_GEORGE_R{round}`
- **Global State:** `GLOBAL_SULK_R{round}` OR `PERUVIAN_DARKNESS_ACTIVE`

#### Snape Sectumsempra (Collateral)
- **Trigger:** Snape bọc lót someone who ISN'T attacked
- **Effect:** Stray spell silences that person next round
- **Victim State:** `{targetId}_SECTUMSEMPRA_SILENCED_R{round+1}`

---

## 6. Death Effects

### Death Effect Priority

When a player dies (by vote or kill), effects are checked in this order:

```
1. PETER_PETTIGREW      → Rat escape (first time only)
2. BELLATRIX_LESTRANGE  → Double kill curse (vote only)
3. LUCIUS_MALFOY        → Voldemort silence (vote only)
4. NYMPHADORA_TONKS     → Morph inheritance
5. MUNDUNGUS_FLETCHER   → Swap death
6. BILL_WEASLEY         → Reveal random 4T (on order death)
```

### Detailed Death Effects

#### Pettigrew Rat Escape
- **Trigger:** First time lynched by vote
- **Effect:** Escapes death, silenced for next voting round
- **States:**
  - `{playerId}_RAT_ESCAPED` (permanent flag)
  - `{playerId}_VOTE_SILENCED_R{round+1}`

#### Bellatrix Revenge (Cơn Thịnh Nộ)
- **Trigger:** Bellatrix lynched by vote
- **Effect:** Voldemort can kill 2 people next night
- **State:** `voldemort_double_kill_R{round+1}`

#### Lucius Silence (Lời Nguyền)
- **Trigger:** Lucius lynched by vote
- **Effect:** Voldemort silenced next night (cannot kill)
- **State:** `voldemort_silenced_R{round+1}`

#### Tonks Morph (Biến Hình)
- **Trigger:** Tonks dies (any cause)
- **Effect:** Choose another player's role to inherit
- **Interrupt Type:** `TONKS_MORPH`
- **Player Selection:** Any other player with a role

#### Mundungus Swap (Tráo Đổi)
- **Trigger:** Mundungus killed by night action
- **Effect:** Choose someone else to die instead
- **Constraint:** One-time use only
- **Interrupt Type:** `MUNDUNGUS_SWAP`
- **States:**
  - `{playerId}_SWAP_USED` (permanent flag)

#### Bill Weasley Reveal
- **Trigger:** Bill dies (any cause)
- **Effect:** All HPH learn one random 4T identity
- **Implementation:** Log notification to HPH players

---

## 7. Special Abilities

### Lupin Revive (Remus Lupin)
- **Action:** "Hồi Sinh" (revive)
- **Phase:** NIGHT
- **Constraint:** One-time use, target must be dead
- **Effect:** Resurrects target to alive
- **Skill State:** `{playerId}_LUPIN` (permanent after use)

### Hagrid Double HP (Rubeus Hagrid)
- **Effect:** Requires 2 kill attempts to die
- **First Hit:** "Đánh hụt/chỉ làm bị thương"
- **Second Hit:** Dies
- **Implementation:** Track `hagrid_hits_{playerId}` counter

### Fenrir Werewolf Conversion (Fenrir Greyback)
- **Action:** "Cắn" (bite)
- **Phase:** NIGHT
- **Constraint:** One-time use per game
- **Effect:**
  - Target faction changes to NEUTRAL
  - Target role changes to Werewolf
  - Target loses all original abilities
- **Cannot Bite:** Death Eaters

### Voldemort Team Knowledge
- **Effect:** Voldemort knows all other 4T identities
- **Implementation:** Filter `role.faction === 'DEATH_EATERS'` for Voldemort

### Pettigrew Life Debt
- **Effect:** Cannot directly vote to kill Harry Potter
- **Implementation:** Block kill action if Pettigrew targets Harry

---

## 8. Weasley Items

### Available Items

| Item | Count | Phase | Effect |
|------|-------|-------|--------|
| Bột Khói Mù Peru | 1 (2 if N>=14) | ANY | Blocks all 4T kills tonight |
| Kẹo Ngất Xỉu | 1 | ANY | Target loses vote next round |

### Item Constraints

- **Users:** HPH and NEUTRAL only (4T blocked by anti-theft charm)
- **Restoration:** Items reset each new game

### Darkness Powder Effect

```typescript
if (skillStates['PERUVIAN_DARKNESS_ACTIVE']) {
  // All deathEaterTargetIds are cleared
  deathEaterTargetIds.length = 0;
}
```

---

## 9. Win Conditions

### Check Order (Priority)

```typescript
checkWinCondition(players, flightStage, maxStages) {
  // 1. All players dead
  if (alivePlayers.length === 0) return 'NEUTRAL';
  
  // 2. Voldemort killed (lore win)
  if (hadVoldemort && !aliveVoldemort) return 'ORDER_OF_PHOENIX';
  
  // 3. Lore progression (reach destination)
  if (flightStage >= maxStages) {
    if (aliveHarry) return 'ORDER_OF_PHOENIX';
    else return 'DEATH_EATERS';
  }
  
  // 4. Numeric dominance
  if (deathEaters >= others) return 'DEATH_EATERS';
  
  // 5. All 4T dead
  if (deathEaters === 0 && hph > 0) return 'ORDER_OF_PHOENIX';
  
  // 6. All dead
  if (neutrals > 0) return 'NEUTRAL';
  
  return null; // Game continues
}
```

### Win Condition Summary

| Condition | Winner | Notes |
|-----------|--------|-------|
| Harry alive + Stage >= maxStages | HPH | Lore victory |
| Harry dead + Stage >= maxStages | 4T | Death Eater lore victory |
| Voldemort dead + Harry alive | HPH | Lore victory |
| 4T >= HPH + others | 4T | Numeric victory |
| 4T = 0 + HPH > 0 | HPH | Elimination victory |
| All dead | NEUTRAL | Draw |

---

## 10. Resolution Order

### Night Resolution Sequence

```
1. COLLECT PENDING ACTIONS
   ├── Filter dead/GM players
   ├── Check silenced states
   └── Categorize by action type

2. IDENTIFY PROTECTION TARGETS
   ├── Dumbledore: shieldTargetId
   ├── Snape: snapeShieldTargetId
   └── Kingsley: isKingsleyActive

3. DETERMINE KILL TARGETS
   ├── Voldemort vote (primary)
   ├── Other 4T votes (counting)
   ├── Check double kill conditions
   ├── Check Lucius silence
   └── Check Peru darkness

4. RESOLVE EACH KILL TARGET
   For each target (in order):
   
   a) Check Dumbledore Shield
      → Block kill, continue
   
   b) Check Snape Intercept
      → If target = snapeShieldTargetId: block kill, continue
   
   c) Check Golden Flame (Harry only)
      → If Harry + not used: block kill, set used flag
   
   d) Check Hagrid Escort
      → If Hagrid escorting: Hagrid dies, block target
   
   e) Check Regular Escort (Stage-dependent)
      → Stage 1-2: Evade safely
      → Stage 3+: Escort dies
   
   f) Check Ron Sacrifice (Harry only)
      → If Ron alive + no escort: Ron dies
   
   g) Default: Target dies
      → Check death effects (Tonks, Mundungus)
      → Apply interrupt if needed

5. RESOLVE STRAY EFFECTS
   └── Snape collateral silence

6. KINGSLEY COIN FLIP
   ├── Check if HPH died this night
   ├── 50% random chance
   └── If success: revive one HPH

7. PROCESS INTERRUPTS
   ├── TONKS_MORPH: Player chooses role inheritance
   └── MUNDUNGUS_SWAP: Player chooses death swap

8. CHECK WIN CONDITION
   └── If winner: transition to END phase
```

### Day Resolution Sequence

```
1. COLLECT VOTES
   ├── Filter dead/GM/fainted players
   ├── Count votes per target

2. DETERMINE LYNCH TARGET
   ├── Highest vote count wins
   ├── Tie = no lynch

3. PROCESS DEATH EFFECTS
   ├── Pettigrew rat escape
   ├── Bellatrix revenge (vote only)
   ├── Lucius silence (vote only)
   ├── Tonks morph
   └── Bill reveal

4. CHECK WIN CONDITION
   └── If winner: transition to END phase

5. ADVANCE TO NIGHT
   ├── Increment round
   ├── Advance flight stage
   └── Update sky event
```

---

## 11. Edge Cases

### Silenced States

| State Key | Source | Effect |
|-----------|--------|--------|
| `{id}_SECTUMSEMPRA_SILENCED_R{r}` | Snape stray | Cannot act next round |
| `{id}_FRED_CANDY_R{r}` | Fred candy | Cannot vote next round |
| `{id}_VOTE_SILENCED_R{r}` | Pettigrew escape | Cannot vote next round |
| `voldemort_silenced_R{r}` | Lucius death | Voldemort cannot kill |

### Simultaneous Death Resolution

When multiple players would die from different effects:

1. Process all deaths simultaneously
2. Check win condition with full death list
3. If win condition met, game ends immediately
4. Otherwise, continue with all deaths applied

### Interrupt Timeout

- **Duration:** 60 seconds
- **Auto-resolve:** Random valid target chosen
- **Valid targets:** Alive, non-GM, not self

### Bot Behavior (Simulation Reference)

```typescript
// Death Eater bots: Kill random HPH (or any if no HPH)
// Dumbledore bots: Protect random (avoid repeat)
// Kingsley bots: 50% activate save, 50% escort
// Hagrid bots: 70% escort Harry, 30% escort random
// Other bots: Random escort
```

### Large Room Modifiers (N >= 12)

| Modifier | Condition | Effect |
|----------|-----------|--------|
| Double Kill | Stage 3 + N >= 12 | Voldemort kills 2 |
| Extra Item | N >= 14 | +1 Peru Darkness Powder |

### Chain Death Effects

- Domino effect (Fred/George chain) has been **disabled**
- Each death effect is now independent
- Bill + Fleur couple protection has been **removed**
- Bill now has: unseal ability + reveal 4T on death
- Fleur now has: sword execution (instant kill)

---

## Key Skill States Reference

```typescript
// Protection
'DUMBLEDORE_SHIELDED_R{round}'
'GOLDEN_FLAME_TRIGGERED'
`{hagridId}_HAGRID_ESCORT_R{round}`

// Silencing
`{id}_SECTUMSEMPRA_SILENCED_R{round}`
`{id}_FRED_CANDY_R{round}`
`{id}_VOTE_SILENCED_R{round}`

// Death Eater Curses
'voldemort_double_kill_R{round}'
'voldemort_silenced_R{round}'

// Items
'PERUVIAN_DARKNESS_ACTIVE'
'GLOBAL_SULK_R{round}'

// One-time Abilities Used
`{id}_LUPIN`
`{id}_MOODY`
`{id}_FENRIR`
`{id}_SWAP_USED`
`{id}_RAT_ESCAPED`
```

---

## Simulation Engine Implementation Notes

### State Management

```typescript
interface GameState {
  players: Player[];
  phase: 'LOBBY' | 'NIGHT' | 'DAY' | 'END';
  round: number;
  flightStage: number;
  maxStages: number;
  currentSkyEvent: SkyEvent;
  escortPairs: Record<string, string>;
  goldenFlameUsed: boolean;
  weasleyItems: WeasleyItem[];
  pendingActions: Record<string, Action>;
  resolutionReport: ResolutionReport | null;
  skillStates: Record<string, boolean | string>;
  interruptState: InterruptState | null;
  winner: Faction | null;
}
```

### Random Number Requirements

| Mechanic | Probability | RNG Call |
|----------|-------------|----------|
| Kingsley Save | 50% | `Math.random() < 0.5` |
| Fisher-Yates Shuffle | Uniform | Knuth shuffle |

### Action Normalization

```typescript
const normalizeAction = (actionName: string): string => 
  actionName.toLowerCase().trim();

const isKillAction = (action: string): boolean => 
  normalizeAction(action) === 'giết';

const isVoteAction = (action: string): boolean => 
  ['biểu quyết tước đũa', 'bỏ phiếu treo cổ'].includes(normalizeAction(action));

const isEscortAction = (action: string): boolean => 
  normalizeAction(action) === 'bay hộ tống';

const isProtectAction = (action: string): boolean => 
  normalizeAction(action) === 'bảo vệ';
```
