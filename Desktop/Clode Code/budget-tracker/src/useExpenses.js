import { useState, useCallback } from 'react'

const LS_KEY = 'budget_tracker_expenses'

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function save(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}

let _nextId = Date.now()
function uid() { return ++_nextId }

export function useExpenses() {
  const [expenses, setExpenses] = useState(load)

  const update = useCallback((fn) => {
    setExpenses(prev => {
      const next = fn(prev)
      save(next)
      return next
    })
  }, [])

  const addExpense = useCallback((data) => {
    update(prev => [...prev, { id: uid(), active: true, multiplier: 1, ...data }])
  }, [update])

  const removeExpense = useCallback((id) => {
    update(prev => prev.filter(e => e.id !== id))
  }, [update])

  const toggleExpense = useCallback((id) => {
    update(prev => prev.map(e => e.id === id ? { ...e, active: !e.active } : e))
  }, [update])

  const editExpense = useCallback((id, changes) => {
    update(prev => prev.map(e => e.id === id ? { ...e, ...changes } : e))
  }, [update])

  const importExpenses = useCallback((list) => {
    update(() => list.map(e => ({ ...e, id: uid() })))
  }, [update])

  const duplicateExpense = useCallback((id) => {
    update(prev => {
      const original = prev.find(e => e.id === id)
      if (!original) return prev
      const copy = { ...original, id: uid(), name: original.name + ' (copia)' }
      const idx = prev.findIndex(e => e.id === id)
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
  }, [update])

  return { expenses, addExpense, removeExpense, toggleExpense, editExpense, importExpenses, duplicateExpense }
}
