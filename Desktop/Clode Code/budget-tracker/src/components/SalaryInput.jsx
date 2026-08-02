import styles from './SalaryInput.module.css'

export default function SalaryInput({ value, onChange }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.label}>
        <div className={styles.icon}>💰</div>
        Fattura <span className={styles.lordoTag}>lordo</span>
        <span className={styles.hint}>non salvato</span>
      </div>
      <div className={styles.inputWrap}>
        <span className={styles.currency}>€</span>
        <input
          type="number"
          min="0"
          step="50"
          placeholder="0"
          value={value || ''}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className={styles.input}
        />
      </div>
    </div>
  )
}
