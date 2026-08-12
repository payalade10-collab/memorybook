"use client";

export interface ScrapbookTheme {
  id: string;
  name: string;
  emoji: string;
  description: string;

  pageClass: string;
  cardClass: string;
  headingClass: string;
  accentClass: string;
}

export const scrapbookThemes: ScrapbookTheme[] = [
  {
    id: "sweet",
    name: "Sweet Memories",
    emoji: "🌸",
    description: "Soft, warm and full of love",

    pageClass:
      "bg-gradient-to-br from-pink-100 via-white to-yellow-50",

    cardClass:
      "bg-white border-pink-200",

    headingClass:
      "text-pink-700",

    accentClass:
      "bg-pink-600 text-white",
  },

  {
    id: "travel",
    name: "Travel Journal",
    emoji: "✈️",
    description: "Perfect for adventures and trips",

    pageClass:
      "bg-gradient-to-br from-sky-100 via-white to-emerald-50",

    cardClass:
      "bg-white border-sky-200",

    headingClass:
      "text-sky-700",

    accentClass:
      "bg-sky-600 text-white",
  },

  {
    id: "polaroid",
    name: "Polaroid",
    emoji: "📸",
    description: "Classic photo-memory style",

    pageClass:
      "bg-gradient-to-br from-gray-100 via-white to-gray-200",

    cardClass:
      "bg-white border-gray-300",

    headingClass:
      "text-gray-800",

    accentClass:
      "bg-gray-800 text-white",
  },

  {
    id: "vintage",
    name: "Vintage",
    emoji: "📜",
    description: "Old-school scrapbook feeling",

    pageClass:
      "bg-gradient-to-br from-amber-100 via-[#fffaf0] to-orange-50",

    cardClass:
      "bg-[#fffdf7] border-amber-300",

    headingClass:
      "text-amber-800",

    accentClass:
      "bg-amber-700 text-white",
  },

  {
    id: "minimal",
    name: "Minimal",
    emoji: "✨",
    description: "Clean, elegant and simple",

    pageClass:
      "bg-gradient-to-br from-white via-gray-50 to-slate-100",

    cardClass:
      "bg-white border-gray-200",

    headingClass:
      "text-gray-900",

    accentClass:
      "bg-black text-white",
  },

  {
    id: "colorful",
    name: "Colorful",
    emoji: "🌈",
    description: "Bright, playful and joyful",

    pageClass:
      "bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100",

    cardClass:
      "bg-white border-purple-200",

    headingClass:
      "text-purple-700",

    accentClass:
      "bg-purple-600 text-white",
  },
];

interface ThemeSelectorProps {
  selectedTheme: ScrapbookTheme;
  onThemeChange: (theme: ScrapbookTheme) => void;
}

export default function ThemeSelector({
  selectedTheme,
  onThemeChange,
}: ThemeSelectorProps) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-gray-900">
          🎨 Choose Your Style
        </h2>

        <p className="text-gray-500 mt-1">
          Pick the look and feeling of your scrapbook.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scrapbookThemes.map((theme) => {
          const selected = selectedTheme.id === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onThemeChange(theme)}
              className={`text-left rounded-3xl border-2 p-5 transition-all ${
                selected
                  ? "border-pink-500 ring-4 ring-pink-100 scale-[1.02]"
                  : "border-gray-200 hover:border-pink-300 hover:shadow-lg"
              }`}
            >
              {/* Theme preview */}

              <div
                className={`h-28 rounded-2xl ${theme.pageClass} border p-4 relative overflow-hidden`}
              >
                <div
                  className={`absolute top-3 left-3 h-5 w-16 rounded-full ${
                    theme.accentClass
                  }`}
                />

                <div
                  className={`absolute bottom-3 left-3 right-3 h-12 rounded-xl border ${theme.cardClass}`}
                />

                <div className="absolute top-4 right-4 text-3xl">
                  {theme.emoji}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <h3 className="font-black text-lg text-gray-900">
                    {theme.emoji} {theme.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {theme.description}
                  </p>
                </div>

                {selected && (
                  <div className="flex-shrink-0 ml-3 h-8 w-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-black">
                    ✓
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}