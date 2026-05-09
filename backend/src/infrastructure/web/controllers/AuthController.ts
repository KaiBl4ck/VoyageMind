import { Request, Response } from "express";
import { AuthUseCases } from "../../../application/useCases/AuthUseCases";
import { UserUseCases } from "../../../application/useCases/UserUseCases";
import { AuthRequest } from "../../../middleware/auth";
import { AppError } from "../../../utils/AppError";

export class AuthController {
  constructor(
    private authUseCases: AuthUseCases,
    private userUseCases: UserUseCases
  ) {}

  async register(req: Request, res: Response) {
    const user = await this.authUseCases.register(req.body);
    return res.status(201).json(user);
  }

  async login(req: Request, res: Response) {
    const result = await this.authUseCases.login(req.body);
    return res.json(result);
  }

  async getMe(req: AuthRequest, res: Response) {
    if (!req.user) throw new AppError("Usuário não autenticado", 401);
    const user = await this.userUseCases.getProfile(req.user.id);
    return res.json(user);
  }

  async updateProfile(req: AuthRequest, res: Response) {
    if (!req.user) throw new AppError("Usuário não autenticado", 401);
    const user = await this.userUseCases.updateProfile(req.user.id, req.body);
    return res.json(user);
  }

  async updateAvatar(req: AuthRequest, res: Response) {
    if (!req.user) throw new AppError("Usuário não autenticado", 401);
    if (!req.file) throw new AppError("Nenhuma imagem foi enviada.", 400);

    const avatarUrl = `/uploads/${req.file.filename}`;
    const result = await this.userUseCases.updateAvatar(req.user.id, avatarUrl);
    return res.json(result);
  }

  async deleteAccount(req: AuthRequest, res: Response) {
    if (!req.user) throw new AppError("Usuário não autenticado", 401);
    await this.userUseCases.deleteAccount(req.user.id);
    return res.status(204).send();
  }
}
