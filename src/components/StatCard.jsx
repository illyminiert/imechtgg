export default function StatCard({ label, value }) {
  return <article className="overview-card"><span className="caption">{label}</span><strong className="value">{value}</strong></article>;
}
