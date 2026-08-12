"use client";

interface MemoryData {
  title: string;
  date: string;
  location: string;
  mood: string;
  description: string;
}

interface MemoryEditorProps {
  memory: MemoryData;
  onChange: (memory: MemoryData) => void;
}

const moods = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😂", label: "Funny" },
  { emoji: "❤️", label: "Love" },
  { emoji: "🥹", label: "Emotional" },
  { emoji: "✨", label: "Magical" },
  { emoji: "🌿", label: "Peaceful" },
];

const quickTypes = [
  { emoji: "🏖️", label: "Vacation" },
  { emoji: "🎂", label: "Birthday" },
  { emoji: "👨‍👩‍👧", label: "Family" },
  { emoji: "❤️", label: "Friends" },
  { emoji: "🎓", label: "Graduation" },
  { emoji: "🎉", label: "Celebration" },
];

export default function MemoryEditor({
  memory,
  onChange,
}: MemoryEditorProps) {
  const update = (field: keyof MemoryData, value: string) => {
    onChange({
      ...memory,
      [field]: value,
    });
  };

  const addQuickType = (type: string) => {
    const current = memory.description.trim();

    const addition = `This was a ${type.toLowerCase()} memory.`;

    if (current.includes(addition)) return;

    update(
      "description",
      current ? `${current}\n${addition}` : addition
    );
  };

  return (
    <div className="space-y-8">

      {/* TITLE */}

      <div>
        <label className="block text-lg font-bold text-gray-800 mb-2">
          📝 Memory Title
        </label>

        <input
          type="text"
          value={memory.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Example: Our Goa Adventure"
          maxLength={80}
          className="w-full rounded-2xl border-2 border-gray-200 px-5 py-4 text-lg text-gray-800 outline-none focus:border-blue-500"
        />

        <p className="text-right text-xs text-gray-400 mt-1">
          {memory.title.length}/80
        </p>
      </div>

      {/* DATE + LOCATION */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        <div>
          <label className="block text-lg font-bold text-gray-800 mb-2">
            📅 Date
          </label>

          <input
            type="date"
            value={memory.date}
            onChange={(e) => update("date", e.target.value)}
            className="w-full rounded-2xl border-2 border-gray-200 px-5 py-4 text-gray-800 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-lg font-bold text-gray-800 mb-2">
            📍 Location
          </label>

          <input
            type="text"
            value={memory.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Example: Goa, India"
            maxLength={80}
            className="w-full rounded-2xl border-2 border-gray-200 px-5 py-4 text-gray-800 outline-none focus:border-blue-500"
          />
        </div>

      </div>

      {/* QUICK MEMORY */}

      <div>
        <label className="block text-lg font-bold text-gray-800 mb-3">
          ⚡ Quick Memory
        </label>

        <p className="text-gray-500 mb-4">
          Choose what kind of memory this is.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

          {quickTypes.map((type) => (
            <button
              key={type.label}
              type="button"
              onClick={() => addQuickType(type.label)}
              className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-4 font-semibold text-gray-700 hover:border-pink-400 hover:bg-pink-50 transition"
            >
              <span className="text-2xl block">
                {type.emoji}
              </span>

              <span className="text-sm mt-1 block">
                {type.label}
              </span>
            </button>
          ))}

        </div>
      </div>

      {/* MOOD */}

      <div>
        <label className="block text-lg font-bold text-gray-800 mb-3">
          💭 How did it feel?
        </label>

        <div className="flex flex-wrap gap-3">

          {moods.map((mood) => {
            const selected = memory.mood === mood.label;

            return (
              <button
                key={mood.label}
                type="button"
                onClick={() => update("mood", mood.label)}
                className={`rounded-full px-5 py-3 font-semibold transition border-2 ${
                  selected
                    ? "border-pink-500 bg-pink-100 text-pink-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-pink-300"
                }`}
              >
                {mood.emoji} {mood.label}
              </button>
            );
          })}

        </div>
      </div>

      {/* DESCRIPTION */}

      <div>
        <label className="block text-lg font-bold text-gray-800 mb-2">
          ✍️ Tell Your Story
        </label>

        <textarea
          value={memory.description}
          onChange={(e) =>
            update("description", e.target.value)
          }
          placeholder="Tell us what happened, who was there, what you did, funny moments, special moments, or anything else you remember..."
          maxLength={1500}
          className="w-full min-h-[200px] rounded-2xl border-2 border-gray-200 px-5 py-4 text-lg text-gray-800 outline-none resize-none focus:border-blue-500"
        />

        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>
            The more you tell us, the better the story can be.
          </span>

          <span>
            {memory.description.length}/1500
          </span>
        </div>
      </div>

    </div>
  );
}