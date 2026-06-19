import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";

import { PrismaPassportRepository } from "../infrastructure/database/PrismaPassportRepository";
import { PassportUseCases } from "../application/useCases/PassportUseCases";
import { PassportController } from "../infrastructure/web/controllers/PassportController";

const router = Router();
router.use(authenticate);

// Setup Clean Architecture instances
const passportRepository = new PrismaPassportRepository();
const passportUseCases = new PassportUseCases(passportRepository);
const passportController = new PassportController(passportUseCases);

// Schemas
const passportIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID inválido"),
  }),
});

const createPassportSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().optional(),
    tag: z.string().optional(),
    unlockDate: z.string().optional(),
  }),
});

const updatePassportSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID inválido"),
  }),
  body: z.object({
    title: z.string().min(1, "Título não pode ser vazio").optional(),
    description: z.string().optional(),
    tag: z.string().optional(),
    unlockDate: z.string().optional(),
  }),
});

// Nova Feature 2: Dashboard de Estatísticas
router.get("/stats", (req, res, next) => {
  passportController.getStats(req, res).catch(next);
});

router.get("/", (req, res, next) => {
  passportController.getAll(req, res).catch(next);
});

router.get("/:id", validate(passportIdSchema), (req, res, next) => {
  passportController.getOne(req, res).catch(next);
});

router.post("/", validate(createPassportSchema), (req, res, next) => {
  passportController.create(req, res).catch(next);
});

router.put("/:id", validate(updatePassportSchema), (req, res, next) => {
  passportController.update(req, res).catch(next);
});

router.delete("/:id", validate(passportIdSchema), (req, res, next) => {
  passportController.delete(req, res).catch(next);
});

export default router;
