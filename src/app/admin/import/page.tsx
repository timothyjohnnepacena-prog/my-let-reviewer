'use client'

import { useState } from 'react'
import { parsePDF, bulkInsertQuestions } from './actions'

export default function ImportPage() {
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState('General Education')
    const [major, setMajor] = useState('')

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0]) return

        setLoading(true)
        const formData = new FormData()
        formData.append('file', e.target.files[0])

        try {
            const data = await parsePDF(formData)
            setQuestions(data)
            if (data.length === 0) alert('No questions detected. Please use a clean .docx file.')
        } catch (err) {
            alert('Failed to parse file')
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setLoading(true)
        try {
            await bulkInsertQuestions(category, major, questions)
            alert('Questions saved to database!')
            setQuestions([])
        } catch (err) {
            alert('Error saving to database')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Import Questions from Docx</h1>

            <div className="flex flex-col gap-6 mb-8 p-6 border rounded-xl bg-white shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="p-2 border rounded-md"
                        >
                            <option>General Education</option>
                            <option>Professional Education</option>
                            <option>Major</option>
                        </select>
                    </div>

                    {category === 'Major' && (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">Major Subject</label>
                            <input
                                type="text"
                                placeholder="e.g., Mathematics"
                                value={major}
                                onChange={(e) => setMajor(e.target.value)}
                                className="p-2 border rounded-md"
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Upload .docx File</label>
                    <input type="file" accept=".docx" onChange={handleUpload} disabled={loading} />
                </div>
            </div>

            {loading && <p className="text-blue-600 font-bold animate-pulse">Processing file...</p>}

            {questions.length > 0 && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Preview: {questions.length} Questions Found</h2>
                        <button
                            onClick={handleSave}
                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                        >
                            Confirm & Save to Database
                        </button>
                    </div>

                    <div className="space-y-6 max-h-[500px] overflow-y-auto border rounded-xl p-4 bg-gray-50">
                        {questions.map((q, i) => (
                            <div key={i} className="p-4 bg-white border rounded-lg shadow-sm">
                                <p className="font-bold text-gray-800 mb-3">{i + 1}. {q.question_text}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {q.choices.map((c: any, ci: number) => (
                                        <div
                                            key={ci}
                                            className={`p-2 text-sm rounded border ${c.is_correct ? 'bg-green-100 border-green-500 font-bold text-green-800' : 'bg-white border-gray-200 text-gray-600'}`}
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