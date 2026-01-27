import styles from '../styles/Toolbar.module.scss'

export default function Toolbar() {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarInfo}>
        <h2>Live Patch Spreadsheet</h2>
        <p>Real-time collaborative editing</p>
      </div>
    </div>
  )
}
