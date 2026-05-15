## docs/MVP.md

# Airbotix Website – MVP PRD

> **⚠️ Historical doc (2025).** Scope is the **marketing site only**. The broader Kids AI Platform (`airbotix-app` + `teacher-console` + `platform-backend` + `kids-opencode`) is governed by `docs/product/prd/kids-ai-platform-prd.md` (v0.4+). Items in "§3 Out of Scope" below have been re-scoped into separate sibling repos — read the current PRD for authoritative direction.

## 1. Objective
Build an **international static website (EN + 中文)** to showcase Airbotix’s brand, programs, and contact channel.  
Target: **Launch fast, professional, SEO-friendly**, ready for GitHub Pages hosting.

---

## 2. Scope (MVP Features)

### ✅ Core Pages
1. **Homepage**
   - Hero banner (video/photo background + tagline)  
   - Company intro (Who We Are)  
   - Services overview:
     - **Educational Workshops**: AI & Robotics programs for schools and communities
     - **Teaching Tools & Equipment**: Robotics kits, sensors, and educational materials
     - **Distribution Services**: Global robotics brand partnerships and supply chain solutions
   - Why Choose Us (key highlights)  
   - Media (photo carousel / video embed)  
   - CTA section (Book a Workshop / Contact)  

2. **Workshops**
   - Workshops list page  
   - Workshop detail page (seed with *AI & Robotics for Beginners*)  
     - Overview, target audience, duration  
     - Highlights, syllabus (week by week)  
     - Media gallery (photos + video placeholders)  
     - Learning outcomes  

3. **Products**
   - Showcase robotics teaching tools & global robotics brands  
   - Product cards with images, specs, “Contact Us for Purchase” CTA  

4. **Partnerships**
   - Logos of schools, councils, global partners  
   - Text: “Trusted by educators & communities”  

5. **About Us**
   - Mission & vision  
   - Team introduction (basic version)  
   - Link to LinkedIn page  

6. **Contact / Booking**
   - Contact form (name, email, role: school/parent/other, message)  
   - Workshop booking inquiry form  
   - Newsletter subscription  

---

### ✅ Multi-language
- Default EN, toggle for 中文  
- All main content translated (static JSON for i18n)

---

### ✅ Media Integration
- Video embed (YouTube/Vimeo or local mp4 placeholder)  
- Photo gallery slider

---

### ✅ Technical
- Tech stack: React + Vite + TailwindCSS  
- Routing: React Router (HashRouter for GitHub Pages)  
- Deployment: GitHub Pages  
- SEO: Title/description tags per page, OG tags, alt text for media  

---

## 3. Out of Scope for marketing site (resolved by sibling repos as of 2026-05)
- ~~Online payment / Stripe integration~~ → **Airwallex** in `platform-backend`
- ~~Parent / student portals~~ → `airbotix-app` (`/portal/*` + `/learn/*`)
- ~~Super-admin management system~~ → `teacher-console` (super-admin deleted 2026-05-14)
- ~~E-commerce checkout~~ → Airwallex hosted checkout via `platform-backend`
- ~~Consent / legal document signing~~ → `airbotix-app` `/portal/register` + Parental Consent flow  

---

## 4. Deliverables
- Fully responsive static website  
- Pages: Home, Workshops (list + detail), Products, Partnerships, About, Contact  
- i18n support EN/中文  
- Deployment guide (README with GitHub Pages steps)  

---

## 5. Success Criteria
- ✅ Deployed on GitHub Pages and accessible globally  
- ✅ Fast load (<2s) and responsive across devices  
- ✅ Clear CTA for workshop inquiries/contact  
- ✅ SEO-ready with English + Chinese keywords  

---


## README.md – Phase 1 Scope Section

### Phase 1: MVP Website Scope
- Static website using **React + Vite + TailwindCSS**  
- Deployment to GitHub Pages with HashRouter  
- Core Pages: Home, Workshops (list + detail), Products, Partnerships, About, Contact  
- Multi-language: EN + 中文  
- Media support: video embed & photo carousel  
- SEO-ready: titles, meta, OG tags, alt text  
- Contact form + booking inquiry + newsletter subscription  

Out of Scope for MVP: Online payments, portals, e-commerce, consent/legal forms, advanced admin system.

