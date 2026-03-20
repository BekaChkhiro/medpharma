# 🚀 დაიწყეთ აქედან - Cloudflare R2 Setup

## 👋 მოგესალმებით!

თქვენი სისტემა სრულად მომზადებულია Cloudflare R2 image storage-ისთვის!

---

## ⚡ სწრაფი დაწყება (3 ნაბიჯი)

### 1️⃣ ავტომატური Setup (30 წამი)

```bash
# გაუშვით setup script
./scripts/setup-env.sh
```

ეს script:
- ✅ შექმნის `.env.local` ფაილს
- ✅ დაგენერირებს secure `NEXTAUTH_SECRET`-ს
- ✅ მოამზადებს R2 configuration template-ს

### 2️⃣ R2 Credentials (5 წუთი)

გახსენით და წაიკითხეთ:
```bash
cat R2_QUICK_START.md
```

ან პირდაპირ:
1. https://dash.cloudflare.com → R2
2. Create Bucket → "medpharma-uploads"
3. Enable Public Access
4. Create API Token
5. Copy credentials to `.env.local`

### 3️⃣ ტესტი (1 წუთი)

```bash
pnpm dev
# http://localhost:3000/admin
```

Upload test image → ✅ მზადაა!

---

## 📚 დოკუმენტაცია

### პირველად იყენებთ?

```bash
# სწრაფი guide (5 წუთი)
cat R2_QUICK_START.md

# ან ავტომატური setup
./scripts/setup-env.sh
```

### გსურთ სრული ინფორმაცია?

```bash
# დეტალური guide (20 წუთი)
cat R2_SETUP.md

# ყველა ფაილის სია
cat 📁_R2_FILES_INDEX.md
```

### Developer Documentation

```bash
# API reference
cat UPLOAD_SERVICE.md

# Technical summary
cat CLOUDFLARE_R2_SUMMARY.md
```

---

## 📋 Checklist

მოამზადეთ ეს სანამ დაიწყებთ:

### გაქვთ:
- [ ] Cloudflare account
- [ ] Payment method (card) - R2-ს სჭირდება მიბმული
- [ ] 10 წუთი თავისუფალი დრო

### გააკეთეთ:
- [ ] `./scripts/setup-env.sh` გაშვებული
- [ ] R2 bucket შექმნილი
- [ ] API credentials მიღებული
- [ ] `.env.local` შევსებული
- [ ] `pnpm dev` გაშვებული
- [ ] Test upload-ი მუშაობს

---

## 🎯 რას ელოდოთ?

### უფასო Tier-ზე მიიღებთ:

✅ **10 GB** storage
✅ **უფასო** downloads (შეუზღუდავი!)
✅ **Built-in CDN** (global)
✅ **Fast** performance

### Pricing მაგალითი:

თქვენი პროექტი (5000 products, 100K visitors/month):
- **AWS S3:** ~$22/თვე
- **R2:** **$0/თვე** ✅

**დაზოგავთ:** $264/წელი!

---

## 🔗 სასარგებლო Links

**Setup:**
- 🚀 Quick Start: [R2_QUICK_START.md](R2_QUICK_START.md)
- 📖 Full Guide: [R2_SETUP.md](R2_SETUP.md)
- 📁 File Index: [📁_R2_FILES_INDEX.md](📁_R2_FILES_INDEX.md)

**Development:**
- 🔧 API Docs: [UPLOAD_SERVICE.md](UPLOAD_SERVICE.md)
- 📊 Summary: [CLOUDFLARE_R2_SUMMARY.md](CLOUDFLARE_R2_SUMMARY.md)

**Cloudflare:**
- 🌐 Dashboard: https://dash.cloudflare.com
- 📚 R2 Docs: https://developers.cloudflare.com/r2/

---

## 🆘 დახმარება

### პრობლემა?

**"S3 storage is not configured"**
```bash
# შეამოწმეთ
cat .env.local | grep S3_

# restart
pnpm dev
```

**Upload არ მუშაობს?**
- იხილეთ: [R2_SETUP.md](R2_SETUP.md) → Troubleshooting

### გსურთ კითხვა?

1. იხილეთ [R2_SETUP.md](R2_SETUP.md)
2. შეამოწმეთ R2 dashboard
3. წაიკითხეთ error logs

---

## 🎉 მზად ხართ!

**შემდეგი ნაბიჯი:**

```bash
# დაიწყეთ setup
./scripts/setup-env.sh

# წაიკითხეთ quick guide
cat R2_QUICK_START.md

# ან პირდაპირ R2 dashboard-ში
open https://dash.cloudflare.com
```

**კითხვა გაქვთ?** → [R2_SETUP.md](R2_SETUP.md)
**მზად ხართ deploy-ისთვის?** → [CLOUDFLARE_R2_SUMMARY.md](CLOUDFLARE_R2_SUMMARY.md)

---

**გილოცავთ! დაიწყეთ სურათების ატვირთვა! 📸**
