import { useState } from 'react'
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import styles from './InvestimentoChart.module.css'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler, Legend)

const MONTHS_IT = [
  'gennaio','febbraio','marzo','aprile','maggio','giugno',
  'luglio','agosto','settembre','ottobre','novembre','dicembre'
]

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function ymLabel(ym) {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS_IT[m - 1]} ${y}`
}

function loadEntries() {
  try { return JSON.parse(localStorage.getItem('budget_inv_entries')) ?? [] } catch { return [] }
}

function saveEntries(list) {
  localStorage.setItem('budget_inv_entries', JSON.stringify(list))
}

export default function InvestimentoChart() {
  const [entries, setEntries] = useState(loadEntries)
  const [showAdd, setShowAdd] = useState(false)
  const [monthInput, setMonthInput] = useState('')
  const [versatoInput, setVersatoInput] = useState('')
  const [valoreInput, setValoreInput] = useState('')

  const sorted = [...entries].sort((a, b) => a.ym.localeCompare(b.ym))

  // Cumulative contributions line
  let cumulative = 0
  const contribData = sorted.map(e => {
    cumulative += e.versato ?? 0
    return cumulative
  })

  // Market value line
  const marketData = sorted.map(e => e.valore ?? null)

  const labels = sorted.map(e => e.label)
  const totalInvestito = contribData[contribData.length - 1] ?? 0
  const currentMarket = [...marketData].reverse().find(v => v !== null) ?? 0
  const rendimento = currentMarket - totalInvestito
  const growing = rendimento >= 0

  function addEntry() {
    if (!monthInput) return
    const versato = parseFloat(versatoInput) || 0
    const valore = valoreInput !== '' ? parseFloat(valoreInput) : undefined
    const ym = monthInput
    const label = ymLabel(ym)

    const updated = [...entries]
    const idx = updated.findIndex(e => e.ym === ym)
    const entry = { ym, label, versato, ...(valore !== undefined ? { valore } : {}) }
    if (idx >= 0) updated[idx] = entry
    else updated.push(entry)
    updated.sort((a, b) => a.ym.localeCompare(b.ym))

    saveEntries(updated)
    setEntries(updated)
    setMonthInput('')
    setVersatoInput('')
    setValoreInput('')
  }

  function removeEntry(ym) {
    const updated = entries.filter(e => e.ym !== ym)
    saveEntries(updated)
    setEntries(updated)
  }

  const hasData = sorted.length >= 1

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Valore conto',
        data: marketData,
        borderColor: growing ? '#4ade80' : '#f87171',
        backgroundColor: growing ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)',
        borderWidth: 2,
        pointBackgroundColor: growing ? '#4ade80' : '#f87171',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: true,
        spanGaps: true,
      },
      {
        label: 'Investito',
        data: contribData,
        borderColor: '#a78bfa',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 4],
        pointBackgroundColor: '#a78bfa',
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.35,
        fill: false,
        spanGaps: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#9090b8',
          font: { size: 11 },
          boxWidth: 16,
          boxHeight: 2,
          padding: 12,
          usePointStyle: true,
          pointStyle: 'line',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(9,8,15,0.97)',
        borderColor: 'rgba(167,139,250,0.2)',
        borderWidth: 1,
        titleColor: '#f0eeff',
        bodyColor: '#9090b8',
        padding: 10,
        cornerRadius: 8,
        callbacks: { label: ctx => ctx.parsed.y !== null ? ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` : '' },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#6060a0', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#6060a0', font: { size: 11 }, callback: v => fmt(v) },
      },
    },
  }

  return (
    <div className={styles.wrap}>
      {/* Stats */}
      <div className={styles.statsRow}>
        {currentMarket > 0 && (
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>Valore conto</span>
            <span className={styles.statValue} style={{ color: growing ? '#4ade80' : '#f87171' }}>{fmt(currentMarket)}</span>
          </div>
        )}
        {totalInvestito > 0 && (
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>Investito</span>
            <span className={styles.statValue} style={{ color: '#a78bfa' }}>{fmt(totalInvestito)}</span>
          </div>
        )}
        {totalInvestito > 0 && currentMarket > 0 && (
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>Rendimento</span>
            <span className={styles.statValue} style={{ color: growing ? '#4ade80' : '#f87171' }}>
              {growing ? '+' : ''}{fmt(rendimento)}
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      {hasData
        ? <Line data={chartData} options={chartOptions} />
        : <div className={styles.noChart}>Aggiungi i dati mensili con il pulsante qui sotto.</div>
      }

      {/* Entries */}
      <div className={styles.contriSection}>
        <div className={styles.contriHeader}>
          <span className={styles.contriTitle}>Dati mensili</span>
          <button className={styles.addToggle} onClick={() => setShowAdd(v => !v)}>
            {showAdd ? '✕' : '＋ aggiungi mese'}
          </button>
        </div>

        {showAdd && (
          <div className={styles.addForm}>
            <input
              className={styles.addInput}
              type="month"
              value={monthInput}
              onChange={e => setMonthInput(e.target.value)}
            />
            <div className={styles.addFieldGroup}>
              <span className={styles.addFieldLabel}>versato</span>
              <span className={styles.addCurrency}>€</span>
              <input
                className={styles.addInput}
                type="number" min="0" step="10"
                value={versatoInput}
                onChange={e => setVersatoInput(e.target.value)}
                placeholder="0"
                style={{ width: 80 }}
              />
            </div>
            <div className={styles.addFieldGroup}>
              <span className={styles.addFieldLabel}>val. conto</span>
              <span className={styles.addCurrency}>€</span>
              <input
                className={styles.addInput}
                type="number" min="0" step="10"
                value={valoreInput}
                onChange={e => setValoreInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { addEntry(); setShowAdd(false) } }}
                placeholder="—"
                style={{ width: 80 }}
              />
            </div>
            <button className={styles.addBtn} onClick={() => { addEntry(); setShowAdd(false) }}>✓</button>
          </div>
        )}

        {sorted.length > 0 && (
          <div className={styles.contriList}>
            <div className={styles.contriHead}>
              <span className={styles.contriLabel}>Mese</span>
              <span className={styles.contriAdded}>Versato</span>
              <span className={styles.contriCumul}>Totale inv.</span>
              <span className={styles.contriCumul}>Val. conto</span>
              <span style={{ width: 20 }} />
            </div>
            {sorted.map((e, i) => {
              const cumul = sorted.slice(0, i + 1).reduce((s, x) => s + (x.versato ?? 0), 0)
              return (
                <div key={e.ym} className={styles.contriRow}>
                  <span className={styles.contriLabel}>{e.label}</span>
                  <span className={styles.contriAdded}>{e.versato ? `+${fmt(e.versato)}` : '—'}</span>
                  <span className={styles.contriCumul}>{fmt(cumul)}</span>
                  <span className={styles.contriCumul} style={{ color: growing ? '#4ade80' : '#f87171' }}>
                    {e.valore !== undefined ? fmt(e.valore) : '—'}
                  </span>
                  <button className={styles.contriDel} onClick={() => removeEntry(e.ym)}>✕</button>
                </div>
              )
            })}
            <div className={styles.contriTotal}>
              <span>Totale versato</span>
              <span>{fmt(totalInvestito)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
