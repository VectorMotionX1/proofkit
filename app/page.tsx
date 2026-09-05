"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { decodeReviewPayload, encodeReviewPayload, Evidence, Decision } from "./proofkit-state";

const starterEvidence: Evidence[] = [
  { id: 1, label: "Homepage screenshot", detail: "Uploaded 2 minutes ago" },
  { id: 2, label: "Staging URL", detail: "https://preview.example.com" },
];

function isEvidenceUrl(label: string) {
  return /^https?:\/\//i.test(label);
}

export default function ProofKitPage() {
  const [requestTitle, setRequestTitle] = useState("Spring campaign landing page");
  const [reviewer, setReviewer] = useState("client@example.com");
  const [evidence, setEvidence] = useState(starterEvidence);
  const [newEvidence, setNewEvidence] = useState("");
  const [decision, setDecision] = useState<Decision>("Pending");
  const [notice, setNotice] = useState("Draft saved locally");
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewExpiry, setReviewExpiry] = useState<number | null>(null);

  useEffect(() => {
    const shared = new URLSearchParams(window.location.search).get("share");
    if (!shared) return;
    const payload = decodeReviewPayload(shared);
    if (!payload) {
      setNotice("This review link is invalid or expired");
      return;
    }
    setRequestTitle(payload.requestTitle);
    setReviewer(payload.reviewer);
    setEvidence(payload.evidence);
    setDecision(payload.decision);
    setReviewExpiry(payload.expiresAt ?? null);
    setReviewMode(true);
    setNotice("Client review mode · changes are local to this browser");
  }, []);

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

  function downloadReceipt() {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(requestTitle || "proofkit-request").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-receipt.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Audit receipt downloaded");
  }

  async function copyReviewLink() {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const payload = encodeReviewPayload({ requestTitle, reviewer, evidence, decision: "Pending", expiresAt });
    const link = `${window.location.origin}/?share=${encodeURIComponent(payload)}`;
    await navigator.clipboard.writeText(link);
    setNotice("Client review link copied · expires in 7 days");
  }

  const expiryLabel = reviewExpiry ? new Date(reviewExpiry).toLocaleDateString() : null;

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
            <div><p className="eyebrow">{reviewMode ? "Client review" : "Approval request"}</p><h2>{requestTitle || "Untitled request"}</h2></div>
            <span className={`proofkitBadge ${decision === "Approved" ? "approved" : decision === "Changes requested" ? "changes" : ""}`}>{decision}</span>
          </div>
          {!reviewMode && <>
            <label className="proofkitField"><span>What needs approval?</span><input value={requestTitle} onChange={(event) => setRequestTitle(event.target.value)} /></label>
            <label className="proofkitField"><span>Reviewer email</span><input type="email" value={reviewer} onChange={(event) => setReviewer(event.target.value)} /></label>
          </>}

          <div className="proofkitSectionHeader"><div><p className="eyebrow">Evidence pack</p><h3>What the reviewer is deciding on</h3></div><span>{evidence.length} items</span></div>
          <div className="proofkitEvidenceList">
            {evidence.map((item) => <div className="proofkitEvidence" key={item.id}><span className="evidenceIcon">↗</span><div>{isEvidenceUrl(item.label) ? <a href={item.label} target="_blank" rel="noreferrer"><strong>{item.label}</strong></a> : <strong>{item.label}</strong>}<small>{item.detail}</small></div><button type="button" title={`Remove ${item.label}`} onClick={() => setEvidence((items) => items.filter((entry) => entry.id !== item.id))}>×</button></div>)}
          </div>
          {!reviewMode && <form className="proofkitAddEvidence" onSubmit={addEvidence}><input aria-label="Evidence label" value={newEvidence} onChange={(event) => setNewEvidence(event.target.value)} placeholder="Add a link, screenshot, or note" /><button className="button" type="submit">Add evidence</button></form>}
        </div>

        <aside className="proofkitSidePanel">
          <div><p className="eyebrow">Decision</p><h2>Close the loop</h2><p className="sideCopy">Every decision is timestamped in the receipt. No more “which version did you approve?”</p></div>
          <div className="proofkitDecisionButtons"><button className="button primary" type="button" onClick={() => { setDecision("Approved"); setNotice("Approval recorded"); }}>Approve</button><button className="button" type="button" onClick={() => { setDecision("Changes requested"); setNotice("Changes requested"); }}>Request changes</button></div>
          {!reviewMode && <button className="button proofkitShareButton" type="button" onClick={copyReviewLink}>Copy client review link</button>}
          <div className="proofkitReceipt"><div className="proofkitReceiptHeader"><span>Audit receipt</span><span className="proofkitBadge">{decision}</span></div><pre>{summary}</pre><button className="button" type="button" onClick={copyReceipt}>Copy receipt</button></div>
          {reviewMode && expiryLabel && <p className="proofkitLinkMeta">Review link expires {expiryLabel} · demo-only local link</p>}
          <p className="proofkitNotice" role="status">{notice}</p>
        </aside>
      </section>

      <footer className="proofkitFooter"><span>ProofKit MVP</span><span>Designed for freelancers and small agencies</span><span>{reviewMode ? "Demo review link · no server persistence" : "Share a review link in one click"}</span></footer>
    </main>
  );
}
