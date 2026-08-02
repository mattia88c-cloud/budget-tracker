import { useMemo } from 'react'
import { GROUP_COLORS, ALL_GROUPS } from '../categories.js'
import { calcAmount } from '../calcAmount.js'
import styles from './CategorySummary.module.css'

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
}

export default function CategorySummary({ salary, expenses, taxes, taxesActive, salaryNetto = 0 }) {
  const active = expenses.filter(e => e.active)

  const byGroup = useMemo(() => {
    const map = {}
    for (const e of active) {
      map[e.group] = (map[e.group] || 0) + calcAmount(e, salaryNetto)
    }
    return map
  }, [active, salaryNetto])

  const groups = ALL_GROUPS.filter(g => byGroup[g] > 0)

  if (groups.length === 0 && !taxesActive) {
    return (
      <div className={styles.empty}>
        Aggiungi delle spese per vedere il riepilogo per categoria
      </div>
    )
  }

  const totalAll = Object.values(byGroup).reduce((s, v) => s + v, 0) + taxes
  const maxVal = Math.max(...groups.map(g => byGroup[g]), taxes, 1)

  return (
    <div className={styles.wrap}>
      {taxesActive && taxes > 0 && (
        <div className={styles.row}>
          <div className={styles.colorDot} style={{ background: '#f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.4)' }} />
          <div className={styles.groupName}>
            <span>🏛️</span> Tasse (25%)
          </div>
          <div className={styles.barWrap}>
            <div
              className={styles.bar}
              style={{ width: `${(taxes / maxVal) * 100}%`, background: '#f59e0b' }}
            />
          </div>
          <div className={styles.amount} style={{ color: '#f59e0b' }}>{fmt(taxes)}</div>
          <div className={styles.pct}>
            {salary > 0 ? `${Math.round((taxes / salary) * 100)}%` : '—'}
          </div>
        </div>
      )}

      {groups.map(g => {
        const val = byGroup[g]
        const color = GROUP_COLORS[g]
        const pct = salary > 0 ? Math.round((val / salary) * 100) : null
        return (
          <div key={g} className={styles.row}>
            <div
              className={styles.colorDot}
              style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
            />
            <div className={styles.groupName}>{g}</div>
            <div className={styles.barWrap}>
              <div
                className={styles.bar}
                style={{ width: `${(val / maxVal) * 100}%`, background: color }}
              />
            </div>
            <div className={styles.amount} style={{ color }}>{fmt(val)}</div>
            <div className={styles.pct}>
              {pct !== null ? `${pct}%` : '—'}
            </div>
          </div>
        )
      })}

      <div className={styles.footer}>
        <span>Totale impegni</span>
        <span className={styles.footerTotal}>{fmt(totalAll)}</span>
        {salary > 0 && (
          <span className={styles.footerPct}>
            {Math.round((totalAll / salary) * 100)}% dello stipendio
          </span>
        )}
      </div>
    </div>
  )
}
