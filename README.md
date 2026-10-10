# CaféFlow — Cafeteria Ticketing System

CaféFlow is a multi-page cafeteria ordering, digital ticketing, queue and staff-management project built with HTML, CSS and vanilla JavaScript.

## Pages

- `index.html` — Home
- `menu.html` — Customer menu and filters
- `checkout.html` — Cart and checkout form
- `ticket.html` — Digital customer ticket
- `queue.html` — Live queue board and ticket lookup
- `history.html` — Customer order history
- `staff.html` — Staff order dashboard
- `availability.html` — Staff menu availability controls
- `analytics.html` — Sales/order analytics
- `about.html` — System explanation

## Main features

- Multi-page customer and staff workflows
- Responsive mobile/tablet/desktop UI
- Dark and light mode
- Font Awesome icons via CDN
- Search and filter menu items
- Cart persisted with localStorage
- Quantity controls and live totals
- Digital ticket generation
- Ticket lookup
- Queue board for preparing/ready tickets
- Staff order status controls
- Staff menu availability controls
- Order history
- Simple JavaScript analytics
- Print receipt button using `window.print()`
- Subtle animations and reduced-motion support

## Run the project

Open the folder in VS Code and use Live Server.

Or run:

```bash
python -m http.server 5500
```

Then visit:

`http://localhost:5500`

## Important

This is a frontend-only Synthesis project. localStorage is used to simulate persistence. No real payment processing or backend security is included.

Food photos are loaded from Unsplash and icons are loaded from Font Awesome CDN, so those external assets require internet access.

All project source files are formatted using 2-space indentation.
