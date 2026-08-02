export function calcAmount(expense, salaryNetto = 0) {
  if (expense.type === 'percentage') return salaryNetto * (expense.percentage || 0) / 100
  if (expense.type === 'variable') return expense.amount * (expense.multiplier || 1)
  return expense.amount
}
