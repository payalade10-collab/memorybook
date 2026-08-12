"use client";

import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "./lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      alert("Account Created Successfully! 🎉");

      router.push("/generate");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-[420px]">
        <h1 className="text-4xl font-bold text-center text-blue-600">
          Join Memora ❤️
        </h1>

        <p className="text-center text-gray-500 mt-3 mb-8">
          Create your account and preserve your memories forever.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg text-black placeholder-gray-500"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg text-black placeholder-gray-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg text-black placeholder-gray-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            Create Account
          </button>
        </form>

      
        <p className="text-center text-gray-600 mt-6">
  Already have an account?{" "}
  <Link
    href="/login"
    className="text-blue-600 font-semibold hover:underline"
  >
    Login
  </Link>
</p>
      </div>
    </main>
  );
}