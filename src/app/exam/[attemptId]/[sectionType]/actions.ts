'use server'

import { createClient } from '../../../../utils/supabase/server'

export async function submitAnswer(attemptId: string, questionId: string, choiceId: string, isCorrect: boolean) {
    const supabase = await createClient()

    // Upsert equivalent since we cannot leave it blank initially
    // Since there's no unique constraint on (attempt_id, question_id), 
    // we need to first check if it exists, then update, else insert
    const { data: existing } = await supabase
        .from('answers')
        .select('id')
        .eq('attempt_id', attemptId)
        .eq('question_id', questionId)
        .single()

    if (existing) {
        await supabase.from('answers').update({ 
            selected_choice_id: choiceId, 
            is_correct: isCorrect 
        }).eq('id', existing.id)
    } else {
        await supabase.from('answers').insert([{ 
            attempt_id: attemptId, 
            question_id: questionId, 
            selected_choice_id: choiceId, 
            is_correct: isCorrect 
        }])
    }
}

export async function finishSection(attemptId: string, sectionType: string, score: number) {
    const supabase = await createClient()
    await supabase.from('exam_sections')
        .update({ score, end_time: new Date().toISOString() })
        .eq('attempt_id', attemptId)
        .eq('section_type', sectionType)
        
    if (sectionType === 'Major') {
        await supabase.from('exam_attempts').update({ status: 'completed' }).eq('id', attemptId)
    }
}

export async function recordViolation(attemptId: string) {
    const supabase = await createClient()
    
    // Increment attempt violation count
    const { data: attempt } = await supabase.from('exam_attempts').select('violation_count').eq('id', attemptId).single()
    if (attempt) {
        const newCount = attempt.violation_count + 1
        await supabase.from('exam_attempts').update({ violation_count: newCount }).eq('id', attemptId)
        await supabase.from('violations').insert([{ attempt_id: attemptId }])
        
        if (newCount >= 3) {
            await supabase.from('exam_attempts').update({ status: 'auto_submitted' }).eq('id', attemptId)
            return { forceSubmit: true }
        }
    }
    return { forceSubmit: false }
}
