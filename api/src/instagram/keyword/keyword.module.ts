import { Module } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { KeywordController } from './keyword.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Keyword } from "../entity/keyword.entity";

@Module({
  controllers: [
    KeywordController,
  ],
  providers: [KeywordService],
  imports: [
    TypeOrmModule.forFeature([Keyword]),
  ]
})
export class KeywordModule { }
