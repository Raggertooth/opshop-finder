# OpShop Finder — Product Brief

**Project:** OpShop Finder  
**Owner:** Southern Claw Labs  
**Status:** Active — Gold Coast MVP in development  
**Date:** 2026-04-17  
**Author:** ProductManager  

---

## 1. Vision Statement

OpShop Finder exists because finding op shops in Australia is harder than it should be. Information is fragmented across Google Maps, charity websites, word of mouth, and outdated Facebook posts. There is no single, reliable, purpose-built directory that lets you answer the simple question: *where are the op shops near me, and are they open right now?*

OpShop Finder solves this by being the definitive op shop directory for Australia — starting with the Gold Coast, then expanding state by state. It gives thrifting enthusiasts, bargain hunters, and charity supporters a fast, mobile-friendly way to discover, filter, and navigate to op shops in their area. For the charities behind these shops, it drives foot traffic and awareness at zero cost.

**Why this product, why now:**
- Op shopping is culturally significant in Australia — it is not a niche hobby, it is mainstream
- Existing solutions (Google Maps, Yelp) are not purpose-built and miss key data like opening hours, charity affiliation, and category specialisation
- No Australian competitor owns this space — first mover advantage is real
- Southern Claw Labs already has the technical infrastructure and distribution channels to build and ship this quickly

---

## 2. User Personas

### Persona 1: The Thrifting Enthusiast — "Sarah"

- **Age:** 24–35
- **Motivation:** Finds op shopping creative, sustainable, and social. Shares finds on Instagram and TikTok
- **Behaviour:** Plans weekend op shop runs across multiple suburbs. Values store variety and specialty categories (vintage clothing, homewares, books)
- **Pain point:** Discovers new shops through word of mouth or scattered social posts. Has no reliable way to plan a route
- **Needs:** Map view, category filters, "open now" indicator, save/favourite stores

### Persona 2: The Bargain Hunter — "Dave"

- **Age:** 35–55
- **Motivation:** Practical savings on household goods, clothing, and furniture. Budget-conscious
- **Behaviour:** Targets specific items (furniture, kids' clothes, kitchenware). Goes when convenient, not as a planned outing
- **Pain point:** Wastes time driving to shops that are closed or do not stock what they need
- **Needs:** Opening hours, category tags, proximity search, "near me" functionality

### Persona 3: The Charity Supporter — "Lyn"

- **Age:** 50–70
- **Motivation:** Wants to support specific charities (Lifeline, Vinnies, Red Cross). Donates and shops
- **Behaviour:** Loyal to particular charity brands. Wants to know which shops support which causes
- **Pain point:** Cannot easily find all locations for a specific charity in her area
- **Needs:** Charity/organisation filter, donation information, charity branding on listings

### Persona 4: The Tourist / New Resident — "James"

- **Age:** 20–40
- **Motivation:** Just moved to the area or visiting. Wants to explore the local op shop scene
- **Behaviour:** Does not know the area well. Relies on maps and proximity
- **Pain point:** No starting point. Does not know which suburbs have clusters of shops
- **Needs:** Area/density map, curated lists or highlights, simple onboarding

---

## 3. User Stories

### US-01: Discover nearby op shops
**As a** thrifting enthusiast  
**I want** to see all op shops near my current location on a map  
**So that** I can quickly find shops to visit without searching manually  

**Acceptance Criteria:**
- [ ] Map centres on user's current location (with permission) or a default location
- [ ] All op shops within the coverage area display as map pins
- [ ] Tapping a pin shows shop name, charity affiliation, and distance
- [ ] Map updates when user pans or zooms to a different area

### US-02: Check if a shop is open right now
**As a** bargain hunter  
**I want** to see whether a shop is currently open or closed  
**So that** I do not waste time travelling to a shop that is shut  

**Acceptance Criteria:**
- [ ] Each shop listing shows "Open" or "Closed" based on current day and time
- [ ] Opening hours are displayed for each day of the week
- [ ] A filter option exists to show "Open now" shops only

### US-03: Filter shops by category
**As a** thrifting enthusiast looking for specific items  
**I want** to filter op shops by category (clothing, furniture, books, homewares, etc.)  
**So that** I can find shops most likely to stock what I am after  

**Acceptance Criteria:**
- [ ] Each shop listing has one or more category tags
- [ ] Users can select one or more category filters
- [ ] Map and list views update to show only shops matching selected categories
- [ ] Filter state persists during the session

### US-04: Filter by charity organisation
**As a** charity supporter  
**I want** to filter shops by the charity they support (e.g., Lifeline, Vinnies, Red Cross)  
**So that** I can choose where my money goes  

**Acceptance Criteria:**
- [ ] Each shop listing shows the parent charity/organisation
- [ ] Users can filter by one or more charities
- [ ] Charity filter works alongside category and "open now" filters
- [ ] Charity logos or brand colours appear on listings where available

### US-05: Get directions to a shop
**As a** user who has found a shop they want to visit  
**I want** to get turn-by-turn directions from my current location  
**So that** I can navigate there easily  

**Acceptance Criteria:**
- [ ] A "Get directions" action launches the device's native maps app (Apple Maps / Google Maps)
- [ ] Destination is pre-populated with the shop's address and coordinates
- [ ] Works on both iOS and Android mobile browsers

### US-06: Search by suburb or postcode
**As a** new resident or tourist  
**I want** to search for op shops by suburb name or postcode  
**So that** I can explore shops in a specific area I plan to visit  

**Acceptance Criteria:**
- [ ] A search bar accepts suburb names and postcodes
- [ ] Search returns all op shops within the matched area
- [ ] Autocomplete suggests matching suburbs as the user types
- [ ] Invalid or out-of-scope searches show a helpful message

### US-07: View shop details
**As a** any user  
**I want** to tap into a shop listing and see full details (address, hours, categories, charity, phone, website)  
**So that** I have all the information I need before visiting  

**Acceptance Criteria:**
- [ ] Tapping a shop opens a detail view with: name, address, charity, categories, opening hours (all 7 days), phone, website link
- [ ] Detail view includes the "Get directions" action
- [ ] Detail view is shareable (native share sheet)

---

## 4. MVP Scope — Gold Coast

### In Scope (MVP)

| Feature | Notes |
|---------|-------|
| Gold Coast coverage only | All op shops in Gold Coast LGA and immediate surrounds |
| Map view | Interactive map with shop pins, clustering at zoom-out levels |
| List view | Scrollable list of shops sorted by distance |
| Shop detail cards | Name, address, charity, categories, opening hours, phone, website |
| "Open now" filter | Real-time open/closed status based on current time |
| Category filter | Clothing, Furniture, Books, Homewares, Electronics, Miscellaneous |
| Charity filter | Filter by parent organisation (Vinnies, Lifeline, Salvos, Red Cross, etc.) |
| Search by suburb | Suburb name and postcode search with autocomplete |
| Get directions | Launches native maps with shop coordinates |
| Mobile-first responsive | Optimised for mobile browsers; desktop works but is secondary |
| Static dataset | Shop data curated and maintained by the team (no user submissions yet) |

### Out of Scope (MVP)

| Feature | Reason |
|---------|--------|
| User submissions | Requires moderation workflow — post-MVP |
| User accounts / login | Not needed for MVP value proposition |
| Favourites / saved shops | Requires accounts or local storage — post-MVP |
| Reviews / ratings | Legal and moderation risk — post-MVP |
| Push notifications | Requires accounts and app — post-MVP |
| Native app (iOS/Android) | PWA or mobile web first; native app is post-MVP if traction justifies |
| Expansion beyond Gold Coast | Deliberately scoped to one region for validation |
| Donation information per shop | Data collection complexity — post-MVP |
| Admin panel | Internal tooling — post-MVP |
| Price range indicators | Unreliable data at scale — post-MVP |

---

## 5. Post-MVP Roadmap

### Phase 2: Gold Coast Enhancement (1–2 months post-launch)
- User submissions (with moderation queue)
- Favourite / saved shops (local storage, no account required initially)
- Shop photos (team-curated first; user-submitted later)
- Donation info per shop (what they accept, drop-off hours)
- Basic analytics dashboard (page views, search terms, popular shops)

### Phase 3: Brisbane & South-East QLD (3–4 months post-launch)
- Expand coverage to Brisbane LGA, Sunshine Coast, Toowoomba
- Sub-region navigation (Gold Coast vs Brisbane vs Sunshine Coast)
- Verify and deduplicate data as coverage grows
- Local SEO landing pages per suburb/region

### Phase 4: NSW Expansion (5–7 months post-launch)
- Sydney metro coverage (high shop density — data collection is the bottleneck)
- NSW regional coverage (Newcastle, Wollongong, Central Coast)
- State-level navigation in the UI
- Partnerships with NSW-based charity organisations for data

### Phase 5: National Coverage & Monetisation (8–12 months post-launch)
- VIC, SA, WA, TAS, NT, ACT expansion
- Admin panel for charity organisations to manage their own listings
- Featured / promoted listings (charities pay for premium placement)
- Native iOS/Android app (if PWA usage metrics justify investment)
- API access for third-party integrations

### Rough Sequencing Priority

1. **Gold Coast MVP** (now) → validate the concept works
2. **User submissions** → reduce data maintenance burden and increase coverage speed
3. **Brisbane/SEQ** → same state, low complexity, high density
4. **Admin panel** → charities self-manage, reduces our operational load
5. **NSW** → largest market, justifies the data collection effort
6. **National + monetisation** → scale and sustainability

---

## 6. Success Metrics

### Launch Metrics (First 30 Days)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Unique visitors | 500+ | Validates that people find the tool useful |
| Return visitors | 20%+ of unique | Shows the tool has ongoing value, not just curiosity |
| Shops viewed per session | 3+ average | Indicates users are browsing, not bouncing |
| "Get directions" actions | 100+ total | Proves the tool drives real-world foot traffic |
| Bounce rate | <60% | Users are finding value on the first page |
| Time on site | 2+ minutes average | Users are engaging with content, not leaving immediately |

### Growth Metrics (3 Months)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Monthly active users | 2,000+ | Sustainable usage beyond launch spike |
| User-submitted shops (post-Phase 2) | 20+ per month | Community is contributing — reduces our data burden |
| Suburb/region coverage | 30+ suburbs on Gold Coast | Comprehensive coverage, not just the obvious areas |
| Organic search traffic | 30%+ of total | SEO is working; users find us without paid acquisition |
| Charity organisation partnerships | 3+ | Charities see enough value to engage directly |

### Long-Term Health Metrics (6+ Months)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Data accuracy rate | 95%+ | Stale data kills trust — this is the product's core quality metric |
| User correction reports | <5% of listings per month | Low correction volume means data is staying current |
| Cost per user | <$0.05/month | Hosting and infrastructure stay lean |
| Expansion readiness | Data pipeline proven for new regions | We can expand without linear cost increase |

---

## 7. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|------------|
| R1 | **Data accuracy degrades** — opening hours, addresses, and store closures become stale over time | High | High | Establish a quarterly verification cycle. Prioritise user correction reports. Build towards charity self-management (admin panel) to shift burden. |
| R2 | **Legal exposure from scraped data** — scraping charity websites or Google Maps for shop data may breach terms of service or copyright | Medium | High | MVP uses manually curated data only. Post-MVP user submissions shift to community-sourced model. If scraping is used, verify terms of service and obtain permission where possible. Seek legal advice before any automated data collection at scale. |
| R3 | **Hosting costs scale unexpectedly** — if the product gains traction, map tile costs and database load could grow faster than revenue | Low | Medium | Use free-tier map tiles (OpenStreetMap) for MVP. Monitor costs weekly post-launch. Implement rate limiting and caching. Design architecture to stay lean on a single VPS or serverless tier initially. |
| R4 | **Competitor apps emerge** — an established player (Google, a charity federation, or another startup) launches a similar directory | Medium | Medium | First-mover advantage in the niche. Build brand and community loyalty early. Charity partnerships create defensibility — exclusive data feeds or co-branding. Speed to market matters more than feature completeness. |
| R5 | **Charity organisations resist listing** — some charities may not want their shops listed on a third-party site | Low | Medium | Position the product as free promotion and foot traffic driver. Offer charities direct input on their listings. Make opt-out simple and respected. |
| R6 | **User submission quality** — user-submitted shops may contain errors, duplicates, or inappropriate content once that feature launches | Medium | Medium | All user submissions go through a moderation queue before publishing. Build duplicate detection (matching on address + charity). Implement reporting/flagging for existing listings. |
| R7 | **Scope creep** — the product expands beyond op shops (markets, garage sales, vintage stores) before the core directory is solid | Medium | Low | Stay disciplined: op shops only until the Gold Coast directory is comprehensive and accurate. Expansion into adjacent categories is a Phase 5+ discussion, not a Phase 1 distraction. |
| R8 | **Single point of failure on data** — one person (Mark) maintains the dataset manually for MVP | High | High | Document the data collection process as an SOP. Prioritise user submissions and admin panel in the roadmap to distribute this load. Accept this as a known MVP constraint and plan to resolve it. |

---

## Appendix: Key Decisions

| Decision | Rationale |
|----------|-----------|
| Start with Gold Coast, not Sydney | Smaller dataset to validate the product. Mark is on the Gold Coast. Faster time to market. |
| Mobile web first, not native app | Lower development cost. No app store approval. PWA can deliver a near-native experience. Native app if metrics justify. |
| No user accounts in MVP | Reduces friction. The core value (find op shops) does not require login. Accounts come when personalised features (favourites, notifications) are needed. |
| Charity-branded listings | Differentiates from generic map directories. Builds trust with charity supporters. Creates potential for charity partnerships. |
| OpenStreetMap for map tiles | Free. No API key dependency. Sufficient quality for Australian urban areas. Can switch to a paid provider if usage justifies. |