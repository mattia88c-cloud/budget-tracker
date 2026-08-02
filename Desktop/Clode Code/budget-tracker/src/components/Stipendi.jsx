import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import styles from './Stipendi.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function Stipendi({ stipendi, onDelete }) {
  if (stipendi.length === 0) {
    return (
      <div className={styles.empty}>
        Nessuno stipendio salvato. Salva lo stipendio dalla Dashboard per iniziare a tracciarlo.
      </div>
    )
  }

  const ordered = [...stipendi].reverse()

  const chartData = {
    labels: ordered.map(s => s.label),
    datasets: [{
      data: ordered.map(s => s.amount),
      backgroundColor: 'rgba(167,139,250,0.5)',
      borderColor: '#a78bfa',
      borderWidth: 1.5,
      borderRadius: 8,
      borderSkipped: false,
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
        bodyColor: '#9090b8',
        padding: 12,
        cornerRadius: 10,
        callbacks: { label: ctx => ` ${fmt(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: {
        ticks: { color: '#8b92b8', font: { family: 'Inter', size: 10 }, maxRotation: 45 },
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
      <div className={styles.chartWrap}>
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className={styles.list}>
        {stipendi.map(s => (
          <div key={s.id} className={styles.row}>
            <span className={styles.label}>{s.label}</span>
            <span className={styles.amount}>{fmt(s.amount)}</span>
            <button className={styles.del} onClick={() => onDelete(s.id)} title="Elimina">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
