import { Module } from '@nestjs/common';
import { KeywordModule } from './keyword/keyword.module';
import { HashtagModule } from './hashtag/hashtag.module';
import { ChannelModule } from './channel/channel.module';
import { ReelModule } from './reel/reel.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ScraperModule } from './scraper/scraper.module';
import { AccountModule } from './account/account.module';
import { ProxyModule } from 'src/proxy/proxy.module';

// const envData = process.env;
@Module({
  imports: [
    AccountModule,
    ChannelModule,
    HashtagModule,
    KeywordModule,
    ReelModule,
    ScraperModule,
    ProxyModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('INS_DB_HOST'),
        port: parseInt(configService.get<string>('INS_DB_PORT'), 10) || 3306,
        username: configService.get<string>('INS_DB_USERNAME'),
        password: configService.get<string>('INS_DB_PASSWORD'),
        database: configService.get<string>('INS_DB_NAME'),
        entities: [__dirname + '/entity/*.entity{.ts,.js}'],
        // synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [
    AccountModule,
    ChannelModule,
    HashtagModule,
    KeywordModule,
    ReelModule,
    ScraperModule,
    TypeOrmModule,
  ]
})
export class InstagramModule { }
