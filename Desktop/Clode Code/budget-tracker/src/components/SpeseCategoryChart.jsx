import { useMemo } from 'react'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { GROUP_COLORS, ALL_GROUPS } from '../categories.js'
import { calcAmount } from '../calcAmount.js'
import styles from './SpeseCategoryChart.module.css'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function SpeseCategoryChart({ expenses, salary, taxes, taxesActive, salaryNetto }) {
  const rows = useMemo(() => {
    const active = expenses.filter(e => e.active)
    const map = {}
    for (const e of active) {
      map[e.group] = (map[e.group] || 0) + calcAmount(e, salaryNetto)
    }
    const list = ALL_GROUPS
      .filter(g => map[g] > 0)
      .map(g => ({ label: g, value: map[g], color: GROUP_COLORS[g] }))

    if (taxesActive && taxes > 0) {
      list.push({ label: 'Tasse', value: taxes, color: '#f59e0b' })
    }

    return list.sort((a, b) => b.value - a.value)
  }, [expenses, salary, taxes, taxesActive, salaryNetto])

  if (rows.length === 0) {
    return <div className={styles.empty}>Aggiungi delle spese per vedere il grafico</div>
  }

  const labels = rows.map(r => r.label)
  const values = rows.map(r => r.value)
  const colors = rows.map(r => r.color)
  const total = values.reduce((s, v) => s + v, 0)

  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors.map(c => c + 'cc'),
      borderColor: colors,
      borderWidth: { left: 0, top: 0, right: 0, bottom: 0 },
      borderRadius: { topRight: 4, bottomRight: 4 },
      borderSkipped: 'start',
      barThickness: 18,
    }],
  }

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(9,8,15,0.97)',
        borderColor: 'rgba(167,139,250,0.2)',
        borderWidth: 1,
        titleColor: '#f0eeff',
        bodyColor: '#9090b8',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: ctx => {
            const val = ctx.parsed.x
            const pct = salary > 0 ? ` (${Math.round((val / salary) * 100)}% stipendio)` : ''
            return ` ${fmt(val)}${pct}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { display: false },
        ticks: {
          color: '#6060a0',
          font: { size: 10 },
          callback: v => fmt(v),
          maxTicksLimit: 5,
        },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#a0a0c8', font: { size: 12, weight: '600' } },
      },
    },
    animation: { duration: 400 },
  }

  const chartHeight = Math.max(160, rows.length * 36 + 24)

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>Spese per categoria</span>
        <span className={styles.total}>{fmt(total)}</span>
      </div>
      <div style={{ height: chartHeight }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  )
}
