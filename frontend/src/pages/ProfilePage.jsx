import { useEffect, useState } from "react";
import { updateStoredSessionUser } from "../services/authService";
import { getProfile, updateProfile } from "../services/profileService";

const editableFields = [
  "full_name",
  "phone_number",
  "date_of_birth",
  "address",
];

const formatDate = (value) => {
  if (!value) {
    return "Not provided";
  }

  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatEmployeeId = (value) => {
  if (!value) {
    return "Not provided";
  }

  return `EMP${String(value).padStart(4, "0")}`;
};

const toDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
};

const createFormState = (profile) =>
  editableFields.reduce(
    (formState, field) => ({
      ...formState,
      [field]:
        field === "date_of_birth" || field === "date_of_joining"
          ? toDateInputValue(profile[field])
          : profile[field] || "",
    }),
    {}
  );

const roleLabel = (value) => {
  if (!value) {
    return "Employee";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

function DetailItem({ label, value }) {
  return (
    <div className="profile-detail-item">
      <dt>{label}</dt>
      <dd>{value || "Not provided"}</dd>
    </div>
  );
}

function EditableField({
  isEditing,
  label,
  name,
  onChange,
  type = "text",
  value,
  viewValue,
}) {
  if (!isEditing) {
    return <DetailItem label={label} value={viewValue ?? value} />;
  }

  return (
    <label className="profile-form-field">
      <span>{label}</span>
      {type === "textarea" ? (
        <textarea name={name} onChange={onChange} rows="3" value={value} />
      ) : (
        <input name={name} onChange={onChange} type={type} value={value} />
      )}
    </label>
  );
}

function ProfilePage({ onSessionUpdate, session }) {
  const [error, setError] = useState("");
  const [formValues, setFormValues] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getProfile(session.token);

        if (isMounted) {
          setProfile(data);
          setFormValues(createFormState(data));
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.error || "Could not load profile");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [session.token]);

  if (isLoading) {
    return <p className="profile-status">Loading profile...</p>;
  }

  if (error && !profile) {
    return <p className="form-error">{error}</p>;
  }

  if (!profile) {
    return <p className="profile-status">No profile details found.</p>;
  }

  const handleEdit = () => {
    setFormValues(createFormState(profile));
    setError("");
    setSuccessMessage("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormValues(createFormState(profile));
    setError("");
    setSuccessMessage("");
    setIsEditing(false);
  };

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
    setIsSaving(true);

    try {
      const updatedProfile = await updateProfile(session.token, formValues);
      setProfile(updatedProfile);
      setFormValues(createFormState(updatedProfile));
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully.");

      const updatedSession = updateStoredSessionUser({
        full_name: updatedProfile.full_name,
      });

      if (updatedSession) {
        onSessionUpdate(updatedSession);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = profile.full_name
    .split(" ")
    .map((namePart) => namePart[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <form onSubmit={handleSubmit}>
        <div className="profile-header">
          <div className="profile-identity">
            <span className="profile-avatar" aria-hidden="true">
              {initials}
            </span>
            <div>
              {isEditing ? (
                <label className="profile-name-field">
                  <span>Full Name</span>
                  <input
                    name="full_name"
                    onChange={handleFieldChange}
                    required
                    type="text"
                    value={formValues.full_name}
                  />
                </label>
              ) : (
                <h1 id="profile-title">{profile.full_name}</h1>
              )}
              <p>{roleLabel(profile.role)}</p>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </div>
          </div>

          {isEditing ? (
            <div className="profile-form-actions">
              <button
                className="profile-secondary-button"
                disabled={isSaving}
                onClick={handleCancel}
                type="button"
              >
                Cancel
              </button>
              <button className="profile-edit-button" disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          ) : (
            <button className="profile-edit-button" onClick={handleEdit} type="button">
              Edit Profile
            </button>
          )}
        </div>

        {successMessage && <p className="profile-success">{successMessage}</p>}
        {error && <p className="form-error">{error}</p>}

        <div className="profile-card-grid">
          <section className="profile-card" aria-labelledby="personal-info-title">
            <h2 id="personal-info-title">Personal Information</h2>
            {isEditing ? (
              <div className="profile-form-grid">
                <DetailItem label="Employee ID" value={formatEmployeeId(profile.employee_id)} />
                <EditableField
                  isEditing={isEditing}
                  label="Phone Number"
                  name="phone_number"
                  onChange={handleFieldChange}
                  value={formValues.phone_number}
                  viewValue={profile.phone_number}
                />
                <EditableField
                  isEditing={isEditing}
                  label="Date of Birth"
                  name="date_of_birth"
                  onChange={handleFieldChange}
                  type="date"
                  value={formValues.date_of_birth}
                  viewValue={formatDate(profile.date_of_birth)}
                />
                <EditableField
                  isEditing={isEditing}
                  label="Address"
                  name="address"
                  onChange={handleFieldChange}
                  type="textarea"
                  value={formValues.address}
                  viewValue={profile.address}
                />
              </div>
            ) : (
              <dl>
                <DetailItem label="Employee ID" value={formatEmployeeId(profile.employee_id)} />
                <EditableField
                  isEditing={isEditing}
                  label="Phone Number"
                  name="phone_number"
                  onChange={handleFieldChange}
                  value={formValues.phone_number}
                  viewValue={profile.phone_number}
                />
                <EditableField
                  isEditing={isEditing}
                  label="Date of Birth"
                  name="date_of_birth"
                  onChange={handleFieldChange}
                  type="date"
                  value={formValues.date_of_birth}
                  viewValue={formatDate(profile.date_of_birth)}
                />
                <EditableField
                  isEditing={isEditing}
                  label="Address"
                  name="address"
                  onChange={handleFieldChange}
                  type="textarea"
                  value={formValues.address}
                  viewValue={profile.address}
                />
              </dl>
            )}
          </section>

          <section className="profile-card" aria-labelledby="work-info-title">
            <h2 id="work-info-title">Work Information</h2>
            {isEditing ? (
              <div className="profile-form-grid">
                <DetailItem label="Department" value={profile.department} />
                <DetailItem label="Designation" value={profile.designation} />
                <DetailItem label="Manager" value={profile.manager_name} />
                <DetailItem
                  label="Date of Joining"
                  value={formatDate(profile.date_of_joining)}
                />
              </div>
            ) : (
              <dl>
                <EditableField
                  isEditing={isEditing}
                  label="Department"
                  name="department"
                  onChange={handleFieldChange}
                  value={formValues.department}
                  viewValue={profile.department}
                />
                <EditableField
                  isEditing={isEditing}
                  label="Designation"
                  name="designation"
                  onChange={handleFieldChange}
                  value={formValues.designation}
                  viewValue={profile.designation}
                />
                <DetailItem label="Manager" value={profile.manager_name} />
                <EditableField
                  isEditing={isEditing}
                  label="Date of Joining"
                  name="date_of_joining"
                  onChange={handleFieldChange}
                  type="date"
                  value={formValues.date_of_joining}
                  viewValue={formatDate(profile.date_of_joining)}
                />
              </dl>
            )}
          </section>
        </div>
      </form>
    </section>
  );
}

export default ProfilePage;
