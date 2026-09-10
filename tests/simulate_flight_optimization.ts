/**
 * FINE-TUNING SIMULATION FOR OPTIMAL BALANCE (TARGET: 45% - 55% WIN RATE FOR ALL N)
 */

interface SimResult {
  playerCount: number;
  configName: string;
  hphWinPct: number;
  deWinPct: number;
  avgRounds: number;
  burrowWinPct: number;
  voldemortKillWinPct: number;
  harryKillWinPct: number;
  parityWinPct: number;
}

interface SimPlayer {
  id: string;
  role: 'HARRY' | 'VOLDEMORT' | 'RON' | 'DUMBLEDORE' | 'DEATH_EATER' | 'PHOENIX';
  alive: boolean;
}

interface TunedConfig {
  name: string;
  getMaxStages: (N: number) => number;
  getNightKills: (N: number, stage: number, voldyAlive: boolean, aliveGoodCount: number) => number;
  weasleyItemBonus: (N: number) => number;
}

function runSim(N: number, config: TunedConfig, iterations: number = 8000): SimResult {
  let hphWins = 0;
  let deWins = 0;
  let totalRounds = 0;

  let burrowWins = 0;
  let voldemortKillWins = 0;
  let harryKillWins = 0;
  let parityWins = 0;

  const maxStages = config.getMaxStages(N);

  for (let i = 0; i < iterations; i++) {
    const evilCount = Math.max(1, Math.floor(N / 3));
    const goodCount = N - evilCount;

    const players: SimPlayer[] = [];
    players.push({ id: 'harry', role: 'HARRY', alive: true });
    players.push({ id: 'voldy', role: 'VOLDEMORT', alive: true });
    if (goodCount >= 2) players.push({ id: 'ron', role: 'RON', alive: true });
    if (goodCount >= 3) players.push({ id: 'dumbledore', role: 'DUMBLEDORE', alive: true });

    while (players.filter(p => p.role !== 'VOLDEMORT' && p.role !== 'DEATH_EATER').length < goodCount) {
      players.push({ id: `good_${players.length}`, role: 'PHOENIX', alive: true });
    }
    while (players.filter(p => p.role === 'VOLDEMORT' || p.role === 'DEATH_EATER').length < evilCount) {
      players.push({ id: `evil_${players.length}`, role: 'DEATH_EATER', alive: true });
    }

    let round = 0;
    let stage = 1;
    let goldenFlameUsed = false;
    let gameOver = false;
    let winner: 'HPH' | 'DE' | null = null;
    let winReason: string = '';

    // Extra darkness powder shields based on N
    let darknessShields = config.weasleyItemBonus(N);

    while (!gameOver && round < 25) {
      round++;

      // Day Check: Burrow Win
      const aliveHarryDay = players.find(p => p.role === 'HARRY' && p.alive);
      const aliveGoodDay = players.filter(p => p.role !== 'VOLDEMORT' && p.role !== 'DEATH_EATER' && p.alive);
      if (stage >= maxStages && aliveHarryDay && aliveGoodDay.length > 0) {
        winner = 'HPH';
        winReason = 'BURROW';
        gameOver = true;
        break;
      }

      // Day Check: Parity
      const aliveEvilDay = players.filter(p => (p.role === 'VOLDEMORT' || p.role === 'DEATH_EATER') && p.alive);
      if (aliveEvilDay.length >= aliveGoodDay.length && aliveEvilDay.length > 0) {
        winner = 'DE';
        winReason = 'PARITY';
        gameOver = true;
        break;
      }
      if (aliveEvilDay.length === 0 && aliveGoodDay.length > 0) {
        winner = 'HPH';
        winReason = 'DE_WIPED';
        gameOver = true;
        break;
      }

      // Day Vote (Expelliarmus)
      const hitEvilProb = Math.min(0.60, 0.33 + round * 0.035);
      if (Math.random() < hitEvilProb && aliveEvilDay.length > 0) {
        const targetEvil = aliveEvilDay[Math.floor(Math.random() * aliveEvilDay.length)];
        targetEvil.alive = false;
        if (targetEvil.role === 'VOLDEMORT') {
          winner = 'HPH';
          winReason = 'VOLDY_DEAD';
          gameOver = true;
          break;
        }
      } else if (aliveGoodDay.length > 0) {
        const nonHarry = aliveGoodDay.filter(p => p.role !== 'HARRY');
        const target = nonHarry.length > 0 ? nonHarry[Math.floor(Math.random() * nonHarry.length)] : aliveGoodDay[0];
        target.alive = false;
      }

      // Night Phase
      const voldyAlive = Boolean(players.find(p => p.role === 'VOLDEMORT' && p.alive));
      const currentAliveGood = players.filter(p => p.role !== 'VOLDEMORT' && p.role !== 'DEATH_EATER' && p.alive);
      const kills = config.getNightKills(N, stage, voldyAlive, currentAliveGood.length);

      for (let k = 0; k < kills; k++) {
        const goodNow = players.filter(p => p.role !== 'VOLDEMORT' && p.role !== 'DEATH_EATER' && p.alive);
        if (goodNow.length === 0) break;

        // Check if Peruvian Darkness Powder cancels this attack
        if (darknessShields > 0 && Math.random() < 0.40) {
          darknessShields--;
          continue; // attack blocked by darkness powder!
        }

        const target = goodNow[Math.floor(Math.random() * goodNow.length)];

        if (target.role === 'HARRY') {
          // Dumbledore shield
          const dumbledoreAlive = players.some(p => p.role === 'DUMBLEDORE' && p.alive);
          if (dumbledoreAlive && Math.random() < 0.20) continue;

          // Golden Flame
          if (!goldenFlameUsed) {
            goldenFlameUsed = true;
            continue;
          }

          // Ron sacrifice
          const ron = players.find(p => p.role === 'RON' && p.alive);
          if (ron) {
            ron.alive = false;
            continue;
          }

          // Daytime escort deflection
          if (Math.random() < 0.35 && goodNow.length > 1) {
            const escort = goodNow.filter(p => p.role !== 'HARRY')[0];
            if (escort) {
              escort.alive = false;
              continue;
            }
          }

          target.alive = false;
          winner = 'DE';
          winReason = 'HARRY_DEAD';
          gameOver = true;
          break;
        } else {
          target.alive = false;
        }
      }

      if (gameOver) break;

      stage = Math.min(maxStages, stage + 1);

      const aliveHarryEnd = players.find(p => p.role === 'HARRY' && p.alive);
      const aliveEvilEnd = players.filter(p => (p.role === 'VOLDEMORT' || p.role === 'DEATH_EATER') && p.alive);
      const aliveGoodEnd = players.filter(p => p.role !== 'VOLDEMORT' && p.role !== 'DEATH_EATER' && p.alive);

      if (!aliveHarryEnd) {
        winner = 'DE';
        winReason = 'HARRY_DEAD';
        gameOver = true;
        break;
      }
      if (aliveEvilEnd.length >= aliveGoodEnd.length) {
        winner = 'DE';
        winReason = 'PARITY';
        gameOver = true;
        break;
      }
    }

    totalRounds += round;
    if (winner === 'HPH') {
      hphWins++;
      if (winReason === 'BURROW') burrowWins++;
      else if (winReason === 'VOLDY_DEAD') voldemortKillWins++;
    } else if (winner === 'DE') {
      deWins++;
      if (winReason === 'HARRY_DEAD') harryKillWins++;
      else if (winReason === 'PARITY') parityWins++;
    }
  }

  return {
    playerCount: N,
    configName: config.name,
    hphWinPct: (hphWins / iterations) * 100,
    deWinPct: (deWins / iterations) * 100,
    avgRounds: totalRounds / iterations,
    burrowWinPct: (burrowWins / iterations) * 100,
    voldemortKillWinPct: (voldemortKillWins / iterations) * 100,
    harryKillWinPct: (harryKillWins / iterations) * 100,
    parityWinPct: (parityWins / iterations) * 100,
  };
}

const TUNED_CONFIGS: TunedConfig[] = [
  {
    name: 'Mô hình A: Thang 4..6 Chặng (Cap ở 6) + Ambush Kills khi N>=14',
    getMaxStages: (N) => {
      if (N <= 8) return 4;
      if (N <= 12) return 5;
      return 6; // Cap at 6 stages to prevent Phoenix exhaustion
    },
    getNightKills: (N, stage, voldyAlive, aliveGood) => {
      // Ambush kill at stage 3 or 4 if Voldemort is alive & good army is large
      if (N >= 14 && (stage === 3 || stage === 4) && voldyAlive && aliveGood >= 6) return 2;
      return 1;
    },
    weasleyItemBonus: (N) => (N >= 16 ? 1 : 0),
  },
  {
    name: 'Mô hình B: Thang 4..6 Chặng + Kill Rate Động (N>=16: 2 kill khi phe Ta >= 50%)',
    getMaxStages: (N) => {
      if (N <= 8) return 4;
      if (N <= 12) return 5;
      return 6;
    },
    getNightKills: (N, stage, voldyAlive, aliveGood) => {
      // 2 kills only while Good has numerical superiority (>= 60% remaining)
      if (N >= 14 && aliveGood >= Math.floor(N * 0.45) && voldyAlive) return 2;
      return 1;
    },
    weasleyItemBonus: (N) => (N >= 14 ? 1 : 0),
  },
  {
    name: 'Mô hình C (Cực Cân Bằng): Thang Chặng = ceil(N / 3) kẹp [4, 6] + Quà Weasley bù đắp',
    getMaxStages: (N) => Math.min(6, Math.max(4, Math.ceil(N / 3))),
    getNightKills: (N, stage, voldyAlive, aliveGood) => {
      // Khi N >= 14, Voldemort chỉ huy phục kích 2 kill ở Chặng 3 (Vòng vây Surrey)
      if (N >= 14 && stage >= 3 && voldyAlive && aliveGood >= 5) return 2;
      return 1;
    },
    weasleyItemBonus: (N) => (N >= 18 ? 2 : N >= 12 ? 1 : 0),
  },
];

async function main() {
  const playerCounts = [6, 8, 10, 12, 14, 16, 18, 20, 22];

  for (const config of TUNED_CONFIGS) {
    console.log(`\n================================================================================`);
    console.log(`🎯 KIỂM THỬ MÔ HÌNH: ${config.name}`);
    console.log(`================================================================================`);
    console.log(`N  | Thắng HPH | Thắng TTTT | Hiệp TB | Thắng Hang Sóc | Diệt Voldy | Giết Harry | Áp đảo`);
    console.log(`---+-----------+------------+---------+----------------+------------+------------+-------`);

    for (const N of playerCounts) {
      const res = runSim(N, config, 8000);
      console.log(
        `${String(N).padStart(2)} | ` +
        `${res.hphWinPct.toFixed(1).padStart(8)}% | ` +
        `${res.deWinPct.toFixed(1).padStart(9)}% | ` +
        `${res.avgRounds.toFixed(1).padStart(7)} | ` +
        `${res.burrowWinPct.toFixed(1).padStart(13)}% | ` +
        `${res.voldemortKillWinPct.toFixed(1).padStart(9)}% | ` +
        `${res.harryKillWinPct.toFixed(1).padStart(9)}% | ` +
        `${res.parityWinPct.toFixed(1).padStart(6)}%`
      );
    }
  }
}

main().catch(console.error);
