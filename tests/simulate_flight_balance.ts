/**
 * MONTE CARLO SIMULATION ENGINE FOR 7 POTTERS BALANCE
 * Tests various combinations of:
 * - Player Counts: 6, 8, 10, 12, 14, 16, 18, 20, 22
 * - Stage Counts: Fixed 4, Fixed 5, Fixed 6, Dynamic (4-7)
 * - Kill Rates: 1 kill/night, 2 kills/night when N >= 12, Ambush double kill
 * - Win Rates, Average Rounds, and Win Causes
 */

interface SimResult {
  playerCount: number;
  configName: string;
  gamesPlayed: number;
  hphWinPct: number;
  deWinPct: number;
  neutralWinPct: number;
  avgRounds: number;
  avgSurvivors: number;
  burrowWinPct: number;
  voldemortKillWinPct: number;
  wipeDeWinPct: number;
  harryKillWinPct: number;
  parityWinPct: number;
}

interface SimPlayer {
  id: string;
  role: 'HARRY' | 'VOLDEMORT' | 'RON' | 'DUMBLEDORE' | 'DEATH_EATER' | 'PHOENIX' | 'NEUTRAL';
  alive: boolean;
}

interface SimConfig {
  name: string;
  getMaxStages: (N: number) => number;
  getNightKills: (N: number, currentStage: number, voldemortAlive: boolean) => number;
  allowBurrowWin: boolean;
}

function runSimulations(N: number, config: SimConfig, iterations: number = 5000): SimResult {
  let hphWins = 0;
  let deWins = 0;
  let neutralWins = 0;
  let totalRounds = 0;
  let totalSurvivors = 0;

  let burrowWins = 0;
  let voldemortKillWins = 0;
  let wipeDeWins = 0;
  let harryKillWins = 0;
  let parityWins = 0;

  const maxStages = config.getMaxStages(N);

  for (let iter = 0; iter < iterations; iter++) {
    // 1. Setup roles
    const evilCount = Math.max(1, Math.floor(N / 3));
    const goodCount = N - evilCount;

    const players: SimPlayer[] = [];

    // Harry & Voldemort
    players.push({ id: 'p_harry', role: 'HARRY', alive: true });
    players.push({ id: 'p_voldemort', role: 'VOLDEMORT', alive: true });

    // Ron & Dumbledore
    if (goodCount >= 2) players.push({ id: 'p_ron', role: 'RON', alive: true });
    if (goodCount >= 3) players.push({ id: 'p_dumbledore', role: 'DUMBLEDORE', alive: true });

    // Rest of Good
    while (players.filter(p => p.role !== 'VOLDEMORT' && p.role !== 'DEATH_EATER').length < goodCount) {
      players.push({ id: `p_good_${players.length}`, role: 'PHOENIX', alive: true });
    }

    // Rest of Evil
    while (players.filter(p => p.role === 'VOLDEMORT' || p.role === 'DEATH_EATER').length < evilCount) {
      players.push({ id: `p_evil_${players.length}`, role: 'DEATH_EATER', alive: true });
    }

    let round = 0;
    let flightStage = 1;
    let goldenFlameUsed = false;
    let gameOver = false;
    let winner: 'HPH' | 'DE' | 'NEUTRAL' | null = null;
    let winReason: 'BURROW' | 'VOLDY_DEAD' | 'DE_WIPED' | 'HARRY_DEAD' | 'PARITY' | null = null;

    while (!gameOver && round < 25) {
      round++;

      // === DAY PHASE ===
      // Check Burrow Win Condition at Day Start
      const aliveHarryAtDay = players.find(p => p.role === 'HARRY' && p.alive);
      const alivePhoenixAtDay = players.filter(p => (p.role === 'HARRY' || p.role === 'RON' || p.role === 'DUMBLEDORE' || p.role === 'PHOENIX') && p.alive);
      
      if (config.allowBurrowWin && flightStage >= maxStages && aliveHarryAtDay && alivePhoenixAtDay.length > 0) {
        winner = 'HPH';
        winReason = 'BURROW';
        gameOver = true;
        break;
      }

      // Day Action: Expelliarmus Vote
      const aliveAll = players.filter(p => p.alive);
      const aliveEvil = aliveAll.filter(p => p.role === 'VOLDEMORT' || p.role === 'DEATH_EATER');
      const aliveGood = aliveAll.filter(p => p.role !== 'VOLDEMORT' && p.role !== 'DEATH_EATER');

      // Parity check
      if (aliveEvil.length >= aliveGood.length && aliveEvil.length > 0) {
        winner = 'DE';
        winReason = 'PARITY';
        gameOver = true;
        break;
      }
      if (aliveEvil.length === 0 && aliveGood.length > 0) {
        winner = 'HPH';
        winReason = 'DE_WIPED';
        gameOver = true;
        break;
      }

      // Day vote: 1 player eliminated (Expelliarmus / Disarmed out of fight)
      const hitEvilProb = Math.min(0.65, 0.35 + round * 0.03);
      if (Math.random() < hitEvilProb && aliveEvil.length > 0) {
        const targetEvil = aliveEvil[Math.floor(Math.random() * aliveEvil.length)];
        targetEvil.alive = false;
        if (targetEvil.role === 'VOLDEMORT') {
          winner = 'HPH';
          winReason = 'VOLDY_DEAD';
          gameOver = true;
          break;
        }
      } else if (aliveGood.length > 0) {
        const nonHarryGood = aliveGood.filter(p => p.role !== 'HARRY');
        const targetGood = nonHarryGood.length > 0 
          ? nonHarryGood[Math.floor(Math.random() * nonHarryGood.length)]
          : aliveGood[0];
        targetGood.alive = false;
      }

      // Check win after day vote
      const aliveEvilAfterVote = players.filter(p => (p.role === 'VOLDEMORT' || p.role === 'DEATH_EATER') && p.alive);
      const aliveGoodAfterVote = players.filter(p => p.role !== 'VOLDEMORT' && p.role !== 'DEATH_EATER' && p.alive);
      if (aliveEvilAfterVote.length === 0) {
        winner = 'HPH';
        winReason = 'DE_WIPED';
        gameOver = true;
        break;
      }
      if (aliveEvilAfterVote.length >= aliveGoodAfterVote.length) {
        winner = 'DE';
        winReason = 'PARITY';
        gameOver = true;
        break;
      }

      // === NIGHT PHASE ===
      const voldemortAlive = Boolean(players.find(p => p.role === 'VOLDEMORT' && p.alive));
      const nightKills = config.getNightKills(N, flightStage, voldemortAlive);

      for (let k = 0; k < nightKills; k++) {
        const currentAliveGood = players.filter(p => p.role !== 'VOLDEMORT' && p.role !== 'DEATH_EATER' && p.alive);
        if (currentAliveGood.length === 0) break;

        const target = currentAliveGood[Math.floor(Math.random() * currentAliveGood.length)];

        if (target.role === 'HARRY') {
          // Check Dumbledore protection
          const dumbledoreAlive = players.some(p => p.role === 'DUMBLEDORE' && p.alive);
          if (dumbledoreAlive && Math.random() < 0.20) {
            continue;
          }

          // Check Golden Flame Retaliation
          if (!goldenFlameUsed) {
            goldenFlameUsed = true;
            continue;
          }

          // Check Ron sacrifice
          const ronAlive = players.some(p => p.role === 'RON' && p.alive);
          if (ronAlive) {
            const ron = players.find(p => p.role === 'RON' && p.alive)!;
            ron.alive = false;
            continue;
          }

          // Daytime escort deflection
          if (Math.random() < 0.35 && currentAliveGood.length > 1) {
            const escort = currentAliveGood.filter(p => p.role !== 'HARRY')[0];
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

      flightStage = Math.min(maxStages, flightStage + 1);

      const aliveEvilEndNight = players.filter(p => (p.role === 'VOLDEMORT' || p.role === 'DEATH_EATER') && p.alive);
      const aliveGoodEndNight = players.filter(p => p.role !== 'VOLDEMORT' && p.role !== 'DEATH_EATER' && p.alive);
      const aliveHarryEndNight = players.find(p => p.role === 'HARRY' && p.alive);

      if (!aliveHarryEndNight) {
        winner = 'DE';
        winReason = 'HARRY_DEAD';
        gameOver = true;
        break;
      }
      if (aliveEvilEndNight.length >= aliveGoodEndNight.length) {
        winner = 'DE';
        winReason = 'PARITY';
        gameOver = true;
        break;
      }
    }

    totalRounds += round;
    totalSurvivors += players.filter(p => p.alive).length;

    if (winner === 'HPH') {
      hphWins++;
      if (winReason === 'BURROW') burrowWins++;
      else if (winReason === 'VOLDY_DEAD') voldemortKillWins++;
      else if (winReason === 'DE_WIPED') wipeDeWins++;
    } else if (winner === 'DE') {
      deWins++;
      if (winReason === 'HARRY_DEAD') harryKillWins++;
      else if (winReason === 'PARITY') parityWins++;
    } else {
      neutralWins++;
    }
  }

  return {
    playerCount: N,
    configName: config.name,
    gamesPlayed: iterations,
    hphWinPct: (hphWins / iterations) * 100,
    deWinPct: (deWins / iterations) * 100,
    neutralWinPct: (neutralWins / iterations) * 100,
    avgRounds: totalRounds / iterations,
    avgSurvivors: totalSurvivors / iterations,
    burrowWinPct: (burrowWins / iterations) * 100,
    voldemortKillWinPct: (voldemortKillWins / iterations) * 100,
    wipeDeWinPct: (wipeDeWins / iterations) * 100,
    harryKillWinPct: (harryKillWins / iterations) * 100,
    parityWinPct: (parityWins / iterations) * 100,
  };
}

const CONFIGS: SimConfig[] = [
  {
    name: '1. Hiện Tại (Cố định 4 Chặng, 1 kill/đêm)',
    getMaxStages: () => 4,
    getNightKills: () => 1,
    allowBurrowWin: true,
  },
  {
    name: '2. Tăng Chặng Động (S=4..7, 1 kill/đêm)',
    getMaxStages: (N) => {
      if (N <= 8) return 4;
      if (N <= 12) return 5;
      if (N <= 16) return 6;
      return 7;
    },
    getNightKills: () => 1,
    allowBurrowWin: true,
  },
  {
    name: '3. Giữ 4 Chặng + Tăng Kill Ban Đêm (N>=12: 2 kill/đêm)',
    getMaxStages: () => 4,
    getNightKills: (N) => (N >= 12 ? 2 : 1),
    allowBurrowWin: true,
  },
  {
    name: '4. Tăng Chặng Động + Tăng Kill Cố Định (N>=14: 2 kill/đêm, S=4..7)',
    getMaxStages: (N) => {
      if (N <= 8) return 4;
      if (N <= 12) return 5;
      if (N <= 16) return 6;
      return 7;
    },
    getNightKills: (N) => (N >= 14 ? 2 : 1),
    allowBurrowWin: true,
  },
  {
    name: '5. Tối Ưu Bảy Potter: Chặng Động (4..7) + Voldemort Phục Kích (Chặng 3+)',
    getMaxStages: (N) => {
      if (N <= 8) return 4;
      if (N <= 12) return 5;
      if (N <= 16) return 6;
      return 7;
    },
    getNightKills: (N, stage, voldemortAlive) => {
      // Khi đông (N >= 14) và Voldemort đích thân chỉ huy xuất kích ở Chặng 3 trở đi -> 2 kills/đêm
      if (N >= 14 && stage >= 3 && voldemortAlive) return 2;
      return 1;
    },
    allowBurrowWin: true,
  },
];

async function main() {
  console.log('========================================================================================');
  console.log('⚡ BẮT ĐẦU CHẠY MÔ PHỎNG MONTE CARLO CÂN BẰNG GAME BẢY POTTER ⚡');
  console.log('5 Mô hình x 9 Mức sĩ số x 5,000 ván = 225,000 trận đấu thực nghiệm');
  console.log('========================================================================================\n');

  const playerCounts = [6, 8, 10, 12, 14, 16, 18, 20, 22];

  for (const config of CONFIGS) {
    console.log(`\n----------------------------------------------------------------------------------------`);
    console.log(`📊 MÔ HÌNH: [${config.name}]`);
    console.log(`----------------------------------------------------------------------------------------`);
    console.log(`N  | Thắng HPH | Thắng TTTT | Hiệp TB | Thắng Hang Sóc | Diệt Voldy | Giết Harry | Áp đảo số`);
    console.log(`---+-----------+------------+---------+----------------+------------+------------+----------`);

    for (const N of playerCounts) {
      const res = runSimulations(N, config, 5000);
      const hph = res.hphWinPct.toFixed(1) + '%';
      const de = res.deWinPct.toFixed(1) + '%';
      const rounds = res.avgRounds.toFixed(1);
      const burrow = res.burrowWinPct.toFixed(1) + '%';
      const voldy = res.voldemortKillWinPct.toFixed(1) + '%';
      const harry = res.harryKillWinPct.toFixed(1) + '%';
      const parity = res.parityWinPct.toFixed(1) + '%';

      console.log(
        `${String(N).padStart(2)} | ` +
        `${hph.padStart(9)} | ` +
        `${de.padStart(10)} | ` +
        `${rounds.padStart(7)} | ` +
        `${burrow.padStart(14)} | ` +
        `${voldy.padStart(10)} | ` +
        `${harry.padStart(10)} | ` +
        `${parity.padStart(9)}`
      );
    }
  }

  console.log('\n========================================================================================');
  console.log('🎉 HOÀN TẤT TOÀN BỘ 225,000 TRẬN MÔ PHỎNG THỰC TẾ!');
  console.log('========================================================================================');
}

main().catch(console.error);
