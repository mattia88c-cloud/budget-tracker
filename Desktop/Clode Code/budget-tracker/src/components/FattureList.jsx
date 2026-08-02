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

export default function FattureList({ fatture, onDelete }) {
  const [listOpen, setListOpen] = useState(true)
  const years = [...new Set(fatture.map(f => f.date.slice(0, 4)))].sort((a, b) => b - a)
  const [year, setYear] = useState(years[0] ?? '2026')

  const yearFatture = [...fatture.filter(f => f.date.startsWith(year))]
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>Dettaglio fatture</span>
        <div className={styles.yearBtns}>
          {years.map(y => (
            <button
              key={y}
              className={`${styles.yearBtn} ${year === y ? styles.yearActive : ''}`}
              onClick={() => setYear(y)}
            >{y}</button>
          ))}
        </div>
      </div>

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
