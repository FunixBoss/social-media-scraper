import { PartialType } from '@nestjs/mapped-types';
import { CreateKeywordDTO } from './create-keyword.dto';

export class UpdateKeywordDTO extends PartialType(CreateKeywordDTO) {}
