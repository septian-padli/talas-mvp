import { prisma } from "@/lib/prisma";
import { CreateArtifactDTO, UpdateArtifactDTO } from "../artifact.interface";

/**
 * Core domain business logic & strictly isolated WRITE operations for Artifact domain.
 */
export const artifactService = {
  async create(data: CreateArtifactDTO) {
    // TODO: Implement creation logic and slug generation
    throw new Error("Method not implemented.");
  },

  async update(id: string, authorId: string, data: UpdateArtifactDTO) {
    // TODO: Implement update logic
    throw new Error("Method not implemented.");
  },

  async delete(id: string, authorId: string) {
    // TODO: Implement delete logic
    throw new Error("Method not implemented.");
  },

  async archive(id: string, authorId: string) {
    // TODO: Implement archive logic
    throw new Error("Method not implemented.");
  },
};
