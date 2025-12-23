type GeoTableProps = {
  geo: Record<string, number>;
};

export const GeoTable = ({ geo }: GeoTableProps) => {
  const sorted = Object.entries(geo).sort((a, b) => b[1] - a[1]);
  const max = sorted[0] ? sorted[0][1] : 1;

  if (sorted.length === 0) {
    return (
      <div
        style={{ color: "#737373", padding: "1rem 0", borderTop: "1px solid #e5e5e5" }}
      >
        No location data yet
      </div>
    );
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
      <thead>
        <tr>
          <th
            style={{
              textAlign: "left",
              padding: "0.5rem 0",
              color: "#737373",
              borderBottom: "1px solid #111",
              fontWeight: "normal",
              width: "40%",
            }}
          >
            Country
          </th>
          <th
            style={{
              textAlign: "left",
              padding: "0.5rem 0",
              color: "#737373",
              borderBottom: "1px solid #111",
              fontWeight: "normal",
            }}
          >
            Visits
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(([country, count]) => (
          <tr key={country}>
            <td style={{ padding: "0.75rem 0", borderBottom: "1px solid #e5e5e5" }}>
              {country === "Unknown" ? "Unknown Region" : country}
            </td>
            <td style={{ padding: "0.75rem 0", borderBottom: "1px solid #e5e5e5" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "40px", fontWeight: "500" }}>{count}</span>
                {/* Minimal Bar Chart */}
                <div
                  style={{
                    background: "#f4f4f5",
                    height: "6px",
                    width: "150px",
                    marginLeft: "10px",
                  }}
                >
                  <div
                    style={{
                      background: "#111",
                      height: "100%",
                      width: `${(count / max) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
