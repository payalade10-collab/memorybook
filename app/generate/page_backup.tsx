"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import ImageUpload from "../components/ImageUpload";

const scrapbookTemplates = [
  {
    title: "🌍 Journey to the Clouds",
    quote:
      "Some places stay in our camera. The best ones stay in our hearts.",
  },
  {
    title: "🏖️ Waves of Happiness",
    quote:
      "Life is better with sandy feet and happy hearts.",
  },
  {
    title: "❤️ Moments with Family",
    quote:
      "Family is where life's greatest memories begin.",
  },
];

export default function GeneratePage() {
  const scrapbookRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [memoryPrompt, setMemoryPrompt] = useState("");
  const [aiStory, setAiStory] = useState("");

  const [loading, setLoading] = useState(false);

  const [showPayment, setShowPayment] = useState(false);

  const [showScrapbook, setShowScrapbook] = useState(false);

  const [template, setTemplate] = useState(scrapbookTemplates[0]);

  const price = images.length * 1;

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
      alert("Tell us about your memories.");
      return;
    }

    setShowPayment(true);
  };

  const generateStory = async () => {
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

      setTemplate(
        scrapbookTemplates[
          Math.floor(Math.random() * scrapbookTemplates.length)
        ]
      );

      setShowScrapbook(true);
    } catch (err) {
      console.error(err);
      alert("Failed to generate story.");
    }

    setLoading(false);
  };

  const downloadScrapbook = async () => {
    if (!scrapbookRef.current) return;

    const dataUrl = await toPng(scrapbookRef.current, {
      cacheBust: true,
      pixelRatio: 3,
    });

    const link = document.createElement("a");
    link.download = "Memora-Scrapbook.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-10">

      <h1 className="text-5xl font-black text-center text-blue-700">
        📖 Memora
      </h1>

      <p className="text-center text-gray-600 mt-3 text-lg">
        Upload your memories and let us create a beautiful scrapbook.
      </p>

      <div className="max-w-4xl mx-auto mt-10">

        <ImageUpload onImageSelected={addImage} />

        <div className="bg-white mt-8 rounded-3xl shadow-xl p-6">

          <label className="block mb-4 text-3xl font-extrabold text-gray-900">
  ✍️ Tell about your memories
</label>

          <textarea
            value={memoryPrompt}
            onChange={(e) => setMemoryPrompt(e.target.value)}
            placeholder="Write your beautiful memories..."
            className="w-full h-44 rounded-2xl border-2 border-blue-300 p-5 text-lg text-gray-800"
          />

        </div>

        <div className="bg-white mt-8 rounded-3xl shadow-xl p-6">

          <h2 className="text-2xl font-bold text-center text-blue-700">
            📷 Uploaded Photos
          </h2>

          <p className="text-center text-xl font-bold mt-4 text-gray-800">
            {images.length} / 5 Photos
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-6">

            {imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                className="w-28 h-28 rounded-xl object-cover border-4 border-white shadow-lg"
              />
            ))}

          </div>

          <h2 className="text-center text-5xl font-black text-green-600 mt-8">
            ₹{price}
          </h2>

        </div>

        <button
          onClick={generateScrapbook}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 text-xl font-bold"
        >
          💳 Pay ₹{price} & Generate Scrapbook
        </button>
                {showPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white rounded-3xl shadow-2xl p-8 w-[380px]">

              <h2 className="text-3xl font-bold text-center text-blue-700">
                💳 Memora Payment
              </h2>

              <p className="text-center text-gray-500 mt-3">
                Secure Payment Gateway
              </p>

              <h1 className="text-5xl font-black text-center text-green-600 mt-8">
                ₹{price}
              </h1>

              <select className="w-full mt-6 border rounded-xl p-3">
                <option>💳 Credit / Debit Card</option>
                <option>📱 UPI</option>
                <option>🏦 Net Banking</option>
              </select>

              <button
                onClick={generateStory}
                disabled={loading}
                className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-xl font-bold"
              >
                {loading ? "Generating..." : "✅ Pay Now"}
              </button>

              <button
                onClick={() => setShowPayment(false)}
                className="w-full mt-4 border rounded-2xl py-3"
              >
                Cancel
              </button>

            </div>

          </div>
        )}

        {showScrapbook && (

          <div
            ref={scrapbookRef}
            className="max-w-5xl mx-auto mt-16 bg-gradient-to-br from-[#fffaf0] via-[#fff5ec] to-[#fff8f3] rounded-[40px] border-[8px] border-yellow-300 shadow-2xl p-12"
          >

            {/* COVER PAGE */}

            <div className="relative bg-pink-100 rounded-3xl border-4 border-yellow-300 shadow-xl p-14 text-center">

              <div className="absolute top-5 left-5 text-5xl">🌸</div>
              <div className="absolute top-5 right-5 text-5xl">✨</div>
              <div className="absolute bottom-5 left-5 text-5xl">📸</div>
              <div className="absolute bottom-5 right-5 text-5xl">❤️</div>

              <h1 className="text-7xl font-black text-pink-700">
                📖 MEMORA
              </h1>

              <p className="text-3xl font-bold mt-5 text-gray-700">
                My Memory Scrapbook
              </p>

              <div className="text-7xl mt-8">
                🌸 📸 🌸
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-8 mt-10">

                <p className="italic text-2xl text-gray-700">
                  "{template.quote}"
                </p>

              </div>

              <p className="text-gray-500 mt-8">
                {new Date().toLocaleDateString()}
              </p>

            </div>

            {/* PHOTO TITLE */}

           <div
  className={`mt-12 gap-8 justify-items-center ${
    imageUrls.length === 1
      ? "grid grid-cols-1"
      : imageUrls.length === 2
      ? "grid grid-cols-2"
      : imageUrls.length === 3
      ? "grid grid-cols-2"
      : imageUrls.length === 4
      ? "grid grid-cols-2"
      : "grid grid-cols-2 md:grid-cols-3"
  }`}
>
  {imageUrls.map((url, index) => (
    <div
      key={index}
      className={`bg-white rounded-2xl shadow-xl p-4 rotate-[-2deg]
      ${
        imageUrls.length === 1
          ? "w-[420px]"
          : imageUrls.length === 2
          ? "w-[320px]"
          : "w-full"
      }`}
    >
      <div className="text-center text-4xl -mt-8">
        📍
      </div>

      <img
        src={url}
        alt=""
        className={`rounded-xl object-cover w-full ${
          imageUrls.length === 1
            ? "h-[420px]"
            : imageUrls.length === 2
            ? "h-[320px]"
            : "h-60"
        }`}
      />

      <p className="text-center mt-4 italic text-pink-600">
        Beautiful Moment ❤️
      </p>
    </div>
  ))}
</div>
            {/* STORY */}

            <div className="mt-20 bg-[#fffaf0] rounded-3xl border-4 border-yellow-300 shadow-xl p-12">

              <h2 className="text-center text-5xl font-black text-pink-700">
                📖 Memories to Cherish
              </h2>

              <p className="text-center mt-3 text-gray-600">
                Written by Memora ❤️
              </p>

              <div className="bg-white rounded-2xl shadow-lg p-10 mt-10">

                <p className="text-xl leading-10 text-gray-700 whitespace-pre-line">
                  {aiStory}
                </p>

              </div>

            </div>

            {/* THANK YOU */}

            <div className="mt-20 bg-pink-100 rounded-3xl shadow-xl p-16 text-center">

              <div className="text-7xl">
                ❤️
              </div>

              <h2 className="text-5xl font-black text-pink-700 mt-6">
                Thank You
              </h2>

              <p className="text-2xl mt-6 text-gray-700">
                Every memory deserves a beautiful story.
              </p>

            </div>

          </div>

        )}

        {showScrapbook && (

          <button
            onClick={downloadScrapbook}
            className="w-full mt-10 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold py-5 rounded-2xl shadow-xl transition"
          >
            📸 Download Scrapbook (PNG)
          </button>

        )}

      </div>

    </main>

  );

}         