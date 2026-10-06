import './StatCard.css'

type StatCardProps = {
  label: string
  value: string
  testId: string
}

export function StatCard({ label, value, testId }: StatCardProps) {
  return (
    <article className="stat-card" data-testid={testId}>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
    </article>
  )
}
