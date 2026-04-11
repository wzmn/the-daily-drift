"use client";

import { useState } from "react";
import { authClient } from "@/lib/engine/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/dashboard",
    }, {
      onRequest: () => setLoading(true),
      onSuccess: () => {
        router.push("/dashboard");
        router.refresh();
      },
      onError: (ctx) => {
        alert(ctx.error.message);
        setLoading(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tighter uppercase">
            Create Account
          </h2>
          <p className="text-zinc-400 mt-2">Join The Daily Draft engine.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-lg py-3 px-4 text-white focus:ring-1 focus:ring-white outline-none transition"
                placeholder="Wiseman"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-lg py-3 px-4 text-white focus:ring-1 focus:ring-white outline-none transition"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-lg py-3 px-4 text-white focus:ring-1 focus:ring-white outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {loading ? "CREATING ACCOUNT..." : "REGISTER"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}