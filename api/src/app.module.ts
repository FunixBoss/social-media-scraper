import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { KeywordModule } from './instagram/keyword/keyword.module';
import { InstagramModule } from './instagram/instagram.module';
import { ConfigModule } from '@nestjs/config';
import { HelperModule } from './helper/helper.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiResponseInterceptor } from './interceptors/global-api-response.interceptor';

@Module({
  providers: [
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ApiResponseInterceptor,
    // },
  ],
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
export class AppModule {}
