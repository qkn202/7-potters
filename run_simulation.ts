/**
 * 7 Potters Game Balance Test Runner
 * Run comprehensive simulations to check win rates and balance
 */

import { runBatchSimulation, runAllSimulations, SimulationResult } from './src/lib/gameSimulation';

// ============================================
// MAIN TEST RUNNER
// ============================================

function printResults(results: SimulationResult[]): void {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                           7 POTTERS GAME BALANCE SIMULATION RESULTS                            ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log('┌──────────┬────────────┬──────────────┬────────────┬────────────┬─────────────┬──────────────┐');
  console.log('│ Players  │ Total Game │  HPH Wins   │  4T Wins   │ Neutral   │ Avg Rounds │ HPH Win Rate │');
  console.log('├──────────┼────────────┼──────────────┼────────────┼────────────┼─────────────┼──────────────┤');

  for (const r of results) {
    const balance = getBalanceStatus(r.hphWinRate);
    const bar = getWinRateBar(r.hphWinRate);
    console.log(
      `│    ${r.playerCount.toString().padStart(2)}    │    ${r.totalGames.toString().padStart(4)}    │ ${r.hphWins.toString().padStart(5)} (${r.hphWinRate.toFixed(1).padStart(4)}%) │  ${r.deWins.toString().padStart(4)} (${r.deWinRate.toFixed(1).padStart(4)}%)  │    ${r.neutralWins.toString().padStart(3)}    │    ${r.avgRounds.toFixed(1).padStart(4)}     │    ${balance}    │`
    );
  }

  console.log('└──────────┴────────────┴──────────────┴────────────┴────────────┴─────────────┴──────────────┘');
  console.log('\n');
}

function getBalanceStatus(hphRate: number): string {
  if (hphRate >= 70) return '⚠️ HPH TOO STRONG';
  if (hphRate >= 60) return '⚡ HPH FAVORED';
  if (hphRate >= 55) return '✓ SLIGHT HPH';
  if (hphRate >= 45) return '✓✓ BALANCED';
  if (hphRate >= 40) return '✓ SLIGHT 4T';
  if (hphRate >= 30) return '⚡ 4T FAVORED';
  return '⚠️ 4T TOO STRONG';
}

function getWinRateBar(rate: number): string {
  const filled = Math.round(rate / 5);
  return '█'.repeat(filled) + '░'.repeat(20 - filled);
}

function analyzeImbalances(results: SimulationResult[]): void {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                   BALANCE ANALYSIS                                              ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');

  const problems: string[] = [];

  for (const r of results) {
    if (r.hphWinRate > 65) {
      problems.push(`⚠️  Table ${r.playerCount} players: HPH win rate ${r.hphWinRate.toFixed(1)}% - TOO STRONG for HPH!`);
    } else if (r.hphWinRate < 35) {
      problems.push(`⚠️  Table ${r.playerCount} players: 4T win rate ${r.deWinRate.toFixed(1)}% - TOO STRONG for 4T!`);
    } else if (r.hphWinRate > 55 || r.hphWinRate < 45) {
      problems.push(`⚡ Table ${r.playerCount} players: Slight imbalance - ${r.hphWinRate.toFixed(1)}% HPH win rate`);
    }
  }

  if (problems.length === 0) {
    console.log('✅ ALL TABLES ARE BALANCED! Win rates are within acceptable range (45-55%)\n');
  } else {
    console.log('PROBLEMS FOUND:\n');
    problems.forEach(p => console.log(p));
    console.log('');
  }

  // Overall assessment
  const avgWinRate = results.reduce((sum, r) => sum + r.hphWinRate, 0) / results.length;
  console.log(`\nAVERAGE HPH WIN RATE: ${avgWinRate.toFixed(1)}%`);

  if (avgWinRate >= 45 && avgWinRate <= 55) {
    console.log('✅ OVERALL BALANCE: GOOD - Average win rate is within balanced range\n');
  } else if (avgWinRate >= 40 && avgWinRate <= 60) {
    console.log('⚡ OVERALL BALANCE: ACCEPTABLE - Slight bias but within tolerance\n');
  } else {
    console.log('⚠️ OVERALL BALANCE: NEEDS ADJUSTMENT\n');
  }
}

function analyzeRolePower(): void {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                   ROLE POWER ANALYSIS                                           ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');

  const roles = [
    { name: 'Harry Potter', power: '⭐⭐⭐⭐⭐', role: 'Core - Game revolves around Harry' },
    { name: 'Ron Weasley', power: '⭐⭐⭐⭐', role: 'Auto-sacrifice for Harry' },
    { name: 'Hermione Granger', power: '⭐⭐⭐', role: 'Info gathering - Balanced' },
    { name: 'Arthur Weasley', power: '⭐⭐⭐', role: 'Info + Ultimate - Balanced' },
    { name: 'Dumbledore', power: '⭐⭐⭐⭐', role: 'Protection - Strong' },
    { name: 'Snape', power: '⭐⭐⭐⭐', role: 'Counter-kill - Very strong' },
    { name: 'Moody', power: '⭐⭐⭐⭐', role: 'Day kill - Strong but risky' },
    { name: 'Lupin', power: '⭐⭐⭐', role: 'Revive - Situational' },
    { name: 'Kingsley', power: '⭐⭐', role: '50% save - Weak' },
    { name: 'Hagrid', power: '⭐⭐', role: '2HP - Situational' },
    { name: 'Fred Weasley', power: '⭐⭐⭐', role: 'Silence - Control' },
    { name: 'George Weasley', power: '⭐⭐⭐⭐', role: 'Global protect - Strong' },
    { name: 'Bill Weasley', power: '⭐⭐', role: 'Unsilence - Niche' },
    { name: 'Fleur Delacour', power: '⭐⭐⭐⭐', role: 'Kill - Strong but risky' },
    { name: 'Tonks', power: '⭐⭐⭐', role: 'Morph on death - Situational' },
    { name: 'Mundungus', power: '⭐⭐', role: 'Swap - Niche' },
    { name: 'Potter Fake', power: '⭐', role: 'Decoy only - Weak' },
    { name: 'Voldemort', power: '⭐⭐⭐⭐⭐', role: 'Evil leader - Critical' },
    { name: 'Bellatrix', power: '⭐⭐⭐', role: 'Revenge - Punitive' },
    { name: 'Lucius', power: '⭐', role: 'Lock Voldemort - Weak' },
    { name: 'Pettigrew', power: '⭐⭐⭐', role: 'Info - Good' },
    { name: 'Fenrir', power: '⭐⭐', role: 'Convert - Rarely useful' },
  ];

  roles.forEach(r => {
    console.log(`  ${r.name.padEnd(20)} ${r.power}  - ${r.role}`);
  });

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                    RECOMMENDATIONS                                             ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');
  console.log('  🔧 ROLES TO BUFF (too weak):');
  console.log('     • Kingsley: Change from 50% to guaranteed save');
  console.log('     • Hagrid: Add escape ability or extra protection');
  console.log('     • Lucius: Add info gathering ability');
  console.log('     • Potter Fake: Add vote manipulation or reveal skill');
  console.log('     • Fenrir: Make bite guaranteed convert\n');
  console.log('  🔧 ROLES TO NERF (too strong):');
  console.log('     • Hermione + Arthur: Consider limiting both in same game');
  console.log('     • Dumbledore: Make protect visible to all players');
  console.log('     • Snape: Reduce effectiveness or add cooldown\n');
}

// ============================================
// INTERACTION ANALYSIS
// ============================================

function analyzeInteractions(): void {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                  ROLE INTERACTIONS                                            ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');

  const interactions = [
    {
      pair: 'Hermione + Arthur',
      effect: 'Double Info',
      power: '⚡⚡⚡⚡',
      verdict: 'Can be OP in small tables (5-6), acceptable in large tables',
      verdictType: 'yellow'
    },
    {
      pair: 'George + Fred',
      effect: 'Global Silence + Vote Block',
      power: '⚡⚡⚡⚡',
      verdict: 'Very strong combo - nearly unbeatable for 4T',
      verdictType: 'red'
    },
    {
      pair: 'Dumbledore + Snape',
      effect: 'Double Protection',
      power: '⚡⚡⚡',
      verdict: 'Strong but requires coordination',
      verdictType: 'yellow'
    },
    {
      pair: 'Bill + Fleur',
      effect: 'Old Couple (NOW REMOVED)',
      power: '❌',
      verdict: 'Changed to independent abilities',
      verdictType: 'green'
    },
    {
      pair: 'Weasley Trio',
      effect: 'Old Domino (NOW REMOVED)',
      power: '❌',
      verdict: 'Changed to independent abilities',
      verdictType: 'green'
    },
    {
      pair: 'Bellatrix + Voldemort',
      effect: 'Revenge Kill',
      power: '⚡⚡',
      verdict: 'Punitive mechanic - balanced',
      verdictType: 'green'
    },
    {
      pair: 'Lucius + Voldemort',
      effect: 'Lockdown',
      power: '⚡',
      verdict: 'Rarely triggers - weak',
      verdictType: 'yellow'
    },
    {
      pair: 'Moody + Fleur',
      effect: 'Double Kill',
      power: '⚡⚡⚡',
      verdict: 'Both have risk of self-harm - balanced',
      verdictType: 'green'
    },
    {
      pair: 'Ron + Harry',
      effect: 'Auto-sacrifice',
      power: '⚡⚡⚡⚡⚡',
      verdict: 'Core mechanic - essential for balance',
      verdictType: 'green'
    },
    {
      pair: 'Kingsley + Lupin',
      effect: 'Double Save',
      power: '⚡⚡',
      verdict: 'Situational - weak individually',
      verdictType: 'yellow'
    },
  ];

  console.log('┌────────────────────────┬─────────────────────────────┬────────┬─────────────────────────────────────────┐');
  console.log('│ Pair                   │ Effect                      │ Power  │ Verdict                                │');
  console.log('├────────────────────────┼─────────────────────────────┼────────┼─────────────────────────────────────────┤');

  interactions.forEach(i => {
    const verdictColor = i.verdictType === 'green' ? '✅' : i.verdictType === 'yellow' ? '⚡' : '⚠️';
    console.log(
      `│ ${i.pair.padEnd(22)} │ ${i.effect.padEnd(27)} │ ${i.power.padEnd(6)} │ ${verdictColor} ${i.verdict.substring(0, 35).padEnd(35)} │`
    );
  });

  console.log('└────────────────────────┴─────────────────────────────┴────────┴─────────────────────────────────────────┘');
  console.log('\n');
}

// ============================================
// MAIN
// ============================================

function main(): void {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              7 POTTERS GAME BALANCE TEST                                          ║');
  console.log('║                                   Running 1000 simulations per table...                            ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════╝');

  // Run simulations
  const results = runAllSimulations(1000);

  // Print results
  printResults(results);

  // Analyze imbalances
  analyzeImbalances(results);

  // Analyze role power
  analyzeRolePower();

  // Analyze interactions
  analyzeInteractions();

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                    FINAL RECOMMENDATIONS                                         ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');
  console.log('  1. BUFF NEEDED: Kingsley, Hagrid, Lucius, Potter Fake, Fenrir');
  console.log('  2. NERF CONSIDERED: Limit Hermione + Arthur in tables < 7 players');
  console.log('  3. BALANCED: George, Dumbledore, Snape, Moody, Fleur, Ron, Harry');
  console.log('  4. DEPENDING ON SYNERGY: Lupin, Bill, Fred, Tonks, Mundungus');
  console.log('\n');
}

main();
