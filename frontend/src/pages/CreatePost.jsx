import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const PLATFORM_OPTIONS = ['Instagram', 'Facebook', 'TikTok', 'X'];
const TONE_OPTIONS = ['warm and inviting', 'playful', 'elegant and formal', 'urgent / limited-time'];

export default function CreatePost() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // AI caption generation
  const [aiConfigured, setAiConfigured] = useState(false);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [generating, setGenerating] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    client.get('/campaigns').then((res) => setCampaigns(res.data));
    client.get('/posts/integration-status').then((res) => setAiConfigured(res.data.aiCaptionConfigured));
  }, []);

  function togglePlatform(name) {
    setPlatforms((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]));
  }

  async function generateWithAI() {
    if (!topic.trim()) {
      setAiResult({ error: true, message: 'Enter a short topic first, e.g. "new seafood brunch menu".' });
      return;
    }
    setGenerating(true);
    setAiResult(null);
    try {
      const { data } = await client.post('/posts/generate-caption', {
        topic,
        platform: platforms[0] || 'Instagram',
        tone,
      });
      setCaption(data.caption);
      setHashtags(data.hashtags.join(','));
      setAiResult({ simulated: data.simulated });
    } catch (err) {
      setAiResult({ error: true, message: err.response?.data?.error || 'Could not generate a caption.' });
    } finally {
      setGenerating(false);
    }
  }

  async function save(submit) {
    if (!caption.trim()) {
      setStatus('Caption is required.');
      return;
    }
    setSaving(true);
    setStatus('');
    try {
      await client.post('/posts', {
        caption,
        image_url: imageUrl,
        hashtags,
        platforms: platforms.join(','),
        campaign_id: campaignId || null,
        submit,
      });
      navigate('/dashboard');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not save post.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="page-head">
        <h1>Create post</h1>
        <span className="badge">Draft — unsaved</span>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ marginTop: 0 }}>
          Generate with AI
          <span style={{ float: 'right', fontWeight: 'normal' }}>
            {aiConfigured ? '🟢 Connected to Claude' : '🟡 Simulated (no API key configured)'}
          </span>
        </div>
        <div className="row-flex" style={{ alignItems: 'flex-start' }}>
          <input
            type="text"
            style={{ flex: 2, minWidth: 240 }}
            placeholder="What's this post about? e.g. new seafood brunch menu"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <select style={{ flex: 1, minWidth: 160 }} value={tone} onChange={(e) => setTone(e.target.value)}>
            {TONE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="btn-sm solid" disabled={generating} onClick={generateWithAI}>
            {generating ? 'Generating…' : 'Generate caption & hashtags'}
          </button>
        </div>
        {aiResult && (
          <p className={aiResult.error ? 'error-text' : 'loading'} style={{ marginTop: 10, marginBottom: 0 }}>
            {aiResult.error
              ? aiResult.message
              : aiResult.simulated
                ? 'Filled in below with a simulated caption — set ANTHROPIC_API_KEY in the backend .env for real AI generation.'
                : 'Filled in below using Claude — feel free to edit before saving.'}
          </p>
        )}
      </div>

      <div className="form-grid">
        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>Caption</div>
          <textarea rows={4} value={caption} onChange={(e) => setCaption(e.target.value)}
            placeholder="Sunday brunch just got better — our new seafood spread is live from 12pm." />

          <div className="section-title">Image</div>
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image filename or URL (upload wiring is a stretch goal)" />

          <div className="section-title">Hashtags</div>
          <input type="text" value={hashtags} onChange={(e) => setHashtags(e.target.value)}
            placeholder="#SereneBay,#SundayBrunch,#OceanDining" />
        </div>

        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>Target platforms</div>
          {PLATFORM_OPTIONS.map((name) => (
            <div className="checkbox-row" key={name}>
              <input type="checkbox" checked={platforms.includes(name)} onChange={() => togglePlatform(name)} id={`plat-${name}`} />
              <label htmlFor={`plat-${name}`}>{name}</label>
            </div>
          ))}

          <div className="section-title">Campaign</div>
          <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
            <option value="">No campaign</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {status && <p className="error-text">{status}</p>}

          <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
            <button className="btn-sm" disabled={saving} onClick={() => save(false)}>Save as draft</button>
            <button className="btn-sm solid" disabled={saving} onClick={() => save(true)}>Submit for approval</button>
          </div>
        </div>
      </div>
    </section>
  );
}
