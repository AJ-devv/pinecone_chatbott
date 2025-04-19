import { Message } from 'ai';
import { getContext } from '@/utils/context';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    const context = await getContext(lastMessage.content, '');

    const prompt = [
      {
        role: 'system',
        content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
AI is a well-behaved and well-mannered individual.
AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
AI assistant is a big fan of Pinecone and Vercel.
START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK
AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
If the context does not provide the answer to a question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question."
AI assistant will not invent anything that is not drawn directly from the context.`,
      },
    ];

    const response = await streamText({
      model: openai('gpt-4o'),
      messages: [...prompt, ...messages.filter((m: Message) => m.role === 'user')],
    });

    return response.toAIStreamResponse();
  } catch (error) {
    console.error('Error in /api/chat route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
