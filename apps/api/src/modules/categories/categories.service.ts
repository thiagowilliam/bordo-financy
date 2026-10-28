import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import type { z } from "zod";
import type {
  categorySchema,
  createCategorySchema,
  updateCategorySchema,
} from "@bordo/shared/categories";

import { isForeignKeyViolation } from "../../database/errors.js";
import type { SessionUser } from "../auth/session-user.js";
import { CategoriesRepository, type CategoryRow } from "./categories.repository.js";

type Category = z.infer<typeof categorySchema>;
type CreateCategory = z.infer<typeof createCategorySchema>;
type UpdateCategory = z.infer<typeof updateCategorySchema>;

const toCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  icon: row.icon as Category["icon"],
  color: row.color as Category["color"],
  kind: row.kind,
  isDefault: row.isDefault,
  hidden: row.hidden,
});

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}

  async list(user: SessionUser) {
    return (await this.repository.list(user.id)).map(toCategory);
  }

  async create(user: SessionUser, input: CreateCategory) {
    return toCategory(await this.repository.create({ ...input, userId: user.id }));
  }

  /** Defaults can be renamed, recolored and hidden like any other: they are the user's own copy. */
  async update(user: SessionUser, id: string, input: UpdateCategory) {
    const row = await this.repository.update(user.id, id, input);
    if (!row) throw new NotFoundException();
    return toCategory(row);
  }

  async setHidden(user: SessionUser, id: string, hidden: boolean) {
    const row = await this.repository.update(user.id, id, { hidden });
    if (!row) throw new NotFoundException();
    return toCategory(row);
  }

  /**
   * Deletes a custom category. When expenses use it, `moveTo` names the category (same kind, also
   * the user's) that receives them first.
   */
  async remove(user: SessionUser, id: string, moveTo: string | undefined) {
    const category = await this.repository.find(user.id, id);
    if (!category) throw new NotFoundException();
    if (category.isDefault) {
      throw new ConflictException("Categorias padrão só podem ser ocultadas");
    }

    const used = await this.repository.countExpenses(id);
    if (used > 0) {
      const target = moveTo ? await this.repository.find(user.id, moveTo) : null;
      if (!target || target.id === id || target.kind !== category.kind) {
        throw new UnprocessableEntityException(
          "Escolha outra categoria do mesmo tipo para receber os lançamentos",
        );
      }
    }

    try {
      const moved = await this.repository.deleteMoving(user.id, id, used > 0 ? moveTo : undefined);
      return { id, movedExpenses: moved };
    } catch (error) {
      // An expense was added to the category between the check and the delete.
      if (isForeignKeyViolation(error)) {
        throw new ConflictException("A categoria foi usada agora há pouco. Tente de novo.");
      }
      throw error;
    }
  }
}
