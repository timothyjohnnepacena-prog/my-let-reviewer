import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 py-12">

      <div className="space-y-4 max-w-3xl">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
          Welcome to your <span className="text-blue-600">Full-Stack App</span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-600">
          This is a mobile-first, responsive starter template. It is fully wired up with Next.js App Router, Tailwind CSS, and Supabase.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
        <Link href="/login" className="flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Get Started
        </Link>
        <button className="w-full sm:w-auto px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold shadow-sm hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          View Documentation
        </button>
      </div>

    </div>
  );
}