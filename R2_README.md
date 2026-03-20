# 📦 Cloudflare R2 Image Storage - სრული დოკუმენტაცია

## 📚 ხელმისაწვდომი დოკუმენტაცია

პროექტში ხელმისაწვდომია სამი დოკუმენტი R2 setup-ისთვის:

### 1. R2_QUICK_START.md ⚡
**სწრაფი დაწყება 5 წუთში**
- მოკლე, კონკრეტული ნაბიჯები
- copy-paste friendly
- იდეალური თუ გსურთ სწრაფად დაწყება

👉 **დაიწყეთ აქედან თუ:** პირველად აყენებთ R2-ს

### 2. R2_SETUP.md 📖
**დეტალური Setup Guide (ქართული)**
- ნაბიჯ-ნაბიჯ ინსტრუქციები
- screenshots-ის აღწერები
- troubleshooting სექცია
- CORS, custom domains, security
- pricing მაგალითები

👉 **წაიკითხეთ თუ:** გსურთ სრული ინფორმაცია და best practices

### 3. UPLOAD_SERVICE.md 🔧
**Technical Documentation (ინგლისური)**
- Upload Service API reference
- Code examples
- Frontend integration
- Testing instructions
- Performance metrics

👉 **გამოიყენეთ თუ:** ავითარებთ features და integrations

---

## 🎯 რომელი გჭირდება?

```
┌─────────────────────────────────────────────────┐
│  მე მინდა...                                    │
├─────────────────────────────────────────────────┤
│  ✅ სწრაფად დავიწყო (5 წუთი)                    │
│     👉 R2_QUICK_START.md                        │
│                                                 │
│  ✅ ყველაფერი გავიგო დეტალურად                 │
│     👉 R2_SETUP.md                              │
│                                                 │
│  ✅ API-ს გამოვიყენო კოდში                       │
│     👉 UPLOAD_SERVICE.md                        │
│                                                 │
│  ✅ Environment variables template              │
│     👉 .env.local.r2-template                   │
│                                                 │
│  ✅ ნახო რა არის pre-configured                 │
│     👉 .env.example                             │
└─────────────────────────────────────────────────┘
```

---

## 🚀 რეკომენდებული თანმიმდევრობა

### პირველად Setup-ისას:

**1. სწრაფი გაცნობა** (5 წუთი)
```bash
# წაიკითხეთ
cat R2_QUICK_START.md

# შექმენით R2 bucket Cloudflare-ში
# დააკოპირეთ credentials
```

**2. Environment Setup** (2 წუთი)
```bash
# კოპირება template-დან
cp .env.local.r2-template .env.local

# შეავსეთ credentials
nano .env.local
```

**3. ტესტირება** (3 წუთი)
```bash
# გაუშვით
pnpm dev

# ატვირთეთ test image
# შეამოწმეთ R2 bucket-ში
```

**4. დეტალების შესწავლა** (20 წუთი)
```bash
# თუ გაქვთ დრო, წაიკითხეთ სრული guide
cat R2_SETUP.md

# შეისწავლეთ:
# - CORS configuration
# - Custom domains
# - Security best practices
# - Pricing details
```

### Production Deploy-ისას:

```bash
# წაიკითხეთ:
R2_SETUP.md → "Production Deployment" სექცია

# Setup:
1. Production bucket (medpharma-uploads)
2. Custom domain (uploads.medpharma.ge)
3. ცალკე API token production-ისთვის
4. Railway environment variables
```

---

## 📋 Setup Checklist

გამოიყენეთ ეს სია რომ დარწმუნდეთ ყველაფერი გაკეთებულია:

### Cloudflare R2
- [ ] Cloudflare account created
- [ ] Payment method added (card)
- [ ] R2 bucket created (medpharma-uploads)
- [ ] Public access enabled
- [ ] R2.dev subdomain enabled
- [ ] API Token created (Read & Write)
- [ ] CORS policy configured

### Local Environment
- [ ] `.env.local` created
- [ ] S3_ENDPOINT filled
- [ ] S3_REGION = "auto"
- [ ] S3_BUCKET matches R2 bucket name
- [ ] S3_ACCESS_KEY filled
- [ ] S3_SECRET_KEY filled
- [ ] S3_PUBLIC_URL filled (R2.dev URL)

### Testing
- [ ] `pnpm dev` runs successfully
- [ ] Upload API responds with config
- [ ] Test image uploads successfully
- [ ] Image visible in R2 bucket
- [ ] Image URL accessible in browser

### Production (when ready)
- [ ] Production bucket created
- [ ] Custom domain connected
- [ ] SSL certificate active
- [ ] Production API token created
- [ ] Railway env vars configured

---

## 🔑 მთავარი Concepts

### R2 Bucket
ფაილების საცავი Cloudflare-ის ინფრასტრუქტურაში. თქვენ შექმენით bucket-ს სახელით (მაგ: "medpharma-uploads") და ატვირთავთ ფაილებს მასში.

### Endpoint URL
R2 API-ს მისამართი. თითოეულ Cloudflare account-ს აქვს უნიკალური endpoint:
```
https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

### API Token
Authentication credentials R2 API-სთან სამუშაოდ. შეიცავს:
- Access Key ID (username-ის მსგავსი)
- Secret Access Key (password-ის მსგავსი)

### Public URL
მისამართი საიდანაც ხელმისაწვდომია ატვირთული ფაილები:
- R2.dev: `https://pub-xxxxx.r2.dev/products/image.jpg`
- Custom: `https://uploads.medpharma.ge/products/image.jpg`

---

## 💡 Best Practices

### Development
✅ გამოიყენეთ `-dev` suffix bucket-ებში
✅ გამოიყენეთ R2.dev URL (უფასო)
✅ Image optimization გამორთული (სწრაფი development)

### Production
✅ ცალკე bucket production-ისთვის
✅ Custom domain (uploads.medpharma.ge)
✅ ცალკე API tokens dev/prod-ისთვის
✅ Image optimization enabled
✅ რეგულარული backups

### Security
❌ არასოდეს commit .env.local git-ში
❌ არ გაუზიაროთ API secrets
❌ არ გამოიყენოთ production credentials development-ში
✅ გამოიყენეთ environment-specific tokens
✅ რეგულარულად rotate API tokens

---

## 🔗 External Links

**Cloudflare Dashboard:**
- Dashboard: https://dash.cloudflare.com
- R2 Overview: https://dash.cloudflare.com → R2
- API Tokens: R2 → Manage R2 API Tokens

**Documentation:**
- R2 Docs: https://developers.cloudflare.com/r2/
- Pricing: https://developers.cloudflare.com/r2/pricing/
- S3 API Compatibility: https://developers.cloudflare.com/r2/api/s3/

---

## 📊 Project Status

**Upload Service:** ✅ Complete (T2.4)
**R2 Integration:** ✅ Ready
**Documentation:** ✅ Complete

**Next Steps:**
- T2.3: Multi-image upload for products
- T5.9: Admin banners CRUD

---

## 🆘 მიიღეთ დახმარება

თუ რაიმე არ მუშაობს:

1. **შეამოწმეთ Troubleshooting:**
   - R2_SETUP.md → "Troubleshooting" section

2. **შეამოწმეთ Logs:**
   ```bash
   # Dev server logs
   pnpm dev

   # Browser console
   # Network tab → upload request
   ```

3. **ვალიდაცია:**
   ```bash
   # Environment check
   curl http://localhost:3000/api/upload

   # R2 dashboard
   # https://dash.cloudflare.com → R2 → bucket
   ```

---

## 📝 Version History

- **v1.0.0** (2026-03-11)
  - Initial R2 setup documentation
  - Quick start guide created
  - Template files added
  - Georgian instructions complete

---

**გილოცავთ! თქვენი R2 storage მზად არის! 🎉**

დაიწყეთ: `R2_QUICK_START.md`
