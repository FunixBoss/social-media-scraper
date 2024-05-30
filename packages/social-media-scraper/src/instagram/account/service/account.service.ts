import { Injectable } from '@nestjs/common';
import { CreateAccountDTO } from '../dto/create-account.dto';
import { UpdateAccountDTO } from '../dto/update-account.dto';

@Injectable()
export class InstagramAccountService {
  create(createAccountDTO: CreateAccountDTO) {
    return 'This action adds a new account';
  }

  findAll() {
    return `This action returns all account`;
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  update(id: number, updateAccountDTO: UpdateAccountDTO) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
