import { useMemo } from 'react'
import { calcAmount } from '../calcAmount.js'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  DoughnutController,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { GROUP_COLORS, ALL_GROUPS } from '../categories.js'
import styles from './Charts.module.css'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend, DoughnutController)

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

const tooltipStyle = {
  backgroundColor: 'rgba(9,8,15,0.97)',
  borderColor: 'rgba(167,139,250,0.25)',
  borderWidth: 1,
  titleColor: '#f0eeff',
  bodyColor: '#9090b8',
  padding: 12,
  cornerRadius: 10,
  titleFont: { family: 'Inter', size: 12, weight: '600' },
  bodyFont: { family: 'Inter', size: 11 },
}

export default function Charts({ salary, expenses, taxes, taxesActive, salaryNetto = 0 }) {
  const active = expenses.filter(e => e.active)

  const byGroup = useMemo(() => {
    const map = {}
    for (const e of active) {
      map[e.group] = (map[e.group] || 0) + calcAmount(e, salaryNetto)
    }
    return map
  }, [active, salaryNetto])

  const totalExpenses = active
    .filter(e => e.group !== 'Investimenti')
    .reduce((s, e) => s + calcAmount(e, salaryNetto), 0)

  const totalInvestments = active
    .filter(e => e.group === 'Investimenti')
    .reduce((s, e) => s + calcAmount(e, salaryNetto), 0)

  const residuo = salary - totalExpenses - totalInvestments - taxes
  const hasData = active.length > 0

  // 1. Donut — distribuzione spese per gruppo
  const donutGroups = ALL_GROUPS.filter(g => byGroup[g] > 0)
  const donutData = {
    labels: donutGroups,
    datasets: [{
      data: donutGroups.map(g => byGroup[g]),
      backgroundColor: donutGroups.map(g => GROUP_COLORS[g] + 'cc'),
      borderColor: donutGroups.map(g => GROUP_COLORS[g]),
      borderWidth: 1.5,
      hoverOffset: 6,
    }],
  }

  const donutOptions = {
    responsive: true,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#8b92b8',
          font: { size: 10, family: 'Inter' },
          padding: 10,
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 3,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: { ...tooltipStyle, callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.parsed)}` } },
    },
  }

  // 2. Barre orizzontali — categorie
  const barGroups = ALL_GROUPS.filter(g => byGroup[g] > 0)
  const hBarData = {
    labels: taxesActive && taxes > 0 ? ['Tasse', ...barGroups] : barGroups,
    datasets: [{
      label: 'Importo',
      data: taxesActive && taxes > 0 ? [taxes, ...barGroups.map(g => byGroup[g])] : barGroups.map(g => byGroup[g]),
      backgroundColor: taxesActive && taxes > 0
        ? ['rgba(245,158,11,0.7)', ...barGroups.map(g => GROUP_COLORS[g] + 'aa')]
        : barGroups.map(g => GROUP_COLORS[g] + 'aa'),
      borderColor: taxesActive && taxes > 0
        ? ['#f59e0b', ...barGroups.map(g => GROUP_COLORS[g])]
        : barGroups.map(g => GROUP_COLORS[g]),
      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  const hBarOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipStyle, callbacks: { label: ctx => ` ${fmt(ctx.parsed.x)}` } },
    },
    scales: {
      x: {
        ticks: { color: '#4b5473', font: { family: 'Inter', size: 10 }, callback: v => fmt(v) },
        grid: { color: 'rgba(255,255,255,0.03)' },
        border: { color: 'transparent' },
      },
      y: {
        ticks: { color: '#8b92b8', font: { family: 'Inter', size: 10 } },
        grid: { display: false },
        border: { color: 'transparent' },
      },
    },
  }

  // 3. Waterfall — flusso mensile
  const flowLabels = ['Stipendio', 'Tasse', 'Spese', 'Investimenti', 'Residuo']
  const flowValues = [salary, taxesActive ? taxes : 0, totalExpenses, totalInvestments, Math.abs(residuo)]
  const flowColors = [
    'rgba(79,142,247,0.75)',
    'rgba(245,158,11,0.75)',
    'rgba(239,68,68,0.75)',
    'rgba(16,185,129,0.75)',
    residuo >= 0 ? 'rgba(34,197,94,0.75)' : 'rgba(239,68,68,0.75)',
  ]
  const flowBorders = ['#4f8ef7', '#f59e0b', '#ef4444', '#10b981', residuo >= 0 ? '#22c55e' : '#ef4444']

  const flowData = {
    labels: flowLabels,
    datasets: [{
      data: flowValues,
      backgroundColor: flowColors,
      borderColor: flowBorders,
      borderWidth: 1.5,
      borderRadius: 8,
      borderSkipped: false,
    }],
  }

  const flowOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipStyle, callbacks: { label: ctx => ` ${fmt(ctx.parsed.y)}` } },
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

  // 4. Donut residuo vs impegni
  const totalImpegni = totalExpenses + totalInvestments + taxes
  const residuoAbs = Math.max(0, residuo)
  const pieResiduoData = {
    labels: ['Residuo', 'Impegni'],
    datasets: [{
      data: [residuoAbs, totalImpegni],
      backgroundColor: ['rgba(34,197,94,0.7)', 'rgba(79,142,247,0.5)'],
      borderColor: ['#22c55e', '#4f8ef7'],
      borderWidth: 1.5,
      hoverOffset: 6,
    }],
  }

  const pieResiduoOptions = {
    responsive: true,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#8b92b8', font: { size: 10, family: 'Inter' }, padding: 14, usePointStyle: true, pointStyle: 'circle' },
      },
      tooltip: { ...tooltipStyle, callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.parsed)}` } },
    },
  }

  if (!hasData && salary === 0) return (
    <div className={styles.emptyState}>
      Inserisci stipendio e spese per visualizzare i grafici
    </div>
  )

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Spese per categoria</div>
        {hasData
          ? <div className={styles.donutWrap}><Doughnut data={donutData} options={donutOptions} /></div>
          : <div className={styles.empty}>Nessuna spesa attiva</div>
        }
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Residuo vs Impegni</div>
        {salary > 0
          ? (
            <div className={styles.donutWrap2}>
              <Doughnut data={pieResiduoData} options={pieResiduoOptions} />
              <div className={styles.donutCenter}>
                <span className={styles.donutPct}>
                  {salary > 0 ? `${Math.round((residuoAbs / salary) * 100)}%` : '—'}
                </span>
                <span className={styles.donutLabel}>libero</span>
              </div>
            </div>
          )
          : <div className={styles.empty}>Inserisci stipendio</div>
        }
      </div>

      <div className={`${styles.card} ${styles.wide}`}>
        <div className={styles.cardTitle}>Flusso mensile</div>
        {salary > 0 || hasData
          ? <div className={styles.barWrap}><Bar data={flowData} options={flowOptions} /></div>
          : <div className={styles.empty}>Inserisci dati</div>
        }
      </div>

      <div className={`${styles.card} ${styles.wide}`}>
        <div className={styles.cardTitle}>Importo per categoria</div>
        {barGroups.length > 0 || (taxesActive && taxes > 0)
          ? <div className={styles.hBarWrap}><Bar data={hBarData} options={hBarOptions} /></div>
          : <div className={styles.empty}>Nessuna spesa attiva</div>
        }
      </div>
    </div>
  )
}
