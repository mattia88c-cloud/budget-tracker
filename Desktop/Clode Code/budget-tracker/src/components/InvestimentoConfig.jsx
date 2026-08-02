import { useState } from 'react'
import styles from './InvestimentoConfig.module.css'

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function InvestimentoConfig({ inv, onUpdate, salaryNetto = 0 }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState('')

  const monthly = inv.type === 'percentage'
    ? salaryNetto * (inv.percentage || 0) / 100
    : (inv.amount || 0)

  function startEdit() {
    setVal(String(inv.type === 'percentage' ? inv.percentage : inv.amount))
    setEditing(true)
  }

  function saveEdit() {
    const n = parseFloat(val)
    if (isNaN(n) || n <= 0) { setEditing(false); return }
    if (inv.type === 'percentage') onUpdate({ percentage: n })
    else onUpdate({ amount: n })
    setEditing(false)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <span className={styles.icon}>📈</span>
        <span className={styles.title}>Investimento mensile</span>
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleBtn} ${inv.type === 'fixed' ? styles.toggleActive : ''}`}
            onClick={() => onUpdate({ type: 'fixed' })}
          >€</button>
          <button
            className={`${styles.toggleBtn} ${inv.type === 'percentage' ? styles.toggleActive : ''}`}
            onClick={() => onUpdate({ type: 'percentage' })}
          >%</button>
        </div>
      </div>

      <div className={styles.body}>
        {editing ? (
          <div className={styles.editRow}>
            <input
              className={styles.input}
              type="number"
              min="0.1"
              step={inv.type === 'percentage' ? '0.5' : '50'}
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
              autoFocus
            />
            <span className={styles.unit}>{inv.type === 'percentage' ? '%' : '€'}</span>
            <button className={styles.saveBtn} onClick={saveEdit}>✓</button>
          </div>
        ) : (
          <div className={styles.valueRow} onClick={startEdit}>
            <span className={styles.value}>
              {inv.type === 'percentage' ? `${inv.percentage}%` : fmt(inv.amount)}
            </span>
            {inv.type === 'percentage' && salaryNetto > 0 && (
              <span className={styles.computed}>≈ {fmt(monthly)} / mese</span>
            )}
            <span className={styles.editHint}>✏️</span>
          </div>
        )}
      </div>
    </div>
  )
}
