export const LEVELS = [
  { name: 'Bronze', minPoints: 0, color: '#cd7f32' },
  { name: 'Silver', minPoints: 1001, color: '#c0c0c0' },
  { name: 'Gold', minPoints: 5001, color: '#ffd700' },
  { name: 'VIP', minPoints: 20001, color: '#1e40af' },
];

export function calculateLevel(points: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getNextLevel(points: number) {
  for (let i = 0; i < LEVELS.length; i++) {
    if (points < LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return null; // Already at max level
}

export function calculatePointsFromStats(investment: number, profit: number) {
  // 1 point per 1000 MAD invested
  // 5 points per 1000 MAD profit
  const investmentPoints = Math.floor(investment / 1000);
  const profitPoints = Math.floor(profit / 1000) * 5;
  return investmentPoints + profitPoints;
}
