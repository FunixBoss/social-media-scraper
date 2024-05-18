import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReelService } from './reel.service';
import { CreateReelDTO } from './dto/create-reel.dto';
import { UpdateReelDTO } from './dto/update-reel.dto';

@Controller('reel')
export class ReelController {
  constructor(private readonly reelService: ReelService) {}

  @Post()
  create(@Body() createReelDTO: CreateReelDTO) {
    return this.reelService.create(createReelDTO);
  }

  @Get()
  findAll() {
    return this.reelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReelDTO: UpdateReelDTO) {
    return this.reelService.update(+id, updateReelDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reelService.remove(+id);
  }
}
