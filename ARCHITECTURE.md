<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Enterprise%20Blueprint-blueviolet?style=for-the-badge" alt="Architecture"/>
  <img src="https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/Version-3.0--arch-red?style=for-the-badge" alt="Version"/>
</p>

<h1 align="center">🏗️ FoodieOS Enterprise Architecture Blueprint</h1>

<p align="center">
  <strong>Complete Technical Specification for a Production-Grade Restaurant Operating System</strong>
</p>

<p align="center">
  Hybrid Cloud-Edge Architecture | Zero-Downtime Operations | Enterprise Security | Multi-Tenant SaaS
</p>

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Hybrid Cloud-Edge Design](#3-hybrid-cloud-edge-design)
4. [Database Architecture & CRDT Sync](#4-database-architecture--crdt-sync)
5. [Security & Authentication Protocol](#5-security--authentication-protocol)
6. [RBAC Permission Matrix](#6-rbac-permission-matrix)
7. [API Specification](#7-api-specification)
8. [Edge Gateway Specification](#8-edge-gateway-specification)
9. [Cloud Control Plane](#9-cloud-control-plane)
10. [Performance Requirements](#10-performance-requirements)
11. [QA Testing Standards](#11-qa-testing-standards)
12. [Sprint Planning & Delivery](#12-sprint-planning--delivery)
13. [Deployment Architecture](#13-deployment-architecture)
14. [Monitoring & Observability](#14-monitoring--observability)
15. [Disaster Recovery](#15-disaster-recovery)

---

## 1. Executive Summary

### 1.1 Business Objective

Build a comprehensive, multi-tenant restaurant management SaaS platform that operates reliably in high-latency, intermittent-connectivity environments while maintaining data consistency across distributed locations.

### 1.2 Core Capabilities

| Capability | Description | Priority |
|-----------|-------------|----------|
| Digital Menu | Real-time menu management with localization | P0 |
| Order Pipeline | Full order lifecycle from creation to completion | P0 |
| POS Terminal | Touch-optimized ordering interface | P0 |
| Inventory Control | Stock tracking with automated alerts | P0 |
| Staff Management | RBAC, scheduling, performance tracking | P1 |
| Analytics Dashboard | Real-time revenue, popular items, peak hours | P1 |
| Customer Loyalty | Points system with tier-based rewards | P1 |
| AI Chatbot | Natural language order assistance | P2 |
| Multi-Tenant White-Label | Customizable branding per restaurant | P2 |

### 1.3 Architecture Principles

```
1. OFFLINE-FIRST     → Edge gateway ensures zero-downtime operations
2. EVENTUAL-CONSISTENCY → CRDT-based sync for conflict resolution
3. DEFENSE-IN-DEPTH   → Multiple security layers at every boundary
4. MODULAR-COMPOSABILITY → Microservices for independent scaling
5. OBSERVABILITY-FIRST → Structured logging, tracing, metrics at every layer
```

---

## 2. System Architecture Overview

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLOUD CONTROL PLANE                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Auth/SSO   │  │  Analytics  │  │  Billing    │  │  Tenant     │  │
│  │  Service    │  │  Engine     │  │  Service    │  │  Manager    │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│         │                │                │                │          │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐  │
│  │                    API GATEWAY (Kong/AWS)                       │  │
│  │              Rate Limiting | WAF | TLS 1.3 Termination         │  │
│  └──────┬────────────────┬────────────────┬────────────────┬──────┘  │
│         │                │                │                │          │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐  │
│  │  PostgreSQL │  │  Redis      │  │  S3/Blob    │  │  Kafka      │  │
│  │  (Primary)  │  │  Cluster    │  │  Storage    │  │  Event Bus  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────┬──────┘  │
│                                                             │         │
└─────────────────────────────────────────────────────────────┼─────────┘
                                                              │
                        ╔═════════════════════════════════════╗
                        ║     SYNC PROTOCOL (CRDT + HMAC)    ║
                        ╚═════════════════════════════════════╝
                                                              │
┌─────────────────────────────────────────────────────────────┼─────────┐
│                     EDGE GATEWAY (Per Restaurant)           │         │
│  ┌──────────────────────────────────────────────────────────┴──────┐  │
│  │                   Message Bus (Local)                           │  │
│  └───┬──────────┬──────────┬──────────┬──────────┬────────────────┘  │
│      │          │          │          │          │                    │
│  ┌───┴───┐  ┌───┴───┐  ┌───┴───┐  ┌───┴───┐  ┌───┴───┐              │
│  │  POS  │  │Kitchen│  │Inventory│ │ Staff │  │ Local │              │
│  │ App   │  │ Display│ │ Tracker│  │ Mgmt  │  │  DB   │              │
│  └───────┘  └───────┘  └───────┘  └───────┘  └───────┘              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ SQLite + FTS5 (Local Persistence) | CRDT Merge Engine        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Communication Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA FLOW ARCHITECTURE                        │
│                                                                  │
│   EDGE (Restaurant)                CLOUD (SaaS Platform)        │
│   ─────────────────                ─────────────────────         │
│                                                                  │
│   POS Terminal ─────┐         ┌───── Auth Service               │
│                     │         │                                  │
│   Kitchen Display ──┤  SYNC   ├───── Analytics Engine            │
│                     ├───◄►────┤                                  │
│   Inventory System ─┤  CRDT   ├───── Tenant Manager             │
│                     │  +HMAC  │                                  │
│   Staff Portal ─────┘         └───── Billing Service            │
│                                                                  │
│   [Offline Mode]  ←──Local DB──→  [Cloud DB]  [Event Store]     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Hybrid Cloud-Edge Design

### 3.1 Edge Gateway Specification

```
┌──────────────────────────────────────────────────────────────┐
│                    EDGE GATEWAY STACK                         │
│                                                               │
│  Layer 7: Application                                        │
│  ├── REST API Server (Express/Fastify)                       │
│  ├── WebSocket Server (Socket.io)                            │
│  ├── Local Auth Validator (JWT verify)                       │
│  └── Request HMAC Validator                                  │
│                                                               │
│  Layer 6: Business Logic                                     │
│  ├── Order Pipeline                                          │
│  ├── Inventory Tracker                                       │
│  ├── Table Manager                                           │
│  └── Staff Scheduler                                         │
│                                                               │
│  Layer 5: Data Layer                                         │
│  ├── SQLite (Primary Local DB)                               │
│  ├── CRDT Merge Engine                                       │
│  ├── Sync Queue Manager                                      │
│  └── Local Cache (LRU, 100MB max)                           │
│                                                               │
│  Layer 4: Security                                           │
│  ├── TLS 1.3 Termination                                     │
│  ├── HMAC-SHA256 Validator                                   │
│  ├── Rate Limiter (1000 req/min per tenant)                  │
│  └── Audit Logger                                            │
│                                                               │
│  Layer 3: Network                                            │
│  ├── WireGuard VPN Tunnel (to Cloud)                         │
│  ├── Local Network Isolation (VLAN)                          │
│  └── DNS Resolver (with fallback)                            │
│                                                               │
│  Layer 2: Hardware                                           │
│  ├── TPM 2.0 Module (Key Storage)                            │
│  ├── UPS Battery Backup                                      │
│  └── NVMe Storage (RAID 1)                                  │
│                                                               │
│  Layer 1: Operating System                                   │
│  ├── Ubuntu Server 22.04 LTS (Hardened)                      │
│  ├── Docker Runtime                                          │
│  └── Systemd Services                                        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Offline Mode Specifications

```
┌─────────────────────────────────────────────────────────────┐
│                  OFFLINE OPERATION RULES                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ONLINE MODE (Cloud Connected)                      │    │
│  │  • Full feature set available                       │    │
│  │  • Real-time analytics                              │    │
│  │  • Cloud auth validation                            │    │
│  │  • Immediate sync to cloud                          │    │
│  │  • Live customer loyalty lookup                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  OFFLINE MODE (Local Edge Only)                     │    │
│  │  • POS ordering: FULL SUPPORT                       │    │
│  │  • Kitchen display: FULL SUPPORT                    │    │
│  │  • Inventory tracking: FULL SUPPORT                 │    │
│  │  • Staff clock-in/out: FULL SUPPORT                 │    │
│  │  • Customer loyalty: LOCAL CACHE (last known tier)  │    │
│  │  • Analytics: LOCAL ONLY (synced when online)       │    │
│  │  • New staff creation: QUEUED (synced when online)  │    │
│  │  • Menu updates: LOCAL ONLY (synced when online)    │    │
│  │  • Settings changes: LOCAL ONLY (synced when online)│    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  RECONNECT (Sync Recovery)                          │    │
│  │  1. Detect connectivity                             │    │
│  │  2. Establish WireGuard tunnel                      │    │
│  │  3. Validate cloud identity (HMAC)                  │    │
│  │  4. Begin CRDT merge (local → cloud)                │    │
│  │  5. Resolve conflicts (LWW + custom rules)          │    │
│  │  6. Confirm sync completion                         │    │
│  │  7. Resume normal operations                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Cloud Control Plane Services

| Service | Purpose | Tech Stack |
|---------|---------|------------|
| Auth/SSO | Global authentication, JWT issuance, session management | Node.js + Passport |
| Tenant Manager | Multi-tenant provisioning, white-label config | Node.js + PostgreSQL |
| Analytics Engine | Aggregated reporting, ML predictions | Python + Apache Spark |
| Billing Service | Subscription management, usage tracking | Node.js + Stripe |
| Sync Coordinator | CRDT merge orchestration, conflict resolution | Go + gRPC |
| Notification Service | Push, SMS, email alerts | Node.js + Firebase |
| Media Service | Image upload, CDN, optimization | Node.js + Sharp + CloudFront |
| Admin Dashboard | System monitoring, tenant management | React + AdminLTE |

---

## 4. Database Architecture & CRDT Sync

### 4.1 Database Schema (Cloud - PostgreSQL)

```sql
-- ═══════════════════════════════════════════════════════════
-- TENANT MANAGEMENT
-- ═══════════════════════════════════════════════════════════

CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    domain          VARCHAR(255),
    logo_url        TEXT,
    primary_color   VARCHAR(7) DEFAULT '#6366f1',
    plan            VARCHAR(50) DEFAULT 'starter',
    status          VARCHAR(20) DEFAULT 'active',
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- USER & AUTHENTICATION
-- ═══════════════════════════════════════════════════════════

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(50) NOT NULL,  -- system_admin, owner, manager, cashier, kitchen
    avatar          TEXT,
    phone           VARCHAR(20),
    status          VARCHAR(20) DEFAULT 'active',
    last_login      TIMESTAMPTZ,
    failed_attempts INTEGER DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    ip_address      INET,
    user_agent      TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- MENU MANAGEMENT
-- ═══════════════════════════════════════════════════════════

CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    sort_order      INTEGER DEFAULT 0,
    icon            VARCHAR(10),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES categories(id),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    price           DECIMAL(10,2) NOT NULL,
    cost            DECIMAL(10,2) DEFAULT 0,
    image_url       TEXT,
    icon            VARCHAR(10),
    prep_time_min   INTEGER DEFAULT 15,
    stock           INTEGER DEFAULT 100,
    low_stock_threshold INTEGER DEFAULT 10,
    available       BOOLEAN DEFAULT true,
    modifiers       JSONB DEFAULT '[]',
    allergens       TEXT[],
    calories        INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ  -- Soft delete
);

-- ═══════════════════════════════════════════════════════════
-- ORDER MANAGEMENT
-- ═══════════════════════════════════════════════════════════

CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    order_number    SERIAL,
    table_number    INTEGER,
    type            VARCHAR(20) NOT NULL,  -- dine-in, takeaway, delivery
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    subtotal        DECIMAL(10,2) NOT NULL,
    discount        DECIMAL(10,2) DEFAULT 0,
    tax             DECIMAL(10,2) DEFAULT 0,
    total           DECIMAL(10,2) NOT NULL,
    payment_method  VARCHAR(20),
    payment_status  VARCHAR(20) DEFAULT 'pending',
    customer_id     UUID,
    staff_id        UUID,
    notes           TEXT,
    priority        VARCHAR(10) DEFAULT 'normal',
    estimated_ready TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id    UUID REFERENCES menu_items(id),
    name            VARCHAR(255) NOT NULL,
    quantity        INTEGER NOT NULL,
    price           DECIMAL(10,2) NOT NULL,
    modifiers       JSONB DEFAULT '[]',
    special_notes   TEXT,
    status          VARCHAR(20) DEFAULT 'pending'
);

-- ═══════════════════════════════════════════════════════════
-- TABLE MANAGEMENT
-- ═══════════════════════════════════════════════════════════

CREATE TABLE tables (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    number          INTEGER NOT NULL,
    capacity        INTEGER DEFAULT 4,
    zone            VARCHAR(50),  -- indoor, outdoor, vip, bar
    status          VARCHAR(20) DEFAULT 'available',
    current_order_id UUID,
    x_position      INTEGER,
    y_position      INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, number)
);

-- ═══════════════════════════════════════════════════════════
-- CUSTOMER & LOYALTY
-- ═══════════════════════════════════════════════════════════

CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    loyalty_points  INTEGER DEFAULT 0,
    tier            VARCHAR(20) DEFAULT 'bronze',
    total_spent     DECIMAL(10,2) DEFAULT 0,
    visits          INTEGER DEFAULT 0,
    preferences     JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE loyalty_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID REFERENCES customers(id),
    order_id        UUID REFERENCES orders(id),
    points          INTEGER NOT NULL,
    type            VARCHAR(20) NOT NULL,  -- earned, redeemed, adjusted
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- SYNC & CRDT TRACKING
-- ═══════════════════════════════════════════════════════════

CREATE TABLE sync_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id),
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID NOT NULL,
    operation       VARCHAR(10) NOT NULL,  -- INSERT, UPDATE, DELETE
    crdt_vector     JSONB NOT NULL,        -- {site_id: timestamp}
    payload         JSONB NOT NULL,
    signature       VARCHAR(512),          -- HMAC-SHA256
    source          VARCHAR(20) NOT NULL,  -- edge, cloud
    synced_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edge_nodes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id),
    name            VARCHAR(255) NOT NULL,
    location        TEXT,
    public_key      TEXT NOT NULL,
    last_sync       TIMESTAMPTZ,
    status          VARCHAR(20) DEFAULT 'active',
    software_version VARCHAR(20),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 CRDT Synchronization Protocol

```
┌─────────────────────────────────────────────────────────────────┐
│                   CRDT SYNC PROTOCOL                            │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗   │
│  ║  VECTOR CLOCK FORMAT                                     ║   │
│  ║  {                                                       ║   │
│  ║    "edge_site_id": "edge_restaurant_001",                ║   │
│  ║    "cloud_site_id": "cloud_primary",                     ║   │
│  ║    "logical_timestamp": 1692000000000,                   ║   │
│  ║    "counter": 42,                                        ║   │
│  ║    "merge_parent": null                                  ║   │
│  ║  }                                                       ║   │
│  ╚══════════════════════════════════════════════════════════╝   │
│                                                                  │
│  CONFLICT RESOLUTION RULES:                                      │
│  ─────────────────────────                                       │
│                                                                  │
│  1. ORDERS: Never conflict (append-only from edge)              │
│     → Accept all new orders regardless of source                │
│                                                                  │
│  2. MENU ITEMS: Last-Writer-Wins (LWW) by timestamp            │
│     → Higher timestamp wins                                      │
│     → Edge can override cloud if newer                           │
│                                                                  │
│  3. INVENTORY: Additive merge (sum of changes)                  │
│     → Stock = cloud_stock + sum(edge_deltas)                    │
│     → Prevents negative stock via min(stock, 0) check          │
│                                                                  │
│  4. CUSTOMER DATA: Field-level merge                            │
│     → Each field merged independently using LWW                 │
│     → Loyalty points: additive (never subtract)                │
│                                                                  │
│  5. SETTINGS: Cloud-wins for global config                      │
│     → Edge-local overrides for offline-specific settings        │
│                                                                  │
│  6. STAFF: Cloud-wins (auth source of truth)                    │
│     → Edge can request, cannot override cloud role assignments  │
│                                                                  │
│  SYNC FLOW:                                                      │
│  ──────────                                                      │
│                                                                  │
│  Edge Event ──► Local Write ──► CRDT Transform ──► Queue        │
│       │                                                      │   │
│       │ (when online)                                        │   │
│       ▼                                                      │   │
│  HMAC Sign ──► Send to Cloud ──► Cloud Validate ──► Merge      │
│       │                                                      │   │
│       │ (if conflict)                                        │   │
│       ▼                                                      │   │
│  Resolve ──► Apply Resolution ──► Broadcast to All Edges       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Sync Message Format

```json
{
  "message_id": "uuid-v4",
  "message_type": "SYNC_UPDATE",
  "timestamp": "2026-08-20T10:30:00Z",
  "source": {
    "site_id": "edge_restaurant_001",
    "type": "edge",
    "hmac_signature": "sha256=abc123...",
    "public_key_id": "key_2026_08"
  },
  "tenant_id": "tenant-uuid",
  "payload": {
    "entity_type": "order",
    "entity_id": "order-uuid",
    "operation": "INSERT",
    "data": {
      "id": "order-uuid",
      "table_number": 5,
      "items": [...],
      "total": 45.99,
      "status": "preparing",
      "created_at": "2026-08-20T10:30:00Z"
    },
    "vector_clock": {
      "edge_restaurant_001": 1692000000000,
      "cloud_primary": 1691999999000
    }
  },
  "metadata": {
    "retry_count": 0,
    "compression": "gzip",
    "content_type": "application/json"
  }
}
```

---

## 5. Security & Authentication Protocol

### 5.1 HMAC Message Authentication

```
┌────────────────═══════════════════════════════════════════════════┐
│              HMAC-SHA256 MESSAGE SIGNING                         │
│                                                                  │
│  SIGNING PROCESS:                                                │
│  ─────────────────                                               │
│                                                                  │
│  1. Create canonical message string:                            │
│     {method}\n{path}\n{timestamp}\n{nonce}\n{body_hash}        │
│                                                                  │
│  2. Compute HMAC using tenant-specific secret key:              │
│     signature = HMAC-SHA256(secret_key, canonical_string)       │
│                                                                  │
│  3. Attach to request header:                                   │
│     X-Signature: sha256={signature}                             │
│     X-Timestamp: {unix_ms}                                      │
│     X-Nonce: {random_uuid}                                      │
│     X-Key-ID: {key_id}                                          │
│                                                                  │
│  VERIFICATION:                                                   │
│  ─────────────                                                   │
│                                                                  │
│  1. Check timestamp is within ±5 minutes (prevent replay)       │
│  2. Check nonce is not in Redis bloom filter (prevent reuse)    │
│  3. Recompute HMAC using stored secret key                      │
│  4. Compare signatures (constant-time comparison)               │
│  5. Reject if mismatch                                          │
│                                                                  │
│  KEY ROTATION:                                                   │
│  ─────────────                                                   │
│                                                                  │
│  • Rotate every 90 days                                         │
│  • Support 2 concurrent keys during rotation window (7 days)    │
│  • Old keys archived, not deleted                               │
│  • Automated rotation via cron job                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 JWT Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    JWT AUTHENTICATION FLOW                       │
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐               │
│  │  Client  │────►│  Edge    │────►│  Auth    │               │
│  │  (POS)   │     │  Gateway │     │  Service │               │
│  └──────────┘     └──────────┘     └──────────┘               │
│       │                │                 │                      │
│       │  1. POST /auth/login                                  │
│       │  {email, password, tenant_slug}                       │
│       │──────────────►│                 │                      │
│       │                │  2. Forward + HMAC                    │
│       │                │────────────────►│                     │
│       │                │                 │                      │
│       │                │  3. Validate credentials              │
│       │                │  4. Check role permissions            │
│       │                │  5. Generate JWT + Refresh            │
│       │                │◄────────────────│                     │
│       │                │                 │                      │
│       │  6. Set HttpOnly Cookie                                │
│       │  {access_token, refresh_token}                        │
│       │◄──────────────│                 │                      │
│       │                │                 │                      │
│       │  7. Subsequent Requests                                │
│       │  Authorization: Bearer {access_token}                 │
│       │──────────────►│                 │                      │
│       │                │  8. Verify JWT locally                │
│       │                │  9. Check permissions                 │
│       │                │  10. Forward to service               │
│       │◄──────────────│                 │                      │
│       │                │                 │                      │
│                                                                  │
│  TOKEN SPECIFICATION:                                            │
│  ────────────────────                                            │
│  Access Token:                                                    │
│    • Algorithm: RS256 (asymmetric)                               │
│    • Expiry: 15 minutes                                          │
│    • Claims: sub, tenant_id, role, permissions[]                 │
│    • JTI (JWT ID) for revocation tracking                        │
│                                                                  │
│  Refresh Token:                                                   │
│    • Algorithm: HS256                                             │
│    • Expiry: 7 days                                               │
│    • Stored in HttpOnly, Secure, SameSite=Strict cookie          │
│    • One-time use (rotation on refresh)                          │
│                                                                  │
│  REVOCATION:                                                      │
│    • On role change: revoke all user tokens                      │
│    • On employee termination: immediate revocation               │
│    • Stored in Redis bloom filter for O(1) lookup               │
│    • TTL = token max expiry                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Network Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                  DEFENSE-IN-DEPTH SECURITY                       │
│                                                                  │
│  Layer 1: PERIMETER                                              │
│  ├── Cloudflare WAF (DDoS, Bot Protection)                     │
│  ├── Rate Limiting: 1000 req/min per IP                        │
│  ├── IP Whitelisting (for admin endpoints)                     │
│  └── Geographic Blocking (optional)                             │
│                                                                  │
│  Layer 2: GATEWAY                                                │
│  ├── TLS 1.3 Termination (HSTS, OCSP Stapling)                │
│  ├── Request Validation (JSON Schema)                           │
│  ├── HMAC Signature Verification                                │
│  └── CORS Policy Enforcement                                    │
│                                                                  │
│  Layer 3: APPLICATION                                            │
│  ├── JWT Authentication + Role Authorization                    │
│  ├── Input Sanitization (XSS Prevention)                       │
│  ├── SQL Injection Prevention (Parameterized Queries)          │
│  ├── CSRF Token Validation                                      │
│  └── Content Security Policy Headers                            │
│                                                                  │
│  Layer 4: DATA                                                   │
│  ├── Encryption at Rest (AES-256)                              │
│  ├── Encryption in Transit (TLS 1.3)                           │
│  ├── Field-level Encryption (PII: email, phone)                │
│  ├── Database Audit Logging                                     │
│  └── Automated Backups (encrypted)                             │
│                                                                  │
│  Layer 5: INFRASTRUCTURE                                         │
│  ├── Network Isolation (VPC, Subnets)                          │
│  ├── Security Groups (least privilege)                         │
│  ├── Container Scanning (Trivy)                                 │
│  ├── Host Hardening (CIS Benchmarks)                           │
│  └── TPM-based Key Storage (Edge)                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. RBAC Permission Matrix

### 6.1 Role Definitions

```yaml
roles:
  system_admin:
    description: "Platform-level administrator with cross-tenant access"
    inheritance: []
    permissions:
      - tenant.create
      - tenant.read
      - tenant.update
      - tenant.delete
      - user.manage_all
      - role.assign_all
      - system.config
      - system.logs
      - billing.manage
      - analytics.global
      - sync.override
      - security.audit

  restaurant_owner:
    description: "Restaurant owner with full operational control"
    inheritance: []
    permissions:
      - menu.create
      - menu.read
      - menu.update
      - menu.delete
      - order.manage_all
      - order.refund
      - table.manage
      - staff.create
      - staff.read
      - staff.update
      - staff.delete
      - staff.schedule
      - inventory.manage
      - reports.full
      - reports.export
      - settings.restaurant
      - customer.manage
      - loyalty.configure
      - finance.reports
      - finance.export

  manager:
    description: "Restaurant manager with operational management access"
    inheritance: []
    permissions:
      - menu.read
      - menu.update
      - order.manage_all
      - order.void
      - table.manage
      - staff.read
      - staff.update
      - inventory.manage
      - reports.read
      - reports.export
      - settings.read
      - customer.read
      - customer.update
      - loyalty.read

  cashier:
    description: "Front-of-house staff for order creation and payment"
    inheritance: []
    permissions:
      - order.create
      - order.read
      - order.update_status
      - table.read
      - table.update_status
      - menu.read
      - payment.process
      - customer.read
      - customer.create
      - loyalty.read
      - loyalty.redeem

  kitchen_staff:
    description: "Back-of-house staff for order preparation"
    inheritance: []
    permissions:
      - order.read_active
      - order.update_status
      - order.add_notes
      - menu.read
      - inventory.read
      - inventory.update_stock
```

### 6.2 API Endpoint Access Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ENDPOINT ACCESS MATRIX                          │
│                                                                        │
│  Endpoint                    │ SysAdmin │ Owner  │ Manager │ Cashier │ Kitchen │
│  ────────────────────────────┼──────────┼────────┼─────────┼─────────┼─────────┤
│  POST /auth/login            │    ✅    │   ✅   │   ✅    │   ✅    │   ✅    │
│  POST /auth/logout           │    ✅    │   ✅   │   ✅    │   ✅    │   ✅    │
│  POST /auth/refresh          │    ✅    │   ✅   │   ✅    │   ✅    │   ✅    │
│  ────────────────────────────┼──────────┼────────┼─────────┼─────────┼─────────┤
│  GET    /tenants             │    ✅    │   ⬜   │   ⬜    │   ⬜    │   ⬜    │
│  POST   /tenants             │    ✅    │   ⬜   │   ⬜    │   ⬜    │   ⬜    │
│  PUT    /tenants/:id         │    ✅    │   ✅   │   ⬜    │   ⬜    │   ⬜    │
│  ────────────────────────────┼──────────┼────────┼─────────┼─────────┼─────────┤
│  GET    /menu                │    ✅    │   ✅   │   ✅    │   ✅    │   ✅    │
│  POST   /menu                │    ✅    │   ✅   │   ⬜    │   ⬜    │   ⬜    │
│  PUT    /menu/:id            │    ✅    │   ✅   │   ✅    │   ⬜    │   ⬜    │
│  DELETE /menu/:id            │    ✅    │   ✅   │   ⬜    │   ⬜    │   ⬜    │
│  ────────────────────────────┼──────────┼────────┼─────────┼─────────┼─────────┤
│  GET    /orders              │    ✅    │   ✅   │   ✅    │   ✅    │   ✅*   │
│  POST   /orders              │    ✅    │   ✅   │   ✅    │   ✅    │   ⬜    │
│  PUT    /orders/:id/status   │    ✅    │   ✅   │   ✅    │   ✅    │   ✅**  │
│  POST   /orders/:id/void     │    ✅    │   ✅   │   ✅    │   ⬜    │   ⬜    │
│  POST   /orders/:id/refund   │    ✅    │   ✅   │   ⬜    │   ⬜    │   ⬜    │
│  ────────────────────────────┼──────────┼────────┼─────────┼─────────┼─────────┤
│  GET    /tables              │    ✅    │   ✅   │   ✅    │   ✅    │   ⬜    │
│  PUT    /tables/:id          │    ✅    │   ✅   │   ✅    │   ✅    │   ⬜    │
│  ────────────────────────────┼──────────┼────────┼─────────┼─────────┼─────────┤
│  GET    /staff               │    ✅    │   ✅   │   ✅    │   ⬜    │   ⬜    │
│  POST   /staff               │    ✅    │   ✅   │   ⬜    │   ⬜    │   ⬜    │
│  PUT    /staff/:id           │    ✅    │   ✅   │   ✅    │   ⬜    │   ⬜    │
│  DELETE /staff/:id           │    ✅    │   ✅   │   ⬜    │   ⬜    │   ⬜    │
│  ────────────────────────────┼──────────┼────────┼─────────┼─────────┼─────────┤
│  GET    /inventory           │    ✅    │   ✅   │   ✅    │   ⬜    │   ✅*** │
│  PUT    /inventory/:id       │    ✅    │   ✅   │   ✅    │   ⬜    │   ✅*** │
│  POST   /inventory/restock   │    ✅    │   ✅   │   ✅    │   ⬜    │   ⬜    │
│  ────────────────────────────┼──────────┼────────┼─────────┼─────────┼─────────┤
│  GET    /customers           │    ✅    │   ✅   │   ✅    │   ✅    │   ⬜    │
│  POST   /customers           │    ✅    │   ✅   │   ✅    │   ✅    │   ⬜    │
│  PUT    /customers/:id       │    ✅    │   ✅   │   ✅    │   ✅    │   ⬜    │
│  ────────────────────────────┼──────────┼────────┼─────────┼─────────┼─────────┤
│  GET    /reports/*           │    ✅    │   ✅   │   ✅    │   ⬜    │   ⬜    │
│  POST   /reports/export      │    ✅    │   ✅   │   ✅    │   ⬜    │   ⬜    │
│  ────────────────────────────┼──────────┼────────┼─────────┼─────────┼─────────┤
│  GET    /settings            │    ✅    │   ✅   │   ✅    │   ⬜    │   ⬜    │
│  PUT    /settings            │    ✅    │   ✅   │   ⬜    │   ⬜    │   ⬜    │
│  ────────────────────────────┼──────────┼────────┼─────────┼─────────┼─────────┤
│  POST   /sync/push           │    ✅    │   ✅   │   ✅    │   ✅    │   ✅    │
│  GET    /sync/status         │    ✅    │   ✅   │   ✅    │   ⬜    │   ⬜    │
│  POST   /sync/resolve        │    ✅    │   ⬜   │   ⬜    │   ⬜    │   ⬜    │
│                                                                        │
│  * Kitchen: only active orders (status = preparing/ready)              │
│  ** Kitchen: limited to pending → preparing → ready transitions       │
│  *** Kitchen: read-only for stock levels, can deduct on usage         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. API Specification

### 7.1 RESTful API Design

```
BASE URL: https://api.foodieos.com/v1
EDGE URL: https://edge-{restaurant-id}.local:8443/v1

AUTHENTICATION:
  Header: Authorization: Bearer {access_token}
  Header: X-Tenant-ID: {tenant_uuid}

CONTENT TYPES:
  Request:  application/json
  Response: application/json
  Files:    multipart/form-data

RATE LIMITS:
  Cloud API:    1000 req/min per tenant
  Edge API:     5000 req/min (local network)
  Auth API:     20 req/min per IP (brute force protection)
```

### 7.2 Core API Endpoints

```yaml
# ═══════════════════════════════════════════
# AUTHENTICATION
# ═══════════════════════════════════════════

POST /auth/login:
  body:
    email: string (required)
    password: string (required)
    tenant_slug: string (required)
  response:
    access_token: string
    refresh_token: string
    user: UserObject
    permissions: string[]

POST /auth/refresh:
  body:
    refresh_token: string (required)
  response:
    access_token: string

POST /auth/logout:
  headers:
    Authorization: Bearer {token}
  response:
    success: boolean

POST /auth/revoke-all:
  description: Revoke all tokens for a user (admin only)
  body:
    user_id: string (required)

# ═══════════════════════════════════════════
# ORDERS
# ═══════════════════════════════════════════

GET /orders:
  query:
    status: "pending|preparing|ready|completed|cancelled"
    type: "dine-in|takeaway|delivery"
    table: number
    date: "YYYY-MM-DD"
    limit: number (default: 50)
    offset: number (default: 0)
  response:
    orders: OrderObject[]
    total: number
    has_more: boolean

POST /orders:
  body:
    table_number: number (optional for takeaway/delivery)
    type: "dine-in|takeaway|delivery"
    items: OrderItem[]
    customer_id: string (optional)
    notes: string (optional)
    discount: number (optional)
    payment_method: "cash|card|upi"
  response:
    order: OrderObject
    # Includes HMAC-signed payload for sync

PUT /orders/:id/status:
  body:
    status: "preparing|ready|completed|cancelled"
    notes: string (optional)
  response:
    order: OrderObject
  # Kitchen staff: limited to preparing → ready → completed

# ═══════════════════════════════════════════
# MENU
# ═══════════════════════════════════════════

GET /menu:
  query:
    category: string
    available: boolean
    search: string
  response:
    items: MenuItem[]
    categories: Category[]

POST /menu:
  body:
    name: string (required)
    description: string
    price: number (required)
    cost: number
    category_id: string (required)
    image: File
    stock: number
    modifiers: Modifier[]
  response:
    item: MenuItem

PUT /menu/:id:
  body: (partial MenuItem)
  response:
    item: MenuItem

DELETE /menu/:id:
  response:
    success: boolean
  # Soft delete: sets deleted_at timestamp

# ═══════════════════════════════════════════
# INVENTORY
# ═══════════════════════════════════════════

GET /inventory:
  query:
    status: "all|low|out|in"
    sort: "name|stock|value"
  response:
    items: InventoryItem[]
    summary:
      total_units: number
      total_value: number
      low_stock_count: number
      out_of_stock_count: number

PUT /inventory/:id/stock:
  body:
    adjustment: number  # Positive = restock, negative = deduct
    reason: string
  response:
    item: InventoryItem
  # Used by POS (auto-deduct) and staff (manual restock)

POST /inventory/bulk-restock:
  body:
    item_ids: string[]
    amount: number
  response:
    updated_count: number

# ═══════════════════════════════════════════
# SYNC
# ═══════════════════════════════════════════

POST /sync/push:
  description: Push edge changes to cloud
  body:
    messages: SyncMessage[]
    last_sync_vector: VectorClock
  response:
    accepted: string[]   # message_ids accepted
    conflicts: Conflict[]
    new_vector: VectorClock

POST /sync/pull:
  description: Pull cloud changes to edge
  body:
    last_sync_vector: VectorClock
    entity_types: string[]
  response:
    changes: SyncMessage[]
    new_vector: VectorClock

POST /sync/resolve:
  description: Resolve sync conflict
  body:
    conflict_id: string
    resolution: "cloud_wins|edge_wins|merge|custom"
    merged_data: object (optional for custom)
  response:
    resolved: boolean
```

---

## 8. Edge Gateway Specification

### 8.1 Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores, 2.0GHz | 8 cores, 3.0GHz |
| RAM | 8GB DDR4 | 16GB DDR4 |
| Storage | 256GB NVMe SSD | 512GB NVMe SSD (RAID 1) |
| Network | 100Mbps Ethernet | 1Gbps Ethernet + 4G Failover |
| UPS | 30 min backup | 60 min backup |
| TPM | TPM 2.0 Module | TPM 2.0 + YubiKey |

### 8.2 Software Stack

```
┌─────────────────────────────────────────────────────────────┐
│                  EDGE SOFTWARE STACK                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  APPLICATION LAYER                                   │    │
│  │  ├── Node.js 20 LTS (Runtime)                        │    │
│  │  ├── Express.js 4.x (HTTP Server)                    │    │
│  │  ├── Socket.io (WebSocket Server)                    │    │
│  │  └── PM2 (Process Manager, Cluster Mode)            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  DATA LAYER                                          │    │
│  │  ├── SQLite 3.40 (Primary DB)                        │    │
│  │  ├── better-sqlite3 (Node.js Binding)                │    │
│  │  ├── FTS5 (Full-Text Search)                         │    │
│  │  └── node-cron (Scheduled Sync Tasks)               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  SECURITY LAYER                                      │    │
│  │  ├── WireGuard (VPN Tunnel)                          │    │
│  │  ├── OpenSSL (TLS 1.3)                               │    │
│  │  ├── node-forge (HMAC Operations)                    │    │
│  │  └── Hardware TPM (Key Storage)                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  MONITORING                                          │    │
│  │  ├── Prometheus (Metrics)                            │    │
│  │  ├── Grafana (Dashboards)                            │    │
│  │  ├── Loki (Log Aggregation)                          │    │
│  │  └── AlertManager (Notifications)                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Cloud Control Plane

### 9.1 Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│              CLOUD INFRASTRUCTURE (AWS/GCP)                   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  COMPUTE                                             │    │
│  │  ├── EKS (Kubernetes) - Core Services                │    │
│  │  ├── Lambda - Event Processing                       │    │
│  │  ├── ECS Fargate - Background Workers                │    │
│  │  └── Auto Scaling (2-20 pods per service)           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  DATABASES                                           │    │
│  │  ├── RDS PostgreSQL 15 (Multi-AZ, Primary)          │    │
│  │  ├── ElastiCache Redis 7 (Sessions, Cache)          │    │
│  │  ├── DynamoDB (Audit Logs, Sync Log)                │    │
│  │  └── S3 (Media, Backups, Exports)                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  NETWORKING                                          │    │
│  │  ├── CloudFront (CDN, Edge Caching)                  │    │
│  │  ├── API Gateway (Rate Limiting, WAF)                │    │
│  │  ├── Route 53 (DNS, Health Checks)                   │    │
│  │  └── VPC (Private Subnets, NAT Gateway)             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  SECURITY                                            │    │
│  │  ├── WAF v2 (OWASP Top 10 Protection)               │    │
│  │  ├── Shield Advanced (DDoS)                          │    │
│  │  ├── KMS (Encryption Key Management)                 │    │
│  │  ├── Secrets Manager (API Keys, DB Credentials)     │    │
│  │  └── GuardDuty (Threat Detection)                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  OBSERVABILITY                                       │    │
│  │  ├── CloudWatch (Metrics, Logs)                      │    │
│  │  ├── X-Ray (Distributed Tracing)                     │    │
│  │  ├── PagerDuty (Alerting)                            │    │
│  │  └── Datadog (APM, Synthetics)                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Performance Requirements

### 10.1 Latency Requirements

| Operation | Target | Maximum | Measurement |
|-----------|--------|---------|-------------|
| Local Order Placement | 50ms | 200ms | Edge-to-POS display |
| Order Status Update | 30ms | 100ms | Kitchen display refresh |
| Menu Search | 20ms | 80ms | FTS5 query time |
| Table Status Change | 15ms | 50ms | Local state update |
| Inventory Query | 10ms | 40ms | SQLite query time |
| CRDT Sync (Edge→Cloud) | 500ms | 2000ms | Full round-trip |
| CRDT Merge (Cloud→Edge) | 100ms | 500ms | Conflict resolution |
| Authentication | 200ms | 800ms | Edge + Cloud verify |
| Analytics Dashboard | 500ms | 1500ms | Cloud aggregation |
| CSV Export | 2s | 10s | Full report generation |

### 10.2 Throughput Requirements

| Metric | Requirement |
|--------|-------------|
| Concurrent POS terminals per restaurant | 5-10 |
| Orders per minute per restaurant | 50+ |
| Sync messages per second (cloud) | 10,000+ |
| API requests per second (cloud) | 5,000+ |
| WebSocket connections per restaurant | 20+ |
| Database writes per second (edge) | 1,000+ |

### 10.3 Resource Limits

```
EDGE GATEWAY:
  ├── Max local DB size: 10GB (auto-archive older data)
  ├── Max sync queue: 50,000 pending messages
  ├── Max memory usage: 2GB (PM2 memory limit)
  ├── Max file descriptors: 65,535
  └── Max concurrent WebSocket connections: 50

CLOUD API:
  ├── Request body size: 10MB max
  ├── Response pagination: 100 items max
  ├── Query timeout: 30 seconds
  ├── Connection pool: 100 per service
  └── Idle connection timeout: 30 seconds
```

---

## 11. QA Testing Standards

### 11.1 Test Coverage Requirements

| Layer | Minimum Coverage | Tool |
|-------|-----------------|------|
| Unit Tests | 85% | Jest + Vitest |
| Integration Tests | 80% | Supertest + Testcontainers |
| E2E Tests | 70% critical flows | Playwright |
| Security Tests | 100% OWASP Top 10 | OWASP ZAP |
| Performance Tests | All critical paths | k6 / Artillery |

### 11.2 Automated Test Suites

```yaml
test_suites:
  unit_tests:
    schedule: "on_every_push"
    timeout: "5 minutes"
    coverage_threshold: 85%
    includes:
      - src/**/*.test.ts
      - src/**/*.spec.ts
    excludes:
      - src/**/*.e2e.test.ts
      - src/**/*.integration.test.ts

  integration_tests:
    schedule: "on_every_push"
    timeout: "15 minutes"
    requires:
      - docker_compose_up
      - database_migrations
    includes:
      - tests/integration/**/*.test.ts
    services:
      - postgresql
      - redis
      - sqlite

  e2e_tests:
    schedule: "on_every_merge_to_main"
    timeout: "30 minutes"
    requires:
      - full_application_stack
    includes:
      - tests/e2e/**/*.test.ts
    browsers:
      - chromium
      - firefox
      - webkit
    flows:
      - authentication
      - order_placement
      - menu_management
      - inventory_management
      - reports_generation

  security_scans:
    schedule: "on_every_pull_request"
    timeout: "20 minutes"
    tools:
      - owasp_zap (DAST)
      - snyk (dependency scanning)
      - eslint_security (SAST)
      - trivy (container scanning)
    fail_on:
      - critical_vulnerabilities
      - high_vulnerabilities
      - privilege_escalation
      - hmac_signature_bypass

  performance_tests:
    schedule: "weekly"
    timeout: "60 minutes"
    tools:
      - k6
    scenarios:
      - name: "normal_load"
        vus: 50
        duration: "5m"
        threshold: "p95<200ms"
      - name: "peak_load"
        vus: 200
        duration: "2m"
        threshold: "p95<500ms"
      - name: "stress_test"
        vus: 500
        duration: "1m"
        threshold: "error_rate<1%"

  offline_simulation:
    schedule: "on_every_merge_to_main"
    timeout: "15 minutes"
    scenarios:
      - "network_disconnect_30s"
      - "network_disconnect_5m"
      - "intermittent_connectivity"
      - "slow_network_2s_latency"
    assertions:
      - "pos_continues_ordering"
      - "no_data_loss"
      - "successful_reconnect_sync"
      - "conflict_resolution_correct"
```

### 11.3 Critical Test Scenarios

```
┌─────────────────────────────────────────────────────────────────┐
│              CRITICAL TEST SCENARIOS                              │
│                                                                  │
│  1. OFFLINE ORDER FLOW                                           │
│     ├── Disconnect edge from cloud                               │
│     ├── Place 10 orders via POS                                  │
│     ├── Update 5 order statuses                                  │
│     ├── Verify local DB consistency                              │
│     ├── Reconnect to cloud                                       │
│     ├── Verify CRDT sync completes                               │
│     ├── Verify all 10 orders in cloud DB                         │
│     └── Verify no duplicate entries                              │
│                                                                  │
│  2. CONCURRENT CONFLICT RESOLUTION                               │
│     ├── Edge updates menu item price to $15.99                   │
│     ├── Cloud updates same item price to $12.99                  │
│     ├── Both happen within sync window                           │
│     ├── Verify conflict detected                                 │
│     ├── Verify LWW resolution (newer timestamp wins)            │
│     └── Verify resolved value propagated to both                 │
│                                                                  │
│  3. RBAC ESCALATION PREVENTION                                   │
│     ├── Cashier attempts to access /staff/create                 │
│     ├── Verify 403 Forbidden response                            │
│     ├── Kitchen attempts to void order                           │
│     ├── Verify 403 Forbidden response                            │
│     ├── Verify audit log entry created                           │
│     └── Verify no partial state mutation                         │
│                                                                  │
│  4. HMAC TAMPERING DETECTION                                     │
│     ├── Send valid sync message                                  │
│     ├── Modify payload in transit                                │
│     ├── Verify signature mismatch detected                       │
│     ├── Verify message rejected                                  │
│     └── Verify tamper attempt logged                             │
│                                                                  │
│  5. SESSION REVOCATION                                           │
│     ├── Manager logs in, receives JWT                            │
│     ├── Admin terminates manager account                         │
│     ├── Manager attempts API call with old JWT                   │
│     ├── Verify 401 Unauthorized                                  │
│     └── Verify refresh token also revoked                        │
│                                                                  │
│  6. DATA CONSISTENCY UNDER LOAD                                  │
│     ├── 10 POS terminals placing orders simultaneously          │
│     ├── Verify all orders persisted correctly                    │
│     ├── Verify no race conditions in stock deduction             │
│     ├── Verify inventory never goes negative                     │
│     └── Verify order numbers are sequential                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Sprint Planning & Delivery

### 12.1 Sprint 1 (MVP) — Weeks 1-2

```
SPRINT 1: FOUNDATION & CORE MVP
════════════════════════════════

USER STORY 1.1: Digital Menu Display
  ├── As a customer, I can view the restaurant menu
  ├── As a staff member, I can manage menu items
  ├── Tasks:
  │   ├── Set up React project with Vite
  │   ├── Create menu data schema (PostgreSQL + SQLite)
  │   ├── Build menu API endpoints (CRUD)
  │   ├── Build menu UI components
  │   ├── Add category filtering and search
  │   └── Write unit tests (85% coverage)
  ├── Acceptance Criteria:
  │   ├── Menu loads in <200ms
  │   ├── Search returns results in <80ms
  │   └── All tests pass
  └── Points: 13

USER STORY 1.2: Basic Order Placement
  ├── As a cashier, I can create new orders
  ├── As a cashier, I can add items to cart
  ├── As a cashier, I can select order type
  ├── Tasks:
  │   ├── Build order data model
  │   ├── Create order API endpoints
  │   ├── Build POS terminal UI
  │   ├── Implement cart management
  │   ├── Add order type selection (dine-in/takeaway/delivery)
  │   └── Write integration tests
  ├── Acceptance Criteria:
  │   ├── Order creation <200ms
  │   ├── Cart updates in real-time
  │   └── Order persisted to database
  └── Points: 13

USER STORY 1.3: RBAC Middleware
  ├── As a system, I enforce role-based access
  ├── As an admin, I can manage user permissions
  ├── Tasks:
  │   ├── Design JWT auth flow
  │   ├── Implement JWT generation/verification
  │   ├── Build RBAC middleware
  │   ├── Create role definitions (all 5 roles)
  │   ├── Add permission checking to all endpoints
  │   ├── Implement session management
  │   └── Write security tests
  ├── Acceptance Criteria:
  │   ├── Unauthorized requests return 401
  │   ├── Forbidden requests return 403
  │   ├── Tokens expire after 15 minutes
  │   └── Role changes revoke existing tokens
  └── Points: 13

USER STORY 1.4: Edge Gateway Setup
  ├── As a restaurant, I have a local server for offline ops
  ├── As a system, I sync data between edge and cloud
  ├── Tasks:
  │   ├── Set up SQLite local database
  │   ├── Implement CRDT vector clocks
  │   ├── Build sync protocol (push/pull)
  │   ├── Add HMAC message signing
  │   ├── Create sync queue manager
  │   ├── Build conflict resolution engine
  │   └── Write offline simulation tests
  ├── Acceptance Criteria:
  │   ├── POS works during network outage
  │   ├── Data syncs within 5 seconds of reconnection
  │   ├── No data loss during offline period
  │   └── Conflicts resolved correctly
  └── Points: 21

SPRINT 1 VELOCITY: 60 POINTS
SPRINT 1 DELIVERABLES:
  ✅ Functional digital menu with search
  ✅ Basic order placement (POS terminal)
  ✅ JWT authentication with RBAC middleware
  ✅ Edge gateway with CRDT sync
  ✅ HMAC message authentication
  ✅ Offline mode (local POS operations)
```

### 12.2 Sprint 2 (Enhanced) — Weeks 3-4

```
SPRINT 2: OPERATIONS & INVENTORY
════════════════════════════════

USER STORY 2.1: Order Pipeline
  ├── Order status lifecycle (pending→preparing→ready→completed)
  ├── Kitchen display view
  ├── Order timer with alerts
  ├── Real-time WebSocket updates
  └── Points: 13

USER STORY 2.2: Table Management
  ├── Visual table layout (20 tables)
  ├── Table status tracking (available/occupied)
  ├── Auto-release on order completion
  └── Points: 8

USER STORY 2.3: Inventory Control
  ├── Stock tracking with low-stock alerts
  ├── Auto stock deduction on orders
  ├── Bulk restock functionality
  ├── Inventory reports
  └── Points: 13

USER STORY 2.4: Payment Processing
  ├── Multi-payment support (cash/card/upi)
  ├── Discount application (fixed/percent)
  ├── Tax calculation
  ├── Receipt generation
  └── Points: 8

SPRINT 2 VELOCITY: 42 POINTS
```

### 12.3 Sprint 3 (Analytics) — Weeks 5-6

```
SPRINT 3: ANALYTICS & CUSTOMERS
════════════════════════════════

USER STORY 3.1: Analytics Dashboard
  ├── Revenue/profit tracking
  ├── Hourly sales chart
  ├── Popular items ranking
  ├── Category sales breakdown
  ├── Low stock alerts
  └── Points: 13

USER STORY 3.2: Reports & Export
  ├── Filtered reports (today/week/month/all)
  ├── Payment method breakdown
  ├── Order type distribution
  ├── CSV export
  └── Points: 8

USER STORY 3.3: Customer & Loyalty
  ├── Customer database
  ├── 4-tier loyalty system
  ├── Points earning/redemption
  ├── Auto tier upgrades
  └── Points: 13

USER STORY 3.4: Staff Management
  ├── Employee CRUD
  ├── Role assignment
  ├── Avatar selection
  └── Points: 8

SPRINT 3 VELOCITY: 42 POINTS
```

### 12.4 Sprint 4 (Polish) — Weeks 7-8

```
SPRINT 4: AI & PRODUCTION HARDENING
════════════════════════════════════

USER STORY 4.1: AI Chatbot
  ├── Natural language order assistance
  ├── Menu Q&A
  ├── Order status queries
  ├── Quick action buttons
  └── Points: 13

USER STORY 4.2: White-Label Support
  ├── Tenant branding configuration
  ├── Custom logo/color upload
  ├── Custom receipt templates
  └── Points: 8

USER STORY 4.3: Production Hardening
  ├── Performance optimization
  ├── Security audit
  ├── Load testing
  ├── Monitoring setup
  ├── Documentation
  └── Points: 13

USER STORY 4.4: Deployment
  ├── Docker containerization
  ├── CI/CD pipeline (GitHub Actions)
  ├── Kubernetes manifests
  ├── Staging environment
  └── Points: 8

SPRINT 4 VELOCITY: 42 POINTS
```

### 12.5 Definition of Done (DoD)

```
┌─────────────────────────────────────────────────────────────────┐
│                  DEFINITION OF DONE                               │
│                                                                  │
│  A user story is DONE when:                                      │
│                                                                  │
│  ☐ Code complete                                                 │
│    ├── All acceptance criteria met                               │
│    ├── No known defects                                          │
│    └── Edge cases handled                                        │
│                                                                  │
│  ☐ Code quality                                                  │
│    ├── Linting passes (ESLint, zero warnings)                    │
│    ├── Type checking passes (TypeScript, zero errors)           │
│    ├── Code reviewed by ≥1 peer                                  │
│    └── No security vulnerabilities (Snyk scan)                  │
│                                                                  │
│  ☐ Testing                                                       │
│    ├── Unit tests written (≥85% coverage)                        │
│    ├── Integration tests pass                                    │
│    ├── E2E tests pass (critical paths)                          │
│    └── No regression in existing tests                           │
│                                                                  │
│  ☐ Security                                                      │
│    ├── OWASP ZAP scan clean                                     │
│    ├── HMAC signing verified                                     │
│    ├── RBAC permissions correct                                  │
│    └── Input validation complete                                 │
│                                                                  │
│  ☐ Performance                                                   │
│    ├── Meets latency requirements                                │
│    ├── No memory leaks                                           │
│    └── Database queries optimized                                │
│                                                                  │
│  ☐ Documentation                                                 │
│    ├── API documentation updated                                 │
│    ├── README updated                                            │
│    └── Inline comments for complex logic                         │
│                                                                  │
│  ☐ Deployment                                                    │
│    ├── Builds successfully                                       │
│    ├── Deploys to staging                                        │
│    └── Smoke tests pass in staging                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 13. Deployment Architecture

### 13.1 CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE                                 │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Code    │    │  Build   │    │  Test    │    │  Deploy  │  │
│  │  Push    │───►│  Stage   │───►│  Stage   │───►│  Stage   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │               │               │               │          │
│       │          ┌────┴────┐    ┌────┴────┐    ┌────┴────┐     │
│       │          │ Install │    │ Unit    │    │ Staging │     │
│       │          │ Deps    │    │ Tests   │    │ Deploy  │     │
│       │          └─────────┘    └─────────┘    └─────────┘     │
│       │          ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│       │          │ Lint    │    │ Integ.  │    │ Smoke   │     │
│       │          │ Check   │    │ Tests   │    │ Tests   │     │
│       │          └─────────┘    └─────────┘    └─────────┘     │
│       │          ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│       │          │ Type    │    │ E2E     │    │ Health  │     │
│       │          │ Check   │    │ Tests   │    │ Check   │     │
│       │          └─────────┘    └─────────┘    └─────────┘     │
│       │          ┌─────────┐    ┌─────────┐                    │
│       │          │ Security│    │ Perf    │    ┌─────────┐     │
│       │          │ Scan    │    │ Tests   │    │ Prod    │     │
│       │          └─────────┘    └─────────┘    │ Deploy  │     │
│       │                                        │(manual) │     │
│       │                                        └─────────┘     │
│       │                                                        │
│  ┌────┴────────────────────────────────────────────────────┐   │
│  │  TRIGGERS                                                │   │
│  │  ├── PR: Lint + Type + Unit + Security                  │   │
│  │  ├── Merge to main: Full test suite + Staging deploy    │   │
│  │  ├── Tag release: Full test suite + Production deploy   │   │
│  │  └── Schedule: Weekly performance + security scans      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 13.2 Container Architecture

```yaml
# docker-compose.yml (Edge Gateway)
version: '3.8'
services:
  edge-gateway:
    image: foodieos/edge-gateway:latest
    ports:
      - "8443:8443"    # HTTPS API
      - "8444:8444"    # WebSocket
    volumes:
      - edge-data:/data
      - edge-certs:/certs
    environment:
      - NODE_ENV=production
      - EDGE_SITE_ID=${EDGE_SITE_ID}
      - CLOUD_API_URL=${CLOUD_API_URL}
      - TPM_ENABLED=true
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '4'
    restart: unless-stopped

  sqlite-backup:
    image: foodieos/sqlite-backup:latest
    volumes:
      - edge-data:/data
    environment:
      - BACKUP_INTERVAL=3600
      - RETENTION_DAYS=30
    restart: unless-stopped

  monitoring:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

volumes:
  edge-data:
  edge-certs:
```

---

## 14. Monitoring & Observability

### 14.1 Metrics Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│              MONITORING DASHBOARD LAYOUT                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SYSTEM HEALTH                                           │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │    │
│  │  │ CPU     │ │ Memory  │ │ Disk    │ │ Network │      │    │
│  │  │ 45%     │ │ 62%     │ │ 34%     │ │ 12MB/s  │      │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  API PERFORMANCE                                         │    │
│  │  • Request Rate: 150 req/sec                            │    │
│  │  • Error Rate: 0.02%                                    │    │
│  │  • P50 Latency: 45ms                                    │    │
│  │  • P95 Latency: 120ms                                   │    │
│  │  • P99 Latency: 250ms                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SYNC STATUS                                             │    │
│  │  • Pending Sync: 0 messages                             │    │
│  │  • Sync Latency: 180ms avg                              │    │
│  │  • Conflict Rate: 0.1%                                  │    │
│  │  • Last Sync: 5 seconds ago                             │    │
│  │  • Online: ✅                                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SECURITY EVENTS                                         │    │
│  │  • Failed Logins: 3 (last hour)                         │    │
│  │  • HMAC Failures: 0                                     │    │
│  │  • Rate Limit Hits: 12                                  │    │
│  │  • Active Sessions: 8                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 14.2 Alerting Rules

```yaml
alerts:
  critical:
    - name: "Edge Offline"
      condition: "edge_status == 'offline' for 5m"
      action: "PagerDuty + SMS"

    - name: "Database Connection Lost"
      condition: "db_connections == 0 for 1m"
      action: "PagerDuty + Slack"

    - name: "HMAC Validation Failures"
      condition: "hmac_failures > 10 in 5m"
      action: "PagerDuty + Security Team"

  warning:
    - name: "High Latency"
      condition: "p95_latency > 500ms for 5m"
      action: "Slack + Email"

    - name: "Sync Queue Backlog"
      condition: "sync_pending > 1000 for 10m"
      action: "Slack"

    - name: "Low Stock Alert"
      condition: "items_below_threshold > 5"
      action: "Slack (Restaurant Channel)"

    - name: "Failed Authentication"
      condition: "auth_failures > 5 in 1m"
      action: "Slack + Security Log"

  info:
    - name: "Daily Report Ready"
      condition: "cron == 'daily_report'"
      action: "Email (Owner)"

    - name: "Key Rotation Due"
      condition: "days_until_rotation < 7"
      action: "Slack (DevOps)"
```

---

## 15. Disaster Recovery

### 15.1 Backup Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKUP STRATEGY                                │
│                                                                  │
│  EDGE GATEWAY:                                                   │
│  ├── SQLite backup: Every hour (incremental), daily (full)     │
│  ├── Backup location: Encrypted S3 bucket (per restaurant)     │
│  ├── Retention: 30 days local, 90 days cloud                   │
│  └── Recovery Time: <5 minutes (restore from last backup)      │
│                                                                  │
│  CLOUD DATABASE:                                                 │
│  ├── PostgreSQL: Continuous WAL archiving                       │
│  ├── RDS automated backups: Daily, 35-day retention            │
│  ├── Manual snapshots: Before major deployments                │
│  └── Recovery Time: <15 minutes (point-in-time recovery)       │
│                                                                  │
│  MEDIA/FILES:                                                    │
│  ├── S3 versioning enabled                                      │
│  ├── Cross-region replication (DR region)                       │
│  └── Lifecycle policies (90-day standard, then Glacier)        │
│                                                                  │
│  RECOVERY PROCEDURES:                                            │
│  ├── RTO (Recovery Time Objective): 1 hour                     │
│  ├── RPO (Recovery Point Objective): 1 hour                    │
│  └── DR drills: Quarterly                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 15.2 Incident Response

```
INCIDENT SEVERITY LEVELS:
  P0 (Critical): System down, data loss risk
    → Response: 15 minutes, all hands
    → Communication: Every 15 minutes

  P1 (High): Major feature broken, workaround exists
    → Response: 1 hour
    → Communication: Every hour

  P2 (Medium): Minor feature broken, no data impact
    → Response: 4 hours
    → Communication: Daily

  P3 (Low): Cosmetic issue, enhancement request
    → Response: Next sprint
    → Communication: Weekly
```

---

## Appendix A: Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | React 19 + Vite | Fast builds, modern DX, component ecosystem |
| Backend | Node.js + Express | Edge-compatible, TypeScript support, ecosystem |
| Cloud Backend | Go (Sync Service) | Performance for CRDT operations |
| Analytics | Python + Pandas | Data processing ecosystem |
| Primary DB (Cloud) | PostgreSQL 15 | ACID, JSONB, proven reliability |
| Edge DB | SQLite 3.40 | Zero-config, reliable, FTS5 support |
| Cache | Redis 7 | Session management, rate limiting |
| Message Queue | Apache Kafka | Event sourcing, replay capability |
| Auth | JWT + OAuth 2.0 | Stateless, industry standard |
| Encryption | AES-256 + TLS 1.3 | Maximum security |
| Container | Docker + Kubernetes | Orchestration, scaling |
| CI/CD | GitHub Actions | Native integration |
| Monitoring | Prometheus + Grafana | Open source, proven |

---

## Appendix B: File Structure

```
foodieos/
├── apps/
│   ├── web/                    # React POS Terminal
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── context/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── edge-gateway/           # Edge Server
│   │   ├── src/
│   │   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── sync/
│   │   │   ├── database/
│   │   │   ├── middleware/
│   │   │   └── config/
│   │   ├── migrations/
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── cloud-api/              # Cloud Services
│       ├── auth-service/
│       ├── tenant-service/
│       ├── analytics-service/
│       ├── sync-service/
│       ├── billing-service/
│       └── notification-service/
│
├── packages/
│   ├── shared/                 # Shared types, utils
│   │   ├── types/
│   │   ├── validators/
│   │   └── crdt/
│   │
│   └── ui/                     # Shared UI components
│       ├── components/
│       └── styles/
│
├── infra/
│   ├── kubernetes/
│   ├── terraform/
│   └── docker/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── security/
│   └── performance/
│
├── docs/
│   ├── api/
│   ├── architecture/
│   └── runbooks/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       └── security.yml
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

<p align="center">
  <strong>Document Version:</strong> 3.0-arch | 
  <strong>Last Updated:</strong> August 20, 2026 | 
  <strong>Status:</strong> CEO Approved
</p>
