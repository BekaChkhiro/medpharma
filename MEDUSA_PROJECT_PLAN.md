# MEDUSA_PROJECT_PLAN.md

## Project Overview

| Field | Value |
|-------|-------|
| **Project Name** | MedPharma Plus - Dietary Products Store |
| **Project Type** | E-commerce (Medusa.js 2.0) |
| **Description** | სპეციალური დიეტური პროდუქტების ონლაინ მაღაზია - შაქრის შემცვლელები, დაბალცილებიანი PKU პროდუქტები, ციკორის ყავა, ჯანსაღი სნეკები |
| **Target Users** | დიაბეტიკები, PKU პაციენტები, ჯანსაღი კვების მოყვარულები |
| **Created** | 2026-03-23 |
| **Last Updated** | 2026-03-23 |
| **Status** | Planning |
| **Plugin Version** | 1.2.0 |

---

## Brand Identity

### კომპანიის ინფორმაცია
| Field | Value |
|-------|-------|
| **სახელი (KA)** | მედფარმა პლუსი აფთიაქი |
| **სახელი (EN)** | APOTEKA MEDPHARMA PLUS |
| **იურიდიული** | შპს მედფარმა პლუსი |
| **ფილიალები** | 1 (ერთი) |
| **ვიზუალური სტილი** | მინიმალისტური "კლინიკური" სითეთრე |

### ბრენდის ფერები
| ფერი | CMYK | HEX | გამოყენება |
|------|------|-----|------------|
| **Primary Red** | C:20 M:100 Y:100 K:17 | `#A90000` | ლოგო, ღილაკები, აქცენტები |
| **Gray** | C:0 M:0 Y:0 K:20 | `#CCCCCC` | მეორადი ელემენტები |
| **White** | - | `#FFFFFF` | ფონი |

### ფონტები
| ენა | ფონტი | Web Alternative |
|-----|-------|-----------------|
| **ქართული** | Avaza Mtavruli | BPG Glaho / Noto Sans Georgian |
| **ინგლისური** | Arial | Arial, sans-serif |

### ლოგოს ელემენტები
- **სიმბოლო**: სამედიცინო ჯვარი + სასწორი + "M"
- **ვარიანტები**: Full color, Monochrome (gray), Outlined

### სამუშაო საათები
| ტიპი | საათები |
|------|---------|
| **ოფისი** | ორშაბათი-პარასკევი 09:00-18:00 |
| **აფთიაქი** | ორშაბათი-პარასკევი 09:00-20:00, შაბათი 10:00-18:00 |
| **კვირა** | დასვენება |

### მიწოდების პირობები
- **სამუშაო საათებში**: შეკვეთიდან 2 საათში
- **არასამუშაო საათებში**: მომდევნო სამუშაო დღეს
- **ხელმისაწვდომობა**: მხოლოდ სამუშაო დღეებში

### Tone of Voice (კომუნიკაციის სტილი)
- **ექსპერტული და პროფესიონალური**
- **მზრუნველი და თბილი**
- **ინოვაციური**
- აქცენტი: ფარმაცევტულ სფეროში დიდი გამოცდილება, გუნდის პროფესიონალიზმი

### სლოგანის ვარიანტები
1. "ერთად ჯანმრთელი მომავლისათვის!"
2. "სანდო პარტნიორი თქვენი ჯანმრთელობისა და სილამაზის სამსახურში"
3. "პერსონალიზებული ფარმაცევტული ზრუნვა"
4. "ინოვაცია, ხარისხი, ზრუნვა - ნდობის ახალი სტანდარტი მედიცინაში"

### CTA (Call to Action) ვარიანტები
- "იყიდე ონლაინ"
- "იპოვე უახლოესი ფილიალი"

---

## Business Requirements

### Core Business Model
- **Guest Checkout Only** - რეგისტრაცია არ სჭირდება
- **Bilingual** - ქართული + ინგლისური
- **Single Currency** - მხოლოდ GEL (ლარი)
- **Single Store** - ერთი მაღაზია, 1 ფილიალი (აფთიაქი)
- **Loyalty Program** - მეორე ეტაპისთვის გადავადებული

### პრიორიტეტული კატეგორიები (Phase 1)
1. **დიაბეტური კვება** - შაქრის შემცვლელები, უშაქრო პროდუქტები
2. **იშვიათი დაავადებების კვება (PKU)** - დაბალცილებიანი პროდუქტები
3. **უგლუტენო პროდუქტები**
4. **ესთეტიკა და სილამაზე**
5. **ევროპული ხარისხის საკვები დანამატები**
6. **სამედიცინო მოწყობილობები**

### Product Types
1. **შაქრის შემცვლელები** - სტევია, ფრუქტოზა, ერითრიტოლი
2. **ციკორის ყავა** - ნატურალური, არომატიზებული
3. **დაბალცილებიანი პროდუქტები (PKU)** - მაკარონი, ფაფები, ორცხობილა
4. **ჯანსაღი სნეკები** - უშაქრო ბატონჩიკები

### ექსკლუზიური ბრენდები
- **Becton Dickinson**
- **VITAFLO™**
- **Mevalia**
- **Swedish Nutra**
- **Novaproduct**
- **Embecta**
- **Mayali Hane**

### Brands/Manufacturers
- Novasweet (რუსეთი)
- Bionova (რუსეთი)
- Mevalia (იტალია)
- МакМастер/MacMaster (რუსეთი)
- Ol Lite (რუსეთი)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Medusa.js 2.0 |
| **Frontend** | Next.js (Medusa Starter) |
| **Database** | PostgreSQL |
| **Cache** | Redis |
| **File Storage** | Cloudflare R2 |
| **Email** | Resend |
| **Hosting** | Railway |
| **Payment** | BOG iPay + Cash on Delivery |
| **ERP** | APEX (REST API) |
| **Analytics** | Google Analytics 4 + Facebook Pixel |

---

## Data Models

### Product Model (Custom)
```typescript
Product {
  // Identifiers
  sku: string
  apexId?: string

  // Names (bilingual)
  name_ka: string
  name_en: string
  description_ka?: string
  description_en?: string

  // Pricing
  price: number
  salePrice?: number

  // Relations
  categoryId: string
  brandId: string

  // Product Details
  weight?: string              // "100გ", "500მლ", "N150"
  unit?: string                // "გ", "მლ", "ცალი"
  manufacturerCountry: string  // "რუსეთი", "იტალია"

  // Dietary Tags (NEW)
  isSugarFree: boolean         // უშაქრო
  isLowProtein: boolean        // დაბალცილებიანი (PKU)
  isDiabeticFriendly: boolean  // დიაბეტისთვის
  isGlutenFree: boolean        // უგლუტენო

  // Product Type (for disclaimers)
  productType: ProductType     // SUPPLEMENT | SPECIAL_FOOD | MEDICATION | OTHER

  // Stock & Status
  stock: number
  isActive: boolean
  isFeatured: boolean

  // SEO
  metaTitle_ka?: string
  metaTitle_en?: string
  metaDescription_ka?: string
  metaDescription_en?: string
}
```

### Category Model
```typescript
Category {
  id: string
  slug: string
  name_ka: string
  name_en: string
  description_ka?: string
  description_en?: string
  image?: string
  parentId?: string        // Unlimited hierarchy
  sortOrder: number
  isActive: boolean
}
```

### DeliveryZone Model (Custom Module)
```typescript
DeliveryZone {
  id: string
  name_ka: string
  name_en: string
  fee: number              // მხოლოდ ფასი
  isActive: boolean
  sortOrder: number
}
```

### Branch Model (Custom Module)
```typescript
Branch {
  id: string
  name_ka: string
  name_en: string
  address_ka: string
  address_en: string
  phone?: string

  // სამუშაო საათები (structured)
  workingHours: {
    weekdays: { open: "09:00", close: "20:00" }  // ორშ-პარ
    saturday: { open: "10:00", close: "18:00" }
    sunday: null  // დასვენება
  }

  // მიწოდების ინფო
  deliveryInfo_ka?: string  // "შეკვეთიდან 2 საათში"
  deliveryInfo_en?: string

  coordinates?: { lat: number, lng: number }
  isActive: boolean
  sortOrder: number
}
```

> **შენიშვნა**: ამჟამად მხოლოდ 1 ფილიალი (აფთიაქი)

### Order Statuses (Custom)
```typescript
OrderStatus =
  | "PENDING"           // მოლოდინში
  | "CONFIRMED"         // დადასტურებული
  | "PACKED"            // შეფუთული
  | "COURIER_ASSIGNED"  // კურიერი მინიჭებული
  | "SHIPPED"           // გაგზავნილი
  | "DELIVERED"         // მიწოდებული
  | "CANCELLED"         // გაუქმებული
```

### Product Types (for Legal Disclaimers)
```typescript
ProductType =
  | "SUPPLEMENT"        // საკვები დანამატი
  | "SPECIAL_FOOD"      // სპეც. სამედიცინო საკვები (PKU, დიაბეტური)
  | "MEDICATION"        // მედიკამენტი
  | "COSMETIC"          // კოსმეტიკა/ჰიგიენა
  | "DEVICE"            // სამედიცინო მოწყობილობა
  | "OTHER"             // სხვა
```

> **შენიშვნა**: თითოეული ProductType-ს შესაბამისი disclaimer უნდა გამოჩნდეს პროდუქტის გვერდზე

### Banner Model (Custom Module)
```typescript
Banner {
  id: string
  title_ka?: string
  title_en?: string
  subtitle_ka?: string
  subtitle_en?: string
  image: string
  imageMobile?: string
  link?: string
  buttonText_ka?: string
  buttonText_en?: string
  position: "homepage" | "category" | "product"
  sortOrder: number
  isActive: boolean
  startsAt?: Date
  endsAt?: Date
}
```

### CMS Page Model (Custom Module)
```typescript
Page {
  id: string
  slug: string
  title_ka: string
  title_en: string
  content_ka: string
  content_en: string
  metaTitle_ka?: string
  metaTitle_en?: string
  metaDescription_ka?: string
  metaDescription_en?: string
  isActive: boolean
}
```

---

## Project Phases

### Phase 1: Foundation & Setup
> Medusa.js 2.0 პროექტის ინიციალიზაცია და ბაზისური კონფიგურაცია

#### T1.1: Initialize Medusa.js 2.0 Project
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: None
- **Estimated Hours**: 4
- **Description**:
  - Create Medusa project with `create-medusa-app`
  - Configure PostgreSQL database
  - Setup Redis for caching
  - Configure environment variables

#### T1.2: Configure Project Structure
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: T1.1
- **Estimated Hours**: 2
- **Description**:
  - Setup src/modules directory structure
  - Setup src/api directory structure
  - Setup src/admin directory structure
  - Setup src/workflows directory structure
  - Configure TypeScript paths

#### T1.3: Disable Unnecessary Medusa Modules
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: T1.2
- **Estimated Hours**: 1
- **Description**:
  - Disable Customer module (guest checkout only)
  - Disable Promotion module (if not needed)
  - Disable Gift Card module
  - Configure medusa-config.ts with only required modules

#### T1.4: Setup File Storage (Cloudflare R2)
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.2
- **Estimated Hours**: 3
- **Description**:
  - Install S3-compatible file service
  - Configure Cloudflare R2 credentials
  - Setup image upload endpoints
  - Configure image optimization

#### T1.5: Setup Email Service (Resend)
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.2
- **Estimated Hours**: 3
- **Description**:
  - Install Resend notification provider
  - Configure email templates
  - Setup order confirmation emails
  - Setup status update emails

---

### Phase 2: Custom Modules Development
> თქვენი ბიზნესისთვის საჭირო custom მოდულების შექმნა

#### T2.1: Create Product Extension Module
- [ ] **Status**: TODO
- **Complexity**: High
- **Dependencies**: T1.3
- **Estimated Hours**: 10
- **Description**:
  - Extend Medusa Product with custom fields
  - Add bilingual fields (name_ka, name_en, etc.)
  - Add dietary tags (isSugarFree, isLowProtein, isDiabeticFriendly, isGlutenFree)
  - Add productType enum (SUPPLEMENT, SPECIAL_FOOD, MEDICATION, COSMETIC, DEVICE, OTHER)
  - Add manufacturerCountry field
  - Add weight and unit fields
  - Add APEX ID field
  - Create migrations

#### T2.2: Create Brand Module
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.3
- **Estimated Hours**: 4
- **Description**:
  - Create Brand data model (DML)
  - Create BrandModuleService
  - Export module definition
  - Create migrations
  - Link to Product module

#### T2.3: Create Category Extension Module
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.3
- **Estimated Hours**: 4
- **Description**:
  - Extend/Create Category with bilingual fields
  - Add hierarchical support (parentId)
  - Add sortOrder and isActive
  - Create migrations

#### T2.4: Create DeliveryZone Module
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.3
- **Estimated Hours**: 4
- **Description**:
  - Create DeliveryZone data model
  - Create DeliveryZoneModuleService
  - Add bilingual name fields
  - Add fee field (simple pricing)
  - Create migrations

#### T2.5: Create Branch Module
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.3
- **Estimated Hours**: 4
- **Description**:
  - Create Branch data model for pickup locations
  - Add bilingual fields (name, address)
  - Add working hours and coordinates
  - Create migrations

#### T2.6: Create Banner Module
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.3
- **Estimated Hours**: 5
- **Description**:
  - Create Banner data model
  - Add bilingual fields
  - Add position enum (homepage, category, product)
  - Add scheduling (startsAt, endsAt)
  - Add mobile image support
  - Create migrations

#### T2.7: Create CMS/Page Module
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.3
- **Estimated Hours**: 4
- **Description**:
  - Create Page data model
  - Add bilingual content fields
  - Add SEO meta fields
  - Add slug and isActive
  - Create migrations

#### T2.8: Create Custom Order Status Workflow
- [ ] **Status**: TODO
- **Complexity**: High
- **Dependencies**: T1.3
- **Estimated Hours**: 6
- **Description**:
  - Create custom OrderStatus enum
  - Add PACKED and COURIER_ASSIGNED statuses
  - Create status transition workflows
  - Add courier info fields (name, phone)
  - Setup status change notifications

---

### Phase 3: Payment & Delivery Integration
> BOG iPay გადახდის სისტემა და მიწოდების ლოგიკა

#### T3.1: Create BOG iPay Payment Provider
- [ ] **Status**: TODO
- **Complexity**: High
- **Dependencies**: T2.8
- **Estimated Hours**: 12
- **Description**:
  - Create BOG payment provider plugin
  - Implement initiate payment flow
  - Implement callback/webhook handling
  - Implement redirect flow
  - Handle payment success/failure
  - Add idempotency key support
  - Create comprehensive error handling

#### T3.2: Create Cash on Delivery Payment Provider
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: T2.8
- **Estimated Hours**: 2
- **Description**:
  - Create COD payment provider
  - Set payment status as pending
  - Handle order confirmation flow

#### T3.3: Implement Delivery Zone Selection Logic
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T2.4
- **Estimated Hours**: 4
- **Description**:
  - Create API endpoint for active delivery zones
  - Implement delivery fee calculation
  - Add zone selection to checkout flow
  - Create delivery zone validation

#### T3.4: Implement Branch Pickup Logic
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T2.5
- **Estimated Hours**: 4
- **Description**:
  - Create API endpoint for active branches
  - Add pickup option to checkout
  - Set delivery fee to 0 for pickup
  - Store selected branch in order

---

### Phase 4: APEX ERP Integration
> APEX ERP სისტემასთან სრული ინტეგრაცია

#### T4.1: Create APEX Integration Module
- [ ] **Status**: TODO
- **Complexity**: High
- **Dependencies**: T2.1
- **Estimated Hours**: 8
- **Description**:
  - Create APEX module structure
  - Implement REST API client
  - Add authentication handling
  - Add error handling and retry logic
  - Create configuration options

#### T4.2: Implement Product Sync (Import)
- [ ] **Status**: TODO
- **Complexity**: High
- **Dependencies**: T4.1
- **Estimated Hours**: 8
- **Description**:
  - Create product import workflow
  - Map APEX fields to Medusa fields
  - Handle product create/update logic
  - Handle image import
  - Add sync logging

#### T4.3: Implement Stock Sync
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T4.1
- **Estimated Hours**: 4
- **Description**:
  - Create stock sync workflow
  - Update inventory from APEX
  - Handle low stock alerts
  - Add sync scheduling (cron)

#### T4.4: Implement Order Export
- [ ] **Status**: TODO
- **Complexity**: High
- **Dependencies**: T4.1
- **Estimated Hours**: 6
- **Description**:
  - Create order export workflow
  - Map order data to APEX format
  - Send orders to APEX on confirmation
  - Handle export errors and retries

#### T4.5: Create APEX Admin UI
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T4.2, T4.3, T4.4
- **Estimated Hours**: 6
- **Description**:
  - Create APEX admin page
  - Add manual sync buttons
  - Show sync status and logs
  - Add sync configuration options

#### T4.6: Setup Automatic Sync Jobs
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T4.5
- **Estimated Hours**: 4
- **Description**:
  - Setup cron jobs for automatic sync
  - Configure sync intervals
  - Add sync failure notifications
  - Create sync health monitoring

---

### Phase 5: Admin Panel Customization
> Medusa Admin-ის გაფართოება custom გვერდებით

#### T5.1: Create Product Admin Extensions
- [ ] **Status**: TODO
- **Complexity**: High
- **Dependencies**: T2.1
- **Estimated Hours**: 8
- **Description**:
  - Add bilingual fields to product form
  - Add dietary tags UI (checkboxes)
  - Add manufacturer country selector
  - Add weight/unit fields
  - Add APEX ID display widget

#### T5.2: Create Brand Admin Page
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T2.2
- **Estimated Hours**: 4
- **Description**:
  - Create brands list page
  - Create brand create/edit form
  - Add country selector
  - Add logo upload

#### T5.3: Create Category Admin Page
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T2.3
- **Estimated Hours**: 5
- **Description**:
  - Create categories list with hierarchy
  - Add drag & drop reordering
  - Create category create/edit form
  - Add parent category selector

#### T5.4: Create Delivery Zone Admin Page
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: T2.4
- **Estimated Hours**: 3
- **Description**:
  - Create delivery zones list
  - Create zone create/edit form
  - Add sorting functionality
  - Add active/inactive toggle

#### T5.5: Create Branch Admin Page
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T2.5
- **Estimated Hours**: 4
- **Description**:
  - Create branches list
  - Create branch create/edit form
  - Add map integration for coordinates
  - Add working hours editor

#### T5.6: Create Banner Admin Page
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T2.6
- **Estimated Hours**: 5
- **Description**:
  - Create banners list with preview
  - Create banner create/edit form
  - Add image upload (desktop + mobile)
  - Add scheduling date pickers
  - Add position selector

#### T5.7: Create CMS Pages Admin
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T2.7
- **Estimated Hours**: 5
- **Description**:
  - Create pages list
  - Create page create/edit form
  - Add rich text editor for content
  - Add SEO fields section

#### T5.8: Create Reports Dashboard
- [ ] **Status**: TODO
- **Complexity**: High
- **Dependencies**: T2.8
- **Estimated Hours**: 8
- **Description**:
  - Create dashboard overview page
  - Add sales statistics widgets
  - Add order status breakdown
  - Add top products chart
  - Add revenue chart (30 days)
  - Add date range filters

---

### Phase 6: Storefront Development
> Next.js frontend-ის დეველოპმენტი

#### T6.1: Setup Next.js Storefront
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.1
- **Estimated Hours**: 5
- **Description**:
  - Clone Medusa Next.js starter
  - Configure Medusa SDK
  - Setup environment variables
  - Configure i18n (next-intl for ka/en)
  - Setup brand fonts (Avaza Mtavruli / BPG Glaho for Georgian, Arial for English)
  - Configure Tailwind with brand colors (#A90000, #CCCCCC)

#### T6.2: Implement Bilingual Support
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T6.1
- **Estimated Hours**: 6
- **Description**:
  - Setup next-intl configuration
  - Create language switcher component
  - Create translation files (ka.json, en.json)
  - Implement locale routing ([locale]/...)

#### T6.3: Create Homepage
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T6.2, T2.6
- **Estimated Hours**: 6
- **Description**:
  - Create hero banner slider
  - Create featured products section
  - Create category cards grid
  - Create promotional banners section

#### T6.4: Create Product Catalog Page
- [ ] **Status**: TODO
- **Complexity**: High
- **Dependencies**: T6.2
- **Estimated Hours**: 8
- **Description**:
  - Create product grid/list view
  - Implement filters sidebar:
    - Category filter
    - Price range filter
    - Brand filter
    - Manufacturer country filter
    - Dietary tags filters (isSugarFree, isLowProtein, isDiabeticFriendly, isGlutenFree)
    - In-stock filter
  - Implement sorting options
  - Implement pagination
  - Implement search

#### T6.5: Create Product Detail Page
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T6.2
- **Estimated Hours**: 6
- **Description**:
  - Create product image gallery
  - Display product info with bilingual content
  - Show dietary tags badges (უშაქრო, PKU, უგლუტენო)
  - **Display legal disclaimer based on productType**
  - Create add to cart button
  - Show related products
  - Add breadcrumbs

#### T6.6: Create Shopping Cart
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T6.5
- **Estimated Hours**: 5
- **Description**:
  - Create cart drawer/page
  - Implement quantity controls
  - Show cart totals
  - Add proceed to checkout button
  - Persist cart state

#### T6.7: Create Guest Checkout Flow
- [ ] **Status**: TODO
- **Complexity**: High
- **Dependencies**: T6.6, T3.1, T3.2, T3.3, T3.4
- **Estimated Hours**: 10
- **Description**:
  - Step 1: Customer info (name, email, phone)
  - Step 2: Delivery selection
    - Zone selection with fee display
    - OR Branch pickup selection
  - Step 3: Payment method selection
    - BOG iPay
    - Cash on Delivery
  - Step 4: Order review and confirmation
  - Handle payment redirect/callback
  - Show order confirmation page

#### T6.8: Create Order Tracking Page
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T6.7
- **Estimated Hours**: 4
- **Description**:
  - Create order lookup form (order number + email)
  - Display order status timeline
  - Show order details
  - Show courier info when available

#### T6.9: Implement Wishlist
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: T6.5
- **Estimated Hours**: 3
- **Description**:
  - Create wishlist state (localStorage)
  - Add wishlist button to products
  - Create wishlist page
  - Show wishlist count in header

#### T6.10: Create Static Pages
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: T6.2, T2.7
- **Estimated Hours**: 4
- **Description**:
  - Create About page
  - Create Contact page
  - Create FAQ page
  - Create Privacy Policy page
  - Create Terms & Conditions page
  - Create Branches page with map

#### T6.11: Implement SEO
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T6.4, T6.5
- **Estimated Hours**: 5
- **Description**:
  - Add meta tags to all pages
  - Create JSON-LD structured data (Product, Organization, BreadcrumbList)
  - Generate sitemap.xml
  - Generate robots.txt
  - Add Open Graph tags
  - Add hreflang tags for bilingual

---

### Phase 7: Analytics & Tracking
> Analytics და tracking ინტეგრაცია

#### T7.1: Integrate Google Analytics 4
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T6.7
- **Estimated Hours**: 4
- **Description**:
  - Install GA4 tracking script
  - Configure page view tracking
  - Implement e-commerce events:
    - view_item
    - add_to_cart
    - begin_checkout
    - purchase
  - Setup conversion tracking

#### T7.2: Integrate Facebook Pixel
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T6.7
- **Estimated Hours**: 3
- **Description**:
  - Install FB Pixel script
  - Implement standard events:
    - ViewContent
    - AddToCart
    - InitiateCheckout
    - Purchase
  - Configure pixel for conversions

---

### Phase 8: Testing & Deployment
> ტესტირება და production deployment

#### T8.1: Setup Testing Environment
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T6.11
- **Estimated Hours**: 4
- **Description**:
  - Setup Playwright for E2E tests
  - Setup Vitest for unit tests
  - Create test database
  - Configure test environment

#### T8.2: Write Critical E2E Tests
- [ ] **Status**: TODO
- **Complexity**: High
- **Dependencies**: T8.1
- **Estimated Hours**: 8
- **Description**:
  - Test product browsing
  - Test search and filters
  - Test add to cart
  - Test complete checkout flow
  - Test order tracking
  - Test language switching

#### T8.3: Configure Railway Deployment
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T8.2
- **Estimated Hours**: 4
- **Description**:
  - Setup Railway project
  - Configure PostgreSQL addon
  - Configure Redis addon
  - Setup environment variables
  - Configure custom domain
  - Setup SSL

#### T8.4: Deploy Backend (Medusa)
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T8.3
- **Estimated Hours**: 3
- **Description**:
  - Deploy Medusa backend to Railway
  - Run database migrations
  - Verify API endpoints
  - Test admin panel access

#### T8.5: Deploy Frontend (Next.js)
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T8.4
- **Estimated Hours**: 3
- **Description**:
  - Deploy Next.js storefront to Railway
  - Configure environment for production
  - Verify frontend-backend connection
  - Test complete checkout flow

#### T8.6: Performance Optimization
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T8.5
- **Estimated Hours**: 4
- **Description**:
  - Optimize images (WebP, lazy loading)
  - Enable caching strategies
  - Optimize bundle size
  - Run PageSpeed Insights (target: 90+)
  - Fix performance issues

#### T8.7: Security Audit
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T8.5
- **Estimated Hours**: 4
- **Description**:
  - Review API security
  - Check for exposed secrets
  - Verify payment security
  - Test CORS configuration
  - Verify rate limiting

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Total Phases** | 8 |
| **Total Tasks** | 47 |
| **Estimated Hours** | ~235 |
| **High Complexity Tasks** | 11 |
| **Medium Complexity Tasks** | 27 |
| **Low Complexity Tasks** | 9 |

---

## Notes

### რა არ გვჭირდება (გამორთული მოდულები)
- ❌ `dosageForm` - არა ფარმაცევტული
- ❌ `requiresPrescription` - არა ფარმაცევტული
- ❌ `dosage` - არა ფარმაცევტული
- ❌ `activeIngredient` - არა ფარმაცევტული
- ❌ Customer module - guest checkout only
- ❌ Promotion module - თუ არ დაგჭირდებათ
- ❌ Gift Card module

### რა დავამატეთ (custom fields)
- ✅ `isSugarFree` - უშაქრო პროდუქტები
- ✅ `isLowProtein` - დაბალცილებიანი (PKU)
- ✅ `isDiabeticFriendly` - დიაბეტისთვის
- ✅ `manufacturerCountry` - მწარმოებელი ქვეყანა
- ✅ Custom order statuses (PACKED, COURIER_ASSIGNED)
- ✅ Branch pickup support

### Integration Points
- **APEX ERP**: REST API, bidirectional sync
- **BOG iPay**: Redirect payment flow
- **Cloudflare R2**: File storage
- **Resend**: Email notifications
- **GA4 + FB Pixel**: Analytics

---

## Legal Disclaimers (სავალდებულო გაფრთხილებები)

### მედიკამენტები
```
გამოყენებამდე გაეცანით ინსტრუქციას ან მიღებამდე გაეცანით ანოტაციას.
გვერდითი მოვლენების შესახებ მიმართეთ ექიმს.
არ გადააჭარბოთ რეკომენდებულ დღიურ დოზას.
შეინახეთ ბავშვებისათვის მიუწვდომელ ადგილას.
დაიცავით შენახვის პირობები.
```

### სპეციალური სამედიცინო საკვები (PKU და სხვ.)
```
გამოიყენება ექიმის მეთვალყურეობის ქვეშ.
არ გამოიყენოთ როგორც ერთადერთი კვების წყარო, თუ სხვაგვარად არ არის მითითებული.
სპეციალური დანიშნულების კვებითი პროდუქტი.
გამოიყენება ექიმის რეკომენდაციით.
```

### საკვები დანამატები
```
არ წარმოადგენს სამკურნალო საშუალებას.
```

---

## Prohibited Elements (აკრძალული ელემენტები რეკლამაში)

### აკრძალული ფრაზები ❌
- "100% განკურნება"
- "გარანტირებული შედეგი"
- "უსაფრთხოა ყველასთვის"
- "არ აქვს გვერდითი მოვლენები"
- "აუცილებელია ყველა ბავშვისთვის"
- "სწრაფი და უპირობო ეფექტი"
- "N1 ექიმის არჩევანი"

### საკვები დანამატების შემთხვევაში ❌
- "კურნავს დიაბეტს"
- "ამცირებს ონკოლოგიურ რისკს"
- "ანაცვლებს მედიკამენტს"

### აკრძალული სიმბოლოები ❌
- წითელი ჯვარი

---

## Marketing & Advertising

### სარეკლამო პლატფორმები
- Facebook
- Instagram
- TikTok
- YouTube
- LinkedIn

### კამპანიის ფოკუსი (Phase 1)
- **პრიორიტეტი**: Conversion (პირდაპირ გაყიდვაზე/საიტზე გადასვლა)
- **მეორადი**: Brand Awareness (ცნობადობა)

### ფასდაკლების პროგრამები
- პერმანენტული ფასდაკლების აქციები პროდუქციაზე
- ყოველდღიური ფასდაკლებები აფთიაქში

### მომავლისთვის (Phase 2+)
- [ ] ლოიალობის პროგრამა
- [ ] სეზონური აქციები
- [ ] სადაზღვევო პარტნიორობა

---

## Next Steps

1. `/planNext` - მიიღეთ შემდეგი ამოცანის რეკომენდაცია
2. `/planUpdate T1.1 start` - დაიწყეთ პირველი ამოცანა
3. Review and adjust task estimates as needed

---

*Generated from interview specifications on 2026-03-23*
