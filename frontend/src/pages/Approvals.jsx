import { useEffect, useState } from 'react';
import client from '../api/client';
import PostPreview from '../components/PostPreview';

export default function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);

  function load() {
    setLoading(true);
    client.get('/approvals?status=pending').then((res) => setApprovals(res.data)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function review(id, decision) {
    await client.put(`/approvals/${id}`, { status: decision, comments: comments[id] || '' });
    load();
  }

  return (
    <section>
      <div className="page-head">
        <h1>Approval queue</h1>
        <span className="badge">{approvals.length} pending</span>
      </div>

      {loading ? (
        <p className="loading">Loading…</p>
      ) : approvals.length === 0 ? (
        <div className="card"><p className="empty-state">Nothing waiting for review.</p></div>
      ) : (
        <div className="form-grid">
          <div>
            {approvals.map((a) => (
              <div 
                className="card" 
                key={a.id} 
                style={{ 
                  marginBottom: 14, 
                  cursor: 'pointer', 
                  border: selectedPost?.id === a.post?.id ? '2px solid var(--primary)' : '1px solid var(--border)' 
                }}
                onClick={() => setSelectedPost(a.post)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <strong>{a.post?.caption?.slice(0, 80) + (a.post?.caption?.length > 80 ? '...' : '')}</strong>
                    <div className="row-flex" style={{ marginTop: 8 }}>
                      {(a.post?.platforms || '').split(',').filter(Boolean).map((p) => (
                        <span className="tag" key={p}>{p}</span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Comments (optional)"
                      value={comments[a.id] || ''}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setComments({ ...comments, [a.id]: e.target.value })}
                      style={{ marginTop: 10, width: '100%', maxWidth: 400 }}
                    />
                  </div>
                  <div className="row-flex">
                    <button className="btn-sm outline-danger" onClick={(e) => { e.stopPropagation(); review(a.id, 'rejected'); }}>Reject</button>
                    <button className="btn-sm solid" onClick={(e) => { e.stopPropagation(); review(a.id, 'approved'); }}>Approve</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <PostPreview post={selectedPost} />
          </div>
        </div>
      )}
    </section>
  );
}
