"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
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
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const pages = [
    "cover-page",
    "photos-page",
    "story-page",
    "thank-you-page",
  ];

  for (let i = 0; i < pages.length; i++) {
    const element = document.getElementById(pages[i]);

    if (!element) continue;

    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2,
    });

    const img = new Image();

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = dataUrl;
    });

    const imgRatio = img.width / img.height;

    let imgWidth = pageWidth;
    let imgHeight = imgWidth / imgRatio;

    // Fit the section inside one A4 page
    if (imgHeight > pageHeight) {
      imgHeight = pageHeight;
      imgWidth = imgHeight * imgRatio;
    }

    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      dataUrl,
      "PNG",
      x,
      y,
      imgWidth,
      imgHeight
    );
  }

  pdf.save("Memora-Scrapbook.pdf");
};
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 to-pink-50 py-10">

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
            className="w-full max-w-5xl mx-auto mt-16 bg-gradient-to-br from-[#fffaf0] via-[#fff5ec] to-[#fff8f3] rounded-[40px] border-[8px] border-yellow-300 shadow-2xl p-4 sm:p-12"
          >

            {/* COVER PAGE */}

            {/* COVER PAGE */}

<div
  id="cover-page"
  className="relative overflow-hidden bg-gradient-to-br from-pink-100 via-white to-yellow-50 rounded-[32px] border-4 border-yellow-300 shadow-2xl p-8 sm:p-12 md:p-16 text-center min-h-[650px] flex flex-col items-center justify-center"
>
  {/* Decorative background */}
  <div className="absolute -top-10 -left-10 text-7xl opacity-70">
    🌸
  </div>

  <div className="absolute top-8 right-8 text-5xl opacity-80">
    ✨
  </div>

  <div className="absolute bottom-8 left-8 text-5xl opacity-70">
    📸
  </div>

  <div className="absolute -bottom-8 -right-8 text-7xl opacity-70">
    ❤️
  </div>

  {/* Small badge */}

  <div className="relative bg-white/80 border-2 border-pink-200 rounded-full px-6 py-2 shadow-md mb-6">
    <p className="text-sm sm:text-base font-bold tracking-[0.2em] text-pink-600 uppercase">
      A Story Worth Remembering
    </p>
  </div>

  {/* Logo */}

  <div className="relative text-6xl sm:text-7xl mb-4">
    📖
  </div>

  {/* Main title */}

  <h1 className="relative text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-pink-700">
    MEMORA
  </h1>

  <div className="mt-3 flex items-center gap-3 text-pink-400 text-2xl">
    <span>🌸</span>
    <span>•</span>
    <span>✨</span>
    <span>•</span>
    <span>🌸</span>
  </div>

  <p className="relative text-xl sm:text-2xl md:text-3xl font-bold mt-6 text-gray-700">
    My Memory Scrapbook
  </p>

  <p className="relative max-w-xl mt-4 text-base sm:text-lg text-gray-600 leading-8">
    A beautiful collection of moments, stories, laughter,
    and memories that deserve to live forever.
  </p>

  {/* Quote card */}

  <div className="relative w-full max-w-2xl bg-white/90 rounded-3xl shadow-xl border border-pink-100 p-6 sm:p-8 mt-10">
    <div className="text-4xl mb-3">
      💕
    </div>

    <p className="italic text-lg sm:text-xl md:text-2xl text-gray-700 leading-9">
      "{template.quote}"
    </p>
  </div>

  {/* Date */}

  <div className="relative mt-8 bg-pink-600 text-white rounded-full px-6 py-2 shadow-lg">
    <p className="font-semibold">
      📅 {new Date().toLocaleDateString()}
    </p>
  </div>

</div>
             

            {/* PHOTO TITLE */}

<div
  id="photos-page"
  className="mt-12 bg-white/70 rounded-[32px] border-4 border-yellow-200 shadow-xl p-6 sm:p-10"
>
  <div className="text-center mb-10">
    <p className="text-pink-500 font-bold tracking-[0.2em] uppercase text-sm">
      Little Pieces of Happiness
    </p>

    <h2 className="text-4xl sm:text-5xl font-black text-pink-700 mt-2">
      📸 Our Memories
    </h2>

    <p className="text-gray-600 mt-3">
      Every picture holds a story ❤️
    </p>
  </div>

  <div
    className={`grid gap-8 justify-items-center ${
      imageUrls.length === 1
        ? "grid-cols-1"
        : "grid-cols-1 sm:grid-cols-2"
    }`}
  >
    {imageUrls.map((url, index) => (
      <div
        key={index}
        className={`relative w-full max-w-sm bg-[#fffdf7] p-4 sm:p-5 shadow-2xl border border-gray-100 ${
          index % 2 === 0
            ? "rotate-[-2deg]"
            : "rotate-[2deg]"
        }`}
      >
        {/* Tape decoration */}

        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-9 bg-yellow-200/80 rotate-[-3deg] shadow-sm flex items-center justify-center text-xs font-bold text-yellow-700">
  MEMORA
</div>

        {/* Memory number */}

        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-black shadow-lg">
          {index + 1}
        </div>

        {/* Photo */}

        <img
          src={url}
          alt={`Memory ${index + 1}`}
          className="w-full h-64 sm:h-80 object-cover rounded-lg"
        />

        {/* Caption */}

        <div className="pt-5 pb-2 text-center">
          <p className="text-sm text-gray-400 font-semibold uppercase tracking-widest">
  ✨❤️ {index + 1} ✨
</p>

          <p className="text-xl font-bold text-pink-600 mt-2">
  A Moment to Remember ❤️
</p>

          <div className="text-2xl mt-2">
            ✨ 🌸 ✨
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
 
            {/* STORY */}


<div
  id="story-page"
  className="mt-16 sm:mt-20 bg-gradient-to-br from-[#fffaf0] via-white to-pink-50 rounded-[32px] border-4 border-yellow-200 shadow-2xl p-6 sm:p-10 md:p-12"
>
  {/* Heading */}

  <div className="text-center">
    <p className="text-pink-500 font-bold tracking-[0.2em] uppercase text-sm">
      A Story From The Heart
    </p>

    <h2 className="text-3xl sm:text-5xl font-black text-pink-700 mt-2">
      📖 Memories to Cherish
    </h2>

    <div className="flex justify-center items-center gap-3 mt-4 text-2xl">
      <span>🌸</span>
      <span className="text-yellow-400">✦</span>
      <span>❤️</span>
      <span className="text-yellow-400">✦</span>
      <span>🌸</span>
    </div>

    <p className="text-gray-500 mt-4">
      Written especially for your memories by Memora ❤️
    </p>
  </div>

  {/* Story paper */}

  <div className="relative bg-[#fffdf7] rounded-3xl shadow-xl border border-yellow-100 p-6 sm:p-10 mt-10 overflow-hidden">

    {/* Decorative corners */}

    <div className="absolute top-3 left-4 text-3xl opacity-60">
      🌿
    </div>

    <div className="absolute top-3 right-4 text-3xl opacity-60">
      🌿
    </div>

    <div className="absolute bottom-3 left-4 text-3xl opacity-60">
      🌸
    </div>

    <div className="absolute bottom-3 right-4 text-3xl opacity-60">
      🌸
    </div>

    {/* Story */}

    <div className="relative z-10 max-w-3xl mx-auto">

      <div className="text-center text-4xl mb-6">
        💕
      </div>

      <p className="text-base sm:text-xl leading-8 sm:leading-10 text-gray-700 whitespace-pre-line break-words">
        {aiStory}
      </p>

      <div className="text-center mt-10 text-3xl">
        ✨ 🌷 ✨
      </div>

    </div>

  </div>

</div>

            {/* THANK YOU */}
<div
  id="thank-you-page"
  className="mt-16 sm:mt-20 bg-gradient-to-br from-pink-100 via-white to-yellow-50 rounded-[32px] border-4 border-pink-200 shadow-2xl p-8 sm:p-12 md:p-16 text-center min-h-[700px] flex flex-col items-center justify-center"
>
  {/* Decorations */}

  <div className="absolute top-6 left-6 text-4xl sm:text-5xl opacity-70">
    🌸
  </div>

  <div className="absolute top-6 right-6 text-4xl sm:text-5xl opacity-70">
    ✨
  </div>

  <div className="absolute bottom-6 left-6 text-4xl sm:text-5xl opacity-70">
    📸
  </div>

  <div className="absolute bottom-6 right-6 text-4xl sm:text-5xl opacity-70">
    🌷
  </div>

  {/* Heart */}

  <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-pink-100 shadow-2xl flex items-center justify-center">
    <span className="text-6xl sm:text-7xl">
      ❤️
    </span>
  </div>

  {/* Ending */}

  <p className="text-pink-600 font-bold tracking-[0.2em] uppercase text-sm mt-10">
    Until the next memory...
  </p>

  <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-pink-700 mt-3">
    Thank You ❤️
  </h2>

  <div className="flex items-center gap-4 text-2xl mt-5">
    <span>🌸</span>
    <span className="text-yellow-400">✦</span>
    <span>✨</span>
    <span className="text-yellow-400">✦</span>
    <span>🌸</span>
  </div>

  <p className="max-w-xl text-lg sm:text-xl md:text-2xl mt-8 text-gray-700 leading-9">
    Every memory deserves a beautiful story.
  </p>

  <div className="mt-10 bg-white/90 rounded-3xl shadow-lg border border-pink-100 px-6 sm:px-10 py-5">
    <p className="text-gray-600 font-semibold">
      📖 Created with love by
    </p>

    <p className="text-2xl font-black text-pink-600 mt-1">
      MEMORA
    </p>
  </div>

</div>
          </div>

        )}

        {showScrapbook && (

          <button
            onClick={downloadScrapbook}
            className="w-full mt-10 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold py-5 rounded-2xl shadow-xl transition"
          >
            📸 Download Scrapbook (PDF)
          </button>

        )}

      </div>

    </main>

  );

}