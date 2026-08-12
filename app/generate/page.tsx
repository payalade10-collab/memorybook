"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

import ImageUpload from "../components/ImageUpload";
import PhotoGrid from "../components/editor/PhotoGrid";
import MemoryEditor from "../components/editor/MemoryEditor";
import ThemeSelector, {
  scrapbookThemes,
  ScrapbookTheme,
} from "../components/editor/ThemeSelector";
import LayoutSelector, {
  scrapbookLayouts,
} from "../components/editor/LayoutSelector";

interface PhotoItem {
  id: string;
  file: File;
  url: string;
  caption: string;
}

interface MemoryData {
  title: string;
  date: string;
  location: string;
  mood: string;
  description: string;
}

const initialMemory: MemoryData = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  location: "",
  mood: "",
  description: "",
};

/* =========================================================
   PHOTO POSITIONING
   Fixed pixel positions are used because the scrapbook
   itself is a fixed A4 canvas: 794 × 1123.
========================================================= */

function getPhotoStyle(count: number, index: number) {
  const base = {
    position: "absolute" as const,
    background: "#ffffff",
    padding: "12px",
    border: "1px solid #d8c9ad",
    boxShadow: "0 10px 25px rgba(0,0,0,0.22)",
    borderRadius: "5px",
    zIndex: 20,
    boxSizing: "border-box" as const,
  };

  /* 1 PHOTO — LARGE */
  if (count === 1) {
    return {
      ...base,
      left: "65px",
      top: "185px",
      width: "664px",
      height: "780px",
      transform: "rotate(-1deg)",
    };
  }

  /* 2 PHOTOS — DIAGONAL */
  if (count === 2) {
    if (index === 0) {
      return {
        ...base,
        left: "55px",
        top: "225px",
        width: "420px",
        height: "340px",
        transform: "rotate(-5deg)",
      };
    }

    return {
      ...base,
      right: "55px",
      top: "535px",
      width: "420px",
      height: "340px",
      transform: "rotate(5deg)",
    };
  }

  /* 3 PHOTOS — 2 TOP + 1 CENTER */
  if (count === 3) {
    if (index === 0) {
      return {
        ...base,
        left: "55px",
        top: "215px",
        width: "315px",
        height: "315px",
        transform: "rotate(-3deg)",
      };
    }

    if (index === 1) {
      return {
        ...base,
        right: "55px",
        top: "215px",
        width: "315px",
        height: "315px",
        transform: "rotate(3deg)",
      };
    }

    return {
      ...base,
      left: "239px",
      top: "545px",
      width: "315px",
      height: "315px",
      transform: "rotate(-1deg)",
    };
  }

  /* 4 PHOTOS — 2 TOP + 2 BOTTOM */
  if (count === 4) {
    if (index === 0) {
      return {
        ...base,
        left: "55px",
        top: "210px",
        width: "315px",
        height: "315px",
        transform: "rotate(-3deg)",
      };
    }

    if (index === 1) {
      return {
        ...base,
        right: "55px",
        top: "210px",
        width: "315px",
        height: "315px",
        transform: "rotate(3deg)",
      };
    }

    if (index === 2) {
      return {
        ...base,
        left: "55px",
        top: "555px",
        width: "315px",
        height: "315px",
        transform: "rotate(3deg)",
      };
    }

    return {
      ...base,
      right: "55px",
      top: "555px",
      width: "315px",
      height: "315px",
      transform: "rotate(-3deg)",
    };
  }

  /* 5 PHOTOS
     2 upper
     2 lower
     1 center
  */

  if (index === 0) {
    return {
      ...base,
      left: "45px",
      top: "205px",
      width: "300px",
      height: "285px",
      transform: "rotate(-3deg)",
    };
  }

  if (index === 1) {
    return {
      ...base,
      right: "45px",
      top: "205px",
      width: "300px",
      height: "285px",
      transform: "rotate(3deg)",
    };
  }

  if (index === 2) {
    return {
      ...base,
      left: "45px",
      top: "535px",
      width: "300px",
      height: "285px",
      transform: "rotate(3deg)",
    };
  }

  if (index === 3) {
    return {
      ...base,
      right: "45px",
      top: "535px",
      width: "300px",
      height: "285px",
      transform: "rotate(-3deg)",
    };
  }

  return {
    ...base,
    left: "247px",
    top: "670px",
    width: "300px",
    height: "285px",
    transform: "rotate(-1deg)",
    zIndex: 30,
  };
}

/* =========================================================
   PHOTO CARD
========================================================= */

function PhotoCard({
  photo,
  index,
  count,
}: {
  photo: PhotoItem;
  index: number;
  count: number;
}) {
  const style = getPhotoStyle(count, index);

  return (
    <div style={style}>
      {/* Tape */}
      <div
        style={{
          position: "absolute",
          top: "-12px",
          left: "50%",
          transform: "translateX(-50%) rotate(-2deg)",
          width: "75px",
          height: "25px",
          background: "rgba(245,220,135,0.95)",
          boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
          zIndex: 40,
        }}
      />

      {/* Number */}
      <div
        style={{
          position: "absolute",
          top: "-15px",
          right: "-12px",
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          background: "#db2777",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: "14px",
          zIndex: 50,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        {index + 1}
      </div>

      {/* Image */}
      <img
        src={photo.url}
        alt={`Memory ${index + 1}`}
        style={{
          display: "block",
          width: "100%",
          height: count === 1 ? "650px" : "220px",
          objectFit: "cover",
          borderRadius: "4px",
        }}
      />

      {/* Caption */}
      {count !== 1 && (
        <div
          style={{
            textAlign: "center",
            paddingTop: "8px",
            paddingBottom: "2px",
            height: "45px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: "8px",
              letterSpacing: "2px",
              fontWeight: 900,
              color: "#9b8063",
              textTransform: "uppercase",
            }}
          >
            Memory {index + 1}
          </div>

          <div
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "11px",
              color: "#db2777",
              marginTop: "3px",
              lineHeight: 1.25,
            }}
          >
            {photo.caption || "A moment to remember ❤️"}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function GeneratePage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const [memory, setMemory] =
    useState<MemoryData>(initialMemory);

  const [selectedTheme, setSelectedTheme] =
    useState<ScrapbookTheme>(scrapbookThemes[0]);

  const [selectedLayout, setSelectedLayout] =
    useState(scrapbookLayouts[0]);

  const [story, setStory] = useState("");

  const [loading, setLoading] = useState(false);

  const [showResult, setShowResult] = useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     FILE → DATA URL
  ======================================================= */

  const fileToDataUrl = (
    file: File
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  /* =======================================================
     ADD PHOTOS
  ======================================================= */

  const handleImagesSelected = async (
    files: File[]
  ) => {
    setError("");

    const availableSlots = 5 - photos.length;

    if (availableSlots <= 0) {
      setError("You can select a maximum of 5 photos.");
      return;
    }

    const filesToAdd = files.slice(0, availableSlots);

    try {
      const newPhotos = await Promise.all(
        filesToAdd.map(async (file) => ({
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          file,
          url: await fileToDataUrl(file),
          caption: "",
        }))
      );

      setPhotos((current) => [
        ...current,
        ...newPhotos,
      ]);
    } catch (error) {
      console.error(error);

      setError(
        "Could not load one or more photos."
      );
    }
  };

  /* =======================================================
     REMOVE PHOTO
  ======================================================= */

  const removePhoto = (id: string) => {
    setPhotos((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  /* =======================================================
     CAPTION
  ======================================================= */

  const changeCaption = (
    id: string,
    caption: string
  ) => {
    setPhotos((current) =>
      current.map((photo) =>
        photo.id === id
          ? {
              ...photo,
              caption,
            }
          : photo
      )
    );
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validate = () => {
    if (photos.length === 0) {
      setError(
        "Please select at least one photo."
      );
      return false;
    }

    if (!memory.title.trim()) {
      setError(
        "Please give your memory a title."
      );
      return false;
    }

    if (!memory.description.trim()) {
      setError(
        "Please tell us something about your memory."
      );
      return false;
    }

    return true;
  };

  /* =======================================================
     GENERATE
  ======================================================= */

  const generateScrapbook = async () => {
    setError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch(
        "/api/generate-story",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memoryPrompt: `
Title: ${memory.title}

Date: ${memory.date}

Location: ${
              memory.location || "Not specified"
            }

Mood: ${
              memory.mood || "Not specified"
            }

Memory:
${memory.description}
            `,
            photoCount: photos.length,
            style: selectedTheme.name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Story generation failed"
        );
      }

      const data = await response.json();

      setStory(
        data.story ||
          memory.description
      );

      if (Array.isArray(data.captions)) {
        setPhotos((current) =>
          current.map(
            (photo, index) => ({
              ...photo,
              caption:
                photo.caption ||
                data.captions[index] ||
                "",
            })
          )
        );
      }

      setShowResult(true);

      setTimeout(() => {
        document
          .getElementById("scrapbook-result")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while creating your scrapbook."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     PDF
  ======================================================= */

  const downloadPDF = async () => {
    const pageIds = [
      "cover-page",
      "photos-page",
      "story-page",
      "thank-you-page",
    ];

    try {
      setError("");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      for (
        let i = 0;
        i < pageIds.length;
        i++
      ) {
        const element =
          document.getElementById(
            pageIds[i]
          );

        if (!element) {
          throw new Error(
            `Could not find ${pageIds[i]}`
          );
        }

        /* Wait for browser rendering */
        await new Promise<void>(
          (resolve) =>
            requestAnimationFrame(() =>
              requestAnimationFrame(
                () => resolve()
              )
            )
        );

        /* Wait for images */
        const images =
          Array.from(
            element.querySelectorAll("img")
          );

        await Promise.all(
          images.map(
            (img) =>
              new Promise<void>(
                (resolve) => {
                  if (img.complete) {
                    resolve();
                  } else {
                    img.onload = () =>
                      resolve();
                    img.onerror = () =>
                      resolve();
                  }
                }
              )
          )
        );

        /*
          IMPORTANT:
          The scrapbook page is exactly
          794 × 1123 px.
        */

        const canvas = await toPng(
          element,
          {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: "#fffaf0",
            width: 794,
            height: 1123,
            style: {
              width: "794px",
              height: "1123px",
              margin: "0",
              transform: "none",
            },
          }
        );

        if (i > 0) {
          pdf.addPage();
        }

        /*
          Exact A4 dimensions.
        */

        pdf.addImage(
          canvas,
          "PNG",
          0,
          0,
          210,
          297,
          undefined,
          "FAST"
        );
      }

      pdf.save(
        `${
          memory.title.trim() ||
          "Memora-Scrapbook"
        }.pdf`
      );
    } catch (error) {
      console.error(
        "PDF ERROR:",
        error
      );

      setError(
        "Could not create the PDF. Please try again."
      );
    }
  };

  /* =======================================================
     RESET
  ======================================================= */

  const startNewMemory = () => {
    setPhotos([]);
    setMemory({
      ...initialMemory,
      date: new Date()
        .toISOString()
        .split("T")[0],
    });
    setStory("");
    setShowResult(false);
    setError("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-10">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="max-w-6xl mx-auto px-5 text-center">
        <div className="text-6xl">
          📖
        </div>

        <h1 className="text-5xl sm:text-6xl font-black text-blue-700 mt-3">
          Memora
        </h1>

        <p className="text-gray-600 text-lg mt-3 max-w-2xl mx-auto">
          Turn your favorite memories into a
          beautiful personalized scrapbook.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-5 mt-10 space-y-8">

        {/* ERROR */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* =================================================
            STEP 1
        ================================================= */}

        <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.2em] font-bold text-pink-500">
              Step 1
            </p>

            <h2 className="text-3xl font-black text-gray-900 mt-1">
              📸 Choose Your Photos
            </h2>

            <p className="text-gray-500 mt-2">
              Select up to 5 photos for your memory.
            </p>
          </div>

          <ImageUpload
            onImagesSelected={
              handleImagesSelected
            }
          />

          <div className="flex items-center justify-between mb-5">
            <p className="font-bold text-gray-800">
              {photos.length} / 5 photos selected
            </p>

            {photos.length > 0 && (
              <p className="text-sm text-gray-500">
                Add captions below
              </p>
            )}
          </div>

          <PhotoGrid
            photos={photos}
            onRemove={removePhoto}
            onCaptionChange={
              changeCaption
            }
          />
        </section>

        {/* =================================================
            STEP 2
        ================================================= */}

        <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.2em] font-bold text-pink-500">
              Step 2
            </p>

            <h2 className="text-3xl font-black text-gray-900 mt-1">
              ✍️ Tell Us About It
            </h2>
          </div>

          <MemoryEditor
            memory={memory}
            onChange={setMemory}
          />
        </section>

        {/* =================================================
            STEP 3
        ================================================= */}

        <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.2em] font-bold text-pink-500">
            Step 3
          </p>

          <ThemeSelector
            selectedTheme={
              selectedTheme
            }
            onThemeChange={
              setSelectedTheme
            }
          />
        </section>

        {/* =================================================
            STEP 4
        ================================================= */}

        <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.2em] font-bold text-blue-500">
            Step 4
          </p>

          <LayoutSelector
            selectedLayout={
              selectedLayout
            }
            onLayoutChange={
              setSelectedLayout
            }
          />
        </section>

        {/* =================================================
            GENERATE
        ================================================= */}

        <section className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-center text-white">
          <div className="text-5xl">
            ✨
          </div>

          <h2 className="text-3xl font-black mt-3">
            Ready to Create Your Memory?
          </h2>

          <p className="mt-3 text-white/90">
            Memora will create a story and
            scrapbook from your memories.
          </p>

          <button
            type="button"
            onClick={
              generateScrapbook
            }
            disabled={loading}
            className="mt-7 bg-white text-blue-700 hover:bg-gray-100 disabled:opacity-60 rounded-2xl px-10 py-4 text-xl font-black shadow-xl transition"
          >
            {loading
              ? "✨ Creating Your Scrapbook..."
              : "🚀 Create My Scrapbook"}
          </button>
        </section>

        {/* =================================================
            RESULT
        ================================================= */}

        {showResult && (
          <section
            id="scrapbook-result"
            className="space-y-8"
          >
            {/* RESULT HEADER */}

            <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
              <p className="text-sm uppercase tracking-[0.2em] font-bold text-green-600">
                Your Scrapbook Is Ready
              </p>

              <h2 className="text-4xl font-black text-gray-900 mt-2">
                {memory.title}
              </h2>

              <p className="text-gray-500 mt-2">
                {selectedTheme.emoji}{" "}
                {selectedTheme.name}
                {" • "}
                {selectedLayout.emoji}{" "}
                {selectedLayout.name}
              </p>
            </div>

            {/* =================================================
                COVER PAGE
            ================================================= */}

            <section
              id="cover-page"
              className="scrapbook-page scrapbook-cover"
            >
              <div className="scrapbook-decoration top-left">
                {selectedTheme.emoji}
              </div>

              <div className="scrapbook-decoration top-right">
                ✨
              </div>

              <div className="cover-content">
                <div className="text-7xl">
                  📖
                </div>

                <p className="cover-kicker">
                  A STORY WORTH REMEMBERING
                </p>

                <h1
                  className={`cover-title ${selectedTheme.headingClass}`}
                >
                  {memory.title}
                </h1>

                {memory.location && (
                  <p className="cover-location">
                    📍 {memory.location}
                  </p>
                )}

                {memory.date && (
                  <p className="cover-date">
                    📅{" "}
                    {new Date(
                      memory.date
                    ).toLocaleDateString()}
                  </p>
                )}

                {photos[0] && (
                  <div className="cover-photo">
                    <img
                      src={photos[0].url}
                      alt="Cover memory"
                    />
                  </div>
                )}

                <div className="cover-quote">
                  <p>
                    “Every memory becomes more
                    precious when we take the
                    time to remember it.”
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                PHOTO PAGE
            ================================================= */}

            <section
              id="photos-page"
              className="scrapbook-page photo-page"
            >
              <div className="photo-page-header">
                <p>
                  LITTLE PIECES OF HAPPINESS
                </p>

                <h2
                  className={
                    selectedTheme.headingClass
                  }
                >
                  📸 Our Memories
                </h2>

                <div>
                  ✦ 🌸 ✦
                </div>
              </div>

              {photos.map(
                (photo, index) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    index={index}
                    count={photos.length}
                  />
                )
              )}

              <div className="photo-page-footer">
                ✦ 🌸 ✦ ❤️ ✦ 🌸 ✦
              </div>
            </section>

            {/* =================================================
                STORY PAGE
            ================================================= */}

            <section
              id="story-page"
              className="scrapbook-page story-page"
            >
              <div className="story-content">
                <p className="story-kicker">
                  A STORY FROM THE HEART
                </p>

                <h2
                  className={`story-title ${selectedTheme.headingClass}`}
                >
                  📖 {memory.title}
                </h2>

                {memory.mood && (
                  <p className="story-mood">
                    Feeling: {memory.mood}
                  </p>
                )}

                <div
                  className={`story-card ${selectedTheme.cardClass}`}
                >
                  <p className="story-text">
                    {story}
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                THANK YOU PAGE
            ================================================= */}

            <section
              id="thank-you-page"
              className="scrapbook-page thank-page"
            >
              <div className="thank-content">
                <div className="text-8xl">
                  ❤️
                </div>

                <p className="thank-kicker">
                  UNTIL THE NEXT MEMORY...
                </p>

                <h2
                  className={`thank-title ${selectedTheme.headingClass}`}
                >
                  Thank You
                </h2>

                <p className="thank-text">
                  Every memory deserves a
                  beautiful story.
                </p>

                <div className="memora-box">
                  <p>
                    Created with love by
                  </p>

                  <strong>
                    MEMORA
                  </strong>
                </div>
              </div>
            </section>

            {/* ACTIONS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={downloadPDF}
                className="bg-green-600 hover:bg-green-700 text-white rounded-2xl py-5 text-xl font-black shadow-xl"
              >
                📥 Download PDF
              </button>

              <button
                type="button"
                onClick={startNewMemory}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-5 text-xl font-black shadow-xl"
              >
                ✨ Create Another Memory
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}