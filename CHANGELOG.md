# Changelog

All notable changes to FoodiePOS are documented here.

## [2.10.0] - 2026-09-10

### Added
- **Manual Table Management** - Occupy/Release tables directly from the Tables page (grid and list views), for walk-ins and table holds
- **Data Backup & Restore** - Export all data (orders, menu, customers, staff, settings, tables) to a JSON file and import it back from Settings
- **Storage Export Helpers** - `storage.exportAll()` / `storage.importAll()` utilities backing the new backup feature

## [2.9.0] - 2026-09-09

### Security
- **Hashed Passwords** - Login credentials are now salted SHA-256 hashed via Web Crypto; plaintext passwords are no longer stored (legacy plaintext accounts are auto-migrated on first login)
- **Brute-Force Lockout** - After 5 failed login attempts the account is locked for 30 minutes with a countdown message
- **Session Idle Timeout** - Users are automatically logged out after 30 minutes of inactivity
- **Safe Receipt Printing** - Receipts print in an isolated iframe instead of rewriting the live document body (removes an HTML-injection vector and page reload)

## [2.8.0] - 2026-09-09

### Added
- **Configurable Currency** - Currency symbol setting is now applied everywhere (POS, receipts, dashboard, reports, inventory, customers, chatbot)
- **Service Charge** - Optional % service charge now applied to dine-in orders, shown in cart summary and receipts
- **Configurable Daily Revenue Target** - Dashboard revenue-progress bar now uses the target set in Settings instead of a hardcoded $1000
- **Duplicate Menu Item** - One-click "Copy" on Menu Management to clone an item for quick variations

## [3.0.0] - 2026-08-22

### Added
- **Staff Schedule View** - Weekly shift scheduling with Morning/Afternoon/Off toggles
- **On Duty Today Tab** - See who is working today at a glance
- **Order Timer** - Live elapsed time on active orders (pulses red after 15min)
- **Receipt Preview** - Full printable receipt modal for any order
- **Quick Reorder** - Repeat completed orders with one click
- **Order Notes** - Attach special instructions to orders
- **Keyboard Shortcuts** - F1/F2/F3/F4 navigation, Ctrl+Enter checkout
- **Table Status Mini-View** - 20-table grid in POS sidebar
- **Custom Restock** - Type any quantity for inventory restock
- **Bulk Restock** - One-click restock all low stock items
- **Data Reset** - Settings page data management with confirmation
- **Staff Search** - Filter team members by name
- **Confirmation Dialogs** - Confirm before deleting staff
- **Sidebar Shortcuts** - Keyboard shortcut hints in navigation
- **Enterprise Architecture Blueprint** - Complete technical specification document

## [2.0.0] - 2026-08-21

### Added
- Complete POS terminal with 24 menu items
- 3-role authentication (Admin, Manager, Staff)
- Order lifecycle (Preparing -> Ready -> Completed)
- Table management (20 tables with status tracking)
- Dashboard with hourly sales chart, popular items, category breakdown
- Reports with CSV export and payment breakdown
- Menu CRUD with emoji picker and stock tracking
- Inventory management with low stock alerts
- Staff management with role assignment
- Customer loyalty system (Bronze/Silver/Gold/Platinum tiers)
- AI chatbot with 10+ topic handlers
- Settings page with tax, hours, receipt config
- Dark mode toggle
- Toast notification system
- Responsive design

## [1.0.0] - 2026-08-20

### Added
- Initial project setup with React + Vite
- Basic POS functionality
- Menu display and cart
