import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([client.get('/analytics/summary'), client.get('/analytics')])
      .then(([s, r]) => { setSummary(s.data); setRows(r.data); })
      .finally(() => setLoading(false));
  }, []);

  const byPlatform = rows.reduce((acc, r) => {
    acc[r.platform] = (acc[r.platform] || 0) + r.reach;
    return acc;
  }, {});
  const maxReach = Math.max(1, ...Object.values(byPlatform));

  return (
    <section>
      <div className="page-head">
        <h1>Analytics</h1>
        <span className="badge">All time</span>
      </div>

      {loading || !summary ? (
        <p className="loading">Loading…</p>
      ) : (
        <>
          <div className="grid cols-4" style={{ marginBottom: 24 }}>
            <div className="stat-card"><div className="num">{summary.posts}</div><div className="label">Posts</div></div>
            <div className="stat-card"><div className="num">{summary.likes}</div><div className="label">Likes</div></div>
            <div className="stat-card"><div className="num">{summary.shares}</div><div className="label">Shares</div></div>
            <div className="stat-card"><div className="num">{summary.reach}</div><div className="label">Reach</div></div>
          </div>

          <div className="section-title">Reach by platform</div>
          <div className="card">
            {Object.entries(byPlatform).length === 0 ? (
              <p className="empty-state">No analytics recorded yet.</p>
            ) : (
              Object.entries(byPlatform).map(([platform, reach]) => (
                <div className="bar-row" key={platform}>
                  <div className="platform">{platform}</div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(reach / maxReach) * 100}%` }} /></div>
                  <div className="val">{reach.toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}
