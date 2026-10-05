
import { useEffect, useState } from 'react';
import { STATUSES } from './TaskForm';

function TaskImage({ src, alt }) {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    let objectUrl;

    const loadImage = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(src, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load image');
        }

        const blob = await response.blob();

        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      } catch (error) {
        console.error('Task image loading failed:', error);
      }
    };

    if (src) {
      loadImage();
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (!imageSrc) return null;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className="task-image"
    />
  );
}

export default function TaskItem({
  task,
  showDate,
  onEdit,
  onDelete,
  onStatus,
}) {
  return (
    <li className={`task ${task.status}`}>

      <div className="task-body">

        {/* Small task image */}
        {task.imageUrl && (
          <TaskImage
            src={task.imageUrl}
            alt={task.title}
          />
        )}

        <div className="task-content">

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

      </div>

      <div className="task-actions">

        <select
          value={task.status}
          onChange={(e) =>
            onStatus(task, e.target.value)
          }
          aria-label="Task status"
        >
          {STATUSES.map((s) => (
            <option
              key={s.value}
              value={s.value}
            >
              {s.label}
            </option>
          ))}
        </select>

        <button
          className="btn small"
          onClick={() => onEdit(task)}
        >
          Edit
        </button>

        <button
          className="btn small danger"
          onClick={() => onDelete(task)}
        >
          Delete
        </button>

      </div>

    </li>
  );
}

