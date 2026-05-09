import { IUserRepository } from "../../domain/repositories/IUserRepository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/AppError";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const JWT_EXPIRES_IN = "7d";

export class AuthUseCases {
  constructor(private userRepository: IUserRepository) {}

  async register(data: any) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError("Email já está em uso", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      avatarUrl: null,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async login(data: any) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user || !user.password) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
