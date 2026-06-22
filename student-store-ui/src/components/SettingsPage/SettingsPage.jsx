import person from "../../assets/person.svg";
import "./SettingsPage.css";

// Settings is a non-functional, demo-only page. Every control is disabled and
// nothing is saved — it exists purely to round out the store's navigation with
// a realistic-looking settings screen.
function SettingsPage() {
  return (
    <div className="SettingsPage">
      <div className="content">
        <h1 className="title">Settings</h1>
        <p className="subtitle">Manage your profile and preferences.</p>

        <div className="settings-card">
          <div className="profile">
            <div className="avatar">
              <img src={person} alt="Profile" />
            </div>
            <div className="profile-meta">
              <span className="profile-name">Student User</span>
              <span className="profile-email">student@codepath.com</span>
            </div>
            <button type="button" className="ghost-button" disabled>
              Change photo
            </button>
          </div>

          <div className="section">
            <h2 className="section-title">Profile</h2>
            <div className="field-grid">
              <label className="field">
                <span>Full name</span>
                <input type="text" value="Student User" disabled />
              </label>
              <label className="field">
                <span>Student ID</span>
                <input type="text" value="101" disabled />
              </label>
              <label className="field">
                <span>Email</span>
                <input type="email" value="student@codepath.com" disabled />
              </label>
              <label className="field">
                <span>Campus</span>
                <input type="text" value="Main Campus" disabled />
              </label>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">Preferences</h2>
            <div className="toggle-row">
              <div className="toggle-text">
                <span className="toggle-label">Email notifications</span>
                <span className="toggle-desc">
                  Order updates and receipts sent to your inbox.
                </span>
              </div>
              <span className="toggle on" aria-hidden="true">
                <span className="knob" />
              </span>
            </div>
            <div className="toggle-row">
              <div className="toggle-text">
                <span className="toggle-label">Dark mode</span>
                <span className="toggle-desc">
                  Use a darker color theme across the store.
                </span>
              </div>
              <span className="toggle" aria-hidden="true">
                <span className="knob" />
              </span>
            </div>
          </div>

          <div className="card-footer">
            <button type="button" className="save-button" disabled>
              Save changes
            </button>
            <span className="demo-note">Demo only — settings are not saved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
