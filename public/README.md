# Public Assets Directory

This directory contains all client-side static files served by the Express application.

## Directory Structure

```
public/
├── index.html          # Main dashboard HTML
├── css/
│   └── styles.css      # Application styles
├── js/
│   └── app.js          # Client-side JavaScript
└── images/
    └── Logo.png        # Bricomarché logo and other images
```

## File Descriptions

### [index.html](index.html)
Main dashboard page featuring:
- Building management interface
- Weather and air quality displays
- Energy consumption monitoring
- Trane HVAC unit status
- Store hours and information
- Real-time data updates

### [css/styles.css](css/styles.css)
Complete styling for the dashboard:
- Dark theme design
- Responsive grid layouts
- Component-specific styles
- Animation and transitions
- Mobile-responsive breakpoints

### [js/app.js](js/app.js)
Client-side application logic:
- API data fetching
- Chart rendering with Chart.js
- Real-time clock and updates
- Section rotation logic
- Error handling and loading states

### [images/](images/)
Static images and assets:
- Company logos
- Icons and graphics
- Favicon

## Development Guidelines

### Modifying the Dashboard

1. **HTML Changes:**
   - Edit [index.html](index.html)
   - Maintain existing ID attributes for JavaScript
   - Follow accessibility guidelines (ARIA labels)

2. **Styling Updates:**
   - Edit [css/styles.css](css/styles.css)
   - Use CSS custom properties (variables) where possible
   - Test on multiple screen sizes

3. **JavaScript Features:**
   - Edit [js/app.js](js/app.js)
   - Keep API calls organized
   - Handle errors gracefully
   - Update loading states

### Adding New Assets

**Images:**
```bash
# Add images to images/ directory
public/images/new-image.png

# Reference in HTML
<img src="/images/new-image.png" alt="Description">
```

**Fonts:**
```css
/* Add to css/styles.css */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font.woff2') format('woff2');
}
```

### API Integration

The client-side JavaScript calls these API endpoints:

| Endpoint | Purpose |
|----------|---------|
| `/api/weather` | Current weather and forecasts |
| `/api/air-quality` | Air quality index data |
| `/api/izit/status` | Building system status |
| `/api/izit/sites` | Connected sites |
| `/api/izit/clients` | Interface clients |
| `/api/izit/smart-connector/value` | Smart connector data |
| `/api/izit/trend-samples` | Historical trend data |

### Performance Optimization

- **Images:** Optimize with tools like ImageOptim or TinyPNG
- **CSS:** Minify for production
- **JavaScript:** Bundle and minify for production
- **Caching:** Assets are cached by Express static middleware

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

The dashboard follows WCAG 2.1 Level AA guidelines:
- Semantic HTML structure
- ARIA labels for dynamic content
- Keyboard navigation support
- Color contrast ratios

## Maintenance

### Updating Dependencies

Chart.js is loaded from CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

Consider using npm for better version control:
```bash
npm install chart.js
```

### Testing Changes

1. Start development server: `npm start`
2. Open browser: `http://localhost:3001`
3. Check browser console for errors
4. Test on different screen sizes
5. Verify all API calls succeed
