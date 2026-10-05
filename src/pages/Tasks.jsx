import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { today, prettyDate } from "../utils/date";
import Calendar from "../components/Calendar";
import TaskForm from "../components/TaskForm";
import TaskItem from "../components/TaskItem";

export default function Tasks() {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(today());
  const [showAll, setShowAll] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load tasks
  useEffect(() => {
    api("/tasks")
      .then(setTasks)
      .catch((error) => {
        setNotice({
          type: "error",
          text: error.message,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // Show notification
  const showMessage = (type, text) => {
    setNotice({ type, text });

    setTimeout(() => {
      setNotice(null);
    }, 2500);
  };

  // Count tasks by date
  const counts = useMemo(() => {
    return tasks.reduce((result, task) => {
      result[task.date] = (result[task.date] || 0) + 1;
      return result;
    }, {});
  }, [tasks]);

  // Statistics
  const statistics = useMemo(() => {
    const completed = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    const progress = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;

    const pending = tasks.filter(
      (task) => task.status === "pending"
    ).length;

    const percentage = tasks.length
      ? Math.round((completed / tasks.length) * 100)
      : 0;

    return {
      total: tasks.length,
      completed,
      progress,
      pending,
      percentage,
    };
  }, [tasks]);

  // Search + date + status filtering
  const visibleTasks = useMemo(() => {
    let result = showAll
      ? tasks
      : tasks.filter((task) => task.date === selected);

    if (statusFilter !== "all") {
      result = result.filter(
        (task) => task.status === statusFilter
      );
    }

    if (search.trim()) {
      const text = search.toLowerCase();

      result = result.filter(
        (task) =>
          task.title?.toLowerCase().includes(text) ||
          task.description?.toLowerCase().includes(text)
      );
    }

    return result;
  }, [
    tasks,
    selected,
    showAll,
    statusFilter,
    search,
  ]);

  // =========================================================
  // CREATE / EDIT TASK
  // =========================================================
  const saveTask = async (formData) => {
    try {
      const token = localStorage.getItem("token");

      const apiUrl =
        import.meta.env.VITE_API_URL || "/api";

      let url;
      let method;

      // EDIT
      if (editing?._id) {
        url = `${apiUrl}/tasks/${editing._id}`;
        method = "PUT";
      }

      // CREATE
      else {
        url = `${apiUrl}/tasks`;
        method = "POST";
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },

        // IMPORTANT:
        // Do not add Content-Type here.
        // Browser automatically sets multipart/form-data.
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save task"
        );
      }

      // =====================================================
      // EDIT EXISTING TASK
      // =====================================================
      if (editing?._id) {
        setTasks((oldTasks) =>
          oldTasks.map((task) =>
            task._id === data._id
              ? data
              : task
          )
        );

        showMessage(
          "success",
          "Task updated successfully"
        );
      }

      // =====================================================
      // CREATE NEW TASK
      // =====================================================
      else {
        setTasks((oldTasks) => [
          ...oldTasks,
          data,
        ]);

        setSelected(data.date);
        setShowAll(false);

        showMessage(
          "success",
          "New task created successfully"
        );
      }

      // Close modal
      setEditing(null);
    } catch (error) {
      console.error("Task save error:", error);

      showMessage(
        "error",
        error.message || "Failed to save task"
      );

      // Tell TaskForm that saving failed
      throw error;
    }
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================
  const updateStatus = async (task, status) => {
    try {
      const updated = await api(
        `/tasks/${task._id}`,
        {
          method: "PUT",
          body: { status },
        }
      );

      setTasks((oldTasks) =>
        oldTasks.map((item) =>
          item._id === updated._id
            ? updated
            : item
        )
      );

      showMessage(
        "success",
        "Task status updated"
      );
    } catch (error) {
      showMessage(
        "error",
        error.message
      );
    }
  };

  // =========================================================
  // DELETE TASK
  // =========================================================
  const deleteTask = async (task) => {
    const confirmDelete = window.confirm(
      `Delete "${task.title}"?`
    );

    if (!confirmDelete) return;

    try {
      await api(`/tasks/${task._id}`, {
        method: "DELETE",
      });

      setTasks((oldTasks) =>
        oldTasks.filter(
          (item) => item._id !== task._id
        )
      );

      showMessage(
        "success",
        "Task deleted"
      );
    } catch (error) {
      showMessage(
        "error",
        error.message
      );
    }
  };

  // Current hour
  const hour = new Date().getHours();

  // Greeting
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="creative-task-page">

      {/* =====================================================
          TOP NAVIGATION
      ====================================================== */}
      <header className="task-navbar">

        <div className="task-brand">

          <div className="task-logo">
            ✓
          </div>

          <div>
            <h1>TaskDesk</h1>
            <span>
              Smart task management
            </span>
          </div>

        </div>

        <div className="nav-user">

          <div className="user-avatar">
            {user?.username
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          <div className="user-details">
            <strong>
              {user?.username || "User"}
            </strong>

            <span>
              My workspace
            </span>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =====================================================
          NOTIFICATION
      ====================================================== */}
      {notice && (
        <div
          className={`task-notification ${notice.type}`}
        >
          <span>
            {notice.type === "success"
              ? "✓"
              : "!"}
          </span>

          {notice.text}
        </div>
      )}

      <main className="task-container">

        {/* ===================================================
            HERO
        ==================================================== */}
        <section className="task-hero">

          <div className="hero-content">

            <span className="hero-label">
              YOUR PRODUCTIVITY HUB
            </span>

            <h2>
              {greeting},{" "}
              {user?.username || "there"} 👋
            </h2>

            <p>
              Organize your work, focus on
              what matters, and get things
              done.
            </p>

            <button
              className="hero-button"
              onClick={() =>
                setEditing({
                  date: selected,
                })
              }
            >
              <span>+</span>
              Create New Task
            </button>

          </div>

          <div className="hero-decoration">

            <div className="circle circle-one" />
            <div className="circle circle-two" />

            <div className="hero-card-mini">

              <span>
                Today's progress
              </span>

              <strong>
                {statistics.percentage}%
              </strong>

              <div className="mini-progress">
                <div
                  style={{
                    width: `${statistics.percentage}%`,
                  }}
                />
              </div>

              <small>
                Keep going!
              </small>

            </div>

          </div>

        </section>

        {/* ===================================================
            STATISTICS
        ==================================================== */}
        <section className="task-statistics">

          <div className="stat-box purple">

            <div className="stat-symbol">
              ◈
            </div>

            <div>
              <span>
                Total Tasks
              </span>

              <strong>
                {statistics.total}
              </strong>
            </div>

          </div>

          <div className="stat-box orange">

            <div className="stat-symbol">
              ◷
            </div>

            <div>
              <span>
                Pending
              </span>

              <strong>
                {statistics.pending}
              </strong>
            </div>

          </div>

          <div className="stat-box blue">

            <div className="stat-symbol">
              ◌
            </div>

            <div>
              <span>
                In Progress
              </span>

              <strong>
                {statistics.progress}
              </strong>
            </div>

          </div>

          <div className="stat-box green">

            <div className="stat-symbol">
              ✓
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {statistics.completed}
              </strong>
            </div>

          </div>

        </section>

        {/* ===================================================
            MAIN CONTENT
        ==================================================== */}
        <section className="task-workspace">

          {/* =================================================
              CALENDAR
          ================================================== */}
          <aside className="calendar-section">

            <div className="section-heading">

              <div>

                <span>
                  PLAN AHEAD
                </span>

                <h3>
                  Calendar
                </h3>

              </div>

              <div className="calendar-count">
                {Object.keys(counts).length}
              </div>

            </div>

            <Calendar
              selected={selected}
              onSelect={(date) => {
                setSelected(date);
                setShowAll(false);
                setStatusFilter("all");
              }}
              counts={counts}
            />

            <div className="calendar-message">

              <div className="calendar-message-icon">
                ✦
              </div>

              <div>

                <strong>
                  Stay organized
                </strong>

                <p>
                  Select a date to see
                  your scheduled tasks.
                </p>

              </div>

            </div>

          </aside>

          {/* =================================================
              TASK LIST
          ================================================== */}
          <section className="tasks-section">

            <div className="tasks-header">

              <div>

                <span>
                  TASK MANAGEMENT
                </span>

                <h3>
                  {showAll
                    ? "All Your Tasks"
                    : "Today's Focus"}
                </h3>

                <p>
                  {showAll
                    ? "Everything you have planned"
                    : prettyDate(selected)}
                </p>

              </div>

              <button
                className="switch-view"
                onClick={() =>
                  setShowAll(!showAll)
                }
              >
                {showAll
                  ? "Selected Day"
                  : "View All Tasks"}

                <span>
                  →
                </span>
              </button>

            </div>

            {/* SEARCH + FILTER */}
            <div className="task-controls">

              <div className="task-search">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="task-filter"
              >

                <option value="all">
                  All Tasks
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="in-progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>

              </select>

              <button
                className="add-task-small"
                onClick={() =>
                  setEditing({
                    date: selected,
                  })
                }
              >
                + Add
              </button>

            </div>

            {/* =================================================
                TASKS
            ================================================== */}
            {loading ? (

              <div className="creative-empty">

                <div className="loading-circle" />

                <h3>
                  Loading your tasks...
                </h3>

              </div>

            ) : visibleTasks.length === 0 ? (

              <div className="creative-empty">

                <div className="empty-illustration">
                  ✓
                </div>

                <h3>
                  Nothing here yet
                </h3>

                <p>
                  Create a task and start
                  making progress.
                </p>

                <button
                  className="hero-button"
                  onClick={() =>
                    setEditing({
                      date: selected,
                    })
                  }
                >
                  + Create Task
                </button>

              </div>

            ) : (

              <ul className="creative-task-list">

                {visibleTasks.map((task) => (

                  <TaskItem
                    key={task._id}
                    task={task}
                    showDate={showAll}
                    onEdit={setEditing}
                    onDelete={deleteTask}
                    onStatus={updateStatus}
                  />

                ))}

              </ul>

            )}

          </section>

        </section>

      </main>

      {/* =====================================================
          ADD / EDIT TASK MODAL
      ====================================================== */}
      {editing && (

        <div
          className="creative-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setEditing(null);
            }
          }}
        >

          <div className="creative-modal">

            <div className="modal-top">

              <div>

                <span>
                  TASK CREATOR
                </span>

                <h2>
                  {editing._id
                    ? "Edit Task"
                    : "Create New Task"}
                </h2>

              </div>

              <button
                onClick={() =>
                  setEditing(null)
                }
                className="close-modal"
              >
                ×
              </button>

            </div>

            <TaskForm
              initial={editing}
              onSubmit={saveTask}
              onCancel={() =>
                setEditing(null)
              }
            />

          </div>

        </div>

      )}

    </div>
  );
}