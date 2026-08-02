import { useState } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  LineElement, PointElement, LineController, Tooltip, Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import styles from './Fatturazione.module.css'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, Tooltip, Filler)

const MONTHS = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']
const MONTHS_FULL = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
function fmtFull(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
}

export default function Fatturazione({ fatture }) {
  const years = [...new Set(fatture.map(f => f.date.slice(0, 4)))].sort((a, b) => b - a)
  const [year, setYear] = useState(years[0] ?? '2026')

  const yearFatture = fatture.filter(f => f.date.startsWith(year))
  const byMonth = Array(12).fill(0)
  yearFatture.forEach(f => {
    const m = parseInt(f.date.slice(5, 7)) - 1
    byMonth[m] += f.amount
  })

  const totalYear = yearFatture.reduce((s, f) => s + f.amount, 0)
  const activeMths = byMonth.filter(v => v > 0).length
  const avgMonth = activeMths > 0 ? totalYear / activeMths : 0

  const lastMonth = byMonth.reduce((last, v, i) => v > 0 ? i : last, -1)
  const labels = lastMonth >= 0 ? MONTHS.slice(0, lastMonth + 1) : MONTHS
  const data = byMonth.slice(0, labels.length)

  const chartData = {
    labels,
    datasets: [{
      data,
      borderColor: '#a78bfa',
      backgroundColor: 'rgba(167,139,250,0.08)',
      borderWidth: 2,
      pointBackgroundColor: '#a78bfa',
      pointBorderColor: '#0a0a0f',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.4,
      fill: true,
    }],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(9,8,15,0.97)',
        borderColor: 'rgba(167,139,250,0.25)',
        borderWidth: 1,
        titleColor: '#f0eeff',
        bodyColor: '#a78bfa',
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          title: ctx => MONTHS_FULL[MONTHS.indexOf(ctx[0].label)] + ' ' + year,
          label: ctx => ' ' + fmtFull(ctx.parsed.y),
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#8b92b8', font: { family: 'Inter', size: 11 } },
        grid: { display: false },
        border: { color: 'transparent' },
      },
      y: {
        ticks: { color: '#4b5473', font: { family: 'Inter', size: 10 }, callback: v => fmt(v) },
        grid: { color: 'rgba(255,255,255,0.03)' },
        border: { color: 'transparent' },
      },
    },
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.total}>{fmt(totalYear)}</span>
          <span className={styles.totalLabel}>fatturato {year}</span>
        </div>
        <div className={styles.yearBtns}>
          {years.map(y => (
            <button
              key={y}
              className={`${styles.yearBtn} ${year === y ? styles.yearActive : ''}`}
              onClick={() => setYear(y)}
            >{y}</button>
          ))}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Fatture</span>
          <span className={styles.statValue}>{yearFatture.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Media mensile</span>
          <span className={styles.statValue}>{fmt(avgMonth)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Mese migliore</span>
          <span className={styles.statValue}>
            {byMonth.some(v => v > 0) ? MONTHS_FULL[byMonth.indexOf(Math.max(...byMonth))] : '—'}
          </span>
        </div>
      </div>

      <div className={styles.chartWrap}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  )
}
