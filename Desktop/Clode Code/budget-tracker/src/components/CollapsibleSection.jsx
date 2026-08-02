import { useState } from 'react'
import styles from './CollapsibleSection.module.css'

export default function CollapsibleSection({ title, children, defaultOpen = true, storageKey }) {
  const [open, setOpen] = useState(() => {
    if (!storageKey) return defaultOpen
    try {
      const saved = localStorage.getItem('section_open_' + storageKey)
      return saved === null ? defaultOpen : saved === 'true'
    } catch { return defaultOpen }
  })

  function toggle() {
    const next = !open
    setOpen(next)
    if (storageKey) {
      try { localStorage.setItem('section_open_' + storageKey, String(next)) } catch {}
    }
  }

  return (
    <div className={styles.section}>
      <button className={styles.header} onClick={toggle}>
        <span className={styles.title}>{title}</span>
        <span className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`}>›</span>
        <span className={styles.line} />
      </button>
      {open && <div className={styles.body}>{children}</div>}
    </div>
  )
}
