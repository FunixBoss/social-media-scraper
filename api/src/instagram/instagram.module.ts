import { Module } from '@nestjs/common';
import { KeywordModule } from './keyword/keyword.module';
import { HashtagModule } from './hashtag/hashtag.module';
import { ChannelModule } from './channel/channel.module';
import { ReelModule } from './reel/reel.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ScraperModule } from './scraper/scraper.module';
import { AccountModule } from './account/account.module';
import { PptrModule } from 'src/pptr/pptr.module';
import { ProxyModule } from 'src/proxy/proxy.module';

@Module({
  imports: [
    PptrModule,
    AccountModule,
    ChannelModule,
    HashtagModule,
    KeywordModule,
    ReelModule,
    ScraperModule,
    ProxyModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        console.log('Entities path:', __dirname + '/entity/*.entity{.ts,.js}');
        
        return {
          type: 'mysql',
          host: configService.get<string>('INS_DB_HOST'),
          port: parseInt(configService.get<string>('INS_DB_PORT'), 10) || 3306,
          username: configService.get<string>('INS_DB_USERNAME'),
          password: configService.get<string>('INS_DB_PASSWORD'),
          database: configService.get<string>('INS_DB_NAME'),
          entities: [__dirname + '\entity\*.entity{.ts,.js}'],
        }
      },
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
  ]
})
export class InstagramModule { }
