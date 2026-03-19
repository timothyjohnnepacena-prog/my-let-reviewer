import { createClient } from '../../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import ExamClient from './ExamClient'

export default async function ExamSectionPage({ params }: { params: Promise<{ attemptId: string, sectionType: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const p = await params;
    const { attemptId, sectionType } = p

    const { data: attempt } = await supabase.from('exam_attempts').select('*').eq('id', attemptId).single()
    if (!attempt) redirect('/exam')

    const { data: section } = await supabase.from('exam_sections').select('*').eq('attempt_id', attemptId).eq('section_type', sectionType).single()
    if (!section) redirect('/exam')

    // Fetch all available questions for this section type
    const { data: allQuestions } = await supabase
        .from('questions')
        .select(`*, choices(*)`)
        .eq('is_deleted', false)
        .eq('category', sectionType)

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-4">
            <ExamClient 
                attemptId={attemptId} 
                sectionType={sectionType} 
                allQuestions={allQuestions || []} 
            />
        </div>
    )
}
