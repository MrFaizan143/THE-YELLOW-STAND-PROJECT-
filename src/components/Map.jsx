import { DATA } from '../data/team';

export default function Map() {
  return (
    <section className="page" aria-label="Match Schedule">
      <span className="tag">Schedule</span>
      <h1>MAP.</h1>
      <div role="list">
        {DATA.fixtures.map((f, i) => (
          <div className="fixture-item" role="listitem" key={i}>
            <div>
              <p className="opponent">{f.o}</p>
              <p className="venue">{f.v}</p>
            </div>
            <p className="date">{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
