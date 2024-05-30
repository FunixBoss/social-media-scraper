import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class GetUsernameParamsDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  username: string;
}