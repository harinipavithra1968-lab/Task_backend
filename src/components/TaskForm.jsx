import { useEffect, useState } from 'react';


export const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

// Used for both Add and Edit
export default function TaskForm({
  initial = {},
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    status: 'pending',
    ...initial,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(initial?.imageUrl || null);

  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // Update form when editing task changes
  useEffect(() => {
    setForm({
      title: '',
      description: '',
      date: '',
      status: 'pending',
      ...initial,
    });

    setImage(null);
    setPreview(initial?.imageUrl || null);
    setErrors({});
  }, [initial]);

  const set = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setImage(null);
      return;
    }

    // Allowed image types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors({
        image: 'Only JPG, JPEG, PNG and WebP images are allowed',
      });

      e.target.value = '';
      return;
    }

    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      setErrors({
        image: 'Image size must be 5 MB or less',
      });

      e.target.value = '';
      return;
    }

    setErrors((old) => ({
      ...old,
      image: '',
    }));

    setImage(file);

    // Create preview
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);

    const input = document.getElementById('task-image');

    if (input) {
      input.value = '';
    }
  };

  const submit = async (ev) => {
    ev.preventDefault();

    const err = {};

    if (!form.title.trim()) {
      err.title = 'Give the task a title';
    } else if (form.title.length > 100) {
      err.title =
        'Title must be 100 characters or fewer';
    }

    if (!form.date) {
      err.date = 'Pick a date';
    }

    if (form.description.length > 500) {
      err.description =
        'Description must be 500 characters or fewer';
    }

    if (image && image.size > 5 * 1024 * 1024) {
      err.image = 'Image size must be 5 MB or less';
    }

    setErrors(err);

    if (Object.keys(err).length) {
      return;
    }

    setBusy(true);

    try {
      // FormData is required for text + image
      const formData = new FormData();

      formData.append('title', form.title.trim());
      formData.append(
        'description',
        form.description.trim()
      );
      formData.append('date', form.date);
      formData.append('status', form.status);

      if (image) {
        formData.append('image', image);
      }

      await onSubmit(formData);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>

      {/* TITLE */}
      <label className="field">
        <span>Title</span>

        <input
          name="title"
          value={form.title}
          onChange={set}
          autoFocus
          aria-invalid={!!errors.title}
        />

        {errors.title && (
          <small className="error-text">
            {errors.title}
          </small>
        )}
      </label>

      {/* DESCRIPTION */}
      <label className="field">
        <span>Description</span>

        <textarea
          name="description"
          rows="3"
          value={form.description}
          onChange={set}
        />

        {errors.description && (
          <small className="error-text">
            {errors.description}
          </small>
        )}
      </label>

      {/* DATE + STATUS */}
      <div className="row">

        <label className="field">
          <span>Date</span>

          <input
            type="date"
            name="date"
            value={form.date || ''}
            onChange={set}
            aria-invalid={!!errors.date}
          />

          {errors.date && (
            <small className="error-text">
              {errors.date}
            </small>
          )}
        </label>

        <label className="field">
          <span>Status</span>

          <select
            name="status"
            value={form.status}
            onChange={set}
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
        </label>

      </div>
            {/* IMAGE UPLOAD */}
      <div className="field task-image-upload">
        <span>Task Image</span>

        <label htmlFor="task-image" className="image-upload-button">
          📷 Choose Image
        </label>

        <input
          id="task-image"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageChange}
          className="image-file-input"
        />

        <small>
          JPG, PNG or WebP · Maximum 5 MB
        </small>

        {errors.image && (
          <small className="error-text">
            {errors.image}
          </small>
        )}
      </div>

      {preview && (
        <div className="task-image-preview">
          <img
            src={preview}
            alt="Task preview"
          />

          <button
            type="button"
            onClick={removeImage}
            className="remove-image-button"
          >
            Remove image
          </button>
        </div>
      )}

 

      {/* IMAGE PREVIEW */}
      {preview && (
        <div
          style={{
            marginTop: '10px',
            position: 'relative',
          }}
        >
          <img
            src={preview}
            alt="Task preview"
            style={{
              width: '140px',
              height: '100px',
              objectFit: 'cover',
              borderRadius: '10px',
              border: '1px solid #ddd',
              display: 'block',
            }}
          />

          <button
            type="button"
            onClick={removeImage}
            style={{
              marginTop: '8px',
              border: 'none',
              background: '#f3f3f3',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Remove image
          </button>
        </div>
      )}

      {/* ACTIONS */}
      <div className="actions">

        <button
          type="button"
          className="btn"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </button>

        <button
          className="btn primary"
          disabled={busy}
        >
          {busy
            ? 'Saving...'
            : initial?._id
              ? 'Save changes'
              : 'Add task'}
        </button>

      </div>

    </form>
  );
}