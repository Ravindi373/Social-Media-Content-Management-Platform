// AI-assisted caption and hashtag generation using @huggingface/transformers
//
// We use the SmolLM2-1.7B-Instruct model running locally.
// Because it's a local model, we don't need an API key anymore.

let generator = null;

async function getGenerator() {
  if (!generator) {
    const { pipeline } = await import('@huggingface/transformers');
    generator = await pipeline('text-generation', 'HuggingFaceTB/SmolLM2-1.7B-Instruct');
  }
  return generator;
}

function isConfigured() {
  // Local model is always configured (it downloads on first run)
  return true;
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

  // We are always configured, but keep the interface
  if (!isConfigured()) {
    return simulateCaption({ topic, platform, tone });
  }

  const messages = [
    { role: "system", content: "You are a content creator for a boutique hotel and restaurant called Serene Bay Resort & Kitchen." },
    { role: "user", content: `Write a short, ${tone || 'warm'} social media caption for ${platform || 'Instagram'} about: ${topic}. Please respond only with the caption text, no quotes or additional conversational text.` }
  ];

  try {
    const gen = await getGenerator();
    const result = await gen(messages, { max_new_tokens: 128 });

    let generatedText = result[0].generated_text.at(-1).content.trim();

    // Fallback if the model generates nothing useful
    if (!generatedText) {
      generatedText = `Check out this amazing ${topic} at Serene Bay!`;
    }

    // Extract hashtags from topic for a basic list
    const baseHashtags = ['#SereneBay'];
    const topicWords = (topic || '').split(/\s+/).filter((w) => w.length > 3).slice(0, 2).map((w) => `#${w.replace(/[^a-zA-Z0-9]/g, '')}`);
    const hashtags = [...baseHashtags, ...topicWords].filter(Boolean);

    return { caption: generatedText, hashtags, simulated: false };
  } catch (err) {
    console.error('Transformers API error:', err);
    // Fallback to simulated if the local model fails
    return simulateCaption({ topic, platform, tone });
  }
}

module.exports = { isConfigured, generateCaption };
