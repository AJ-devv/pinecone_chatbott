import { Message } from 'ai';
import { getContext } from '@/utils/context';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    const context = await getContext(lastMessage.content, '');

    const prompt = [
      {
        role: 'system',
        content: `AI assistant is a powerful, friendly, and articulate chatbot.
START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK
Only use the context to answer the question. Do not guess.`,
      },
    ];

    const response = await streamText({
      model: openai('gpt-4o'), // ✅ CORRECT USAGE: no options object here
      messages: [...prompt, ...messages.filter((m: Message) => m.role === 'user')],
    });

    return response.toAIStreamResponse();
  } catch (error) {
    console.error('❌ /api/chat error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
