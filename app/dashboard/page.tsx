"use client";

import { useEffect, useState } from "react";
import { db } from "../signup/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import MemoryForm from "../components/MemoryForm";
import MemoryCard from "../components/MemoryCard";

interface Memory {
  id: string;
  title: string;
  story: string;
  imageUrl: string;
}

export default function Dashboard() {
  const [memories, setMemories] = useState<Memory[]>([]);

  const fetchMemories = async () => {
    const snapshot = await getDocs(collection(db, "memories"));

    const list: Memory[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Memory, "id">),
    }));

    console.table(list);

    setMemories(list);
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-10">
        📖 My Memories
      </h1>

      <MemoryForm />

      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-3xl font-bold mb-6">
          Saved Memories ❤️
        </h2>

        {memories.length === 0 ? (
          <p className="text-gray-500">No memories yet.</p>
        ) : (
          memories.map((memory) => (
            <MemoryCard
              key={memory.id}
              title={memory.title}
              story={memory.story}
              imageUrl={memory.imageUrl}
            />
          ))
        )}
      </div>
    </main>
  );
}