// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Configuration, OpenAIApi } from 'openai';
import { defaultGeneratedImages } from '../../testData';

const endPoint = async ({ openai, body }) => {
  const { type, requestParams } = body;
  console.log(openai[type]);
  console.log('Request Body', body);
  console.log('Prompted: ', requestParams.prompt);
  const res = await openai[type](requestParams);
  console.log('OpenAI gives: ', res.data.choices);
  return res.data;
};

// const postEndPoints = { createImage, createCompletion };

export default async function handler(req, res) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  let body = {};
  try {
    body = JSON.parse(req.body);
    console.log(body);
  } catch (error) {
    body = { error };
  }
  //   const data = await postEndPoint({ openai, requestParams });
  const data = await endPoint({ openai, body });
  //   const data = { data: defaultGeneratedImages };
  res.status(200).json(data);
}

/* use fetch and async instead of xhr */
async function describeImage(url) {
  const response = await fetch(
    'https://api.openai.com/v1/engines/davinci/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer <your-key-here>',
      },
      body: JSON.stringify({
        prompt: 'A man is sitting on a bench.',
        max_tokens: 50,
        temperature: 0.7,
        top_p: 1,
        n: 1,
        stream: false,
      }),
    }
  );
  const json = await response.json();
  let description = json.choices[0].text;

  return description;
}
