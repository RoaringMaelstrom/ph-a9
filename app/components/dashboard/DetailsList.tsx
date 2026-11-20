/** Label/value rows for details dialogs. Server- or client-rendered. */
export default function DetailsList({
  rows,
}: {
  rows: { label: string; value: React.ReactNode }[]
}) {
  return (
    <dl className="divide-y rounded-xl border">
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="grid grid-cols-[8.5rem_1fr] gap-3 px-4 py-2.5 text-sm"
        >
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="min-w-0 font-medium break-words">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
