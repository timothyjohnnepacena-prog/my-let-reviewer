'use client'

import { useState } from 'react'
import { parsePDF, bulkInsertQuestions } from './actions'

export default function ImportPage() {
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState('GenEd') // Matches your ENUM
    const [major, setMajor] = useState('')

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0]) return

        setLoading(true)
        const formData = new FormData()
        formData.append('file', e.target.files[0])

        try {
            const data = await parsePDF(formData)
            setQuestions(data)
            if (data.length === 0) alert('No questions detected. Check PDF format.')
        } catch (err) {
            alert('Failed to parse PDF')
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setLoading(true)
        try {
            await bulkInsertQuestions(category, major, questions)
            alert('Saved successfully to Supabase!')
            setQuestions([])
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error saving to database')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Import Questions</h1>

            <div className="flex flex-col gap-6 mb-8 p-6 border rounded-xl bg-white shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-600">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="GenEd">General Education</option>
                            <option value="ProfEd">Professional Education</option>
                            <option value="Major">Major</option>
                        </select>
                    </div>

                    {category === 'Major' && (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-600">Major Subject</label>
                            <input
                                type="text"
                                placeholder="e.g. English"
                                value={major}
                                onChange={(e) => setMajor(e.target.value)}
                                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600">Select PDF File</label>
                    <input type="file" accept=".pdf" onChange={handleUpload} disabled={loading} className="text-sm" />
                </div>
            </div>

            {loading && <p className="text-blue-500 font-medium animate-pulse">Processing...</p>}

            {questions.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Preview ({questions.length} questions)</h2>
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all"
                            disabled={loading}
                        >
                            Confirm & Save to Database
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto border rounded-xl p-4 bg-gray-50">
                        {questions.map((q, i) => (
                            <div key={i} className="p-4 bg-white border rounded-lg shadow-sm">
                                <p className="font-bold text-gray-800 mb-2">{i + 1}. {q.question_text}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                                    {q.choices.map((c: any, ci: number) => (
                                        <div
                                            key={ci}
                                            className={`p-2 rounded text-sm border ${c.is_correct ? 'bg-green-100 border-green-500 font-bold text-green-800' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                                        >
                                            {c.letter}. {c.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}