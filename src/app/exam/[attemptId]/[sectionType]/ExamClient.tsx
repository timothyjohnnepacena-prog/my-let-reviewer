'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { submitAnswer, finishSection } from './actions'

type Choice = { id: string; text: string; is_correct: boolean; question_id: string }
type Question = {
    id: string;
    question_text: string;
    category: string;
    major: string | null;
    choices: Choice[];
}

export default function ExamClient({ attemptId, sectionType, allQuestions }: { attemptId: string, sectionType: string, allQuestions: Question[] }) {
    const router = useRouter()
    
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [timeLeft, setTimeLeft] = useState(7200) 
    const [isFinished, setIsFinished] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showCompletionAlert, setShowCompletionAlert] = useState(false)

    useEffect(() => {
        const storageKey = `exam_${attemptId}_${sectionType}`
        const savedData = localStorage.getItem(storageKey)
        
        if (savedData) {
            const parsed = JSON.parse(savedData)
            setQuestions(parsed.questions)
            setAnswers(parsed.answers || {})
            if (parsed.timeLeft) setTimeLeft(parsed.timeLeft)
        } else {
            const majorStr = localStorage.getItem('selected_major') || ''
            
            let filtered = allQuestions
            if (sectionType === 'Major' && majorStr) {
                filtered = allQuestions.filter(q => q.major === majorStr)
            }
            
            const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 150)
            setQuestions(shuffled)
            
            localStorage.setItem(storageKey, JSON.stringify({
                questions: shuffled,
                answers: {},
                timeLeft: 7200
            }))
        }
    }, [allQuestions, attemptId, sectionType])

    // Timer
    useEffect(() => {
        if (questions.length === 0 || isFinished) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSectionFinish()
                    return 0
                }
                if (prev % 10 === 0) {
                    const storageKey = `exam_${attemptId}_${sectionType}`
                    const savedData = JSON.parse(localStorage.getItem(storageKey) || '{}')
                    localStorage.setItem(storageKey, JSON.stringify({ ...savedData, timeLeft: prev - 1 }))
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [questions, isFinished]) // eslint-disable-line react-hooks/exhaustive-deps

    const selectAnswer = async (choiceId: string) => {
        const currentQ = questions[currentIndex]
        const choice = currentQ.choices.find(c => c.id === choiceId)
        if (!choice) return

        const newAnswers = { ...answers, [currentQ.id]: choiceId }
        setAnswers(newAnswers)

        const storageKey = `exam_${attemptId}_${sectionType}`
        const savedData = JSON.parse(localStorage.getItem(storageKey) || '{}')
        localStorage.setItem(storageKey, JSON.stringify({ ...savedData, answers: newAnswers }))

        submitAnswer(attemptId, currentQ.id, choiceId, choice.is_correct).catch(console.error)
    }

    const handleSectionFinish = async () => {
        if (isSubmitting) return
        setIsSubmitting(true)
        setIsFinished(true)
        
        let score = 0
        questions.forEach(q => {
            const selectedChoiceId = answers[q.id]
            const isCorrect = q.choices.find(c => c.id === selectedChoiceId)?.is_correct
            if (isCorrect) score++
        })

        await finishSection(attemptId, sectionType, score)

        if (sectionType === 'GenEd') router.push(`/exam/${attemptId}/ProfEd`)
        else if (sectionType === 'ProfEd') router.push(`/exam/${attemptId}/Major`)
        else setShowCompletionAlert(true) 
    }

    if (showCompletionAlert) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Exam Completed!</h2>
                        <p className="text-gray-500 mt-2">Your answers have been securely saved and scored.</p>
                    </div>
                    <button 
                        onClick={() => router.push(`/results/${attemptId}`)}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        View Results
                    </button>
                </div>
            </div>
        )
    }

    if (questions.length === 0) {
        return <div className="flex-1 flex items-center justify-center animate-pulse text-xl font-bold text-blue-600">Generating your exact question set...</div>
    }

    const currentQ = questions[currentIndex]
    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600)
        const m = Math.floor((secs % 3600) / 60)
        const s = secs % 60
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto p-4 sm:p-6 pb-20 fade-in animate-in duration-500">
            {/* Header / Timer */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-6 sticky top-4 z-10 transition-shadow hover:shadow-md">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{sectionType} SECTION</span>
                    <span className="text-sm font-semibold text-gray-700">Question {currentIndex + 1} of {questions.length}</span>
                </div>
                <div className={`px-4 py-2 rounded-xl font-mono font-bold text-lg shadow-sm border ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Card */}
            <div className="flex-1 bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-relaxed mb-8">
                    {currentQ.question_text}
                </h2>

                <div className="flex flex-col gap-3 flex-1">
                    {(currentQ.choices || []).sort((a,b) => a.text.localeCompare(b.text)).map((choice) => {
                        const isSelected = answers[currentQ.id] === choice.id
                        return (
                            <button
                                key={choice.id}
                                onClick={() => selectAnswer(choice.id)}
                                className={`group p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 hover:shadow-sm
                                    ${isSelected 
                                        ? 'border-blue-500 bg-blue-50/50 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]' 
                                        : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50'}`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                                    ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                </div>
                                <span className={`text-base sm:text-lg font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                    {choice.text}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-6 py-3 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    &larr; Previous
                </button>
                
                {currentIndex === questions.length - 1 ? (
                    <button
                        onClick={handleSectionFinish}
                        disabled={isSubmitting}
                        className="px-8 py-3 font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-70"
                    >
                        {isSubmitting ? 'Sumitting...' : 'Submit Section'}
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        className="px-8 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                    >
                        Next &rarr;
                    </button>
                )}
            </div>
        </div>
    )
}
