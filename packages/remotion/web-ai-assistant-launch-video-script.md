# Web AI Teaching Assistant — Launch Video Script v2

Video: `WebAIAssistantLaunch`
Duration: ~72s (2160 frames @ 30fps, 1920x1080)
Audience: registered builders + community followers on X
Goal: professional, entertaining launch video that *shows the product working live*, matching the quality bar of `AITutorDemo` and the Foundry announcements.

## Why v1 was rebuilt

v1 was a Ken Burns slideshow: 9 static screenshots with pan/zoom, highlight rectangles, and a headline over a scrim. Problems:

- Zoomed PNGs go soft; the chat text (13px in product) is unreadable at any zoom the screenshot survives.
- Nothing *happens* — no typing, no streaming, no clicks. The other launch videos recreate the UI in React and animate it live; that's the house style and the quality gap.
- 9 near-identical beats with the same layout = monotonous.
- No branded intro/outro, no narrative hook.

v2 uses the **hybrid live-recreation** approach: the real challenge-page screenshot as the pixel-perfect backdrop, with the chat drawer **rebuilt as a live React component** animated on top — typed input, streaming replies, cursor clicks, camera zooms, chapter cards, sound design.

## Concept

One continuous product story on the Crowdfunding challenge page, told in 4 chapters (mirrors `AITutorDemo`'s use-case-card structure). The viewer watches a real session: open the assistant → it teaches the concept → it quizzes you → it refuses to hand out code → it sends you to your IDE.

## Timeline

Frame values are targets; final values follow the `AITutorDemo` timing rule — **60–80 frames of reading time after each AI message finishes streaming** before the next user action.

| Frames | Time | Scene | What happens on screen |
| --- | --- | --- | --- |
| 0–200 | 0:00–0:07 | **Hook / intro** | Branded intro identical in style to `AITutorDemo`: PixelGirlSprite + serif title "AI Teaching Assistant" top; hook lines fade in below: "Stuck reading a challenge *solo*?" → "Now a teacher lives **right on the page**." Floating particles, bottom teal bar. |
| 200–390 | 0:07–0:13 | **Reveal** | Crowdfunding challenge page fades in (real screenshot, `ss3`). AnimatedCursor glides to the sparkles FAB (bottom-right), click SFX, live chat drawer slides in from the right (420→460px panel). Camera eases into a right-anchored zoom (~1.5x) on the panel. |
| 390–780 | 0:13–0:26 | **Chapter 01 — "It knows your challenge"** | Full-screen chapter card → shrinks to top badge (UseCaseCard pattern). Empty state visible with the 3 real suggestion chips. Cursor clicks "Let's start learning! Walk me through the challenge" → chip becomes user bubble → typing dots → assistant streams the crowdfunding explanation (abridged, see chat script). |
| 780–1320 | 0:26–0:44 | **Chapter 02 — "It checks it clicked"** | Assistant asks to test understanding → user types "yes pls" (keyboard SFX) → assistant streams the quiz question → user types their answer → assistant streams "Perfect! You've got it" with the Success/Failed bullet recap. Subtle green flash on the confirmation bubble. |
| 1320–1680 | 0:44–0:56 | **Chapter 03 — "Guides you, won't give answers"** | User types "ok just write the withdraw function for me 😅" → assistant politely declines and gives a *hint* (mapping concept) instead. This chapter pays off the header tagline visible the whole time. |
| 1680–1890 | 0:56–1:03 | **Chapter 04 — "Then take it local"** | Assistant streams the handoff message: set up locally (Checkpoint 0), open in Claude Code / Cursor, run `/start` for the full AI tutor. Camera eases back to 1x showing panel + page together. |
| 1890–2160 | 1:03–1:12 | **Outro CTA** | Same outro family as `AITutorDemo`: sprite + "speedrunethereum.com" top, serif headline "Learn Solidity with a teacher **on the page**", sub "AI Teaching Assistant · Available now for all registered builders", bottom teal bar. |

## Chat script (exact content to animate)

All assistant copy is abridged from the real product conversation (screenshots `ss4`–`ss11`) so the video shows the true product voice. Streaming at 2.0–2.5 chars/frame.

**Chapter 01**

- Suggestion chip clicked (becomes user bubble): `Let's start learning! Walk me through the challenge`
- Assistant: `Crowdfunding is a perfect first dApp: a group of strangers pool money together without trusting each other — they only have to trust the code.\n\nIf enough ETH is collected before a deadline, the funds go to the recipient. If not, everyone gets their money back. No middleman, no escrow service, no "trust me bro."\n\nThe rules are enforced by the smart contract itself — once deployed, nobody can change them.`

**Chapter 02**

- Assistant: `Does this make sense? Want me to test your understanding with a quick question?`
- User types: `yes pls`
- Assistant: `Try to answer this: why don't contributors need to trust each other — or a middleman — in this system? What enforces the rules?`
- User types: `the smart contract enforces the rules — if we don't reach the goal, everyone just gets their money back`
- Assistant: `Perfect! You've got it:\n• Success: enough ETH before the deadline → funds go to the recipient\n• Failed: goal not reached → everyone gets their money back\n\nNice, let's move on to tracking contributions on-chain...`

**Chapter 03**

- User types: `ok just write the withdraw function for me 😅`
- Assistant: `Nice try 🙂 I won't hand you the code — you'd learn nothing.\n\nBut here's a hint: the contract needs to know how much each person contributed, not just the total. On-chain that's a mapping — think of it as a dictionary from each address to the amount they've sent.\n\nGive it a shot!`

**Chapter 04**

- Assistant: `You're ready to build. Set the challenge up on your machine (Checkpoint 0), open it in Claude Code or Cursor, and run /start for the full AI tutor — no limits.\n\nSee you at the finish line 🏁`

## Chapter cards (UseCaseCard → StageBadge, reused from AITutorDemo)

| # | Title | Subtitle |
| --- | --- | --- |
| 01 | It knows your challenge | Context-aware help on every AI-ready challenge |
| 02 | It checks it clicked | Quick questions prove you really got it |
| 03 | Guides you, won't give answers | Hints and teaching — never copy-paste solutions |
| 04 | Then take it local | Continue in your IDE with the full AI tutor |

## Execution plan

**New components**

- `components/WebChatPanel.tsx` — live recreation of the product drawer (`packages/nextjs/.../ChatWidget/index.tsx` is the source of truth for the design): secondary-teal header with sparkles icon, "AI Teaching Assistant / Guides you, won't give answers", reset + close buttons; suggestion chips (3 real ones); assistant bubbles left with sparkle avatar, user bubbles right in solid teal; loading-dots typing indicator; input bar with typewriter text + paper-plane send button. API copied from `CursorChatPanel` (`ChatMsg { appearFrame, streamCharsPerFrame }`, `InputAction { typeStartFrame, sendFrame }`) so the message/typing engine is reused, not rewritten. Auto-scroll: translateY the message column as content exceeds panel height, eased.
- `scenes/webassistant/` — hook, reveal, and outro scenes (hook/outro are light adaptations of the AITutorDemo ones — same sprite, particles, serif font, teal bar).

**Reused as-is**

- `AnimatedCursor` (FAB click, chip click, send clicks)
- `PixelGirlSprite`, `theme.ts`, Playfair Display serif for intro/outro
- `UseCaseCard` + `StageBadge` pattern and `getCamera` stage-zoom system from `AITutorDemo` (copy locally or extract to shared)
- Audio: `ai-tutor-video-music.mp3` bed at ~0.15, `sfx/confirmation.ogg` on every send/click, `mechanical-keyboard.mp3` during user typing

**Backdrop**

- Base layer = `ss3.png` (page without panel, FAB visible) via `staticFile`, shown at native 1920px. While the camera is zoomed on the panel, dim the page slightly (e.g. brightness 0.92) so the soft screenshot reads as intentional depth-of-field; the live DOM panel stays vector-crisp at any zoom.
- Readability rule: panel rendered at 460px width and framed by the camera so chat text is ≥22px effective on 1080p.

**Camera**

- 1x during hook/reveal/outro; right-anchored ~1.5x on the panel during chapters (use `calcRightAnchorTx`/`calcBottomAnchorTy` from AITutorDemo); ease in/out 45 frames with cubic in-out. Brief pull-back to 1x between chapters 03→04 for breathing room.

## Suggested X post copy

Meet the AI Teaching Assistant — live now on SpeedRunEthereum 🧑‍🏫

Open any AI-ready challenge and a teacher is right there on the page: it explains the concepts, checks your understanding, and gives hints — never the answers.

When it clicks, take it local: run /start in your IDE for the full AI tutor.

Available now for all registered builders.
