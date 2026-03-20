# 🏥 MedPharma Plus - Cloudflare R2 Configuration

> **სისტემა სრულად მომზადებულია Cloudflare R2 bucket-ისთვის!**

## 🎯 რა არის მზად?

✅ **Upload Service** - სრული S3-compatible upload სერვისი
✅ **R2 Integration** - optimized Cloudflare R2-სთვის
✅ **Image Optimization** - Sharp-ით (resize, compress)
✅ **Security** - Admin authentication, file validation
✅ **Documentation** - სრული ქართული ინსტრუქციები

## 📁 ფაილები რომლებიც დაგჭირდებათ

### 🚀 Setup დოკუმენტაცია

```
R2_README.md          - მთავარი overview (დაიწყეთ აქედან)
R2_QUICK_START.md     - სწრაფი setup (5 წუთი) ⭐
R2_SETUP.md           - დეტალური guide (ქართული) 📖
UPLOAD_SERVICE.md     - Technical API docs
```

### ⚙️ Configuration ფაილები

```
.env.example             - Example ყველა env vars-ით
.env.local.r2-template   - R2-specific template
scripts/setup-env.sh     - ავტომატური setup script
```

## 🚀 სწრაფი დაწყება (3 ნაბიჯი)

### 1. Environment Setup

```bash
# Option A: ავტომატური (რეკომენდებული)
./scripts/setup-env.sh

# Option B: Manual
cp .env.local.r2-template .env.local
```

### 2. R2 Credentials

იხილეთ: **R2_QUICK_START.md** (5 წუთი)

ან სრული guide: **R2_SETUP.md** (20 წუთი)

### 3. ტესტირება

```bash
pnpm dev
# http://localhost:3000/admin
```

## 📖 რა არის რა?

### Setup Scripts

**`scripts/setup-env.sh`** - ავტომატური setup
- ✅ ქმნის `.env.local` ფაილს
- ✅ გენერირებს secure `NEXTAUTH_SECRET`
- ✅ ამზადებს R2 configuration template-ს

### Documentation Files

**`R2_README.md`** - Main navigation guide
- რომელი ფაილი რისთვისაა
- სწრაფი links
- Setup checklist

**`R2_QUICK_START.md`** - 5-minute setup guide
- მოკლე ნაბიჯები
- copy-paste ready
- ძირითადი configuration

**`R2_SETUP.md`** - Complete Georgian guide
- ნაბიჯ-ნაბიჯ ინსტრუქციები
- screenshots აღწერები
- troubleshooting
- CORS, custom domains
- pricing მაგალითები
- security best practices

**`UPLOAD_SERVICE.md`** - Technical documentation
- API reference
- Code examples
- Frontend integration
- Testing guide

### Template Files

**`.env.local.r2-template`** - Ready-to-use template
- R2-specific configuration
- კომენტარები ქართულად
- მაგალითები
- checklist

**`.env.example`** - General template
- ყველა environment variable
- Multiple provider options
- detailed comments

## 🎓 როგორ გამოვიყენო?

### თუ პირველად აყენებთ:

```
1. წაიკითხეთ: R2_README.md (ეს ფაილი)
2. გაუშვით: ./scripts/setup-env.sh
3. მიჰყევით: R2_QUICK_START.md
4. შეავსეთ: .env.local (R2 credentials)
5. გაუშვით: pnpm dev
```

### თუ გსურთ სრული ინფორმაცია:

```
1. წაიკითხეთ: R2_SETUP.md (დეტალური guide)
2. Setup: Production + Custom Domain
3. Configure: CORS, Security
4. Learn: Pricing, Best Practices
```

### თუ ავითარებთ Features:

```
1. იხილეთ: UPLOAD_SERVICE.md (API docs)
2. Code examples
3. Integration guide
4. Testing instructions
```

## 📋 Setup Checklist

პირველად setup-ისას გაიარეთ ეს სია:

### Cloudflare R2
- [ ] Cloudflare account შექმნილი
- [ ] R2 bucket created (medpharma-uploads)
- [ ] Public access enabled
- [ ] R2.dev subdomain enabled
- [ ] API Token created
- [ ] Credentials დაკოპირებული

### Local Setup
- [ ] `./scripts/setup-env.sh` გაშვებული
- [ ] `.env.local` შექმნილი
- [ ] R2 credentials შევსებული
- [ ] `pnpm dev` მუშაობს

### Testing
- [ ] Upload API responds
- [ ] Test image ატვირთულია
- [ ] Image ჩანს R2 bucket-ში
- [ ] URL მუშაობს browser-ში

## 🔗 სასარგებლო Links

**Documentation:**
- 📖 [R2 Quick Start](R2_QUICK_START.md) - დაიწყეთ აქედან!
- 📖 [R2 Setup Guide](R2_SETUP.md) - სრული guide
- 📖 [Upload Service](UPLOAD_SERVICE.md) - API docs

**Cloudflare:**
- 🌐 [Cloudflare Dashboard](https://dash.cloudflare.com)
- 📚 [R2 Documentation](https://developers.cloudflare.com/r2/)
- 💰 [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)

## 💡 რატომ R2?

### Pricing Comparison

**10GB storage + 100GB downloads/month:**

| Provider | Cost |
|----------|------|
| AWS S3 + CloudFront | $9.20/mo |
| DigitalOcean Spaces | $5.00/mo |
| **Cloudflare R2** | **$0.00/mo** ✅ |

**დაზოგვა: $110/year!**

### Features

✅ **უფასო egress** - unlimited downloads
✅ **Built-in CDN** - global edge network
✅ **Fast in Georgia** - low latency from EU
✅ **S3 compatible** - works with existing code
✅ **Easy setup** - 5 minutes to production

## 🛠️ Technical Details

### Upload Service Features

- **File Validation**: Type, size, extension checking
- **Image Optimization**: Resize (max 2000x2000), compress (85% quality)
- **Security**: Admin-only access, secure tokens
- **Performance**: CDN caching, optimized delivery
- **Error Handling**: Detailed error messages

### Supported Formats

✅ JPEG / JPG
✅ PNG
✅ WebP
✅ GIF

Max size: **10 MB**

### API Endpoints

```
POST   /api/upload        - Upload images
DELETE /api/upload        - Delete images
GET    /api/upload        - Get config
```

Full API docs: [UPLOAD_SERVICE.md](UPLOAD_SERVICE.md)

## 🔒 Security

### Best Practices

✅ Never commit `.env.local` to git
✅ Use separate buckets for dev/prod
✅ Rotate API tokens regularly
✅ Use environment-specific credentials
✅ Enable CORS only for your domains

### Already Configured

✅ `.gitignore` includes `.env.local`
✅ Admin authentication required
✅ File type validation
✅ Size limits enforced
✅ Secure API tokens

## 🆘 დახმარება

### Setup Issues

**"S3 storage is not configured"**
```bash
# Check environment
cat .env.local | grep S3_

# Restart server
pnpm dev
```

**Upload fails**
- იხილეთ: [R2_SETUP.md](R2_SETUP.md) → Troubleshooting

### More Help

- 📖 Read: [R2_SETUP.md](R2_SETUP.md)
- 🔍 Check: Cloudflare R2 Dashboard
- 🐛 Debug: Browser console + Network tab

## 📊 Project Status

**Current Phase:** Phase 2 - Products + Catalog
**Task T2.4:** ✅ Complete (S3 Storage Service)
**Progress:** 15/68 tasks (22%)

**Next Tasks:**
- T2.3: Multi-image upload for products
- T5.9: Admin banners CRUD

## 🎉 მზადაა!

სისტემა სრულად მომზადებულია Cloudflare R2-სთვის!

**შემდეგი ნაბიჯი:**
```bash
# წაიკითხეთ სწრაფი guide
cat R2_QUICK_START.md

# ან დაუყოვნებლივ დაიწყეთ
./scripts/setup-env.sh
```

---

**Version:** 1.0.0
**Last Updated:** 2026-03-11
**Status:** ✅ Production Ready
