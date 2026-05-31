function BrandMark({ className = "brand-row" }) {
  return (
    <div className={className}>
      <span className="brand-icon" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>Team Attendance App</span>
    </div>
  );
}

export default BrandMark;
