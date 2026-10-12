# KCET 2027 Counselling Guidance — Physics Pep Talk

A modern, fully static website for the **KCET 2027 Counselling Guidance service** by **Physics Pep Talk**.

**Live site:** https://kcetcounselling.physicspeptalk.com

**Parent brand:** https://physicspeptalk.com

---

## Tech Stack

- **Vite** — build tool
- **React 18** + **TypeScript** — UI framework
- **Tailwind CSS 3** — utility-first CSS
- **GitHub Pages** — static hosting (no server required)
- **GitHub Actions** — CI/CD deployment

---

## Project Structure

```
councelling_landingpage/
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions: build & deploy to Pages
│
├── public/
│   ├── CNAME                   # Custom domain: kcetcounselling.physicspeptalk.com
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── favicon.svg
│   └── images/                 # Add optimized WebP/AVIF images here
│
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Sticky nav + mobile hamburger
│   │   ├── Hero.tsx            # Hero section
│   │   ├── Services.tsx        # 4 service cards
│   │   ├── HowItWorks.tsx      # 4-step process
│   │   ├── OptionEntry.tsx     # Why option entry matters
│   │   ├── WhatYouGet.tsx      # Deliverables grid
│   │   ├── TrustSection.tsx    # No false promises
│   │   ├── RoundSupport.tsx    # Round-by-round timeline
│   │   ├── FAQ.tsx             # Accordion FAQ
│   │   ├── Contact.tsx         # Enquiry form → WhatsApp
│   │   ├── FinalCTA.tsx        # Final call to action
│   │   ├── Footer.tsx          # Site footer
│   │   └── MobileCTA.tsx       # Fixed bottom bar (mobile only)
│   │
│   ├── config/
│   │   └── siteConfig.ts       # ALL configurable values (phone, WhatsApp, email…)
│   │
│   ├── pages/
│   │   ├── PrivacyPolicy.tsx   # /privacy-policy page
│   │   └── Terms.tsx           # /terms page
│   │
│   ├── App.tsx                 # Root app with path-based routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind directives + base styles
│
├── index.html                  # Main entry (full SEO meta + JSON-LD)
├── privacy-policy.html         # Entry for /privacy-policy (Vite MPA)
├── terms.html                  # Entry for /terms (Vite MPA)
├── package.json
├── tsconfig.json
├── vite.config.ts              # Vite config: base="/", MPA build
├── tailwind.config.js
└── README.md
```

---

## Local Development

### Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm 9+

### Install dependencies

```bash
npm install
```

### Start dev server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Production build

```bash
npm run build
```

The built static files are output to `dist/`.

### Preview the production build locally

```bash
npm run preview
```

---

## Configuration

All configurable values are in one file:

```
src/config/siteConfig.ts
```

Before deploying, update:

```ts
whatsappNumber: "919876543210",  // +91 98765 43210 — no + or spaces
phoneNumber: "+91 98765 43210",
email: "contact@physicspeptalk.com",
ga4MeasurementId: "G-XXXXXXXXXX",  // from Google Analytics
```

The WhatsApp number must be in international format without `+` or spaces
(e.g., `919876543210` for +91 98765 43210).

---

## GitHub Pages Deployment

### Step 1 — Create GitHub repository

Create a new repository on GitHub (public or private).

### Step 2 — Push the project

```bash
cd councelling_landingpage
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. Go to the repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save

### Step 4 — The GitHub Actions workflow deploys automatically

Every push to `main` triggers the deploy workflow at:
`.github/workflows/deploy.yml`

The workflow:
1. Checks out the repository
2. Sets up Node.js 20
3. Runs `npm ci`
4. Runs `npm run build`
5. Deploys `dist/` to GitHub Pages

### Step 5 — Configure the custom domain

In the GitHub repository:
1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter: `kcetcounselling.physicspeptalk.com`
3. Click **Save**
4. Enable **Enforce HTTPS** once the domain is verified

The `public/CNAME` file already contains the custom domain so it will
be preserved through every deployment.

---

## DNS Configuration

To point `kcetcounselling.physicspeptalk.com` to GitHub Pages, add a
**CNAME DNS record** with your DNS provider:

| Type  | Host                        | Value                      |
|-------|-----------------------------|----------------------------|
| CNAME | `kcetcounselling`           | `YOUR_USERNAME.github.io`  |

Replace `YOUR_USERNAME` with your actual GitHub username.

DNS changes may take a few minutes to 48 hours to propagate.

**Important:** This only adds a new subdomain record. It does NOT affect
other existing DNS records or websites.

For GitHub's current official instructions, see:
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

---

## Google Search Console Setup

1. Go to https://search.google.com/search-console
2. Add property: `https://kcetcounselling.physicspeptalk.com/`
3. Verify ownership (recommended: HTML file method or DNS TXT record)
4. Once verified, submit the sitemap:
   `https://kcetcounselling.physicspeptalk.com/sitemap.xml`

The site is ready for Search Console from day one:
- `robots.txt` allows all crawlers
- `sitemap.xml` lists all pages
- Canonical URLs are correctly set
- JSON-LD structured data is included

---

## Google Analytics 4

1. Create a GA4 property at https://analytics.google.com
2. Get your Measurement ID (e.g., `G-XXXXXXXXXX`)
3. Uncomment and update the GA4 script block in `index.html`
4. Do NOT commit real Measurement IDs if you want to keep them private
   (they are public-facing client IDs, but you may prefer to keep them
   out of version control)

---

## Adding New Pages (Blog / SEO Content)

The project is structured for easy expansion.

To add a new static page (e.g., `/blog/kcet-option-entry-guide`):

1. Create the page component in `src/pages/`
2. Create a corresponding HTML entry file (e.g., `blog/kcet-option-entry-guide.html`)
3. Add the entry to `vite.config.ts` under `rollupOptions.input`
4. Add the URL to `public/sitemap.xml`
5. Add the path to the routing logic in `src/App.tsx`

---

## Contact / Enquiry Form

The contact form uses a **WhatsApp click-to-chat flow** — no backend
required. When the user clicks "Request Counselling via WhatsApp", the
browser opens WhatsApp with the form data pre-filled as a message.

This works entirely on the client side and requires no server, API, or
serverless function.

---

## Production Checklist

### GitHub Pages

- [x] `npm run build` produces static files in `dist/`
- [x] No backend, SSR, API routes or server required
- [x] GitHub Actions workflow deploys on push to `main`
- [x] `public/CNAME` contains `kcetcounselling.physicspeptalk.com`
- [ ] DNS CNAME record configured
- [ ] HTTPS enforced in GitHub Pages settings

### SEO

- [x] Correct page title
- [x] Correct meta description
- [x] Canonical URL: `https://kcetcounselling.physicspeptalk.com/`
- [x] Open Graph metadata
- [x] Twitter Card metadata
- [x] `sitemap.xml` in `public/`
- [x] `robots.txt` in `public/`
- [x] JSON-LD structured data (Organization, WebSite, Service, WebPage)
- [x] Correct heading hierarchy (h1 → h2 → h3)

### Website

- [x] Fully responsive
- [x] Mobile CTA bar (WhatsApp + Call)
- [x] WhatsApp enquiry flow
- [x] FAQ accordion
- [x] Navigation with anchor links
- [x] Privacy Policy page at `/privacy-policy`
- [x] Terms page at `/terms`

### Content

- [x] No false admission guarantees
- [x] No fake testimonials or statistics
- [x] Honest disclaimer on every CTA
- [x] Professional tone
- [x] Correct spelling: "Counselling" (double-l)

---

## License

© 2026 Physics Pep Talk. All rights reserved.
# peptalkcounselling
# puc
