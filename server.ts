import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '5mb' }));

// Dynamic Google Gen AI client helper ensuring newly configured keys are used immediately
function getGenAIClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (key) {
    return new GoogleGenAI({ apiKey: key });
  }
  try {
    return new GoogleGenAI();
  } catch {
    return null;
  }
}

// POST /api/strategy-explanation
app.post('/api/strategy-explanation', async (req: Request, res: Response) => {
  const ai = getGenAIClient();
  try {
    const {
      neighbourhood,
      bedrooms,
      minNightsCap,
      count,
      p25,
      median,
      p75,
      licensedCount,
      licensedMedianPrice,
      licensedMedianRevenue,
      unlicensedCount,
      unlicensedMedianPrice,
      unlicensedMedianRevenue,
      commonPropertyTypes,
    } = req.body;

    if (!ai) {
      return res.json({
        budget: `Budget pricing ($${p25.toFixed(2)}/night, 25th percentile) optimizes for high occupancy and faster review acquisition in ${neighbourhood}.`,
        market: `Market pricing ($${median.toFixed(2)}/night, median) targets balanced booking velocity and revenue across the ${count} active comparables.`,
        premium: `Premium pricing ($${p75.toFixed(2)}/night, 75th percentile) captures peak leisure and business traveler demand for above-average finishes.`,
        source: 'local-fallback',
      });
    }

    const prompt = `You are an expert short-term rental advisor for Capital Host Advisory in Washington, DC.
You are generating plain-language guidance for a homeowner considering listing a ${bedrooms}-bedroom property in "${neighbourhood}" with a minimum-nights cap of ${minNightsCap} nights.

STRICT RULE ON NUMBERS:
Every price, count, percentile, or estimate you mention MUST come strictly and exclusively from the following computed statistics. You must NEVER fabricate, assume, or state a price, count, or statistic from your own outside knowledge. If any detail is not passed in, do not guess it.

COMPUTED STATISTICS:
- Neighbourhood: ${neighbourhood}
- Bedrooms: ${bedrooms}
- Room type: Entire home/apt
- Minimum-nights cap: <= ${minNightsCap} nights
- Total comparable listings (N): ${count}
- 25th Percentile Price: $${Number(p25).toFixed(2)}
- Median Recommended Price: $${Number(median).toFixed(2)}
- 75th Percentile Price: $${Number(p75).toFixed(2)}
- Licensed listings in sample: ${licensedCount} (Median Nightly Price: $${Number(licensedMedianPrice).toFixed(2)}, Inside Airbnb Median Est. Revenue: $${Number(licensedMedianRevenue).toLocaleString()})
- Unlicensed listings in sample: ${unlicensedCount} (Median Nightly Price: $${Number(unlicensedMedianPrice).toFixed(2)}, Inside Airbnb Median Est. Revenue: $${Number(unlicensedMedianRevenue).toLocaleString()})
- Common property types: ${commonPropertyTypes?.join(', ') || 'Various units'}

OUTPUT REQUIREMENTS:
Return valid JSON with exactly three keys: "budget", "market", and "premium".
Each key must have a concise 2-sentence statistical explanation:
- "budget": Explains the $${Number(p25).toFixed(2)} rate (25th percentile). Note that 25% of the ${count} comparable listings in ${neighbourhood} charge this amount or less.
- "market": Explains the $${Number(median).toFixed(2)} rate (median). Note that this represents the median of the ${count} comparable listings in ${neighbourhood}.
- "premium": Explains the $${Number(p75).toFixed(2)} rate (75th percentile). Note that 25% of the ${count} comparable listings in ${neighbourhood} charge this amount or more.
Do not make any claims about guest demand, momentum, occupancy, listing quality, or events. Ground the explanation strictly in the computed numbers and percentiles.

Only return raw JSON without markdown code fences or backticks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        budget: `25% of the ${count} comparable listings in ${neighbourhood} charge $${Number(p25).toFixed(2)} or less (25th percentile).`,
        market: `Median price of the ${count} comparable listings in ${neighbourhood} is $${Number(median).toFixed(2)}.`,
        premium: `25% of the ${count} comparable listings in ${neighbourhood} charge $${Number(p75).toFixed(2)} or more (75th percentile).`,
      };
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating strategy explanation, using statistical fallback:', error);
    const { p25, median, p75, count, neighbourhood } = req.body;
    return res.json({
      budget: `25% of the ${count || 0} comparable listings in ${neighbourhood || 'the neighbourhood'} charge $${Number(p25 || 0).toFixed(2)} or less (25th percentile).`,
      market: `Median price of the ${count || 0} comparable listings in ${neighbourhood || 'the neighbourhood'} is $${Number(median || 0).toFixed(2)}.`,
      premium: `25% of the ${count || 0} comparable listings in ${neighbourhood || 'the neighbourhood'} charge $${Number(p75 || 0).toFixed(2)} or more (75th percentile).`,
    });
  }
});

// POST /api/ask-data
app.post('/api/ask-data', async (req: Request, res: Response) => {
  const ai = getGenAIClient();
  try {
    const { question, stats, sampleRows } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!ai) {
      return res.json({
        answer: 'Gemini API key is not configured in the environment. Please check the AI Studio secrets configuration.',
      });
    }

    const systemInstruction = `You are Capital Host Advisory's Washington DC Short-Term Rental Data Analyst.
You are assisting a homeowner with questions about the Inside Airbnb Washington DC dataset (snapshot 19 Sept 2026, CC BY 4.0).

STRICT RULE ON NUMBERS & DATA BOUNDARY:
- Every price, count, percentile, estimate, or property type count shown MUST be computed in code and passed to you in the prompt below.
- You may ONLY explain or cite numbers that the code passes to you.
- You must NEVER state a price, count, or statistic from your own outside knowledge.
- If asked for something that was not provided in the prompt below (e.g. historical trends before the snapshot, cap rates, host names, square footage, specific street addresses, non-DC cities, amenities not listed, or any metric not passed in), you MUST state "not in the data provided" and you must NOT repeat the price statistics.
- If asked about property types, answer accurately using the PROPERTY TYPE COUNTS provided below.
- Be objective, clear, direct, and concise.`;

    const prompt = `CURRENT COMPUTED DATASET FILTER & METRICS:
Neighbourhood: ${stats.neighbourhood}
Bedrooms: ${stats.bedrooms}
Room Type: Entire home/apt
Minimum Nights Cap: <= ${stats.minNightsCap}
Comparables Count (N): ${stats.count}
Low-Data Warning Active: ${stats.count < 20 ? 'Yes (N < 20)' : 'No'}
25th Percentile Nightly Price: $${Number(stats.p25).toFixed(2)}
Median Nightly Price (Recommended): $${Number(stats.median).toFixed(2)}
75th Percentile Nightly Price: $${Number(stats.p75).toFixed(2)}
99th Percentile Price: $${Number(stats.p99).toFixed(2)}
Minimum Price: $${Number(stats.minPrice).toFixed(2)}
Maximum Price: $${Number(stats.maxPrice).toFixed(2)}
Excluded for needing 31+ nights: ${stats.excluded31PlusCount}
Excluded for blank/missing minimum nights: ${stats.blankMinNightsCount}
Total listings in neighbourhood with matching bedroom count: ${stats.totalAreaBedroomCount}

PROPERTY TYPE COUNTS IN CURRENT COMPARABLES (N = ${stats.count}):
${JSON.stringify(stats.propertyTypeCounts || {}, null, 2)}

LICENSING BREAKDOWN IN CURRENT COMPARABLES:
- Licensed listings: ${stats.licensedCount}
  - Median Nightly Price: $${Number(stats.licensedMedianPrice).toFixed(2)}
  - Inside Airbnb Median Est. Annual Revenue (l365d): $${Number(stats.licensedMedianRevenue).toLocaleString()}
- Unlicensed listings: ${stats.unlicensedCount}
  - Median Nightly Price: $${Number(stats.unlicensedMedianPrice).toFixed(2)}
  - Inside Airbnb Median Est. Annual Revenue (l365d): $${Number(stats.unlicensedMedianRevenue).toLocaleString()}

REPRESENTATIVE COMPARABLES SAMPLE (up to 20 listings from the filtered table):
${JSON.stringify(sampleRows, null, 2)}

USER QUESTION:
"${question}"

Answer the user's question directly, observing the strict rule on numbers. If the question asks for something not provided above, say "not in the data provided" and do not repeat the price statistics:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    return res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error in ask-data, returning deterministic answer:', error);
    const { stats, question } = req.body;
    const qLower = (question || '').toLowerCase();
    if (qLower.includes('property') || qLower.includes('type')) {
      const typesStr = Object.entries(stats?.propertyTypeCounts || {})
        .map(([t, c]) => `${t}: ${c}`)
        .join(', ');
      return res.json({
        answer: `The ${stats?.count || 0} comparables include the following property types: ${typesStr || 'Various units'}.`,
      });
    }
    return res.json({
      answer: 'not in the data provided',
    });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Capital Host Advisory server running on port ${PORT}`);
  });
}

startServer();
