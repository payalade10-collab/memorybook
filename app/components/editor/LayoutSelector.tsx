"use client";

export interface ScrapbookLayout {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const scrapbookLayouts: ScrapbookLayout[] = [
  {
    id: "classic",
    name: "Classic Collage",
    emoji: "🖼️",
    description: "Balanced scrapbook-style arrangement",
  },
  {
    id: "polaroid",
    name: "Polaroid Wall",
    emoji: "📸",
    description: "Photos arranged like hanging memories",
  },
  {
    id: "grid",
    name: "Clean Grid",
    emoji: "▦",
    description: "Simple and organized photo grid",
  },
  {
    id: "scattered",
    name: "Scattered",
    emoji: "✨",
    description: "Playful overlapping photo arrangement",
  },
  {
    id: "hero",
    name: "Hero Photo",
    emoji: "⭐",
    description: "One large photo with smaller memories",
  },
];

interface LayoutSelectorProps {
  selectedLayout: ScrapbookLayout;
  onLayoutChange: (layout: ScrapbookLayout) => void;
}

function LayoutPreview({
  layout,
}: {
  layout: ScrapbookLayout;
}) {
  if (layout.id === "grid") {
    return (
      <div className="grid grid-cols-2 gap-2 h-full">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-lg bg-white border border-gray-300"
          />
        ))}
      </div>
    );
  }

  if (layout.id === "hero") {
    return (
      <div className="grid grid-cols-3 gap-2 h-full">
        <div className="col-span-2 rounded-lg bg-white border border-gray-300" />

        <div className="flex flex-col gap-2">
          <div className="flex-1 rounded-lg bg-white border border-gray-300" />
          <div className="flex-1 rounded-lg bg-white border border-gray-300" />
        </div>
      </div>
    );
  }

  if (layout.id === "polaroid") {
    return (
      <div className="relative h-full">
        <div className="absolute left-3 top-3 w-20 h-20 bg-white border-4 border-white shadow-md rotate-[-6deg]" />

        <div className="absolute right-3 top-4 w-20 h-20 bg-white border-4 border-white shadow-md rotate-[5deg]" />

        <div className="absolute left-1/2 bottom-1 -translate-x-1/2 w-24 h-24 bg-white border-4 border-white shadow-md rotate-[-2deg]" />
      </div>
    );
  }

  if (layout.id === "scattered") {
    return (
      <div className="relative h-full">
        <div className="absolute left-4 top-4 w-20 h-24 rounded-lg bg-white border border-gray-300 rotate-[-8deg] shadow-md" />

        <div className="absolute right-4 top-2 w-20 h-24 rounded-lg bg-white border border-gray-300 rotate-[7deg] shadow-md" />

        <div className="absolute left-1/2 bottom-2 -translate-x-1/2 w-24 h-24 rounded-lg bg-white border border-gray-300 rotate-[-3deg] shadow-md" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 h-full">
      <div className="rounded-lg bg-white border border-gray-300" />

      <div className="rounded-lg bg-white border border-gray-300" />

      <div className="col-span-2 w-2/3 mx-auto rounded-lg bg-white border border-gray-300" />
    </div>
  );
}

export default function LayoutSelector({
  selectedLayout,
  onLayoutChange,
}: LayoutSelectorProps) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-gray-900">
          🖼️ Choose Your Layout
        </h2>

        <p className="text-gray-500 mt-1">
          Decide how your photos should appear.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scrapbookLayouts.map((layout) => {
          const selected =
            selectedLayout.id === layout.id;

          return (
            <button
              key={layout.id}
              type="button"
              onClick={() =>
                onLayoutChange(layout)
              }
              className={`text-left rounded-3xl border-2 p-4 transition-all ${
                selected
                  ? "border-blue-500 ring-4 ring-blue-100 scale-[1.02]"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-lg"
              }`}
            >
              <div className="h-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-3 overflow-hidden">
                <LayoutPreview layout={layout} />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <h3 className="font-black text-lg text-gray-900">
                    {layout.emoji} {layout.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {layout.description}
                  </p>
                </div>

                {selected && (
                  <div className="flex-shrink-0 ml-3 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">
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