# OpShop Finder MVP Architecture

## Tech Stack
- Leaflet.js 1.9.x (via CDN)
- Vanilla JavaScript (ES6+)
- No frameworks or build tools
- Static HTML/CSS/JS for Railway deployment

## File Structure
```
opshop-finder/
├── index.html          # Single-page application entry point
├── css/
│   └── style.css       # Mobile-first responsive styles
├── js/
│   ├── map.js          # Leaflet map initialization
│   ├── markers.js      # Pin creation and colour-coding
│   ├── search.js       # Suburb/postcode search logic
│   ├── geolocation.js  # "Near me" GPS functionality
│   └── detail-panel.js # Shop detail popup/modal
└── data/
    └── gold-coast-opshops.json  # 40 shop dataset
```

## Component Map

### map.js
- Initialize Leaflet map centered on Gold Coast (-27.9833, 153.4000)
- Set zoom levels (min: 10, max: 18, default: 12)
- Add OpenStreetMap tile layer
- Expose map instance for other modules

### markers.js
- Load `data/gold-coast-opshops.json` via fetch()
- Create markers with colour-coded icons based on charity:
  - Vinnies: #0066CC (blue)
  - Salvos: #E60000 (red)
  - Lifeline: #00AA44 (green)
  - Other: #666666 (grey)
- Add click handlers to open detail panel
- Group markers for performance (Leaflet.markercluster if needed)

### search.js
- Text input for suburb or postcode
- Filter dataset and update visible markers
- "Clear search" button to reset
- Debounce input (300ms) for performance

### geolocation.js
- "Find shops near me" button
- Request browser geolocation permission
- Pan map to user location, show nearby shops
- Handle permission denied gracefully (fallback to search)
- Distance calculation (Haversine formula)

### detail-panel.js
- Slide-up panel (mobile) / sidebar (desktop)
- Display: name, address, suburb, phone, hours, website link
- Close button, click outside to dismiss

## Data Flow

1. **Load:** `fetch('data/gold-coast-opshops.json')` → parse to array
2. **Render:** Pass array to `markers.js` → create Leaflet markers
3. **Filter:** Search updates visible subset → re-render markers
4. **Select:** Click marker → populate and show detail panel

## Mobile-First CSS

### Breakpoints
```css
/* Mobile first */
default { /* 320px+ */ }
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

### Touch Targets
- Minimum 44px × 44px for buttons
- Adequate spacing between interactive elements

### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

### Key Mobile Patterns
- Map takes full viewport minus header/search bar
- Detail panel slides up from bottom (like native apps)
- Search bar fixed at top, collapsible on scroll
- Thumb-friendly controls at bottom right (locate button)

## Railway Deployment

### Static Site Config
- No server-side processing required
- Railway can serve static files directly
- Or use simple Node server: `npx serve .` in Procfile

### File Permissions
- All files should be readable (644)
- Directories executable (755)

### Recommended railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npx serve -s . -l $PORT"
  }
}
```

## Charity Colour Coding

| Charity | Hex | RGB | Usage |
|---------|-----|-----|-------|
| Vinnies | #0066CC | 0, 102, 204 | Blue markers |
| Salvos | #E60000 | 230, 0, 0 | Red markers |
| Lifeline | #00AA44 | 0, 170, 68 | Green markers |
| Other | #666666 | 102, 102, 102 | Grey markers |

## Error Handling

### Geolocation Denied
- Show friendly message: "Enable location access to find shops near you"
- Fall back to search by suburb
- Store preference (don't ask again this session)

### Data Load Fail
- Show error: "Unable to load shop data. Please refresh."
- Retry button
- Log to console for debugging

### Map Load Fail (Leaflet CDN)
- Fallback to message-only view with shop list
- "Map unavailable — showing list view"

## Performance Considerations

- Lazy load detail panel content
- Debounce search input
- Consider marker clustering if expanding beyond 40 shops
- Preload critical assets: Leaflet CSS/JS, data JSON

## Data Source Reference

The dataset at `~/.openclaw/workspace/gold-coast-opshops.json` contains:
- 40 Gold Coast op shops
- Schema: name, address, suburb, postcode, lat, lng, phone, website, hours, charity
- Load path (relative): `data/gold-coast-opshops.json`

## Build Checklist

- [ ] HTML validates (W3C)
- [ ] CSS mobile-first, no horizontal scroll
- [ ] JavaScript modules load in correct order
- [ ] All 40 shops render as markers
- [ ] Colour coding matches charity
- [ ] Search filters correctly
- [ ] Geolocation works (or degrades gracefully)
- [ ] Detail panel displays all fields
- [ ] Deploys successfully to Railway
