import { useState } from 'react'
import styles from './AnnualProjection.module.css'

function loadInvestitiBalance() {
  try {
    const conti = JSON.parse(localStorage.getItem('budget_conti')) ?? []
    return conti
      .filter(c => ['investiti', 'investimenti'].some(k => c.name?.toLowerCase().includes(k)))
      .reduce((s, c) => s + (c.balance || 0), 0)
  } catch { return 0 }
}

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function compoundFV(pv, annualRatePct, years) {
  if (annualRatePct === 0) return pv
  return pv * (1 + annualRatePct / 100) ** years
}

export default function AnnualProjection({ salary, stipendi = [], inv = {}, salaryNetto = 0 }) {
  const [editingRate, setEditingRate] = useState(false)
  const [rateInput, setRateInput] = useState('')

  const rate = inv.rate ?? 7
  const currentYear = new Date().getFullYear().toString()

  const currentYearStipendi = stipendi.filter(s => (s.date ?? '').startsWith(currentYear))
  const hasStipendi = currentYearStipendi.length > 0
  const totalLordo = hasStipendi
    ? currentYearStipendi.reduce((s, st) => s + st.amount, 0)
    : salary * 12

  const totalNetto = totalLordo * 0.75
  const totalTasse = totalLordo * 0.25
  const months = hasStipendi ? currentYearStipendi.length : 12
  const avgMonthlyLordo = totalLordo / months
  const avgMonthlyNetto = totalNetto / months

  const monthlyInvestment = inv.type === 'percentage'
    ? salaryNetto * (inv.percentage || 0) / 100
    : (inv.amount || 1000)

  const investitiBalance = loadInvestitiBalance()

  const fv5 = compoundFV(investitiBalance, rate, 5)
  const fv10 = compoundFV(investitiBalance, rate, 10)

  const maxVal = Math.max(totalLordo, totalTasse, investitiBalance, 1)

  const rows = [
    {
      icon: '💼',
      label: 'Stipendio lordo',
      value: totalLordo,
      color: 'var(--primary)',
      sub: `Netto: ${fmt(totalNetto)} · Media mensile: ${fmt(avgMonthlyLordo)}/mese`,
    },
    {
      icon: '🏛️',
      label: 'Tasse (25%)',
      value: totalTasse,
      color: '#f59e0b',
      sub: hasStipendi ? `Su ${months} fatture ${currentYear}` : 'Stima su 12 mesi',
    },
    {
      icon: '📈',
      label: 'Investito (conto)',
      value: investitiBalance,
      color: '#4ade80',
      sub: `Saldo attuale conto investimenti · ${fmt(monthlyInvestment)}/mese configurati`,
    },
  ]

  if (salary === 0 && !hasStipendi) return (
    <div className={styles.empty}>Inserisci lo stipendio o salva almeno uno stipendio per vedere la proiezione</div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {rows.map((row, i) => (
          <div key={i} className={styles.row}>
            <span className={styles.icon}>{row.icon}</span>
            <div className={styles.labelCol}>
              <span className={styles.label}>{row.label}</span>
              {row.sub && <span className={styles.sub}>{row.sub}</span>}
            </div>
            <div className={styles.barWrap}>
              <div className={styles.bar} style={{ width: `${(row.value / maxVal) * 100}%`, background: row.color }} />
            </div>
            <span className={styles.value} style={{ color: row.color }}>{fmt(row.value)}</span>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerItem}>
          <span className={styles.footerLabel}>Capitale in 5 anni</span>
          <span className={styles.footerValue} style={{ color: 'var(--primary)' }}>{fmt(fv5)}</span>
        </div>
        <div className={styles.footerItem}>
          <span className={styles.footerLabel}>Capitale in 10 anni</span>
          <span className={styles.footerValue} style={{ color: 'var(--primary)' }}>{fmt(fv10)}</span>
        </div>
        <div className={`${styles.footerItem} ${styles.rateItem}`}>
          <span className={styles.footerLabel}>Rendimento annuo</span>
          {editingRate ? (
            <div className={styles.rateEdit}>
              <input
                className={styles.rateInput}
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={rateInput}
                onChange={e => setRateInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const n = parseFloat(rateInput)
                    if (!isNaN(n) && n >= 0) inv.onUpdateRate?.(n)
                    setEditingRate(false)
                  }
                  if (e.key === 'Escape') setEditingRate(false)
                }}
                autoFocus
              />
              <span className={styles.ratePct}>%</span>
              <button
                className={styles.rateConfirm}
                onClick={() => {
                  const n = parseFloat(rateInput)
                  if (!isNaN(n) && n >= 0) inv.onUpdateRate?.(n)
                  setEditingRate(false)
                }}
              >✓</button>
            </div>
          ) : (
            <span
              className={styles.footerValue}
              style={{ color: '#f59e0b', cursor: 'pointer' }}
              onClick={() => { setRateInput(String(rate)); setEditingRate(true) }}
              title="Clicca per modificare"
            >
              {rate}% ✏️
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
