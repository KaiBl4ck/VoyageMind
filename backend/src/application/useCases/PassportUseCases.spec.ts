import { PassportUseCases } from "./PassportUseCases";
import { IPassportRepository } from "../../domain/repositories/IPassportRepository";
import { Passport } from "../../domain/entities/Passport";

describe("PassportUseCases", () => {
  let mockPassportRepo: jest.Mocked<IPassportRepository>;
  let passportUseCases: PassportUseCases;

  beforeEach(() => {
    mockPassportRepo = {
      findById: jest.fn(),
      findAllByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getUserStats: jest.fn(),
    };
    passportUseCases = new PassportUseCases(mockPassportRepo);
  });

  it("should get user stats successfully", async () => {
    mockPassportRepo.getUserStats.mockResolvedValue({
      total: 2,
      tagsCount: { "Misterioso": 1, "Aventura": 1 },
    });

    const stats = await passportUseCases.getStats("user-1");

    expect(stats.total).toBe(2);
    expect(stats.tagsCount["Misterioso"]).toBe(1);
    expect(mockPassportRepo.getUserStats).toHaveBeenCalledWith("user-1");
  });

  it("should create a passport", async () => {
    const fakePassport: Passport = {
      id: "pass-1",
      title: "Viagem",
      description: "Desc",
      tag: "Tag",
      unlockDate: null,
      userId: "user-1",
      createdAt: new Date(),
    };

    mockPassportRepo.create.mockResolvedValue(fakePassport);

    const result = await passportUseCases.createPassport("user-1", {
      title: "Viagem",
      description: "Desc",
      tag: "Tag",
    });

    expect(result.id).toBe("pass-1");
    expect(mockPassportRepo.create).toHaveBeenCalled();
  });
});
