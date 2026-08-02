import { useState } from 'react'

function load() {
  try { return JSON.parse(localStorage.getItem('budget_stipendi')) ?? [] } catch { return [] }
}

export function useStipendi() {
  const [stipendi, setStipendi] = useState(load)

  function save(s) {
    localStorage.setItem('budget_stipendi', JSON.stringify(s))
    setStipendi(s)
  }

  function saveStipendio(amount) {
    if (!amount || amount <= 0) return
    const label = new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
    const entry = { id: Date.now(), amount, label, date: new Date().toISOString() }
    save([entry, ...load()])
  }

  function deleteStipendio(id) {
    save(load().filter(s => s.id !== id))
  }

  return { stipendi, saveStipendio, deleteStipendio }
}
