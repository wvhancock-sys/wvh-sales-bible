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

  if (mode === 'prep-hypothesis') {
    const ucContext = body.useCaseName ? `Use case: ${body.useCaseName}. ` : '';
    const personaContext = body.personaTitle ? `Buyer persona: ${body.personaTitle} (${body.personaFrame || ''}). ` : '';
    systemPrompt = `You are an elite IBM enterprise sales coach. Generate a hypothesis and provocation for a sales call. Be specific to this account. No em dashes. Each field max 2 sentences.

Respond ONLY with valid JSON, no markdown:
{"twoSentenceHypothesis":"string","fourPartHypothesis":{"pattern":"string","gap":"string","proof":"string","question":"string"},"provocation":{"pattern":"string","tension":"string","implication":"string","openingLine":"string"},"coachingNote":"string"}`;

    userPrompt = `Account: ${account || 'Unknown'}, Industry: ${industry || 'Unknown'}, Product: ${product || 'Unknown'}, ${ucContext}${personaContext}Call type: ${callType || 'discovery'}, Buyer: ${buyerName || ''} ${buyerTitle || ''}, Context: ${knowSoFar || 'None'}`;
  }

  else if (mode === 'prep-questions') {
    const ucContext = body.useCaseName ? `Use case: ${body.useCaseName}. ` : '';
    const personaContext = body.personaTitle ? `Buyer persona: ${body.personaTitle}. ` : '';
    systemPrompt = `You are an elite IBM enterprise sales coach. Generate SPICED discovery questions, objection handlers, and compelling events specific to this account and use case. No em dashes. Each question max 1 sentence.

Products:
- watsonx Orchestrate: cross-system AI agents. Buyers: COO, CHRO, CFO.
- IBM Bob: legacy code modernization AI. Buyers: CIO, CTO, VP Engineering.
- watsonx.governance: AI governance control plane. Buyers: CIO, CDO, CRO, CCO.

Respond ONLY with valid JSON, no markdown:
{"killerQuestions":[{"stage":"Situation","question":"string"},{"stage":"Pain","question":"string"},{"stage":"Pain","question":"string"},{"stage":"Impact","question":"string"},{"stage":"Critical Event","question":"string"},{"stage":"Decision","question":"string"}],"potentialObjections":[{"objection":"string","response":"string"},{"objection":"string","response":"string"}],"compellingEventIdeas":["string","string","string"]}`;

    userPrompt = `Account: ${account || 'Unknown'}, Industry: ${industry || 'Unknown'}, Product: ${product || 'Unknown'}, ${ucContext}${personaContext}Call type: ${callType || 'discovery'}, Buyer: ${buyerName || ''} ${buyerTitle || ''}, Context: ${knowSoFar || 'None'}`;
  }

  else if (mode === 'generate-usecase') {
    const productContext = {
      orchestrate: 'watsonx Orchestrate: AI agents that execute cross-system workflows end to end, not just chatbots that talk about the work. It connects ERPs, HRIS, ITSM, CRM, and any system with an API into one automated flow, eliminating the manual handoffs between systems that consume team capacity. Works for any cross-functional, multi-system workflow in any department.',
      bob: 'IBM Bob (watsonx Code Assistant): AI that understands and modernizes code most tools cannot touch, including COBOL, RPG, PL/I, legacy Java, and proprietary enterprise frameworks. Reverse-engineers existing logic, documents it accurately, and translates or refactors it with engineer-level accuracy. Works for any legacy modernization, code comprehension, or developer productivity scenario.',
      governance: 'watsonx.governance: the control plane for scaling AI responsibly. Automates model approval workflows, continuous compliance monitoring, drift detection, and audit trail generation across any number of models in production. Works for any AI risk, compliance, or model lifecycle scenario in any regulated or risk-conscious industry.',
    };

    systemPrompt = `You are an elite IBM enterprise sales strategist. A seller has described a sales situation that does not match any of IBM's pre-built use cases. Your job is to generate a complete, high-quality use case package for this exact situation, matching the depth and specificity of IBM's best hand-written sales playbooks.

Product context: ${productContext[product] || productContext.orchestrate}

Ground everything in what this product actually does. Do not invent capabilities the product does not have. If the described situation does not fit the product well, say so honestly in the coachingNote field rather than forcing a fit.

Be specific, sharp, and grounded in how this industry and function actually operates. No em dashes. No generic filler.

Respond ONLY with valid JSON, no markdown, no code fences:
{"name":"string (short use case name, e.g. 'Claims Processing Automation')","tagline":"string (one sharp line)","pattern":"string (2-3 sentences on what's happening in companies like this)","gap":"string (2-3 sentences on why current approaches fall short)","proof":"string (1-2 sentences, a believable peer proof point)","killerQuestion":"string (the single best discovery question for this exact situation)","killerQuestions":{"Situation":["string","string"],"Pain":["string","string"],"Impact":["string","string"],"Critical Event":["string","string"],"Decision":["string"]},"objections":[{"objection":"string","response":"string"},{"objection":"string","response":"string"},{"objection":"string","response":"string"}],"compellingEvents":["string","string","string"],"validation":"string (what a 14-day proof would look like for this use case)","coachingNote":"string (honest note on fit, risk, or what to watch for with this scenario)"}`;

    userPrompt = `Product: ${product || 'Unknown'}
Industry: ${industry || 'Unknown'}
Account: ${account || 'Unknown'}

Situation described by the seller: ${body.situationDescription || 'No description provided'}

Generate a complete use case package for this exact situation. Be as specific as the situation described allows. If details are thin, make reasonable industry-grounded assumptions but flag them in the coaching note.`;
  }

  else if (mode === 'prep') {
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

  const maxTokensForMode = mode === 'generate-usecase' ? 2800 : 2000;

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
        max_tokens: maxTokensForMode,
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
