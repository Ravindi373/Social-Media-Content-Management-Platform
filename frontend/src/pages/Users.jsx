import { useEffect, useState } from 'react';
import client from '../api/client';

const ROLES = ['Administrator', 'Content Creator', 'Content Approver'];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: ROLES[1] });
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    client.get('/users').then((res) => setUsers(res.data)).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function createUser(e) {
    e.preventDefault();
    setError('');
    try {
      await client.post('/users', form);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: ROLES[1] });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create user.');
    }
  }

  async function removeUser(id) {
    await client.delete(`/users/${id}`);
    load();
  }

  return (
    <section>
      <div className="page-head">
        <h1>User management</h1>
        <button className="btn-sm solid" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Add user'}
        </button>
      </div>

      {showForm && (
        <form className="card" onSubmit={createUser} style={{ marginBottom: 20 }}>
          <div className="field"><label htmlFor="user-name">Name</label>
            <input id="user-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field"><label htmlFor="user-email">Email</label>
            <input id="user-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field"><label htmlFor="user-password">Temporary password</label>
            <input id="user-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="field"><label htmlFor="user-role">Role</label>
            <select id="user-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn-sm solid" type="submit">Create user</button>
        </form>
      )}

      <div className="card">
        {loading ? (
          <p className="loading">Loading…</p>
        ) : (
          <div className="table-scroll">
<table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td><button className="btn-sm outline-danger" onClick={() => removeUser(u.id)}>Remove</button></td>
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
