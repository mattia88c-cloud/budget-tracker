import { useState } from 'react'

const DEFAULT = { type: 'fixed', amount: 1000, percentage: 20, rate: 7 }

function load() {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem('budget_investimento')) } } catch { return DEFAULT }
}

export function useInvestimento() {
  const [inv, setInv] = useState(load)

  function update(changes) {
    const next = { ...inv, ...changes }
    localStorage.setItem('budget_investimento', JSON.stringify(next))
    setInv(next)
  }

  return { inv, update }
}
