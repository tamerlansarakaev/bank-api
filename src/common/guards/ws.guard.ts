import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { jwtConstants } from '../constants';
import { Socket } from 'socket.io';

export interface CustomSocket extends Socket {
  userId?: number;
}

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: CustomSocket = context.switchToWs().getClient();
    const token = client.handshake.auth.token;
    const decodedToken = await this.decodeToken(client, token);
    const userId = decodedToken.id;
    client.userId = userId;
    return true;
  }

  private async decodeToken(client: CustomSocket, token: string) {
    try {
      const decoded: any = this.jwtService.verify(token, {
        secret: jwtConstants.secret,
      });
      return decoded;
    } catch (error) {
        WsException
      client.emit('error', {
        status: 401,
        message: 'Invalid Token',
      });
      client.disconnect(true);
      throw new WsException('Invalid token');
    }
  }
}
