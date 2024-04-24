import { Module } from '@nestjs/common';
import { KeywordModule } from './instagram/keyword/keyword.module';
import { InstagramModule } from './instagram/instagram.module';
import { ConfigModule } from '@nestjs/config';
import { HelperModule } from './helper/helper.module';

@Module({
  imports: [
    InstagramModule,
    KeywordModule,
    HelperModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
})
export class AppModule { }
