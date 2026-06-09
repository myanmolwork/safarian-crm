const GlassCard = ({
  children,
  className = "",
  variant   = "default",
  hover     = false,
  onClick,
}) => {
  const variants = {
    // Standard surface card — used for most panels and sections
    default: `
      bg-[#1A1A24]
      border border-white/[0.07]
    `,
    // Slightly elevated — used for nested cards inside panels
    elevated: `
      bg-[#1E1E2E]
      border border-white/[0.09]
      shadow-lg shadow-black/20
    `,
    // Accent-tinted — used for highlighted or featured content
    accent: `
      bg-[#5B73FF]/[0.07]
      border border-[#5B73FF]/[0.18]
    `,
    // Success-tinted — used for completed states or positive metrics
    success: `
      bg-[#22C97B]/[0.07]
      border border-[#22C97B]/[0.18]
    `,
    // Warning-tinted — used for pending or at-risk states
    warning: `
      bg-[#F59E0B]/[0.07]
      border border-[#F59E0B]/[0.18]
    `,
    // Danger-tinted — used for errors or overdue states
    danger: `
      bg-[#F43F5E]/[0.07]
      border border-[#F43F5E]/[0.18]
    `,
    // Ghost — transparent with a subtle border, used for empty states
    ghost: `
      bg-transparent
      border border-dashed border-white/[0.08]
    `,
  };

  const hoverStyles = hover || onClick
    ? "hover:border-white/[0.14] hover:bg-white/[0.03] transition-colors duration-150 cursor-pointer"
    : "";

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={`
        rounded-xl
        ${variants[variant] ?? variants.default}
        ${hoverStyles}
        ${className}
      `}
    >
      {children}
    </Tag>
  );
};

export default GlassCard;