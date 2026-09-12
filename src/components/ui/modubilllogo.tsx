import React from "react";

export type LogoVariant = "full" | "icon" | "monochrome";

interface ModuBillLogoProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Mode tampilan logo:
   * - 'full': Icon + Text "ModuBill" (Default untuk Navbar & Sidebar)
   * - 'icon': Hanya Icon 3-baris (Favicon / App Icon / Collapsed Sidebar)
   * - 'monochrome': Versi hitam/gelap polos (Untuk watermark / thermal print)
   */
  variant?: LogoVariant;
  /** Tinggi/Ukuran Icon (default: 32) */
  size?: number;
  /** Class tambahan untuk pembungkus/SVG */
  className?: string;
}

export const ModuBillLogo: React.FC<ModuBillLogoProps> = ({
  variant = "full",
  size = 32,
  className = "",
  ...props
}) => {
  // Palette Warna sesuai PRD §9
  const COLOR_PRIMARY = "#2563EB"; // Biru
  const COLOR_ACCENT = "#F59E0B";  // Amber/Oranye
  const COLOR_DARK = "#0F172A";    // Slate Dark (Neutral Teks)

  // Penentuan Warna berdasarkan Varian (Flat Design)
  const isMono = variant === "monochrome";
  const leftBarColor = isMono ? COLOR_DARK : COLOR_PRIMARY;
  const centerTopColor = isMono ? COLOR_DARK : COLOR_ACCENT;
  const centerBottomColor = isMono ? COLOR_DARK : COLOR_PRIMARY;
  const rightBarColor = isMono ? COLOR_DARK : COLOR_PRIMARY;
  const textPrimaryColor = isMono ? COLOR_DARK : COLOR_DARK;
  const textAccentColor = isMono ? COLOR_DARK : COLOR_PRIMARY;

  // Render Hanya Ikon Vektor (Modular Bars)
  const renderIcon = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200"
      aria-label="ModuBill Icon"
      {...props}
    >
      {/* Batang Kiri */}
      <rect
        x="3"
        y="6"
        width="10"
        height="28"
        rx="3.5"
        fill={leftBarColor}
      />
      {/* Batang Tengah - Blok Atas (Aksen Modular) */}
      <rect
        x="15"
        y="6"
        width="10"
        height="7.5"
        rx="2.5"
        fill={centerTopColor}
      />
      {/* Batang Tengah - Blok Bawah */}
      <rect
        x="15"
        y="15.5"
        width="10"
        height="18.5"
        rx="3.5"
        fill={centerBottomColor}
      />
      {/* Batang Kanan */}
      <rect
        x="27"
        y="6"
        width="10"
        height="28"
        rx="3.5"
        fill={rightBarColor}
      />
    </svg>
  );

  // Jika opsi hanya 'icon', tampilkan SVG-nya saja
  if (variant === "icon") {
    return renderIcon();
  }

  // Varian 'full' & 'monochrome' (Ikon + Wordmark)
  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      style={{ minHeight: `${size}px` }}
    >
      {renderIcon()}

      {/* Wordmark Typographic "ModuBill" */}
      <span
        className="font-sans font-bold tracking-tight leading-none"
        style={{ fontSize: `${size * 0.85}px` }}
      >
        <span style={{ color: textPrimaryColor }}>Modu</span>
        <span style={{ color: textAccentColor }}>Bill</span>
      </span>
    </div>
  );
};

export default ModuBillLogo;