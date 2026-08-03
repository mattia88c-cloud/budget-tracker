import { useState, useEffect } from 'react'
import styles from './TaxAlert.module.css'

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function monthsUntil(ym) {
  if (!ym) return 0
  const [y, m] = ym.split('-').map(Number)
  const now = new Date()
  const diff = (y - now.getFullYear()) * 12 + (m - 1 - now.getMonth())
  return Math.max(0, diff)
}

function formatYM(ym) {
  if (!ym) return null
  const [y, m] = ym.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
}

function loadTasseBalance() {
  try {
    const conti = JSON.parse(localStorage.getItem('budget_conti')) ?? []
    const conto = conti.find(c => c.name?.toLowerCase() === 'tasse')
    return conto?.balance ?? 0
  } catch { return 0 }
}

export default function TaxAlert() {
  const [target, setTarget] = useState(() => {
    try { return parseFloat(localStorage.getItem('tax_target') || '0') || 0 } catch { return 0 }
  })
  const [dueYM, setDueYM] = useState(() => {
    try { return localStorage.getItem('tax_due_date') || '' } catch { return '' }
  })
  const [editingTarget, setEditingTarget] = useState(false)
  const [editingDate, setEditingDate] = useState(false)
  const [targetInput, setTargetInput] = useState('')
  const [dateInput, setDateInput] = useState('')

  const [tasseSaved, setTasseSaved] = useState(loadTasseBalance)

  useEffect(() => { localStorage.setItem('tax_target', String(target)) }, [target])
  useEffect(() => { localStorage.setItem('tax_due_date', dueYM) }, [dueYM])

  useEffect(() => {
    const handler = () => setTasseSaved(loadTasseBalance())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const remaining = Math.max(0, target - tasseSaved)
  const months = monthsUntil(dueYM)
  const monthlyNeeded = remaining > 0 && months > 0 ? Math.ceil(remaining / months) : 0
  const covered = target > 0 && tasseSaved >= target
  const pct = target > 0 ? Math.min(100, Math.round((tasseSaved / target) * 100)) : 0

  const status = covered ? 'ok' : remaining > 0 && months <= 1 ? 'danger' : remaining > 0 ? 'warn' : 'idle'
  const statusColor = { ok: '#4ade80', warn: '#f59e0b', danger: '#f87171', idle: 'var(--text-muted)' }[status]

  const dueDateLabel = formatYM(dueYM)

  return (
    <div className={`${styles.wrap} ${styles[status]}`}>
      <div className={styles.header}>
        <span className={styles.icon}>🏛️</span>
        <span className={styles.title}>Accantonamento tasse</span>
        {dueDateLabel && (
          <span className={styles.dueBadge}>
            scadenza {dueDateLabel}
            {months > 0 && <span className={styles.monthsLeft}> · {months} {months === 1 ? 'mese' : 'mesi'}</span>}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.amounts}>
          <div className={styles.amountBlock}>
            <span className={styles.amountLabel}>Conto tasse</span>
            <span className={styles.amountValue} style={{ color: statusColor }}>{fmt(tasseSaved)}</span>
          </div>
          <div className={styles.divider}>/</div>
          <div className={styles.amountBlock}>
            <span className={styles.amountLabel}>Target</span>
            {editingTarget ? (
              <div className={styles.inlineEdit}>
                <span className={styles.editCurrency}>€</span>
                <input
                  className={styles.editInput}
                  type="number" min="0" step="50"
                  value={targetInput}
                  onChange={e => setTargetInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { const n = parseFloat(targetInput); if (!isNaN(n)) setTarget(n); setEditingTarget(false) }
                    if (e.key === 'Escape') setEditingTarget(false)
                  }}
                  autoFocus
                />
                <button className={styles.confirmBtn} onClick={() => { const n = parseFloat(targetInput); if (!isNaN(n)) setTarget(n); setEditingTarget(false) }}>✓</button>
              </div>
            ) : (
              <span
                className={styles.amountValue}
                style={{ color: 'var(--text-soft)', cursor: 'pointer' }}
                onClick={() => { setTargetInput(String(target || '')); setEditingTarget(true) }}
              >
                {target > 0 ? fmt(target) : <span className={styles.setHint}>imposta ✏️</span>}
              </span>
            )}
          </div>
          <div className={styles.divider}>/</div>
          <div className={styles.amountBlock}>
            <span className={styles.amountLabel}>Scadenza</span>
            {editingDate ? (
              <div className={styles.inlineEdit}>
                <input
                  className={styles.editInput}
                  type="month"
                  value={dateInput}
                  onChange={e => setDateInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { setDueYM(dateInput); setEditingDate(false) }
                    if (e.key === 'Escape') setEditingDate(false)
                  }}
                  autoFocus
                />
                <button className={styles.confirmBtn} onClick={() => { setDueYM(dateInput); setEditingDate(false) }}>✓</button>
              </div>
            ) : (
              <span
                className={styles.amountValue}
                style={{ color: 'var(--text-soft)', cursor: 'pointer' }}
                onClick={() => { setDateInput(dueYM || ''); setEditingDate(true) }}
              >
                {dueDateLabel ?? <span className={styles.setHint}>imposta ✏️</span>}
              </span>
            )}
          </div>
        </div>

        {target > 0 && (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${pct}%`, background: statusColor }} />
            </div>
            <span className={styles.pct}>{pct}%</span>
          </div>
        )}

        {target > 0 && (
          <div className={styles.message} style={{ color: statusColor }}>
            {covered && '✅ Obiettivo raggiunto — sei a posto per la scadenza'}
            {!covered && monthlyNeeded > 0 && months > 0 &&
              `Mancano ${fmt(remaining)} — metti da parte ${fmt(monthlyNeeded)}/mese per ${months} ${months === 1 ? 'mese' : 'mesi'}`}
            {!covered && remaining > 0 && months === 0 && dueYM &&
              `⚠️ Scadenza raggiunta — mancano ancora ${fmt(remaining)}`}
            {!covered && remaining > 0 && !dueYM &&
              `Mancano ${fmt(remaining)} al target — imposta una scadenza`}
          </div>
        )}
      </div>
    </div>
  )
}
