import { createClient } from './supabase/client'

const supabase = createClient()

export async function insertQuestion(questionData: any) {
    const { question_text, category, major, choices } = questionData
    const { data: question, error: qError } = await supabase
        .from('questions')
        .insert([{ question_text, category, major: major || null }])
        .select()
        .single()

    if (qError) throw qError

    const choicesToInsert = choices.map((choice: any) => ({
        ...choice,
        question_id: question.id
    }))

    const { error: cError } = await supabase.from('choices').insert(choicesToInsert)
    if (cError) throw cError

    return question
}

export async function fetchExamSet(category: string) {
    const { data, error } = await supabase.rpc('get_random_questions', {
        cat_input: category,
        limit_input: 150
    })
    if (error) throw error
    return data
}

export async function startExamAttempt(userId: string) {
    const { data, error } = await supabase
        .from('exam_attempts')
        .insert([{ user_id: userId, status: 'in_progress' }])
        .select()
        .single()
    if (error) throw error
    return data
}

export async function saveUserAnswer(attemptId: string, questionId: string, choiceId: string) {
    const { data: choice } = await supabase
        .from('choices')
        .select('is_correct')
        .eq('id', choiceId)
        .single()

    const { error } = await supabase.from('answers').insert([{
        attempt_id: attemptId,
        question_id: questionId,
        selected_choice_id: choiceId,
        is_correct: choice?.is_correct || false
    }])
    if (error) throw error
}

export async function getAttemptScore(attemptId: string) {
    const { count, error } = await supabase
        .from('answers')
        .select('*', { count: 'exact', head: true })
        .eq('attempt_id', attemptId)
        .eq('is_correct', true)
    if (error) throw error
    return count
}