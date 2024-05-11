import { Module } from '@nestjs/common';
import { InstagramAccountService } from './service/account.service';
import { AccountController } from './account.controller';
import InstagramLoginService from './service/instagram-login.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstagramAccount } from '../entity/instagram-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstagramAccount
    ])
  ],
  controllers: [AccountController],
  providers: [
    InstagramAccountService,
    InstagramLoginService
  ],
  exports: [
    InstagramAccountService,
    InstagramLoginService
  ]
})
export class AccountModule {}
