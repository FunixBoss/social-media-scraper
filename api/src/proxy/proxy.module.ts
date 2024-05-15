import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Proxy } from './entity/proxy.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('PROXY_DB_HOST'),
        port: parseInt(configService.get<string>('PROXY_DB_PORT'), 10) || 3306,
        username: configService.get<string>('PROXY_DB_USERNAME'),
        password: configService.get<string>('PROXY_DB_PASSWORD'),
        database: configService.get<string>('PROXY_DB_NAME'),
        entities: [__dirname + '/entity/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      Proxy
    ]),
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
  exports: [ProxyService]
})
export class ProxyModule { }
