/** Soft CSS atmosphere shared by marketing pages — no WebGL veil. */
export function PageAtmosphere() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 bg-page-wash"
      aria-hidden
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.92 0.04 142 / 0.55), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 20%, oklch(0.94 0.03 85 / 0.35), transparent 50%)",
      }}
    />
  )
}
