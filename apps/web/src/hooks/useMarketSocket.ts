import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { TickerItem, WhaleTx, FearGreedData } from '@cryptovision/shared-types';

export function useMarketSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // In dev, Socket.IO connects to backend on port 4000
    const socket: Socket = io('http://localhost:4000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      // connected
    });

    // Real-time spot ticker stream
    socket.on('prices:ticker', (updatedTickers: TickerItem[]) => {
      queryClient.setQueryData<TickerItem[]>(['tickers'], () => updatedTickers);
    });

    // Real-time whale transaction stream
    socket.on('whale:transactions', (newTx: WhaleTx) => {
      queryClient.setQueryData<WhaleTx[]>(['whaleTxs'], (old) => {
        if (!old) return [newTx];
        return [newTx, ...old.slice(0, 19)];
      });
    });

    // Real-time fear & greed sentiment stream
    socket.on('sentiment:fear-greed', (newSentiment: FearGreedData) => {
      queryClient.setQueryData<FearGreedData>(['fearGreed'], () => newSentiment);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
}
