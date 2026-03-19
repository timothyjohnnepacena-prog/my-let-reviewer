'use client'

import { useState } from 'react'
import {
    insertQuestion,
    fetchExamSet,
    startExamAttempt,
    saveUserAnswer,
    getAttemptScore
} from '../../utils/exam-logic'

export default function TestBackend() {
    const [status, setStatus] = useState('Idle')
    const [attemptId, setAttemptId] = useState<string | null>(null)

    const logAction = (name: string, data: any) => {
        console.log(`--- ${name} ---`, data)
        setStatus(`Last Action: ${name} (Check Console)`)
    }

    const runInsertTest = async () => {
        try {
            const res = await insertQuestion({
                question_text: "Which professional attribute is most essential for a teacher?",
                category: "ProfEd",
                choices: [
                    { text: "Humility", is_correct: false },
                    { text: "Dedication", is_correct: true },
                    { text: "Physical Strength", is_correct: false },
                    { text: "Wealth", is_correct: false },
                ]
            })
            logAction("Insert Question", res)
        } catch (err) { console.error(err) }
    }

    const runFetchTest = async () => {
        try {
            const questions = await fetchExamSet('ProfEd')
            logAction("Fetch 150 Questions", questions)
        } catch (err) { console.error(err) }
    }

    const runAttemptTest = async () => {
        try {
            // Replace this with your actual User ID from Supabase Auth
            const userId = "YOUR_USER_ID_HERE"
            const attempt = await startExamAttempt(userId)
            setAttemptId(attempt.id)
            logAction("Start Attempt", attempt)
        } catch (err) { console.error("Make sure you are logged in!", err) }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold border-b pb-2">Step 2: Backend Test Lab</h1>
            <p className="bg-blue-50 p-3 rounded text-blue-700 text-sm">
                <strong>Status:</strong> {status}
            </p>

            <div className="grid grid-cols-1 gap-4">
                <button onClick={runInsertTest} className="p-4 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50">
                    1. Test Question Insertion
                </button>

                <button onClick={runFetchTest} className="p-4 bg-white border-2 border-green-600 text-green-600 font-bold rounded-xl hover:bg-green-50">
                    2. Test Random Fetch (150 Qs)
                </button>

                <button onClick={runAttemptTest} className="p-4 bg-white border-2 border-purple-600 text-purple-600 font-bold rounded-xl hover:bg-purple-50">
                    3. Test Start Exam Attempt
                </button>
            </div>

            <p className="text-xs text-gray-500 text-center italic">
                Open Browser Console (F12) to see the detailed data outputs.
            </p>
        </div>
    )
}