# Web AI Teaching Assistant — Launch Video Script v3

Video: `WebAIAssistantLaunch`
Duration: ~82s (2460 frames @ 30fps, 1920x1080)
Audience: registered builders + community followers on X
Goal: keep v2's live-recreation demo (our strongest asset) but adopt the narrative arc, pacing rhythm, and editorial restraint of the Gondor launch video (`awesome-gondor-video-example/`).

## What changed from v2 (Gondor-informed)

v2 fixed v1's biggest flaw (static screenshots → live recreated UI). v3 fixes what v2 is still missing relative to the Gondor reference:

1. **No "why" before the product.** Gondor spends its first act building the problem before the brand ever appears. v2 jumps from branded intro straight into the demo. v3 adds a short **problem beat** so the FAB click lands as *the answer*, not a feature tour.
2. **Monotone framing.** v2 holds the same right-anchored 1.5x panel zoom for ~50 straight seconds. Gondor never repeats a composition twice in a row. v3 **varies the framing per chapter** (page zoom → floating panel on clean canvas → page zoom → pull-back).
3. **No breathing room.** Gondor cuts to full-screen editorial serif phrases between product sections. v3 replaces the UseCaseCard chapter cards with **editorial interstitials**: one giant Playfair phrase, one keyword in teal, word-by-word reveal. The interstitial *is* the chapter card.
4. **No proof beat, cluttered ending.** Gondor ends with a giant confidence stat, then a dead-simple domain card held long. v3 adds a **proof beat** and a **minimal end card**.
5. **No unifying motif.** Gondor's drifting clouds glue illustration, text, and UI scenes into one world. v3 lets our **floating particles/pixel motif** persist (sparse, low-opacity) through interstitials and the floating-panel chapter — not just intro/outro.
6. **Crossfade-only transitions.** v3 uses **blur-push transitions** between acts (animated blur + slight scale), Gondor's signature move between its demo sections.
7. **Text-only handoff.** Gondor's most memorable 4s is the playful orbiting-USDC abstraction ("under the hood"). v3 gives Chapter 04 an equivalent: a short **orbiting-icons beat** (browser → terminal → `/start`) instead of only reading the assistant's handoff message.

**Kept from v2 unchanged:** live WebChatPanel recreation over the real screenshot backdrop, the 4-chapter conversation, the 60–80-frame reading rule after each streamed message (educational pacing is the point — the dynamism comes from what happens *around* the reading moments, not from speeding them up), AnimatedCursor, sound design, hook/outro family.

**Deliberately NOT copied from Gondor:** their static screenshot demo (ours is live and better), their navy/engraving institutional aesthetic (we keep the pixel-art + teal + Playfair house style), their 3s-per-screen demo pace (they have nothing to read; we do).

## Accent keyword system

One rule, applied everywhere text appears large: exactly **one keyword per phrase** rendered in teal (`secondary` from theme), everything else in ink. The four memory words of the video, in order: **knows**, **clicked**, **hints**, **local**. (Gondor does this with pale blue on "collateral", "liquidity", "$150,000" — it's why you remember them after one watch.)

## Act structure

| Act | Purpose | Gondor equivalent |
| --- | --- | --- |
| I. Hook + Problem | Who it's for and why it exists | NYC/Wall Street legitimacy act (0–15s) |
| II. Reveal | Brand answer moment: FAB click, drawer slides in | Logo reveal on cloud canvas (15–20s) |
| III. Demo ×4 | Interstitial phrase → live chapter, alternating framing | Value-prop serif beats + UI demo (20–50s) |
| IV. Proof + CTA | Confidence stat → outro → minimal end card | "$150,000" → "gondor.fi" (56–67s) |

## Timeline

Frame values are targets; the 60–80-frame post-stream reading rule still wins over the table.

| Frames | Time | Scene | What happens on screen |
| --- | --- | --- | --- |
| 0–170 | 0:00–0:06 | **Hook** | Branded intro as v2 (PixelGirlSprite + serif "AI Teaching Assistant", particles, teal bar) but trimmed ~1s; only the first hook line here: "Stuck reading a challenge *solo*?" |
| 170–330 | 0:06–0:11 | **Problem beat** *(new)* | Clean canvas, sparse particles. `builder-fronzen.png` pixel art centered small with lots of air (Gondor small-UI framing). Editorial line reveals word-by-word: "Solidity docs on one screen. The challenge on another. **Nobody to ask.**" Melancholy pause in the music bed. |
| 330–520 | 0:11–0:17 | **Reveal** | Blur-push into the Crowdfunding page (`ss3`). Beat of stillness → AnimatedCursor glides to the sparkles FAB, click SFX, drawer slides in (420→460px). Camera eases to right-anchored ~1.5x on the panel. This is the "that's why we built it" moment — let the click land alone, no text. |
| 520–590 | 0:17–0:20 | **Interstitial 01** *(replaces chapter card)* | Full-screen editorial card: "A teacher that **knows** your challenge". Playfair, word-by-word reveal (opacity + 8px translateY per word), sparse drifting particles behind. Blur-push in/out. |
| 590–950 | 0:20–0:32 | **Chapter 01 — demo** | Framing A: zoomed panel over the page (as v2). Cursor clicks the "Let's start learning!" chip → user bubble → typing dots → assistant streams the crowdfunding explanation. Small persistent StageBadge "01 · knows your challenge" top-left. |
| 950–1020 | 0:32–0:34 | **Interstitial 02** | "It checks it **clicked**". Same treatment. |
| 1020–1470 | 0:34–0:49 | **Chapter 02 — demo** | Framing B *(new)*: the live panel lifts out of the page and floats **centered on a clean branded canvas**, soft shadow, particles drifting at two depths behind it (Gondor's floating-UI-in-whitespace composition; trivial for us because the panel is live DOM). Quiz exchange runs here — the layout change resets attention for the longest chapter. Green flash on the "Perfect!" bubble. |
| 1470–1540 | 0:49–0:51 | **Interstitial 03** | "**Hints**, never answers". |
| 1540–1840 | 0:51–1:01 | **Chapter 03 — demo** | Framing C: blur-push back onto the page, slightly tighter zoom (~1.6x) for the punchline. User types "ok just write the withdraw function for me 😅" → assistant declines + mapping hint. |
| 1840–1910 | 1:01–1:04 | **Interstitial 04** | "Then take it **local**". |
| 1910–2090 | 1:04–1:10 | **Chapter 04 — handoff** | Camera pulls back to 1x, assistant streams the short handoff line. Then the page fades down and the **orbiting-icons beat** plays (~3s): browser icon, terminal icon, Claude Code / Cursor icons orbit deterministically (sin/cos) around a `/start` monospace chip, then settle in a row. Playful, abstract, Gondor's USDC-loop moment. |
| 2090–2200 | 1:10–1:14 | **Proof beat** *(new)* | Giant serif stat scales/fades in on clean canvas, particles drifting: "**Live on every AI-ready challenge**" with sub "Available now for all registered builders". (If a real number reads stronger at render time — challenges count or builders count — use it, Gondor-style: big number top, small sub under.) |
| 2200–2360 | 1:14–1:19 | **Outro** | v2 outro family: sprite + serif "Learn Solidity with a teacher **on the page**", teal bar. |
| 2360–2460 | 1:19–1:22 | **Minimal end card** *(new)* | Everything fades except centered serif "speedrunethereum.com". Hold ≥60 frames, fade to background. Nothing else on screen. |

## Chat script (exact content to animate)

Same as v2 except Chapter 02's typed answer is shortened (reads faster, chapter was the longest) and Chapter 04's handoff is tightened because the orbiting-icons beat now carries half its meaning. Streaming at 2.0–2.5 chars/frame.

**Chapter 01**

- Suggestion chip clicked (becomes user bubble): `Let's start learning! Walk me through the challenge`
- Assistant: `Crowdfunding is a perfect first dApp: a group of strangers pool money together without trusting each other — they only have to trust the code.\n\nIf enough ETH is collected before a deadline, the funds go to the recipient. If not, everyone gets their money back. No middleman, no escrow service, no "trust me bro."\n\nThe rules are enforced by the smart contract itself — once deployed, nobody can change them.`

**Chapter 02**

- Assistant: `Does this make sense? Want me to test your understanding with a quick question?`
- User types: `yes pls`
- Assistant: `Try to answer this: why don't contributors need to trust each other — or a middleman — in this system? What enforces the rules?`
- User types: `the smart contract — if the goal isn't reached, everyone just gets refunded`
- Assistant: `Perfect! You've got it:\n• Success: enough ETH before the deadline → funds go to the recipient\n• Failed: goal not reached → everyone gets their money back\n\nNice, let's move on to tracking contributions on-chain...`

**Chapter 03**

- User types: `ok just write the withdraw function for me 😅`
- Assistant: `Nice try 🙂 I won't hand you the code — you'd learn nothing.\n\nBut here's a hint: the contract needs to know how much each person contributed, not just the total. On-chain that's a mapping — think of it as a dictionary from each address to the amount they've sent.\n\nGive it a shot!`

**Chapter 04**

- Assistant: `You're ready to build. Set it up locally, open it in Claude Code or Cursor, and run /start for the full AI tutor — no limits.\n\nSee you at the finish line 🏁`

## Editorial interstitials (replace UseCaseCard/StageBadge chapter cards)

| # | Phrase (teal keyword bold) | Notes |
| --- | --- | --- |
| 01 | A teacher that **knows** your challenge | |
| 02 | It checks it **clicked** | |
| 03 | **Hints**, never answers | Pays off the header tagline before the refusal scene |
| 04 | Then take it **local** | |

Spec: full-screen card on the theme background, Playfair Display ~72px, centered, ~70 frames total. Words reveal sequentially (opacity 0→1 + translateY 8→0, ~6 frames apart, cubic out) — Gondor's word-by-word sync technique. Sparse particle layer drifts behind at 0.15 opacity. Enter/exit via blur-push (see Transitions). During the following chapter, a small `StageBadge`-style chip ("01 · knows your challenge") persists top-left so context isn't lost.

## Framing & camera

- **Hook / problem / interstitials / proof / outro / end card:** 1x, clean canvas compositions with generous whitespace — one focus per scene (Gondor rule #8).
- **Chapter 01 & 03:** right-anchored zoom on the panel over the page (1.5x, then 1.6x in ch03), `calcRightAnchorTx`/`calcBottomAnchorTy`, 45-frame cubic in-out eases. Page dimmed to brightness 0.92 while zoomed.
- **Chapter 02:** panel detaches and floats centered at 1x on the branded canvas — border-radius 16, soft shadow (0 24px 80px rgba(0,0,0,.18)), width ~520px so chat text is ≥24px effective. The detach itself is animated: page + panel blur out together, panel alone blurs back in centered.
- **Chapter 04:** pull back to 1x showing panel + page, then fade page for the orbit beat.
- Readability rule unchanged: chat text ≥22px effective at 1080p in every framing.

## Motif layer (continuity)

`FloatingParticles` (existing intro/outro component) becomes a shared layer rendered in: hook, problem beat, all four interstitials, chapter 02's canvas (behind the panel, two parallax depths), proof beat, outro. Opacity 0.1–0.2 outside intro/outro, deterministic drift. This is the Gondor clouds job: one world, not "branded cards + screen recording".

## Transitions

- **Blur-push** between acts and around interstitials: outgoing scene animates `filter: blur(0→10px)` + scale 1→1.04 + opacity →0 over ~18 frames; incoming reverses. Replaces plain crossfades everywhere except inside chapters.
- Hard cuts only *within* a chapter (message appears, cursor click) — never between scenes.
- No glitch/neon/whip effects (Gondor rule #7).

## Orbiting-icons beat (Chapter 04, ~frames 1990–2090)

Icons: browser/globe, terminal, Claude Code mark, Cursor mark — flat teal-on-dark circles, 72px. They enter from screen edges, orbit a centered monospace chip reading `/start` using deterministic sin/cos (radius ~180px, one revolution ≈ 80 frames, per-icon phase offset), then decelerate and settle into a horizontal row above the chip. Confirmation SFX as they lock in. Pure fun-abstraction, mirrors Gondor's USDC loop scene.

## Execution plan deltas vs v2

**New components**

- `EditorialInterstitial.tsx` — phrase card with word-by-word reveal + keyword accent prop.
- `ProblemBeat` scene — builder-frozen art + editorial line (can reuse EditorialInterstitial internals).
- `ProofBeat` scene — big serif stat + sub (same family).
- `OrbitIcons.tsx` — deterministic orbit + settle.
- `BlurPush` transition helper (wraps two sequences; animated blur/scale/opacity).
- `WebChatPanel` gains a `floating` mode (centered card on canvas) in addition to the in-page drawer mode.

**Dropped from v2**

- `UseCaseCard` full-screen chapter cards (interstitials replace them; keep only the small persistent badge).
- Second hook line in the intro (moved conceptually into the problem beat).

**Unchanged from v2**

- `WebChatPanel` message/typing engine (`ChatMsg`, `InputAction` APIs from `CursorChatPanel`), auto-scroll behavior.
- `AnimatedCursor`, `PixelGirlSprite`, `theme.ts`, Playfair Display.
- Backdrop: `ss3.png` at native 1920px, dimmed while zoomed.
- Audio: `ai-tutor-video-music.mp3` bed ~0.15 (consider a quieter/filtered 4-bar section under the problem beat), `sfx/confirmation.ogg` on sends/clicks/icon lock-ins, `mechanical-keyboard.mp3` during typing.

**Optional (decide before build): voiceover**

Gondor is edited to narration; it's the spine of their rhythm. If a VO is acceptable (even AI-generated), the interstitial phrases + a ~110-word script become the narration and the video can tighten by ~8–10s (viewers listen faster than they read). If not, the interstitials serve as the narration spine — every act change must land on one.

## Suggested X post copy (unchanged from v2)

Meet the AI Teaching Assistant — live now on SpeedRunEthereum 🧑‍🏫

Open any AI-ready challenge and a teacher is right there on the page: it explains the concepts, checks your understanding, and gives hints — never the answers.

When it clicks, take it local: run /start in your IDE for the full AI tutor.

Available now for all registered builders.
