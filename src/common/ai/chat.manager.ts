import { IProfile } from 'src/client/services/user.service';
import { ChatSession } from '.';

class ChatManager {
  private sessions: Map<number, ChatSession> = new Map();

  async getOrCreateSession(user: IProfile): Promise<ChatSession> {
    let session = this.sessions.get(user.id);

    if (!session) {
      session = new ChatSession(user);
      await session.initialize();
      this.sessions.set(user.id, session);
    }
    setTimeout(() => {
      this.sessions.delete(user.id);
    }, 5000);
    return session;
  }

  async sendMessage(userId: number, message) {
    const session = this.sessions.get(userId);
    if (!session) throw new Error(`No active session`);

    return session.sendMessage(message);
  }
}

export default new ChatManager();
