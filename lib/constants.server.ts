import { getSetting } from "./settings";
import { MODELS, SUGGESTED_PROMPTS } from "./constants";
import type { Model, SuggestedPrompt } from "./constants";

export async function getModels(): Promise<Model[]> {
  const custom = await getSetting("models");
  if (custom) {
    try {
      return JSON.parse(custom) as Model[];
    } catch {
      // Invalid JSON, use defaults
    }
  }
  return MODELS;
}

export async function getSuggestedPrompts(): Promise<SuggestedPrompt[]> {
  const custom = await getSetting("suggested_prompts");
  if (custom) {
    try {
      return JSON.parse(custom) as SuggestedPrompt[];
    } catch {
      // Invalid JSON, use defaults
    }
  }
  return SUGGESTED_PROMPTS;
}

export async function getUtilityModel(): Promise<string> {
  return (
    (await getSetting("utility_model")) ??
    "Qwen/Qwen3-Next-80B-A3B-Instruct"
  );
}

export async function getVisionModel(): Promise<string> {
  return (await getSetting("vision_model")) ?? "moonshotai/Kimi-K2.5";
}
