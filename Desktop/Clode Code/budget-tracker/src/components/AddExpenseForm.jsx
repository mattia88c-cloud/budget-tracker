import { useState } from 'react'
import { CATEGORIES, ALL_GROUPS } from '../categories.js'
import styles from './AddExpenseForm.module.css'

const EMPTY = { name: '', amount: '', percentage: '', group: 'Casa', sub: 'Affitto', type: 'fixed' }

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function AddExpenseForm({ onAdd, salaryNetto = 0 }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [err, setErr] = useState({})

  function set(field, val) {
    setForm(f => {
      const next = { ...f, [field]: val }
      if (field === 'group') next.sub = CATEGORIES[val][0]
      return next
    })
    setErr(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Nome richiesto'
    if (form.type === 'percentage') {
      const p = parseFloat(form.percentage)
      if (isNaN(p) || p <= 0 || p > 100) e.percentage = 'Percentuale tra 0.1 e 100'
    } else {
      if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) e.amount = 'Importo non valido'
    }
    return e
  }

  function submit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErr(e); return }
    const base = { name: form.name.trim(), group: form.group, sub: form.sub, type: form.type }
    if (form.type === 'percentage') {
      onAdd({ ...base, amount: 0, percentage: parseFloat(form.percentage) })
    } else {
      onAdd({ ...base, amount: parseFloat(form.amount) })
    }
    setForm(EMPTY)
    setOpen(false)
  }

  const previewAmt = form.type === 'percentage' && salaryNetto > 0 && parseFloat(form.percentage) > 0
    ? salaryNetto * parseFloat(form.percentage) / 100
    : null

  if (!open) return (
    <button className={styles.trigger} onClick={() => setOpen(true)}>
      <span>+</span> Aggiungi spesa
    </button>
  )

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formTitle}>Nuova spesa</div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Nome</label>
          <input
            type="text"
            placeholder="es. Netflix, Affitto…"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className={err.name ? styles.error : ''}
          />
          {err.name && <span className={styles.errMsg}>{err.name}</span>}
        </div>

        {form.type === 'percentage' ? (
          <div className={styles.field}>
            <label>Percentuale del netto (%)</label>
            <div className={styles.pctWrap}>
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                placeholder="es. 20"
                value={form.percentage}
                onChange={e => set('percentage', e.target.value)}
                className={err.percentage ? styles.error : ''}
              />
              <span className={styles.pctSuffix}>%</span>
            </div>
            {previewAmt !== null && (
              <span className={styles.pctPreview}>≈ {fmt(previewAmt)} / mese</span>
            )}
            {err.percentage && <span className={styles.errMsg}>{err.percentage}</span>}
          </div>
        ) : (
          <div className={styles.field}>
            <label>Importo (€)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              className={err.amount ? styles.error : ''}
            />
            {err.amount && <span className={styles.errMsg}>{err.amount}</span>}
          </div>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Gruppo</label>
          <select value={form.group} onChange={e => set('group', e.target.value)}>
            {ALL_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label>Sottocategoria</label>
          <select value={form.sub} onChange={e => set('sub', e.target.value)}>
            {CATEGORIES[form.group].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label>Tipo</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="fixed">Fissa</option>
            <option value="variable">Variabile (×n)</option>
            <option value="percentage">% del netto</option>
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={() => { setOpen(false); setForm(EMPTY); setErr({}) }}>
          Annulla
        </button>
        <button type="submit" className={styles.save}>Aggiungi</button>
      </div>
    </form>
  )
}
