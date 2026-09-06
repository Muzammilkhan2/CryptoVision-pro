import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { TickerItem, WhaleTx, FearGreedData } from '@cryptovision/shared-types';

export function useMarketSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // In dev, connects to localhost:4000; in production on Railway, connects to VITE_SOCKET_URL or VITE_API_URL
    const rawUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL ||
      'http://localhost:4000';
    const serverUrl = rawUrl.replace(/\/api\/v1\/?$/, '');

    const socket: Socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      // connected to live stream
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
