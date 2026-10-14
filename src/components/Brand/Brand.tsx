export const Brand = ({ size = 28 }: { size?: number }) => (
  <>
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 16c3.5-1.5 5.5-6 6-12 4 2.5 7 7 8 12" />
      <path d="M2 20c2 0 2.5-1.5 5-1.5s3 1.5 5 1.5 2.5-1.5 5-1.5 3 1.5 5 1.5" />
    </svg>
    <span>
      sharkies<span className="brand-dot">.</span>
    </span>
  </>
);
