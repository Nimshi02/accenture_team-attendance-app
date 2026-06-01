import { useEffect, useState } from "react";
import {
  getSchedule,
  updateRecurringSchedule,
} from "../services/scheduleService";

const dayLabels = {
  Friday: "Fri",
  Monday: "Mon",
  Saturday: "Sat",
  Sunday: "Sun",
  Thursday: "Thu",
  Tuesday: "Tue",
  Wednesday: "Wed",
};

const viewOptions = ["Week", "Month", "List"];
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const editableLocations = ["Office", "Home", "Client Site"];

const locationMeta = {
  "Client Site": {
    className: "client",
    label: "Client Site",
  },
  Home: {
    className: "home",
    label: "Work From Home",
  },
  Office: {
    className: "office",
    label: "Office",
  },
};

const toDateInputValue = (date) => date.toISOString().slice(0, 10);

const parseDateOnly = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const startOfWeek = (date) => {
  const weekStart = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
  const dayOffset = weekStart.getUTCDay() === 0 ? -6 : 1 - weekStart.getUTCDay();
  weekStart.setUTCDate(weekStart.getUTCDate() + dayOffset);

  return weekStart;
};

const formatShortDate = (value) =>
  parseDateOnly(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

const formatWeekRange = (start, end) => {
  if (!start || !end) {
    return "";
  }

  const startDate = parseDateOnly(start);
  const endDate = parseDateOnly(end);
  const sameMonth = startDate.getUTCMonth() === endDate.getUTCMonth();
  const sameYear = startDate.getUTCFullYear() === endDate.getUTCFullYear();

  const startLabel = startDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  const endLabel = endDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: sameMonth ? undefined : "short",
    timeZone: "UTC",
    year: sameYear ? undefined : "numeric",
  });

  return `${startLabel} - ${endLabel}, ${endDate.getUTCFullYear()}`;
};

const formatMonthTitle = (value) => {
  if (!value) {
    return "";
  }

  return parseDateOnly(value).toLocaleDateString(undefined, {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });
};

function ScheduleLocationIcon({ location }) {
  const className = locationMeta[location]?.className || "empty";

  if (location === "Office") {
    return (
      <svg className={`my-schedule-icon ${className}`} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 21V5l9-2v18" />
        <path d="M14 8h5v13" />
        <path d="M8 9h2M8 13h2M8 17h2M17 12h1M17 16h1" />
      </svg>
    );
  }

  if (location === "Home") {
    return (
      <svg className={`my-schedule-icon ${className}`} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 11.5 12 5l8 6.5" />
        <path d="M6.5 10.5V21h11V10.5" />
        <path d="M10 21v-6h4v6" />
      </svg>
    );
  }

  if (location === "Client Site") {
    return (
      <svg className={`my-schedule-icon ${className}`} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s6-4.8 6-10a6 6 0 0 0-12 0c0 5.2 6 10 6 10Z" />
        <path d="M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    );
  }

  return (
    <svg className="my-schedule-icon empty" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 12h8" />
    </svg>
  );
}

function MySchedulePage({ session }) {
  const [activeView, setActiveView] = useState("Week");
  const [draftRecurringSchedule, setDraftRecurringSchedule] = useState([]);
  const [error, setError] = useState("");
  const [isEditingRecurring, setIsEditingRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingRecurring, setIsSavingRecurring] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [weekStart, setWeekStart] = useState(() => toDateInputValue(startOfWeek(new Date())));

  const createDraftSchedule = (scheduleData) =>
    weekdays.map((dayName) => {
      const day = scheduleData.days.find((scheduleDay) => scheduleDay.day_name === dayName);

      return {
        day_of_week: dayName,
        location_name: day?.planned_location || "Office",
      };
    });

  useEffect(() => {
    let isMounted = true;

    const loadSchedule = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getSchedule(
          session.token,
          weekStart,
          activeView === "Month" ? "month" : "week"
        );

        if (isMounted) {
          setSchedule(data);
          setDraftRecurringSchedule(createDraftSchedule(data));
          setIsEditingRecurring(false);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.error || "Could not load schedule");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSchedule();

    return () => {
      isMounted = false;
    };
  }, [activeView, session.token, weekStart]);

  const movePeriod = (direction) => {
    const nextDate = parseDateOnly(weekStart);

    if (activeView === "Month") {
      nextDate.setUTCMonth(nextDate.getUTCMonth() + direction);
      nextDate.setUTCDate(1);
    } else {
      nextDate.setUTCDate(nextDate.getUTCDate() + direction * 7);
    }

    setWeekStart(toDateInputValue(nextDate));
  };

  const handleDatePick = (event) => {
    const selectedDate = parseDateOnly(event.target.value);
    const nextDate = activeView === "Month"
      ? new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), 1))
      : startOfWeek(selectedDate);

    setWeekStart(toDateInputValue(nextDate));
  };

  const handleEditRecurring = () => {
    setDraftRecurringSchedule(createDraftSchedule(schedule));
    setError("");
    setSuccessMessage("");
    setIsEditingRecurring(true);
  };

  const handleCancelRecurring = () => {
    setDraftRecurringSchedule(createDraftSchedule(schedule));
    setError("");
    setSuccessMessage("");
    setIsEditingRecurring(false);
  };

  const handleRecurringChange = (dayName, locationName) => {
    setDraftRecurringSchedule((currentSchedule) =>
      currentSchedule.map((item) =>
        item.day_of_week === dayName
          ? { ...item, location_name: locationName }
          : item
      )
    );
  };

  const handleSaveRecurring = async () => {
    setError("");
    setSuccessMessage("");
    setIsSavingRecurring(true);

    try {
      const updatedSchedule = await updateRecurringSchedule(
        session.token,
        draftRecurringSchedule,
        weekStart,
        activeView === "Month" ? "month" : "week"
      );
      setSchedule(updatedSchedule);
      setDraftRecurringSchedule(createDraftSchedule(updatedSchedule));
      setIsEditingRecurring(false);
      setSuccessMessage("Recurring schedule updated successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || "Could not update recurring schedule"
      );
    } finally {
      setIsSavingRecurring(false);
    }
  };

  const renderDayCard = (day) => {
    const location = day.planned_location;
    const meta = locationMeta[location];
    const className = meta?.className || "empty";

    return (
      <article className={`schedule-day-card ${className}`} key={day.date}>
        <div className="schedule-day-heading">
          <strong>{dayLabels[day.day_name]}</strong>
          <span>{formatShortDate(day.date)}</span>
        </div>
        <ScheduleLocationIcon location={location} />
        <h2>{meta?.label || "-"}</h2>
        <p>{day.schedule_type || "-"}</p>
      </article>
    );
  };

  const monthGroups = schedule?.days
    ? schedule.days.reduce((groups, day) => {
        const date = parseDateOnly(day.date);
        const monthLabel = date.toLocaleDateString(undefined, {
          month: "long",
          timeZone: "UTC",
          year: "numeric",
        });

        return {
          ...groups,
          [monthLabel]: [...(groups[monthLabel] || []), day],
        };
      }, {})
    : {};

  return (
    <section className="my-schedule-page" aria-labelledby="my-schedule-title">
      <div className="my-schedule-header">
        <div>
          <h1 id="my-schedule-title">My Schedule</h1>
          <p>View your planned work locations for the selected week.</p>
        </div>
      </div>

      <div className="schedule-toolbar">
        <button
          aria-label="Previous week"
          className="schedule-arrow-button"
          onClick={() => movePeriod(-1)}
          type="button"
        >
          <span aria-hidden="true">&lt;</span>
        </button>
        <strong>
          {schedule
            ? activeView === "Month"
              ? formatMonthTitle(schedule.period_start)
              : formatWeekRange(schedule.week_start, schedule.week_end)
            : "Loading..."}
        </strong>
        <button
          aria-label="Next week"
          className="schedule-arrow-button"
          onClick={() => movePeriod(1)}
          type="button"
        >
          <span aria-hidden="true">&gt;</span>
        </button>
        <label className="schedule-date-picker" aria-label="Choose week">
          <input onChange={handleDatePick} type="date" value={weekStart} />
        </label>
      </div>

      <div className="schedule-view-tabs" role="tablist" aria-label="Schedule view">
        {viewOptions.map((view) => (
          <button
            className={activeView === view ? "schedule-view-tab active" : "schedule-view-tab"}
            key={view}
            onClick={() => setActiveView(view)}
            type="button"
          >
            {view}
          </button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}
      {successMessage && <p className="schedule-success">{successMessage}</p>}

      {isLoading ? (
        <p className="profile-status">Loading schedule...</p>
      ) : (
        <>
          {activeView === "Week" && (
            <div className="schedule-week-grid">
              {schedule.days.map(renderDayCard)}
            </div>
          )}

          {activeView === "Month" && (
            <div className="schedule-list-panel">
              {Object.entries(monthGroups).map(([month, days]) => (
                <section className="schedule-month-group" key={month}>
                  <h2>{month}</h2>
                  <div className="schedule-compact-grid">
                    {days.map(renderDayCard)}
                  </div>
                </section>
              ))}
            </div>
          )}

          {activeView === "List" && (
            <div className="schedule-list-panel">
              {schedule.days.map((day) => (
                <article className="schedule-list-row" key={day.date}>
                  <ScheduleLocationIcon location={day.planned_location} />
                  <div>
                    <h2>{day.day_name}, {formatShortDate(day.date)}</h2>
                    <p>{locationMeta[day.planned_location]?.label || "No planned work"}</p>
                  </div>
                  <span>{day.schedule_type || "-"}</span>
                </article>
              ))}
            </div>
          )}

          <section className="recurring-schedule-card" aria-labelledby="recurring-schedule-title">
            <div className="panel-heading">
              <h2 id="recurring-schedule-title">Recurring Schedule</h2>
              {isEditingRecurring ? (
                <div className="recurring-edit-actions">
                  <button
                    className="profile-secondary-button"
                    disabled={isSavingRecurring}
                    onClick={handleCancelRecurring}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="profile-edit-button"
                    disabled={isSavingRecurring}
                    onClick={handleSaveRecurring}
                    type="button"
                  >
                    {isSavingRecurring ? "Saving..." : "Save"}
                  </button>
                </div>
              ) : (
                <button className="text-button" onClick={handleEditRecurring} type="button">
                  Edit
                </button>
              )}
            </div>

            {isEditingRecurring ? (
              <div className="recurring-editor">
                {draftRecurringSchedule.map((item) => (
                  <label className="recurring-editor-row" key={item.day_of_week}>
                    <span>{item.day_of_week}</span>
                    <select
                      onChange={(event) =>
                        handleRecurringChange(item.day_of_week, event.target.value)
                      }
                      value={item.location_name}
                    >
                      {editableLocations.map((location) => (
                        <option key={location} value={location}>
                          {locationMeta[location]?.label || location}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            ) : (
              <div className="recurring-schedule-list">
                {schedule.recurring.map((item) => (
                  <article className="recurring-schedule-row" key={item.location_name}>
                    <ScheduleLocationIcon location={item.location_name} />
                    <strong>
                      Every {item.days_of_week.join(", ")}
                    </strong>
                    <span>{locationMeta[item.location_name]?.label || item.location_name}</span>
                  </article>
                ))}
              </div>
            )}
          </section>

          <p className="schedule-note">
            Schedules are based on your planned work locations. Changes may affect attendance.
          </p>
        </>
      )}
    </section>
  );
}

export default MySchedulePage;
