import { getPrisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const prisma = getPrisma();
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    // Mask API keys in response
    if (s.key.endsWith("_api_key")) {
      map[s.key] = s.value ? "••••••" + s.value.slice(-4) : "";
    } else {
      map[s.key] = s.value;
    }
  }
  return NextResponse.json(map);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { key, value } = body as { key: string; value: string };

  if (!key || typeof value !== "string") {
    return NextResponse.json(
      { error: "key and value are required" },
      { status: 400 },
    );
  }

  const prisma = getPrisma();

  if (value === "") {
    // Delete the setting to revert to default
    await prisma.setting.deleteMany({ where: { key } });
    return NextResponse.json({ success: true, deleted: true });
  }

  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json({ success: true });
}
