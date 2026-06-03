import { Field, InputType } from '@nestjs/graphql';
import { IsString, Matches } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsString()
  @Matches(/^01[0-9]{8,9}$/, {
    message: 'Phone must be a valid Korean number',
  })
  phone: string;

  @Field()
  @IsString()
  password: string;
}
