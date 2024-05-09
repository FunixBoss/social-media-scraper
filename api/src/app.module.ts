import { Module } from '@nestjs/common';
import { InstagramModule } from './instagram/instagram.module';
import { ConfigModule } from '@nestjs/config';
import { HelperModule } from './helper/helper.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ApiResponseInterceptor } from './interceptors/global-api-response.interceptor';
import { ParseCommaSeparatedQuery } from './pipes/parse-comma-separate-query.pipe';
import { AllExceptionsFilter } from './exception/all-exceptions-handler';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    ParseCommaSeparatedQuery
  ],
  imports: [
    InstagramModule,
    HelperModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
})
export class AppModule {}
