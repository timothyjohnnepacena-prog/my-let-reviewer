import { createClient } from '../../utils/supabase/server'
import { addQuestion, softDeleteQuestion } from './actions'

export default async function AdminPage() {
    const supabase = await createClient()

    const { data: questions } = await supabase
        .from('questions')
        .select(`*, choices(*)`)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <h1 className="text-3xl font-bold px-2">Admin Panel</h1>

            {/* ADD QUESTION FORM */}
            <section className="bg-white p-6 rounded-xl border shadow-sm space-y-4 mx-2">
                <h2 className="text-xl font-semibold">Add New Question</h2>
                <form action={addQuestion} className="flex flex-col gap-4">
                    <textarea name="question_text" placeholder="Type question here..." required className="w-full p-3 border rounded-lg h-24" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select name="category" required className="p-3 border rounded-lg bg-white">
                            <option value="GenEd">General Education</option>
                            <option value="ProfEd">Professional Education</option>
                            <option value="Major">Major</option>
                        </select>
                        <input name="major" placeholder="Major (if applicable)" className="p-3 border rounded-lg" />
                    </div>

                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium text-sm text-gray-500">Choices (Select the correct one)</p>
                        {['a', 'b', 'c', 'd'].map((letter) => (
                            <div key={letter} className="flex items-center gap-3">
                                <input type="radio" name="correct" value={letter} required className="w-5 h-5" />
                                <input name={`choice_${letter}`} placeholder={`Choice ${letter.toUpperCase()}`} required className="flex-1 p-2 border rounded" />
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg">
                        SAVE QUESTION
                    </button>
                </form>
            </section>

            {/* QUESTION LIST */}
            <section className="space-y-4 mx-2">
                <h2 className="text-xl font-semibold">Question Bank ({questions?.length || 0})</h2>
                {questions?.map((q) => (
                    <div key={q.id} className="bg-white p-5 rounded-xl border shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold uppercase px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {q.category} {q.major ? `(${q.major})` : ''}
                            </span>
                            <form action={softDeleteQuestion.bind(null, q.id)}>
                                <button className="text-red-500 font-bold text-sm px-3 py-1 border border-red-200 rounded hover:bg-red-50">
                                    DELETE
                                </button>
                            </form>
                        </div>
                        <p className="font-medium text-gray-900">{q.question_text}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            {q.choices?.map((c: any) => (
                                <div key={c.id} className={`p-2 rounded border ${c.is_correct ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'border-gray-100'}`}>
                                    {c.text}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    )
}