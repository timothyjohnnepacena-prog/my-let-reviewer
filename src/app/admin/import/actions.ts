'use server'

import { createClient } from '../../../utils/supabase/server'

type ExtractedChoice = { text: string; is_correct: boolean; letter: string }
type ExtractedQuestion = {
    question_text: string;
    choices: ExtractedChoice[];
}

export async function parsePDF(formData: FormData): Promise<ExtractedQuestion[]> {
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    // Read the file as a buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Mock DOM APIs for pdf.js running inside Node.js ESM environment
    if (typeof global !== 'undefined') {
        global.DOMMatrix = global.DOMMatrix || (class DOMMatrix {} as any)
        global.ImageData = global.ImageData || (class ImageData {} as any)
        global.Path2D = global.Path2D || (class Path2D {} as any)
    }

    const pdfParse = require('pdf-parse')
    
    // Parse PDF text
    const data = await pdfParse(buffer)
    const text = data.text

    // Heuristics Engine
    const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean)
    const questions: ExtractedQuestion[] = []
    
    let currentQuestion: Partial<ExtractedQuestion> | null = null
    let currentAnswerLetter: string | null = null

    for (const line of lines) {
        // Regex for "1. Question..." or "12. Question"
        const qMatch = line.match(/^(\d+)\.\s+(.*)/)
        if (qMatch) {
            if (currentQuestion && currentQuestion.question_text) {
                // Determine correctness based on ANSWER
                if (currentAnswerLetter && currentQuestion.choices) {
                    currentQuestion.choices = currentQuestion.choices.map(c => ({
                        ...c,
                        is_correct: c.letter === currentAnswerLetter
                    }))
                }
                questions.push(currentQuestion as ExtractedQuestion)
            }
            
            // Start a new question
            currentQuestion = {
                question_text: qMatch[2],
                choices: []
            }
            currentAnswerLetter = null
            continue;
        }

        // Regex for "A. Choice..." or "B) Choice..." or "a. Choice..."
        const cMatch = line.match(/^([a-dA-D])[\.\)]\s+(.*)/)
        if (cMatch && currentQuestion) {
            currentQuestion.choices = currentQuestion.choices || []
            currentQuestion.choices.push({
                letter: cMatch[1].toUpperCase(),
                text: cMatch[2],
                is_correct: false // Default to false until we find the ANSWER key
            })
            continue;
        }

        // Regex for "ANSWER: A" or "Ans: B"
        const aMatch = line.match(/^(?:ANSWER|ANS|Answer|Ans)\s*[:=\-]?\s*([a-dA-D])/i)
        if (aMatch && currentQuestion) {
            currentAnswerLetter = aMatch[1].toUpperCase()
            continue;
        }

        // If it didn't match any structural markers, append to the current open item (multi-line question support)
        if (currentQuestion && (!currentQuestion.choices || currentQuestion.choices.length === 0)) {
            // It's a continuation of the question text
            currentQuestion.question_text += ' ' + line
        } else if (currentQuestion && currentQuestion.choices && currentQuestion.choices.length > 0) {
            // It's a continuation of the latest choice
            const lastChoice = currentQuestion.choices[currentQuestion.choices.length - 1]
            lastChoice.text += ' ' + line
        }
    }

    // Push the final question
    if (currentQuestion && currentQuestion.question_text) {
        if (currentAnswerLetter && currentQuestion.choices) {
            currentQuestion.choices = currentQuestion.choices.map(c => ({
                ...c,
                is_correct: c.letter === currentAnswerLetter
            }))
        }
        questions.push(currentQuestion as ExtractedQuestion)
    }

    return questions
}

export async function bulkInsertQuestions(category: string, major: string, parsedQuestions: ExtractedQuestion[]) {
    const supabase = await createClient()

    // Since we are inserting many items, we use a sequential approach with returning ID to link the choices
    // In actual production, an RPC is strongly advised.
    for (const q of parsedQuestions) {
        const { data: qData, error } = await supabase.from('questions').insert([{
            category,
            major: category === 'Major' ? major : null,
            question_text: q.question_text
        }]).select('id').single()

        if (error) console.error("Insertion error:", error)
        if (qData && q.choices.length > 0) {
            const choicesToInsert = q.choices.map(c => ({
                question_id: qData.id,
                text: c.text,
                is_correct: c.is_correct
            }))
            await supabase.from('choices').insert(choicesToInsert)
        }
    }
}
