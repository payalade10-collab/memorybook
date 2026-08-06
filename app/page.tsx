import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white shadow">

        <h1 className="text-2xl font-bold text-blue-600">
          📖 MemoryBook 
        </h1>

        <div className="flex gap-8 text-gray-700 font-medium">
          <a href="/signup">Home</a>
          <a href="/signup">Features</a>
          <a href="/signup">Pricing</a>
          <a href="/signup">Login</a>
        </div>

      </nav>

      {/* Hero Section */}

      <section className="flex flex-col items-center justify-center text-center mt-24 px-6">

        <h2 className="text-5xl font-bold text-gray-900 leading-tight">
  Every Memory Deserves <br />
  a Beautiful Story ❤️
</h2>

<p className="mt-6 text-lg text-gray-600 max-w-2xl">
  Preserve birthdays, weddings, vacations, childhood moments, and every
  precious memory in a beautifully designed scrapbook that lasts forever.
</p>

      <Link href="/signup">
  <button className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition">
    Create My Scrapbook
  </button>
</Link>

      </section>
{/* Features Section */}

<section className="py-20 bg-gray-100">

  <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">
    Why Choose MemoryBook ?
  </h2>

  <div className="flex justify-center gap-8 flex-wrap px-10">

    <div className="bg-white p-8 rounded-2xl shadow-lg w-80 text-center">
      <div className="text-5xl">📸</div>
     <h3 className="text-2xl font-bold text-gray-800">
  Upload Memories
</h3>
      <p className="text-gray-600 mt-3">
        Upload your favorite photos and stories safely in one place.
      </p>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-lg w-80 text-center">
      <div className="text-5xl">🤖</div>
      <h3 className="text-2xl font-bold text-gray-800"> Scrapbook</h3>
      <p className="text-gray-600 mt-3">
        Our web beautifully arranges your memories into scrapbook pages.
      </p>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-lg w-80 text-center">
      <div className="text-5xl">👨‍👨‍👧‍👦</div>
      <h3 className="text-2xl font-bold text-gray-800">Share Forever</h3>
      <p className="text-gray-600 mt-3">
        Share your scrapbook with family and friends anywhere.
      </p>
    </div>

  </div>

</section>
{/* Why Choose Us */}

<section className="py-20 bg-amber-50">
  <h2 className="text-4xl font-bold text-center text-gray-900">
    Why Families Will Love MemoryBook ❤️
  </h2>

  <div className="flex flex-wrap justify-center gap-8 mt-12 px-8">

    <div className="bg-white p-8 rounded-2xl shadow-lg w-80">
      <h3 className="text-2xl font-bold text-gray-800">🔒 Private & Secure</h3>
      <p className="mt-4 text-gray-600">
        Your memories belong to you. We keep your photos and stories safe and private.
      </p>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-lg w-80">
      <h3 className="text-2xl font-bold text-gray-800">🤖 AI-Powered</h3>
      <p className="mt-4 text-gray-600">
        AI automatically creates beautiful scrapbook pages from your memories.
      </p>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-lg w-80">
      <h3 className="text-2xl font-bold text-gray-800">❤️ Made for Families</h3>
      <p className="mt-4 text-gray-600">
        Celebrate birthdays, weddings, vacations, and every special moment together.
      </p>
    </div>

  </div>
</section>
<footer className="text-center py-6 text-gray-500">
  Made with ❤️ by Payal
</footer>
    </main>
  );
}
