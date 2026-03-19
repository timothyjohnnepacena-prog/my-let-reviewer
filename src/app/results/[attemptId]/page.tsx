import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
    const supabase = await createClient()
    const { attemptId } = await params

    const { data: attempt } = await supabase.from('exam_attempts').select('*').eq('id', attemptId).single()
    
    if (!attempt) redirect('/exam')

    const { data: sections } = await supabase.from('exam_sections').select('*').eq('attempt_id', attemptId)
    
    const genEd = sections?.find(s => s.section_type === 'GenEd')?.score || 0
    const profEd = sections?.find(s => s.section_type === 'ProfEd')?.score || 0
    const major = sections?.find(s => s.section_type === 'Major')?.score || 0

    // Standard requirement: 75/150 passing per section
    const isPassed = genEd >= 75 && profEd >= 75 && major >= 75
    const totalScore = genEd + profEd + major

    // Fetch incorrect answers
    // In Supabase, standard relations allow nesting
    const { data: wrongAnswersData } = await supabase
        .from('answers')
        .select(`
            selected_choice_id,
            questions (
                question_text,
                category,
                major,
                choices (
                    id, text, is_correct
                )
            )
        `)
        .eq('attempt_id', attemptId)
        .eq('is_correct', false)

    const wrongAnswers = (wrongAnswersData || []) as any[]

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-10 pb-20 fade-in animate-in duration-700">
            
            <div className="text-center space-y-6">
                <div className={`inline-block px-10 py-4 rounded-3xl font-black text-4xl sm:text-6xl tracking-tight shadow-xl
                    ${isPassed ? 'text-green-700 bg-green-100 border-4 border-green-300' : 'text-red-700 bg-red-100 border-4 border-red-300'}`}>
                    {isPassed ? 'PASSED' : 'FAILED'}
                </div>
                <p className="text-xl font-medium text-gray-500">Total Score: <span className="font-bold text-gray-900">{totalScore} / 450</span></p>
                
                {attempt.status === 'auto_submitted' && (
                    <div className="bg-amber-100 text-amber-800 text-sm font-bold p-3 rounded-lg max-w-sm mx-auto">
                        ⚠️ Exam was auto-submitted due to time limit or anti-cheating violations.
                    </div>
                )}
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScoreCard title="General Education" score={genEd} passScore={75} maxScore={150} color="emerald" />
                <ScoreCard title="Professional Education" score={profEd} passScore={75} maxScore={150} color="amber" />
                <ScoreCard title="Major Specialization" score={major} passScore={75} maxScore={150} color="purple" />
            </div>

            {/* Incorrect Answers Review */}
            <div className="mt-16 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Incorrect Answers Review</h2>
                
                {wrongAnswers.length === 0 ? (
                    <p className="text-gray-500 italic p-6 bg-white rounded-xl">Awesome! You didn't get a single question wrong (or you skipped them all!).</p>
                ) : (
                    <div className="space-y-6">
                        {wrongAnswers.map((answer, i) => {
                            const question = answer.questions
                            if (!question) return null
                            
                            const selectedChoice = question.choices.find((c: any) => c.id === answer.selected_choice_id)
                            const correctChoice = question.choices.find((c: any) => c.is_correct)

                            return (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900 leading-relaxed max-w-3xl">
                                            {i + 1}. {question.question_text}
                                        </h3>
                                        <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-3 py-1 rounded-full shrink-0">
                                            {question.category}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 mt-2">
                                        <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl flex items-start gap-3">
                                            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-red-400 uppercase tracking-wider mb-0.5">Your Answer</span>
                                                <span className="text-red-900 font-medium">{selectedChoice?.text || 'No Answer / Skipped'}</span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-green-50/50 border border-green-200 rounded-xl flex items-start gap-3">
                                            <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-green-500 uppercase tracking-wider mb-0.5">Correct Answer</span>
                                                <span className="text-green-900 font-bold">{correctChoice?.text || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="flex justify-center pt-8">
                <Link href="/" className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg">
                    Return to Home
                </Link>
            </div>
        </div>
    )
}

function ScoreCard({ title, score, passScore, maxScore, color }: { title: string, score: number, passScore: number, maxScore: number, color: 'emerald' | 'amber' | 'purple' }) {
    const isPassed = score >= passScore
    const colors = {
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-800',
        amber: 'bg-amber-50 border-amber-100 text-amber-800',
        purple: 'bg-purple-50 border-purple-100 text-purple-800',
    }

    return (
        <div className={`p-6 rounded-3xl border shadow-sm flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden ${colors[color]}`}>
            <h3 className="font-bold tracking-tight uppercase text-sm opacity-80">{title}</h3>
            <div className="text-4xl font-black">{score} <span className="text-xl font-medium opacity-60">/ {maxScore}</span></div>
            <div className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${isPassed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                {isPassed ? 'Passed Section' : 'Failed Section'}
            </div>
        </div>
    )
}
