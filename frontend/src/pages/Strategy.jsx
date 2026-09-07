export default function Strategy() {
  return (
    <section>
      <div className="page-head"><h1>Social media strategy</h1></div>

      <div className="section-title" style={{ marginTop: 0 }}>Best posting times</div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="table-scroll">
<table>
          <thead><tr><th>Platform</th><th>Best time</th><th>Best day</th></tr></thead>
          <tbody>
            <tr><td>Instagram</td><td>5:00 – 7:00pm</td><td>Thursday, Friday</td></tr>
            <tr><td>Facebook</td><td>11:00am – 1:00pm</td><td>Saturday</td></tr>
            <tr><td>TikTok</td><td>7:00 – 9:00pm</td><td>Friday, Sunday</td></tr>
          </tbody>
        </table>
</div>
      </div>

      <div className="section-title">Suggested hashtags</div>
      <div className="row-flex" style={{ marginBottom: 20 }}>
        {['#SereneBay', '#OceanDining', '#WeekendGetaway', '#IslandHotel', '#ChefsTable'].map((h) => (
          <span className="tag" key={h}>{h}</span>
        ))}
      </div>

      <div className="section-title">Target audience</div>
      <div className="grid cols-3">
        <div className="card"><strong>Couples, 28–40</strong><p style={{ color: 'var(--muted)', margin: '4px 0 0' }}>Weekend packages, dining experiences</p></div>
        <div className="card"><strong>Families, 35–50</strong><p style={{ color: 'var(--muted)', margin: '4px 0 0' }}>School holiday stays, buffet promotions</p></div>
        <div className="card"><strong>Corporate planners</strong><p style={{ color: 'var(--muted)', margin: '4px 0 0' }}>Events, conferences, group dining</p></div>
      </div>
      <p className="loading" style={{ marginTop: 16 }}>
        This page is static reference content for the prototype. Wire it to an editable settings table if you want the strategy content to be admin-configurable.
      </p>
    </section>
  );
}
