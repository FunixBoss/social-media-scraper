import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelReel } from '../../entity/channel-reel.entity';
import { ChannelPost } from '../../entity/channel-post.entity';
import ChannelPostDTO from '../dto/channel-post.dto';
import ChannelReelDTO from '../dto/channel-reel.dto';
import ChannelHelper from './channel-helper.service';
import ChannelMapperService from './channel-mapper.service';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import { NoPostsFound } from 'src/exception/no-posts-found';
import { NoReelsFound } from 'src/exception/no-reels-found';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(ChannelReel, 'instagram-scraper') private readonly channelReelRepository: Repository<ChannelReel>,
    @InjectRepository(ChannelPost, 'instagram-scraper') private readonly channelPostRepository: Repository<ChannelPost>,
    private readonly mapperService: ChannelMapperService,
    private readonly channelHelper: ChannelHelper,
  ) { }

  async fetchPosts(username: string): Promise<ChannelPostDTO[]> {
    if (!(await this.channelHelper.isExists(username))) throw new EntityNotExists('Channel', username);
    if (!await this.channelHelper.isCrawledContent(username, "CHANNEL_POSTS")) throw new NoPostsFound(username);

    return this.mapperService.mapToChannelPostDTOs(
      await this.channelPostRepository.findBy({ channel: { username } })
    )
  }

  async fetchReels(username: string): Promise<ChannelReelDTO[]> {
    if (!(await this.channelHelper.isExists(username))) throw new EntityNotExists('Channel', username);
    if (!await this.channelHelper.isCrawledContent(username, "CHANNEL_REELS")) throw new NoReelsFound(username);

    return this.mapperService.mapToChannelReelDTOs(
      await this.channelReelRepository.findBy({ channel: { username } })
    )
  }

}

