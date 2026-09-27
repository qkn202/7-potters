/**
 * ⚡ COMPREHENSIVE SIMULATION: ATTRITION & RATIO CALIBRATION FOR N = 4..15
 * Evaluates exact death breakdown (4T Kills vs Votes) and role distribution.
 */

interface SetupSpec {
  N: number;
  evilCount: number;
  goodCount: number;
  maxStages: number;
  allowAmbushDoubleKill: boolean;
}

interface SetupResult {
  N: number;
  evilCount: number;
  goodCount: number;
  maxStages: number;
  evilPct: number;
  hphWinPct: number;
  deWinPct: number;
  avgRounds: number;
  avg4TKillsPerRound: number;
  avgVotesPerRound: number;
  avgTotalDeathsPerRound: number;
  avgTotalDeathsPerGame: number;
  avgSurvivorsAtEnd: number;
  burrowWinPct: number;
  voldemortKillWinPct: number;
  harryKillWinPct: number;
  parityWinPct: number;
}

function simulateSetup(spec: SetupSpec, iterations = 10000): SetupResult {
  const { N, evilCount, maxStages, allowAmbushDoubleKill } = spec;
  const goodCount = N - evilCount;

  let hphWins = 0;
  let deWins = 0;
  let totalRounds = 0;
  let total4TKills = 0;
  let totalVoteKills = 0;
  let totalSurvivors = 0;
  let burrowWins = 0;
  let voldemortDeadWins = 0;
  let harryDeadWins = 0;
  let parityWins = 0;

  for (let iter = 0; iter < iterations; iter++) {
    // Generate players
    const players: { id: string; role: string; evil: boolean; alive: boolean; lives: number }[] = [];
    players.push({ id: 'harry', role: 'HARRY_POTTER', evil: false, alive: true, lives: 1 });
    players.push({ id: 'voldy', role: 'VOLDEMORT', evil: true, alive: true, lives: 1 });

    for (let e = 1; e < evilCount; e++) {
      const role = e === 1 ? 'BELLATRIX' : e === 2 ? 'LUCIUS' : 'PETTIGREW';
      players.push({ id: `e_${e}`, role, evil: true, alive: true, lives: 1 });
    }

    const goodRoles = ['RON', 'HERMIONE', 'DUMBLEDORE', 'MOODY', 'HAGRID', 'LUPIN', 'KINGSLEY', 'MUNDUNGUS', 'DECOY', 'DECOY'];
    for (let g = 1; g < goodCount; g++) {
      const role = goodRoles[(g - 1) % goodRoles.length];
      players.push({ id: `g_${g}`, role, evil: false, alive: true, lives: role === 'HAGRID' ? 2 : 1 });
    }

    let round = 0;
    let stage = 1;
    let goldenFlameUsed = false;
    let ronUsed = false;
    let lupinUsed = false;
    let moodyUsed = false;
    let bellatrixEnraged = false;
    let luciusDisarmed = false;
    let round4TKillsCount = 0;
    let roundVoteKillsCount = 0;
    let gameOver = false;
    let winner: 'HPH' | 'DE' | null = null;
    let winCause: 'BURROW' | 'VOLDY_DEAD' | 'HARRY_DEAD' | 'PARITY' | null = null;

    while (!gameOver && round < 20) {
      round++;

      // Day Start Check: checkWinCondition exactly as in GameContext.tsx
      const aliveVoldy = players.find(p => p.role === 'VOLDEMORT' && p.alive);
      const aliveHarry = players.find(p => p.role === 'HARRY_POTTER' && p.alive);
      const aliveGood = players.filter(p => !p.evil && p.alive);
      const aliveEvil = players.filter(p => p.evil && p.alive);

      if (!aliveVoldy) {
        winner = 'HPH';
        winCause = 'VOLDY_DEAD';
        gameOver = true;
        break;
      }

      if (stage >= maxStages && aliveGood.length > 0) {
        if (aliveHarry) {
          winner = 'HPH';
          winCause = 'BURROW';
        } else {
          winner = 'DE';
          winCause = 'HARRY_DEAD';
        }
        gameOver = true;
        break;
      }

      if (aliveEvil.length >= aliveGood.length && aliveEvil.length > 0) {
        winner = 'DE';
        winCause = 'PARITY';
        gameOver = true;
        break;
      }
      if (aliveEvil.length === 0) {
        winner = 'HPH';
        winCause = 'VOLDY_DEAD';
        gameOver = true;
        break;
      }

      // === DAY ACTION: 4T AMBUSH & ATTEMPTS ===
      const voldyAlive = Boolean(players.find(p => p.role === 'VOLDEMORT' && p.alive));
      let killsAttempted = 1;

      if (luciusDisarmed) {
        killsAttempted = 0;
        luciusDisarmed = false;
      } else if (bellatrixEnraged) {
        killsAttempted = 2;
        bellatrixEnraged = false;
      } else if (allowAmbushDoubleKill && stage >= 3 && voldyAlive && aliveGood.length >= 5) {
        // High N double attack in ambush stage
        killsAttempted = 2;
      } else if (!voldyAlive && aliveEvil.length === 0) {
        killsAttempted = 0;
      }

      // Skip kill chance (5%)
      if (Math.random() < 0.05 && killsAttempted > 0) {
        killsAttempted = 0;
      }

      for (let k = 0; k < killsAttempted; k++) {
        const curGood = players.filter(p => !p.evil && p.alive);
        if (curGood.length === 0) break;

        const target = curGood[Math.floor(Math.random() * curGood.length)];

        // Escort check: 50% chance an ally is escorting
        const hasEscort = curGood.length > 1 && Math.random() < 0.50;

        // Stage 1 & 2: Evasion with Escort
        if (hasEscort && stage <= 2) {
          continue; // both evade safely
        }

        // Dumbledore protection
        const dumbledoreAlive = players.some(p => p.role === 'DUMBLEDORE' && p.alive);
        if (dumbledoreAlive && Math.random() < 0.22) {
          continue;
        }

        if (target.role === 'HARRY_POTTER') {
          // 1. Golden flame
          if (!goldenFlameUsed) {
            goldenFlameUsed = true;
            luciusDisarmed = true;
            continue;
          }
          // 2. Ron sacrifice
          if (!ronUsed && players.some(p => p.role === 'RON' && p.alive)) {
            ronUsed = true;
            const ron = players.find(p => p.role === 'RON' && p.alive)!;
            ron.alive = false;
            round4TKillsCount++;
            continue;
          }
          // 3. Stage 3+ Escort sacrifice
          if (hasEscort && curGood.length > 1) {
            const escort = curGood.find(p => p.id !== target.id);
            if (escort) {
              escort.alive = false;
              round4TKillsCount++;
              continue;
            }
          }
          // Harry killed
          target.alive = false;
          round4TKillsCount++;
          // Game continues: HPH must kill Voldemort before Hang Sóc!
        } else {
          // Non-Harry
          const kingsleyAlive = players.some(p => p.role === 'KINGSLEY' && p.alive);
          if (kingsleyAlive && Math.random() < 0.40) continue;

          if (target.role === 'HAGRID' && target.lives > 1) {
            target.lives--;
            continue;
          }

          if (target.role === 'MUNDUNGUS') {
            const otherAlive = players.filter(p => p.alive && p.id !== target.id);
            if (otherAlive.length > 0) {
              const swapVictim = otherAlive[Math.floor(Math.random() * otherAlive.length)];
              swapVictim.alive = false;
              round4TKillsCount++;
              if (swapVictim.role === 'VOLDEMORT') {
                winner = 'HPH';
                winCause = 'VOLDY_DEAD';
                gameOver = true;
                break;
              }
              continue;
            }
          }

          if (!lupinUsed && players.some(p => p.role === 'LUPIN' && p.alive) && Math.random() < 0.45) {
            lupinUsed = true;
            continue;
          }

          target.alive = false;
          round4TKillsCount++;
        }
      }

      if (gameOver) break;

      // === NIGHT ACTION: EXPELLIARMUS VOTE ===
      const curAliveAll = players.filter(p => p.alive);
      const curAliveEvil = curAliveAll.filter(p => p.evil);
      const curAliveGood = curAliveAll.filter(p => !p.evil);

      // Parity check before vote
      if (curAliveEvil.length >= curAliveGood.length && curAliveEvil.length > 0) {
        winner = 'DE';
        winCause = 'PARITY';
        gameOver = true;
        break;
      }
      if (curAliveEvil.length === 0) {
        winner = 'HPH';
        winCause = 'VOLDY_DEAD';
        gameOver = true;
        break;
      }

      // Vote resolution
      const hermioneAlive = curAliveGood.some(p => p.role === 'HERMIONE');
      const hitEvilChance = Math.min(0.65, 0.30 + round * 0.045 + (hermioneAlive ? 0.12 : 0));

      if (Math.random() < hitEvilChance && curAliveEvil.length > 0) {
        const victim = curAliveEvil[Math.floor(Math.random() * curAliveEvil.length)];
        victim.alive = false;
        roundVoteKillsCount++;

        if (victim.role === 'BELLATRIX') bellatrixEnraged = true;
        if (victim.role === 'LUCIUS') luciusDisarmed = true;
        if (victim.role === 'VOLDEMORT') {
          winner = 'HPH';
          winCause = 'VOLDY_DEAD';
          gameOver = true;
          break;
        }
      } else if (curAliveGood.length > 0) {
        // Vote misfire
        const nonHarry = curAliveGood.filter(p => p.role !== 'HARRY_POTTER');
        const victim = nonHarry.length > 0
          ? nonHarry[Math.floor(Math.random() * nonHarry.length)]
          : curAliveGood[0];
        victim.alive = false;
        roundVoteKillsCount++;
        // Game continues: HPH must kill Voldemort before Hang Sóc!
      }

      // Moody night shot
      if (!moodyUsed && curAliveGood.some(p => p.role === 'MOODY') && round >= 2 && Math.random() < 0.25) {
        moodyUsed = true;
        const freshEvil = players.filter(p => p.evil && p.alive);
        const freshGood = players.filter(p => !p.evil && p.alive);

        if (Math.random() < 0.65 && freshEvil.length > 0) {
          const evilVictim = freshEvil[Math.floor(Math.random() * freshEvil.length)];
          evilVictim.alive = false;
          roundVoteKillsCount++;
          if (evilVictim.role === 'VOLDEMORT') {
            winner = 'HPH';
            winCause = 'VOLDY_DEAD';
            gameOver = true;
            break;
          }
        } else if (freshGood.length > 0) {
          const moody = players.find(p => p.role === 'MOODY');
          if (moody) {
            moody.alive = false;
            roundVoteKillsCount++;
          }
        }
      }

      stage++;
    }

    if (winner === 'HPH') {
      hphWins++;
      if (winCause === 'BURROW') burrowWins++;
      else voldemortDeadWins++;
    } else {
      deWins++;
      if (winCause === 'HARRY_DEAD') harryDeadWins++;
      else parityWins++;
    }

    totalRounds += round;
    total4TKills += round4TKillsCount;
    totalVoteKills += roundVoteKillsCount;
    totalSurvivors += players.filter(p => p.alive).length;
  }

  return {
    N,
    evilCount,
    goodCount,
    maxStages,
    evilPct: Number(((evilCount / N) * 100).toFixed(1)),
    hphWinPct: Number(((hphWins / iterations) * 100).toFixed(1)),
    deWinPct: Number(((deWins / iterations) * 100).toFixed(1)),
    avgRounds: Number((totalRounds / iterations).toFixed(2)),
    avg4TKillsPerRound: Number((total4TKills / totalRounds).toFixed(2)),
    avgVotesPerRound: Number((totalVoteKills / totalRounds).toFixed(2)),
    avgTotalDeathsPerRound: Number(((total4TKills + totalVoteKills) / totalRounds).toFixed(2)),
    avgTotalDeathsPerGame: Number(((total4TKills + totalVoteKills) / iterations).toFixed(2)),
    avgSurvivorsAtEnd: Number((totalSurvivors / iterations).toFixed(2)),
    burrowWinPct: Number(((burrowWins / iterations) * 100).toFixed(1)),
    voldemortKillWinPct: Number(((voldemortDeadWins / iterations) * 100).toFixed(1)),
    harryKillWinPct: Number(((harryDeadWins / iterations) * 100).toFixed(1)),
    parityWinPct: Number(((parityWins / iterations) * 100).toFixed(1)),
  };
}

async function main() {
  console.log('========================================================================================');
  console.log('⚡ PHÂN TÍCH TỐI ƯU CÂN BẰNG TOÀN DIỆN (N = 4 ĐẾN 15 NGƯỜI CHƠI)');
  console.log('========================================================================================\n');

  // Let's test the finely tuned configurations for N = 4..15
  // We'll test:
  // - N=4: 1 4T : 3 HPH (Chặng 3 hoặc 4)
  // - N=5: 1 4T : 4 HPH (Chặng 4) vs 2 4T : 3 HPH
  // - N=6: 2 4T : 4 HPH (Chặng 4 vs 5)
  // - N=7: 2 4T : 5 HPH (Chặng 4 vs 5)
  // - N=8: 2 4T : 6 HPH vs 3 4T : 5 HPH
  // - N=9: 3 4T : 6 HPH (Chặng 5 vs 6)
  // - N=10: 3 4T : 7 HPH vs 4 4T : 6 HPH
  // - N=11: 3 4T : 8 HPH vs 4 4T : 7 HPH
  // - N=12: 4 4T : 8 HPH (Ambush) vs 3 4T : 9 HPH
  // - N=13: 4 4T : 9 HPH (Ambush) vs 5 4T : 8 HPH
  // - N=14: 4 4T : 10 HPH (Ambush) vs 5 4T : 9 HPH
  // - N=15: 5 4T : 10 HPH (Ambush)

  const candidateSpecs: SetupSpec[] = [
    // N = 4
    { N: 4, evilCount: 1, goodCount: 3, maxStages: 3, allowAmbushDoubleKill: false },
    { N: 4, evilCount: 1, goodCount: 3, maxStages: 4, allowAmbushDoubleKill: false },
    // N = 5
    { N: 5, evilCount: 1, goodCount: 4, maxStages: 4, allowAmbushDoubleKill: false },
    { N: 5, evilCount: 2, goodCount: 3, maxStages: 4, allowAmbushDoubleKill: false },
    // N = 6
    { N: 6, evilCount: 2, goodCount: 4, maxStages: 4, allowAmbushDoubleKill: false },
    { N: 6, evilCount: 2, goodCount: 4, maxStages: 5, allowAmbushDoubleKill: false },
    // N = 7
    { N: 7, evilCount: 2, goodCount: 5, maxStages: 4, allowAmbushDoubleKill: false },
    { N: 7, evilCount: 2, goodCount: 5, maxStages: 5, allowAmbushDoubleKill: false },
    // N = 8
    { N: 8, evilCount: 2, goodCount: 6, maxStages: 5, allowAmbushDoubleKill: false },
    { N: 8, evilCount: 3, goodCount: 5, maxStages: 4, allowAmbushDoubleKill: false },
    { N: 8, evilCount: 3, goodCount: 5, maxStages: 5, allowAmbushDoubleKill: false },
    // N = 9
    { N: 9, evilCount: 3, goodCount: 6, maxStages: 5, allowAmbushDoubleKill: false },
    { N: 9, evilCount: 3, goodCount: 6, maxStages: 6, allowAmbushDoubleKill: false },
    // N = 10
    { N: 10, evilCount: 3, goodCount: 7, maxStages: 5, allowAmbushDoubleKill: false },
    { N: 10, evilCount: 3, goodCount: 7, maxStages: 5, allowAmbushDoubleKill: true },
    { N: 10, evilCount: 4, goodCount: 6, maxStages: 5, allowAmbushDoubleKill: false },
    // N = 11
    { N: 11, evilCount: 3, goodCount: 8, maxStages: 5, allowAmbushDoubleKill: true },
    { N: 11, evilCount: 4, goodCount: 7, maxStages: 5, allowAmbushDoubleKill: false },
    { N: 11, evilCount: 4, goodCount: 7, maxStages: 6, allowAmbushDoubleKill: false },
    // N = 12
    { N: 12, evilCount: 4, goodCount: 8, maxStages: 5, allowAmbushDoubleKill: true },
    { N: 12, evilCount: 4, goodCount: 8, maxStages: 6, allowAmbushDoubleKill: true },
    { N: 12, evilCount: 4, goodCount: 8, maxStages: 6, allowAmbushDoubleKill: false },
    // N = 13
    { N: 13, evilCount: 4, goodCount: 9, maxStages: 6, allowAmbushDoubleKill: true },
    { N: 13, evilCount: 5, goodCount: 8, maxStages: 6, allowAmbushDoubleKill: false },
    // N = 14
    { N: 14, evilCount: 4, goodCount: 10, maxStages: 6, allowAmbushDoubleKill: true },
    { N: 14, evilCount: 5, goodCount: 9, maxStages: 6, allowAmbushDoubleKill: true },
    // N = 15
    { N: 15, evilCount: 5, goodCount: 10, maxStages: 6, allowAmbushDoubleKill: true },
    { N: 15, evilCount: 5, goodCount: 10, maxStages: 6, allowAmbushDoubleKill: false },
  ];

  const results = candidateSpecs.map(s => simulateSetup(s, 10000));

  console.log(
    `N   | 4T:HPH  | %4T   | Chặng | Ambush2x | HPH Thắng | 4T Thắng | Vòng TB | Chết 4T/v | Chết Vote/v | Tổng Chết/v | Chết TB Cả Ván | Sống TB`
  );
  console.log(
    `----+---------+-------+-------+----------+-----------+----------+---------+-----------+-------------+-------------+----------------+--------`
  );

  for (let idx = 0; idx < results.length; idx++) {
    const r = results[idx];
    const spec = candidateSpecs[idx];
    const ambushStr = spec.allowAmbushDoubleKill ? 'Có (2 kill)' : 'Không';
    console.log(
      `${r.N.toString().padEnd(3)} | ` +
      `${r.evilCount}:${r.goodCount}`.padEnd(7) + ` | ` +
      `${r.evilPct}%`.padEnd(5) + ` | ` +
      `${r.maxStages}`.padEnd(5) + ` | ` +
      `${ambushStr}`.padEnd(8) + ` | ` +
      `${r.hphWinPct}%`.padEnd(9) + ` | ` +
      `${r.deWinPct}%`.padEnd(8) + ` | ` +
      `${r.avgRounds} v`.padEnd(7) + ` | ` +
      `${r.avg4TKillsPerRound}`.padEnd(9) + ` | ` +
      `${r.avgVotesPerRound}`.padEnd(11) + ` | ` +
      `${r.avgTotalDeathsPerRound}`.padEnd(11) + ` | ` +
      `${r.avgTotalDeathsPerGame}`.padEnd(14) + ` | ` +
      `${r.avgSurvivorsAtEnd}`
    );
  }
}

main().catch(console.error);
