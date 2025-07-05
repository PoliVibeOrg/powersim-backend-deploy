const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.post('/api', async (req, res) => {
  const { title, clause1, clause2, clause3, category } = req.body;

  const prompt = `
You are a political policy analyst for India. A young user has drafted the following mock bill. Analyze it critically and return:

1. A rating (1-10) on how effective this bill is in solving real issues in today's India
2. A support percentage (estimate of how many citizens would support this)
3. A strong, unique PRO — why this bill is good, tied to today's Indian situation
4. A realistic CON — why this bill might be controversial/problematic
5. A mock Opposition party's response

Bill Category: ${category}
Title: ${title}
Clause 1: ${clause1}
Clause 2: ${clause2}
Clause 3: ${clause3}

Return everything in this JSON format only:
{
  "rating": <number>,
  "support": <percent>,
  "pro": "<pro text>",
  "con": "<con text>",
  "opposition": "<opposition statement>"
}
  `;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const output = JSON.parse(data.choices[0].message.content);
    res.json(output);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate response from Groq AI' });
  }
});

app.listen(port, () => {
  console.log(`✅ PowerSim backend running at http://localhost:${port}`);
});