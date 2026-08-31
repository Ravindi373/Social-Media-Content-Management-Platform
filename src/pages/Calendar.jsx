import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Calendar() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/posts?status=scheduled').then((res) => setPosts(res.data)).finally(() => setLoading(false));
  }, []);

  const sorted = [...posts].sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

  return (
    <section>
      <div className="page-head">
        <h1>Content calendar</h1>
        <span className="badge">Scheduled posts</span>
      </div>
      <div className="card">
        {loading ? (
          <p className="loading">Loading…</p>
        ) : sorted.length === 0 ? (
          <p className="empty-state">Nothing scheduled yet.</p>
        ) : (
          <table>
            <thead><tr><th>Date</th><th>Time</th><th>Post</th><th>Platforms</th></tr></thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.id}>
                  <td>{p.scheduled_date}</td>
                  <td>{p.scheduled_time}</td>
                  <td>{p.caption.length > 60 ? p.caption.slice(0, 60) + '…' : p.caption}</td>
                  <td>{p.platforms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="loading" style={{ marginTop: 16 }}>
        Shown here as a sortable list — swap in a month-grid component for the full calendar view if your team wants the extra polish.
      </p>
    </section>
  );
}
