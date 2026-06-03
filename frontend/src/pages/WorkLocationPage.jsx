import { useState } from "react";
import { createWorkLocationRequest } from "../services/WorkLocationService";

const locationOptions = [
  { label: "Office", value: "Office" },
  { label: "Work From Home", value: "Home" },
  { label: "Client Site", value: "Client Site" },
];

const purposeOptions = [
  "Remote work",
  "Client visit",
  "Personal appointment",
  "Travel or transport issue",
  "Other",
];

const locationDetails = {
  Office: {
    icon: "O",
    note: "Use when you will be working from the main office.",
  },
  Home: {
    icon: "H",
    note: "Use when you need approval to work remotely.",
  },
  "Client Site": {
    icon: "C",
    note: "Use when your day is based at a client location.",
  },
};

const toDateInputValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return localDate.toISOString().slice(0, 10);
};

const formatRequestDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
  });

const displayLocation = (location) =>
  locationOptions.find((option) => option.value === location)?.label || location;

const initialFormValues = () => ({
  description: "",
  purpose: purposeOptions[0],
  request_date: toDateInputValue(new Date()),
  requested_location: "Home",
});

function WorkLocationPage({ session }) {
  const [error, setError] = useState("");
  const [formValues, setFormValues] = useState(initialFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const selectedLocation = locationDetails[formValues.requested_location];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await createWorkLocationRequest(session.token, formValues);
      setSuccessMessage("Work location request submitted successfully.");
      setFormValues(initialFormValues());
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Could not submit work location request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="work-location-page"
      aria-labelledby="work-location-title"
    >
      <div className="work-location-header">
        <div>
          <h1 id="work-location-title">Work Location Request</h1>
          <p>Request a temporary change to your planned work location.</p>
        </div>
        <span className="work-location-status">Manager review required</span>
      </div>

      <div className="work-location-shell">
        <form className="work-location-form" onSubmit={handleSubmit}>
          <div className="work-location-form-grid">
            <label className="work-location-field">
              <span>Requesting Date</span>
              <input
                name="request_date"
                onChange={handleFieldChange}
                required
                type="date"
                value={formValues.request_date}
              />
            </label>

            <label className="work-location-field">
              <span>Purpose</span>
              <select
                name="purpose"
                onChange={handleFieldChange}
                required
                value={formValues.purpose}
              >
                {purposeOptions.map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {purpose}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="work-location-picker">
            <span>Requesting Location</span>
            <div className="location-choice-grid" role="radiogroup">
              {locationOptions.map((location) => (
                <label
                  className={
                    formValues.requested_location === location.value
                      ? "location-choice selected"
                      : "location-choice"
                  }
                  key={location.value}
                >
                  <input
                    checked={formValues.requested_location === location.value}
                    name="requested_location"
                    onChange={handleFieldChange}
                    type="radio"
                    value={location.value}
                  />
                  <strong aria-hidden="true">
                    {locationDetails[location.value].icon}
                  </strong>
                  <span>{location.label}</span>
                  <small>{locationDetails[location.value].note}</small>
                </label>
              ))}
            </div>
          </div>

          <label className="work-location-field wide">
            <span>Description / Reason</span>
            <textarea
              name="description"
              onChange={handleFieldChange}
              placeholder="Add a short reason your manager can review."
              required
              rows="5"
              value={formValues.description}
            />
          </label>

          {error && <p className="form-error">{error}</p>}
          {successMessage && (
            <p className="work-location-success">{successMessage}</p>
          )}

          <div className="work-location-actions">
            <button
              className="profile-secondary-button"
              disabled={isSubmitting}
              onClick={() => {
                setError("");
                setSuccessMessage("");
                setFormValues(initialFormValues());
              }}
              type="button"
            >
              Clear
            </button>
            <button
              className="work-location-submit"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>

        <aside className="work-location-preview" aria-label="Request summary">
          <div className="preview-location-mark" aria-hidden="true">
            {selectedLocation.icon}
          </div>
          <p>Request summary</p>
          <h2>{displayLocation(formValues.requested_location)}</h2>
          <dl>
            <div>
              <dt>Date</dt>
              <dd>{formatRequestDate(formValues.request_date)}</dd>
            </div>
            <div>
              <dt>Purpose</dt>
              <dd>{formValues.purpose}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Pending manager review</dd>
            </div>
          </dl>
          <span>{selectedLocation.note}</span>
        </aside>
      </div>
    </section>
  );
}

export default WorkLocationPage;
