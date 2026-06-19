import { useState } from 'react'
import { MOODS, todayKey, type Entry } from './diary'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type CalendarPageProps = {
  entries: Record<string, Entry>
  onOpen: (date: string) => void
}

function keyFor(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function CalendarPage({ entries, onOpen }: CalendarPageProps) {
  const [cursor, setCursor] = useState(() => new Date())

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const monthName = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month, 1).getDay()           // how many leading blanks
  const daysInMonth = new Date(year, month + 1, 0).getDate()   // last day of this month
  const today = todayKey()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Calendar</div>
          <div className="page-sub">Every day you wrote, marked. Tap a glowing day to revisit it.</div>
        </div>
      </div>

      <div className="cal-head">
        <div className="cal-month">{monthName}</div>
        <div className="cal-nav">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <div className="cal-grid">
        {DOW.map((d) => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} className="cal-cell empty" />
          const date = keyFor(year, month, day)
          const entry = entries[date]
          const mood = entry ? MOODS.find((m) => m.id === entry.mood) : undefined
          const classes =
            'cal-cell' + (entry ? ' has-entry' : '') + (date === today ? ' today' : '')
          return (
            <div key={date} className={classes} onClick={entry ? () => onOpen(date) : undefined}>
              <span>{day}</span>
              {entry && <span className="cal-mood-dot">{mood ? mood.emoji : '•'}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}