import { Module } from '@nestjs/common';
import { KeywordModule } from './instagram/keyword/keyword.module';
import { InstagramModule } from './instagram/instagram.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    InstagramModule,
    KeywordModule,
    InstagramModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
})
export class AppModule { }
