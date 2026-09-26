use client';

import { useMemo, useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [token, setToken] = useState("");
  const [admins, setAdmins] = useState("");
  const [status, setStatus] = useState("Ready");
  const [logs, setLogs] = useState([]);

  const maskedToken = useMemo(() => token ? "•".repeat(Math.min(token.length, 22)) : "", [token]);

  async function deploy() {
    if (!file) return setStatus("Choose a .py or .zip file first.");
    setStatus("Preparing deployment…");
    setLogs(["Uploading deployment manifest…"]);

    const body = {
      filename: file.name,
      size: file.size,
      botTokenProvided: Boolean(token),
      adminIds: admins.split(",").map(x => x.trim()).filter(Boolean),
      note: "Actual Python execution should be handled by the configured external runner."
    };

    try {
      const r = await fetch("/api/deploy", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(body)
      });
      const data = await r.json();
      setStatus(data.status || "Deployment queued");
      setLogs(x => [...x, ...(data.logs || [])]);
    } catch {
      setStatus("Deployment API unavailable");
      setLogs(x => [...x, "Configure RUNNER_URL before using live deployment."]);
    }
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="cloud">☁</span> BotHub</div>
        <span className="pill">NO LOGIN</span>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">PYTHON BOT HOSTING</div>
          <h1>Deploy your bot<br/><span>without the hassle.</span></h1>
          <p>Upload your Python bot, detect dependencies, set optional Telegram configuration, and send it to your configured worker.</p>
        </div>
        <div className="heroCard">
          <div className="pulse"></div>
          <div>
            <b>Deployment engine</b>
            <small>Vercel dashboard + external worker</small>
          </div>
          <strong>READY</strong>
        </div>
      </section>

      <section className="grid">
        <div className="card upload">
          <div className="cardTitle"><span>01</span><h2>Deploy your bot</h2></div>
          <label className="drop">
            <input type="file" accept=".py,.zip,.txt" onChange={e => setFile(e.target.files?.[0] || null)} />
            <div className="uploadIcon">↑</div>
            <b>{file ? file.name : "Choose Python files or ZIP"}</b>
            <small>{file ? `${(file.size/1024/1024).toFixed(2)} MB` : "main.py, requirements.txt, folders…"} </small>
          </label>

          <div className="detected">
            <div><i></i> Python 3.x <span>auto</span></div>
            <div><i></i> requirements.txt <span>auto</span></div>
            <div><i></i> Telegram bot config <span>scan</span></div>
          </div>
        </div>

        <div className="card">
          <div className="cardTitle"><span>02</span><h2>Bot configuration</h2></div>
          <label>Bot token <em>optional</em></label>
          <input className="field" value={token} onChange={e => setToken(e.target.value)} placeholder="Paste token, or leave blank if in code" type="password" />
          {maskedToken && <div className="hint">Stored for this browser session: {maskedToken}</div>}
          <label>Admin IDs <em>optional</em></label>
          <input className="field" value={admins} onChange={e => setAdmins(e.target.value)} placeholder="123456789, 987654321" />
          <div className="hint">If your bot already defines these values, leave the fields empty.</div>
        </div>

        <div className="card wide">
          <div className="cardTitle"><span>03</span><h2>Runtime</h2></div>
          <div className="stats">
            <div><small>Python</small><b>3.13+</b></div>
            <div><small>Dependencies</small><b>Auto-detect</b></div>
            <div><small>Process</small><b>Persistent worker</b></div>
            <div><small>Access</small><b>No account</b></div>
          </div>
          <div className="featureList">
            <div>✓ Import scanner for requirements</div>
            <div>✓ Environment variable support</div>
            <div>✓ Start / stop / restart hooks</div>
            <div>✓ Live worker logs</div>
            <div>✓ Crash/restart reporting</div>
            <div>✓ ZIP projects with folders</div>
          </div>
        </div>

        <div className="card console">
          <div className="cardTitle"><span>04</span><h2>Deployment console</h2><span className="live">● LIVE</span></div>
          <div className="terminal">
            {logs.length ? logs.map((x,i)=><div key={i}><span>›</span> {x}</div>) : <div><span>›</span> Waiting for deployment…</div>}
          </div>
          <div className="actions">
            <button className="primary" onClick={deploy}>Deploy bot</button>
            <button onClick={() => {setLogs([]);setStatus("Ready")}}>Clear</button>
          </div>
          <div className="status">{status}</div>
        </div>
      </section>

      <section className="bottomGrid">
        {[
          ["FILES","Browse project files"],
          ["REQUIREMENTS","Auto dependency setup"],
          ["LOGS","Live stdout / stderr"],
          ["USAGE","CPU, RAM & storage"],
          ["SETTINGS","Worker configuration"],
          ["RESTART","One-tap restart"]
        ].map(([a,b]) => <div className="mini" key={a}><b>{a}</b><span>{b}</span></div>)}
      </section>

      <footer>BotHub · Vercel dashboard · Bring your own worker</footer>
    </main>
  );
}