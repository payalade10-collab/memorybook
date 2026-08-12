"use client";

import React from "react";

interface PhotoItem {
  id: string;
  file: File;
  url: string;
  caption: string;
}

interface PhotoGridProps {
  photos: PhotoItem[];
  onRemove: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
}

export default function PhotoGrid({
  photos,
  onRemove,
  onCaptionChange,
}: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-10 text-center">
        <div className="text-5xl">📸</div>

        <h3 className="mt-4 text-xl font-bold text-gray-800">
          No photos selected
        </h3>

        <p className="mt-2 text-gray-500">
          Choose some memories to start your scrapbook.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-lg"
        >
          {/* Photo number */}
          <div className="absolute top-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-pink-600 text-white font-black shadow-lg">
            {index + 1}
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={() => onRemove(photo.id)}
            className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600 transition"
            aria-label={`Remove photo ${index + 1}`}
          >
            ×
          </button>

          {/* Image */}
          <img
            src={photo.url}
            alt={`Memory ${index + 1}`}
            className="h-64 w-full object-cover"
          />

          {/* Caption */}
          <div className="p-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ✍️ Caption
            </label>

            <input
              type="text"
              value={photo.caption}
              onChange={(e) =>
                onCaptionChange(photo.id, e.target.value)
              }
              placeholder="Write a caption..."
              maxLength={120}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-800 outline-none focus:border-pink-400"
            />

            <p className="mt-2 text-xs text-gray-400 text-right">
              {photo.caption.length}/120
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}