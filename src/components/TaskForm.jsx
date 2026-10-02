import { useState } from 'react';

export const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

// Used for both "add" and "edit" (initial._id exists only when editing)
export default function TaskForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({ title: '', description: '', status: 'pending', ...initial });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (ev) => {
    ev.preventDefault();
    const err = {};
    if (!form.title.trim()) err.title = 'Give the task a title';
    else if (form.title.length > 100) err.title = 'Title must be 100 characters or fewer';
    if (!form.date) err.date = 'Pick a date';
    if (form.description.length > 500) err.description = 'Description must be 500 characters or fewer';
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    await onSubmit({ title: form.title.trim(), description: form.description.trim(), date: form.date, status: form.status });
    setBusy(false);
  };

  return (
    <form onSubmit={submit} noValidate>
      <label className="field">
        <span>Title</span>
        <input name="title" value={form.title} onChange={set} autoFocus aria-invalid={!!errors.title} />
        {errors.title && <small className="error-text">{errors.title}</small>}
      </label>
      <label className="field">
        <span>Description</span>
        <textarea name="description" rows="3" value={form.description} onChange={set} />
        {errors.description && <small className="error-text">{errors.description}</small>}
      </label>
      <div className="row">
        <label className="field">
          <span>Date</span>
          <input type="date" name="date" value={form.date} onChange={set} aria-invalid={!!errors.date} />
          {errors.date && <small className="error-text">{errors.date}</small>}
        </label>
        <label className="field">
          <span>Status</span>
          <select name="status" value={form.status} onChange={set}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
      </div>
      <div className="actions">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn primary" disabled={busy}>{initial._id ? 'Save changes' : 'Add task'}</button>
      </div>
    </form>
  );
}
