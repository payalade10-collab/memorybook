"use client";

import { useState } from "react";
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
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [memoryPrompt, setMemoryPrompt] = useState("");
  const [aiStory, setAiStory] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showScrapbook, setShowScrapbook] = useState(false);

  const [template, setTemplate] = useState(scrapbookTemplates[0]);

  const price = images.length;

  /*
   * Receive ALL selected photos from ImageUpload.
   */
  const handleImagesSelected = (files: File[]) => {
    const selected = files.slice(0, 5);

    setImages(selected);

    const urls = selected.map((file) => URL.createObjectURL(file));
    setImageUrls(urls);

    setShowScrapbook(false);
  };

  /*
   * Start scrapbook generation.
   */
  const generateScrapbook = () => {
    if (images.length === 0) {
      alert("Please select at least one photo.");
      return;
    }

    if (!memoryPrompt.trim()) {
      alert("Please tell us about your memories.");
      return;
    }

    setShowPayment(true);
  };

  /*
   * Generate story.
   */
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
          photoCount: images.length,
          style: template.title,
        }),
      });

      if (!response.ok) {
        throw new Error("Story generation failed");
      }

      const data = await response.json();

      setAiStory(
        data.story ||
          `${memoryPrompt}\n\nThese memories are filled with moments worth keeping forever.`
      );

      const randomTemplate =
        scrapbookTemplates[
          Math.floor(Math.random() * scrapbookTemplates.length)
        ];

      setTemplate(randomTemplate);
      setShowScrapbook(true);
    } catch (error) {
      console.error(error);
      alert("Failed to generate scrapbook story.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Returns the scrapbook position for each photo count.
   */
  const getPhotoPosition = (count: number, index: number) => {
    if (count === 1) {
      return "absolute inset-0 flex items-center justify-center p-8";
    }

    if (count === 2) {
      return index === 0
        ? "absolute top-10 left-4 sm:left-10 w-[60%]"
        : "absolute bottom-10 right-4 sm:right-10 w-[60%]";
    }

    if (count === 3) {
      if (index === 0) {
        return "absolute top-8 left-2 sm:left-6 w-[47%]";
      }

      if (index === 1) {
        return "absolute top-8 right-2 sm:right-6 w-[47%]";
      }

      return "absolute bottom-8 left-1/2 -translate-x-1/2 w-[52%]";
    }

    if (count === 4) {
      if (index === 0) {
        return "absolute top-8 left-2 sm:left-6 w-[46%]";
      }

      if (index === 1) {
        return "absolute top-8 right-2 sm:right-6 w-[46%]";
      }

      if (index === 2) {
        return "absolute bottom-8 left-2 sm:left-6 w-[46%]";
      }

      return "absolute bottom-8 right-2 sm:right-6 w-[46%]";
    }

    // 5 photos:
    // 2 top
    // 2 middle
    // 1 centered bottom
    if (index === 0) {
      return "absolute top-5 left-2 sm:left-6 w-[46%]";
    }

    if (index === 1) {
      return "absolute top-5 right-2 sm:right-6 w-[46%]";
    }

    if (index === 2) {
      return "absolute top-[40%] left-2 sm:left-6 w-[46%]";
    }

    if (index === 3) {
      return "absolute top-[40%] right-2 sm:right-6 w-[46%]";
    }

    return "absolute bottom-2 left-1/2 -translate-x-1/2 w-[48%]";
  };

  /*
   * Download four scrapbook sections as four A4 pages.
   */
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

    try {
      for (let i = 0; i < pages.length; i++) {
        const element = document.getElementById(pages[i]);

        if (!element) continue;

        const dataUrl = await toPng(element, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#fffaf0",
        });

        const img = new Image();

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () =>
            reject(new Error("Could not load scrapbook image"));
          img.src = dataUrl;
        });

        const ratio = img.width / img.height;

        let imgWidth = pageWidth;
        let imgHeight = imgWidth / ratio;

        if (imgHeight > pageHeight) {
          imgHeight = pageHeight;
          imgWidth = imgHeight * ratio;
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
    } catch (error) {
      console.error(error);
      alert("Could not create the PDF.");
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-pink-50 py-10">

      {/* HEADER */}

      <div className="text-center px-5">
        <h1 className="text-5xl font-black text-blue-700">
          📖 Memora
        </h1>

        <p className="text-gray-600 mt-3 text-lg">
          Upload your memories and create a beautiful scrapbook.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-10">

        {/* PHOTO UPLOAD */}

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-3xl font-black text-blue-700 mb-5 text-center">
            📸 Select Your Memories
          </h2>

          <p className="text-center text-gray-500 mb-6">
            Select up to 5 photos at the same time.
          </p>

          <ImageUpload
            onImagesSelected={handleImagesSelected}
          />

          <div className="text-center mt-5">
            <p className="text-xl font-bold text-gray-800">
              {images.length} / 5 Photos Selected
            </p>
          </div>
        </div>

        {/* MEMORY TEXT */}

        <div className="bg-white mt-8 rounded-3xl shadow-xl p-6">

          <label className="block mb-4 text-3xl font-extrabold text-gray-900">
            ✍️ Tell About Your Memories
          </label>

          <textarea
            value={memoryPrompt}
            onChange={(e) =>
              setMemoryPrompt(e.target.value)
            }
            placeholder="Tell us about the trip, birthday, family, friends, celebration, or special moment..."
            className="w-full h-44 rounded-2xl border-2 border-blue-300 p-5 text-lg text-gray-800 outline-none focus:border-blue-500"
          />

        </div>

        {/* SELECTED PHOTOS */}

        {imageUrls.length > 0 && (
          <div className="bg-white mt-8 rounded-3xl shadow-xl p-6">

            <h2 className="text-3xl font-black text-center text-pink-700">
              🖼️ Selected Photos
            </h2>

            <div className="flex flex-wrap justify-center gap-4 mt-6">

              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative"
                >
                  <img
                    src={url}
                    alt={`Selected memory ${index + 1}`}
                    className="w-28 h-28 object-cover rounded-xl border-4 border-white shadow-lg"
                  />

                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-black">
                    {index + 1}
                  </div>
                </div>
              ))}

            </div>

            <h2 className="text-center text-5xl font-black text-green-600 mt-8">
              ₹{price}
            </h2>

          </div>
        )}

        {/* GENERATE */}

        <button
          onClick={generateScrapbook}
          disabled={loading}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl py-4 text-xl font-bold shadow-xl"
        >
          💳 Continue & Generate Scrapbook
        </button>

        {/* PAYMENT / CONFIRMATION */}

        {showPayment && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-5">

            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">

              <h2 className="text-3xl font-bold text-center text-blue-700">
                📖 Memora
              </h2>

              <p className="text-center text-gray-500 mt-3">
                Scrapbook generation
              </p>

              <h1 className="text-5xl font-black text-center text-green-600 mt-8">
                ₹{price}
              </h1>

              <p className="text-center text-gray-500 mt-4">
                {images.length} photo
                {images.length !== 1 ? "s" : ""}
              </p>

              <button
                onClick={generateStory}
                disabled={loading}
                className="w-full mt-8 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-4 rounded-2xl text-xl font-bold"
              >
                {loading
                  ? "Creating Scrapbook..."
                  : "✅ Create My Scrapbook"}
              </button>

              <button
                onClick={() => setShowPayment(false)}
                className="w-full mt-4 border border-gray-300 rounded-2xl py-3"
              >
                Cancel
              </button>

            </div>

          </div>
        )}

        {/* SCRAPBOOK */}

        {showScrapbook && (
          <div className="mt-16">

            {/* COVER */}

            <section
              id="cover-page"
              className="relative overflow-hidden bg-gradient-to-br from-pink-100 via-white to-yellow-50 rounded-[32px] border-4 border-yellow-300 shadow-2xl p-8 sm:p-12 min-h-[1120px] flex flex-col items-center justify-center text-center"
            >

              <div className="absolute top-8 left-8 text-6xl">
                🌸
              </div>

              <div className="absolute top-8 right-8 text-5xl">
                ✨
              </div>

              <div className="absolute bottom-8 left-8 text-5xl">
                📸
              </div>

              <div className="absolute bottom-8 right-8 text-6xl">
                ❤️
              </div>

              <div className="bg-white/90 border-2 border-pink-200 rounded-full px-6 py-2 shadow-md">
                <p className="text-sm font-bold tracking-[0.2em] text-pink-600 uppercase">
                  A Story Worth Remembering
                </p>
              </div>

              <div className="text-7xl mt-8">
                📖
              </div>

              <h1 className="text-6xl sm:text-7xl font-black text-pink-700 mt-4">
                MEMORA
              </h1>

              <p className="text-2xl sm:text-3xl font-bold mt-5 text-gray-700">
                My Memory Scrapbook
              </p>

              <p className="max-w-2xl mt-5 text-lg text-gray-600 leading-8">
                A beautiful collection of moments, stories,
                laughter, and memories that deserve to live forever.
              </p>

              <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-pink-100 p-8 mt-12">

                <div className="text-5xl mb-4">
                  💕
                </div>

                <p className="italic text-xl sm:text-2xl text-gray-700 leading-9">
                  "{template.quote}"
                </p>

              </div>

              <div className="mt-10 bg-pink-600 text-white rounded-full px-6 py-3 shadow-lg">
                📅 {new Date().toLocaleDateString()}
              </div>

            </section>

            {/* PHOTOS */}

            <section
              id="photos-page"
              className="relative mt-10 bg-gradient-to-br from-[#fffaf0] via-white to-[#fff5ec] rounded-[32px] border-4 border-yellow-300 shadow-2xl p-6 sm:p-8 min-h-[1120px] overflow-hidden"
            >

              <div className="text-center">

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

              {/* PHOTO COLLAGE */}

              <div className="relative w-full max-w-4xl mx-auto min-h-[950px] mt-8">

                {imageUrls.map((url, index) => {

                  const position = getPhotoPosition(
                    imageUrls.length,
                    index
                  );

                  const rotation =
                    index % 2 === 0
                      ? "rotate-[-2deg]"
                      : "rotate-[2deg]";

                  return (
                    <div
                      key={index}
                      className={`${position} ${rotation} bg-[#fffdf7] p-3 sm:p-4 shadow-2xl border border-[#eadfca] z-10`}
                    >

                      {/* TAPE */}

                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-28 h-9 bg-yellow-200/90 rotate-[-3deg] shadow-sm z-20 flex items-center justify-center">
                        <span className="text-xs font-black text-yellow-700">
                          MEMORA
                        </span>
                      </div>

                      {/* NUMBER */}

                      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-black shadow-lg z-30">
                        {index + 1}
                      </div>

                      {/* PHOTO */}

                      <img
                        src={url}
                        alt={`Memory ${index + 1}`}
                        className="w-full h-52 sm:h-64 md:h-72 object-cover rounded-lg"
                      />

                      {/* CAPTION */}

                      <div className="text-center pt-4 pb-2">

                        <p className="text-xs font-black tracking-[0.2em] text-[#9b8063] uppercase">
                          Memory {index + 1}
                        </p>

                        <p className="text-base sm:text-lg font-serif italic font-bold text-pink-600 mt-2">
                          A Moment to Remember ❤️
                        </p>

                        <div className="flex justify-center gap-2 mt-2 text-lg">
                          <span>✦</span>
                          <span>🌸</span>
                          <span>✦</span>
                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>

            </section>

            {/* STORY */}

            <section
              id="story-page"
              className="mt-10 bg-gradient-to-br from-[#fffaf0] via-white to-pink-50 rounded-[32px] border-4 border-yellow-200 shadow-2xl p-6 sm:p-10 min-h-[1120px]"
            >

              <div className="text-center">

                <p className="text-pink-500 font-bold tracking-[0.2em] uppercase text-sm">
                  A Story From The Heart
                </p>

                <h2 className="text-4xl sm:text-5xl font-black text-pink-700 mt-2">
                  📖 Memories to Cherish
                </h2>

                <div className="flex justify-center gap-3 mt-5 text-2xl">
                  🌸 ✦ ❤️ ✦ 🌸
                </div>

                <p className="text-gray-500 mt-4">
                  Written especially for your memories by Memora ❤️
                </p>

              </div>

              <div className="relative bg-[#fffdf7] rounded-3xl shadow-xl border border-yellow-100 p-8 sm:p-12 mt-10 max-w-4xl mx-auto">

                <div className="text-center text-5xl mb-8">
                  💕
                </div>

                <p className="text-lg sm:text-xl leading-9 text-gray-700 whitespace-pre-line break-words">
                  {aiStory}
                </p>

                <div className="text-center mt-10 text-3xl">
                  ✨ 🌷 ✨
                </div>

              </div>

            </section>

            {/* THANK YOU */}

            <section
              id="thank-you-page"
              className="relative mt-10 bg-gradient-to-br from-pink-100 via-white to-yellow-50 rounded-[32px] border-4 border-pink-200 shadow-2xl p-8 sm:p-12 min-h-[1120px] flex flex-col items-center justify-center text-center overflow-hidden"
            >

              <div className="absolute top-8 left-8 text-5xl">
                🌸
              </div>

              <div className="absolute top-8 right-8 text-5xl">
                ✨
              </div>

              <div className="absolute bottom-8 left-8 text-5xl">
                📸
              </div>

              <div className="absolute bottom-8 right-8 text-5xl">
                🌷
              </div>

              <div className="w-36 h-36 rounded-full bg-pink-100 shadow-2xl flex items-center justify-center">
                <span className="text-7xl">
                  ❤️
                </span>
              </div>

              <p className="text-pink-600 font-bold tracking-[0.2em] uppercase text-sm mt-10">
                Until the next memory...
              </p>

              <h2 className="text-5xl sm:text-6xl font-black text-pink-700 mt-3">
                Thank You ❤️
              </h2>

              <div className="flex gap-4 text-2xl mt-5">
                🌸 ✦ ✨ ✦ 🌸
              </div>

              <p className="max-w-xl text-xl sm:text-2xl mt-8 text-gray-700 leading-9">
                Every memory deserves a beautiful story.
              </p>

              <div className="mt-10 bg-white/90 rounded-3xl shadow-lg border border-pink-100 px-10 py-6">
                <p className="text-gray-600 font-semibold">
                  📖 Created with love by
                </p>

                <p className="text-3xl font-black text-pink-600 mt-1">
                  MEMORA
                </p>
              </div>

            </section>

            {/* DOWNLOAD */}

            <button
              onClick={downloadScrapbook}
              className="w-full mt-10 bg-green-600 hover:bg-green-700 text-white text-xl sm:text-2xl font-bold py-5 rounded-2xl shadow-xl"
            >
              📥 Download Scrapbook PDF
            </button>

          </div>
        )}

      </div>
    </main>
  );
}