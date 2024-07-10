import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClientModule } from './client/modules/client.module';
import { AdminModule } from './admin/modules/admin.module';
import { APP_GUARD } from '@nestjs/core';
import { ClientGuard } from './common/guards/client.guard';
import { AdminGuard } from './common/guards/admin.guard';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: 5432,
      password: process.env.POSTGRES_PASSWORD,
      username: process.env.POSTGRES_USER,
      database: process.env.POSTGRES_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    CacheModule.register({ isGlobal: true }),
    ClientModule,
    AdminModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ClientGuard },
    { provide: APP_GUARD, useClass: AdminGuard },
  ],
})
export class AppModule {}
