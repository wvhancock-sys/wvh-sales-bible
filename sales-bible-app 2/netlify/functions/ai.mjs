export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { mode, product, account, industry, callType, knowSoFar, buyerName, buyerTitle, pains, emailType, stalledContext } = body;

    let systemPrompt = '';
    let userPrompt = '';

    if (mode === 'prep') {
      systemPrompt = `You are an elite enterprise sales coach for IBM's AI Power & Productivity team. You help sellers prep for discovery calls using the IBM Sales Bible methodology: hypothesis-first, provocation-led, SPICED discovery framework (Situation, Pain, Impact, Critical Event, Decision).

Products you sell:
- watsonx Orchestrate: AI agents that execute cross-system back-office work. Buyers: COO, CHRO, CFO.
- IBM Bob (watsonx Code Assistant): Engineer-grade AI for legacy modernization (COBOL, RPG, Java). Buyers: CIO, CTO, VP Engineering.
- watsonx.governance: AI control plane for regulated industries scaling AI. Buyers: CIO, CDO, CRO, CCO.

Your job: generate a complete, account-specific call prep package. Be SPECIFIC to this account and industry. Never generic. Never use em dashes.

Respond in this EXACT JSON format:
{
  "twoSentenceHypothesis": "string",
  "fourPartHypothesis": {
    "pattern": "string",
    "gap": "string", 
    "proof": "string",
    "question": "string"
  },
  "provocation": {
    "pattern": "string",
    "tension": "string",
    "implication": "string",
    "openingLine": "string"
  },
  "killerQuestions": [
    { "stage": "Situation|Pain|Impact|Critical Event|Decision", "question": "string" }
  ],
  "potentialObjections": [
    { "objection": "string", "response": "string" }
  ],
  "compellingEventIdeas": ["string"],
  "coachingNote": "string"
}`;

      userPrompt = `Build a complete call prep package for:

Account: ${account || 'Unknown'}
Industry: ${industry || 'Unknown'}
Product: ${product}
Call type: ${callType}
What I already know: ${knowSoFar || 'Nothing yet'}

Make the hypothesis, provocation, and questions highly specific to ${account} in the ${industry} industry. Reference real industry dynamics where possible. The provocation should feel like it was written by someone who has seen 50 companies in this industry.

Generate 5-7 killer questions spread across SPICED stages. Generate 2-3 likely objections with sharp responses. Generate 2-3 specific compelling event ideas for this industry.`;
    }

    else if (mode === 'email') {
      systemPrompt = `You are an elite enterprise sales writer for IBM's AI Power & Productivity team. You write concise, direct, peer-level sales emails. No marketing language. No fluff. Problem-first framing always. Never use em dashes.

Email types you write:
- cold: 4 lines max, specific trigger, one question
- recap: what you heard (in their words), specific next step
- nudge: re-anchor to the pain they confirmed, soft CTA
- breakup (diagnostic): the three-reason diagnostic breakup format
- escalation: executive-level, cc manager

Respond in this EXACT JSON format:
{
  "subject": "string",
  "body": "string",
  "notes": "string"
}`;

      userPrompt = `Write a ${emailType} email for:

Buyer: ${buyerName || '[Name]'} at ${account || '[Company]'}
Product: ${product}
Context / pains discussed: ${pains || stalledContext || 'Not provided'}

Match the tone to the email type. Keep it under 120 words unless it's an escalation. The buyer should feel like you listened, not like you're pitching.`;
    }

    else if (mode === 'objection') {
      systemPrompt = `You are an elite enterprise sales coach. Given an objection and context, provide the sharpest possible response using the IBM Sales Bible methodology: Acknowledge, Ask, Isolate, Answer. Never use em dashes.

Respond in JSON:
{
  "acknowledge": "string",
  "askToIsolate": "string", 
  "answer": "string",
  "followUp": "string",
  "coachingNote": "string"
}`;

      userPrompt = `Help me handle this objection:

Objection: ${body.objection}
Product: ${product}
Context: ${body.context || 'Mid-discovery call'}
Account: ${account || 'Unknown'}`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Strip markdown code fences if present
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('AI function error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/api/ai' };
