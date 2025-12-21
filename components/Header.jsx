export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid #1f2937",
        backgroundColor: "#0b1220",
      }}
    >
      <img
        src="/logo.png"
        alt="Liquity BOLD"
        style={{ height: "34px", width: "auto" }}
      />

      <span
        style={{
          marginLeft: "12px",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        LPMS
      </span>
    </header>
  );
}
