"use client";

import { useState } from "react";
import { db } from "../signup/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadImage } from "../lib/cloudinary";
import ImageUpload from "./ImageUpload";

export default function MemoryForm() {
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const saveMemory = async () => {
    if (!title || !story || !image) {
      alert("Please select an image and fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const imageUrl = await uploadImage(image);

      await addDoc(collection(db, "memories"), {
        title,
        story,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      alert("Memory Saved ❤️");

      setTitle("");
      setStory("");
      setImage(null);
    } catch (error) {
      console.error(error);
      alert("Failed to save memory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto">
      <ImageUpload onImageSelected={setImage} />

      <input
        type="text"
        placeholder="Memory Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-3 rounded-lg mb-4 text-black"
      />

      <textarea
        placeholder="Write your memory..."
        value={story}
        onChange={(e) => setStory(e.target.value)}
        className="w-full border p-3 rounded-lg mb-4 text-black"
        rows={5}
      />

      <button
        onClick={saveMemory}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Memory"}
      </button>
    </div>
  );
}