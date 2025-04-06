// import { Injectable, UnauthorizedException } from "@nestjs/common"
// import { PassportStrategy } from "@nestjs/passport"
// import { Strategy } from "passport-local"
// import type { AuthService } from "../auth.service"

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//   constructor(private authService: AuthService) {
//     super({ usernameField: "email" })
//   }

//   async validate(email: string, password: string): Promise<any> {
//     try {
//       const user = await this.authService.validateUser(email, password)
//       return user
//     } catch (error) {
//       throw new UnauthorizedException("Invalid credentials")
//     }
//   }
// }

// backend/src/auth/strategies/local.strategy.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import type { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: "email", passwordField: "password" });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      const user = await this.authService.validateUser(email, password);
      return user;
    } catch (error) {
      throw new UnauthorizedException("Invalid credentials");
    }
  }
}
