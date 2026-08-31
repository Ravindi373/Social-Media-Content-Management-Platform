import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});

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
        approvals.map((a) => (
          <div className="card" key={a.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <strong>{a.post?.caption}</strong>
                <div className="row-flex" style={{ marginTop: 8 }}>
                  {(a.post?.platforms || '').split(',').filter(Boolean).map((p) => (
                    <span className="tag" key={p}>{p}</span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Comments (optional)"
                  value={comments[a.id] || ''}
                  onChange={(e) => setComments({ ...comments, [a.id]: e.target.value })}
                  style={{ marginTop: 10, width: '100%', maxWidth: 400 }}
                />
              </div>
              <div className="row-flex">
                <button className="btn-sm outline-danger" onClick={() => review(a.id, 'rejected')}>Reject</button>
                <button className="btn-sm solid" onClick={() => review(a.id, 'approved')}>Approve</button>
              </div>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
