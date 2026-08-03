import { useState } from 'react'
import SalaryInput from './components/SalaryInput.jsx'
import Summary from './components/Summary.jsx'
import CategorySummary from './components/CategorySummary.jsx'
import AnnualProjection from './components/AnnualProjection.jsx'
import ExpenseList from './components/ExpenseList.jsx'
import PatrimonioChart from './components/PatrimonioChart.jsx'
import SpeseCategoryChart from './components/SpeseCategoryChart.jsx'
import ExportImport from './components/ExportImport.jsx'
import Conti from './components/Conti.jsx'
import Fatturazione from './components/Fatturazione.jsx'
import FattureList from './components/FattureList.jsx'
import CollapsibleSection from './components/CollapsibleSection.jsx'
import TaxAlert from './components/TaxAlert.jsx'
import InvestimentoChart from './components/InvestimentoChart.jsx'
import { useExpenses } from './useExpenses.js'
import { useInvestimento } from './useInvestimento.js'
import { useFatture } from './useFatture.js'
import styles from './App.module.css'

const MONTH = new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
const PAGES = ['dashboard', 'conti', 'spese']
const PAGE_LABELS = { dashboard: 'Dashboard', conti: 'Conti', spese: 'Spese' }

export default function App() {
  const [salary, setSalary] = useState(0)
  const [taxesActive, setTaxesActive] = useState(true)
  const [page, setPage] = useState('dashboard')
  const { expenses, addExpense, removeExpense, toggleExpense, editExpense, importExpenses, duplicateExpense } = useExpenses()
  const { inv, update: updateInv } = useInvestimento()
  const { fatture, deleteFattura } = useFatture()

  const taxes = taxesActive ? salary * 0.25 : 0
  const salaryNetto = salary - taxes

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 16 L4 10 L8 10 L8 16" stroke="#e0d9ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 16 L9 6 L13 6 L13 16" stroke="#c4b5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 16 L14 12 L18 12 L18 16" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="16" x2="19" y2="16" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoBudget}>Budget</span>
            <span className={styles.logoTracker}>Tracker</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {PAGES.map(p => (
            <button
              key={p}
              className={`${styles.navBtn} ${page === p ? styles.navActive : ''}`}
              onClick={() => setPage(p)}
            >
              {PAGE_LABELS[p]}
            </button>
          ))}
        </nav>

        <div className={styles.headerRight}>
          <ExportImport expenses={expenses} onImport={importExpenses} />
          <div className={styles.month}>{MONTH}</div>
        </div>
      </header>

      <main className={styles.main}>

        {/* ── DASHBOARD ── */}
        {page === 'dashboard' && (
          <>
            <SalaryInput value={salary} onChange={setSalary} />
            <div className={styles.twoCol}>
              <div className={styles.leftCol}>
                <CollapsibleSection title="Riepilogo" storageKey="riepilogo">
                  <Summary
                    salary={salary}
                    expenses={expenses}
                    taxes={taxes}
                    taxesActive={taxesActive}
                    onToggleTaxes={() => setTaxesActive(t => !t)}
                    salaryNetto={salaryNetto}
                    inv={inv}
                    onUpdateInv={updateInv}
                  />
                </CollapsibleSection>
                <CollapsibleSection title="Crescita investimenti" storageKey="inv-chart">
                  <InvestimentoChart />
                </CollapsibleSection>
              </div>
              <div className={styles.rightCol}>
                <CollapsibleSection title="Per categoria" storageKey="categoria">
                  <CategorySummary salary={salary} expenses={expenses} taxes={taxes} taxesActive={taxesActive} salaryNetto={salaryNetto} />
                </CollapsibleSection>
                <CollapsibleSection title="Alert tasse" storageKey="tax-alert">
                  <TaxAlert />
                </CollapsibleSection>
                <CollapsibleSection title="Proiezione annuale" storageKey="proiezione">
                  <AnnualProjection
                    salary={salary}
                    stipendi={fatture}
                    inv={{ ...inv, onUpdateRate: r => updateInv({ rate: r }) }}
                    salaryNetto={salaryNetto}
                  />
                </CollapsibleSection>
              </div>
            </div>
          </>
        )}

        {/* ── CONTI ── */}
        {page === 'conti' && (
          <>
            <CollapsibleSection title="Fatturazione" storageKey="fatturazione">
              <Fatturazione fatture={fatture} />
            </CollapsibleSection>
            <div className={styles.twoCol}>
              <div className={styles.leftCol}>
                <CollapsibleSection title="Conti" storageKey="conti">
                  <Conti />
                </CollapsibleSection>
              </div>
              <div className={styles.rightCol}>
                <CollapsibleSection title="Storico stipendi" storageKey="stipendi">
                  <FattureList fatture={fatture} onDelete={deleteFattura} />
                </CollapsibleSection>
              </div>
            </div>
          </>
        )}

        {/* ── SPESE ── */}
        {page === 'spese' && (
          <>
            <CollapsibleSection title="Spese" storageKey="spese">
              <ExpenseList
                expenses={expenses}
                onAdd={addExpense}
                onToggle={toggleExpense}
                onEdit={editExpense}
                onRemove={removeExpense}
                onDuplicate={duplicateExpense}
                salaryNetto={salaryNetto}
              />
            </CollapsibleSection>
            <CollapsibleSection title="Spese per categoria" storageKey="spese-chart">
              <SpeseCategoryChart
                expenses={expenses}
                salary={salary}
                taxes={taxes}
                taxesActive={taxesActive}
                salaryNetto={salaryNetto}
              />
            </CollapsibleSection>
            <CollapsibleSection title="Distribuzione patrimonio" storageKey="grafici">
              <PatrimonioChart />
            </CollapsibleSection>
          </>
        )}

      </main>

      <footer className={styles.footer}>
        BudgetTracker · Dati salvati localmente nel browser
      </footer>
    </div>
  )
}
