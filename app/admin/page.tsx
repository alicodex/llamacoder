import AdminPanel from "./admin-panel";
import {
  defaultSoftwareArchitectPrompt,
  defaultScreenshotToCodePrompt,
  getDefaultMainCodingPrompt,
} from "@/lib/prompts";
import { MODELS, SUGGESTED_PROMPTS } from "@/lib/constants";

export default function AdminPage() {
  const defaults = {
    system_prompt_architect: defaultSoftwareArchitectPrompt,
    system_prompt_screenshot: defaultScreenshotToCodePrompt,
    system_prompt_coding: getDefaultMainCodingPrompt("none"),
    models: JSON.stringify(MODELS, null, 2),
    utility_model: "Qwen/Qwen3-Next-80B-A3B-Instruct",
    vision_model: "moonshotai/Kimi-K2.5",
    suggested_prompts: JSON.stringify(SUGGESTED_PROMPTS, null, 2),
    design_parameters: JSON.stringify(
      {
        colorPalette: "",
        typography: "",
        layoutRules: "",
        backgroundRules: "",
        additionalInstructions: "",
      },
      null,
      2,
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanel defaults={defaults} />
    </div>
  );
}
