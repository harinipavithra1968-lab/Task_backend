import { useState } from 'react';
import { toISO } from '../utils/date';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Month grid built by hand: no calendar library needed.
// counts = { "2026-10-05": 2 } -> shows a badge on days that have tasks.
export default function Calendar({ selected, onSelect, counts }) {
  const [view, setView] = useState(() => {
    const d = new Date(`${selected}T00:00`);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const y = view.getFullYear();
  const m = view.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells = [
    ...Array(view.getDay()).fill(null), // blanks before the 1st
    ...Array.from({ length: daysInMonth }, (_, i) => toISO(new Date(y, m, i + 1))),
  ];
  const todayISO = toISO(new Date());
  const move = (n) => setView(new Date(y, m + n, 1));

  return (
    <div className="calendar">
      <div className="cal-head">
        <button className="icon-btn" onClick={() => move(-1)} aria-label="Previous month">‹</button>
        <h2>{view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
        <button className="icon-btn" onClick={() => move(1)} aria-label="Next month">›</button>
      </div>
      <div className="cal-grid">
        {DAYS.map((d) => <span key={d} className="cal-dow">{d}</span>)}
        {cells.map((iso, i) =>
          iso ? (
            <button
              key={iso}
              onClick={() => onSelect(iso)}
              className={`cal-day${iso === selected ? ' selected' : ''}${iso === todayISO ? ' today' : ''}`}
              aria-label={`${iso}, ${counts[iso] || 0} tasks`}
            >
              {Number(iso.slice(8))}
              {counts[iso] > 0 && <i className="badge">{counts[iso]}</i>}
            </button>
          ) : <span key={`b${i}`} />
        )}
      </div>
    </div>
  );
}
