import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import * as z from "zod";
import { DiscussionAggregator, DiscussionService } from "@/modules/discussion/discussion.interface";

const JWT_SECRET = process.env.JWT_SECRET || "buat_string_acak_dan_panjang_untuk_security_jwt";
const secret = new TextEncoder().encode(JWT_SECRET);

const createDiscussionSchema = z.object({
  content: z
    .string()
    .min(1, "Konten diskusi tidak boleh kosong.")
    .max(2000, "Diskusi terlalu panjang."),
  parent_id: z.string().optional(),
});

interface RouteParams {
  params: Promise<{
    artifactId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { artifactId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    let currentUserId: string | undefined = undefined;
    if (token) {
      try {
        const { payload } = await jose.jwtVerify(token, secret);
        currentUserId = payload.sub;
      } catch {
        // Token verification soft fail
      }
    }

    const discussions = await DiscussionAggregator.getByArtifactId(artifactId, currentUserId);

    return NextResponse.json({
      success: true,
      data: discussions,
    });
  } catch (error: any) {
    console.error("[Developer Log] GET Artifact Discussions Exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: error.message || "Gagal mengambil daftar diskusi.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { artifactId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message: "Anda harus login untuk mengirimkan diskusi.",
        },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const { payload } = await jose.jwtVerify(token, secret);
      userId = payload.sub as string;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_TOKEN",
          message: "Sesi Anda telah berakhir. Silakan login kembali.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = createDiscussionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: validationResult.error.issues[0]?.message || "Input diskusi tidak valid.",
        },
        { status: 400 }
      );
    }

    const createdDiscussion = await DiscussionService.createDiscussion(userId, {
      artifact_id: artifactId,
      content: validationResult.data.content,
      parent_id: validationResult.data.parent_id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Diskusi berhasil diterbitkan.",
        data: createdDiscussion,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Developer Log] POST Artifact Discussion Exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: error.message || "Gagal membuat diskusi.",
      },
      { status: 500 }
    );
  }
}
