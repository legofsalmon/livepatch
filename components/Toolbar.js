import styles from '../styles/Toolbar.module.scss'

export default function Toolbar({ onAddRow, onAddColumn, onRemoveRow, onRemoveColumn }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarGroup}>
        <button className={styles.toolbarButton} onClick={onAddRow}>
          <span>➕</span> Add Row
        </button>
        <button className={styles.toolbarButton} onClick={onAddColumn}>
          <span>➕</span> Add Column
        </button>
      </div>
      <div className={styles.toolbarGroup}>
        <button className={`${styles.toolbarButton} ${styles.removeButton}`} onClick={onRemoveRow}>
          <span>➖</span> Remove Row
        </button>
        <button className={`${styles.toolbarButton} ${styles.removeButton}`} onClick={onRemoveColumn}>
          <span>➖</span> Remove Column
        </button>
      </div>
    </div>
  )
}
