import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login-auth.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

interface User {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService, private readonly prismaService: PrismaService) { }

  async login(dto: LoginDto) {
  const user = await this.validateUser(dto.email, dto.password);

  const payload : JwtPayload= { email: user.email, username: user.name, sub: user.id };

  const { access_token, refresh_token } = this.generateTokens(payload);

  await this.saveOrUpdateRefreshToken(user.id, refresh_token);

  return { access_token, refresh_token };
}


  private async validateUser(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    return user;
  }
  private generateTokens(payload: JwtPayload) {
    const access_token = this.jwtService.sign(payload);

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET')!,
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION')!,
    });

    return { access_token, refresh_token };
  }
  private async saveOrUpdateRefreshToken(userId: string, token: string) {
    const existing = await this.prismaService.refreshToken.findFirst({ where: { userId } });

    if (existing) {
      await this.prismaService.refreshToken.update({
        where: { id: existing.id },
        data: { token },
      });
    } else {
      await this.prismaService.refreshToken.create({
        data: {
          token,
          userId,
        },
      });
    }
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
      const payload = { sub: decoded.sub, username: decoded.username };
      const newAccess = this.jwtService.sign(payload);
      return { access_token: newAccess };
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
