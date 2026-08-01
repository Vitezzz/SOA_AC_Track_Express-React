const PATHS = {
  home: (
    <path d="M4 11.5 12 4l8 7.5M6 10.2V20h4.5v-5h3v5H18v-9.8" />
  ),
  list: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M15.2 19c0-2.1 1-3.9 2.8-4.5" />
    </>
  ),
  tag: (
    <>
      <path d="M20 12.8 12.3 20.5a1.5 1.5 0 0 1-2.1 0l-6.7-6.7a1.5 1.5 0 0 1 0-2.1L11.2 4h6.3A2.5 2.5 0 0 1 20 6.5v6.3Z" />
      <circle cx="15.2" cy="8.8" r="1.1" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M6.5 14.5h3" />
    </>
  ),
  wrench: (
    <path d="M14.5 6.2a3.8 3.8 0 0 0-5 5L4 16.7 7.3 20l5.5-5.5a3.8 3.8 0 0 0 5-5l-2 2-2-2Z" />
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3.2v4M16 3.2v4M3.5 9.5h17" />
    </>
  ),
  box: (
    <>
      <path d="M3.5 8 12 4l8.5 4-8.5 4-8.5-4Z" />
      <path d="M3.5 8v8l8.5 4 8.5-4V8" />
      <path d="M12 12v8" />
    </>
  ),
  settings: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="9" cy="6" r="1.8" />
      <circle cx="15" cy="12" r="1.8" />
      <circle cx="7" cy="18" r="1.8" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.35-4.35" />
    </>
  ),
  warning: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v6" />
      <circle cx="12" cy="16.3" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
};

const Icon = ({ name, className = "", style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon ${className}`}
    style={style}
    aria-hidden="true"
  >
    {PATHS[name] || null}
  </svg>
);

export default Icon;
