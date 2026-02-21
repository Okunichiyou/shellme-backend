import { Hono } from 'hono'
import { z } from 'zod';
import { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

type Bindings = {
  OPENAI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

const requestSchema = z.object({
  items: z.array(z.object({
    text: z.string(),
    bounding_box: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
  })).min(1),
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

    const itemsJson = JSON.stringify(result.data.items, null, 2);

    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `あなたは日本の値札から商品名と税込価格を抽出するアシスタントです。
座標情報（x, y, width, height）は正規化された値（0〜1）で、画面上の位置を示します。
- y座標が小さいほど上部にあります
- 通常、商品名は上部に、価格は下部に表示されます
- 「税込」「総額」などの表記がある価格を優先してください
- 価格は数値のみを抽出してください（円、¥などは除く）`,
        },
        {
          role: 'user',
          content: `以下の値札テキスト情報から商品名と税込価格を抽出してください:\n${itemsJson}`,
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