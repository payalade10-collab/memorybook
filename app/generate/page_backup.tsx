"use client";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { useRef, useState } from "react";
import ImageUpload from "../components/ImageUpload";

const scrapbookTemplates = [
  {
    title: "🌍 Journey to the Clouds",
    quote:
      "Some places stay in our camera. The best ones stay in our hearts.",
    story:
      "Every journey begins with a dream. These memories remind us that the most beautiful destinations are the ones we experience together.",
  },
  {
    title: "🏖️ Waves of Happiness",
    quote:
      "Life is better with sandy feet and happy hearts.",
    story:
      "The sound of the waves, the warmth of the sun and the laughter shared made every moment unforgettable.",
  },
  {
    title: "❤️ Moments with Family",
    quote:
      "Family is where life's greatest memories begin.",
    story:
      "The most valuable memories are not about places but about the people beside us.",
  },
];

export default function GeneratePage() {
  const coverRef = useRef<HTMLDivElement>(null);
const collageRef = useRef<HTMLDivElement>(null);
const storyRef = useRef<HTMLDivElement>(null);
const thankYouRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showScrapbook, setShowScrapbook] = useState(false);

  const [memoryPrompt, setMemoryPrompt] = useState("");
  const [aiStory, setAiStory] = useState("");

  const [template, setTemplate] =
    useState(scrapbookTemplates[0]);

  const price = images.length * 5;

  const addImage = (file: File) => {
    if (images.length >= 5) {
      alert("Maximum 5 photos allowed.");
      return;
    }

    setImages((prev) => [...prev, file]);

    const reader = new FileReader();

    reader.onload = () => {
      setImageUrls((prev) => [
        ...prev,
        reader.result as string,
      ]);
    };

    reader.readAsDataURL(file);
  };
    const generateScrapbook = () => {
    if (images.length === 0) {
      alert("Upload at least one photo.");
      return;
    }

    if (!memoryPrompt.trim()) {
      alert("Please tell about your memories.");
      return;
    }

    setShowPayment(true);
  };
 const downloadScrapbook = () => {
  window.print();
};
  return (
    <main className="min-h-screen bg-white py-10">
      <h1 className="text-5xl font-extrabold text-center text-blue-700">
        📖 Memora
      </h1>

      <p className="text-center text-gray-600 mt-3 text-lg">
        Upload your memories and let us create your scrapbook.
      </p>

      <div className="max-w-4xl mx-auto mt-10">

        <ImageUpload onImageSelected={addImage} />

        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-blue-200 p-6">

          <label className="block text-2xl font-bold text-gray-800 mb-4">
            ✍️ Tell about these memories
          </label>

          <textarea
  value={memoryPrompt}
  onChange={(e) => setMemoryPrompt(e.target.value)}
  placeholder="Happy memories..."
  className="w-full h-44 rounded-2xl border-2 border-blue-300 p-5 text-lg text-gray-800 placeholder:text-gray-500 placeholder:font-medium"
/>

        </div>
                <div className="mt-8 bg-white rounded-3xl shadow-xl border border-green-200 p-6">

          <h2 className="text-2xl font-bold text-center text-blue-700">
            📷 Uploaded Photos
          </h2>

          <p className="mt-4 text-center text-xl font-semibold text-gray-700">
            {images.length} / 5 Photos
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`preview-${index}`}
                className="w-24 h-24 rounded-xl object-cover shadow-lg border-2 border-white"
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <h2 className="text-4xl font-extrabold text-green-600">
              ₹{price}
            </h2>

            <p className="text-gray-500 mt-2">
              ₹1 per uploaded photo
            </p>
          </div>

        </div>

        <button
          onClick={generateScrapbook}
          disabled={loading}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-2xl p-4 transition-all"
        >
          {loading
            ? "🤖 Creating Scrapbook..."
            : `💳 Pay ₹${price} & Generate Scrapbook`}
        </button>

        {showPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white rounded-3xl shadow-2xl p-8 w-[380px]">

              <h2 className="text-3xl font-bold text-center text-blue-700">
                💳 Memora
              </h2>

              <p className="text-center text-gray-500 mt-3">
                Secure Payment Gateway
              </p>

              <div className="mt-8 text-center">

                <h1 className="text-5xl font-bold text-green-600">
                  ₹{price}
                </h1>

                <select className="w-full mt-6 border rounded-xl p-3">
                  <option>💳 Credit / Debit Card</option>
                  <option>📱 UPI</option>
                  <option>🏦 Net Banking</option>
                </select>

              </div>
                            <button
                onClick={async () => {
                  setShowPayment(false);
                  setLoading(true);

                  try {
                    const response = await fetch("/api/generate-story", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        memoryPrompt,
                      }),
                    });

                    const data = await response.json();

                    setAiStory(data.story);

                    const randomTemplate =
                      scrapbookTemplates[
                        Math.floor(Math.random() * scrapbookTemplates.length)
                      ];

                    setTemplate(randomTemplate);

                    setShowScrapbook(true);

                  } catch (error) {
                    console.error(error);
                    alert("Failed to generate story.");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl text-xl font-bold"
              >
                ✅ Pay Now
              </button>

              <button
                onClick={() => setShowPayment(false)}
                className="w-full mt-3 border border-gray-300 rounded-xl p-3"
              >
                Cancel
              </button>

            </div>
          </div>
        )}

        {showScrapbook && (
          <div
  ref={collageRef}
  className="relative mt-16 bg-gradient-to-br from-[#fffaf0] via-[#fff5ec] to-[#fff8f3] rounded-[40px] shadow-2xl border-[8px] border-yellow-300 p-10 max-w-5xl mx-auto overflow-hidden"
>
  {/* Scrapbook Decorations */}

<div className="absolute top-6 left-6 text-5xl">🌸</div>

<div className="absolute top-10 right-10 text-5xl">✨</div>

<div className="absolute bottom-10 left-10 text-5xl">🍃</div>

<div className="absolute bottom-8 right-8 text-5xl">❤️</div>

<div className="absolute top-1/2 left-3 text-4xl">📷</div>

<div className="absolute top-1/2 right-3 text-4xl">🎀</div>

            {/* COVER PAGE */}

            {/* COVER PAGE */}

{/* COVER PAGE */}

<div ref={coverRef}>

<div className="bg-pink-100 rounded-3xl shadow-xl p-12 text-center border-4 border-yellow-300"></div>

  {/* Decorations */}

  <div className="absolute top-6 left-8 text-6xl">🌸</div>
  <div className="absolute top-8 right-8 text-6xl">✨</div>
  <div className="absolute bottom-8 left-8 text-6xl">📸</div>
  <div className="absolute bottom-8 right-8 text-6xl">❤️</div>

  <h1 className="text-7xl font-black text-pink-700 drop-shadow-lg">
    📖 MEMORA
  </h1>

  <p className="mt-6 text-3xl font-bold text-gray-700">
    My Memory Scrapbook
  </p>

  <div className="mt-12 text-8xl">
    🌸 📸 🌸
  </div>

  <div className="mt-14 bg-white/80 rounded-3xl p-8 shadow-xl">

    <p className="italic text-2xl text-gray-700">
      "{template.quote}"
    </p>

  </div>

  <div className="mt-14 border-t-2 border-dashed border-pink-300 pt-8">

    <p className="text-xl font-semibold text-gray-600">
      Created with ❤️ using Memora
    </p>

    <p className="mt-2 text-gray-500">
      {new Date().toLocaleDateString()}
    </p>

  </div>

            </div>

            <div className="h-20"></div>
            {/* PHOTO COLLAGE */}
            <div className="text-center mb-14">
  <h2 className="text-5xl font-extrabold text-pink-700">
    📸 Our Beautiful Memories
  </h2>

  <p className="mt-4 text-gray-600 italic text-xl">
    Every picture tells a story...
  </p>

  <div className="mt-5 text-3xl">
    🌸 ✨ 💖 ✨ 🌸
  </div>
</div>

<div
  className={`relative ${
    imageUrls.length === 1
      ? "min-h-[520px]"
      : imageUrls.length === 2
      ? "min-h-[550px]"
      : imageUrls.length === 3
      ? "min-h-[700px]"
      : imageUrls.length === 4
      ? "min-h-[850px]"
      : "min-h-[950px]"
  }`}
>

  {imageUrls.map((url, index) => {

    const layoutMap: Record<number, string[]> = {
  1: [
    "top-20 left-1/2 -translate-x-1/2",
  ],

  2: [
    "top-20 left-10",
    "top-20 right-10",
  ],

  3: [
    "top-0 left-1/2 -translate-x-1/2",
    "top-[320px] left-10",
    "top-[320px] right-10",
  ],

  4: [
    "top-0 left-10",
    "top-0 right-10",
    "top-[340px] left-10",
    "top-[340px] right-10",
  ],

  5: [
    "top-0 left-4 rotate-[-8deg]",
    "top-8 right-6 rotate-[8deg]",
    "top-[320px] left-20 rotate-[-6deg]",
    "top-[380px] right-10 rotate-[6deg]",
    "top-[680px] left-1/2 -translate-x-1/2 rotate-[2deg]",
  ],
};

const layouts = layoutMap[imageUrls.length];

    const tapeColors = [
      "bg-yellow-200",
      "bg-pink-200",
      "bg-blue-200",
      "bg-green-200",
      "bg-orange-200",
    ];

    return (

      <div
        key={index}
       className={`absolute ${
  imageUrls.length === 1
    ? "top-10 left-1/2 -translate-x-1/2 w-[600px]"
    : layouts[index] + " w-72"
}
bg-white
p-4
rounded-xl
border-4
border-white
shadow-[0_15px_35px_rgba(0,0,0,0.25)]
hover:scale-105
hover:rotate-0
transition-all
duration-500`}
       
      >

        {/* Tape */}

       {/* Push Pin */}

<div className="absolute -top-5 left-1/2 -translate-x-1/2 text-5xl z-20">
  📍
</div>

<div className="bg-white rounded-lg border border-gray-200 shadow-xl p-4">

  <img
    src={url}
    className={`w-full ${
  imageUrls.length === 1 ? "h-[450px]" : "h-56"
}
rounded-lg
object-cover
border-2
border-gray-100`}
  />

  <div className="mt-5 text-center">

   <p className="mt-3 text-center font-handwriting text-lg text-pink-600">
Beautiful Moment
</p>

    <p className="text-gray-900 italic mt-2">
      Captured Forever
    </p>

  </div>

</div>

        <p className="mt-4 text-center italic text-gray-700 font-semibold">
        </p>

      </div>

    );

  })}

</div>

<div className="flex justify-center my-20 text-5xl">
  🌸 ✨ ❤️ 🌸 ✨
</div>

{/* STORY */}

<div className="bg-[#fffaf0] rounded-3xl border-4 border-yellow-300 shadow-2xl p-12 relative overflow-hidden">

  <div className="absolute top-5 left-5 text-5xl">🌸</div>
  <div className="absolute top-5 right-5 text-5xl">✨</div>
  <div className="absolute bottom-5 left-5 text-5xl">❤️</div>
  <div className="absolute bottom-5 right-5 text-5xl">🌼</div>

  <h2 className="text-5xl font-extrabold text-center text-pink-700">
    📖 Memories to Cherish
  </h2>

  <p className="text-center italic text-gray-500 mt-4">
    Written by Memora❤️
  </p>

  <div className="mt-10 bg-white rounded-2xl shadow-lg p-10 border-l-8 border-pink-300">

    <p className="text-xl leading-10 text-gray-700 italic whitespace-pre-line">
      {aiStory || template.story}
    </p>

  </div>

</div>

{/* THANK YOU */}

<div className="mt-20 bg-pink-100 rounded-3xl p-16 text-center shadow-xl">

  <div className="text-7xl">
    ❤️
  </div>

  <h2 className="text-5xl font-extrabold text-pink-700 mt-6">
    Thank You
  </h2>

  <p className="text-2xl mt-6 text-gray-700">
    Every Memory deserves a Beautiful Story.
  </p>

  <p className="italic mt-10 text-xl text-gray-500">
    Created with ❤️ using Memora
  </p>

</div>

<button
  onClick={downloadScrapbook}
  className="mt-12 w-full bg-green-600 text-white text-2xl font-bold py-5 rounded-2xl shadow-xl hover:scale-105 transition"
>
  📄 Save Scrapbook as PDF

</button>

</div>
)}

</div>

</main>
);
}
          