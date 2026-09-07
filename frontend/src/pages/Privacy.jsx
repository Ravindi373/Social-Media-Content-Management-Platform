import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Privacy() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/consent-logs').then((res) => setLogs(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="page-head"><h1>Privacy &amp; compliance</h1></div>

      <div className="section-title" style={{ marginTop: 0 }}>Guest consent log</div>
      <div className="card" style={{ marginBottom: 20 }}>
        {loading ? (
          <p className="loading">Loading…</p>
        ) : (
          <div className="table-scroll">
<table>
            <thead><tr><th>Guest</th><th>Post</th><th>Consent</th><th>Date</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.guest_name}</td>
                  <td>{l.post?.caption?.slice(0, 40) || '—'}</td>
                  <td><span className={`pill ${l.consent_given ? 'published' : 'rejected'}`}>{l.consent_given ? 'Given' : 'Not given'}</span></td>
                  <td>{l.date}</td>
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
