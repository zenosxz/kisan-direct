export function inr(n) {
  const v = Number(n || 0)
  return `₹ ${v.toLocaleString('en-IN')}`
}

export function retailFromMandi(modal) {
  const m = Number(modal || 0)
  return m ? Math.round(m * 1.28) : 0
}

export function suggestedFromMandi(modal) {
  const m = Number(modal || 0)
  return m ? Math.round(m * 1.04) : 0
}

export function savingPct(direct, retail) {
  const d = Number(direct || 0)
  const r = Number(retail || 0)
  if (!r || !d) return 0
  return Math.round(((r - d) / r) * 100)
}

export function estimateKm(profile, row) {
  if (!profile) return 250
  if (profile.district && profile.district === row.district) return 8
  if (profile.state && profile.state === row.state) return 90
  return 420
}
