import { PartialType } from '@nestjs/mapped-types';
import { CreateHashtagDTO } from './create-hashtag.dto';

export class UpdateHashtagDTO extends PartialType(CreateHashtagDTO) {}
