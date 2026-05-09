import { IPassportRepository } from "../../domain/repositories/IPassportRepository";
import { AppError } from "../../utils/AppError";

export class PassportUseCases {
  constructor(private passportRepository: IPassportRepository) {}

  async getUserPassports(userId: string) {
    return this.passportRepository.findAllByUserId(userId);
  }

  async getPassport(id: string, userId: string) {
    const passport = await this.passportRepository.findById(id, userId);
    if (!passport) throw new AppError("Passport não encontrado", 404);
    return passport;
  }

  async createPassport(userId: string, data: any) {
    return this.passportRepository.create({
      title: data.title,
      description: data.description,
      tag: data.tag,
      unlockDate: data.unlockDate ? new Date(data.unlockDate) : null,
      userId,
    });
  }

  async updatePassport(id: string, userId: string, data: any) {
    const existing = await this.passportRepository.findById(id, userId);
    if (!existing) throw new AppError("Passport não encontrado", 404);

    return this.passportRepository.update(existing.id, {
      title: data.title ?? existing.title,
      description: data.description ?? existing.description,
      tag: data.tag ?? existing.tag,
      unlockDate: data.unlockDate !== undefined 
        ? (data.unlockDate ? new Date(data.unlockDate) : null) 
        : existing.unlockDate,
    });
  }

  async deletePassport(id: string, userId: string) {
    const existing = await this.passportRepository.findById(id, userId);
    if (!existing) throw new AppError("Passport não encontrado", 404);

    await this.passportRepository.delete(existing.id);
  }

  async getStats(userId: string) {
    return this.passportRepository.getUserStats(userId);
  }
}
