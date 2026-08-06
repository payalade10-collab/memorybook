"use client";

import { useState } from "react";

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
}

export default function ImageUpload({
  onImageSelected,
}: ImageUploadProps) {
  const [preview, setPreview] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));
    onImageSelected(file);
  };

  return (
    <div className="mb-6">
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="text-grey-700 file:bg-blue-600 file:text-white file:px-4 file:py-2 file:rounded-lg file:border-o file:cursor-pointer hover:file:bg-blue-700"
      />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mt-4 w-full h-64 object-cover rounded-xl shadow"
        />
      )}
    </div>
  );
}