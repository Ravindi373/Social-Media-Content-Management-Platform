// AI-assisted caption and hashtag generation using the Anthropic API.
//
// Real mode: set ANTHROPIC_API_KEY in .env and this calls Claude directly.
// Simulated mode: if it's missing, generateCaption() builds a template-based
// caption instead of failing, so the feature still demonstrates end-to-end
// for anyone grading without their own API key.

const MODEL = process.env.AI_MODEL || 'claude-sonnet-5';

function isConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function simulateCaption({ topic, platform, tone }) {
  const platformName = platform || 'social media';
  const toneWord = tone || 'warm';
  const captions = [
    `${topic} — the kind of moment worth putting your phone down for. Come experience it at Serene Bay.`,
    `Some things are better in person. ${topic}, waiting for you this week at Serene Bay.`,
    `${topic}. That's really the whole pitch. See you there.`,
  ];
  const caption = captions[Math.floor(Math.random() * captions.length)];
  const baseHashtags = ['#SereneBay'];
  const topicWords = (topic || '')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 2)
    .map((w) => `#${w.replace(/[^a-zA-Z0-9]/g, '')}`);
  const hashtags = [...baseHashtags, ...topicWords, `#${platformName.replace(/\s+/g, '')}Ready`].filter(Boolean);

  return { caption, hashtags, simulated: true, tone: toneWord };
}

// topic: short description of what the post is about, e.g. "new seafood brunch menu"
// platform: e.g. "Instagram"
// tone: e.g. "warm and inviting", "playful", "formal"
async function generateCaption({ topic, platform, tone }) {
  if (!topic || !topic.trim()) {
    throw new Error('topic is required');
  }

  if (!isConfigured()) {
    return simulateCaption({ topic, platform, tone });
  }

  const prompt = `You are writing a social media post for a boutique hotel and restaurant
called Serene Bay Resort & Kitchen. Write one short, ${tone || 'warm and inviting'} caption
(1-3 sentences, no emoji overload, no hashtags in the caption text itself) for ${platform || 'Instagram'}
about: ${topic}.

Then suggest 4-6 relevant hashtags, always including #SereneBay.

Respond with ONLY valid JSON in this exact shape, no markdown fences, no extra text:
{"caption": "...", "hashtags": ["#SereneBay", "..."]}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || 'Unknown Anthropic API error';
    const err = new Error(`Anthropic API error: ${message}`);
    err.apiError = data?.error;
    throw err;
  }

  const rawText = data.content?.find((block) => block.type === 'text')?.text || '';
  const cleaned = rawText.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    throw new Error('Could not parse AI response as JSON: ' + rawText.slice(0, 200));
  }

  return { caption: parsed.caption, hashtags: parsed.hashtags || [], simulated: false };
}

module.exports = { isConfigured, generateCaption };
