export function Page({ title, subtitle, actions, children }) {
  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-navy uppercase">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </main>
  )
}

export function Panel({ title, children, className = '' }) {
  return (
    <section className={`border border-slate-300 bg-white ${className}`}>
      {title && (
        <div className="bg-navy px-4 py-2 text-sm font-semibold tracking-wide text-white">{title}</div>
      )}
      <div className="p-4 md:p-5">{children}</div>
    </section>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block text-sm font-semibold text-navy">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-navy ${props.className || ''}`}
    />
  )
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-navy ${props.className || ''}`}
    />
  )
}

export function Btn({ variant = 'navy', className = '', ...props }) {
  const styles = {
    navy: 'bg-navy text-white hover:bg-navy-dark',
    saffron: 'bg-saffron text-navy hover:brightness-95',
    green: 'bg-india-green text-white hover:brightness-95',
    outline: 'border border-navy bg-white text-navy hover:bg-slate-50',
    danger: 'border border-red-700 bg-white text-red-800 hover:bg-red-50',
  }
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    />
  )
}

export function StatCard({ label, value }) {
  return (
    <div className="border border-slate-300 bg-white">
      <div className="bg-navy px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase">{label}</div>
      <p className="px-4 py-4 text-2xl font-bold text-navy">{value}</p>
    </div>
  )
}

export function GovTable({ headers, empty, colSpan, children }) {
  return (
    <div className="overflow-x-auto border border-slate-300">
      <table className="w-full border-collapse bg-white text-sm">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="border-b border-slate-200 bg-navy px-3 py-2.5 text-left font-semibold whitespace-nowrap text-white"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {empty ? (
            <tr>
              <td className="px-3 py-6 text-center text-slate-500" colSpan={colSpan || headers.length}>
                {empty}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  )
}

export function Td({ children, className = '' }) {
  return <td className={`border-b border-slate-200 px-3 py-2.5 text-slate-800 ${className}`}>{children}</td>
}

export function Alert({ children, tone = 'saffron' }) {
  const cls =
    tone === 'green'
      ? 'border-india-green bg-green-50 text-green-900'
      : tone === 'red'
        ? 'border-red-700 bg-red-50 text-red-900'
        : 'border-saffron bg-orange-50 text-navy'
  return <div className={`border-l-4 px-4 py-3 text-sm ${cls}`}>{children}</div>
}

export function StatusPill({ value }) {
  const v = String(value || '').toLowerCase()
  const color =
    v === 'active' || v === 'paid' || v === 'accepted'
      ? 'bg-green-50 text-india-green'
      : v === 'pending'
        ? 'bg-orange-50 text-saffron'
        : 'bg-slate-100 text-slate-700'
  return <span className={`inline-block px-2 py-0.5 text-xs font-semibold uppercase ${color}`}>{value || '—'}</span>
}
