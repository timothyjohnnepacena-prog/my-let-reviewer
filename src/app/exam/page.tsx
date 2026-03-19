'use client'

import { startExam } from './actions'

export default function ExamLandingPage() {
    return (
        <div className="max-w-2xl mx-auto p-6 md:p-12 animate-in fade-in zoom-in duration-500">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">LET Simulation Exam</h1>
                    <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
                        You are about to start a full-length simulation. You will be tested on General Education, Professional Education, and your selected Major.
                    </p>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col gap-4">
                    <h3 className="font-bold text-gray-900 border-b border-blue-200 pb-2">Exam Guidelines</h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-3">
                            <span className="text-blue-500">⏰</span>
                            <span>You have exactly <strong>2 hours</strong> for each 150-item section.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-500">✓</span>
                            <span>Answers are automatically saved. It auto-submits when time runs out.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-red-500 font-bold">⚠️</span>
                            <span><strong>No tab switching allowed.</strong> Your attempt will be flagged and auto-submitted after 3 violations.</span>
                        </li>
                    </ul>
                </div>

                <form
                    action={startExam}
                    onSubmit={(e) => {
                        const formData = new FormData(e.currentTarget);
                        const major = formData.get('major');
                        if (major) localStorage.setItem('selected_major', major as string);
                    }}
                    className="space-y-6 pt-4"
                >
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-900">Select Your Major Area</label>
                        <div className="relative">
                            <select
                                name="major"
                                required
                                defaultValue=""
                                className="w-full p-4 pl-5 pr-12 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all appearance-none text-lg outline-none cursor-pointer shadow-sm"
                            >
                                <option value="" disabled>Choose your specialization...</option>
                                <option value="English">English</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Biological Sciences">Biological Sciences</option>
                                <option value="Physical Sciences">Physical Sciences</option>
                                <option value="Filipino">Filipino</option>
                                <option value="Social Studies">Social Studies</option>
                                <option value="Values Education">Values Education</option>
                                <option value="MAPEH">MAPEH</option>
                                <option value="TLE">TLE</option>
                            </select>
                            <svg className="w-6 h-6 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-lg rounded-xl shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] hover:shadow-[0_12px_24px_-8px_rgba(59,130,246,0.6)] hover:-translate-y-1 transition-all"
                    >
                        START SIMULATION NOW
                    </button>
                </form>
            </div>
        </div>
    )
}
