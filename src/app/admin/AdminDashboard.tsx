'use client'

import { useState } from 'react'
import { addQuestion, softDeleteQuestion, editQuestion } from './actions'

type Choice = { id: string; text: string; is_correct: boolean; question_id: string; created_at?: string }
type Question = {
    id: string;
    question_text: string;
    category: string;
    major: string | null;
    choices: Choice[];
    created_at?: string;
}

export default function AdminDashboard({ initialQuestions }: { initialQuestions: Question[] }) {
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState('All')
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const filteredQuestions = initialQuestions.filter(q => {
        const matchesSearch = q.question_text.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = filterCategory === 'All' || q.category === filterCategory
        return matchesSearch && matchesCategory
    })

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>, actionType: 'add' | 'edit') => {
        setIsSubmitting(true)
        // Let the normal server action behavior proceed via Next.js <form action={...}> handling
        // But Next.js handling requires action attribute on the form
        // We will just let the action run through the standard form-action.
        setIsSubmitting(false)
        setShowAddModal(false)
        setEditingQuestion(null)
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in zoom-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Question Bank</h1>
                    <p className="text-gray-500 mt-1">Manage all examination entries and categories</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all focus:ring-4 focus:ring-blue-200"
                >
                    + Add New Question
                </button>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        placeholder="Search questions..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    />
                    <svg className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-48 appearance-none cursor-pointer"
                >
                    <option value="All">All Categories</option>
                    <option value="GenEd">Gen. Ed.</option>
                    <option value="ProfEd">Prof. Ed.</option>
                    <option value="Major">Major</option>
                </select>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredQuestions.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg font-medium">No questions found matching your criteria.</p>
                    </div>
                ) : (
                    filteredQuestions.map((q) => (
                        <div key={q.id} className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 bg-opacity-10 rounded-full text-xs font-bold uppercase tracking-wider
                                    ${q.category === 'GenEd' ? 'bg-emerald-500 text-emerald-700' : 
                                      q.category === 'ProfEd' ? 'bg-amber-500 text-amber-700' : 
                                      'bg-purple-500 text-purple-700'}`}>
                                    {q.category} {q.major ? `• ${q.major}` : ''}
                                </span>

                                <div className="flex gap-2">
                                    <button onClick={() => setEditingQuestion(q)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    </button>
                                    <form action={softDeleteQuestion.bind(null, q.id)}>
                                        <button type="submit" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <h3 className="text-gray-900 font-semibold text-lg flex-1 leading-relaxed mb-6">{q.question_text}</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                                {(q.choices || []).sort((a,b) => a.text.localeCompare(b.text)).map((c) => (
                                    <div key={c.id} className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-3 transition-colors ${c.is_correct ? 'bg-green-50/50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                        <div className={`w-2 h-2 rounded-full ${c.is_correct ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span className="truncate" title={c.text}>{c.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add / Edit Modal Overlay */}
            {(showAddModal || editingQuestion) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 p-8">
                        
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingQuestion ? 'Edit Question' : 'Add New Question'}
                            </h2>
                            <button 
                                type="button" 
                                onClick={() => { setShowAddModal(false); setEditingQuestion(null); }}
                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form 
                            action={editingQuestion ? editQuestion.bind(null, editingQuestion.id) : addQuestion} 
                            onSubmit={() => setIsSubmitting(true)}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Question Content</label>
                                <textarea 
                                    name="question_text" 
                                    defaultValue={editingQuestion?.question_text || ''}
                                    placeholder="Enter the main question text here..." 
                                    required 
                                    className="w-full p-4 border border-gray-200 rounded-2xl h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-gray-50/50 focus:bg-white transition-colors" 
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Category</label>
                                    <select 
                                        name="category" 
                                        defaultValue={editingQuestion?.category || 'GenEd'}
                                        required 
                                        className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 bg-gray-50/50 focus:bg-white transition-colors appearance-none"
                                    >
                                        <option value="GenEd">General Education</option>
                                        <option value="ProfEd">Professional Education</option>
                                        <option value="Major">Major</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Major (Optional)</label>
                                    <input 
                                        name="major" 
                                        defaultValue={editingQuestion?.major || ''}
                                        placeholder="e.g. Mathematics" 
                                        className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 bg-gray-50/50 focus:bg-white transition-colors" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                                    <span>Multiple Choice Answers</span>
                                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Mark the correct answer</span>
                                </label>
                                
                                {['a', 'b', 'c', 'd'].map((letter, index) => {
                                    // Map existing choices if editing
                                    const choice = editingQuestion?.choices?.[index];
                                    return (
                                        <div key={letter} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            {/* Hidden ID input so we can update the correct row in DB */}
                                            {choice && <input type="hidden" name={`choice_${letter}_id`} value={choice.id} />}
                                            <label className="flex items-center gap-3 cursor-pointer shrink-0">
                                                <div className="relative flex items-center text-blue-600">
                                                    <input 
                                                        type="radio" 
                                                        name="correct" 
                                                        value={letter} 
                                                        defaultChecked={choice?.is_correct || (letter === 'a' && !editingQuestion)}
                                                        required 
                                                        className="w-6 h-6 border-gray-300 focus:ring-blue-500 cursor-pointer" 
                                                    />
                                                </div>
                                                <span className="font-bold text-gray-700 uppercase w-4">{letter}</span>
                                            </label>
                                            <input 
                                                name={`choice_${letter}`} 
                                                defaultValue={choice?.text || ''}
                                                placeholder={`Enter option ${letter.toUpperCase()}`} 
                                                required 
                                                className="flex-1 w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white" 
                                            />
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="pt-6">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Save New Question')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
