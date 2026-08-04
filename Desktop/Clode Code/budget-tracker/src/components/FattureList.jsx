import { useState, useRef, useEffect } from 'react'
import styles from './FattureList.module.css'

function fmtFull(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
}

function RowMenu({ onDelete }) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setConfirm(false)
      }
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])

  return (
    <div className={styles.menuWrap} ref={ref}>
      <button className={styles.menuBtn} onClick={() => { setOpen(o => !o); setConfirm(false) }}>⋯</button>
      {open && (
        <div className={styles.menu}>
          {confirm ? (
            <>
              <span className={styles.menuConfirmText}>Eliminare?</span>
              <button className={styles.menuConfirmYes} onClick={onDelete}>Sì, elimina</button>
              <button className={styles.menuConfirmNo} onClick={() => setConfirm(false)}>Annulla</button>
            </>
          ) : (
            <button className={styles.menuDelete} onClick={() => setConfirm(true)}>🗑️ Elimina</button>
          )}
        </div>
      )}
    </div>
  )
}

export default function FattureList({ fatture, onDelete, onAdd }) {
  const [listOpen, setListOpen] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [dateInput, setDateInput] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const years = [...new Set(fatture.map(f => f.date.slice(0, 4)))].sort((a, b) => b - a)
  const [year, setYear] = useState(years[0] ?? '2026')

  function handleAdd() {
    if (!dateInput || !amountInput) return
    const amount = parseFloat(amountInput)
    if (isNaN(amount) || amount <= 0) return
    onAdd(dateInput, amount)
    setDateInput('')
    setAmountInput('')
    setShowAdd(false)
  }

  const yearFatture = [...fatture.filter(f => f.date.startsWith(year))]
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>Dettaglio fatture</span>
        <div className={styles.headerRight}>
          <div className={styles.yearBtns}>
            {years.map(y => (
              <button
                key={y}
                className={`${styles.yearBtn} ${year === y ? styles.yearActive : ''}`}
                onClick={() => setYear(y)}
              >{y}</button>
            ))}
          </div>
          <button className={styles.addToggle} onClick={() => setShowAdd(v => !v)}>
            {showAdd ? '✕' : '＋'}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className={styles.addForm}>
          <input
            className={styles.addInput}
            type="date"
            value={dateInput}
            onChange={e => setDateInput(e.target.value)}
          />
          <span className={styles.addCurrency}>€</span>
          <input
            className={styles.addInput}
            type="number" min="0" step="0.01"
            value={amountInput}
            onChange={e => setAmountInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Importo"
            style={{ width: 110 }}
          />
          <button className={styles.addBtn} onClick={handleAdd}>✓ Salva</button>
        </div>
      )}

      <div className={styles.listHeader} onClick={() => setListOpen(o => !o)}>
        <span className={styles.listLabel}>{yearFatture.length} fatture</span>
        <span className={`${styles.arrow} ${listOpen ? styles.arrowOpen : ''}`}>›</span>
      </div>

      {listOpen && (
        <div className={styles.list}>
          {yearFatture.map(f => (
            <div key={f.id} className={styles.row}>
              <span className={styles.rowDate}>
                {new Date(f.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              <span className={styles.rowAmount}>{fmtFull(f.amount)}</span>
              <RowMenu onDelete={() => onDelete(f.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
