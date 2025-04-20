import { Message } from 'ai';
import { getContext } from '@/utils/context';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

  let context = '';
try {
  context = await getContext(lastMessage.content, '', 3000, 0.7, true) as string;
} catch (error) {
  console.warn('⚠️ Pinecone context fetch failed:', error);
  context = '';
}


    const prompt = [
      {
        role: 'system',
        content: `You are a powerful legal AI assistant.
You are helpful, clever, and articulate. You respond to legal questions using relevant legal reasoning and examples when needed.

START CONTEXT BLOCK
${context || "None provided"}
END OF CONTEXT BLOCK

If context is empty, you may use your general legal knowledge to answer.
If context is present, prioritize it in your answer.`,
      },
    ];

    const response = await streamText({
      model: openai('gpt-4o'),
      messages: [
        ...prompt,
        ...messages.filter((m: Message) => m.role === 'user'),
      ],
    });

    return response.toAIStreamResponse();
  } catch (e) {
    console.error('❌ API /chat error:', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
