import { Hono } from 'hono'
import { z } from 'zod';
import { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

type Bindings = {
  OPENAI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

const requestSchema = z.object({
  text: z.string().min(1),
});

const PriceTagInfo = z.object({
  name: z.string(),
  price: z.number(),
});

app.post('/parse-price-tag', async (c) => {
  const openai = new OpenAI({
    apiKey: c.env.OPENAI_API_KEY
  });

  try {
    const result = requestSchema.safeParse(await c.req.json());
    if (!result.success) {
      return c.json({ error: 'Invalid request body' }, 400);
    }

    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Extract name and price from Japanese price tag.',
        },
        {
          role: 'user',
          content: result.data.text,
        },
      ],
      response_format: zodResponseFormat(PriceTagInfo, 'price_tag'),
    });

    return c.json(completion.choices[0].message.parsed);
  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: '商品情報の解析に失敗しました' }, 500);
  }
});

export default app