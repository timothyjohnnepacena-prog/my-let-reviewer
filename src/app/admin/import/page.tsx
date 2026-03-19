'use client'

import { useState } from 'react'
import { parsePDF, bulkInsertQuestions } from './actions'
import Link from 'next/link'

type ExtractedChoice = { text: string; is_correct: boolean; letter: string }
type ExtractedQuestion = { question_text: string; choices: ExtractedChoice[] }

export default function PDFImportPage() {
    const [file, setFile] = useState<File | null>(null)
    const [category, setCategory] = useState('GenEd')
    const [major, setMajor] = useState('')
    const [isParsing, setIsParsing] = useState(false)
    const [parsedData, setParsedData] = useState<ExtractedQuestion[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setIsParsing(true)
        setErrorMsg('')
        setParsedData([])
        setSaveSuccess(false)

        try {
            const formData = new FormData()
            formData.append('file', file)
            
            const results = await parsePDF(formData)
            setParsedData(results)
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to parse PDF. Ensure it is a valid text-based PDF.")
        } finally {
            setIsParsing(false)
        }
    }

    const handleSaveToDatabase = async () => {
        if (parsedData.length === 0) return
        
        setIsSaving(true)
        setErrorMsg('')
        
        try {
            await bulkInsertQuestions(category, major, parsedData)
            setSaveSuccess(true)
            setParsedData([])
            setFile(null)
        } catch (err: any) {
            setErrorMsg(err.message || "Database insertion failed.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bulk PDF Import</h1>
                    <p className="text-gray-500 mt-1">Upload standard LET Reviewer PDFs to automatically extract questions</p>
                </div>
                <Link href="/admin" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                    Back to Panel
                </Link>
            </div>

            {errorMsg && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold">
                    ⚠️ {errorMsg}
                </div>
            )}
            
            {saveSuccess && (
                <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold flex items-center justify-between">
                    <span>✅ Successfully saved all extracted questions directly into the database!</span>
                    <button onClick={() => setSaveSuccess(false)} className="text-green-900 hover:underline">Dismiss</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Upload Form */}
                <form onSubmit={handleFileUpload} className="col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6 sticky top-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Category Assignment</label>
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="GenEd">General Education</option>
                            <option value="ProfEd">Professional Education</option>
                            <option value="Major">Major</option>
                        </select>
                    </div>

                    {category === 'Major' && (
                        <div className="animate-in slide-in-from-top-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Specify Major Area</label>
                            <input 
                                type="text"
                                required
                                placeholder="e.g. Mathematics"
                                value={major}
                                onChange={(e) => setMajor(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select PDF File</label>
                        <input 
                            type="file" 
                            accept="application/pdf"
                            required
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                        <p className="text-xs text-gray-400 mt-2">Make sure the PDF contains text (not scanned images).</p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={!file || isParsing}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                        {isParsing ? 'Parsing Document...' : 'Extract Variables'}
                    </button>
                </form>

                {/* Preview Table */}
                <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-[60vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Extracted Preview <span className="bg-blue-100 text-blue-700 py-1 px-3 text-sm rounded-full ml-2">{parsedData.length} items</span></h2>
                        {parsedData.length > 0 && (
                            <button 
                                onClick={handleSaveToDatabase}
                                disabled={isSaving}
                                className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg shadow hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? 'Saving to DB...' : 'Confirm & Save All'}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-4">
                        {parsedData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 font-medium">
                                Parse a document to see the preview here.
                            </div>
                        ) : (
                            parsedData.map((q, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                                    <div className="absolute top-4 right-4 flex gap-1">
                                       <span className="w-3 h-3 rounded-full bg-green-500" title="Valid Item"></span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">{idx + 1}. {q.question_text}</h3>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {q.choices.map((c, cIdx) => (
                                            <div key={cIdx} className={`p-2 rounded-md border flex items-center gap-2 ${c.is_correct ? 'bg-green-50 border-green-200 font-bold text-green-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                                <span className="opacity-50 font-bold">{c.letter}.</span>
                                                <span className="truncate">{c.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
