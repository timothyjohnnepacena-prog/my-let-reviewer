'use server'

import { createClient } from '../../../utils/supabase/server'
import mammoth from 'mammoth'

export async function parsePDF(formData: FormData): Promise<any[]> {
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
        const result = await mammoth.extractRawText({ buffer })
        const fullText = result.value

        const answerKey: Record<number, string> = {}
        const answerMatches = fullText.matchAll(/(\d+)\s*\.\s*([A-D])(?!\w)/g)
        for (const match of answerMatches) {
            answerKey[parseInt(match[1])] = match[2].toUpperCase()
        }

        const questionBlocks = fullText.split(/(?=\d+\s*\.\s+)/g)
        const questions: any[] = []

        for (const block of questionBlocks) {
            const qMatch = block.match(/^(\d+)\s*\.\s+([\s\S]*?)(?=[A-D]\s*\.\s+|$)/)
            if (!qMatch) continue

            const qNum = parseInt(qMatch[1])
            const qText = qMatch[2].replace(/\s+/g, ' ').trim()

            const choices: any[] = []
            const choiceMatches = block.matchAll(/([A-D])\s*[\.\)]\s+([\s\S]*?)(?=[A-D]\s*[\.\)]\s+|$)/gi)

            for (const cMatch of choiceMatches) {
                const letter = cMatch[1].toUpperCase()
                choices.push({
                    letter,
                    text: cMatch[2].replace(/\s+/g, ' ').trim(),
                    is_correct: letter === answerKey[qNum]
                })
            }

            if (choices.length >= 2) {
                questions.push({
                    question_text: qText,
                    choices: choices
                })
            }
        }

        return questions

    } catch (error) {
        console.error("File Parsing Error:", error)
        throw new Error("Failed to read the file")
    }
}

export async function bulkInsertQuestions(category: string, major: string, parsedQuestions: any[]) {
    const supabase = await createClient()

    for (const q of parsedQuestions) {
        const { data: qData, error } = await supabase.from('questions').insert([{
            category,
            major: category === 'Major' ? major : null,
            question_text: q.question_text
        }]).select('id').single()

        if (error) continue

        if (qData && q.choices.length > 0) {
            const choicesToInsert = q.choices.map((c: any) => ({
                question_id: qData.id,
                text: c.text,
                is_correct: c.is_correct
            }))
            await supabase.from('choices').insert(choicesToInsert)
        }
    }
}