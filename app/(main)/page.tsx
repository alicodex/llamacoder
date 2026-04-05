import { getModels, getSuggestedPrompts } from "@/lib/constants.server";
import Home from "./home-client";

export default async function HomePage() {
  const [models, suggestedPrompts] = await Promise.all([
    getModels(),
    getSuggestedPrompts(),
  ]);

  return <Home models={models} suggestedPrompts={suggestedPrompts} />;
}
