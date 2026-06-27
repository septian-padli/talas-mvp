import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/modules/auth/auth.interface";
import { UserService } from "@/modules/user/user.interface";
import { z } from "zod";
import { JobStatus } from "@prisma/client";

const profileUpdateSchema = z.object({
  name: z.string().min(1, "Full name is required").max(255),
  job_title: z.string().max(255).optional().nullable(),
  job_status: z.nativeEnum(JobStatus).optional().nullable(),
  bio: z.string().max(250, "Bio cannot exceed 250 characters").optional().nullable(),
  github: z.string().url("GitHub link must be a valid full URL").or(z.literal("")).optional().nullable(),
  linkedin: z.string().url("LinkedIn link must be a valid full URL").or(z.literal("")).optional().nullable(),
  photo_profile: z.string().optional().nullable(),
});

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const user = await AuthService.getCurrentUser(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validationResult = profileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(
        { success: false, message: firstError, errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const updatedUser = await UserService.updateProfile(user.id, validationResult.data);

    // Remove password field
    const { password, ...userWithoutPassword } = updatedUser as any;

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Error in PUT /api/user/profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
