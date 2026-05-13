# Monje360 — Rediseño 2026

Web brutal con motion. Vanilla HTML/CSS/JS · GSAP + ScrollTrigger + Lenis vía CDN. Sin build step.

## Estructura

```
monje360-web/
├── index.html         Home con hero gigante, manifiesto, servicios sticky, casos, proceso, stats, testimonios, CTA
├── servicios.html     Detalle de los 4 servicios
├── casos.html         Selección de portfolio
├── sobre.html         Quiénes somos · valores · números
├── contacto.html      Formulario + datos directos
├── blog.html          Listado de notas
├── styles.css         Design system completo (tokens, tipografía, layout, componentes)
├── script.js          Motion engine (Lenis, GSAP, ScrollTrigger, cursor, marquee, magnetic)
├── img/               Recursos gráficos (vacío por ahora — las cases usan gradientes generativos)
├── vercel.json        Headers y cache para Vercel
└── .gitignore
```

## Design system

- **Color:** negro `#000` · papel `#F4F1EA` · acento lima eléctrico `#C6F600` · grises `#0B0B0B` / `#161616` / `#2A2A2A`
- **Tipografía:** Bricolage Grotesque (display variable) · Inter (body) · JetBrains Mono (labels)
- **Escala fluida:** todo con `clamp()` — escala bien de 360px a 1680px
- **Grano sutil** vía SVG `feTurbulence` en `body::before`
- **Animaciones:** 150–320ms con easings cubic-bezier (`--ease-out`, `--ease-spring`)
- **Cursor personalizado:** se desactiva en touch y con `prefers-reduced-motion`

Cambia el acento editando `--acid` en `styles.css:7`. Todo el sistema se actualiza.

## Motion incluido

- Lenis smooth scroll sincronizado con ScrollTrigger
- Intro overlay con contador 000 → 100 (skip en `prefers-reduced-motion`)
- Reveal por palabras en hero y secciones (`data-hero-words`, `data-scroll-words`)
- Marquee infinito con skew dinámico según velocidad de scroll
- Pila sticky de servicios con scale progresivo (efecto card-stacking)
- Parallax en case art
- Contadores animados en stats
- Magnetic buttons con `data-magnetic`
- Custom cursor con mix-blend-mode difference

## Desarrollo local

Es vanilla, no requiere build. Cualquier servidor estático:

```bash
cd monje360-web
python3 -m http.server 5173
# abre http://localhost:5173
```

O con `npx serve .` si tienes Node.

## Deploy a Vercel

### Opción 1: CLI

```bash
cd monje360-web
npx vercel
# sigue el wizard. En las siguientes veces: npx vercel --prod
```

### Opción 2: GitHub → Vercel (recomendado)

1. Crea el repo y subelo:
   ```bash
   cd monje360-web
   git init
   git add .
   git commit -m "feat: nuevo sitio brutal + motion"
   git branch -M main
   git remote add origin git@github.com:TU_USUARIO/monje360-web.git
   git push -u origin main
   ```
2. Importa el repo en [vercel.com/new](https://vercel.com/new) — auto-detecta como static, sin build command.
3. Apunta el dominio `monje360.com` desde el panel de Vercel (DNS → A 76.76.21.21 o CNAME a `cname.vercel-dns.com`).

## Personalización rápida

| Quiero cambiar… | Editar |
|---|---|
| Acento eléctrico | `--acid` en `styles.css` |
| Tipografías | bloque `<link>` Google Fonts + `--font-*` en `:root` |
| Copy del hero | `index.html` sección `.hero` |
| Servicios | `index.html` `.services__stack` y `servicios.html` `.post-list` |
| Casos | `casos.html` `.cases__grid` (las artes son CSS, no imágenes) |
| Stats | `index.html` y `sobre.html` `.stats__grid` |
| Velocidad del marquee | `--track` en `.marquee__track { animation: marquee 28s ... }` |
| Intensidad del cursor | `is-hover` en `styles.css` |

## Roadmap sugerido

- [ ] Reemplazar las CSS-art de casos por imágenes reales (carpeta `img/`)
- [ ] Página de detalle de caso (`caso-yamaha.html`, etc.)
- [ ] Sustituir el `onsubmit` inline del formulario por endpoint real (Formspree / Vercel Functions)
- [ ] Sitemap.xml + robots.txt
- [ ] Schema.org (Organization + Service) para SEO
- [ ] Open Graph image custom (1200×630)
- [ ] Analítica (Plausible / Umami / Vercel Analytics)
