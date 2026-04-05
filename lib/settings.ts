import { getPrisma } from "./prisma";
import { cache } from "react";

export const getSettings = cache(async (): Promise<Record<string, string>> => {
  try {
    const prisma = getPrisma();
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  } catch {
    return {};
  }
});

export async function getSetting(key: string): Promise<string | null> {
  const settings = await getSettings();
  return settings[key] ?? null;
}
