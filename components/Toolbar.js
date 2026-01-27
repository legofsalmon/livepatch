import styles from '../styles/Toolbar.module.scss'

export default function Toolbar({ onAddRow, onAddColumn }) {
  return (
    <div className={styles.toolbar}>
      <button className={styles.toolbarButton} onClick={onAddRow}>
        <span>➕</span> Add Row
      </button>
      <button className={styles.toolbarButton} onClick={onAddColumn}>
        <span>➕</span> Add Column
      </button>
    </div>
  )
}
