import { useRef, useState } from 'react'
import styles from './ExportImport.module.css'

const BACKUP_KEYS = [
  'budget_expenses',
  'budget_conti',
  'budget_conti_storico',
  'budget_fatture',
  'budget_investimento',
  'budget_goal',
  'budget_goal_type',
  'budget_goal_pct',
]

export default function ExportImport({ expenses, onImport }) {
  const inputRef = useRef()
  const [msg, setMsg] = useState(null)

  function flash(text, ok) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3000)
  }

  function handleExport() {
    const backup = {}
    BACKUP_KEYS.forEach(k => {
      const raw = localStorage.getItem(k)
      if (raw !== null) {
        try { backup[k] = JSON.parse(raw) }
        catch { backup[k] = raw }
      }
    })
    // also include section open/close state
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('section_open_')) backup[k] = localStorage.getItem(k)
    })

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    flash('Backup completo esportato', true)
  }

  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)

        // Full backup format (object with keys)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          Object.entries(parsed).forEach(([k, v]) => {
            localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))
          })
          flash('Dati ripristinati — ricarico...', true)
          setTimeout(() => window.location.reload(), 1200)
          return
        }

        // Legacy format (array of expenses)
        if (Array.isArray(parsed)) {
          onImport(parsed)
          flash(`${parsed.length} spese importate`, true)
          return
        }

        throw new Error()
      } catch {
        flash('File non valido', false)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className={styles.wrap}>
      {msg && (
        <span className={`${styles.msg} ${msg.ok ? styles.msgOk : styles.msgErr}`}>
          {msg.text}
        </span>
      )}
      <button className={styles.btn} onClick={handleExport} title="Esporta backup completo">
        ⬇ Esporta
      </button>
      <button className={styles.btn} onClick={() => inputRef.current.click()} title="Importa backup">
        ⬆ Importa
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
    </div>
  )
}
