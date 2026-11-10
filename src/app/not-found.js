import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="glass max-w-md p-10 text-center">
        <p className="text-6xl font-bold">404</p>
        <h1 className="mt-2 text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-white/70">
          The page you are looking for does not exist or was moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-400"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
