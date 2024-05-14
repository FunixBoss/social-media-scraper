import { Module, OnApplicationBootstrap, ValidationPipe } from '@nestjs/common';
import { InstagramModule } from './instagram/instagram.module';
import { ConfigModule } from '@nestjs/config';
import { HelperModule } from './helper/helper.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ApiResponseInterceptor } from './interceptors/global-api-response.interceptor';
import { ParseCommaSeparatedQuery } from './pipes/parse-comma-separate-query.pipe';
import { AllExceptionsFilter } from './exception/all-exceptions-handler';
import { PptrModule } from './pptr/pptr.module';
import { ProxyModule } from './proxy/proxy.module';
import { PptrBrowserManagement } from './pptr/service/pptr-browser-management.service';

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
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    ParseCommaSeparatedQuery
  ],
  imports: [
    PptrModule,
    ProxyModule,
    InstagramModule,
    HelperModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
})
export class AppModule implements OnApplicationBootstrap{
  constructor(private readonly browserManagement: PptrBrowserManagement) {}

  async onApplicationBootstrap() {
    await this.browserManagement.ensureInitialized();
  }
}
