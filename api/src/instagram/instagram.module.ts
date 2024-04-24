import { Module } from '@nestjs/common';
import { KeywordModule } from './keyword/keyword.module';
import { HashtagModule } from './hashtag/hashtag.module';
import { ChannelModule } from './channel/channel.module';
import { ReelModule } from './reel/reel.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Hashtag } from './entity/hashtag.entity';
import { Keyword } from './entity/keyword.entity';
import { ScraperModule } from './scraper/scraper.module';

// const envData = process.env;
@Module({
  imports: [
    KeywordModule,
    HashtagModule,
    ChannelModule,
    ReelModule,
    ScraperModule,
    TypeOrmModule.forRootAsync({ // Use forRootAsync to inject ConfigService
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('INS_DB_HOST'),
        port: parseInt(configService.get<string>('INS_DB_PORT'), 10) || 3306,
        username: configService.get<string>('INS_DB_USERNAME'),
        password: configService.get<string>('INS_DB_PASSWORD'),
        database: configService.get<string>('INS_DB_NAME'),
        entities: [__dirname + '/entity/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService], 
    }),
  ],
  exports: [
    TypeOrmModule, // Export TypeOrmModule to make repositories available for injection in sub-modules
  ]
})
export class InstagramModule { }
