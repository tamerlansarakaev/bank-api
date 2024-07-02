import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientUserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/common/constants';
import chatManager from 'src/common/ai/chat.manager';
import { ChatSession } from 'src/common/ai';

interface ISession {
  userId: number;
  session: ChatSession;
}

@Injectable()
export class ChatService {
  constructor(
    private jwtService: JwtService,
    private clientUserService: ClientUserService,
  ) {}

  async getUserProfile(userId) {
    if (!userId) throw new Error('UserId is important');
    const user = await this.clientUserService.getProfile(userId);
    const password = user.password.replace(/./g, '*');
    if (!user) throw new NotFoundException(`User with id: ${userId} not found`);
    return { password, ...user };
  }

  async validateJWT(token: string) {
    const validate = await this.jwtService.verifyAsync(token, {
      secret: jwtConstants.secret,
    });

    if (validate) {
      return validate;
    } else {
      return false;
    }
  }

  async connect(token: string): Promise<ISession> {
    try {
      const payload = await this.validateJWT(token);
      if (!payload || !payload.id) return;

      const user = await this.clientUserService.getProfile(payload.id);
      if (!user) return;

      const session = await chatManager.getOrCreateSession(user);
      return { session, userId: user.id };
    } catch (error) {
      return error;
    }
  }

  async handleSendMessage(token: string, message: string) {
    try {
      const payload = await this.validateJWT(token);
      if (!payload || !payload.id) return;

      const user = await this.clientUserService.getProfile(payload.id);
      if (!user) return;
      const session = await chatManager.getOrCreateSession(user);
      const result = await session.sendMessage(message);
      return result;
    } catch (error) {
      return error;
    }
  }
}
