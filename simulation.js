/**
 * 7 Potters Game Simulation Engine
 * Test all role combinations, win rates, and balance
 */

// ============================================
// GAME CONSTANTS
// ============================================

const OPTIMAL_BALANCE = {
  5: { evil: 2, good: 3, neutral: 0 },
  6: { evil: 2, good: 4, neutral: 0 },
  7: { evil: 3, good: 4, neutral: 0 },
  8: { evil: 3, good: 5, neutral: 0 },
  9: { evil: 3, good: 6, neutral: 0 },
  10: { evil: 4, good: 6, neutral: 0 },
  11: { evil: 4, good: 7, neutral: 0 },
  12: { evil: 4, good: 8, neutral: 0 },
  13: { evil: 4, good: 9, neutral: 0 },
  14: { evil: 5, good: 9, neutral: 0 },
  15: { evil: 5, good: 10, neutral: 0 },
};

const HPH_ROLES = [
  'HARRY_POTTER', 'RON_WEASLEY', 'HERMIONE_GRANGER', 'ALBUS_DUMBLEDORE',
  'SEVERUS_SNAPE', 'REMUS_LUPIN', 'ALASTOR_MOODY', 'RUBEUS_HAGRID',
  'ARTHUR_WEASLEY', 'FRED_WEASLEY', 'GEORGE_WEASLEY', 'MUNDUNGUS_FLETCHER',
  'KINGSLEY_SHACKLEBOLT', 'BILL_WEASLEY', 'FLEUR_DELACOUR', 'NYMPHADORA_TONKS',
  'POTTER_FAKE'
];

const DEATH_EATER_ROLES = [
  'VOLDEMORT', 'BELLATRIX_LESTRANGE', 'LUCIUS_MALFOY',
  'PETER_PETTIGREW', 'FENRIR_GREYBACK'
];

// Role names for display
const ROLE_NAMES = {
  HARRY_POTTER: 'Harry Potter',
  RON_WEASLEY: 'Ron Weasley',
  HERMIONE_GRANGER: 'Hermione Granger',
  ALBUS_DUMBLEDORE: 'Dumbledore',
  SEVERUS_SNAPE: 'Snape',
  REMUS_LUPIN: 'Lupin',
  ALASTOR_MOODY: 'Moody',
  RUBEUS_HAGRID: 'Hagrid',
  ARTHUR_WEASLEY: 'Arthur',
  FRED_WEASLEY: 'Fred',
  GEORGE_WEASLEY: 'George',
  MUNDUNGUS_FLETCHER: 'Mundungus',
  KINGSLEY_SHACKLEBOLT: 'Kingsley',
  BILL_WEASLEY: 'Bill',
  FLEUR_DELACOUR: 'Fleur',
  NYMPHADORA_TONKS: 'Tonks',
  POTTER_FAKE: 'Potter Fake',
  VOLDEMORT: 'Voldemort',
  BELLATRIX_LESTRANGE: 'Bellatrix',
  LUCIUS_MALFOY: 'Lucius',
  PETER_PETTIGREW: 'Pettigrew',
  FENRIR_GREYBACK: 'Fenrir',
};

// ============================================
// SIMULATION ENGINE
// ============================================

class GameSimulation {
  constructor(playerCount) {
    this.playerCount = playerCount;
    this.state = this.initializeGame();
  }

  initializeGame() {
    const balance = OPTIMAL_BALANCE[this.playerCount] || { evil: 2, good: 4, neutral: 0 };
    const players = [];

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
    const remainingHPH = balance.good - 2;
    const shuffledHPH = this.shuffle(HPH_ROLES.filter(r => r !== 'HARRY_POTTER' && r !== 'RON_WEASLEY'));
    for (let i = 0; i < remainingHPH && i < shuffledHPH.length; i++) {
      players.push({
        id: `player_hph_${i}`,
        name: ROLE_NAMES[shuffledHPH[i]] || shuffledHPH[i],
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
        name: ROLE_NAMES[shuffledDE[i]] || shuffledDE[i],
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
      logs: [],
      roleDistribution: this.getRoleDistribution(players)
    };
  }

  getRoleDistribution(players) {
    const roles = {};
    players.forEach(p => {
      if (!roles[p.roleId]) roles[p.roleId] = 0;
      roles[p.roleId]++;
    });
    return roles;
  }

  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  getAlivePlayers() {
    return this.state.players.filter(p => p.status === 'ALIVE');
  }

  getHPHPlayers() {
    return this.getAlivePlayers().filter(p => p.faction === 'ORDER_OF_PHOENIX');
  }

  getDEPlayers() {
    return this.getAlivePlayers().filter(p => p.faction === 'DEATH_EATERS');
  }

  getPlayerByRole(roleId) {
    return this.state.players.find(p => p.roleId === roleId && p.status === 'ALIVE');
  }

  getRandomTarget(faction) {
    const targets = faction
      ? this.getAlivePlayers().filter(p => p.faction === faction)
      : this.getAlivePlayers();
    if (targets.length === 0) return undefined;
    return targets[Math.floor(Math.random() * targets.length)];
  }

  getRandomEnemy() {
    const enemies = this.getDEPlayers();
    if (enemies.length === 0) return undefined;
    return enemies[Math.floor(Math.random() * enemies.length)];
  }

  getRandomAlly() {
    const allies = this.getHPHPlayers();
    if (allies.length <= 1) return undefined;
    const others = allies.slice(1);
    return others[Math.floor(Math.random() * others.length)];
  }

  // ============================================
  // SKILL SIMULATION (AI-driven)
  // ============================================

  simulateNightActions() {
    const alive = this.getAlivePlayers();
    for (const player of alive) {
      this.simulatePlayerNightAction(player);
    }
  }

  simulatePlayerNightAction(player) {
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
      case 'ALBUS_DUMBLEDORE':
        this.simulateDumbledoreAction(player);
        break;
      case 'FENRIR_GREYBACK':
        this.simulateFenrirAction(player);
        break;
    }
  }

  simulateVoldemortAction(player) {
    const hphAlive = this.getHPHPlayers();
    if (hphAlive.length === 0) return;

    const harry = this.getPlayerByRole('HARRY_POTTER');
    if (harry && Math.random() < 0.5) {
      this.state.snapeTargets[player.id] = harry.id;
    } else {
      const target = hphAlive[Math.floor(Math.random() * hphAlive.length)];
      this.state.snapeTargets[player.id] = target.id;
    }
  }

  simulatePettigrewAction(player) {
    const target = this.getRandomAlly();
    if (target) {
      this.state.petterpigrewTargets.push(target.id);
    }
  }

  simulateHermioneAction(player) {
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

  simulateArthurAction(player) {
    const target = this.getRandomTarget();
    if (target) {
      this.state.arthurTargets.push(target.id);
    }
  }

  simulateFredAction(player) {
    const target = this.getRandomEnemy();
    if (target) {
      this.state.fredCandyTargets.push(target.id);
    }
  }

  simulateGeorgeAction(player) {
    // George cooldown: Chỉ rải được mỗi 2 đêm (1 đêm rải, 1 đêm nghỉ)
    if (!this.state.georgePowderUsed && !this.state.georgeCooldown) {
      this.state.georgePowderUsed = true;
      this.state.georgeCooldown = true; // Nghỉ 1 đêm
    } else if (this.state.georgeCooldown) {
      this.state.georgeCooldown = false; // Hết cooldown
    }
  }

  simulateDumbledoreAction(player) {
    // Dumbledore bảo vệ Harry 70% hoặc random HPH
    const harry = this.getPlayerByRole('HARRY_POTTER');
    if (harry && Math.random() < 0.7) {
      this.state.dumbledoreTarget = harry.id;
    } else {
      const target = this.getRandomAlly();
      if (target) this.state.dumbledoreTarget = target.id;
    }
  }

  simulateFenrirAction(player) {
    // Fenrir cắn và CHUYỂN SANG PHE 4T (buffed từ NEUTRAL)
    if (!this.state.fenrirBiteUsed) {
      const target = this.getRandomAlly();
      if (target && target.roleId !== 'HARRY_POTTER' && target.roleId !== 'RUBEUS_HAGRID') {
        this.state.fenrirBiteUsed = true;
        target.faction = 'DEATH_EATERS'; // Chuyển sang 4T
        this.state.logs.push(`Fenrir cắn ${target.name} - Chuyển sang phe 4T!`);
      }
    }
  }

  // ============================================
  // DAY ACTIONS SIMULATION
  // ============================================

  simulateDayActions() {
    const alive = this.getAlivePlayers();
    for (const player of alive) {
      this.simulatePlayerDayAction(player);
    }
  }

  simulatePlayerDayAction(player) {
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

    // Fleur chém kiếm 10% chance
    if (player.roleId === 'FLEUR_DELACOUR') {
      if (Math.random() < 0.1) {
        const de = this.getDEPlayers();
        if (de.length > 0) {
          const target = de[Math.floor(Math.random() * de.length)];
          // 80% chance đúng (AI biết target)
          if (Math.random() < 0.8) {
            this.state.fleurSwordTarget = target.id;
          }
        }
      }
    }
  }

  // ============================================
  // VOTE SIMULATION
  // ============================================

  simulateVotes() {
    const alive = this.getAlivePlayers();
    const votes = {};
    const voterChoices = {};

    for (const voter of alive) {
      if (voter.roleId === 'POTTER_FAKE') continue;

      // 80% chance vote
      if (Math.random() < 0.8) {
        const target = this.getRandomTarget();
        if (target && target.id !== voter.id) {
          voterChoices[voter.id] = target.id;
          votes[target.id] = (votes[target.id] || 0) + 1;
        }
      }
    }

    // Tìm người có nhiều votes nhất
    let maxVotes = 0;
    let lynchedId = null;

    for (const [playerId, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        lynchedId = playerId;
      }
    }

    if (lynchedId && maxVotes > 0) {
      this.killPlayer(lynchedId, 'VOTE_LYNCH');

      const lynched = this.state.players.find(p => p.id === lynchedId);
      if (lynched?.roleId === 'BELLATRIX_LESTRANGE') {
        this.state.bellatrixDeadByVote = true;
      }
      if (lynched?.roleId === 'LUCIUS_MALFOY') {
        this.state.luciusDeadByVote = true;
      }
    }
  }

  // ============================================
  // RESOLUTION
  // ============================================

  resolveNight() {
    // Tìm Voldemort
    const voldemort = this.getPlayerByRole('VOLDEMORT');
    if (!voldemort) return;

    const voldemortTarget = this.state.snapeTargets[voldemort.id];
    if (!voldemortTarget) return;

    // Check George Peru Powder
    if (this.state.georgePowderUsed) {
      this.state.logs.push('Bột Khói Peru vô hiệu kill!');
      this.state.georgePowderUsed = false;
      return;
    }

    const target = this.state.players.find(p => p.id === voldemortTarget);
    if (!target) return;

    // Check Dumbledore protection
    if (this.state.dumbledoreTarget === voldemortTarget) {
      this.state.logs.push(`Dumbledore bảo vệ ${target.name}!`);
      this.state.dumbledoreTarget = null;
      return;
    }

    // Check Golden Flame
    if (target.roleId === 'HARRY_POTTER' && !this.state.goldenFlameUsed) {
      this.state.goldenFlameUsed = true;
      this.state.logs.push('Tia Lửa Vàng cứu Harry!');
      return;
    }

    // Check Ron sacrifice
    if (target.roleId === 'HARRY_POTTER') {
      const ron = this.getPlayerByRole('RON_WEASLEY');
      if (ron) {
        this.state.logs.push('Ron hy sinh!');
        this.killPlayer(ron.id, 'RON_SACRIFICE');
        return;
      }
    }

    // Check Hagrid 2HP
    const hagrid = this.getPlayerByRole('RUBEUS_HAGRID');
    if (hagrid && hagrid.hp > 1) {
      this.state.logs.push('Hagrid bị thương nhưng sống!');
      hagrid.hp--;
      return;
    } else if (hagrid) {
      this.state.logs.push('Hagrid hy sinh!');
      this.killPlayer(hagrid.id, 'HAGRID_SACRIFICE');
      return;
    }

    // Check Fleur Sword
    if (this.state.fleurSwordTarget) {
      const fleur = this.getPlayerByRole('FLEUR_DELACOUR');
      const swordTarget = this.state.players.find(p => p.id === this.state.fleurSwordTarget);
      if (fleur && swordTarget && swordTarget.id !== fleur.id) {
        if (swordTarget.faction === 'DEATH_EATERS') {
          this.state.logs.push(`Fleur chém ${swordTarget.name}!`);
          this.killPlayer(swordTarget.id, 'FLEUR_SWORD');
        } else {
          this.state.logs.push('Fleur chém nhầm tự sát!');
          this.killPlayer(fleur.id, 'FLEUR_MISTAKE');
        }
        this.state.fleurSwordTarget = null;
      }
    }

    // Kill target
    this.killPlayer(voldemortTarget, 'VOLDEMORT_KILL');
  }

  killPlayer(playerId, reason) {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player || player.status === 'DEAD') return;

    // Check Kingsley 100% save (buffed from 50%)
    const kingsley = this.getPlayerByRole('KINGSLEY_SHACKLEBOLT');
    if (kingsley && player.faction === 'ORDER_OF_PHOENIX') {
      this.state.logs.push('Kingsley cứu (100%)!');
      return;
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
        return;
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

  checkWinCondition() {
    const voldemort = this.getPlayerByRole('VOLDEMORT');
    const harry = this.getPlayerByRole('HARRY_POTTER');
    const hphAlive = this.getHPHPlayers();
    const deAlive = this.getDEPlayers();

    if (!voldemort) return ['ORDER_OF_PHOENIX'];
    if (!harry) return ['DEATH_EATERS'];
    if (deAlive.length >= hphAlive.length) return ['DEATH_EATERS'];
    if (deAlive.length === 0) return ['ORDER_OF_PHOENIX'];

    return null;
  }

  // ============================================
  // MAIN SIMULATION LOOP
  // ============================================

  runSimulation() {
    let maxRounds = 20;

    while (maxRounds-- > 0) {
      // Night phase
      this.state.phase = 'NIGHT';
      this.simulateNightActions();
      this.resolveNight();

      let winners = this.checkWinCondition();
      if (winners) {
        this.state.winners = winners;
        return { winners: this.state.winners, logs: this.state.logs, rounds: 20 - maxRounds, roles: this.state.roleDistribution };
      }

      // Day phase
      this.state.phase = 'DAY';
      this.simulateDayActions();
      this.simulateVotes();

      // Check Bellatrix revenge
      if (this.state.bellatrixDeadByVote) {
        this.state.logs.push('Bellatrix báo thù!');
        const targets = this.getHPHPlayers().slice(0, 2);
        for (const t of targets) {
          this.killPlayer(t.id, 'BELLATRIX_REVENGE');
        }
        this.state.bellatrixDeadByVote = false;
      }

      winners = this.checkWinCondition();
      if (winners) {
        this.state.winners = winners;
        return { winners: this.state.winners, logs: this.state.logs, rounds: 20 - maxRounds, roles: this.state.roleDistribution };
      }

      this.state.round++;
      this.state.snapeTargets = {};
      this.state.dumbledoreTarget = null;
      this.state.fleurSwordTarget = null;
    }

    this.state.winners = ['NEUTRAL'];
    return { winners: this.state.winners, logs: this.state.logs, rounds: 20, roles: this.state.roleDistribution };
  }

  getState() {
    return this.state;
  }
}

// ============================================
// BATCH SIMULATION
// ============================================

function runBatchSimulation(playerCount, numGames = 1000) {
  let hphWins = 0;
  let deWins = 0;
  let neutralWins = 0;
  let totalRounds = 0;
  let roleAppearances = {};

  for (let i = 0; i < numGames; i++) {
    const sim = new GameSimulation(playerCount);
    const result = sim.runSimulation();

    // Count role appearances
    if (result.roles) {
      for (const [roleId, count] of Object.entries(result.roles)) {
        roleAppearances[roleId] = (roleAppearances[roleId] || 0) + count;
      }
    }

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
    deWinRate: (deWins / numGames) * 100,
    roleAppearances
  };
}

function runAllSimulations(numGames = 1000) {
  const results = [];
  for (let playerCount = 5; playerCount <= 15; playerCount++) {
    process.stdout.write(`Simulating ${playerCount} players... `);
    const result = runBatchSimulation(playerCount, numGames);
    results.push(result);
    console.log(`HPH: ${result.hphWinRate.toFixed(1)}%, 4T: ${result.deWinRate.toFixed(1)}%`);
  }
  return results;
}

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

function analyzeResults(results) {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    7 POTTERS GAME BALANCE - SIMULATION RESULTS (1000 games each)             ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  console.log('┌──────────┬────────────┬──────────────┬────────────┬────────────┬─────────────┬──────────────┐');
  console.log('│ Players  │ Total Game │  HPH Wins   │  4T Wins   │ Neutral   │ Avg Rounds │ HPH Win Rate │');
  console.log('├──────────┼────────────┼──────────────┼────────────┼────────────┼─────────────┼──────────────┤');

  const allProblems = [];

  for (const r of results) {
    let balance = '✓✓✓✓';
    if (r.hphWinRate > 70) { balance = '⚠️⚠️⚠️'; allProblems.push({p: r.playerCount, issue: 'HPH TOO STRONG', rate: r.hphWinRate}); }
    else if (r.hphWinRate > 60) { balance = '⚡⚡⚡'; allProblems.push({p: r.playerCount, issue: 'HPH FAVORED', rate: r.hphWinRate}); }
    else if (r.hphWinRate > 55) { balance = '⚡⚡'; }
    else if (r.hphWinRate >= 45) { balance = '✓✓✓✓'; }
    else if (r.hphWinRate >= 40) { balance = '⚡⚡'; }
    else if (r.hphWinRate >= 30) { balance = '⚡⚡⚡'; allProblems.push({p: r.playerCount, issue: '4T FAVORED', rate: r.hphWinRate}); }
    else { balance = '⚠️⚠️⚠️'; allProblems.push({p: r.playerCount, issue: '4T TOO STRONG', rate: r.hphWinRate}); }

    console.log(
      `│    ${r.playerCount.toString().padStart(2)}    │    ${r.totalGames.toString().padStart(4)}    │ ${r.hphWins.toString().padStart(5)} (${r.hphWinRate.toFixed(1).padStart(4)}%) │  ${r.deWins.toString().padStart(4)} (${r.deWinRate.toFixed(1).padStart(4)}%)  │    ${r.neutralWins.toString().padStart(3)}    │    ${r.avgRounds.toFixed(1).padStart(4)}     │    ${balance}    │`
    );
  }

  console.log('└──────────┴────────────┴──────────────┴────────────┴────────────┴─────────────┴──────────────┘');

  // Overall analysis
  const avgWinRate = results.reduce((sum, r) => sum + r.hphWinRate, 0) / results.length;
  const balancedTables = results.filter(r => r.hphWinRate >= 45 && r.hphWinRate <= 55).length;

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                       ANALYSIS                                                 ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');

  console.log(`  📊 Overall HPH Win Rate: ${avgWinRate.toFixed(1)}%`);
  console.log(`  📊 Balanced Tables (45-55%): ${balancedTables}/11\n`);

  if (allProblems.length > 0) {
    console.log('  ⚠️  TABLES WITH ISSUES:\n');
    allProblems.forEach(p => {
      console.log(`     • ${p.p} players: ${p.issue} (${p.rate.toFixed(1)}% HPH win rate)`);
    });
    console.log('');
  }

  return { avgWinRate, balancedTables, problems: allProblems };
}

function analyzeRoleAppearances(results) {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                    ROLE APPEARANCE STATS                                        ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');

  // Aggregate role appearances
  const roleStats = {};
  const totalGames = results.reduce((sum, r) => sum + r.totalGames, 0);

  for (const r of results) {
    for (const [roleId, count] of Object.entries(r.roleAppearances || {})) {
      if (!roleStats[roleId]) {
        roleStats[roleId] = { count: 0, wins: 0, losses: 0 };
      }
      roleStats[roleId].count += count;
    }
  }

  // Sort by appearances
  const sortedRoles = Object.entries(roleStats)
    .map(([roleId, stats]) => ({
      roleId,
      name: ROLE_NAMES[roleId] || roleId,
      appearances: stats.count,
      winRate: 0 // Simplified for now
    }))
    .sort((a, b) => b.appearances - a.appearances);

  console.log('  Role                              │ Appearances │ Avg/Table │ Analysis');
  console.log('  ─────────────────────────────────┼─────────────┼───────────┼─────────────────');

  for (const role of sortedRoles) {
    const avgPerTable = (role.appearances / 11).toFixed(1);
    let analysis = '✓ OK';
    if (role.roleId === 'HARRY_POTTER' || role.roleId === 'RON_WEASLEY') {
      analysis = '✓ Always present';
    }
    console.log(`  ${role.name.padEnd(32)} │ ${role.appearances.toString().padStart(11)} │ ${avgPerTable.padStart(9)} │ ${analysis}`);
  }

  console.log('');
}

function analyzeSpecificInteractions(results) {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                  SPECIFIC INTERACTION ANALYSIS                                 ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');

  const interactions = [
    {
      name: 'Hermione + Arthur (Double Info)',
      issue: 'May be too strong in small tables',
      severity: 'medium',
      tables: '5-7 players'
    },
    {
      name: 'George + Fred (Control Combo)',
      issue: 'Strong protection + silence combo',
      severity: 'medium',
      tables: 'All tables'
    },
    {
      name: 'Ron + Harry (Sacrifice)',
      issue: 'Core mechanic - essential for balance',
      severity: 'good',
      tables: 'All tables'
    },
    {
      name: 'Snape + Dumbledore (Double Protection)',
      issue: 'Very strong protection but requires coordination',
      severity: 'low',
      tables: 'All tables'
    },
    {
      name: 'Moody + Fleur (Double Kill)',
      issue: 'Both have self-harm risk - balanced',
      severity: 'good',
      tables: 'All tables'
    },
    {
      name: 'Kingsley (100% save)',
      issue: 'Buffed - guaranteed save for HPH',
      severity: 'good',
      tables: 'All tables'
    },
    {
      name: 'Potter Fake (Decoy + Silenced)',
      issue: 'Buffed - can silence 4T after reveal',
      severity: 'medium',
      tables: 'All tables'
    },
    {
      name: 'Hagrid (2HP)',
      issue: 'Situational - can waste kill',
      severity: 'medium',
      tables: 'All tables'
    },
    {
      name: 'Lucius (Spy + Lock Voldemort)',
      issue: 'Buffed - info + lockdown combo',
      severity: 'medium',
      tables: 'All tables'
    },
    {
      name: 'Fenrir (Convert to 4T)',
      issue: 'Buffed - converts HPH to 4T faction',
      severity: 'medium',
      tables: 'All tables'
    }
  ];

  console.log('  Interaction/Role               │ Severity │ Issue                              │ Tables');
  console.log('  ───────────────────────────────┼─────────┼────────────────────────────────────┼────────────');

  for (const i of interactions) {
    const sevIcon = i.severity === 'high' ? '🔴' : i.severity === 'medium' ? '🟡' : '🟢';
    console.log(`  ${i.name.padEnd(30)} │ ${sevIcon} ${i.severity.padEnd(7)} │ ${i.issue.substring(0, 34).padEnd(34)} │ ${i.tables}`);
  }

  console.log('');
}

function printRecommendations() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                       RECOMMENDATIONS                                          ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');

  console.log('  ✅ ALREADY BUFFED:');
  console.log('     1. Kingsley: Now 100% save (was 50%)');
  console.log('     2. Potter Fake: Now has silenced ability');
  console.log('     3. Lucius: Now has spy ability + Voldemort lock');
  console.log('     4. Fenrir: Now converts to 4T (was neutral)\n');

  console.log('  🟡 POTENTIAL NERF NEEDED:');
  console.log('     1. Hermione + Arthur: Limit both in same table < 7 players');
  console.log('     2. George: May be too strong - reduce powder chance\n');

  console.log('  🟢 ALREADY BALANCED:');
  console.log('     1. Ron + Harry sacrifice - Core mechanic');
  console.log('     2. Dumbledore protection - Strong but fair');
  console.log('     3. Snape sectumsempra - High risk/reward');
  console.log('     4. Moody + Fleur - Risky killers');
  console.log('     5. Lupin revive - Situational\n');

  console.log('  ⚡ INTERACTION ISSUES TO MONITOR:');
  console.log('     1. George + Fred combo - strong but fair');
  console.log('     2. Double info (Herm + Arthur) in small tables');
  console.log('     3. Snape + Dumbledore stacking\n');
}

// ============================================
// MAIN
// ============================================

function main() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    7 POTTERS GAME BALANCE TEST - 11,000 SIMULATIONS                             ║');
  console.log('║                         Testing all tables from 5-15 players                                    ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════╝');

  const results = runAllSimulations(1000);

  const analysis = analyzeResults(results);

  analyzeRoleAppearances(results);

  analyzeSpecificInteractions(results);

  printRecommendations();

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                    SIMULATION COMPLETE                                         ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');
}

main();
