import { STATUSES } from './TaskForm';

export default function TaskItem({ task, showDate, onEdit, onDelete, onStatus }) {
  return (
    <li className={`task ${task.status}`}>
      <div className="task-body">

        {task.imageUrl && (
          <img
            src={task.imageUrl}
            alt={task.title}
            className="task-image"
          />
        )}

        <h3>{task.title}</h3>

        {task.description && (
          <p>{task.description}</p>
        )}

        {showDate && (
          <small className="muted">
            {task.date}
          </small>
        )}

      </div>
      <div className="task-actions">
        <select value={task.status} onChange={(e) => onStatus(task, e.target.value)} aria-label="Task status">
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button className="btn small" onClick={() => onEdit(task)}>Edit</button>
        <button className="btn small danger" onClick={() => onDelete(task)}>Delete</button>
      </div>
    </li>
  );
}
