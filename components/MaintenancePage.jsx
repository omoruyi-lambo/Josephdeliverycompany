/**
 * MaintenancePage
 * Displayed on all public-facing routes when NEXT_PUBLIC_SITE_MAINTENANCE_MODE=true.
 * Admin routes (/admin/*) bypass this component entirely — see _app.js.
 */
export default function MaintenancePage() {
  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#f5f6f8}
        .mp-root{
          min-height:100vh;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          background:#f5f6f8;
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
          color:#1a1a2e;
          padding:24px 16px;
        }
        .mp-card{
          width:100%;
          max-width:520px;
          background:#ffffff;
          border:1px solid #e2e5ea;
          border-radius:8px;
          padding:48px 40px;
          text-align:center;
        }
        .mp-icon{
          width:48px;
          height:48px;
          margin:0 auto 24px;
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:50%;
          background:#f0f2f5;
          border:1px solid #dde1e7;
        }
        .mp-icon svg{
          width:22px;
          height:22px;
          color:#5a6478;
          flex-shrink:0;
        }
        .mp-heading{
          font-size:20px;
          font-weight:700;
          letter-spacing:-0.01em;
          color:#0f1623;
          margin-bottom:10px;
        }
        .mp-body{
          font-size:14.5px;
          line-height:1.65;
          color:#4a5568;
          margin-bottom:32px;
        }
        .mp-divider{
          border:none;
          border-top:1px solid #e8ebf0;
          margin-bottom:24px;
        }
        .mp-status-label{
          font-size:11px;
          font-weight:700;
          letter-spacing:0.09em;
          text-transform:uppercase;
          color:#8892a0;
          margin-bottom:14px;
        }
        .mp-status-rows{
          display:flex;
          flex-direction:column;
          gap:8px;
        }
        .mp-status-row{
          display:flex;
          align-items:center;
          justify-content:space-between;
          background:#f8f9fb;
          border:1px solid #e8ebf0;
          border-radius:5px;
          padding:9px 14px;
          font-size:13px;
        }
        .mp-status-row span:first-child{
          color:#3d4a5c;
          font-weight:500;
        }
        .mp-badge{
          display:inline-flex;
          align-items:center;
          gap:5px;
          font-size:11.5px;
          font-weight:600;
          letter-spacing:0.02em;
          color:#92400e;
          background:#fef3c7;
          border:1px solid #fde68a;
          border-radius:20px;
          padding:2px 9px;
        }
        .mp-badge-dot{
          width:6px;
          height:6px;
          border-radius:50%;
          background:#d97706;
          flex-shrink:0;
        }
        .mp-badge-ok{
          color:#166534;
          background:#dcfce7;
          border-color:#bbf7d0;
        }
        .mp-badge-ok .mp-badge-dot{
          background:#16a34a;
        }
        .mp-footer{
          margin-top:32px;
          font-size:12px;
          color:#9aa3b0;
        }
        @media(max-width:520px){
          .mp-card{padding:36px 24px}
          .mp-heading{font-size:18px}
        }
      `}</style>

      <div className="mp-root" role="main">
        <div className="mp-card">

          {/* Icon */}
          <div className="mp-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="mp-heading">Service Temporarily Unavailable</h1>

          {/* Body */}
          <p className="mp-body">
            Our servers are currently undergoing maintenance.
            Please try again later.
          </p>

          <hr className="mp-divider" />

          {/* Status panel */}
          <p className="mp-status-label">Service Status</p>
          <div className="mp-status-rows" role="list">
            <div className="mp-status-row" role="listitem">
              <span>Website</span>
              <span className="mp-badge">
                <span className="mp-badge-dot" />
                Temporary maintenance in progress
              </span>
            </div>
            <div className="mp-status-row" role="listitem">
              <span>Availability</span>
              <span className="mp-badge">
                <span className="mp-badge-dot" />
                Please check back shortly
              </span>
            </div>
            <div className="mp-status-row" role="listitem">
              <span>Core services</span>
              <span className="mp-badge mp-badge-ok">
                <span className="mp-badge-dot" />
                Operational
              </span>
            </div>
          </div>

        </div>

        <p className="mp-footer">josephdeliverycompany.com</p>
      </div>
    </>
  );
}
