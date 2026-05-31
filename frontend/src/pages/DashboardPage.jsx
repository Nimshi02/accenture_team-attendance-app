import BrandMark from "../components/BrandMark";

function DashboardPage({ session, onLogout }) {
  return (
    <main className="auth-shell">
      <section className="signed-in-panel" aria-labelledby="signed-in-title">
        <BrandMark className="brand-mark" />
        <h1 id="signed-in-title">Welcome back, {session.user.full_name}</h1>
        <p className="muted-copy">
          You are signed in. Your role is attached to your account automatically.
        </p>
        <button type="button" onClick={onLogout}>
          Sign out
        </button>
      </section>
    </main>
  );
}

export default DashboardPage;
