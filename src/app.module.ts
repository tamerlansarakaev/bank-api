import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsModule } from './card/cards.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: 'root',
      username: 'postgres',
      database: 'bank',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true

    }),
    AuthModule,
    UsersModule,
    CardsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
