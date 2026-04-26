import { useRef, useState } from 'react'

const formatDate = (dateStr) => {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getDueDateStatus = (dateStr) => {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [year, month, day] = dateStr.split('-').map(Number)
  const due = new Date(year, month - 1, day)
  if (due < today) return 'overdue'
  if (due.getTime() === today.getTime()) return 'today'
  return 'upcoming'
}

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Read a book', done: false, dueDate: '' },
    { id: 2, text: 'Go for a walk', done: true, dueDate: '' },
    { id: 3, text: 'Write some code', done: false, dueDate: '' },
  ])
  const [input, setInput] = useState('')
  const [inputDueDate, setInputDueDate] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [editingDueDate, setEditingDueDate] = useState('')
  const skipBlurSaveRef = useRef(false)

  const addTodo = () => {
    const text = input.trim()
    if (!text) return
    setTodos([...todos, { id: Date.now(), text, done: false, dueDate: inputDueDate }])
    setInput('')
    setInputDueDate('')
  }

  const toggleTodo = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  const deleteTodo = (id) => setTodos(todos.filter((t) => t.id !== id))

  const startEditing = (id, text, dueDate) => {
    setEditingId(id)
    setEditingText(text)
    setEditingDueDate(dueDate || '')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingText('')
    setEditingDueDate('')
  }

  const saveEditing = (id) => {
    const text = editingText.trim()
    if (!text) {
      deleteTodo(id)
    } else {
      setTodos(todos.map((t) => (t.id === id ? { ...t, text, dueDate: editingDueDate } : t)))
    }
    cancelEditing()
  }

  const visible = todos.filter((t) =>
    filter === 'active' ? !t.done : filter === 'completed' ? t.done : true,
  )

  const remaining = todos.filter((t) => !t.done).length

  const tabClass = (name) =>
    `px-3 py-1 rounded-md text-sm font-medium transition ${
      filter === name
        ? 'bg-indigo-600 text-white'
        : 'text-slate-600 hover:bg-slate-200'
    }`

  const dueBadgeClass = (status) => {
    if (status === 'overdue') return 'bg-red-100 text-red-600 border border-red-200'
    if (status === 'today') return 'bg-amber-100 text-amber-600 border border-amber-200'
    return 'bg-slate-100 text-slate-500 border border-slate-200'
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Todo List</h1>

        {/* Add todo */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs doing?"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition"
          >
            Add
          </button>
        </div>

        {/* Due date input for new todo */}
        <div className="flex items-center gap-2 mb-4">
          <label className="text-xs text-slate-500 whitespace-nowrap">Due date (optional)</label>
          <input
            type="date"
            value={inputDueDate}
            onChange={(e) => setInputDueDate(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-600"
          />
          {inputDueDate && (
            <button
              onClick={() => setInputDueDate('')}
              className="text-slate-400 hover:text-slate-600 text-sm"
              aria-label="Clear due date"
            >
              ×
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setFilter('all')} className={tabClass('all')}>All</button>
          <button onClick={() => setFilter('active')} className={tabClass('active')}>Active</button>
          <button onClick={() => setFilter('completed')} className={tabClass('completed')}>Completed</button>
        </div>

        {/* Todo list */}
        <ul className="space-y-2">
          {visible.map((todo) => {
            const status = getDueDateStatus(todo.dueDate)
            return (
              <li
                key={todo.id}
                className="flex flex-col px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50 gap-1"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id)}
                    aria-label={`Mark "${todo.text}" as ${todo.done ? 'not done' : 'done'}`}
                    className="h-4 w-4 accent-indigo-600 flex-shrink-0"
                  />

                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={() => {
                        if (skipBlurSaveRef.current) {
                          skipBlurSaveRef.current = false
                          return
                        }
                        saveEditing(todo.id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditing(todo.id)
                        else if (e.key === 'Escape') {
                          skipBlurSaveRef.current = true
                          e.currentTarget.blur()
                          cancelEditing()
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  ) : (
                    <button
                      onDoubleClick={() => startEditing(todo.id, todo.text, todo.dueDate)}
                      className={`flex-1 text-left ${
                        todo.done ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {todo.text}
                    </button>
                  )}

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-slate-400 hover:text-red-500 text-lg font-bold px-2 flex-shrink-0"
                    aria-label="Delete todo"
                  >
                    ×
                  </button>
                </div>

                {/* Due date row — edit mode */}
                {editingId === todo.id && (
                  <div className="flex items-center gap-2 ml-7">
                    <span className="text-xs text-slate-400">Due</span>
                    <input
                      type="date"
                      value={editingDueDate}
                      onChange={(e) => setEditingDueDate(e.target.value)}
                      onMouseDown={() => { skipBlurSaveRef.current = true }}
                      onBlur={() => { skipBlurSaveRef.current = false }}
                      className="px-2 py-0.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-600"
                    />
                    {editingDueDate && (
                      <button
                        onMouseDown={() => { skipBlurSaveRef.current = true }}
                        onClick={() => setEditingDueDate('')}
                        className="text-slate-400 hover:text-slate-600 text-sm leading-none"
                        aria-label="Clear due date"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}

                {/* Due date badge — display mode */}
                {editingId !== todo.id && todo.dueDate && (
                  <div className="ml-7">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${dueBadgeClass(status)}`}>
                      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                      {status === 'overdue' && 'Overdue · '}
                      {status === 'today' && 'Due today · '}
                      {formatDate(todo.dueDate)}
                    </span>
                  </div>
                )}
              </li>
            )
          })}
          {visible.length === 0 && (
            <li className="text-center text-slate-400 py-4 text-sm">Nothing here.</li>
          )}
        </ul>

        <div className="mt-4 text-sm text-slate-500">
          {remaining} {remaining === 1 ? 'item' : 'items'} left
        </div>
      </div>
    </div>
  )
}