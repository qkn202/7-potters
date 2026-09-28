/**
 * 7 Potters Game Simulation Engine
 * Test all role combinations, win rates, and balance
 */

import { ROLES } from './roles';
import { Role, Player, GamePhase, Faction } from './types';

// ============================================
// GAME CONSTANTS
// ============================================

export const OPTIMAL_BALANCE: Record<number, { evil: number; good: number; neutral: number }> = {
  5: { evil: 1, good: 4, neutral: 0 },
  6: { evil: 2, good: 4, neutral: 0 },
  7: { evil: 2, good: 5, neutral: 0 },
  8: { evil: 2, good: 6, neutral: 0 },
  9: { evil: 3, good: 6, neutral: 0 },
  10: { evil: 3, good: 7, neutral: 0 },
  11: { evil: 4, good: 7, neutral: 0 },
  12: { evil: 4, good: 8, neutral: 0 },
  13: { evil: 5, good: 8, neutral: 0 },
  14: { evil: 5, good: 9, neutral: 0 },
  15: { evil: 5, good: 10, neutral: 0 },
};

// All roles pool
export const HPH_ROLES = [
  'HARRY_POTTER', 'RON_WEASLEY', 'HERMIONE_GRANGER', 'ALBUS_DUMBLEDORE',
  'SEVERUS_SNAPE', 'REMUS_LUPIN', 'ALASTOR_MOODY', 'RUBEUS_HAGRID',
  'ARTHUR_WEASLEY', 'FRED_WEASLEY', 'GEORGE_WEASLEY', 'MUNDUNGUS_FLETCHER',
  'KINGSLEY_SHACKLEBOLT', 'BILL_WEASLEY', 'FLEUR_DELACOUR', 'NYMPHADORA_TONKS',
  'POTTER_FAKE'
];

export const DEATH_EATER_ROLES = [
  'VOLDEMORT', 'BELLATRIX_LESTRANGE', 'LUCIUS_MALFOY',
  'PETER_PETTIGREW', 'FENRIR_GREYBACK'
];

// ============================================
// TYPES
// ============================================

interface GameSimState {
  players: PlayerSim[];
  phase: GamePhase;
  round: number;
  goldenFlameUsed: boolean;
  lupinPotionUsed: boolean;
  fenrirBiteUsed: boolean;
  mundungusSwapUsed: Record<string, boolean>;
  moodyBulletUsed: boolean;
  snapeTargets: Record<string, string>; // snapeId -> targetId
  dumbledoreTarget: string | null;
  arthurUltimateUsed: boolean;
  arthurTargets: string[];
  fredCandyTargets: string[];
  georgePowderUsed: boolean;
  billRevealDone: boolean;
  fleurSwordTarget: string | null;
  herimoneTargets: string[];
  petterpigrewTargets: string[];
  bellatrixDeadByVote: boolean;
  luciusDeadByVote: boolean;
  winners: Faction[];
  logs: string[];
}

interface PlayerSim {
  id: string;
  name: string;
  roleId: string;
  faction: Faction;
  status: 'ALIVE' | 'DEAD';
  hp: number;
}

// ============================================
// SIMULATION ENGINE
// ============================================

export class GameSimulation {
  private state: GameSimState;
  private playerCount: number;

  constructor(playerCount: number) {
    this.playerCount = playerCount;
    this.state = this.initializeGame();
  }

  private initializeGame(): GameSimState {
    const balance = OPTIMAL_BALANCE[this.playerCount] || { evil: 2, good: 4, neutral: 0 };
    const players: PlayerSim[] = [];

    // Assign Harry (always present)
    players.push({
      id: 'player_harry',
      name: 'Harry Potter',
      roleId: 'HARRY_POTTER',
      faction: 'ORDER_OF_PHOENIX',
      status: 'ALIVE',
      hp: 1
    });

    // Assign Ron (always present)
    players.push({
      id: 'player_ron',
      name: 'Ron Weasley',
      roleId: 'RON_WEASLEY',
      faction: 'ORDER_OF_PHOENIX',
      status: 'ALIVE',
      hp: 1
    });

    // Assign remaining HPH roles
    const remainingHPH = balance.good - 2; // -2 for Harry and Ron
    const shuffledHPH = this.shuffle([...HPH_ROLES.filter(r => r !== 'HARRY_POTTER' && r !== 'RON_WEASLEY')]);
    for (let i = 0; i < remainingHPH && i < shuffledHPH.length; i++) {
      players.push({
        id: `player_hph_${i}`,
        name: ROLES[shuffledHPH[i]]?.name || shuffledHPH[i],
        roleId: shuffledHPH[i],
        faction: 'ORDER_OF_PHOENIX',
        status: 'ALIVE',
        hp: shuffledHPH[i] === 'RUBEUS_HAGRID' ? 2 : 1
      });
    }

    // Assign Death Eaters
    const shuffledDE = this.shuffle([...DEATH_EATER_ROLES]);
    for (let i = 0; i < balance.evil && i < shuffledDE.length; i++) {
      players.push({
        id: `player_de_${i}`,
        name: ROLES[shuffledDE[i]]?.name || shuffledDE[i],
        roleId: shuffledDE[i],
        faction: 'DEATH_EATERS',
        status: 'ALIVE',
        hp: 1
      });
    }

    return {
      players,
      phase: 'NIGHT',
      round: 1,
      goldenFlameUsed: false,
      lupinPotionUsed: false,
      fenrirBiteUsed: false,
      mundungusSwapUsed: {},
      moodyBulletUsed: false,
      snapeTargets: {},
      dumbledoreTarget: null,
      arthurUltimateUsed: false,
      arthurTargets: [],
      fredCandyTargets: [],
      georgePowderUsed: false,
      billRevealDone: false,
      fleurSwordTarget: null,
      herimoneTargets: [],
      petterpigrewTargets: [],
      bellatrixDeadByVote: false,
      luciusDeadByVote: false,
      winners: [],
      logs: []
    };
  }

  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private getAlivePlayers(): PlayerSim[] {
    return this.state.players.filter(p => p.status === 'ALIVE');
  }

  private getHPHPlayers(): PlayerSim[] {
    return this.getAlivePlayers().filter(p => p.faction === 'ORDER_OF_PHOENIX');
  }

  private getDEPlayers(): PlayerSim[] {
    return this.getAlivePlayers().filter(p => p.faction === 'DEATH_EATERS');
  }

  private getPlayerByRole(roleId: string): PlayerSim | undefined {
    return this.state.players.find(p => p.roleId === roleId && p.status === 'ALIVE');
  }

  private getRandomTarget(faction?: Faction): PlayerSim | undefined {
    const targets = faction
      ? this.getAlivePlayers().filter(p => p.faction === faction)
      : this.getAlivePlayers();
    if (targets.length === 0) return undefined;
    return targets[Math.floor(Math.random() * targets.length)];
  }

  private getRandomEnemy(): PlayerSim | undefined {
    const enemies = this.getDEPlayers();
    if (enemies.length === 0) return undefined;
    return enemies[Math.floor(Math.random() * enemies.length)];
  }

  private getRandomAlly(): PlayerSim | undefined {
    const allies = this.getHPHPlayers();
    if (allies.length <= 1) return undefined;
    // Exclude self
    const others = allies.slice(1);
    return others[Math.floor(Math.random() * others.length)];
  }

  // ============================================
  // SKILL SIMULATION (AI-driven)
  // ============================================

  private simulateNightActions(): void {
    const alive = this.getAlivePlayers();

    for (const player of alive) {
      this.simulatePlayerNightAction(player);
    }
  }

  private simulatePlayerNightAction(player: PlayerSim): void {
    switch (player.roleId) {
      case 'VOLDEMORT':
        this.simulateVoldemortAction(player);
        break;
      case 'PETER_PETTIGREW':
        this.simulatePettigrewAction(player);
        break;
      case 'HERMIONE_GRANGER':
        this.simulateHermioneAction(player);
        break;
      case 'ARTHUR_WEASLEY':
        this.simulateArthurAction(player);
        break;
      case 'FRED_WEASLEY':
        this.simulateFredAction(player);
        break;
      case 'GEORGE_WEASLEY':
        this.simulateGeorgeAction(player);
        break;
      case 'BILL_WEASLEY':
        this.simulateBillAction(player);
        break;
      case 'FLEUR_DELACOUR':
        this.simulateFleurAction(player);
        break;
      case 'ALBUS_DUMBLEDORE':
        this.simulateDumbledoreAction(player);
        break;
      case 'SEVERUS_SNAPE':
        this.simulateSnapeAction(player);
        break;
      case 'FENRIR_GREYBACK':
        this.simulateFenrirAction(player);
        break;
    }
  }

  private simulateVoldemortAction(player: PlayerSim): void {
    // Voldemort chọn target ngẫu nhiên (ưu tiên HPH quan trọng)
    const hphAlive = this.getHPHPlayers();
    if (hphAlive.length === 0) return;

    // 60% chance chọn Harry nếu còn sống
    const harry = this.getPlayerByRole('HARRY_POTTER');
    if (harry && Math.random() < 0.6) {
      this.state.snapeTargets[player.id] = harry.id;
    } else {
      // Chọn ngẫu nhiên
      const target = hphAlive[Math.floor(Math.random() * hphAlive.length)];
      this.state.snapeTargets[player.id] = target.id;
    }
  }

  private simulatePettigrewAction(player: PlayerSim): void {
    // Pettigrew đánh hơi ngẫu nhiên
    const target = this.getRandomAlly();
    if (target) {
      this.state.petterpigrewTargets.push(target.id);
    }
  }

  private simulateHermioneAction(player: PlayerSim): void {
    // Hermione soi ngẫu nhiên (tránh Harry và Voldemort)
    const targets = this.getAlivePlayers().filter(p =>
      p.roleId !== 'HARRY_POTTER' &&
      p.roleId !== 'VOLDEMORT' &&
      !this.state.herimoneTargets.includes(p.id)
    );
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      this.state.herimoneTargets.push(target.id);
    }
  }

  private simulateArthurAction(player: PlayerSim): void {
    // Arthur soi phe ngẫu nhiên
    const target = this.getRandomTarget();
    if (target) {
      this.state.arthurTargets.push(target.id);
    }
    // 20% chance dùng ultimate
    if (!this.state.arthurUltimateUsed && Math.random() < 0.2) {
      this.state.arthurUltimateUsed = true;
    }
  }

  private simulateFredAction(player: PlayerSim): void {
    // Fred tặng kẹo cho DE ngẫu nhiên
    const target = this.getRandomEnemy();
    if (target) {
      this.state.fredCandyTargets.push(target.id);
    }
  }

  private simulateGeorgeAction(player: PlayerSim): void {
    // George rải bột 30% chance mỗi đêm
    if (!this.state.georgePowderUsed && Math.random() < 0.3) {
      this.state.georgePowderUsed = true;
    }
  }

  private simulateBillAction(player: PlayerSim): void {
    // Bill giải phong ấn ngẫu nhiên (hoặc reveal nếu chết)
    // Không làm gì đặc biệt trong simulation
  }

  private simulateFleurAction(player: PlayerSim): void {
    // Fleur chém kiếm 20% chance nếu có target chắc chắn
    if (Math.random() < 0.2) {
      // Tìm target DE gần đó
      const de = this.getDEPlayers();
      if (de.length > 0) {
        this.state.fleurSwordTarget = de[0].id;
      }
    }
  }

  private simulateDumbledoreAction(player: PlayerSim): void {
    // Dumbledore bảo vệ Harry
    const harry = this.getPlayerByRole('HARRY_POTTER');
    if (harry) {
      this.state.dumbledoreTarget = harry.id;
    }
  }

  private simulateSnapeAction(player: PlayerSim): void {
    // Snape bọc lót Harry
    const harry = this.getPlayerByRole('HARRY_POTTER');
    if (harry) {
      // Tìm Voldemort để bọc lót
      const voldemort = this.getPlayerByRole('VOLDEMORT');
      if (voldemort) {
        // Snape sẽ bọc lót target của Voldemort
        const vTarget = this.state.snapeTargets[voldemort.id];
        if (vTarget) {
          // Không cần làm gì, logic sẽ xử lý trong resolve
        }
      }
    }
  }

  private simulateFenrirAction(player: PlayerSim): void {
    // Fenrir cắn 1 lần duy nhất
    if (!this.state.fenrirBiteUsed) {
      const target = this.getRandomAlly();
      if (target && target.roleId !== 'HARRY_POTTER' && target.roleId !== 'RUBEUS_HAGRID') {
        this.state.fenrirBiteUsed = true;
        // Transform target to werewolf (neutral)
        target.faction = 'NEUTRAL';
      }
    }
  }

  // ============================================
  // DAY ACTIONS SIMULATION
  // ============================================

  private simulateDayActions(): void {
    const alive = this.getAlivePlayers();

    // Simulate votes
    for (const player of alive) {
      this.simulatePlayerDayAction(player);
    }
  }

  private simulatePlayerDayAction(player: PlayerSim): void {
    // Moody bắn lén 10% chance
    if (player.roleId === 'ALASTOR_MOODY' && !this.state.moodyBulletUsed) {
      if (Math.random() < 0.1) {
        const target = this.getRandomEnemy();
        if (target) {
          this.killPlayer(target.id, 'MOODY_SHOOT');
        }
        this.state.moodyBulletUsed = true;
      }
    }
  }

  // ============================================
  // VOTE SIMULATION
  // ============================================

  private simulateVotes(): void {
    const alive = this.getAlivePlayers();
    const votes: Record<string, number> = {};
    const voterChoices: Record<string, string> = {};

    // Mỗi người vote ngẫu nhiên (hoặc không vote)
    for (const voter of alive) {
      if (voter.roleId === 'POTTER_FAKE') continue; // Potter Fake không vote

      // 80% chance vote
      if (Math.random() < 0.8) {
        const target = this.getRandomTarget(); // Vote random
        if (target && target.id !== voter.id) {
          voterChoices[voter.id] = target.id;
          votes[target.id] = (votes[target.id] || 0) + 1;
        }
      }
    }

    // Tìm người có nhiều votes nhất
    let maxVotes = 0;
    let lynchedId: string | null = null;

    for (const [playerId, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        lynchedId = playerId;
      }
    }

    // Chỉ lynched nếu có votes
    if (lynchedId && maxVotes > 0) {
      this.killPlayer(lynchedId, 'VOTE_LYNCH');

      // Check Bellatrix revenge
      const lynched = this.state.players.find(p => p.id === lynchedId);
      if (lynched?.roleId === 'BELLATRIX_LESTRANGE') {
        this.state.bellatrixDeadByVote = true;
      }

      // Check Lucius lock
      if (lynched?.roleId === 'LUCIUS_MALFOY') {
        this.state.luciusDeadByVote = true;
      }
    }
  }

  // ============================================
  // RESOLUTION
  // ============================================

  private resolveNight(): void {
    const voldemortTarget = this.state.snapeTargets['player_de_0']; // Assume Voldemort là player_de_0

    if (!voldemortTarget) {
      this.state.logs.push('Voldemort không chọn mục tiêu');
      return;
    }

    // Check George Peru Powder - vô hiệu hóa kill
    if (this.state.georgePowderUsed) {
      this.state.logs.push('Bột Khói Mù Peru vô hiệu hóa kill của 4T!');
      this.state.georgePowderUsed = false; // Reset cho đêm sau
      return;
    }

    const target = this.state.players.find(p => p.id === voldemortTarget);
    if (!target) return;

    // Check Dumbledore protection
    if (this.state.dumbledoreTarget === voldemortTarget) {
      this.state.logs.push(`${target.name} được Dumbledore bảo vệ!`);
      this.state.dumbledoreTarget = null;
      return;
    }

    // Check Golden Flame (Harry only)
    if (target.roleId === 'HARRY_POTTER' && !this.state.goldenFlameUsed) {
      this.state.goldenFlameUsed = true;
      this.state.logs.push('Tia Lửa Vàng cứu Harry!');
      return;
    }

    // Check Snape Sectumsempra
    const snape = this.getPlayerByRole('SEVERUS_SNAPE');
    if (snape) {
      const snapeTarget = this.state.snapeTargets[snape.id];
      if (snapeTarget === voldemortTarget) {
        this.state.logs.push('Snape bọc lót cứu mạng!');
        // Target bị thương nhưng không chết
        return;
      }
    }

    // Check Ron sacrifice
    if (target.roleId === 'HARRY_POTTER') {
      const ron = this.getPlayerByRole('RON_WEASLEY');
      if (ron) {
        this.state.logs.push('Ron hy sinh thay Harry!');
        this.killPlayer(ron.id, 'RON_SACRIFICE');
        return;
      }
    }

    // Check Hagrid escort (Stage 3+)
    const hagrid = this.getPlayerByRole('RUBEUS_HAGRID');
    if (hagrid && target.roleId === 'HARRY_POTTER') {
      this.state.logs.push('Hagrid hy sinh!');
      this.killPlayer(hagrid.id, 'HAGRID_SACRIFICE');
      hagrid.hp--;
      if (hagrid.hp <= 0) {
        this.killPlayer(hagrid.id, 'HAGRID_SACRIFICE');
      }
    }

    // Check Fleur Sword
    if (this.state.fleurSwordTarget) {
      const fleur = this.getPlayerByRole('FLEUR_DELACOUR');
      if (fleur && this.state.fleurSwordTarget !== fleur.id) {
        const swordTarget = this.state.players.find(p => p.id === this.state.fleurSwordTarget);
        if (swordTarget) {
          if (swordTarget.faction === 'DEATH_EATERS') {
            this.state.logs.push(`Fleur chém chết ${swordTarget.name}!`);
            this.killPlayer(swordTarget.id, 'FLEUR_SWORD');
          } else {
            this.state.logs.push(`Fleur chém nhầm và tự sát!`);
            this.killPlayer(fleur.id, 'FLEUR_MISTAKE');
          }
        }
        this.state.fleurSwordTarget = null;
      }
    }

    // Kill target
    this.killPlayer(voldemortTarget, 'VOLDEMORT_KILL');
  }

  private killPlayer(playerId: string, reason: string): void {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player || player.status === 'DEAD') return;

    // Check Bill reveal
    if (player.roleId === 'BILL_WEASLEY' && !this.state.billRevealDone) {
      this.state.billRevealDone = true;
      const de = this.getRandomEnemy();
      if (de) {
        this.state.logs.push(`Bill reveal: ${de.name} là TTTT!`);
      }
    }

    // Check Kingsley 50%
    const kingsley = this.getPlayerByRole('KINGSLEY_SHACKLEBOLT');
    if (kingsley && Math.random() < 0.5) {
      this.state.logs.push('Kingsley cứu!');
      return; // Không chết
    }

    // Check Mundungus swap
    if (player.roleId === 'MUNDUNGUS_FLETCHER' && !this.state.mundungusSwapUsed[playerId]) {
      const swapTarget = this.getRandomTarget();
      if (swapTarget) {
        this.state.logs.push(`Mundungus swap với ${swapTarget.name}!`);
        this.state.mundungusSwapUsed[playerId] = true;
        this.killPlayer(swapTarget.id, 'MUNDUNGUS_SWAP');
        return;
      }
    }

    // Check Tonks morph
    if (player.roleId === 'NYMPHADORA_TONKS') {
      const inheritTarget = this.getRandomAlly();
      if (inheritTarget) {
        this.state.logs.push(`Tonks biến thành ${inheritTarget.name}!`);
        player.roleId = inheritTarget.roleId;
        player.faction = inheritTarget.faction;
        return; // Không chết
      }
    }

    // Check Lupin revive
    const lupin = this.getPlayerByRole('REMUS_LUPIN');
    if (lupin && !this.state.lupinPotionUsed && Math.random() < 0.3) {
      this.state.logs.push('Lupin hồi sinh!');
      this.state.lupinPotionUsed = true;
      return;
    }

    player.status = 'DEAD';
    this.state.logs.push(`${player.name} chết (${reason})`);
  }

  private checkWinCondition(): Faction[] | null {
    const voldemort = this.getPlayerByRole('VOLDEMORT');
    const harry = this.getPlayerByRole('HARRY_POTTER');
    const hphAlive = this.getHPHPlayers();
    const deAlive = this.getDEPlayers();

    // Voldemort chết = HPH thắng
    if (!voldemort) {
      return ['ORDER_OF_PHOENIX'];
    }

    // Harry chết = 4T thắng
    if (!harry) {
      return ['DEATH_EATERS'];
    }

    // 4T >= HPH = 4T thắng
    if (deAlive.length >= hphAlive.length) {
      return ['DEATH_EATERS'];
    }

    // Không còn 4T = HPH thắng
    if (deAlive.length === 0) {
      return ['ORDER_OF_PHOENIX'];
    }

    return null;
  }

  // ============================================
  // MAIN SIMULATION LOOP
  // ============================================

  public runSimulation(): { winners: Faction[]; logs: string[]; rounds: number } {
    let maxRounds = 20; // Prevent infinite loops

    while (maxRounds-- > 0) {
      // Night phase
      this.state.phase = 'NIGHT';
      this.simulateNightActions();
      this.resolveNight();

      // Check win
      const winners = this.checkWinCondition();
      if (winners) {
        this.state.winners = winners;
        return { winners: this.state.winners, logs: this.state.logs, rounds: 20 - maxRounds };
      }

      // Day phase
      this.state.phase = 'DAY';
      this.simulateDayActions();
      this.simulateVotes();

      // Check Bellatrix revenge
      if (this.state.bellatrixDeadByVote) {
        this.state.logs.push('Bellatrix báo thù - Voldemort giết 2 người!');
        const targets = this.getHPHPlayers().slice(0, 2);
        for (const t of targets) {
          this.killPlayer(t.id, 'BELLATRIX_REVENGE');
        }
        this.state.bellatrixDeadByVote = false;
      }

      // Check win after day
      const dayWinners = this.checkWinCondition();
      if (dayWinners) {
        this.state.winners = dayWinners;
        return { winners: this.state.winners, logs: this.state.logs, rounds: 20 - maxRounds };
      }

      // Reset for next round
      this.state.round++;
      this.state.snapeTargets = {};
      this.state.dumbledoreTarget = null;
      this.state.fleurSwordTarget = null;
    }

    // Timeout
    this.state.winners = ['NEUTRAL'];
    return { winners: this.state.winners, logs: this.state.logs, rounds: 20 };
  }

  public getState(): GameSimState {
    return this.state;
  }
}

// ============================================
// BATCH SIMULATION
// ============================================

export interface SimulationResult {
  playerCount: number;
  totalGames: number;
  hphWins: number;
  deWins: number;
  neutralWins: number;
  avgRounds: number;
  hphWinRate: number;
  deWinRate: number;
}

export function runBatchSimulation(
  playerCount: number,
  numGames: number = 1000
): SimulationResult {
  let hphWins = 0;
  let deWins = 0;
  let neutralWins = 0;
  let totalRounds = 0;

  for (let i = 0; i < numGames; i++) {
    const sim = new GameSimulation(playerCount);
    const result = sim.runSimulation();

    if (result.winners.includes('ORDER_OF_PHOENIX')) {
      hphWins++;
    } else if (result.winners.includes('DEATH_EATERS')) {
      deWins++;
    } else {
      neutralWins++;
    }
    totalRounds += result.rounds;
  }

  return {
    playerCount,
    totalGames: numGames,
    hphWins,
    deWins,
    neutralWins,
    avgRounds: totalRounds / numGames,
    hphWinRate: (hphWins / numGames) * 100,
    deWinRate: (deWins / numGames) * 100
  };
}

export function runAllSimulations(numGames: number = 1000): SimulationResult[] {
  const results: SimulationResult[] = [];

  for (let playerCount = 5; playerCount <= 15; playerCount++) {
    console.log(`Simulating ${playerCount} players...`);
    const result = runBatchSimulation(playerCount, numGames);
    results.push(result);
  }

  return results;
}
