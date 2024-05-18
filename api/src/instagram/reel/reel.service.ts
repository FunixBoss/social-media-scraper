import { Injectable } from '@nestjs/common';
import { CreateReelDTO } from './dto/create-reel.dto';
import { UpdateReelDTO } from './dto/update-reel.dto';

@Injectable()
export class ReelService {
  create(createReelDTO: CreateReelDTO) {
    return 'This action adds a new reel';
  }

  findAll() {
    return `This action returns all reel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reel`;
  }

  update(id: number, updateReelDTO: UpdateReelDTO) {
    return `This action updates a #${id} reel`;
  }

  remove(id: number) {
    return `This action removes a #${id} reel`;
  }
}
