import { prisma } from "@/lib/prisma";
import { UpdateUserProfileDTO } from "../types/user";
import { MediaService } from "@/modules/media/media.interface";

/**
 * Core domain business logic & strictly isolated WRITE operations for User domain.
 */
export const userService = {
  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async updateProfile(userId: string, data: UpdateUserProfileDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { photo_profile_id: true },
    });

    const { photo_profile, photo_profile_id, ...rest } = data;
    let finalPhotoId = photo_profile_id;

    if (photo_profile && !photo_profile_id) {
      const media = await prisma.media.create({
        data: { url: photo_profile },
      });
      finalPhotoId = media.id;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...rest,
        ...(finalPhotoId !== undefined ? { photo_profile_id: finalPhotoId } : {}),
      },
    });

    // Clean up old media record and object storage file if avatar changed
    if (
      finalPhotoId !== undefined &&
      existingUser?.photo_profile_id &&
      existingUser.photo_profile_id !== finalPhotoId
    ) {
      try {
        await MediaService.delete(existingUser.photo_profile_id);
      } catch (e) {
        // Ignore if already deleted
      }
    }

    return updatedUser;
  },
};
