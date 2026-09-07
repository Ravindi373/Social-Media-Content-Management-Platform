import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar,
} from 'recharts';
import client from '../api/client';

const COLOR_PRIMARY = '#2F4438';
const COLOR_ACCENT = '#A85C2C';
const COLOR_GOLD = '#C7973E';

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [trend, setTrend] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [byCampaign, setByCampaign] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/analytics/summary'),
      client.get('/analytics'),
      client.get('/analytics/trend'),
      client.get('/analytics/top-posts'),
      client.get('/analytics/by-campaign'),
    ])
      .then(([s, r, t, tp, bc]) => {
        setSummary(s.data);
        setRows(r.data);
        setTrend(t.data);
        setTopPosts(tp.data);
        setByCampaign(bc.data);
      })
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
            <div className="stat-card"><div className="num">{summary.likes.toLocaleString()}</div><div className="label">Likes</div></div>
            <div className="stat-card"><div className="num">{summary.shares.toLocaleString()}</div><div className="label">Shares</div></div>
            <div className="stat-card"><div className="num">{summary.reach.toLocaleString()}</div><div className="label">Reach</div></div>
          </div>
          <div className="grid cols-3" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="num">{summary.engagementRate}%</div>
              <div className="label">Engagement rate (likes + shares + comments ÷ reach)</div>
            </div>
          </div>

          <div className="section-title" style={{ marginTop: 0 }}>Reach by platform</div>
          <div className="card" style={{ marginBottom: 24 }}>
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

          {/* --- Advanced: reach & engagement trend over the last 7 days --- */}
          <div className="section-title">Reach &amp; engagement over time (last 7 days)</div>
          <div className="card" style={{ marginBottom: 24 }}>
            {trend.length === 0 ? (
              <p className="empty-state">Not enough history yet — run the seed script to generate a week of sample data.</p>
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={trend} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2DCC9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#847F6C' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#847F6C' }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="reach" name="Reach" stroke={COLOR_PRIMARY} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="likes" name="Likes" stroke={COLOR_ACCENT} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* --- Advanced: top performing posts by reach, with engagement rate --- */}
          <div className="section-title">Top performing posts</div>
          <div className="card" style={{ marginBottom: 24 }}>
            {topPosts.length === 0 ? (
              <p className="empty-state">No post-level analytics yet.</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr><th>Post</th><th>Platforms</th><th>Reach</th><th>Likes</th><th>Engagement rate</th></tr>
                  </thead>
                  <tbody>
                    {topPosts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.caption.length > 45 ? p.caption.slice(0, 45) + '…' : p.caption}</td>
                        <td>{p.platforms}</td>
                        <td>{p.reach.toLocaleString()}</td>
                        <td>{p.likes.toLocaleString()}</td>
                        <td>{p.engagementRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* --- Advanced: performance by campaign --- */}
          <div className="section-title">Performance by campaign</div>
          <div className="card">
            {byCampaign.length === 0 ? (
              <p className="empty-state">No campaign-linked analytics yet.</p>
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={byCampaign} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2DCC9" />
                    <XAxis dataKey="campaign" tick={{ fontSize: 10, fill: '#847F6C' }} interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: '#847F6C' }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="reach" name="Reach" fill={COLOR_PRIMARY} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="likes" name="Likes" fill={COLOR_GOLD} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
