import { useState, useEffect } from 'react'
import styles from './Conti.module.css'

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
}

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

export default function Conti() {
  const [conti, setConti] = useState(() => load('budget_conti', []))
  const [storico, setStorico] = useState(() => load('budget_conti_storico', []))
  const [newName, setNewName] = useState('')
  const [editingBalance, setEditingBalance] = useState({})
  const [flash, setFlash] = useState('')
  const [openSnap, setOpenSnap] = useState(null)
  const [snapMonth, setSnapMonth] = useState(() => new Date().toISOString().slice(0, 7))

  useEffect(() => { localStorage.setItem('budget_conti', JSON.stringify(conti)) }, [conti])
  useEffect(() => { localStorage.setItem('budget_conti_storico', JSON.stringify(storico)) }, [storico])

  function addConto() {
    const name = newName.trim()
    if (!name) return
    setConti(prev => [...prev, { id: Date.now(), name, balance: 0 }])
    setNewName('')
  }

  function removeConto(id) {
    setConti(prev => prev.filter(c => c.id !== id))
  }

  function startEdit(id, balance) {
    setEditingBalance(prev => ({ ...prev, [id]: String(balance) }))
  }

  function saveBalance(id) {
    const val = parseFloat(editingBalance[id])
    if (!isNaN(val)) {
      setConti(prev => prev.map(c => c.id === id ? { ...c, balance: val } : c))
    }
    setEditingBalance(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  function saveSnapshot() {
    if (conti.length === 0) return
    const [y, m] = snapMonth.split('-').map(Number)
    const date = new Date(y, m - 1, 1)
    const label = date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
    const ym = snapMonth
    const snap = {
      id: Date.now(),
      label,
      date: date.toISOString(),
      conti: conti.map(c => ({ name: c.name, balance: c.balance })),
    }
    setStorico(prev => {
      const filtered = prev.filter(s => !s.date || s.date.slice(0, 7) !== ym)
      return [snap, ...filtered].sort((a, b) => new Date(b.date) - new Date(a.date))
    })
    showFlash('Snapshot salvato!')
  }

  function deleteSnapshot(id) {
    setStorico(prev => prev.filter(s => s.id !== id))
  }

  function showFlash(msg) {
    setFlash(msg)
    setTimeout(() => setFlash(''), 2500)
  }

  const total = conti.reduce((s, c) => s + c.balance, 0)

  return (
    <div className={styles.wrap}>

      {/* Conti attivi */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerTitle}>Conti</span>
          {conti.length > 0 && (
            <span className={styles.totalBadge}>{fmt(total)}</span>
          )}
        </div>
        <div className={styles.snapshotRow}>
          <input
            className={styles.snapMonthInput}
            type="month"
            value={snapMonth}
            onChange={e => setSnapMonth(e.target.value)}
          />
          <button className={styles.snapshotBtn} onClick={saveSnapshot} disabled={conti.length === 0}>
            📸 Salva
          </button>
        </div>
      </div>

      {flash && <div className={styles.flash}>{flash}</div>}

      <div className={styles.contiGrid}>
        {conti.map(c => {
          const editing = c.id in editingBalance
          return (
            <div key={c.id} className={styles.contoCard}>
              <div className={styles.contoName}>{c.name}</div>
              {editing ? (
                <div className={styles.balanceEdit}>
                  <span className={styles.balanceCurrency}>€</span>
                  <input
                    className={styles.balanceInput}
                    type="number"
                    value={editingBalance[c.id]}
                    onChange={e => setEditingBalance(prev => ({ ...prev, [c.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') saveBalance(c.id); if (e.key === 'Escape') setEditingBalance(prev => { const n = { ...prev }; delete n[c.id]; return n }) }}
                    autoFocus
                  />
                  <button className={styles.saveBtn} onClick={() => saveBalance(c.id)}>✓</button>
                </div>
              ) : (
                <div className={styles.balanceRow}>
                  <span className={styles.balanceValue}>{fmt(c.balance)}</span>
                  <div className={styles.contoActions}>
                    <button className={styles.editBtn} onClick={() => startEdit(c.id, c.balance)} title="Modifica">✏️</button>
                    <button className={styles.deleteBtn} onClick={() => removeConto(c.id)} title="Elimina">✕</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Aggiungi conto */}
        <div className={styles.addCard}>
          <input
            className={styles.addInput}
            type="text"
            placeholder="Nome conto (es. Revolut)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addConto() }}
          />
          <button className={styles.addBtn} onClick={addConto}>+ Aggiungi</button>
        </div>
      </div>

      {/* Storico snapshot */}
      {storico.length > 0 && (
        <div className={styles.storico}>
          <div className={styles.storicoTitle}>Storico mensile conti</div>
          <div className={styles.storicoGrid}>
            {storico.map(snap => {
              const total = snap.conti.reduce((s, c) => s + c.balance, 0)
              const isOpen = openSnap === snap.id
              return (
                <div key={snap.id} className={`${styles.snapCard} ${isOpen ? styles.snapCardOpen : ''}`}>
                  <button className={styles.snapHeader} onClick={() => setOpenSnap(isOpen ? null : snap.id)}>
                    <span className={styles.snapArrow}>{isOpen ? '▾' : '▸'}</span>
                    <span className={styles.snapLabel}>{snap.label}</span>
                    <span className={styles.snapTotal}>{fmt(total)}</span>
                    <button className={styles.snapDelete} onClick={e => { e.stopPropagation(); deleteSnapshot(snap.id) }} title="Elimina">✕</button>
                  </button>
                  {isOpen && (
                    <div className={styles.snapRows}>
                      {snap.conti.map((c, i) => (
                        <div key={i} className={styles.snapRow}>
                          <span className={styles.snapName}>{c.name}</span>
                          <span className={styles.snapBalance}>{fmt(c.balance)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
