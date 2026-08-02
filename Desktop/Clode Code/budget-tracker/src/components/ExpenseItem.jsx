import { useState, useRef, useEffect } from 'react'
import { GROUP_COLORS } from '../categories.js'
import { calcAmount } from '../calcAmount.js'
import styles from './ExpenseItem.module.css'

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
}

export default function ExpenseItem({ expense, onToggle, onEdit, onRemove, onDuplicate, salaryNetto = 0 }) {
  const { id, name, amount, group, sub, type, active, multiplier, percentage } = expense
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editAmount, setEditAmount] = useState(String(type === 'percentage' ? percentage || '' : amount))
  const wrapRef = useRef()
  const color = GROUP_COLORS[group] || '#64748b'
  const effective = calcAmount(expense, salaryNetto)

  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])

  function saveEdit() {
    const val = parseFloat(editAmount)
    if (!editName.trim() || isNaN(val) || val <= 0) return
    if (type === 'percentage') {
      onEdit(id, { name: editName.trim(), percentage: val })
    } else {
      onEdit(id, { name: editName.trim(), amount: val })
    }
    setEditing(false)
  }

  function startEdit() {
    setEditName(name)
    setEditAmount(String(type === 'percentage' ? percentage || '' : amount))
    setEditing(true)
    setMenuOpen(false)
  }

  return (
    <div className={`${styles.item} ${!active ? styles.inactive : ''}`}>
      <div className={styles.colorBar} style={{ background: color }} />

      <button
        className={`${styles.toggle} ${active ? styles.toggleOn : ''}`}
        onClick={() => onToggle(id)}
        title={active ? 'Disattiva' : 'Attiva'}
      >
        <span className={styles.toggleThumb} />
      </button>

      <div className={styles.info}>
        {editing ? (
          <div className={styles.editRow}>
            <input
              className={styles.editInput}
              value={editName}
              onChange={e => setEditName(e.target.value)}
              autoFocus
            />
            <input
              className={styles.editInput}
              type="number"
              min="0.01"
              step={type === 'percentage' ? '0.1' : '0.01'}
              value={editAmount}
              onChange={e => setEditAmount(e.target.value)}
            />
            <button className={styles.editSave} onClick={saveEdit}>✓</button>
            <button className={styles.editCancel} onClick={() => setEditing(false)}>✕</button>
          </div>
        ) : (
          <>
            <div className={styles.name}>{name}</div>
            <div className={styles.meta}>
              <span className={styles.badge} style={{ background: color + '30', color }}>{group}</span>
              <span className={styles.sub}>{sub}</span>
              {type === 'variable' && <span className={styles.typeBadge}>variabile</span>}
              {type === 'percentage' && <span className={styles.pctBadge}>{percentage}% del netto</span>}
            </div>
          </>
        )}
      </div>

      <div className={styles.right}>
        {type === 'variable' && !editing && (
          <div className={styles.multiplier}>
            <button onClick={() => onEdit(id, { multiplier: Math.max(1, (multiplier || 1) - 1) })}>−</button>
            <span>×{multiplier || 1}</span>
            <button onClick={() => onEdit(id, { multiplier: (multiplier || 1) + 1 })}>+</button>
          </div>
        )}
        <div className={styles.amounts}>
          <span className={`${styles.total} ${!active ? styles.dimmed : ''}`}>{fmt(effective)}</span>
          {type === 'variable' && multiplier > 1 && (
            <span className={styles.base}>{fmt(amount)} × {multiplier}</span>
          )}
        </div>
      </div>

      <div className={styles.menuWrap} ref={wrapRef}>
        <button className={styles.menuBtn} onClick={() => setMenuOpen(o => !o)}>⋯</button>
        {menuOpen && (
          <div className={styles.menu}>
            <button onClick={startEdit}>✏️ Modifica</button>
            <button onClick={() => { onDuplicate(id); setMenuOpen(false) }}>📋 Duplica</button>
            <button className={styles.menuDelete} onClick={() => { onRemove(id); setMenuOpen(false) }}>🗑️ Elimina</button>
          </div>
        )}
      </div>
    </div>
  )
}
