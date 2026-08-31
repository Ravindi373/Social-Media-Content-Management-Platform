import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const PLATFORM_OPTIONS = ['Instagram', 'Facebook', 'TikTok', 'X'];

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

  useEffect(() => {
    client.get('/campaigns').then((res) => setCampaigns(res.data));
  }, []);

  function togglePlatform(name) {
    setPlatforms((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]));
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
