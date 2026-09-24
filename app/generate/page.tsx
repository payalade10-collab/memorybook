"use client";

import React, { useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import ImageUpload from "../components/ImageUpload";

interface PhotoItem {
  id: string;
  file: File;
  url: string;
  caption: string;
}

interface AnalyzedPhoto {
  id: string;
  caption: string;
}

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const maxSize = 1400;

        let width = image.width;
        let height = image.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round(
              (height / width) * maxSize
            );
            width = maxSize;
          } else {
            width = Math.round(
              (width / height) * maxSize
            );
            height = maxSize;
          }
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error(
            "Could not create canvas."
          );
        }

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        const dataUrl = canvas.toDataURL(
          "image/jpeg",
          0.82
        );

        URL.revokeObjectURL(objectUrl);

        resolve(dataUrl);
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error("Could not read image.")
      );
    };

    image.src = objectUrl;
  });
}

const decorations = [
  "✦",
  "♡",
  "✧",
  "❀",
  "✿",
  "♥",
];

const paperColors = [
  "#d9b8df",
  "#f5c4b9",
  "#f2d36b",
  "#c8d8bd",
  "#e7b6c5",
];

export default function GeneratePage() {
  const [albumTitle, setAlbumTitle] =
    useState("Moments");

  const [photos, setPhotos] =
    useState<PhotoItem[]>([]);

  const [story, setStory] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showResult, setShowResult] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleImagesSelected = async (
    files: File[]
  ) => {
    setError("");

    const remaining =
      5 - photos.length;

    if (remaining <= 0) {
      setError(
        "Maximum 5 photos allowed."
      );
      return;
    }

    const selected =
      files.slice(0, remaining);

    try {
      const newPhotos: PhotoItem[] = [];

      for (const file of selected) {
        const url =
          await compressImage(file);

        newPhotos.push({
          id: createId(),
          file,
          url,
          caption: "",
        });
      }

      setPhotos((current) => [
        ...current,
        ...newPhotos,
      ]);
    } catch {
      setError(
        "Some photos could not be processed."
      );
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((current) =>
      current.filter(
        (photo) => photo.id !== id
      )
    );
  };

  const generateAlbum = async () => {
    setError("");

    if (photos.length === 0) {
      setError(
        "Please select at least one photo."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/generate-story",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              title: albumTitle,
              photos: photos.map(
                (photo) => ({
                  id: photo.id,
                  url: photo.url,
                })
              ),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not create album."
        );
      }

      const analyzed: AnalyzedPhoto[] =
        Array.isArray(data.photos)
          ? data.photos
          : [];

      const updated = photos.map(
        (photo) => {
          const result =
            analyzed.find(
              (item) =>
                item.id === photo.id
            );

          return {
            ...photo,
            caption:
              result?.caption ||
              "A beautiful moment worth remembering.",
          };
        }
      );

      setPhotos(updated);

      setStory(
        data.story ||
          "Beautiful moments brought together in one place."
      );

      setShowResult(true);
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

   const downloadPDF = async () => {
    try {
      setError("");
      setLoading(true);

      // These are the actual IDs used by your album pages.
      const pageIds = [
        "album-cover-page",
        ...photos.map(
          (_, index) =>
            `album-photo-page-${index}`
        ),
        "album-summary-page",
      ];

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      let pageAdded = false;

      for (const pageId of pageIds) {
        const element =
          document.getElementById(pageId);

        if (!element) {
          console.warn(
            `Album page not found: ${pageId}`
          );
          continue;
        }

        // Wait for the page to finish rendering.
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });

        // Make sure all images on this page are loaded.
        const images =
          Array.from(
            element.querySelectorAll<HTMLImageElement>(
              "img"
            )
          );

        await Promise.all(
          images.map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete) {
                  resolve();
                } else {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                }
              })
          )
        );

        // Capture the exact 794 × 1123 album page.
        const image = await toPng(
          element,
          {
            width: 794,
            height: 1123,
            pixelRatio: 2,
            cacheBust: true,
            backgroundColor: "#f8f0df",

            style: {
              width: "794px",
              height: "1123px",
              margin: "0",
              padding: "0",
              transform: "none",
            },
          }
        );

        if (pageAdded) {
          pdf.addPage(
            "a4",
            "portrait"
          );
        }

        // A4 = 210mm × 297mm
        pdf.addImage(
          image,
          "PNG",
          0,
          0,
          210,
          297,
          undefined,
          "FAST"
        );

        pageAdded = true;
      }

      if (!pageAdded) {
        setError(
          "No album pages were found. Please generate the album first."
        );
        return;
      }

      const safeName =
        albumTitle
          .trim()
          .replace(
            /[^a-z0-9]+/gi,
            "_"
          )
          .replace(
            /^_+|_+$/g,
            ""
          ) ||
        "Memora_Album";

      pdf.save(
        `${safeName}.pdf`
      );
    } catch (pdfError) {
      console.error(
        "PDF generation error:",
        pdfError
      );

      setError(
        "Could not create the PDF. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const createAnotherAlbum = () => {
    setAlbumTitle("Moments");
    setPhotos([]);
    setStory("");
    setShowResult(false);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#f4eadc] px-4 py-8 text-[#292421]">

      <div className="mx-auto max-w-6xl">

        {!showResult ? (
          <>
            {/* =====================================
                CREATE SCREEN
            ====================================== */}

            <section className="mx-auto max-w-4xl py-12 text-center">

              <div className="relative mx-auto mb-7 h-20 w-20">

                <div className="absolute inset-0 rotate-[-6deg] bg-[#25211f] shadow-[7px_8px_0_rgba(104,76,55,0.18)]" />

                <div className="relative flex h-full w-full items-center justify-center text-4xl font-black text-[#f8eee2]">
                  M
                </div>

                <span className="absolute -right-7 -top-5 rotate-12 text-3xl text-[#e58ca7]">
                  ♡
                </span>

                <span className="absolute -bottom-5 -left-5 rotate-[-15deg] text-2xl text-[#718b69]">
                  ❀
                </span>

              </div>

              <p className="text-xs font-black uppercase tracking-[0.55em] text-[#9b704d]">
                MEMORA
              </p>

              <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">
                Your moments.
                <br />

                <span className="font-serif italic">
                  Your story.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#71675f]">
                Turn your favourite
                photographs into a
                beautiful memory album,
                with a unique story
                written for every
                photograph.
              </p>

              <div className="mt-6 flex justify-center gap-5 text-2xl">

                <span className="text-[#e59bad]">
                  ♡
                </span>

                <span className="text-[#a98bc2]">
                  ✦
                </span>

                <span className="text-[#e2bb62]">
                  ❀
                </span>

                <span className="text-[#718b69]">
                  ♡
                </span>

              </div>

            </section>

            {/* TITLE */}

            <section className="mx-auto max-w-3xl rounded-[2rem] border border-[#d5c6b8] bg-[#fbf5ec] p-7 shadow-[0_18px_45px_rgba(73,55,40,0.08)]">

              <label
                htmlFor="album-title"
                className="text-xs font-black uppercase tracking-[0.22em] text-[#9b704d]"
              >
                Name your memory album
              </label>

              <input
                id="album-title"
                value={albumTitle}
                onChange={(event) =>
                  setAlbumTitle(
                    event.target.value
                  )
                }
                className="mt-3 w-full border-b-2 border-[#d7c8b9] bg-transparent px-1 py-3 text-3xl font-black outline-none focus:border-[#d88ca2]"
                placeholder="Moments"
              />

            </section>

            {/* UPLOAD */}

            <section className="mx-auto mt-6 max-w-3xl rounded-[2rem] border border-[#d5c6b8] bg-[#fbf5ec] p-7 shadow-[0_18px_45px_rgba(73,55,40,0.08)]">

              <div className="mb-6 flex items-end justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.25em] text-[#9b704d]">
                    Step 01
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Choose your memories
                  </h2>

                </div>

                <span className="rounded-full bg-[#e7d5c6] px-4 py-2 text-sm font-black text-[#66594f]">
                  {photos.length}/5
                </span>

              </div>

              <ImageUpload
                onImagesSelected={
                  handleImagesSelected
                }
              />

              {photos.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-7 sm:grid-cols-3 md:grid-cols-5">

                  {photos.map(
                    (photo, index) => (

                      <div
                        key={photo.id}
                        className={`group relative ${
                          index % 2 === 0
                            ? "rotate-[2deg]"
                            : "-rotate-[2deg]"
                        } transition duration-300 hover:rotate-0 hover:scale-105`}
                      >

                        <div className="absolute -top-4 left-1/2 z-20 h-7 w-16 -translate-x-1/2 rotate-[-4deg] bg-[#e1c48f]/80" />

                        <div className="bg-white p-2 pb-8 shadow-[0_12px_25px_rgba(55,42,30,0.2)]">

                          <div className="overflow-hidden bg-[#cdb7d8] p-1">

                            <img
                              src={photo.url}
                              alt={`Photo ${index + 1}`}
                              className="aspect-square w-full object-cover"
                            />

                          </div>

                          <p className="mt-3 text-center font-serif text-xs italic text-[#95887e]">
                            memory #
                            {index + 1}
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removePhoto(
                              photo.id
                            )
                          }
                          className="absolute -right-2 -top-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-[#292421] text-sm font-black text-white shadow-md transition hover:bg-[#d95c78]"
                        >
                          ×
                        </button>

                        <span className="absolute -bottom-5 -right-3 text-xl text-[#76906f]">
                          {index % 2 ===
                          0
                            ? "🌿"
                            : "♡"}
                        </span>

                      </div>

                    )
                  )}

                </div>
              )}

            </section>

            {/* AI */}

            <section className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-[2rem] bg-[#282321] p-7 text-[#f8efe4] shadow-[0_18px_45px_rgba(40,32,25,0.22)]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.3em] text-[#d7b477]">
                    Step 02
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Let Memora tell the story
                  </h2>

                </div>

                <span className="text-3xl">
                  ✨
                </span>

              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">

                <div className="rounded-2xl bg-white/10 p-5">

                  <span className="text-2xl">
                    👁️
                  </span>

                  <p className="mt-3 font-black">
                    Understand
                  </p>

                  <p className="mt-1 text-sm text-[#d2cbc2]">
                    Understands the visual
                    story of every photo.
                  </p>

                </div>

                <div className="rounded-2xl bg-white/10 p-5">

                  <span className="text-2xl">
                    ✍️
                  </span>

                  <p className="mt-3 font-black">
                    Write
                  </p>

                  <p className="mt-1 text-sm text-[#d2cbc2]">
                    Creates a caption based
                    on the place and
                    situation.
                  </p>

                </div>

                <div className="rounded-2xl bg-white/10 p-5">

                  <span className="text-2xl">
                    📖
                  </span>

                  <p className="mt-3 font-black">
                    Preserve
                  </p>

                  <p className="mt-1 text-sm text-[#d2cbc2]">
                    Turns the moments into
                    a beautiful album.
                  </p>

                </div>

              </div>

            </section>

            {error && (
              <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mx-auto mt-7 max-w-3xl">

              <button
                type="button"
                onClick={generateAlbum}
                disabled={
                  loading ||
                  photos.length === 0
                }
                className="w-full rounded-2xl bg-[#d86f8b] px-6 py-5 text-lg font-black text-white shadow-[0_12px_30px_rgba(175,82,105,0.28)] transition hover:-translate-y-1 hover:bg-[#c85d79] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "✨ Creating your story..."
                  : "✨ Create My Memory Album"}
              </button>

              <p className="mt-3 text-center text-xs text-[#81766b]">
                AI creates a unique
                caption for every
                photograph.
              </p>

            </div>
          </>

        ) : (

          <>
            {/* =====================================
                GENERATED ALBUM HEADER
            ====================================== */}

            <section className="mx-auto max-w-4xl py-10 text-center">

              <div className="flex justify-center gap-5 text-2xl">

                <span className="text-[#e58da5]">
                  ♡
                </span>

                <span className="text-[#a58ac2]">
                  ✦
                </span>

                <span className="text-[#e3bd63]">
                  ❀
                </span>

              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-[0.55em] text-[#9b704d]">
                YOUR MEMORA
              </p>

              <h1 className="mt-4 text-5xl font-black sm:text-6xl">
                {albumTitle}
              </h1>

              <p className="mt-4 text-[#71675e]">
                Little moments,
                beautifully preserved.
              </p>

            </section>

            {/* =====================================
                SCRAPBOOK COVER
            ====================================== */}

            <div className="mb-12 overflow-hidden rounded-[2rem] bg-white p-0 shadow-xl">

              <div
                id="album-cover-page"
                className="relative mx-auto flex h-[1123px] w-[794px] overflow-hidden bg-[#f8f0df] text-[#29231f]"
              >

                <div className="absolute inset-0 bg-[#f8f0df]" />

                <div className="absolute -left-32 -top-32 h-[430px] w-[430px] rotate-12 rounded-full bg-[#e8b9c5]" />

                <div className="absolute -right-32 -top-24 h-[360px] w-[360px] -rotate-12 rounded-full bg-[#cdb7dc]" />

                <div className="absolute -bottom-36 -left-20 h-[430px] w-[430px] rotate-[-15deg] rounded-full bg-[#e8d27a]" />

                <div className="absolute -bottom-40 -right-20 h-[400px] w-[400px] rotate-12 rounded-full bg-[#b8caa9]" />

                <div className="absolute left-[-40px] top-[250px] h-16 w-72 rotate-[-8deg] bg-[#e5c4d0]" />

                <div className="absolute right-[-45px] top-[420px] h-20 w-80 rotate-[9deg] bg-[#ead27b]" />

                <span className="absolute left-16 top-20 rotate-[-12deg] text-7xl">
                  ✿
                </span>

                <span className="absolute right-20 top-32 rotate-[14deg] text-6xl text-[#d57991]">
                  ♡
                </span>

                <span className="absolute left-20 bottom-36 rotate-[-15deg] text-6xl text-[#718d6c]">
                  🌿
                </span>

                <span className="absolute right-20 bottom-28 rotate-[10deg] text-7xl">
                  ✦
                </span>

                <span className="absolute left-32 top-[330px] text-4xl text-[#a681b7]">
                  ✧
                </span>

                <span className="absolute right-32 top-[610px] text-4xl text-[#d7869c]">
                  ❀
                </span>

                <div className="absolute left-[105px] top-[190px] z-30 h-10 w-32 rotate-[-12deg] bg-[#e4c995]/80" />

                <div className="absolute right-[105px] bottom-[190px] z-30 h-10 w-32 rotate-[8deg] bg-[#e4c995]/80" />

                <div className="relative z-20 flex w-full flex-col items-center justify-center px-16 text-center">

                  <div className="mb-8 rotate-[-3deg] bg-white px-8 py-4 shadow-[8px_10px_0_rgba(70,50,40,0.12)]">

                    <p className="text-sm font-black uppercase tracking-[0.45em] text-[#9a7050]">
                      MEMORA
                    </p>

                  </div>

                  <div className="rotate-[2deg] bg-[#f1c6d2] px-12 py-7 shadow-[12px_14px_0_rgba(70,50,40,0.12)]">

                    <h1 className="font-serif text-[82px] font-black italic leading-[0.85] tracking-tight text-[#302824]">
                      SCRAPBOOK
                    </h1>

                  </div>

                  <div className="mt-10 rotate-[-2deg] bg-[#fff4c5] px-8 py-5 shadow-[8px_9px_0_rgba(70,50,40,0.10)]">

                    <p className="font-serif text-2xl italic text-[#51443c]">
                      little moments,
                      big memories
                    </p>

                  </div>

                  <div className="mt-12 flex items-center gap-5 text-2xl">

                    <span className="h-[2px] w-20 bg-[#9d8069]" />

                    <span className="text-[#d57991]">
                      ♡
                    </span>

                    <span className="text-[#9d8069]">
                      ✦
                    </span>

                    <span className="text-[#718d6c]">
                      ❀
                    </span>

                    <span className="text-[#d57991]">
                      ♡
                    </span>

                    <span className="h-[2px] w-20 bg-[#9d8069]" />

                  </div>

                </div>

                <p className="absolute bottom-20 left-20 rotate-[-7deg] font-serif text-lg italic text-[#806f62]">
                  made with memories ♡
                </p>

                <p className="absolute right-20 top-24 rotate-[8deg] font-serif text-lg italic text-[#806f62]">
                  ✦ keep these moments ✦
                </p>

              </div>

            </div>

            {/* =====================================
                PHOTO PAGES
            ====================================== */}

            {photos.map(
              (photo, index) => {

                const paper =
                  paperColors[
                    index %
                      paperColors.length
                  ];

                const rotation =
                  index % 2 === 0
                    ? "rotate-[1deg]"
                    : "rotate-[-1.5deg]";

                return (

                  <div
                    key={photo.id}
                    className="mb-12 overflow-hidden rounded-[2rem] bg-white p-0 shadow-xl"
                  >

                    <div
                      id={`album-photo-page-${index}`}
                      className="relative mx-auto flex h-[1123px] w-[794px] flex-col overflow-hidden bg-[#f8eee3] px-14 py-12"
                    >

                      <div
                        className="absolute -right-24 -top-20 h-64 w-64 rounded-full"
                        style={{
                          background:
                            "#f1c0cb",
                        }}
                      />

                      <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#d1bfdf]" />

                      <div
                        className="absolute right-[-40px] top-[330px] h-20 w-72 rotate-[13deg]"
                        style={{
                          background:
                            "#efd46b",
                        }}
                      />

                      <div className="relative z-20 flex items-center justify-between">

                        <div className="rotate-[-2deg] bg-[#282321] px-4 py-2">

                          <p className="text-xs font-black uppercase tracking-[0.3em] text-white">
                            MEMORA
                          </p>

                        </div>

                        <div className="rotate-[2deg] bg-white px-4 py-2 shadow-sm">

                          <p className="font-mono text-xs font-bold text-[#73665e]">
                            MEMORY{" "}
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </p>

                        </div>

                      </div>

                      <span className="absolute right-10 top-28 z-20 rotate-12 text-5xl text-[#d77e98]">
                        {
                          decorations[
                            index %
                              decorations.length
                          ]
                        }
                      </span>

                      <span className="absolute left-7 top-[390px] z-20 -rotate-12 text-4xl text-[#718b68]">
                        🌿
                      </span>

                      <div className="relative z-10 mt-10 flex flex-1 items-center justify-center">

                        <div
                          className={`relative w-full max-w-[650px] ${rotation}`}
                        >

                          <div
                            className="absolute -left-5 -top-5 h-full w-full rotate-[-3deg]"
                            style={{
                              background:
                                paper,
                            }}
                          />

                          <div className="absolute -right-7 bottom-8 h-40 w-24 rotate-[12deg] bg-[#ead067]" />

                          <div className="absolute -top-8 left-1/2 z-40 h-10 w-28 -translate-x-1/2 rotate-[-4deg] bg-[#e4c693]/85" />

                          <span className="absolute -right-9 -top-10 z-40 text-5xl">
                            {index % 2 ===
                            0
                              ? "🌸"
                              : "✿"}
                          </span>

                          <div className="relative z-20 bg-white p-5 pb-12 shadow-[0_22px_42px_rgba(55,42,31,0.24)]">

                            <div
                              className="relative overflow-hidden p-4"
                              style={{
                                background:
                                  paper,
                              }}
                            >

                              <div className="overflow-hidden bg-[#ded4ca]">

                                <img
                                  src={
                                    photo.url
                                  }
                                  alt={`Memory ${
                                    index +
                                    1
                                  }`}
                                  className="h-[610px] w-full object-cover"
                                />

                              </div>

                            </div>

                            <p className="mt-4 text-center font-serif text-sm italic text-[#92857d]">
                              a little piece of life ♡
                            </p>

                          </div>

                        </div>

                      </div>

                      <div className="relative z-30 pb-5">

                        <div className="relative mx-auto max-w-[610px]">

                          <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-[1deg] bg-[#d7b9df]" />

                          <div className="relative rotate-[-1deg] bg-[#fff5c9] px-8 py-7 shadow-[0_10px_25px_rgba(66,49,35,0.15)]">

                            <div className="absolute -top-5 left-1/2 h-7 w-24 -translate-x-1/2 rotate-[3deg] bg-[#e7c999]/80" />

                            <div className="text-center">

                              <span className="font-serif text-4xl text-[#d59aab]">
                                “
                              </span>

                              <p className="mx-auto max-w-[530px] font-serif text-[25px] font-bold italic leading-[1.35] text-[#3e332f]">
                                {photo.caption ||
                                  "A moment captured with love."}
                              </p>

                              <span className="font-serif text-4xl text-[#d59aab]">
                                ”
                              </span>

                            </div>

                            <div className="mt-3 flex items-center justify-center gap-3">

                              <span className="h-px w-12 bg-[#cbb694]" />

                              <span className="text-sm text-[#a17b55]">
                                ✦
                              </span>

                              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#9a897c]">
                                captured memory
                              </span>

                              <span className="text-sm text-[#a17b55]">
                                ✦
                              </span>

                              <span className="h-px w-12 bg-[#cbb694]" />

                            </div>

                          </div>

                        </div>

                      </div>

                      <span className="absolute bottom-12 right-14 z-20 rotate-12 text-3xl text-[#d99aae]">
                        ♡
                      </span>

                      <span className="absolute bottom-8 left-14 z-20 -rotate-6 text-2xl text-[#8b9a79]">
                        ✦
                      </span>

                    </div>

                  </div>

                );
              }
            )}

            {/* =====================================
                FINAL PAGE — CENTERED + BORDER
            ====================================== */}

            <div className="mb-12 overflow-hidden rounded-[2rem] bg-white p-0 shadow-xl">

              <div
  id="album-summary-page"
  className="relative mx-auto flex h-[1123px] w-[794px] min-w-[794px] max-w-[794px] flex-shrink-0 flex-col items-center justify-center overflow-hidden bg-[#282321] px-16 py-16 text-[#f8efe5]"
>

                {/* OUTER DECORATIVE BORDER */}

                <div className="pointer-events-none absolute inset-8 z-20 rounded-[28px] border-[5px] border-[#e4c77a]" />

                {/* INNER BORDER */}

                <div className="pointer-events-none absolute inset-12 z-20 rounded-[22px] border border-[#e7b6c5]/70" />

                {/* Pink paper */}

                <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-[#d88fa5]" />

                {/* Purple paper */}

                <div className="absolute -bottom-20 -left-20 h-72 w-96 rotate-[-8deg] bg-[#725684]" />

                {/* Yellow strip */}

                <div className="absolute right-[-50px] top-[430px] h-24 w-80 rotate-[12deg] bg-[#e4c55d]" />

                {/* Decorations */}

                <span className="absolute right-24 top-28 z-30 text-6xl">
                  ♡
                </span>

                <span className="absolute left-12 top-28 z-30 text-5xl text-[#e4b9c5]">
                  ✦
                </span>

                <span className="absolute bottom-32 right-20 z-30 text-5xl">
                  🌸
                </span>

                <span className="absolute bottom-20 left-14 z-30 text-4xl">
                  🌿
                </span>

                {/* CENTERED CONTENT */}

                <div className="relative z-30 flex w-full max-w-[650px] flex-col items-center text-center">

                  <div className="rotate-[-2deg] bg-[#f0d46c] px-5 py-3 text-[#282321] shadow-md">

                    <p className="text-xs font-black uppercase tracking-[0.3em]">
                      MEMORA
                    </p>

                  </div>

                  <h2 className="mt-10 font-serif text-6xl font-black italic leading-[0.9] sm:text-7xl">
                    Memories
                    <br />
                    to cherish.
                  </h2>

                  {/* STORY CARD */}

                  <div className="mt-10 w-full rotate-[1deg] bg-[#fff5c9] p-8 text-[#3f3530] shadow-[0_15px_35px_rgba(0,0,0,0.2)]">

                    <div className="mb-4 text-3xl text-[#d47d98]">
                      ♡ ✦ ♡
                    </div>

                    <div className="whitespace-pre-line font-serif text-xl leading-9">
                      {story}
                    </div>

                  </div>

                  {/* CLOSING MESSAGE */}

                  <div className="mt-10 border-t border-white/20 pt-7">

                    <div className="mb-4 text-xl text-[#e5c775]">
                      ♡ &nbsp; ✦ &nbsp; ❀ &nbsp; ✦ &nbsp; ♡
                    </div>

                    <p className="font-serif text-lg italic text-[#d8cec2]">
                      Some moments pass.
                      <br />
                      The memories stay.
                    </p>

                    <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-[#9f9388]">
                      Your Life. Your Story. Your Memora.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mx-auto mb-6 max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* BUTTONS */}

            <div className="mx-auto flex max-w-3xl flex-col gap-3 pb-10 sm:flex-row">

              <button
                type="button"
                onClick={downloadPDF}
                className="flex-1 rounded-2xl bg-[#282321] px-6 py-5 text-lg font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-black"
              >
                📥 Download Album PDF
              </button>

              <button
                type="button"
                onClick={createAnotherAlbum}
                className="flex-1 rounded-2xl border border-[#d0c2b5] bg-[#fbf5ec] px-6 py-5 text-lg font-black text-[#403a35] transition hover:bg-white"
              >
                + Create Another Album
              </button>

            </div>

          </>
        )}

      </div>
    </main>
  );
}