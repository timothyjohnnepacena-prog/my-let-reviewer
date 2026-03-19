import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LET Exam Simulator",
  description: "A professional board exam preparation platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  }

  // This is the new Sign Out logic
  async function handleSignOut() {
    'use server'
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col`}>

        <header className="w-full p-4 border-b bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
              LET Reviewer
            </Link>
            <nav className="flex items-center gap-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="text-sm font-bold text-blue-600 hover:underline">
                      ADMIN PANEL
                    </Link>
                  )}
                  {/* Updated Sign Out Button */}
                  <form action={handleSignOut}>
                    <button className="text-sm font-medium text-gray-600 hover:text-red-600">
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium shadow hover:bg-blue-700 transition-colors">
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <footer className="w-full p-6 border-t bg-white text-center text-sm text-gray-500 mt-auto">
          © {new Date().getFullYear()} LET Reviewer System
        </footer>

      </body>
    </html>
  );
}