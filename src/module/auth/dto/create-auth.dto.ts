import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    description: 'Here will go user name',
    example: 'John Doe',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Here will go user email',
    example: 'ab@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Here will go user phone',
    example: '01700000000',
  })
  phone: string;

  @ApiProperty({
    description: 'Here will go user password',
    example: '123456',
  })
  @IsNotEmpty()
  password: string;
}
