import { DATA } from '../data/team';

export default function Pride() {
  return (
    <section className="page" aria-label="Squad and Staff">
      <span className="tag">Squad &amp; Staff</span>
      <h1>PRIDE.</h1>

      {Object.entries(DATA.squad).map(([category, players]) => (
        <div key={category}>
          <h2 className="squad-category-title">{category}</h2>
          <div className="grid">
            {players.map((player) => (
              <div className="card" key={player}>
                <p className="name">{player}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h2 className="squad-category-title">Support Staff</h2>
      {DATA.staff.map(([role, name]) => (
        <div className="staff-item" key={role}>
          <span className="staff-role">{role}</span>
          <span>{name}</span>
        </div>
      ))}
    </section>
  );
}
