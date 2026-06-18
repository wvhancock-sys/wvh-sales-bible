export default async (req, context) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { mode, product, account, industry, callType, knowSoFar, buyerName, buyerTitle, pains, emailType, stalledContext } = body;

  let systemPrompt = '';
  let userPrompt = '';

  if (mode === 'prep') {
    systemPrompt = `You are an elite enterprise sales coach for IBM's AI Power & Productivity team. Generate a call prep package using SPICED methodology (Situation, Pain, Impact, Critical Event, Decision).

Products:
- watsonx Orchestrate: AI agents for cross-system back-office work. Buyers: COO, CHRO, CFO.
- IBM Bob (watsonx Code Assistant): AI for legacy code modernization (COBOL, RPG, Java). Buyers: CIO, CTO, VP Engineering.
- watsonx.governance: AI governance control plane. Buyers: CIO, CDO, CRO, CCO.

Be specific to this account. No em dashes. Be concise -- each field 1-3 sentences max.

Respond ONLY with valid JSON, no markdown, no code fences:
{"twoSentenceHypothesis":"string","fourPartHypothesis":{"pattern":"string","gap":"string","proof":"string","question":"string"},"provocation":{"pattern":"string","tension":"string","implication":"string","openingLine":"string"},"killerQuestions":[{"stage":"Situation","question":"string"},{"stage":"Pain","question":"string"},{"stage":"Impact","question":"string"},{"stage":"Critical Event","question":"string"},{"stage":"Decision","question":"string"}],"potentialObjections":[{"objection":"string","response":"string"},{"objection":"string","response":"string"}],"compellingEventIdeas":["string","string"],"coachingNote":"string"}`;

    userPrompt = `Build a complete call prep package for:
Account: ${account || 'Unknown'}
Industry: ${industry || 'Unknown'}
Product: ${product || 'Unknown'}
Call type: ${callType || 'discovery'}
What I already know: ${knowSoFar || 'Nothing yet'}
Buyer: ${buyerName || 'Unknown'} ${buyerTitle ? `(${buyerTitle})` : ''}

Make the hypothesis, provocation, and questions highly specific to ${account} in ${industry}. Generate 5-7 killer questions across SPICED stages. Generate 2-3 likely objections with sharp responses. Generate 2-3 compelling event ideas.`;
  }

  else if (mode === 'email') {
    systemPrompt = `You are an elite enterprise sales writer for IBM's AI Power & Productivity team. Write concise, direct, peer-level sales emails. No marketing language. Problem-first always. Never use em dashes.

Respond ONLY with valid JSON, no markdown, no code fences:
{"subject":"string","body":"string","notes":"string"}`;

    userPrompt = `Write a ${emailType || 'recap'} email for:
Buyer: ${buyerName || '[Name]'} at ${account || '[Company]'}
Product: ${product || 'IBM watsonx'}
Context: ${pains || stalledContext || 'Not provided'}

Keep under 120 words unless escalation. Buyer should feel heard, not pitched.`;
  }

  else if (mode === 'objection') {
    systemPrompt = `You are an elite enterprise sales coach. Respond ONLY with valid JSON, no markdown:
{"acknowledge":"string","askToIsolate":"string","answer":"string","followUp":"string","coachingNote":"string"}`;

    userPrompt = `Handle this objection:
Objection: ${body.objection || ''}
Product: ${product || ''}
Context: ${body.context || 'Mid-discovery call'}
Account: ${account || 'Unknown'}`;
  }

  else {
    return new Response(JSON.stringify({ error: `Unknown mode: ${mode}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return new Response(JSON.stringify({ error: `Anthropic API returned ${response.status}`, detail: errText }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || '';

    // Strip any accidental markdown fences
    const clean = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error('JSON parse failed. Length:', rawText.length, 'Last 200 chars:', rawText.slice(-200));
      // Return partial data so the app shows something rather than a blank error
      return new Response(JSON.stringify({
        error: 'parse_failed',
        raw: rawText.slice(0, 500),
        coachingNote: 'AI response was too long to parse fully. Try again or add fewer details.',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (fetchErr) {
    console.error('Fetch error calling Anthropic:', fetchErr);
    return new Response(JSON.stringify({ error: fetchErr.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
