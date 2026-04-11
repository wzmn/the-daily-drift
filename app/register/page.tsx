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

  // 1. Check for an active session
  const { data: session, isPending } = authClient.useSession();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return; // Extra safety check

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

  // 2. While checking session, show a clean loader
  if (isPending) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 font-mono tracking-widest">
          AUTHENTICATING SYSTEM...
        </div>
      </div>
    );
  }

  // 3. If NOT logged in, show an "Access Denied" state
  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl border border-red-900/30 text-center">
          <div className="text-red-500 mb-4 text-4xl">⚠</div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">
            Access Restricted
          </h2>
          <p className="text-zinc-400 mt-2 text-sm">
            Only authorized administrators can register new engine accounts.
          </p>
          <Link 
            href="/login" 
            className="mt-6 inline-block bg-white text-black px-6 py-2 rounded-lg font-bold text-sm"
          >
            SIGN IN TO CONTINUE
          </Link>
        </div>
      </div>
    );
  }

  // 4. If logged in, show the registration form
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">
              Admin Session Active
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tighter uppercase">
            Create Account
          </h2>
          <p className="text-zinc-400 mt-1 text-sm">Register a new operator for the drift engine.</p>
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
                placeholder="Name"
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
                placeholder="name@thedailydraft.xyz"
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
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            {loading ? "INITIALIZING..." : "CONFIRM REGISTER"}
          </button>
        </form>
      </div>
    </div>
  );
}