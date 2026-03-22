Scroll-Driven Frame Animation – Implementation Spec
Objective

Create a high-performance Apple-style landing page animation where the animation is controlled by the user's scroll.

The animation must display a sequence of frames extracted from a video using FFmpeg, and render them smoothly in the browser using HTML Canvas.

The goal is to replicate the cinematic storytelling style used in modern product landing pages.

1. Frame Extraction Pipeline

The source animation is a video render exported from Blender.

Frames are extracted using FFmpeg.

Example command:

ffmpeg -i render.mp4 -vf "fps=30,scale=1600:-1" frames/frame_%04d.webp

Explanation:

input video: render.mp4

extract at 30 fps

resize to 1600px width

export to WebP format

sequential naming

Example output:

frames/
frame_0001.webp
frame_0002.webp
frame_0003.webp
frame_0004.webp
...
2. Project Structure

The project should follow this structure:

project
│
├── index.html
├── styles.css
├── script.js
│
└── frames
    ├── frame_0001.webp
    ├── frame_0002.webp
    ├── frame_0003.webp
    └── ...
3. Page Layout

The page contains a large scroll area with a sticky canvas animation.

Layout concept:

Scroll area (200vh - 300vh)

┌─────────────────────────┐
│                         │
│   Sticky Canvas Area    │
│                         │
└─────────────────────────┘

Requirements:

animation container must be sticky

canvas must remain fixed while frames change

scroll progress controls animation progress

4. HTML Requirements

The HTML must include:

animation container

canvas element

optional headline overlay

Example structure:

<section class="scroll-animation">
  <canvas id="hero-canvas"></canvas>
</section>
5. CSS Requirements

The layout must:

create long scroll space

keep the canvas sticky

center the animation

maintain responsive scaling

Key behaviors:

section height: 200vh+
canvas position: sticky
canvas top: 0
canvas width: 100%
canvas height: 100vh

The canvas should always fill the viewport.

6. JavaScript Logic

The animation must:

preload frames

map scroll progress → frame index

render frames on canvas

Required logic:

scroll position
→ scroll progress
→ frame index
→ draw frame on canvas

Frame calculation:

frameIndex = scrollProgress * frameCount
7. Performance Requirements

The implementation must include:

Lazy loading

Load frames progressively.

Canvas rendering

Render images on Canvas instead of <img>.

requestAnimationFrame

Use requestAnimationFrame for rendering.

WebP frames

Use compressed WebP frames.

8. Frame Loading Logic

Frames should be dynamically generated in code.

Example naming pattern:

frame_0001.webp
frame_0002.webp
frame_0003.webp

Total frame count example:

120 frames

The script must generate frame URLs automatically.

9. Scroll Mapping

Scroll progress formula:

scrollTop / (documentHeight - windowHeight)

This produces a value between:

0 → 1

Frame index calculation:

frameIndex = Math.floor(progress * frameCount)
10. Rendering Logic

Each scroll update must:

calculate frame index

load corresponding image

draw image on canvas

Rendering flow:

scroll event
→ calculate progress
→ determine frame
→ draw frame
11. Sticky Animation Behavior

The animation section should behave like this:

User scrolls

Animation plays

Canvas remains fixed

Frames change with scroll

After animation finishes, page scroll continues normally.

12. Optional Enhancements

Claude may optionally include:

Smooth scrolling

Using a library such as:

Lenis

GSAP ScrollTrigger

Responsive scaling

Canvas scaling based on viewport size.

Progressive preloading

Load frames ahead of the current frame.

13. Target Performance

The implementation should support:

60 FPS rendering
100–200 frames
smooth scroll animation
minimal layout reflow
14. Final Output Expected

Claude should generate:

index.html

styles.css

script.js

All code must be complete and ready to run.

The result should display a scroll-driven frame animation landing page similar to modern Apple product pages.

If possible, Claude should also include:

frame preloading strategy

performance optimizations

responsive canvas rendering

Se quiseres, posso também dar-te um segundo .MD muito mais avançado que muitos devs usam para gerar sites Apple-style completos com Claude, incluindo:

preloading inteligente de 300+ frames

smooth scroll tipo Apple

suporte para Three.js

pipeline Blender → FFmpeg → Landing page.