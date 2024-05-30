import { Module } from '@nestjs/common';
import { ChannelModule } from './channel/channel.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

// const envData = process.env;
@Module({
  imports: [
    TypeOrmModule,
    ChannelModule,
    BullModule.forRoot('ins-downloader', {
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  exports: [
    BullModule,
    ChannelModule,
  ],
})
export class InstagramModule  {
  
}
