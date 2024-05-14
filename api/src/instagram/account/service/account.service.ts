import { Injectable, Logger } from '@nestjs/common';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InstagramAccount } from 'src/instagram/entity/instagram-account.entity';
import { Repository } from 'typeorm';
import { InstagramAccountDTO } from '../dto/find-all-account.dto';
import InstagramLoginService from './instagram-login.service';

@Injectable()
export class InstagramAccountService {
  private readonly logger = new Logger(InstagramAccountService.name);

  constructor(
    @InjectRepository(InstagramAccount) private readonly accountRepository: Repository<InstagramAccount>,
    private readonly instaLoginService: InstagramLoginService
  ) { }

  async findAll(): Promise<InstagramAccountDTO[]> {
    return (await this.accountRepository.find()).map(account => new InstagramAccountDTO(account));
  }

  async findOne(id: number): Promise<InstagramAccountDTO> {
    return new InstagramAccountDTO(await this.accountRepository.findOneBy({ id }));
  }

  async create(createAccountDto: CreateAccountDto): Promise<InstagramAccountDTO> {
    const { username, password, twoFactorAuthentication, cookie_string, mail } = createAccountDto
    const isLoggedIn: boolean = await this.instaLoginService.login({username, password, twoFA: twoFactorAuthentication})
    if(!isLoggedIn) {
      this.logger.error("Logged In Instagram Failed")
      throw new Error("Logged In Instagram Failed")
    }
    let account: InstagramAccount = {
      username,
      password,
      twoFactorAuthentication, 
      cookie_string,
      mail,
      import_date: new Date(),
      last_checked: new Date(),
      last_used: new Date(),
      status: await this.checkAccountStatus(username, password, twoFactorAuthentication)
    }
    const acc: InstagramAccount = await this.accountRepository.save(account)
    return this.findOne(acc.id);
  }

  private async checkAccountStatus(username: string, password: string, twoFA: string): Promise<'live' | 'ban' | 'restrict'> {
    // this.instaLoginService.login();
    return;
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
