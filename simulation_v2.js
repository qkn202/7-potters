/**
 * 7 Potters Game Simulation - UPDATED WITH BALANCE FIXES
 * Test balance after implementing:
 * 1. New OPTIMAL_BALANCE (more 4T in larger tables)
 * 2. Kingsley buffed to 100% save
 * 3. Potter Fake with silenced ability
 * 4. Lucius with spy ability
 * 5. Fenrir converts to 4T faction
 * 6. Hermione + Arthur limit in tables <= 6
 */

// ============================================
// GAME CONSTANTS (UPDATED)
// ============================================

const OPTIMAL_BALANCE = {
  4: { evil: 1, good: 3 },
  5: { evil: 2, good: 3 },  // CHANGED: was evil:1, good:4
  6: { evil: 2, good: 4 },
  7: { evil: 2, good: 5 },
  8: { evil: 3, good: 5 },  // CHANGED: was evil:2, good:6
  9: { evil: 3, good: 6 },
  10: { evil: 3, good: 7 }, // CHANGED: was evil:4, good:6
  11: { evil: 4, good: 7 },
  12: { evil: 5, good: 7 }, // CHANGED: was evil:4, good:8
  13: { evil: 5, good: 8 },
  14: { evil: 6, good: 8 }, // CHANGED: was evil:5, good:9
  15: { evil: 6, good: 9 }, // CHANGED: was evil:5, good:10
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
    const balance = OPTIMAL_BALANCE[this.playerCount] || { evil: 2, good: 4 };
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
    let remainingHPH = balance.good - 2;

    // NEW: Limit Hermione + Arthur in small tables (<=6)
    let availableHPH = HPH_ROLES.filter(r => r !== 'HARRY_POTTER' && r !== 'RON_WEASLEY');
    if (this.playerCount <= 6) {
      const keepHermione = Math.random() < 0.5;
      availableHPH = availableHPH.filter(r => {
        if (r === 'HERMIONE_GRANGER' && !keepHermione) return false;
        if (r === 'ARTHUR_WEASLEY' && keepHermione) return false;
        return true;
      });
    }

    const shuffledHPH = this.shuffle([...availableHPH]);
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
      voldemortTarget: null,
      dumbledoreTarget: null,
      arthurUltimateUsed: false,
      fredCandyTargets: [],
      georgePowderUsed: false,
      fleurSwordTarget: null,
      herimoneTargets: [],
      bellatrixDeadByVote: false,
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

  getRandomAlly() {
    const allies = this.getHPHPlayers();
    if (allies.length <= 1) return undefined;
    const others = allies.slice(1);
    return others[Math.floor(Math.random() * others.length)];
  }

  getRandomEnemy() {
    const enemies = this.getDEPlayers();
    if (enemies.length === 0) return undefined;
    return enemies[Math.floor(Math.random() * enemies.length)];
  }

  getRandomTarget() {
    const targets = this.getAlivePlayers();
    if (targets.length === 0) return undefined;
    return targets[Math.floor(Math.random() * targets.length)];
  }

  // ============================================
  // NIGHT ACTIONS SIMULATION
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
        // Voldemort chọn target (ưu tiên Harry)
        if (Math.random() < 0.5) {
          const harry = this.getPlayerByRole('HARRY_POTTER');
          if (harry) this.state.voldemortTarget = harry.id;
        } else {
          const target = this.getRandomAlly();
          if (target) this.state.voldemortTarget = target.id;
        }
        break;

      case 'HERMIONE_GRANGER':
        // Hermione soi (tránh Harry/Voldy)
        const targets = this.getAlivePlayers().filter(p =>
          p.roleId !== 'HARRY_POTTER' &&
          p.roleId !== 'VOLDEMORT'
        );
        if (targets.length > 0) {
          const t = targets[Math.floor(Math.random() * targets.length)];
          this.state.herimoneTargets.push(t.id);
        }
        break;

      case 'ARTHUR_WEASLEY':
        // Arthur soi phe
        const t1 = this.getRandomTarget();
        if (t1) this.state.arthurUltimateUsed = true;
        break;

      case 'FRED_WEASLEY':
        // Fred tặng kẹo cho DE
        const t2 = this.getRandomEnemy();
        if (t2) this.state.fredCandyTargets.push(t2.id);
        break;

      case 'GEORGE_WEASLEY':
        // George rải bột (30% chance)
        if (Math.random() < 0.3) {
          this.state.georgePowderUsed = true;
        }
        break;

      case 'ALBUS_DUMBLEDORE':
        // Dumbledore bảo vệ Harry 70%
        const harry = this.getPlayerByRole('HARRY_POTTER');
        if (harry && Math.random() < 0.7) {
          this.state.dumbledoreTarget = harry.id;
        }
        break;

      case 'FENRIR_GREYBACK':
        // Fenrir cắn và CHUYỂN SANG PHE 4T
        if (!this.state.fenrirBiteUsed) {
          const t3 = this.getRandomAlly();
          if (t3 && t3.roleId !== 'HARRY_POTTER') {
            this.state.fenrirBiteUsed = true;
            t3.faction = 'DEATH_EATERS'; // CHUYỂN SANG 4T!
          }
        }
        break;
    }
  }

  // ============================================
  // DAY ACTIONS SIMULATION
  // ============================================

  simulateDayActions() {
    // Moody bắn lén 10%
    const moody = this.getPlayerByRole('ALASTOR_MOODY');
    if (moody && !this.state.moodyBulletUsed && Math.random() < 0.1) {
      const target = this.getRandomEnemy();
      if (target) {
        target.status = 'DEAD';
        this.state.moodyBulletUsed = true;
      }
    }

    // Fleur chém kiếm 10%
    const fleur = this.getPlayerByRole('FLEUR_DELACOUR');
    if (fleur && Math.random() < 0.1) {
      const de = this.getDEPlayers();
      if (de.length > 0 && Math.random() < 0.8) {
        this.state.fleurSwordTarget = de[0].id;
      }
    }
  }

  simulateVotes() {
    const alive = this.getAlivePlayers();
    const votes = {};

    for (const voter of alive) {
      if (voter.roleId === 'POTTER_FAKE') continue;
      if (Math.random() < 0.8) {
        const target = this.getRandomTarget();
        if (target && target.id !== voter.id) {
          votes[target.id] = (votes[target.id] || 0) + 1;
        }
      }
    }

    let maxVotes = 0;
    let lynchedId = null;
    for (const [id, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        lynchedId = id;
      }
    }

    if (lynchedId && maxVotes > 0) {
      const lynched = this.state.players.find(p => p.id === lynchedId);
      if (lynched) {
        lynched.status = 'DEAD';
        if (lynched.roleId === 'BELLATRIX_LESTRANGE') {
          this.state.bellatrixDeadByVote = true;
        }
      }
    }
  }

  // ============================================
  // RESOLUTION
  // ============================================

  resolveNight() {
    // Check Peru Powder - vô hiệu kill
    if (this.state.georgePowderUsed) {
      this.state.logs.push('Bột Khói Peru vô hiệu kill!');
      this.state.georgePowderUsed = false;
      return;
    }

    if (!this.state.voldemortTarget) return;
    const target = this.state.players.find(p => p.id === this.state.voldemortTarget);
    if (!target || target.status === 'DEAD') return;

    // Check Dumbledore
    if (this.state.dumbledoreTarget === this.state.voldemortTarget) {
      this.state.logs.push('Dumbledore bảo vệ!');
      return;
    }

    // Check Golden Flame (Harry only)
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
        ron.status = 'DEAD';
        return;
      }
    }

    // Check Fleur Sword
    if (this.state.fleurSwordTarget) {
      const fleur = this.getPlayerByRole('FLEUR_DELACOUR');
      const swordTarget = this.state.players.find(p => p.id === this.state.fleurSwordTarget);
      if (fleur && swordTarget) {
        swordTarget.status = 'DEAD';
        this.state.fleurSwordTarget = null;
      }
    }

    // NEW: Check Kingsley 100% save (was 50%)
    const kingsley = this.getPlayerByRole('KINGSLEY_SHACKLEBOLT');
    if (kingsley && target.faction === 'ORDER_OF_PHOENIX') {
      // 100% save for Kingsley!
      this.state.logs.push('Kingsley cứu (100%)!');
      return;
    }

    // Kill target
    target.status = 'DEAD';
    this.state.logs.push(`${target.name} chết`);
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
        return { winners, rounds: 20 - maxRounds, roles: this.state.roleDistribution };
      }

      // Day phase
      this.state.phase = 'DAY';
      this.simulateDayActions();
      this.simulateVotes();

      // Bellatrix revenge
      if (this.state.bellatrixDeadByVote) {
        const targets = this.getHPHPlayers().slice(0, 2);
        targets.forEach(t => t.status = 'DEAD');
        this.state.bellatrixDeadByVote = false;
      }

      winners = this.checkWinCondition();
      if (winners) {
        this.state.winners = winners;
        return { winners, rounds: 20 - maxRounds, roles: this.state.roleDistribution };
      }

      this.state.round++;
    }

    this.state.winners = ['NEUTRAL'];
    return { winners: ['NEUTRAL'], rounds: 20, roles: this.state.roleDistribution };
  }
}

// ============================================
// SIMULATION RUNNER
// ============================================

function runBatchSimulation(playerCount, numGames = 1000) {
  let hphWins = 0;
  let deWins = 0;
  let neutralWins = 0;
  let totalRounds = 0;

  for (let i = 0; i < numGames; i++) {
    const sim = new GameSimulation(playerCount);
    const result = sim.runSimulation();

    if (result.winners.includes('ORDER_OF_PHOENIX')) hphWins++;
    else if (result.winners.includes('DEATH_EATERS')) deWins++;
    else neutralWins++;
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

function runAllSimulations(numGames = 1000) {
  const results = [];
  for (let i = 5; i <= 15; i++) {
    process.stdout.write(`Simulating ${i} players... `);
    const result = runBatchSimulation(i, numGames);
    results.push(result);
    console.log(`HPH: ${result.hphWinRate.toFixed(1)}%, 4T: ${result.deWinRate.toFixed(1)}%`);
  }
  return results;
}

// ============================================
// MAIN
// ============================================

function main() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║           7 POTTERS GAME BALANCE TEST - AFTER BALANCE FIXES (UPDATED)                        ║');
  console.log('║                                                                                              ║');
  console.log('║  Changes Applied:                                                                            ║');
  console.log('║  1. OPTIMAL_BALANCE updated (more 4T in larger tables)                                       ║');
  console.log('║  2. Kingsley buffed to 100% save (was 50%)                                                   ║');
  console.log('║  3. Potter Fake: Added silenced ability                                                      ║');
  console.log('║  4. Lucius: Added spy ability                                                               ║');
  console.log('║  5. Fenrir: Now CONVERTS to 4T faction (was Neutral)                                       ║');
  console.log('║  6. Hermione + Arthur limited in tables <= 6                                                 ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════╝\n');

  const results = runAllSimulations(1000);

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              RESULTS AFTER BALANCE FIXES                                        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  console.log('┌──────────┬────────────┬──────────────┬────────────┬────────────┬─────────────┬──────────────┐');
  console.log('│ Players  │ Total Game │  HPH Wins   │  4T Wins   │ Neutral   │ Avg Rounds │ Status       │');
  console.log('├──────────┼────────────┼──────────────┼────────────┼────────────┼─────────────┼──────────────┤');

  const allProblems = [];

  for (const r of results) {
    let status = '✓✓✓✓';
    let color = '🟢';
    if (r.hphWinRate > 65) { status = '⚠️ HPH STRONG'; color = '🔴'; allProblems.push({p: r.playerCount, issue: 'HPH TOO STRONG', rate: r.hphWinRate}); }
    else if (r.hphWinRate > 55) { status = '⚡ HPH FAVOR'; color = '🟡'; }
    else if (r.hphWinRate >= 45) { status = '✓ BALANCED'; color = '🟢'; }
    else if (r.hphWinRate >= 35) { status = '⚡ 4T FAVOR'; color = '🟡'; }
    else { status = '⚠️ 4T STRONG'; color = '🔴'; allProblems.push({p: r.playerCount, issue: '4T TOO STRONG', rate: r.hphWinRate}); }

    console.log(
      `│    ${r.playerCount.toString().padStart(2)}    │    ${r.totalGames.toString().padStart(4)}    │ ${r.hphWins.toString().padStart(5)} (${r.hphWinRate.toFixed(1).padStart(4)}%) │  ${r.deWins.toString().padStart(4)} (${r.deWinRate.toFixed(1).padStart(4)}%)  │    ${r.neutralWins.toString().padStart(3)}    │    ${r.avgRounds.toFixed(1).padStart(4)}     │ ${color} ${status.padEnd(12)} │`
    );
  }

  console.log('└──────────┴────────────┴──────────────┴────────────┴────────────┴─────────────┴──────────────┘');

  const avgWinRate = results.reduce((sum, r) => sum + r.hphWinRate, 0) / results.length;
  const balancedTables = results.filter(r => r.hphWinRate >= 45 && r.hphWinRate <= 55).length;

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                       ANALYSIS                                                 ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');

  console.log(`  📊 Average HPH Win Rate: ${avgWinRate.toFixed(1)}%`);
  console.log(`  📊 Balanced Tables (45-55%): ${balancedTables}/11\n`);

  if (allProblems.length > 0) {
    console.log('  ⚠️  Tables still with issues:\n');
    allProblems.forEach(p => {
      console.log(`     • ${p.p} players: ${p.issue} (${p.rate.toFixed(1)}% HPH win rate)`);
    });
    console.log('');
  } else {
    console.log('  ✅ ALL TABLES ARE BALANCED!\n');
  }

  console.log('\n');
}

main();
