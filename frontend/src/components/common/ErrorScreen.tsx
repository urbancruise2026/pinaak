"use client";

// Design adapted from TimsahTim's open-source 404 template.
// All selectors are scoped under .es-root so nothing leaks into the app.

type Props = {
  code?: string;
  title?: string;
  message?: string;
  digest?: string;
  onRetry?: () => void;
};

export default function ErrorScreen({
  code = "ERROR",
  title = "Something went wrong",
  message,
  digest,
  onRetry,
}: Props) {
  const fontSize = code.length > 3 ? 140 : 200;

  return (
    <div className="es-root">
      <style>{css}</style>
      <div className="es-bg" />

      <div className="es-content">
        <svg className="es-svg" viewBox="0 0 700 250" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="es-glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <text className="es-base" x="350" y="190" textAnchor="middle" fontSize={fontSize}>
            {code}
          </text>
          <text className="es-neon" x="350" y="190" textAnchor="middle" fontSize={fontSize}>
            {code}
          </text>
        </svg>

        <h2 className="es-title">{title}</h2>

        {message && <p className="es-message">{message}</p>}
        {digest && <p className="es-digest">Reference: {digest}</p>}

        <div className="es-actions">
          {onRetry && (
            <button type="button" className="es-btn es-btn-ghost" onClick={onRetry}>
              Try again
            </button>
          )}
          {/* Plain <a> = full page load, which also clears any broken in-memory state */}
          <a href="/" className="es-btn">
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
}

const css = `
.es-root{position:fixed;inset:0;z-index:9999;overflow:auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
.es-bg{position:absolute;inset:0;background:radial-gradient(circle,#240015 0%,#12000b 100%);animation:es-hue 6s ease-in-out 3s infinite}
.es-content{position:relative;min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center}
.es-svg{width:600px;max-width:100%;height:auto;animation:es-hue 6s ease-in-out 3s infinite}
.es-base,.es-neon{font-weight:800;fill:transparent;stroke-width:3px;font-family:system-ui,sans-serif}
.es-base{stroke:#12000a}
.es-neon{stroke:#ff005d;filter:url(#es-glow);stroke-dasharray:1400;stroke-dashoffset:1400;
  animation:es-draw 2.5s ease-in-out forwards,es-flicker 4s linear 3s infinite}
.es-title{margin:0;font-size:28px;font-weight:300;text-transform:uppercase;letter-spacing:.08em;color:#12000a;
  animation:es-fade 3s ease-in 2s forwards,es-hue 6s ease-in-out 3s infinite}
.es-message{margin:0;max-width:640px;padding:10px 14px;border:1px solid rgba(255,0,93,.35);border-radius:10px;
  background:rgba(255,0,93,.08);color:#ffb3cf;font:13px/1.5 ui-monospace,Consolas,monospace;word-break:break-word}
.es-digest{margin:0;font-size:12px;color:#a05070}
.es-actions{display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;justify-content:center}
.es-btn{display:inline-block;padding:12px 28px;border-radius:999px;border:2px solid #ff005d;background:#ff005d;
  color:#fff;font-size:15px;font-weight:600;text-decoration:none;cursor:pointer;transition:.2s}
.es-btn:hover{box-shadow:0 0 18px #ff005d;transform:translateY(-1px)}
.es-btn-ghost{background:transparent;color:#ff005d}
@keyframes es-draw{to{stroke-dashoffset:0}}
@keyframes es-flicker{0%,30%,42%,85%,96%,100%{stroke:#ff005d}31%,37%,86%{stroke:transparent}}
@keyframes es-fade{1%{color:#12000a}70%{color:#ff005d;text-shadow:0 0 14px #ff005d}100%{color:#ff005d;text-shadow:0 0 4px #ff005d}}
@keyframes es-hue{0%,100%{filter:hue-rotate(0)}50%{filter:hue-rotate(-120deg)}}
`;