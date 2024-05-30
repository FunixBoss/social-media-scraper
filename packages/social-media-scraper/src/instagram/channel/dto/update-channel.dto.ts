import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelDTO } from './create-channel.dto';

export class UpdateChannelDTO extends PartialType(CreateChannelDTO) {}
