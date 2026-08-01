const PATHS = {
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-4 3.5-6.5 7.5-6.5S19.5 16 19.5 20" />
    </>
  ),
  phone: (
    <path d="M6.5 3.5h2.3l1 4-1.8 1.8c1 2.3 2.7 4 5 5l1.8-1.8 4 1v2.3c0 1.1-.9 2.2-2.1 2.1-6.6-.4-11.8-5.6-12.2-12.2-.1-1.2 1-2.1 2-2.1Z" />
  ),
  pin: (
    <>
      <path d="M12 21s6.5-6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.2" />
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
  tag: (
    <>
      <path d="M20 12.8 12.3 20.5a1.5 1.5 0 0 1-2.1 0l-6.7-6.7a1.5 1.5 0 0 1 0-2.1L11.2 4h6.3A2.5 2.5 0 0 1 20 6.5v6.3Z" />
      <circle cx="15.2" cy="8.8" r="1.1" />
    </>
  ),
  note: (
    <>
      <rect x="4" y="4" width="16" height="14" rx="2" />
      <path d="M7.5 20 10 18h1" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M6.5 14.5h3" />
    </>
  ),
  box: (
    <>
      <path d="M3.5 8 12 4l8.5 4-8.5 4-8.5-4Z" />
      <path d="M3.5 8v8l8.5 4 8.5-4V8" />
      <path d="M12 12v8" />
    </>
  ),
  spark: (
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  ),
};

const Icon = ({ name, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {PATHS[name] || null}
  </svg>
);

export default Icon;
