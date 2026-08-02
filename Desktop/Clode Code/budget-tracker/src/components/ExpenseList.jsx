import { useState } from 'react'
import ExpenseItem from './ExpenseItem.jsx'
import AddExpenseForm from './AddExpenseForm.jsx'
import { GROUP_COLORS } from '../categories.js'
import styles from './ExpenseList.module.css'

export default function ExpenseList({ expenses, onAdd, onToggle, onEdit, onRemove, onDuplicate, salaryNetto = 0 }) {
  const [filter, setFilter] = useState('Tutte')
  const [search, setSearch] = useState('')

  const groups = ['Tutte', ...Object.keys(GROUP_COLORS)]

  const visible = expenses
    .filter(e => filter === 'Tutte' || e.group === filter)
    .filter(e => e.name.toLowerCase().includes(search.toLowerCase()))

  const activeCount = expenses.filter(e => e.active).length

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>
          Spese
          <span className={styles.count}>{expenses.length}</span>
          <span className={styles.activeCount}>{activeCount} attive</span>
        </div>
        <AddExpenseForm onAdd={onAdd} salaryNetto={salaryNetto} />
      </div>

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Cerca spesa..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      <div className={styles.filterBar}>
        {groups.map(g => (
          <button
            key={g}
            className={`${styles.filterBtn} ${filter === g ? styles.filterActive : ''}`}
            style={filter === g && g !== 'Tutte' ? { borderColor: GROUP_COLORS[g], color: GROUP_COLORS[g] } : {}}
            onClick={() => setFilter(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className={styles.empty}>
          {expenses.length === 0
            ? 'Nessuna spesa. Clicca "Aggiungi spesa" per iniziare.'
            : search
            ? `Nessun risultato per "${search}"`
            : 'Nessuna spesa in questa categoria.'}
        </div>
      ) : (
        <div className={styles.list}>
          {visible.map(e => (
            <ExpenseItem
              key={e.id}
              expense={e}
              onToggle={onToggle}
              onEdit={onEdit}
              onRemove={onRemove}
              onDuplicate={onDuplicate}
              salaryNetto={salaryNetto}
            />
          ))}
        </div>
      )}
    </div>
  )
}
