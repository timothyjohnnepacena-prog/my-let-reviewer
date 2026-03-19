'use server'

import { createClient } from '../../../utils/supabase/server'

// Mocks for Node.js environment required by pdfjs-dist
if (typeof global !== 'undefined') {
    // @ts-ignore
    global.DOMMatrix = global.DOMMatrix || class DOMMatrix { }
    // @ts-ignore
    global.ReadableStream = global.ReadableStream || class ReadableStream { }
}

export async function parsePDF(formData: FormData): Promise<any[]> {
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
        const loadingTask = pdfjs.getDocument({
            data: uint8Array,
            useSystemFonts: true,
            disableFontFace: true
        })

        const pdf = await loadingTask.promise
        let fullText = ""

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            // @ts-ignore
            fullText += content.items.map((item: any) => item.str).join(' ') + "\n"
        }

        // 1. Answer Key extraction (e.g. "1. A", "82. D")
        const answerKey: Record<number, string> = {}
        const answerMatches = fullText.matchAll(/(\d+)\s*\.\s*\n*\s*([A-D])(?!\w)/g)
        for (const match of answerMatches) {
            answerKey[parseInt(match[1])] = match[2].toUpperCase()
        }

        // 2. Question block extraction
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
                questions.push({ question_text: qText, choices, num: qNum })
            }
        }

        return questions

    } catch (error) {
        console.error("PDF Parser Error:", error)
        throw new Error("Failed to parse PDF")
    }
}

export async function bulkInsertQuestions(category: string, major: string, parsedQuestions: any[]) {
    const supabase = await createClient()

    for (const q of parsedQuestions) {
        // Insert question
        const { data: qData, error: qError } = await supabase.from('questions').insert([{
            category: category,
            major: category === 'Major' ? major : null,
            question_text: q.question_text
        }]).select('id').single()

        if (qError) {
            console.error("Insert Error:", qError.message)
            throw new Error(`Database Error: ${qError.message}`)
        }

        // Insert choices
        if (qData && q.choices.length > 0) {
            const choicesToInsert = q.choices.map((c: any) => ({
                question_id: qData.id,
                text: c.text,
                is_correct: c.is_correct
            }))

            const { error: cError } = await supabase.from('choices').insert(choicesToInsert)
            if (cError) throw new Error(`Choice Error: ${cError.message}`)
        }
    }
}