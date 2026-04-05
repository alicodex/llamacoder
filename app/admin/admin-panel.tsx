"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "prompts" | "design" | "models" | "apikeys" | "homepage";

const TABS: { id: Tab; label: string }[] = [
  { id: "prompts", label: "Prompts" },
  { id: "design", label: "Design" },
  { id: "models", label: "Models" },
  { id: "apikeys", label: "API Keys" },
  { id: "homepage", label: "Homepage" },
];

export default function AdminPanel({
  defaults,
}: {
  defaults: Record<string, string>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("prompts");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return {};
        }
        return r.json();
      })
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, [router]);

  async function saveSetting(key: string, value: string) {
    setSaving(key);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (res.ok) {
      if (value === "") {
        const next = { ...settings };
        delete next[key];
        setSettings(next);
      } else {
        setSettings((s) => ({ ...s, [key]: value }));
      }
      setToast(`Saved ${key}`);
      setTimeout(() => setToast(""), 2000);
    }
    setSaving(null);
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  function getValue(key: string): string {
    return settings[key] ?? "";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
        >
          Logout
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-md bg-green-600 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-200 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        {tab === "prompts" && (
          <PromptsTab
            settings={settings}
            defaults={defaults}
            getValue={getValue}
            saveSetting={saveSetting}
            saving={saving}
          />
        )}
        {tab === "design" && (
          <DesignTab
            settings={settings}
            defaults={defaults}
            getValue={getValue}
            saveSetting={saveSetting}
            saving={saving}
          />
        )}
        {tab === "models" && (
          <ModelsTab
            settings={settings}
            defaults={defaults}
            getValue={getValue}
            saveSetting={saveSetting}
            saving={saving}
          />
        )}
        {tab === "apikeys" && (
          <ApiKeysTab
            getValue={getValue}
            saveSetting={saveSetting}
            saving={saving}
          />
        )}
        {tab === "homepage" && (
          <HomepageTab
            settings={settings}
            defaults={defaults}
            getValue={getValue}
            saveSetting={saveSetting}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

// ----- Prompts Tab -----
function PromptsTab({
  defaults,
  getValue,
  saveSetting,
  saving,
}: {
  settings: Record<string, string>;
  defaults: Record<string, string>;
  getValue: (key: string) => string;
  saveSetting: (key: string, value: string) => Promise<void>;
  saving: string | null;
}) {
  const prompts = [
    {
      key: "system_prompt_architect",
      label: "Software Architect Prompt",
      desc: "Used for high-quality mode planning. Controls how the AI plans app architecture before coding.",
    },
    {
      key: "system_prompt_screenshot",
      label: "Screenshot-to-Code Prompt",
      desc: "Used when analyzing uploaded screenshots. Controls how the AI describes the UI for recreation.",
    },
    {
      key: "system_prompt_coding",
      label: "Main Coding Prompt",
      desc: "The main system prompt for code generation. Controls coding rules, design aesthetics, output format, and available libraries.",
    },
  ];

  return (
    <div className="space-y-8">
      <p className="text-sm text-gray-500">
        Customize the system prompts that control AI behavior. Leave empty to
        use the default prompt.
      </p>
      {prompts.map((p) => (
        <PromptEditor
          key={p.key}
          settingKey={p.key}
          label={p.label}
          description={p.desc}
          currentValue={getValue(p.key)}
          defaultValue={defaults[p.key]}
          onSave={saveSetting}
          saving={saving === p.key}
        />
      ))}
    </div>
  );
}

function PromptEditor({
  settingKey,
  label,
  description,
  currentValue,
  defaultValue,
  onSave,
  saving,
}: {
  settingKey: string;
  label: string;
  description: string;
  currentValue: string;
  defaultValue: string;
  onSave: (key: string, value: string) => Promise<void>;
  saving: boolean;
}) {
  const [value, setValue] = useState(currentValue);
  const isCustomized = currentValue !== "";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{label}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex gap-2">
          {isCustomized && (
            <button
              onClick={() => {
                setValue("");
                onSave(settingKey, "");
              }}
              className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200"
            >
              Reset to default
            </button>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              isCustomized
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isCustomized ? "Custom" : "Default"}
          </span>
        </div>
      </div>
      <textarea
        value={value || defaultValue}
        onChange={(e) => setValue(e.target.value)}
        rows={12}
        className="w-full rounded-md border border-gray-300 p-3 font-mono text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => onSave(settingKey, value)}
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

// ----- Design Tab -----
function DesignTab({
  defaults,
  getValue,
  saveSetting,
  saving,
}: {
  settings: Record<string, string>;
  defaults: Record<string, string>;
  getValue: (key: string) => string;
  saveSetting: (key: string, value: string) => Promise<void>;
  saving: string | null;
}) {
  const raw = getValue("design_parameters") || defaults.design_parameters;
  let params: Record<string, string> = {
    colorPalette: "",
    typography: "",
    layoutRules: "",
    backgroundRules: "",
    additionalInstructions: "",
  };
  try {
    params = { ...params, ...JSON.parse(raw) };
  } catch {
    // use defaults
  }

  const [form, setForm] = useState(params);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const fields = [
    {
      key: "colorPalette",
      label: "Color Palette",
      placeholder:
        'e.g., "Use deep navy blue and warm amber as primary colors, with soft cream backgrounds"',
      rows: 2,
    },
    {
      key: "typography",
      label: "Typography Style",
      placeholder:
        'e.g., "Minimal and modern, use Inter for body and Space Grotesk for headings"',
      rows: 2,
    },
    {
      key: "layoutRules",
      label: "Layout Rules",
      placeholder:
        'e.g., "Always use sidebar navigation with a fixed header. Content area should have max-width of 1200px."',
      rows: 3,
    },
    {
      key: "backgroundRules",
      label: "Background Rules",
      placeholder:
        'e.g., "Use dark backgrounds by default. Allow subtle gradients for hero sections."',
      rows: 2,
    },
    {
      key: "additionalInstructions",
      label: "Additional Design Instructions",
      placeholder:
        'e.g., "Include a footer with social links. Use rounded corners on all cards. Add subtle shadows."',
      rows: 4,
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        These parameters get injected into the main coding prompt to customize
        the visual style of generated code. They override the default design
        aesthetics section.
      </p>
      {fields.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {f.label}
          </label>
          <textarea
            value={form[f.key]}
            onChange={(e) => update(f.key, e.target.value)}
            rows={f.rows}
            placeholder={f.placeholder}
            className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      ))}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setForm({
              colorPalette: "",
              typography: "",
              layoutRules: "",
              backgroundRules: "",
              additionalInstructions: "",
            });
            saveSetting("design_parameters", "");
          }}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
        >
          Reset to defaults
        </button>
        <button
          onClick={() =>
            saveSetting("design_parameters", JSON.stringify(form))
          }
          disabled={saving === "design_parameters"}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving === "design_parameters" ? "Saving..." : "Save Design Parameters"}
        </button>
      </div>
    </div>
  );
}

// ----- Models Tab -----
function ModelsTab({
  defaults,
  getValue,
  saveSetting,
  saving,
}: {
  settings: Record<string, string>;
  defaults: Record<string, string>;
  getValue: (key: string) => string;
  saveSetting: (key: string, value: string) => Promise<void>;
  saving: string | null;
}) {
  const modelsRaw = getValue("models") || defaults.models;
  let models: { label: string; value: string; hidden?: boolean }[] = [];
  try {
    models = JSON.parse(modelsRaw);
  } catch {
    models = [];
  }

  const [list, setList] = useState(models);
  const [utilityModel, setUtilityModel] = useState(
    getValue("utility_model") || defaults.utility_model,
  );
  const [visionModel, setVisionModel] = useState(
    getValue("vision_model") || defaults.vision_model,
  );

  function addModel() {
    setList([...list, { label: "", value: "", hidden: false }]);
  }

  function removeModel(idx: number) {
    setList(list.filter((_, i) => i !== idx));
  }

  function updateModel(
    idx: number,
    field: string,
    val: string | boolean,
  ) {
    setList(list.map((m, i) => (i === idx ? { ...m, [field]: val } : m)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold text-gray-900">
          User-Selectable Models
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          These models appear in the dropdown on the homepage. Hidden models are
          still available but not shown by default.
        </p>
        <div className="space-y-3">
          {list.map((model, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-md border border-gray-200 p-3"
            >
              <input
                value={model.label}
                onChange={(e) => updateModel(idx, "label", e.target.value)}
                placeholder="Display name"
                className="w-40 rounded border border-gray-300 px-2 py-1 text-sm"
              />
              <input
                value={model.value}
                onChange={(e) => updateModel(idx, "value", e.target.value)}
                placeholder="Model ID (e.g. meta-llama/Llama-3.3-70B)"
                className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm font-mono"
              />
              <label className="flex items-center gap-1 text-sm text-gray-500">
                <input
                  type="checkbox"
                  checked={model.hidden ?? false}
                  onChange={(e) =>
                    updateModel(idx, "hidden", e.target.checked)
                  }
                />
                Hidden
              </label>
              <button
                onClick={() => removeModel(idx)}
                className="text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addModel}
          className="mt-3 rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
        >
          + Add Model
        </button>
      </div>

      <hr />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Utility Model (title generation, example matching)
          </label>
          <input
            value={utilityModel}
            onChange={(e) => setUtilityModel(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Vision Model (screenshot analysis)
          </label>
          <input
            value={visionModel}
            onChange={(e) => setVisionModel(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setList(JSON.parse(defaults.models));
            setUtilityModel(defaults.utility_model);
            setVisionModel(defaults.vision_model);
            saveSetting("models", "");
            saveSetting("utility_model", "");
            saveSetting("vision_model", "");
          }}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
        >
          Reset to defaults
        </button>
        <button
          onClick={async () => {
            await saveSetting("models", JSON.stringify(list));
            await saveSetting("utility_model", utilityModel);
            await saveSetting("vision_model", visionModel);
          }}
          disabled={saving !== null}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Models"}
        </button>
      </div>
    </div>
  );
}

// ----- API Keys Tab -----
function ApiKeysTab({
  getValue,
  saveSetting,
  saving,
}: {
  getValue: (key: string) => string;
  saveSetting: (key: string, value: string) => Promise<void>;
  saving: string | null;
}) {
  const [togetherKey, setTogetherKey] = useState("");
  const [heliconeKey, setHeliconeKey] = useState("");

  const currentTogether = getValue("together_api_key");
  const currentHelicone = getValue("helicone_api_key");

  const keys = [
    {
      key: "together_api_key",
      label: "Together AI API Key",
      desc: "Overrides the TOGETHER_API_KEY environment variable at runtime.",
      current: currentTogether,
      value: togetherKey,
      setter: setTogetherKey,
    },
    {
      key: "helicone_api_key",
      label: "Helicone API Key",
      desc: "Overrides the HELICONE_API_KEY environment variable. Optional, for observability.",
      current: currentHelicone,
      value: heliconeKey,
      setter: setHeliconeKey,
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        API keys stored here override the environment variables. Keys are stored
        in the database and masked in the UI. Leave empty and save to clear a
        stored key (will fall back to env var).
      </p>
      {keys.map((k) => (
        <div key={k.key} className="rounded-md border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900">{k.label}</h3>
          <p className="mb-3 text-sm text-gray-500">{k.desc}</p>
          {k.current && (
            <p className="mb-2 font-mono text-sm text-gray-400">
              Current: {k.current}
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="password"
              value={k.value}
              onChange={(e) => k.setter(e.target.value)}
              placeholder="Enter new key (or leave empty to clear)"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              onClick={() => saveSetting(k.key, k.value)}
              disabled={saving === k.key}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving === k.key ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ----- Homepage Tab -----
function HomepageTab({
  defaults,
  getValue,
  saveSetting,
  saving,
}: {
  settings: Record<string, string>;
  defaults: Record<string, string>;
  getValue: (key: string) => string;
  saveSetting: (key: string, value: string) => Promise<void>;
  saving: string | null;
}) {
  const raw = getValue("suggested_prompts") || defaults.suggested_prompts;
  let prompts: { title: string; description: string }[] = [];
  try {
    prompts = JSON.parse(raw);
  } catch {
    prompts = [];
  }

  const [list, setList] = useState(prompts);

  function addPrompt() {
    setList([...list, { title: "", description: "" }]);
  }

  function removePrompt(idx: number) {
    setList(list.filter((_, i) => i !== idx));
  }

  function updatePrompt(idx: number, field: string, val: string) {
    setList(list.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold text-gray-900">Suggested Prompts</h3>
        <p className="mb-4 text-sm text-gray-500">
          These appear as example cards on the homepage for users to try.
        </p>
        <div className="space-y-3">
          {list.map((prompt, idx) => (
            <div
              key={idx}
              className="rounded-md border border-gray-200 p-3"
            >
              <div className="mb-2 flex items-center gap-3">
                <input
                  value={prompt.title}
                  onChange={(e) => updatePrompt(idx, "title", e.target.value)}
                  placeholder="Card title (e.g. Quiz app)"
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm font-medium"
                />
                <button
                  onClick={() => removePrompt(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              </div>
              <textarea
                value={prompt.description}
                onChange={(e) =>
                  updatePrompt(idx, "description", e.target.value)
                }
                rows={2}
                placeholder="Full prompt description..."
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
        <button
          onClick={addPrompt}
          className="mt-3 rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
        >
          + Add Prompt
        </button>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setList(JSON.parse(defaults.suggested_prompts));
            saveSetting("suggested_prompts", "");
          }}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
        >
          Reset to defaults
        </button>
        <button
          onClick={() =>
            saveSetting("suggested_prompts", JSON.stringify(list))
          }
          disabled={saving === "suggested_prompts"}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving === "suggested_prompts" ? "Saving..." : "Save Prompts"}
        </button>
      </div>
    </div>
  );
}
