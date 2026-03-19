'use server'

import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'

export async function startExam(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const major = formData.get('major') as string

    // 1. Create the Attempt
    const { data: attempt, error: attemptError } = await supabase
        .from('exam_attempts')
        .insert([{ user_id: user.id, status: 'in_progress', violation_count: 0 }])
        .select()
        .single()

    if (attemptError || !attempt) throw new Error("Could not start exam.")

    // 2. Fetch Questions (150 random for each category)
    // Supabase REST API doesn't have a native ORDER BY random() easily without an RPC.
    // However, since we are fetching to node server, we will fetch up to 300 active questions per category and shuffle in memory.
    // In production, an RPC is better.
    const { data: allQuestions } = await supabase
        .from('questions')
        .select(`id, category, major`)
        .eq('is_deleted', false)
        
    const questions = allQuestions || []

    const shuffleAndLimit = (list: any[]) => {
        const shuffled = list.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 150);
    }

    const genEdQuestions = shuffleAndLimit(questions.filter(q => q.category === 'GenEd'))
    const profEdQuestions = shuffleAndLimit(questions.filter(q => q.category === 'ProfEd'))
    const majorQuestions = shuffleAndLimit(questions.filter(q => q.category === 'Major' && q.major === major))

    // 3. Create Sections
    // GenEd starts immediately (2 hours = 7200 seconds -> handled on client, but we record start_time)
    await supabase.from('exam_sections').insert([
        { attempt_id: attempt.id, section_type: 'GenEd' },
        { attempt_id: attempt.id, section_type: 'ProfEd' },
        { attempt_id: attempt.id, section_type: 'Major' },
    ])

    // 4. Initialize Blank Answers (using question ID)
    // We insert a placeholder answer initially to track which questions belong to the attempt easily,
    // OR just wait for the user to select. Waiting is better for DB size, but inserting blanks helps with "Next/Prev" fetching.
    // Actually, Phase 5: generating exam means storing the exact order of questions.
    // Let's insert the assignment of questions to the attempt in the `answers` table but without `selected_choice_id`.
    // Wait, `selected_choice_id` is NOT NULL in the schema?
    // Let's check schema... Wait, `selected_choice_id` is NOT NULL?
    // "selected_choice_id uuid REFERENCES public.choices(id) ON DELETE CASCADE NOT NULL" -> YES IT IS NOT NULL.
    // If it's NOT NULL, we CANNOT insert blanks! We'll just have to store the ordered question list in session OR create a new table `attempt_questions`...
    // But the instructions don't say to create `attempt_questions`.
    // Instead of adding new tables, we can encode the selected question IDs sequentially in a Server action or use Supabase caching.
    // Wait, the easiest way to give standard questions is to encode the JSON array of IDs into a cookie, or an RPC.
    // BUT we must abide by schema. If we must skip creating a table, we can just save the selected questions in a new row in a `exam_assigned_questions` table? Not in schema.
    // Let's alter the schema safely to allow nulls, or just fetch random questions on the fly on the very first render and save the list to LocalStorage?
    // Wait, a LET Simulator needs stable sets. Let me check if `selected_choice_id` can be updated.
    // For now, let's update `answers` schema safely in a migration to allow NULL if it needs to track assigned questions.
    // BUT since I didn't change schema yet, what if I just use a cookie to store the question IDs for this attempt?
    
    // Instead of that, let me just add an `attempt_questions` or modify `answers` to make `selected_choice_id` NULLable.
    // Wait, there's no harm in `selected_choice_id` being NULLable.
    
    // Since I can't be sure without DB admin, I will pass the question IDs to the client and store them in localStorage, or generate them sequentially.
    // Let's pass the question pool to the client via redirect URL params? Too long.
    // Alternative: A server-side token (cookie) containing the attempt specific layout.
    
    // Better: We just let the client fetch random questions the first time they visit the section, and save to LocalStorage to maintain order.
    // Yes! Next.js Client Component can manage the state for the current attempt.
    
    redirect(`/exam/${attempt.id}/GenEd`)
}
