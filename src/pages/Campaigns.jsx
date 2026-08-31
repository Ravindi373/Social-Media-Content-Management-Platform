import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const TYPES = ['New Product Launch', 'Awareness Campaign', 'Event Promotion'];

export default function Campaigns() {
  const { user } = useAuth();
  const canCreate = user.role === 'Administrator' || user.role === 'Content Creator';

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: TYPES[0], objective: '', start_date: '', end_date: '' });

  function load() {
    setLoading(true);
    client.get('/campaigns').then((res) => setCampaigns(res.data)).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function createCampaign(e) {
    e.preventDefault();
    await client.post('/campaigns', form);
    setShowForm(false);
    setForm({ name: '', type: TYPES[0], objective: '', start_date: '', end_date: '' });
    load();
  }

  return (
    <section>
      <div className="page-head">
        <h1>Campaigns</h1>
        {canCreate && (
          <button className="btn-sm solid" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : '+ New campaign'}
          </button>
        )}
      </div>

      {showForm && (
        <form className="card" onSubmit={createCampaign} style={{ marginBottom: 20 }}>
          <div className="field"><label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field"><label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field"><label>Objective</label>
            <input value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
          </div>
          <div className="row-flex">
            <div className="field" style={{ flex: 1 }}><label>Start date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1 }}><label>End date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <button className="btn-sm solid" type="submit">Create campaign</button>
        </form>
      )}

      {loading ? (
        <p className="loading">Loading…</p>
      ) : (
        <div className="grid cols-3">
          {campaigns.map((c) => (
            <div className="card" key={c.id}>
              <div className="section-title" style={{ marginTop: 0 }}>{c.name}</div>
              <p style={{ color: 'var(--muted)', margin: '0 0 10px' }}>{c.objective}</p>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {c.posts?.length || 0} posts &middot; {c.start_date} – {c.end_date}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
