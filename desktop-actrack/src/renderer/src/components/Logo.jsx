const Logo = ({ className = "" }) => (
    <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <path d="M6 13.2c0-3.9 3.1-7 7-7s7 3.1 7 7" />
        <circle cx="13" cy="13.2" r="2.1" fill="currentColor" stroke="none" />
    </svg>
);

export default Logo;
