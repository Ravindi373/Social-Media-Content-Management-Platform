import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Privacy() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [postId, setPostId] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [unpublishedPosts, setUnpublishedPosts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canEdit = user.role === 'Administrator' || user.role === 'Content Approver';

  function loadData() {
    setLoading(true);
    Promise.all([
      client.get('/consent-logs'),
      client.get('/posts')
    ]).then(([logsRes, postsRes]) => {
      setLogs(logsRes.data);
      setUnpublishedPosts(postsRes.data.filter(p => p.status !== 'published'));
    }).finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleEdit(log) {
    if (!canEdit) return;
    setEditingId(log.id);
    setGuestName(log.guest_name || '');
    setPostId(log.post_id || '');
    setConsentGiven(log.consent_given);
    setDate(log.date || new Date().toISOString().split('T')[0]);
    setShowForm(true);
  }

  function handleAdd() {
    setEditingId(null);
    setGuestName('');
    setPostId('');
    setConsentGiven(true);
    setDate(new Date().toISOString().split('T')[0]);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!guestName) return setError('Guest name is required');
    
    setSaving(true);
    setError('');
    
    const payload = {
      guest_name: guestName,
      post_id: postId || null,
      consent_given: consentGiven,
      date
    };

    try {
      if (editingId) {
        await client.put(`/consent-logs/${editingId}`, payload);
      } else {
        await client.post('/consent-logs', payload);
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save consent log');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="page-head">
        <h1>Privacy &amp; compliance</h1>
        {canEdit && !showForm && <button className="btn-sm solid" onClick={handleAdd}>+ New Consent Record</button>}
      </div>

      <div className="section-title" style={{ marginTop: 0 }}>Guest consent log</div>
      <div className="card" style={{ marginBottom: 20 }}>
        {showForm ? (
          <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
            <div className="section-title" style={{ marginTop: 0 }}>{editingId ? 'Edit Consent Record' : 'Add Consent Record'}</div>
            
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5 }}>Guest Name *</label>
              <input type="text" style={{ width: '100%' }} value={guestName} onChange={e => setGuestName(e.target.value)} required />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5 }}>Unpublished Post (optional)</label>
              <select style={{ width: '100%' }} value={postId} onChange={e => setPostId(e.target.value)}>
                <option value="">Select a post...</option>
                {unpublishedPosts.map(p => (
                  <option key={p.id} value={p.id}>{p.caption.slice(0, 60)}...</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5 }}>Consent Given</label>
              <select style={{ width: '100%' }} value={consentGiven} onChange={e => setConsentGiven(e.target.value === 'true')}>
                <option value="true">Yes (Given)</option>
                <option value="false">No (Not given)</option>
              </select>
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5 }}>Date</label>
              <input type="date" style={{ width: '100%' }} value={date} onChange={e => setDate(e.target.value)} required />
            </div>

            {error && <p className="error-text">{error}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="submit" className="btn-sm solid" disabled={saving}>{saving ? 'Saving...' : 'Save Record'}</button>
              <button type="button" className="btn-sm" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
            </div>
          </form>
        ) : loading ? (
          <p className="loading">Loading…</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead><tr><th>Guest</th><th>Post</th><th>Consent</th><th>Date</th>{canEdit && <th>Action</th>}</tr></thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td>
                      {l.guest_name}
                      {l.editor && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Last edited by: {l.editor.name}</div>}
                    </td>
                    <td>{l.post?.caption?.slice(0, 40) || '—'}</td>
                    <td><span className={`pill ${l.consent_given ? 'published' : 'rejected'}`}>{l.consent_given ? 'Given' : 'Not given'}</span></td>
                    <td>{l.date}</td>
                    {canEdit && <td><button className="btn-sm" onClick={() => handleEdit(l)}>Edit</button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section-title">Data protection statement</div>
      <div className="card" style={{ marginBottom: 20, color: 'var(--muted)' }}>
        Guest images and names are stored only with signed consent, used solely for approved marketing content,
        and removed on request. Full statement continues in the published policy document.
      </div>

      <div className="section-title">Social media guidelines</div>
      <div className="card" style={{ color: 'var(--muted)' }}>
        1. Never post a guest's image or name without recorded consent.<br />
        2. Keep brand voice warm and factual — no exaggerated claims.<br />
        3. Route anything involving a complaint or incident to the Administrator before posting.
      </div>
    </section>
  );
}
