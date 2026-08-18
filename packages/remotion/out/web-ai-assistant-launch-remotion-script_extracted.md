# Análisis + script reproducible para vídeo tipo Remotion

**Archivo recibido:** `WebAIAssistantLaunch-v2.rar`  
**Vídeo extraído:** `WebAIAssistantLaunch-v2.mp4`  
**Tema:** AI Teaching Assistant integrado en SpeedRunEthereum  
**Duración:** 76.71s · **Formato:** 1920×1080 · 30fps · MP4 H.264 + AAC

---

## 2. Lectura general del vídeo

Es un vídeo de lanzamiento de una feature educativa: **AI Teaching Assistant** dentro de **speedrunethereum.com**.

La promesa principal:

> Cuando estás bloqueado leyendo un reto de Solidity, la documentación no te contesta. Ahora hay un profesor contextual dentro de la propia página del reto.

La pieza no funciona como vídeo con voiceover narrado tradicional. Tiene música/sonido ambiente, pero **Whisper no detectó narración inteligible**; produjo solo tokens irrelevantes (`©`, `A`, `う`). Por tanto, el guion real se construye desde:

- copy en pantalla,
- overlays numerados,
- flujo de UI,
- conversación simulada con el asistente.

Visualmente es un launch video limpio y didáctico:

- Fondo blanco/menta muy claro.
- Azul petróleo/teal como color de marca.
- Tipografía serif para claims grandes.
- UI real del challenge `Crowdfunding` en SpeedRunEthereum.
- Panel lateral de chat como protagonista.
- Overlays negros con sombra para explicar los beneficios.
- Transiciones suaves tipo fade/slide/zoom; casi todo ocurre sobre una web real.

---

## 3. Storyboard cronológico detallado

| Tiempo | Visual principal | Texto legible / copy | Movimiento / intención |
|---:|---|---|---|
| 0.0–1.5 | Pantalla casi blanca con degradado muy suave hacia menta. Barra inferior teal borrosa. | — | Intro limpia, espacio vacío para preparar reveal. |
| 1.5–2.5 | Aparece pequeño icono/mascota arriba, centrado. Debajo, título grande en serif. | `AI Teaching Assistant` | Fade-in elegante. El logo entra primero, luego el título. |
| 2.5–4.5 | Bajo el título aparece primera pregunta. | `Stuck reading a challenge solo?` + `Docs don’t answer back.` + `Now a teacher lives` | Texto se revela línea a línea; énfasis en `solo?` con color/acento. |
| 4.5–7.0 | Claim completo centrado, misma composición. | `AI Teaching Assistant` / `Stuck reading a challenge solo?` / `Docs don’t answer back.` / `Now a teacher lives right on the challenge page` | La última línea completa la promesa: asistente dentro de la página. |
| 7.0–9.0 | Corte/slide a captura de SpeedRunEthereum. Página de reto `Challenge: Crowdfunding`. | Header `speedrunethereum`; nav: `Portfolio`, `Builds`, `Build Prompts`. Título `Challenge: Crowdfunding`. Panel lateral `AI Teaching Assistant`. | Se pasa del claim abstracto al producto real. UI aparece amplia, casi full-screen. |
| 9.0–11.5 | La web queda a la izquierda/centro y el panel del assistant a la derecha. | Panel: `Learn the concepts`; texto: “Get grounded in the concepts before you dive into the code…” Botones: `Let’s start learning! Walk me through the challenge`, `Help me set up locally`, `I’m getting an error`. | El panel lateral entra/queda fijo, mostrando que vive dentro de la página. |
| 11.5–13.5 | Overlay negro grande centrado sobre la web. | `01` / `It knows your challenge` / `Context-aware help on every AI-ready challenge` | Primer beneficio: contexto. Overlay aparece con scale/fade, tipo tarjeta flotante. |
| 13.5–17.0 | El overlay se reduce a badge negro pequeño en la parte superior. Se sigue viendo página y chat. | Badge: `It knows your challenge` | La etiqueta queda como recordatorio mientras la UI muestra la prueba. |
| 17.0–24.5 | En el chat, el usuario activa el CTA de aprendizaje. El assistant responde con explicación. | Botón/mensaje usuario: `Let’s start learning! Walk me through the challenge`. Respuesta: explica que Crowdfunding es una app donde contributors juntan dinero sin confiar entre sí; si se alcanza suficiente ETH antes de deadline, fondos van al recipient; si no, se devuelve; sin middleman/escrow. | La conversación crece verticalmente dentro del panel. Muestra que el assistant sabe el challenge y no responde genérico. |
| 24.5–27.5 | Overlay negro grande número 02. | `02` / `It checks it clicked` / `Quick questions prove you really got it` | Segundo beneficio: comprensión activa. La tarjeta entra sobre la UI. |
| 27.5–31.5 | Overlay se encoge a badge superior. Chat añade una pregunta. | Assistant: `Does this make sense? Want me to test your understanding with a quick question?` Usuario: `yes pls` | Transición del modo explicación al modo evaluación. |
| 31.5–38.5 | El assistant pregunta al usuario. Aparece input y respuesta corta. | Assistant: `Try to answer this: why don’t contributors need to trust each other or a middleman — in this system? What enforces the rules?` Usuario empieza a responder. | La UI enseña que el aprendizaje no es pasivo; hay interacción. |
| 38.5–42.5 | Usuario da una respuesta incorrecta/parcial. Assistant corrige. | Usuario: `everyone just gets their money back` / luego respuesta destacada: `the smart contract enforces the rules — if we don't reach the goal, everyone just gets their money back` | El sistema no solo acepta; corrige y completa. |
| 42.5–47.5 | El assistant valida y resume condiciones. | `Perfect! You've got it:` + bullets: `Success: enough ETH before the deadline → funds go to the recipient`; `Failed: goal not reached → everyone gets their money back`; `Nice — let's move on to tracking contributions on-chain.` | Muestra feedback pedagógico y avance incremental. |
| 47.5–50.5 | Overlay negro grande número 03. | `03` / `Guides you, won’t give answers` / `Hints and teaching — never copy-paste solutions` | Tercer beneficio: tutor, no solucionador. La tarjeta flota sobre la conversación. |
| 50.5–55.5 | Usuario pide directamente la solución. | Usuario: `ok just write the withdraw function for me 😅` | Se plantea la tensión: el usuario quiere copiar/pegar. |
| 55.5–59.5 | Assistant rechaza dar código completo y ofrece pista. | `Nice try 😉 I won’t hand you the code — you’d learn nothing.` + `But here’s a hint: the contract needs to know how much each person contributed...` | Refuerza valor educativo: ayuda sin hacer trampas. |
| 59.5–62.0 | Overlay negro grande número 04. | `04` / `Then take it local` / `Continue in your IDE with the full AI tutor` | Cuarto beneficio: puente de web a IDE. |
| 62.0–67.5 | Overlay se encoge a badge. Assistant termina con instrucciones para entorno local. | Assistant: `You’re ready to build. Set the challenge up on your machine (Checkpoint 0), open it in Claude Code or Cursor, and run/start for the full AI tutor — no limits. See you at the finish line 🏁` | Cierra el flujo web → local development. |
| 67.5–69.5 | Zoom out / vista amplia de la página con assistant al lado. | Se ve de nuevo `Challenge: Crowdfunding` y el panel completo. | Última prueba de integración real en producto. |
| 69.5–76.7 | Pantalla final limpia con logo/dominio arriba y claim central. | `speedrunethereum.com` / `Learn Solidity with a teacher right on the page` / `AI Teaching Assistant · Available now for all registered builders` | CTA final. Hold largo para leer. Barra inferior teal permanece como acento. |

---

## 4. Guion traducido al formato de dirección / orquestador

### Objetivo
Crear un launch video de 76.7s, 16:9, para anunciar un asistente de IA educativo embebido en la página de retos de SpeedRunEthereum. El vídeo debe demostrar cuatro ideas:

1. El assistant vive justo en la página del challenge.
2. Entiende el contexto del reto.
3. Comprueba si el usuario lo ha entendido.
4. Guía sin regalar respuestas y luego lleva al usuario al entorno local/IDE.

### Tono

- Didáctico, calmado, limpio.
- Más “profesor dentro del producto” que “AI hype demo”.
- Visual de educación técnica premium, no SaaS genérico.
- El copy debe ser corto y legible, con claims grandes.

### Identidad visual

- **Canvas:** blanco con tinte menta muy claro `#F4FFFF` / `#F8FFFF`.
- **Acento:** teal/petróleo `#007C78` o similar.
- **Texto principal:** teal oscuro `#006A67`.
- **Overlays:** negro azulado casi sólido `#111827` con sombra, bordes redondeados.
- **UI:** screenshot real de SpeedRunEthereum, tonos claros, cyan/teal suave.
- **Tipografía title/CTA:** serif elegante, bold, editorial.
- **Tipografía UI/overlays:** sans rounded/clean.
- **Motion:** fade, slide, zoom lento; nada glitch/neón.

### Assets necesarios

```txt
assets/
  brand/
    speedrunethereum-logo.svg
    speedrunethereum-mascot.svg
  screenshots/
    challenge-crowdfunding-page.png
    ai-assistant-empty.png
    ai-assistant-learn-concepts.png
    ai-assistant-context-answer.png
    ai-assistant-quiz-question.png
    ai-assistant-quiz-corrected.png
    ai-assistant-refuses-code.png
    ai-assistant-local-ide.png
  ui/
    overlay-card-bg.png   # opcional, puede ser CSS
```

---

## 5. Copy reconstruido

### Intro

```txt
AI Teaching Assistant

Stuck reading a challenge solo?
Docs don’t answer back.
Now a teacher lives right on the challenge page
```

### Feature cards

```txt
01
It knows your challenge
Context-aware help on every AI-ready challenge
```

```txt
02
It checks it clicked
Quick questions prove you really got it
```

```txt
03
Guides you, won’t give answers
Hints and teaching — never copy-paste solutions
```

```txt
04
Then take it local
Continue in your IDE with the full AI tutor
```

### Chat flow — aproximado

```txt
Assistant panel title:
Learn the concepts

Get grounded in the concepts before you dive into the code. I’ll explain what this challenge is about, then help you test it up locally.

Buttons:
Let’s start learning! Walk me through the challenge
Help me set up locally
I’m getting an error
```

```txt
User:
Let’s start learning! Walk me through the challenge

Assistant:
Crowdfunding is a perfect first dApp: a group of strangers pool money together without trusting each other — they only have to trust the code.

If enough ETH is collected before a deadline, the funds go to the recipient. If not, everyone gets their money back. No middleman, no escrow, no “trust me bro”.

The rules are enforced by the smart contract itself — once deployed, nobody can change them.
```

```txt
Assistant:
Does this make sense? Want me to test your understanding with a quick question?

User:
yes pls

Assistant:
Try to answer this: why don’t contributors need to trust each other or a middleman — in this system? What enforces the rules?

User:
everyone just gets their money back

Assistant:
the smart contract enforces the rules — if we don't reach the goal, everyone just gets their money back

Perfect! You've got it:
• Success: enough ETH before the deadline → funds go to the recipient
• Failed: goal not reached → everyone gets their money back

Nice — let’s move on to tracking contributions on-chain.
```

```txt
User:
ok just write the withdraw function for me 😅

Assistant:
Nice try 😉 I won’t hand you the code — you’d learn nothing.

But here’s a hint: the contract needs to know how much each person contributed, not just the total. On-chain that’s a mapping — think of it as a dictionary from each address to the amount they’ve sent.

Give it a shot!

Assistant later:
You’re ready to build. Set the challenge up on your machine (Checkpoint 0), open it in Claude Code or Cursor, and run/start for the full AI tutor — no limits.

See you at the finish line 🏁
```

### CTA final

```txt
speedrunethereum.com

Learn Solidity with a teacher right on the page

AI Teaching Assistant · Available now for all registered builders
```

---

## 6. Estructura Remotion sugerida

```tsx
export const WebAIAssistantLaunch = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#F6FFFF' }}>
      <Audio src={staticFile('music-bed.mp3')} />

      <Sequence from={0} durationInFrames={210}>
        <IntroTitle />
      </Sequence>

      <Sequence from={210} durationInFrames={150}>
        <ProductReveal />
      </Sequence>

      <Sequence from={360} durationInFrames={390}>
        <KnowsYourChallenge />
      </Sequence>

      <Sequence from={750} durationInFrames={660}>
        <ChecksItClicked />
      </Sequence>

      <Sequence from={1410} durationInFrames={390}>
        <GuidesNoAnswers />
      </Sequence>

      <Sequence from={1800} durationInFrames={240}>
        <TakeItLocal />
      </Sequence>

      <Sequence from={2040} durationInFrames={260}>
        <FinalCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
```

> Frame rate asumido: 30fps. Duración total aproximada: 2301 frames.

---

## 7. Scene manifest para orquestador

```json
[
  {
    "id": "s01-intro",
    "start": 0.0,
    "end": 7.0,
    "visuals": [
      "warm pale mint/white background",
      "small SpeedRunEthereum mascot/logo centered at top",
      "large serif title AI Teaching Assistant",
      "three-line problem statement under title"
    ],
    "on_screen_text": [
      "AI Teaching Assistant",
      "Stuck reading a challenge solo?",
      "Docs don’t answer back.",
      "Now a teacher lives right on the challenge page"
    ],
    "motion": "logo fades in, title fades/slides up, supporting lines reveal sequentially, bottom teal glow bar appears subtly",
    "remotion_notes": "Use serif for title and main claim. Keep all centered with lots of whitespace."
  },
  {
    "id": "s02-product-reveal",
    "start": 7.0,
    "end": 12.0,
    "visuals": [
      "full webpage screenshot of speedrunethereum Challenge: Crowdfunding",
      "right-side AI Teaching Assistant drawer opens",
      "assistant panel shows Learn the concepts and CTA buttons"
    ],
    "on_screen_text": [
      "Challenge: Crowdfunding",
      "AI Teaching Assistant",
      "Learn the concepts",
      "Let’s start learning! Walk me through the challenge"
    ],
    "motion": "screenshot slides/scales into view; assistant drawer slides in from right; slight zoom to focus on drawer",
    "remotion_notes": "This scene establishes the assistant as native UI, not a separate chat app."
  },
  {
    "id": "s03-it-knows-your-challenge",
    "start": 12.0,
    "end": 25.0,
    "visuals": [
      "black feature card overlay with number 01",
      "card collapses to small top badge",
      "assistant answers the selected challenge contextually"
    ],
    "on_screen_text": [
      "01",
      "It knows your challenge",
      "Context-aware help on every AI-ready challenge",
      "Crowdfunding is a perfect first dApp..."
    ],
    "motion": "large overlay pops/fades in; after 2s scales down and moves to top center; chat messages reveal line by line",
    "remotion_notes": "Animate chat bubble height from 0 to content height; keep page behind slightly dim/soft."
  },
  {
    "id": "s04-it-checks-it-clicked",
    "start": 25.0,
    "end": 47.5,
    "visuals": [
      "feature card 02",
      "assistant asks if user wants a quick question",
      "user replies yes",
      "assistant asks conceptual question",
      "user gives partial answer",
      "assistant corrects and summarizes success/failure logic"
    ],
    "on_screen_text": [
      "02",
      "It checks it clicked",
      "Quick questions prove you really got it",
      "Does this make sense? Want me to test your understanding with a quick question?",
      "yes pls",
      "What enforces the rules?",
      "the smart contract enforces the rules"
    ],
    "motion": "overlay card enters; collapses to top badge; chat scroll/reveal continues; user bubbles appear in teal; assistant correction appears as highlighted teal bubble",
    "remotion_notes": "This is the longest product proof segment. Timing should let viewers read the question and correction."
  },
  {
    "id": "s05-guides-wont-give-answers",
    "start": 47.5,
    "end": 59.5,
    "visuals": [
      "feature card 03",
      "user asks for withdraw function",
      "assistant refuses to hand over code",
      "assistant gives conceptual hint about mapping address to amount"
    ],
    "on_screen_text": [
      "03",
      "Guides you, won’t give answers",
      "Hints and teaching — never copy-paste solutions",
      "ok just write the withdraw function for me 😅",
      "I won’t hand you the code — you’d learn nothing.",
      "the contract needs to know how much each person contributed... mapping..."
    ],
    "motion": "feature card appears; collapses to top badge; chat scrolls down; refusal and hint reveal separately",
    "remotion_notes": "Emphasize pedagogical stance: supportive but not cheating."
  },
  {
    "id": "s06-then-take-it-local",
    "start": 59.5,
    "end": 68.5,
    "visuals": [
      "feature card 04",
      "assistant suggests moving to local IDE",
      "webpage zooms out to show full challenge + assistant panel"
    ],
    "on_screen_text": [
      "04",
      "Then take it local",
      "Continue in your IDE with the full AI tutor",
      "Set the challenge up on your machine... open it in Claude Code or Cursor..."
    ],
    "motion": "large card center; collapse to badge; chat final message appears; camera zooms out to full browser composition",
    "remotion_notes": "Create bridge from in-browser learning to real building."
  },
  {
    "id": "s07-final-cta",
    "start": 68.5,
    "end": 76.7,
    "visuals": [
      "clean mint/white background",
      "small mascot and speedrunethereum.com at top",
      "large centered serif headline",
      "small subheading"
    ],
    "on_screen_text": [
      "speedrunethereum.com",
      "Learn Solidity with a teacher right on the page",
      "AI Teaching Assistant · Available now for all registered builders"
    ],
    "motion": "web UI fades out; CTA fades in; slow hold; bottom teal glow bar remains",
    "remotion_notes": "Do not add clutter. Final card should be readable for ~6 seconds."
  }
]
```

---

## 8. Prompt operativo para otro agente/orquestador

```txt
Build a 1920x1080, 30fps, 76.7s launch video for SpeedRunEthereum's AI Teaching Assistant.

Style: clean educational product launch, pale mint-white background, teal brand accents, serif headline typography, real product screenshots, black rounded feature cards with soft shadow, subtle bottom teal glow bar. Motion should be calm and readable: fade, slide, scale, slow zoom, chat message reveal. No neon, glitch, loud SaaS gradients, or overproduced AI hype.

Narrative:
1. Open with centered claim: “AI Teaching Assistant”. Problem: “Stuck reading a challenge solo? Docs don’t answer back. Now a teacher lives right on the challenge page.”
2. Reveal the SpeedRunEthereum Challenge: Crowdfunding page. Show the assistant drawer embedded on the right.
3. Feature 01: “It knows your challenge” — context-aware help on every AI-ready challenge. Show the assistant explaining Crowdfunding in plain language.
4. Feature 02: “It checks it clicked” — quick questions prove you really got it. Show the assistant asking a conceptual quiz and correcting the user.
5. Feature 03: “Guides you, won’t give answers” — hints and teaching, never copy-paste solutions. Show user asking for the withdraw function and the assistant refusing to provide full code, giving a mapping hint instead.
6. Feature 04: “Then take it local” — continue in your IDE with the full AI tutor. Show assistant telling the user to set up locally and open in Claude Code or Cursor.
7. End card: “speedrunethereum.com” and “Learn Solidity with a teacher right on the page”. Subheading: “AI Teaching Assistant · Available now for all registered builders”.

Use real UI screenshots as the main asset. Animate the feature cards in the center first, then collapse each to a small top badge while the UI proof plays underneath. Chat bubbles should appear in sequence and remain readable long enough. The final CTA should hold for at least 6 seconds.
```

---

## 9. Producción Remotion: componentes sugeridos

```tsx
const BRAND = {
  bg: '#F6FFFF',
  teal: '#007D78',
  tealDark: '#006462',
  mint: '#DDF7F5',
  overlay: '#111827',
};

function FeatureCard({ n, title, subtitle, progress }) {
  const scale = interpolate(progress, [0, 0.12, 0.75, 1], [0.96, 1, 1, 0.38]);
  const y = interpolate(progress, [0.75, 1], [0, -420]);
  const opacity = interpolate(progress, [0, 0.08, 0.95, 1], [0, 1, 1, 1]);

  return (
    <div style={{
      transform: `translateY(${y}px) scale(${scale})`,
      opacity,
      background: BRAND.overlay,
      color: 'white',
      borderRadius: 18,
      padding: '34px 54px',
      boxShadow: '0 24px 70px rgba(0,0,0,.25)',
      textAlign: 'center',
    }}>
      <div style={{ color: BRAND.teal, fontSize: 14, letterSpacing: 3 }}>{n}</div>
      <div style={{ fontSize: 44, fontWeight: 800 }}>{title}</div>
      <div style={{ marginTop: 10, color: '#A7B0BE', fontSize: 18 }}>{subtitle}</div>
    </div>
  );
}
```

```tsx
function ChatBubble({ children, side = 'assistant' }) {
  return (
    <div style={{
      alignSelf: side === 'user' ? 'flex-end' : 'flex-start',
      maxWidth: '82%',
      padding: '14px 18px',
      borderRadius: 16,
      background: side === 'user' ? BRAND.teal : '#E7FAF8',
      color: side === 'user' ? 'white' : '#224',
      fontSize: 16,
      lineHeight: 1.42,
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}
```

---

## 10. Qué hace bien este vídeo

- **No vende “AI” de forma abstracta.** Enseña un caso muy concreto: un builder leyendo un reto de Solidity.
- **El UI proof es casi todo el vídeo.** Después de 7 segundos ya estamos dentro del producto.
- **Los overlays estructuran la demo.** Cada claim tiene número, título y prueba en UI.
- **El assistant tiene postura pedagógica.** Corrige, pregunta y da pistas; no se limita a responder.
- **El CTA está alineado con la experiencia.** “Learn Solidity with a teacher right on the page” resume exactamente lo visto.

---

## 11. Diferencias con el vídeo de Gondor

| Aspecto | Gondor launch | Web AI Assistant launch |
|---|---|---|
| Motor narrativo | Voiceover continuo | Copy en pantalla + UI/chat |
| Estética | Institucional/fintech/NYC | Educativa/product-led/teal |
| Ritmo | Cinemático + demo | Demo sostenida con feature cards |
| Principal asset | Ilustraciones + UI | UI real + chat drawer |
| CTA | Dominio minimalista | Dominio + claim pedagógico |
| Orquestación | Storyboard por narración | Storyboard por UI states y overlays |

---

## 12. Reglas para reproducir esta fórmula

1. **Abrir con problema emocional corto.** “Stuck reading a challenge solo?” funciona porque es una situación real.
2. **Mostrar producto en menos de 10s.** No hacer intro larga.
3. **Usar feature cards numeradas.** Cada card debe ser un claim + una prueba visual inmediata.
4. **Mantener el screenshot estable.** El usuario debe entender que es una herramienta dentro de la página, no magia aislada.
5. **No saturar de animación.** Lo importante es leer la UI/chat.
6. **El chat debe tener micro-drama.** Usuario bloqueado → assistant explica → test → respuesta parcial → corrección → petición de solución → negativa útil → paso local.
7. **Terminar con un claim que reescriba la categoría.** No “Try our AI”; mejor “Learn Solidity with a teacher right on the page”.
