interface MemoryCardProps {
  title?: string;
  story?: string;
  imageUrl?: string;
}

export default function MemoryCard({
  title,
  story,
  imageUrl,
}: MemoryCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 p-4">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-72 object-cover rounded-xl"
        />
      ) : (
        <div className="w-full h-72 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
          No Photo
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-2xl font-bold text-blue-600">
          {title || "Untitled Memory"}
        </h2>

        <p className="mt-3 text-gray-700">
          {story || "No story available"}
        </p>
      </div>
    </div>
  );
}