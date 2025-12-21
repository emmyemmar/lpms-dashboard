// components/Footer.jsx
const linkStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#9ca3af",
  textDecoration: "none",
};

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "60px",
        padding: "48px 32px",
        backgroundColor: "#0b1220",
        borderTop: "1px solid #1f2937",
      }}
    >
      {/* Top Title */}
      <h2
        style={{
          textAlign: "center",
          fontSize: "32px",
          fontWeight: "700",
          marginBottom: "40px",
          color: "#e5e7eb",
        }}
      >
        Powered by Liquity
      </h2>

      {/* Footer Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "40px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Company */}
        <div>
          <h3 style={{ marginBottom: "12px", color: "#f9fafb" }}>
            Company
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>
              <a
                href="https://www.liquity.org/blog/guide-to-liquity-v2"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="https://x.com/LiquityProtocol"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Contact Us
              </a>
            </li>
            <li>
              <a
                href="https://t.me/liquityprotocol"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Social
              </a>
            </li>
          </ul>
        </div>

        {/* Product & Services */}
        <div>
          <h3 style={{ marginBottom: "12px", color: "#f9fafb" }}>
            Product & Services
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>
              <a
                href="https://liquity.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Liquity App
              </a>
            </li>
            <li>
              <a
                href="https://docs.liquity.org/v2-faq/general"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Docs
              </a>
            </li>
            <li>
              <a
                href="https://dune.com/liquity/liquity-v2"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Dune Analytics
              </a>
            </li>
          </ul>
        </div>

        {/* Community */}
        <div>
          <h3 style={{ marginBottom: "12px", color: "#f9fafb" }}>
            Community
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>
              <a
                href="https://discord.gg/liquity"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Discord
              </a>
            </li>
            <li>
              <a
                href="https://x.com/LiquityProtocol"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                X (Twitter)
              </a>
            </li>
            <li>
              <a
                href="https://github.com/liquity/bold"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Note */}
      <p
        style={{
          marginTop: "48px",
          textAlign: "center",
          fontSize: "14px",
          color: "#6b7280",
        }}
      >
        © {new Date().getFullYear()} LPMS — Liquity Position Monitoring System
      </p>
    </footer>
  );
}
