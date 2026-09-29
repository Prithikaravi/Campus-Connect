// Variants: primary (filled), secondary (outlined), soft (light blue), ghost
const styles = {
  primary: "bg-[#5877D9] text-white hover:bg-[#4a68c7] shadow-sm",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
  soft: "bg-[#EEF4FF] text-[#4a68c7] hover:bg-[#e2ebff]",
  ghost: "text-slate-600 hover:bg-slate-100",
};

export default function Button({ variant = "primary", className = "", full = false, children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5877D9] focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-60 ${full ? "w-full" : ""} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}