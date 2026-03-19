import { createClient } from '../../utils/supabase/server'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
    const supabase = await createClient()

    // Query questions and choices
    const { data: questions } = await supabase
        .from('questions')
        .select(`*, choices(*)`)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

    return (
        <AdminDashboard initialQuestions={questions || []} />
    )
}