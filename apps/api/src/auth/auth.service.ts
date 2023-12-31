import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import * as argon from 'argon2';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { SignInDto } from 'src/auth/dto/sign-in.dto';
import { InvalidCredentialsException } from 'src/auth/exceptions/InvalidCredentials.exception';
import { AuthConfig } from 'src/config';
import { AUTH_CONFIG } from 'src/constants';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    const tokens = await this.getTokens(user.id, user.email);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async signIn(dto: SignInDto) {
    const user = await this.userService.findOneByEmail(dto.email);

    const isPasswordMatches = await argon.verify(user.password, dto.password);
    if (!isPasswordMatches) throw new InvalidCredentialsException();

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(id: number) {
    return await this.userService.update(id, {
      refreshToken: null,
    });
  }

  async refreshTokens(id: number, refreshToken: string) {
    const user = await this.userService.findOne(id);
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const isTokenMatches = await argon.verify(user.refreshToken, refreshToken);
    if (!isTokenMatches) throw new UnauthorizedException();

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async updateRefreshToken(id: number, token: string) {
    const hashedToken = await argon.hash(token);
    await this.userService.update(id, {
      refreshToken: hashedToken,
    });
  }

  async getTokens(id: number, email: string) {
    const { ACCESS_TOKEN, REFRESH_TOKEN } =
      this.configService.get<AuthConfig>(AUTH_CONFIG);
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: id, email },
        { secret: ACCESS_TOKEN, expiresIn: '15s' },
      ),
      this.jwtService.signAsync(
        { sub: id, email },
        { secret: REFRESH_TOKEN, expiresIn: '7d' },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
