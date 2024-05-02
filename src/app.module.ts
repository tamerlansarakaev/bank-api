import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardModule } from './card/card.module';
import { User } from './user/user.entity';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    password: 'root',
    username: 'postgres',
    entities: [User],
    database: 'bank'
  }), AuthModule, UserModule, CardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
