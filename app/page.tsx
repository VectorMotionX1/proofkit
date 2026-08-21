"use client";

import { FormEvent, useMemo, useState } from "react";

type Evidence = { id: number; label: string; detail: string };

const starterEvidence: Evidence[] = [
  { id: 1, label: "Homepage screenshot", detail: "Uploaded 2 minutes ago" },
  { id: 2, label: "Staging URL", detail: "https://preview.example.com" },
];

export default function ProofKitPage() {
  const [requestTitle, setRequestTitle] = useState("Spring campaign landing page");
  const [reviewer, setReviewer] = useState("client@example.com");
  const [evidence, setEvidence] = useState(starterEvidence);
  const [newEvidence, setNewEvidence] = useState("");
  const [decision, setDecision] = useState<"Pending" | "Approved" | "Changes requested">("Pending");
  const [notice, setNotice] = useState("Draft saved locally");

  const summary = useMemo(
    () =>
      [
        "PROOFKIT APPROVAL RECEIPT",
        `Request: ${requestTitle || "Untitled request"}`,
        `Reviewer: ${reviewer || "Unassigned"}`,
        `Decision: ${decision}`,
        `Evidence: ${evidence.length} item${evidence.length === 1 ? "" : "s"}`,
        `Recorded: ${new Date().toLocaleString()}`,
      ].join("\n"),
    [decision, evidence.length, requestTitle, reviewer]
  );

  function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const label = newEvidence.trim();
    if (!label) return;
    setEvidence((items) => [...items, { id: Date.now(), label, detail: "Added just now" }]);
    setNewEvidence("");
    setNotice("Evidence added to this request");
  }

  async function copyReceipt() {
    await navigator.clipboard.writeText(summary);
    setNotice("Audit receipt copied");
  }

  return (
    <main className="proofkitShell">
      <header className="proofkitTopbar">
        <a className="proofkitBrand" href="/">ProofKit <span>by SolXMesh</span></a>
        <div className="proofkitStatus"><span className="statusDot" /> Local MVP · no account required</div>
      </header>

      <section className="proofkitIntro">
        <p className="eyebrow">Client approval workspace</p>
        <h1>Get the sign-off. Keep the proof.</h1>
        <p className="summary">A focused approval room for small agencies that are tired of chasing screenshots, links, and decisions across email.</p>
      </section>

      <section className="proofkitWorkspace" aria-label="ProofKit approval workspace">
        <div className="proofkitMainPanel">
          <div className="proofkitPanelHeader">
            <div><p className="eyebrow">Approval request</p><h2>{requestTitle || "Untitled request"}</h2></div>
            <span className={`proofkitBadge ${decision === "Approved" ? "approved" : decision === "Changes requested" ? "changes" : ""}`}>{decision}</span>
          </div>
          <label className="proofkitField"><span>What needs approval?</span><input value={requestTitle} onChange={(event) => setRequestTitle(event.target.value)} /></label>
          <label className="proofkitField"><span>Reviewer email</span><input type="email" value={reviewer} onChange={(event) => setReviewer(event.target.value)} /></label>

          <div className="proofkitSectionHeader"><div><p className="eyebrow">Evidence pack</p><h3>What the reviewer is deciding on</h3></div><span>{evidence.length} items</span></div>
          <div className="proofkitEvidenceList">
            {evidence.map((item) => <div className="proofkitEvidence" key={item.id}><span className="evidenceIcon">↗</span><div><strong>{item.label}</strong><small>{item.detail}</small></div><button type="button" title={`Remove ${item.label}`} onClick={() => setEvidence((items) => items.filter((entry) => entry.id !== item.id))}>×</button></div>)}
          </div>
          <form className="proofkitAddEvidence" onSubmit={addEvidence}><input aria-label="Evidence label" value={newEvidence} onChange={(event) => setNewEvidence(event.target.value)} placeholder="Add a link, screenshot, or note" /><button className="button" type="submit">Add evidence</button></form>
        </div>

        <aside className="proofkitSidePanel">
          <div><p className="eyebrow">Decision</p><h2>Close the loop</h2><p className="sideCopy">Every decision is timestamped in the receipt. No more “which version did you approve?”</p></div>
          <div className="proofkitDecisionButtons"><button className="button primary" type="button" onClick={() => { setDecision("Approved"); setNotice("Approval recorded"); }}>Approve</button><button className="button" type="button" onClick={() => { setDecision("Changes requested"); setNotice("Changes requested"); }}>Request changes</button></div>
          <div className="proofkitReceipt"><div className="proofkitReceiptHeader"><span>Audit receipt</span><span className="proofkitBadge">{decision}</span></div><pre>{summary}</pre><button className="button" type="button" onClick={copyReceipt}>Copy receipt</button></div>
          <p className="proofkitNotice" role="status">{notice}</p>
        </aside>
      </section>

      <footer className="proofkitFooter"><span>ProofKit MVP</span><span>Designed for freelancers and small agencies</span><span>Next: shareable client review link</span></footer>
    </main>
  );
}
