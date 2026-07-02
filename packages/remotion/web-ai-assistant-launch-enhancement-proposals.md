# Web AI Teaching Assistant — Enhancement Proposals (post-render evaluation)

Sources analyzed:

- **Current execution:** `out/web-ai-assistant-launch-remotion-script_extracted.md` (transcript of the rendered `WebAIAssistantLaunch-v2.mp4`, 76.7s)
- **Reference:** `awesome-gondor-video-example/` (Gondor launch video — script, contact sheets, audio transcript)
- **Prior proposal:** `web-ai-assistant-launch-video-script-v3.md` (full rewritten script; this document consolidates and extends it after seeing the actual render)

Two new messaging goals from Pablo, folded in throughout:

1. The assistant is a way to **understand the challenge's gotchas before writing any code**.
2. The assistant **guides you through local environment setup** — a big deal for builders without much technical background.

---

## 1. What the current render already does well (don't touch)

- Product on screen by 0:07 (Gondor rule: show product in <10s — we beat them).
- The live chat drawer with real product copy and pedagogical micro-drama (explain → quiz → partial answer → correction → refusal → hint) — this is genuinely stronger content than Gondor's static screenshots.
- "Docs don't answer back." hook line — keep it.
- Final CTA card held ~7s, claim rewrites the category ("a teacher right on the page"), matches Gondor's minimal ending philosophy.
- Calm motion vocabulary, no glitch/hype.

## 2. Boredom diagnosis (execution vs Gondor)

The problem is not the demo — it's that **one composition runs from 0:07 to 1:09**. Sixty-two seconds of page + right drawer, interrupted only by black overlay cards popping *on top of* the same frame. Gondor never holds a composition longer than ~7s and never repeats one back-to-back. Concretely:

- Segment 02 ("It checks it clicked") alone is **22.5s** — 30% of the video — in one framing with slow chat streaming.
- The black feature cards (`#111827`) overlay the UI instead of cutting away, so the eye never gets a rest and the cards feel off-brand against the mint/teal/serif world (Gondor's text beats are full-screen, on-brand, editorial).
- During reading holds the frame is fully static; Gondor always keeps sub-pixel motion alive (drift, parallax clouds, slow push).
- Two of the three suggestion chips shown in the empty state ("Help me set up locally", "I'm getting an error") are visible but never used — unfired Chekhov's guns that happen to be exactly the story Pablo wants told.

---

## 3. Proposals, prioritized

### P1 — Turn feature cards into full-screen editorial interstitials (cut away, don't overlay)

Gondor's best rhythm trick. Replace each black overlay card with a ~2.3s full-screen card on the brand background: giant Playfair phrase, **one keyword in teal**, word-by-word reveal (opacity + 8px translateY, ~6 frames/word), sparse particles drifting behind. Blur-push in/out. A small badge ("01 · knows your challenge") persists top-left during the following chapter.

New card set (updated for the two messaging goals):

| # | Phrase (teal keyword) | Sub |
| --- | --- | --- |
| 01 | Know the **gotchas** before you code | Concepts and pitfalls, explained on the page |
| 02 | It checks it **clicked** | Quick questions prove you really got it |
| 03 | **Hints**, never answers | Guides you — never copy-paste solutions |
| 04 | It gets you **running locally** | Step-by-step setup, no terminal fear |
| 05 | Then go **full tutor** in your IDE | Open in Claude Code or Cursor, run /start |

(04 and 05 split the old "Then take it local" into the two distinct promises: guided setup, then IDE handoff.)

### P2 — New Chapter: "Help me set up locally" (uses the existing chip)

The empty state already shows the real product chips `Help me set up locally` and `I'm getting an error`. Fire them. After Chapter 03's refusal/hint, cursor clicks **Help me set up locally** → assistant streams a short, friendly, numbered setup:

> `No terminal experience needed — we'll go step by step:`
> `1. Copy the clone command from Checkpoint 0`
> `2. yarn install`
> `3. yarn chain → yarn deploy → yarn start`
>
> `Stuck on any step? Paste the error here and we'll fix it together.`

Why it works: it's the single most reassuring beat for non-technical builders, it adds a cursor action + new message rhythm at the video's lowest-energy point (~55s), and the "paste the error here" line implicitly demos the third chip without spending time on it. Numbered steps also read ~3x faster than paragraphs, so this chapter can be short (~10–12s).

### P3 — Sharpen Chapter 01 into the "gotchas" chapter

Keep the crowdfunding explanation but append a compact bullet coda to the assistant message (bullets = fast reading, visual variety vs. paragraphs):

> `Before you write any code, three gotchas to keep in mind:`
> `• Refunds must work even after the deadline passes`
> `• You need to track who contributed what — not just the total`
> `• Only the recipient should withdraw, and only on success`

This turns "it explains the concept" into "it saves you from the mistakes you'd hit an hour later" — a much stronger reason to open the drawer before coding. Interstitial 01's copy (P1) sets it up.

### P4 — Break the 62-second single composition (framing per chapter)

- **Ch 01 (gotchas):** current right-anchored ~1.5x zoom on the drawer over the page. Fine as-is.
- **Ch 02 (quiz):** the live panel **detaches and floats centered** on a clean brand canvas — soft shadow, radius 16, particles at two parallax depths behind. Trivial because the panel is live DOM, and it resets attention exactly where the video sags. Also trim the quiz exchange (shorter typed answer, see §4).
- **Ch 03 (refusal):** blur-push back onto the page, slightly tighter (~1.6x) for the punchline.
- **Ch 04 (local setup):** stay on page zoom, but the numbered list gives the frame new texture.
- **Ch 05 (IDE handoff):** pull back to 1x, then fade the page for a ~3s **orbiting-icons beat**: browser, terminal, Claude Code, Cursor icons orbit a `/start` monospace chip (deterministic sin/cos), then settle in a row. Gondor's USDC-loop moment — the one playful abstraction in their video, and ours.

### P5 — Never a fully static frame

During every reading hold, keep a slow push alive (e.g. scale 1.50 → 1.53 over the hold, linear) and let the particle layer drift where present. Gondor holds are never frozen; this costs nothing and kills the "paused video" feel.

### P6 — Problem beat before the reveal (~5s)

Between the hook and the page reveal: clean canvas, `builder-fronzen.png` pixel art small and centered with lots of air, one editorial line word-by-word: "Solidity docs on one screen. The challenge on another. **Nobody to ask.**" Gives the FAB click a reason to feel like an answer. (Carried from v3; the render currently jumps straight from title card to product.)

### P7 — Proof beat + minimal end card

Before the outro: one full-screen stat/claim beat, Gondor "$150,000"-style — big serif "**Live on every AI-ready challenge**", sub "From first read to local dev environment — guided." Then after the existing outro, strip to a bare centered "speedrunethereum.com" held ≥2s, fade out. (Carried from v3.)

### P8 — Blur-push transitions + persistent motif layer

All scene boundaries use blur-push (blur 0→10px + scale 1→1.04 + fade, ~18 frames each way) instead of plain fades; hard cuts only *within* a chapter. The intro/outro particle layer persists at 0.1–0.2 opacity through interstitials, the floating-panel chapter, problem beat and proof beat — one continuous world, Gondor's clouds job. (Carried from v3.)

### P9 — Optional: voiceover

Whisper found no narration in the render — it's music-only. Gondor's entire rhythm comes from being cut to narration. A short VO (~110 words, even AI-generated) reading the interstitial phrases + one line per chapter would let chat streaming overlap with listening and cut ~8–10s of reading holds. If skipped, the interstitials remain the narration spine — every act change must land on one.

---

## 4. Chat script changes (delta vs current render)

**Chapter 01 — append gotchas coda** to the existing crowdfunding explanation (see P3).

**Chapter 02 — trim typed answer** to: `the smart contract — if the goal isn't reached, everyone just gets refunded` (current render shows a partial answer + long corrected answer; one short answer + the assistant's "Perfect! You've got it" recap carries the same story in ~4 fewer seconds).

**Chapter 03 — unchanged.**

**New Chapter 04 — local setup** (chip click + numbered steps, see P2).

**Chapter 05 — tightened handoff:**

> `Once you're running, open the repo in Claude Code or Cursor and run /start for the full AI tutor — no limits.`
> `See you at the finish line 🏁`

---

## 5. Revised timeline sketch (~84s @ 30fps, ~2520 frames)

| Time | Beat | Framing |
| --- | --- | --- |
| 0:00–0:06 | Hook (title + "Docs don't answer back.") | Canvas |
| 0:06–0:11 | Problem beat (P6) | Canvas + pixel art |
| 0:11–0:17 | Reveal: page, FAB click, drawer slides in | Page → zoom |
| 0:17–0:19 | Interstitial 01 — "Know the **gotchas** before you code" | Full-screen card |
| 0:19–0:32 | Ch 01: walkthrough + gotchas bullets | Page zoom 1.5x |
| 0:32–0:34 | Interstitial 02 — "It checks it **clicked**" | Full-screen card |
| 0:34–0:47 | Ch 02: quiz (trimmed) | **Floating panel on canvas** |
| 0:47–0:49 | Interstitial 03 — "**Hints**, never answers" | Full-screen card |
| 0:49–0:58 | Ch 03: refusal + mapping hint | Page zoom 1.6x |
| 0:58–1:00 | Interstitial 04 — "It gets you **running locally**" | Full-screen card |
| 1:00–1:11 | Ch 04: "Help me set up locally" chip + 3 steps | Page zoom 1.5x |
| 1:11–1:13 | Interstitial 05 — "Then go **full tutor** in your IDE" | Full-screen card |
| 1:13–1:18 | Ch 05: handoff line + orbiting icons `/start` | Pull-back → abstraction |
| 1:18–1:21 | Proof beat (P7) | Canvas |
| 1:21–1:26 | Outro (existing) | Canvas |
| 1:26–1:24+ | Minimal end card: `speedrunethereum.com` | Canvas |

Net vs current render: +5 interstitial cards (short), +problem beat, +setup chapter, −4s from quiz trim, −overlay card time (interstitials replace, not add). ~84s total — if it must stay under 80s, drop the proof beat first, then shorten Ch 01's explanation paragraph (the gotchas bullets carry the value).

## 6. Implementation deltas

New: `EditorialInterstitial` (phrase card, keyword accent prop), `floating` mode on the chat panel, `OrbitIcons`, `BlurPush` helper, slow-push-during-holds utility, problem/proof beat scenes (reuse interstitial internals).
Removed: black `FeatureCard` overlays (the interstitial + persistent badge replaces them).
Unchanged: message/typing engine, cursor, backdrop, audio bed + SFX.

The full scene-by-scene spec for most of these lives in `web-ai-assistant-launch-video-script-v3.md`; this document supersedes it on: chapter count (5, not 4), interstitial copy (gotchas/local-setup versions), and the Chapter 04 setup exchange.
