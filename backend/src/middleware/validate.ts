import type { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodIssue } from "zod";

export const validate =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (schema: z.ZodObject<any, any>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Override the request properties with parsed (and possibly transformed) values
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) Object.assign(req.params, parsed.params);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Erro de validação",
          errors: (error.issues || []).map((e: ZodIssue) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };
