"use client";

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
}


export default function ImageUpload({
  onImagesSelected,
}: ImageUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    if (files.length > 5) {
      alert("Maximum 5 photos allowed.");
      e.target.value = "";
      return;
    }

    onImagesSelected(files);
  };

  return (
    <div className="mb-6">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="text-gray-700 file:bg-blue-600 file:text-white file:px-4 file:py-2 file:rounded-lg file:border-0 file:cursor-pointer hover:file:bg-blue-700"
      />

      <p className="mt-3 text-sm text-gray-500">
        Select 1 to 5 photos at once.
      </p>
    </div>
  );
}