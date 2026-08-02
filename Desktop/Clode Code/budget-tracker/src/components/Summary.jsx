import { useState, useEffect } from 'react'
import { calcAmount } from '../calcAmount.js'
import styles from './Summary.module.css'

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
}

function Card({ label, value, color, sub, icon }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.cardIcon}>{icon}</span>
        <span className={styles.cardLabel}>{label}</span>
      </div>
      <div className={styles.cardValue} style={{ color }}>{value}</div>
      {sub && <div className={styles.cardSub}>{sub}</div>}
    </div>
  )
}

export default function Summary({ salary, expenses, taxes, taxesActive, onToggleTaxes, salaryNetto = 0, inv = {}, onUpdateInv }) {
  const [goal, setGoal] = useState(() => {
    try { return parseFloat(localStorage.getItem('budget_goal') || '0') || 0 } catch { return 0 }
  })
  const [goalType, setGoalType] = useState(() => {
    try { return localStorage.getItem('budget_goal_type') || 'fixed' } catch { return 'fixed' }
  })
  const [goalPct, setGoalPct] = useState(() => {
    try { return parseFloat(localStorage.getItem('budget_goal_pct') || '10') || 10 } catch { return 10 }
  })
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('')

  // Investimento inline editing
  const [editingInv, setEditingInv] = useState(false)
  const [invInput, setInvInput] = useState('')

  useEffect(() => { localStorage.setItem('budget_goal', String(goal)) }, [goal])
  useEffect(() => { localStorage.setItem('budget_goal_type', goalType) }, [goalType])
  useEffect(() => { localStorage.setItem('budget_goal_pct', String(goalPct)) }, [goalPct])

  const active = expenses.filter(e => e.active)

  const totalExpenses = active
    .filter(e => e.group !== 'Investimenti')
    .reduce((s, e) => s + calcAmount(e, salaryNetto), 0)

  const residuo = salary - totalExpenses - taxes

  // Investment display
  const invMonthly = inv.type === 'percentage'
    ? salaryNetto * (inv.percentage || 0) / 100
    : (inv.amount || 0)

  function startEditInv() {
    setInvInput(String(inv.type === 'percentage' ? inv.percentage : inv.amount))
    setEditingInv(true)
  }

  function saveInv() {
    const n = parseFloat(invInput)
    if (!isNaN(n) && n > 0) {
      if (inv.type === 'percentage') onUpdateInv?.({ percentage: n })
      else onUpdateInv?.({ amount: n })
    }
    setEditingInv(false)
  }

  // Goal computed value
  const goalValue = goalType === 'percentage'
    ? salaryNetto * goalPct / 100
    : goal

  const positive = residuo >= 0
  const pct = salary > 0 ? Math.round((Math.abs(residuo) / salary) * 100) : 0
  const goalPctDisplay = goalValue > 0 ? Math.min(100, Math.round((residuo / goalValue) * 100)) : null
  const goalOk = residuo >= goalValue

  function saveGoal() {
    if (goalType === 'percentage') {
      const v = parseFloat(goalInput)
      if (!isNaN(v) && v >= 0) setGoalPct(v)
    } else {
      const v = parseFloat(goalInput)
      if (!isNaN(v) && v >= 0) setGoal(v)
    }
    setEditingGoal(false)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        <Card icon="💼" label="Stipendio" value={fmt(salary)} color="var(--primary)"
          sub={salary > 0 ? 'base mensile' : 'inserisci stipendio'} />
        <Card icon="📤" label="Spese attive" value={fmt(totalExpenses)} color="var(--red)"
          sub={`${active.filter(e => e.group !== 'Investimenti').length} voci`} />

        {/* ── Investimenti card with inline config ── */}
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.cardIcon}>📈</span>
            <span className={styles.cardLabel}>Investimenti</span>
          </div>
          {editingInv ? (
            <div className={styles.goalEdit}>
              {inv.type === 'fixed' && <span className={styles.goalCurrency}>€</span>}
              <input
                className={styles.goalInput}
                type="number"
                min="0.1"
                step={inv.type === 'percentage' ? '0.5' : '50'}
                value={invInput}
                onChange={e => setInvInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveInv(); if (e.key === 'Escape') setEditingInv(false) }}
                autoFocus
              />
              {inv.type === 'percentage' && <span className={styles.goalCurrency}>%</span>}
              <button className={styles.goalSave} onClick={saveInv}>✓</button>
            </div>
          ) : (
            <div className={styles.invValueRow} onClick={startEditInv}>
              <span className={styles.cardValue} style={{ color: '#4ade80' }}>
                {inv.type === 'percentage' ? `${inv.percentage}%` : fmt(invMonthly)}
              </span>
              <span className={styles.editHint}>✏️</span>
            </div>
          )}
          {inv.type === 'percentage' && salaryNetto > 0 ? (
            <div className={styles.equivLine}>≈ <strong>{fmt(invMonthly)}</strong> / mese</div>
          ) : (
            <div className={styles.cardSub}>mensile</div>
          )}
          <div className={styles.cardToggleRow}>
            <button
              className={`${styles.modeBtn} ${inv.type === 'fixed' ? styles.modeBtnActive : ''}`}
              onClick={() => onUpdateInv?.({ type: 'fixed' })}
            >€ fisso</button>
            <button
              className={`${styles.modeBtn} ${inv.type === 'percentage' ? styles.modeBtnActive : ''}`}
              onClick={() => onUpdateInv?.({ type: 'percentage' })}
            >% netto</button>
          </div>
        </div>

        <div className={`${styles.card} ${!taxesActive ? styles.cardInactive : ''}`}>
          <div className={styles.cardTop}>
            <span className={styles.cardIcon}>🏛️</span>
            <span className={styles.cardLabel}>Tasse (25%)</span>
            <button
              className={`${styles.toggle} ${taxesActive ? styles.toggleOn : ''}`}
              onClick={onToggleTaxes}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
          <div className={styles.cardValue} style={{ color: taxesActive ? '#fbbf24' : 'var(--text-muted)' }}>
            {fmt(taxes)}
          </div>
          <div className={styles.cardSub}>{taxesActive ? '25% dello stipendio' : 'disattivate'}</div>
        </div>

        <div className={`${styles.card} ${styles.residuoCard}`}>
          <div className={styles.cardTop}>
            <span className={styles.cardIcon}>{positive ? '✅' : '⚠️'}</span>
            <span className={styles.cardLabel}>Residuo libero</span>
          </div>
          <div className={styles.cardValue} style={{ color: positive ? 'var(--green)' : 'var(--red)' }}>
            {positive ? '+' : ''}{fmt(residuo)}
          </div>
          <div className={styles.cardSub}>
            {salary > 0 ? `${pct}% dello stipendio` : 'inserisci stipendio'}
          </div>
          {salary > 0 && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill}
                style={{ width: `${Math.min(100, pct)}%`, background: positive ? 'var(--green)' : 'var(--red)' }} />
            </div>
          )}
        </div>

        {/* ── Obiettivo risparmio with €/% toggle ── */}
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.cardIcon}>🎯</span>
            <span className={styles.cardLabel}>Obiettivo risparmio</span>
          </div>
          {editingGoal ? (
            <div className={styles.goalEdit}>
              {goalType === 'fixed' && <span className={styles.goalCurrency}>€</span>}
              <input
                className={styles.goalInput}
                type="number"
                min="0"
                step={goalType === 'percentage' ? '1' : '50'}
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveGoal(); if (e.key === 'Escape') setEditingGoal(false) }}
                autoFocus
              />
              {goalType === 'percentage' && <span className={styles.goalCurrency}>%</span>}
              <button className={styles.goalSave} onClick={saveGoal}>✓</button>
            </div>
          ) : (
            <div
              className={styles.invValueRow}
              onClick={() => { setGoalInput(String(goalType === 'percentage' ? goalPct : goal)); setEditingGoal(true) }}
            >
              <span className={styles.cardValue} style={{ color: goalValue > 0 ? (goalOk ? 'var(--green)' : 'var(--red)') : 'var(--text-muted)' }}>
                {goalType === 'percentage' ? (goalPct > 0 ? `${goalPct}%` : '—') : (goal > 0 ? fmt(goal) : '—')}
              </span>
              <span className={styles.editHint}>✏️</span>
            </div>
          )}
          {goalType === 'percentage' && salaryNetto > 0 && goalPct > 0 ? (
            <div className={styles.equivLine}>≈ <strong>{fmt(goalValue)}</strong> / mese</div>
          ) : goalValue > 0 ? (
            <div className={styles.cardSub}>
              {goalOk ? `+${fmt(residuo - goalValue)} sopra` : `${fmt(goalValue - residuo)} mancanti`}
            </div>
          ) : (
            <div className={styles.cardSub}>clicca per impostare</div>
          )}
          {goalValue > 0 && (
            <>
              {goalType === 'percentage' && salaryNetto > 0 && goalPct > 0 && (
                <div className={styles.cardSub}>
                  {goalOk ? `+${fmt(residuo - goalValue)} sopra` : `${fmt(goalValue - residuo)} mancanti`}
                </div>
              )}
              <div className={styles.progressBar}>
                <div className={styles.progressFill}
                  style={{ width: `${Math.max(0, goalPctDisplay)}%`, background: goalOk ? 'var(--green)' : 'var(--red)' }} />
              </div>
              <div className={styles.goalPct}>{Math.max(0, goalPctDisplay)}% raggiunto</div>
            </>
          )}
          <div className={styles.cardToggleRow}>
            <button
              className={`${styles.modeBtn} ${goalType === 'fixed' ? styles.modeBtnActive : ''}`}
              onClick={() => { setGoalType('fixed'); setEditingGoal(false) }}
            >€ fisso</button>
            <button
              className={`${styles.modeBtn} ${goalType === 'percentage' ? styles.modeBtnActive : ''}`}
              onClick={() => { setGoalType('percentage'); setEditingGoal(false) }}
            >% netto</button>
          </div>
        </div>
      </div>
    </div>
  )
}
