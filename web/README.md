# Digital Progeny Web UI

Modern React + Next.js + Tailwind CSS web interface for Digital Progeny.

## Features

- **React + Next.js 14** with App Router
- **Tailwind CSS** with design tokens
- **TypeScript** for type safety
- **Accessibility** (WCAG 2.1 AA compliant)
- **Real-time** WebSocket communication
- **Responsive** design

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Development

The web UI runs on `http://localhost:3000` and proxies API requests to the backend at `http://localhost:8000`.

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader announcements
- Focus indicators
- Skip links
- Semantic HTML

## Design Tokens

All design tokens are defined in `tailwind.config.js` and match the style guide in `sallie/style-guide.md`.

