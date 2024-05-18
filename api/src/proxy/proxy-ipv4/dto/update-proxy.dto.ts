import { PartialType } from '@nestjs/swagger';
import { CreateProxyDTO } from './create-proxy.dto';

export class UpdateProxyDTO extends PartialType(CreateProxyDTO) {}
