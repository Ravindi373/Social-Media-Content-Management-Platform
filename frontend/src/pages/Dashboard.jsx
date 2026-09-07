import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/posts').then((res) => setPosts(res.data)).finally(() => setLoading(false));
  }, []);

  const counts = {
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    published: posts.filter((p) => p.status === 'published').length,
    draft: posts.filter((p) => p.status === 'draft').length,
    pending_approval: posts.filter((p) => p.status === 'pending_approval').length,
  };

  const recent = [...posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <section>
      <div className="page-head">
        <h1>Dashboard</h1>
        <span className="badge">{user.role}</span>
      </div>

      <div className="grid cols-4" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="num">{counts.scheduled}</div><div className="label">Scheduled posts</div></div>
        <div className="stat-card"><div className="num">{counts.published}</div><div className="label">Published posts</div></div>
        <div className="stat-card"><div className="num">{counts.draft}</div><div className="label">Drafts</div></div>
        <div className="stat-card"><div className="num">{counts.pending_approval}</div><div className="label">Pending approval</div></div>
      </div>

      <div className="section-title">Recent activity</div>
      <div className="card">
        {loading ? (
          <p className="loading">Loading posts…</p>
        ) : recent.length === 0 ? (
          <p className="empty-state">No posts yet.</p>
        ) : (
          <div className="table-scroll">
<table>
            <thead>
              <tr><th>Post</th><th>Platforms</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr key={p.id}>
                  <td>{p.caption.length > 50 ? p.caption.slice(0, 50) + '…' : p.caption}</td>
                  <td>{p.platforms}</td>
                  <td><span className={`pill ${p.status}`}>{p.status.replace('_', ' ')}</span></td>
                  <td>{p.scheduled_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        )}
      </div>
    </section>
  );
}
