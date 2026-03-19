import Link from "next/link";
import { createClient } from "../utils/supabase/server";

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-10 py-12 animate-in fade-in duration-700 w-full px-4 relative">
      {/* Decorative Blur Background Element */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[120%] sm:w-3/4 max-w-3xl h-64 bg-blue-300 opacity-20 blur-3xl pointer-events-none rounded-full"></div>
      
      <div className="space-y-6 max-w-4xl relative z-10 text-center flex flex-col items-center">
        <div className="inline-block px-5 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm font-bold tracking-wider uppercase mb-2 shadow-sm">
          🏆 The Ultimate PRC Board Exam Prep
        </div>
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-[1.1]">
          Pass the LET on your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block mt-2">Very First Try.</span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed mt-6">
          Experience a full-length, highly accurate Licensure Examination for Teachers simulator. Custom-tailored to General Education, Professional Education, and your Major Specialization.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-10 relative z-10">
        {user ? (
          <Link href="/exam" className="flex items-center justify-center px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] hover:shadow-[0_12px_24px_-8px_rgba(59,130,246,0.6)] hover:-translate-y-1 transition-all">
            Start Simulation Now &rarr;
          </Link>
        ) : (
          <Link href="/login" className="flex items-center justify-center px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] hover:shadow-[0_12px_24px_-8px_rgba(59,130,246,0.6)] hover:-translate-y-1 transition-all">
            Sign In to Start Exam
          </Link>
        )}
      </div>
      
      {/* Features Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20 text-left relative z-10 w-full px-2">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-3">Timed Sections</h3>
          <p className="text-gray-500 font-medium leading-relaxed">Experience the pressure of the real exam with our strict 2-hour per section countdown timers.</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-3">Deep Analytics</h3>
          <p className="text-gray-500 font-medium leading-relaxed">Find out exactly what you got wrong and study your knowledge gaps to improve significantly.</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-3">Customized Majors</h3>
          <p className="text-gray-500 font-medium leading-relaxed">No matter what major you're taking, our engine randomly generates precise professional tracks.</p>
        </div>
      </div>
    </div>
  );
}