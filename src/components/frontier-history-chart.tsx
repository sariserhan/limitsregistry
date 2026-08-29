import type { FrontierHistory, FrontierHistoryPoint } from "../domain/frontier-history";

const WIDTH = 640, HEIGHT = 180, PAD_X = 40, PAD_Y = 26;

function buildScale(lower: FrontierHistoryPoint[], upper: FrontierHistoryPoint[]) {
  const all = [...lower, ...upper];
  const years = all.map((p) => p.year);
  const values = all.map((p) => p.value);
  const minYear = Math.min(...years), maxYear = Math.max(...years);
  const minValue = Math.min(...values), maxValue = Math.max(...values);
  const yearSpan = maxYear - minYear || 1;
  const valueSpan = maxValue - minValue || Math.abs(maxValue) || 1;
  const x = (year: number) => minYear === maxYear ? WIDTH / 2 : PAD_X + ((year - minYear) / yearSpan) * (WIDTH - PAD_X * 2);
  const y = (value: number) => HEIGHT - PAD_Y - ((value - minValue) / valueSpan) * (HEIGHT - PAD_Y * 2);
  return { x, y, minYear, maxYear };
}

function pathFor(points: FrontierHistoryPoint[], x: (n: number) => number, y: (n: number) => number) {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
}

export function FrontierHistoryChart({ history }: { history: FrontierHistory }) {
  const { lower, upper } = history;
  const { x, y, minYear, maxYear } = buildScale(lower, upper);
  const sameYear = minYear === maxYear;
  const dataPoints = [...lower.map((point) => ({ ...point, bound: "Lower bound" })), ...upper.map((point) => ({ ...point, bound: "Upper bound" }))].sort((a, b) => a.year - b.year || a.bound.localeCompare(b.bound));
  return <div className="frontier-history">
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="How this record's accepted bounds moved over time">
      <line x1={PAD_X} y1={HEIGHT - PAD_Y} x2={WIDTH - PAD_X} y2={HEIGHT - PAD_Y} className="fh-axis" />
      {lower.length > 1 ? <path d={pathFor(lower, x, y)} className="fh-line fh-lower" /> : null}
      {upper.length > 1 ? <path d={pathFor(upper, x, y)} className="fh-line fh-upper" /> : null}
      {lower.map((p, i) => <circle key={`l${i}`} cx={x(p.year)} cy={y(p.value)} r={3} className="fh-dot fh-lower" />)}
      {upper.map((p, i) => <circle key={`u${i}`} cx={x(p.year)} cy={y(p.value)} r={3} className="fh-dot fh-upper" />)}
      <text x={PAD_X} y={HEIGHT - 6} className="fh-tick">{minYear}</text>
      {!sameYear ? <text x={WIDTH - PAD_X} y={HEIGHT - 6} textAnchor="end" className="fh-tick">{maxYear}</text> : null}
    </svg>
    <div className="frontier-history-legend">
      {lower.length ? <span className="fh-legend-lower">Achievable / lower bound</span> : null}
      {upper.length ? <span className="fh-legend-upper">Impossibility / upper bound</span> : null}
    </div>
    <details className="frontier-history-data">
      <summary>View frontier data</summary>
      <table>
        <caption>Accepted frontier changes over time</caption>
        <thead><tr><th scope="col">Year</th><th scope="col">Bound</th><th scope="col">Value</th></tr></thead>
        <tbody>{dataPoints.map((point, index) => <tr key={`${point.year}-${point.bound}-${index}`}><td>{point.year}</td><td>{point.bound}</td><td>{point.value}</td></tr>)}</tbody>
      </table>
    </details>
  </div>;
}
