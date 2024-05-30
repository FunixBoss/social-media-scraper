import { Module, ValidationPipe } from '@nestjs/common';
import { InstagramModule } from './instagram/instagram.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HelperModule } from './helper/helper.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ApiResponseInterceptor } from './interceptors/global-api-response.interceptor';
import { ParseCommaSeparatedQuery } from './pipes/parse-comma-separate-query.pipe';
import { AllExceptionsFilter } from './exception/all-exceptions-handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import download_configuration from './config/download_configuration';
 
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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [download_configuration]
    }),
    TypeOrmModule.forRootAsync({
      name: 'instagram-scraper',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get<string>('INS_DB_HOST'),
          port: parseInt(configService.get<string>('INS_DB_PORT'), 10) || 3306,
          username: configService.get<string>('INS_DB_USERNAME'),
          password: configService.get<string>('INS_DB_PASSWORD'),
          database: configService.get<string>('INS_DB_NAME'),
          entities: [__dirname + '/instagram/entity/*.entity{.ts,.js}'],
        }
      },
      inject: [ConfigService],
    }),
    
    InstagramModule,
    HelperModule,
  ],
  exports: [
    TypeOrmModule,
  ]
})
export class AppModule { }
