import { PartialType } from '@nestjs/mapped-types';
import { CreateReelDTO } from './create-reel.dto';

export class UpdateReelDTO extends PartialType(CreateReelDTO) {}
