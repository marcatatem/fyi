import type { Slug } from "../utils/analytics.ts";
import { GeoTable } from "html/components/dashboard/geo_table.tsx";

export type DashboardProps = {
  env: "development" | "production";
  revision: string;
  data: Record<string, Slug>;
};

const hotLinkAsset = (type: string, path: string) => {
  return `https://marca.fyi/${type}/${path}`;
};

export const Dashboard = ({ data, revision }: DashboardProps) => {
  const songs = Object.keys(data);

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Marca Tatem Analytics</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root { 
            --bg: #ffffff; 
            --text: #111111; 
            --subtle: #737373; 
            --border: #e5e5e5;
            --accent: #111111; 
          }
          * { box-sizing: border-box; }
          body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            background: var(--bg); 
            color: var(--text); 
            padding: 4rem 2rem; 
            max-width: 1400px; 
            margin: 0 auto; 
            -webkit-font-smoothing: antialiased;
          }
          h1, h2, h3 { font-weight: 500; letter-spacing: -0.02em; margin: 0; }
          
          /* Minimal Header */
          .header { 
            display: flex; justify-content: space-between; align-items: baseline; 
            margin-bottom: 6rem; 
            border-bottom: 1px solid var(--border);
            padding-bottom: 1rem;
          }
          .brand { font-size: 1.25rem; font-weight: 500; }
          .meta { font-size: 0.875rem; color: var(--subtle); font-family: monospace; }
          
          /* Release Section */
          .release-header { 
            display: grid; grid-template-columns: 80px 1fr; gap: 2rem; align-items: center; 
            margin-bottom: 3rem; 
          }
          .cover-art { 
            width: 64px; height: 64px; border-radius: 4px; object-fit: cover; 
            background: #f4f4f5; border: 1px solid var(--border);
          }
          .release-title { font-size: 2.5rem; line-height: 1.1; }
          
          /* Grid Layout */
          .grid { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 2rem; margin-bottom: 4rem; 
            border-top: 1px solid var(--border);
            padding-top: 2rem;
          }
          
          /* Card Override for Light Theme */
          .stat-group { margin-bottom: 1.5rem; }
          .stat-label { 
            font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; 
            color: var(--subtle); margin-bottom: 0.5rem; display: block;
          }
          .stat-value { font-size: 3.5rem; font-weight: 400; line-height: 1; margin-bottom: 0.5rem; }
          
          .sub-table { width: 100%; font-size: 0.875rem; border-top: 1px solid var(--border); margin-top: 1rem; }
          .sub-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
          
          .geo-container { margin-top: 2rem; }
        `,
          }}
        />
      </head>
      <body>
        <div className="header">
          <div className="brand">
            Marca Makes Music /{" "}
            <span style={{ color: "var(--subtle)" }}>Ads Dashboard</span>
          </div>
          <div className="meta">
            <span style={{ marginLeft: "1rem" }}>build {revision}</span>
          </div>
        </div>

        {songs.length === 0
          ? (
            <div
              style={{
                padding: "6rem 0",
                borderTop: "1px solid var(--border)",
                color: "var(--subtle)",
              }}
            >
              No data recorded yet.
            </div>
          )
          : (
            songs.map((slug) => {
              const song = data[slug];
              const campaignKeys = Object.keys(song.campaigns);

              return (
                <div key={slug} style={{ marginBottom: "8rem" }}>
                  <div className="release-header">
                    {/* Cover Art Integration */}
                    {song.meta.cover
                      ? (
                        <img
                          src={hotLinkAsset("img", song.meta.cover)}
                          alt={song.meta.title}
                          className="cover-art"
                        />
                      )
                      : <div className="cover-art" />}

                    <h1 className="release-title">
                      {song.meta.title || slug.replace(/-/g, " ")}
                    </h1>
                  </div>

                  <div className="grid">
                    {/* Primary Metric: Big & Bold */}
                    <div>
                      <span className="stat-label">Total Conversions</span>
                      <div className="stat-value">{song.total}</div>
                    </div>

                    {/* Campaign Breakdown */}
                    {campaignKeys.map((campName) => {
                      const stats = song.campaigns[campName];
                      return (
                        <div key={campName}>
                          <span className="stat-label">Campaign: {campName}</span>
                          <div className="stat-value" style={{ fontSize: "2rem" }}>
                            {stats.total}
                          </div>

                          <div className="sub-table">
                            {Object.entries(stats.stores).map(([store, count]) => (
                              <div key={store} className="sub-row">
                                <span>{store}</span>
                                <strong>{count}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Geography Section - Cleaner Layout */}
                  <div className="geo-container">
                    <span className="stat-label" style={{ marginBottom: "1rem" }}>
                      Top Locations
                    </span>
                    <GeoTable geo={song.geo} />
                  </div>
                </div>
              );
            })
          )}
      </body>
    </html>
  );
};
