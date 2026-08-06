"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../signup/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);

      alert("Login Successful! 🎉");

      router.push("/generate");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-[420px]">
        <h1 className="text-4xl font-bold text-center text-blue-600">
          Welcome Back ❤️
        </h1>

        <p className="text-center text-gray-500 mt-3 mb-8">
          Login to continue your memories.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
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
            Login
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Don't have an account? Sign Up
        </p>
      </div>
    </main>
  );
}