import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TickerItem, WhaleTx, FearGreedData } from '@cryptovision/shared-types';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class MarketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MarketGateway.name);

  afterInit() {
    this.logger.log('🚀 WebSocket MarketGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  broadcastTickers(tickers: TickerItem[]) {
    this.server.emit('prices:ticker', tickers);
  }

  broadcastWhaleTransaction(tx: WhaleTx) {
    this.server.emit('whale:transactions', tx);
  }

  broadcastSentiment(sentiment: FearGreedData) {
    this.server.emit('sentiment:fear-greed', sentiment);
  }
}
