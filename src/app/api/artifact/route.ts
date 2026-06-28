import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/modules/auth/auth.interface";
import { ArtifactService } from "@/modules/artifact/artifact.interface";
import { z } from "zod";

const createArtifactSchema = z.object({
  title: z
    .string()
    .min(1, "Judul karya tidak boleh kosong.")
    .max(150, "Judul karya maksimal 150 karakter."),
  content: z.string().min(1, "Konten karya tidak boleh kosong."),
  guild_id: z.string().optional().nullable(),
  media: z
    .array(
      z.object({
        url: z.string(),
        caption: z.string().optional().nullable(),
        order: z.number().optional(),
        size: z.number().optional(),
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value || cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Anda harus login terlebih dahulu." },
        { status: 401 }
      );
    }

    const user = await AuthService.getCurrentUser(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Sesi Anda telah berakhir." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = createArtifactSchema.parse(body);

    const artifact = await ArtifactService.createArtifact(user.id, validated);

    return NextResponse.json(
      {
        success: true,
        message: "Karya berhasil diterbitkan!",
        data: {
          id: artifact.id,
          slug: artifact.slug,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: error.issues[0]?.message || "Input tidak valid.",
        },
        { status: 400 }
      );
    }

    if (error.code === "DUPLICATE_TITLE" || error.code === "TITLE_TOO_LONG") {
      return NextResponse.json(
        {
          success: false,
          error: error.code,
          message: error.message,
        },
        { status: 400 }
      );
    }

    console.error("[POST /api/artifact Server Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Gagal menerbitkan karya. Silakan coba beberapa saat lagi.",
      },
      { status: 500 }
    );
  }
}
