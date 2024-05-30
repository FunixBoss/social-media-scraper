import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateAccountDTO } from './dto/create-account.dto';
import { UpdateAccountDTO } from './dto/update-account.dto';
import { InstagramAccountService } from './service/account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: InstagramAccountService) {}

  @Post()
  create(@Body() createAccountDTO: CreateAccountDTO) {
    return this.accountService.create(createAccountDTO);
  }

  @Get()
  findAll() {
    return this.accountService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDTO: UpdateAccountDTO) {
    return this.accountService.update(+id, updateAccountDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(+id);
  }
}
