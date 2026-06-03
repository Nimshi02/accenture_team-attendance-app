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

const toDateInputValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return localDate.toISOString().slice(0, 10);
};

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
      </div>

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
            <span>Requesting Location</span>
            <select
              name="requested_location"
              onChange={handleFieldChange}
              required
              value={formValues.requested_location}
            >
              {locationOptions.map((location) => (
                <option key={location.value} value={location.value}>
                  {location.label}
                </option>
              ))}
            </select>
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

          <label className="work-location-field wide">
            <span>Description / Reason</span>
            <textarea
              name="description"
              onChange={handleFieldChange}
              placeholder="Add the reason for this location request."
              required
              rows="5"
              value={formValues.description}
            />
          </label>
        </div>

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

      <aside className="work-location-note" aria-label="Request note">
        <strong>Approval required</strong>
        <p>Your request will remain pending until a manager reviews it.</p>
      </aside>
    </section>
  );
}

export default WorkLocationPage;
