import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')!
const VOICE_ID = '3htg31YmpSA7auH6oqDp'
const MODEL_ID = 'eleven_multilingual_v2'
const MAX_CHARS = 5000

interface WordTimestamp {
  word: string
  start: number
  end: number
}

interface ElevenLabsResponse {
  audio_base64: string
  alignment: {
    characters: string[]
    character_start_times_seconds: number[]
    character_end_times_seconds: number[]
  }
}

function splitTextIntoChunks(text: string): string[] {
  if (text.length <= MAX_CHARS) return [text]
  
  const chunks: string[] = []
  let remaining = text
  
  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHARS) {
      chunks.push(remaining)
      break
    }
    
    // Find last sentence boundary before MAX_CHARS
    const slice = remaining.slice(0, MAX_CHARS)
    let splitAt = -1
    
    // Look for sentence endings: . ! ? followed by space
    for (let i = slice.length - 1; i >= Math.floor(MAX_CHARS * 0.5); i--) {
      if ((slice[i] === '.' || slice[i] === '!' || slice[i] === '?') && 
          (i + 1 >= slice.length || slice[i + 1] === ' ' || slice[i + 1] === '\n')) {
        splitAt = i + 1
        break
      }
    }
    
    if (splitAt === -1) splitAt = MAX_CHARS
    
    chunks.push(remaining.slice(0, splitAt).trim())
    remaining = remaining.slice(splitAt).trim()
  }
  
  return chunks
}

function charactersToWords(alignment: ElevenLabsResponse['alignment'], timeOffset: number): WordTimestamp[] {
  const words: WordTimestamp[] = []
  let currentWord = ''
  let wordStart = -1
  let wordEnd = 0
  
  for (let i = 0; i < alignment.characters.length; i++) {
    const char = alignment.characters[i]
    const startTime = alignment.character_start_times_seconds[i]
    const endTime = alignment.character_end_times_seconds[i]
    
    if (char === ' ' || char === '\n') {
      if (currentWord.length > 0) {
        words.push({
          word: currentWord,
          start: wordStart + timeOffset,
          end: wordEnd + timeOffset,
        })
        currentWord = ''
        wordStart = -1
      }
    } else {
      if (wordStart === -1) wordStart = startTime
      wordEnd = endTime
      currentWord += char
    }
  }
  
  // Push last word
  if (currentWord.length > 0) {
    words.push({
      word: currentWord,
      start: wordStart + timeOffset,
      end: wordEnd + timeOffset,
    })
  }
  
  return words
}

async function getAudioDuration(audioBytes: Uint8Array): Promise<number> {
  // Estimate MP3 duration from file size
  // For 128kbps MP3: duration = fileSize * 8 / 128000
  // This is approximate; we'll use alignment data instead
  return 0
}

function getDurationFromAlignment(alignment: ElevenLabsResponse['alignment']): number {
  const times = alignment.character_end_times_seconds
  if (times.length === 0) return 0
  return times[times.length - 1]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sectionId, text } = await req.json()
    
    if (!sectionId || !text) {
      return new Response(JSON.stringify({ error: 'sectionId and text are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Processing section: ${sectionId}, text length: ${text.length}`)
    
    const chunks = splitTextIntoChunks(text)
    console.log(`Split into ${chunks.length} chunks`)
    
    const allAudioParts: Uint8Array[] = []
    const allWords: WordTimestamp[] = []
    let timeOffset = 0
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1}/${chunks.length}, length: ${chunks[i].length}`)
      
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: chunks[i],
            model_id: MODEL_ID,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.5,
              use_speaker_boost: true,
            },
          }),
        }
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`ElevenLabs API error: ${response.status} - ${errorText}`)
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }
      
      const data: ElevenLabsResponse = await response.json()
      
      // Decode audio
      const audioBytes = base64Decode(data.audio_base64)
      allAudioParts.push(audioBytes)
      
      // Convert character timestamps to word timestamps with offset
      const words = charactersToWords(data.alignment, timeOffset)
      allWords.push(...words)
      
      // Update time offset for next chunk
      const chunkDuration = getDurationFromAlignment(data.alignment)
      timeOffset += chunkDuration
      
      console.log(`Chunk ${i + 1} done. Duration: ${chunkDuration}s, words: ${words.length}`)
    }
    
    // Merge audio parts
    const totalSize = allAudioParts.reduce((sum, part) => sum + part.length, 0)
    const mergedAudio = new Uint8Array(totalSize)
    let offset = 0
    for (const part of allAudioParts) {
      mergedAudio.set(part, offset)
      offset += part.length
    }
    
    // Upload to Supabase storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Upload MP3
    const audioPath = `${sectionId}.mp3`
    const { error: audioError } = await supabase.storage
      .from('audio')
      .upload(audioPath, mergedAudio, {
        contentType: 'audio/mpeg',
        upsert: true,
      })
    
    if (audioError) {
      console.error('Audio upload error:', audioError)
      throw new Error(`Failed to upload audio: ${audioError.message}`)
    }
    
    // Upload timestamps JSON
    const timestampsPath = `${sectionId}_timestamps.json`
    const timestampsJson = JSON.stringify(allWords)
    const { error: tsError } = await supabase.storage
      .from('audio')
      .upload(timestampsPath, timestampsJson, {
        contentType: 'application/json',
        upsert: true,
      })
    
    if (tsError) {
      console.error('Timestamps upload error:', tsError)
      throw new Error(`Failed to upload timestamps: ${tsError.message}`)
    }
    
    console.log(`Done! Audio: ${audioPath}, Timestamps: ${timestampsPath}, Total words: ${allWords.length}`)
    
    return new Response(JSON.stringify({
      success: true,
      sectionId,
      audioPath,
      timestampsPath,
      totalWords: allWords.length,
      totalDuration: timeOffset,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
