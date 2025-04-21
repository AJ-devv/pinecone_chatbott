import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getEmbeddings(input: string) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: input.replace(/\n/g, ' ')
    });

    if (!response.data || !response.data[0] || !response.data[0].embedding) {
      throw new Error('Invalid response structure from OpenAI');
    }

    return response.data[0].embedding as number[];

  } catch (e) {
    console.log("Error calling OpenAI embedding API: ", e);
    throw new Error(`Error calling OpenAI embedding API: ${e}`);
  }
}