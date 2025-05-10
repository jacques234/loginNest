import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JwtService } from '@nestjs/jwt';


interface User {
  id: number;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly configService:ConfigService) {}

  async login(user: User) {
    const payload = { sub: user.id, username: user.username };
    
    const access_token = this.jwtService.sign(payload);

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION'),
    });

    // Aquí puedes guardar el refresh token en DB si quieres invalidarlo después
    return { access_token, refresh_token };
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
