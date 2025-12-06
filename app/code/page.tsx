"use client";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "../_context/LanguageContext";

interface TechStack {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  color: string;
  template: string; // GitHub template repo
}

interface ExtensionPack {
  id: string;
  name: string;
  nameEn: string;
  extensions: string[];
}

const techStacks: TechStack[] = [
  {
    id: "react",
    name: "React / Next.js",
    nameEn: "React / Next.js",
    description: "Modern web uygulamaları için React framework",
    descriptionEn: "React framework for modern web applications",
    icon: "⚛️",
    color: "bg-neo-cyan",
    template: "github/codespaces-react",
  },
  {
    id: "python",
    name: "Python",
    nameEn: "Python",
    description: "Flask, Django veya data science projeleri",
    descriptionEn: "Flask, Django or data science projects",
    icon: "🐍",
    color: "bg-neo-yellow",
    template: "github/codespaces-jupyter",
  },
  {
    id: "node",
    name: "Node.js",
    nameEn: "Node.js",
    description: "Express, API ve backend projeleri",
    descriptionEn: "Express, API and backend projects",
    icon: "🟢",
    color: "bg-neo-green",
    template: "github/codespaces-express",
  },
  {
    id: "blank",
    name: "Boş Proje",
    nameEn: "Blank Project",
    description: "Sıfırdan başla, istediğini kur",
    descriptionEn: "Start from scratch, install what you want",
    icon: "📝",
    color: "bg-neo-purple",
    template: "github/codespaces-blank",
  },
];

const extensionPacks: ExtensionPack[] = [
  {
    id: "essentials",
    name: "Temel Araçlar",
    nameEn: "Essentials",
    extensions: ["Prettier", "ESLint", "GitLens", "Error Lens"],
  },
  {
    id: "frontend",
    name: "Frontend",
    nameEn: "Frontend",
    extensions: ["Tailwind CSS", "React Snippets", "Auto Rename Tag"],
  },
  {
    id: "backend",
    name: "Backend",
    nameEn: "Backend",
    extensions: ["REST Client", "Docker", "Thunder Client"],
  },
  {
    id: "python",
    name: "Python",
    nameEn: "Python",
    extensions: ["Python", "Pylance", "Jupyter"],
  },
];

export default function CodePage() {
  const [repoType, setRepoType] = useState<"new" | "existing">("new");
  const [selectedStack, setSelectedStack] = useState<string>("react");
  const [existingRepo, setExistingRepo] = useState("");
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>(["essentials"]);
  const { language } = useLanguage();

  const labels = {
    tr: {
      title: "Kodlamaya Başla",
      subtitle: "GitHub Codespaces ile anında geliştirme ortamına sahip ol",
      repoTypeTitle: "Proje Türü",
      newRepo: "Yeni Proje",
      newRepoDesc: "Hazır şablon ile başla",
      existingRepo: "Mevcut Repo",
      existingRepoDesc: "GitHub reposunu aç",
      repoPlaceholder: "owner/repo-name",
      stackTitle: "Teknoloji Seç",
      extensionsTitle: "Önerilen Eklentiler",
      extensionsNote: "Codespace açıldıktan sonra manuel kurulum yapabilirsin",
      launch: "Codespace Başlat",
      launchIcon: "🚀",
      githubNote: "GitHub hesabı gerekli - Ücretsiz plan 60 saat/ay",
      backHome: "← Ana Sayfa",
    },
    en: {
      title: "Start Coding",
      subtitle: "Get instant development environment with GitHub Codespaces",
      repoTypeTitle: "Project Type",
      newRepo: "New Project",
      newRepoDesc: "Start with a ready template",
      existingRepo: "Existing Repo",
      existingRepoDesc: "Open GitHub repository",
      repoPlaceholder: "owner/repo-name",
      stackTitle: "Select Technology",
      extensionsTitle: "Recommended Extensions",
      extensionsNote: "Manual installation after Codespace opens",
      launch: "Launch Codespace",
      launchIcon: "🚀",
      githubNote: "GitHub account required - Free plan 60 hours/month",
      backHome: "← Home",
    },
  };

  const l = labels[language] || labels.tr;

  const toggleExtension = (id: string) => {
    setSelectedExtensions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const generateCodespaceUrl = () => {
    if (repoType === "existing" && existingRepo.trim()) {
      // Format: https://github.com/codespaces/new?repo=owner/repo
      const repo = existingRepo.trim().replace(/^https?:\/\/github\.com\//, "");
      return `https://github.com/codespaces/new/${repo}`;
    } else {
      // Use template
      const stack = techStacks.find((s) => s.id === selectedStack);
      if (stack) {
        return `https://github.com/codespaces/new/${stack.template}`;
      }
      return "https://github.com/codespaces";
    }
  };

  const handleLaunch = () => {
    const url = generateCodespaceUrl();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen mt-2 bg-neo-lime pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-4xl mt-4 mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="inline-block text-4xl sm:text-5xl font-black text-black mb-4 bg-white border-4 border-black shadow-neo px-6 py-3 transform -rotate-1">
            {l.title}
          </h1>
          <p className="text-xl font-bold text-black mt-6 max-w-2xl mx-auto">
            {l.subtitle}
          </p>
        </div>

        {/* Step 1: Repo Type */}
        <section className="mb-10">
          <h2 className="text-2xl font-black text-black mb-4 uppercase">
            1. {l.repoTypeTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setRepoType("new")}
              className={`p-6 border-4 border-black text-left transition-all ${
                repoType === "new"
                  ? "bg-neo-green shadow-neo-lg -translate-y-1"
                  : "bg-white shadow-neo hover:-translate-y-1"
              }`}
            >
              <div className="text-3xl mb-2">✨</div>
              <div className="text-xl font-black text-black">{l.newRepo}</div>
              <div className="text-sm font-medium text-black/70">{l.newRepoDesc}</div>
            </button>
            <button
              onClick={() => setRepoType("existing")}
              className={`p-6 border-4 border-black text-left transition-all ${
                repoType === "existing"
                  ? "bg-neo-blue shadow-neo-lg -translate-y-1"
                  : "bg-white shadow-neo hover:-translate-y-1"
              }`}
            >
              <div className="text-3xl mb-2">📂</div>
              <div className="text-xl font-black text-black">{l.existingRepo}</div>
              <div className="text-sm font-medium text-black/70">{l.existingRepoDesc}</div>
            </button>
          </div>

          {/* Existing repo input */}
          {repoType === "existing" && (
            <div className="mt-4">
              <input
                type="text"
                value={existingRepo}
                onChange={(e) => setExistingRepo(e.target.value)}
                placeholder={l.repoPlaceholder}
                className="w-full px-4 py-3 border-4 border-black bg-white font-bold text-black placeholder:text-gray-400 focus:outline-none focus:shadow-neo"
              />
            </div>
          )}
        </section>

        {/* Step 2: Tech Stack (only for new projects) */}
        {repoType === "new" && (
          <section className="mb-10">
            <h2 className="text-2xl font-black text-black mb-4 uppercase">
              2. {l.stackTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {techStacks.map((stack) => (
                <button
                  key={stack.id}
                  onClick={() => setSelectedStack(stack.id)}
                  className={`p-5 border-4 border-black text-left transition-all ${
                    selectedStack === stack.id
                      ? `${stack.color} shadow-neo-lg -translate-y-1`
                      : "bg-white shadow-neo hover:-translate-y-1"
                  }`}
                >
                  <div className="text-3xl mb-2">{stack.icon}</div>
                  <div className="text-lg font-black text-black">
                    {language === "en" ? stack.nameEn : stack.name}
                  </div>
                  <div className="text-sm font-medium text-black/70">
                    {language === "en" ? stack.descriptionEn : stack.description}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 3: Extensions */}
        <section className="mb-10">
          <h2 className="text-2xl font-black text-black mb-2 uppercase">
            {repoType === "new" ? "3." : "2."} {l.extensionsTitle}
          </h2>
          <p className="text-sm font-medium text-black/60 mb-4">{l.extensionsNote}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {extensionPacks.map((pack) => (
              <button
                key={pack.id}
                onClick={() => toggleExtension(pack.id)}
                className={`p-4 border-4 border-black text-left transition-all ${
                  selectedExtensions.includes(pack.id)
                    ? "bg-neo-pink shadow-neo"
                    : "bg-white shadow-neo-sm hover:shadow-neo"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 border-2 aspect-square border-black flex items-center justify-center ${
                      selectedExtensions.includes(pack.id) ? "bg-black" : "bg-white"
                    }`}
                  >
                    {selectedExtensions.includes(pack.id) && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </div>
                  <div>
                    <div className="font-black text-black">
                      {language === "en" ? pack.nameEn : pack.name}
                    </div>
                    <div className="text-xs text-black/60">
                      {pack.extensions.join(", ")}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Launch Button */}
        <div className="text-center">
          <button
            onClick={handleLaunch}
            disabled={repoType === "existing" && !existingRepo.trim()}
            className={`px-10 py-5 p-2 text-2xl font-black uppercase border-4 border-black transition-all ${
              repoType === "existing" && !existingRepo.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-neo-green text-black shadow-neo hover:-translate-y-1 hover:shadow-neo-lg active:translate-y-0 active:shadow-none"
            }`}
          >
            {l.launch}
          </button>
          <p className="m-4 text-sm font-medium text-black/60">{l.githubNote}</p>
        </div>
      </div>
    </main>
  );
}
