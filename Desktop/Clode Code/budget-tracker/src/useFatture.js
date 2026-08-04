import { useState } from 'react'

const SEED = [
  { id: 1, date: '2026-07-02', amount: 1770.00 },
  { id: 2, date: '2026-06-15', amount: 1517.36 },
  { id: 3, date: '2026-06-02', amount: 1920.00 },
  { id: 4, date: '2026-05-11', amount: 2784.00 },
  { id: 5, date: '2026-04-21', amount: 100.00 },
  { id: 6, date: '2026-04-08', amount: 1793.00 },
  { id: 7, date: '2026-03-27', amount: 1253.62 },
  { id: 8, date: '2026-03-14', amount: 1444.52 },
  { id: 9, date: '2026-03-13', amount: 1005.80 },
  { id: 10, date: '2026-03-06', amount: 1624.00 },
  { id: 11, date: '2026-02-24', amount: 50.00 },
  { id: 12, date: '2026-02-12', amount: 1867.00 },
  { id: 13, date: '2026-02-04', amount: 3607.34 },
  { id: 14, date: '2026-01-30', amount: 777.01 },
  { id: 15, date: '2026-01-27', amount: 4148.60 },
  { id: 16, date: '2026-01-12', amount: 1900.00 },
  { id: 17, date: '2026-01-12', amount: 2405.39 },
  { id: 18, date: '2025-12-29', amount: 1708.79 },
  { id: 19, date: '2025-12-25', amount: 1004.85 },
  { id: 20, date: '2025-12-12', amount: 460.48 },
  { id: 21, date: '2025-12-05', amount: 1187.00 },
  { id: 22, date: '2025-11-16', amount: 1324.00 },
  { id: 23, date: '2025-10-14', amount: 1224.00 },
  { id: 24, date: '2025-09-12', amount: 1341.00 },
  { id: 25, date: '2025-08-12', amount: 1324.00 },
  { id: 26, date: '2025-07-09', amount: 1324.00 },
  { id: 27, date: '2025-06-27', amount: 2045.54 },
  { id: 28, date: '2025-06-10', amount: 1026.18 },
  { id: 29, date: '2025-06-10', amount: 1300.00 },
  { id: 30, date: '2025-05-16', amount: 800.00 },
  { id: 31, date: '2025-04-22', amount: 1417.95 },
  { id: 32, date: '2025-04-15', amount: 1050.00 },
  { id: 33, date: '2025-04-09', amount: 1520.89 },
  { id: 34, date: '2025-03-14', amount: 1040.00 },
  { id: 35, date: '2025-02-11', amount: 1612.00 },
  { id: 36, date: '2025-01-15', amount: 208.00 },
  { id: 37, date: '2025-01-14', amount: 676.00 },
]

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem('budget_fatture'))
    if (saved && saved.length > 0) return saved
  } catch {}
  localStorage.setItem('budget_fatture', JSON.stringify(SEED))
  return SEED
}

export function useFatture() {
  const [fatture, setFatture] = useState(load)

  function addFattura(date, amount) {
    const next = [...fatture, { id: Date.now(), date, amount }]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    localStorage.setItem('budget_fatture', JSON.stringify(next))
    setFatture(next)
  }

  function deleteFattura(id) {
    const next = fatture.filter(f => f.id !== id)
    localStorage.setItem('budget_fatture', JSON.stringify(next))
    setFatture(next)
  }

  return { fatture, addFattura, deleteFattura }
}
