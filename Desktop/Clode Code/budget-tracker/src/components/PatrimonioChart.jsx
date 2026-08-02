import { useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, DoughnutController } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import styles from './PatrimonioChart.module.css'

ChartJS.register(ArcElement, Tooltip, DoughnutController)

// Priority order: Investimenti first so "investiti" doesn't also match "invest" in Liquidità
const PRIORITY_GROUPS = [
  { cat: 'Investimenti', keys: ['investiti', 'investimenti'] },
  { cat: 'Liquidità',    keys: ['cash', 'invest'] },
  { cat: 'Risparmio',    keys: ['vacanze', 'risparmio'] },
  { cat: 'Tasse',        keys: ['dichiarazione', 'tasse'] },
]
const CATEGORIES = ['Liquidità', 'Risparmio', 'Tasse', 'Investimenti']

const COLORS = {
  'Liquidità':    { border: '#22d3ee', bg: 'rgba(34,211,238,0.75)' },
  'Risparmio':    { border: '#4ade80', bg: 'rgba(74,222,128,0.75)' },
  'Tasse':        { border: '#f59e0b', bg: 'rgba(245,158,11,0.75)' },
  'Investimenti': { border: '#a78bfa', bg: 'rgba(167,139,250,0.75)' },
}

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function loadConti() {
  try { return JSON.parse(localStorage.getItem('budget_conti')) ?? [] } catch { return [] }
}

export default function PatrimonioChart() {
  const [conti] = useState(loadConti)

  const grouped = { Liquidità: 0, Risparmio: 0, Tasse: 0, Investimenti: 0 }
  conti.forEach(c => {
    const name = c.name.toLowerCase()
    const match = PRIORITY_GROUPS.find(g => g.keys.some(k => name.includes(k)))
    if (match) grouped[match.cat] += c.balance || 0
  })

  const totalPatrimonio = Object.values(grouped).reduce((s, v) => s + v, 0)
  const categories = CATEGORIES
  const hasData = CATEGORIES.some(c => grouped[c] > 0)

  const donutData = {
    labels: categories,
    datasets: [{
      data: categories.map(c => grouped[c]),
      backgroundColor: categories.map(c => COLORS[c].bg),
      borderColor: categories.map(c => COLORS[c].border),
      borderWidth: 1.5,
      hoverOffset: 8,
    }],
  }

  const donutOptions = {
    responsive: true,
    cutout: '70%',
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
        callbacks: {
          label: ctx => ` ${ctx.label}: ${fmt(ctx.parsed)}`,
          afterLabel: ctx => {
            const pct = totalPatrimonio > 0 ? Math.round((ctx.parsed / totalPatrimonio) * 100) : 0
            return ` ${pct}% del patrimonio`
          },
        },
      },
    },
  }

  if (!hasData) return (
    <div className={styles.empty}>
      Aggiungi saldi nei Conti per visualizzare la distribuzione del patrimonio
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.total}>{fmt(totalPatrimonio)}</div>
        <div className={styles.totalLabel}>patrimonio totale</div>
      </div>

      <div className={styles.body}>
        <div className={styles.donutWrap}>
          <Doughnut data={donutData} options={donutOptions} />
          <div className={styles.center}>
            <span className={styles.centerLabel}>Totale</span>
            <span className={styles.centerValue}>{fmt(totalPatrimonio)}</span>
          </div>
        </div>

        <div className={styles.legend}>
          {categories.map(cat => {
            const val = grouped[cat]
            const pct = totalPatrimonio > 0 ? Math.round((val / totalPatrimonio) * 100) : 0
            return (
              <div key={cat} className={styles.legendRow}>
                <div className={styles.legendDot} style={{ background: COLORS[cat].border }} />
                <div className={styles.legendInfo}>
                  <div className={styles.legendTop}>
                    <span className={styles.legendCat}>{cat}</span>
                    <span className={styles.legendAmt} style={{ color: COLORS[cat].border }}>{fmt(val)}</span>
                  </div>
                  <div className={styles.barWrap}>
                    <div
                      className={styles.bar}
                      style={{ width: `${pct}%`, background: COLORS[cat].border }}
                    />
                  </div>
                  <span className={styles.legendPct}>{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
