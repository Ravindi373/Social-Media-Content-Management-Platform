import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageCircle, Send } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

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
      <div className="form-grid">
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
                    <tr key={p.id} onClick={() => setSelectedPost(p)} style={{ cursor: 'pointer', background: selectedPost?.id === p.id ? 'var(--primary-tint)' : 'transparent' }}>
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
        
        {/* Instagram Post Preview */}
        <div>
          {selectedPost ? (
            <div className="card" style={{ padding: 0, overflow: 'hidden', maxWidth: 400, margin: '0 auto' }}>
              <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee' }}></div>
                <div style={{ fontWeight: 'bold', fontSize: 13 }}>serenebayresort</div>
              </div>
              <div style={{ width: '100%', aspectRatio: '1/1', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                {selectedPost.imageUrl ? (
                  <img src={selectedPost.imageUrl} alt="Post preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  'No Image Available'
                )}
              </div>
              <div style={{ padding: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                   <Heart size={20} />
                   <MessageCircle size={20} />
                   <Send size={20} />
                </div>
                <b>serenebayresort</b> {selectedPost.caption}
              </div>
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' }}>
              Click a post to preview
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
