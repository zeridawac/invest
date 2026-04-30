'use client';

import { useState, useEffect } from 'react';
import styles from './marketTicker.module.css';
import { TrendingUp, TrendingDown } from 'lucide-react';

const INITIAL_PAIRS = [
  { name: 'XAU/USD', price: 2345.50, change: 0, status: 'neutral' },
  { name: 'EUR/USD', price: 1.0850, change: 0, status: 'neutral' },
  { name: 'GBP/USD', price: 1.2540, change: 0, status: 'neutral' },
  { name: 'USD/JPY', price: 155.20, change: 0, status: 'neutral' },
  { name: 'BTC/USD', price: 63200.00, change: 0, status: 'neutral' },
  { name: 'US30', price: 38500.00, change: 0, status: 'neutral' },
  { name: 'NASDAQ', price: 17800.50, change: 0, status: 'neutral' },
];

export default function MarketTicker() {
  const [pairs, setPairs] = useState(INITIAL_PAIRS);

  useEffect(() => {
    const interval = setInterval(() => {
      setPairs((currentPairs) =>
        currentPairs.map((pair) => {
          // Randomly decide if this pair should change in this tick (30% chance)
          if (Math.random() > 0.3) return { ...pair, status: 'neutral' };

          // Small random movement between -0.15% and +0.15%
          const changePercent = (Math.random() * 0.3) - 0.15;
          const changeAmount = pair.price * (changePercent / 100);
          const newPrice = pair.price + changeAmount;
          
          return {
            ...pair,
            price: Number(newPrice.toFixed(pair.price > 100 ? 2 : 4)),
            change: changeAmount,
            status: changeAmount >= 0 ? 'up' : 'down'
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.tickerWrapper}>
      <h3 className={styles.tickerTitle}>أسعار السوق المباشرة</h3>
      <div className={styles.tickerContainer}>
        <div className={styles.tickerScroll}>
          {/* Double the list for infinite scroll effect */}
          {[...pairs, ...pairs].map((pair, index) => (
            <div 
              key={`${pair.name}-${index}`} 
              className={`${styles.tickerItem} ${pair.status === 'up' ? styles.flashUp : pair.status === 'down' ? styles.flashDown : ''}`}
            >
              <span className={styles.pairName}>{pair.name}</span>
              <span className={styles.pairPrice}>{pair.price}</span>
              {pair.status === 'up' && <TrendingUp size={14} className={styles.iconUp} />}
              {pair.status === 'down' && <TrendingDown size={14} className={styles.iconDown} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
