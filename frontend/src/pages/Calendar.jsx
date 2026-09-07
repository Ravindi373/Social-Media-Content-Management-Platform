import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Calendar() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facebookConfigured, setFacebookConfigured] = useState(false);
  const [publishing, setPublishing] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  function load() {
    setLoading(true);
    Promise.all([
      client.get('/posts?status=scheduled'),
      client.get('/posts/integration-status'),
    ])
      .then(([postsRes, statusRes]) => {
        setPosts(postsRes.data);
        setFacebookConfigured(statusRes.data.facebookConfigured);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function publish(id) {
    setPublishing(id);
    setLastResult(null);
    try {
      const { data } = await client.post(`/posts/${id}/publish`);
      setLastResult({ id, ...data });
      load();
    } catch (err) {
      setLastResult({ id, message: err.response?.data?.message || 'Publish failed.', error: true });
    } finally {
      setPublishing(null);
    }
  }

  const sorted = [...posts].sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

  return (
    <section>
      <div className="page-head">
        <h1>Content calendar</h1>
        <span className="badge">
          {facebookConfigured ? 'Facebook connected — live publishing' : 'Simulated publishing (no Facebook App configured)'}
        </span>
      </div>

      {lastResult && (
        <div className="card" style={{ marginBottom: 16, borderColor: lastResult.error ? 'var(--danger)' : 'var(--border)' }}>
          {lastResult.error ? (
            <p className="error-text" style={{ margin: 0 }}>{lastResult.message}</p>
          ) : (
            <p style={{ margin: 0 }}>
              {lastResult.simulated ? '🟡 Simulated: ' : '🟢 Live: '}
              {lastResult.message}
              {' '}(external ID: <code>{lastResult.post.external_post_id}</code>)
            </p>
          )}
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="loading">Loading…</p>
        ) : sorted.length === 0 ? (
          <p className="empty-state">Nothing scheduled yet.</p>
        ) : (
          <div className="table-scroll">
<table>
            <thead><tr><th>Date</th><th>Time</th><th>Post</th><th>Platforms</th><th></th></tr></thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.id}>
                  <td>{p.scheduled_date}</td>
                  <td>{p.scheduled_time}</td>
                  <td>{p.caption.length > 60 ? p.caption.slice(0, 60) + '…' : p.caption}</td>
                  <td>{p.platforms}</td>
                  <td>
                    <button className="btn-sm solid" disabled={publishing === p.id} onClick={() => publish(p.id)}>
                      {publishing === p.id ? 'Publishing…' : 'Publish now'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        )}
      </div>
      <p className="loading" style={{ marginTop: 16 }}>
        Shown here as a sortable list — swap in a month-grid component for the full calendar view if your team wants the extra polish.
        {!facebookConfigured && ' Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN in the backend .env to publish live instead of simulating.'}
      </p>
    </section>
  );
}
