'use server'

import { createClient } from '../../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addQuestion(formData: FormData) {
    const supabase = await createClient()

    const question_text = formData.get('question_text') as string
    const category = formData.get('category') as any
    const major = formData.get('major') as string
    const choices = [
        { text: formData.get('choice_a') as string, is_correct: formData.get('correct') === 'a' },
        { text: formData.get('choice_b') as string, is_correct: formData.get('correct') === 'b' },
        { text: formData.get('choice_c') as string, is_correct: formData.get('correct') === 'c' },
        { text: formData.get('choice_d') as string, is_correct: formData.get('correct') === 'd' },
    ]

    const { data: qData, error: qError } = await supabase
        .from('questions')
        .insert([{ question_text, category, major: category === 'Major' ? major : null }])
        .select()
        .single()

    if (qError) throw new Error(qError.message)

    const choicesToInsert = choices.map(c => ({ ...c, question_id: qData.id }))
    await supabase.from('choices').insert(choicesToInsert)

    revalidatePath('/admin')
}

export async function softDeleteQuestion(id: string) {
    const supabase = await createClient()
    await supabase.from('questions').update({ is_deleted: true }).eq('id', id)
    revalidatePath('/admin')
}

export async function editQuestion(id: string, formData: FormData) {
    const supabase = await createClient()

    const question_text = formData.get('question_text') as string
    const category = formData.get('category') as any
    const major = formData.get('major') as string
    const choices = [
        { id: formData.get('choice_a_id') as string, text: formData.get('choice_a') as string, is_correct: formData.get('correct') === 'a' },
        { id: formData.get('choice_b_id') as string, text: formData.get('choice_b') as string, is_correct: formData.get('correct') === 'b' },
        { id: formData.get('choice_c_id') as string, text: formData.get('choice_c') as string, is_correct: formData.get('correct') === 'c' },
        { id: formData.get('choice_d_id') as string, text: formData.get('choice_d') as string, is_correct: formData.get('correct') === 'd' },
    ]

    const { error: qError } = await supabase
        .from('questions')
        .update({ question_text, category, major: category === 'Major' ? major : null })
        .eq('id', id)
        
    if (qError) throw new Error(qError.message)

    for (const c of choices) {
        if (c.id) {
            await supabase.from('choices').update({ text: c.text, is_correct: c.is_correct }).eq('id', c.id)
        }
    }

    revalidatePath('/admin')
}