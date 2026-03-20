# 📝 Cloudflare R2 - Cheat Sheet

## ⚡ 30-Second Setup

```bash
./scripts/setup-env.sh
nano .env.local  # შეავსეთ R2 credentials
pnpm dev
```

---

## 🔑 Environment Variables (R2)

```env
S3_ENDPOINT="https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET="medpharma-uploads"
S3_ACCESS_KEY="your_r2_access_key"
S3_SECRET_KEY="your_r2_secret_key"
S3_PUBLIC_URL="https://pub-xxxxx.r2.dev"
```

**მიიღეთ აქ:**
- Endpoint & Credentials: R2 → Manage API Tokens
- Public URL: Bucket → Settings → R2.dev subdomain

---

## 🚀 API Quick Reference

### Upload Image

```typescript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', 'products');

const res = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const { data } = await res.json();
console.log(data.files[0].url);
```

### Delete Image

```typescript
await fetch('/api/upload', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'products/image.jpg' }),
});
```

### Get Config

```typescript
const res = await fetch('/api/upload');
const { data } = await res.json();
console.log(data.configured); // true/false
```

---

## 📁 File Limits

| Limit | Value |
|-------|-------|
| Max Size | 10 MB |
| Formats | JPEG, PNG, WebP, GIF |
| Max Width | 2000px |
| Max Height | 2000px |
| Quality | 85% |

---

## 🔧 Common Commands

```bash
# Check config
cat .env.local | grep S3_

# Setup env
./scripts/setup-env.sh

# Start dev
pnpm dev

# Test upload
curl -X POST http://localhost:3000/api/upload \
  -H "Cookie: session=XXX" \
  -F "file=@image.jpg"
```

---

## 🐛 Quick Fixes

**"Not configured"**
```bash
cat .env.local | grep S3_
# verify all S3_* filled
```

**403 Forbidden**
- R2 Token: Object Read & Write ✅

**404 Not Found**
- Bucket → Public Access → Allow ✅
- R2.dev subdomain → Enable ✅

**Upload slow**
- Set `optimize: false` in dev
- Check internet connection

---

## 📖 Full Docs

- Quick Start: `cat R2_QUICK_START.md`
- Full Guide: `cat R2_SETUP.md`
- API Docs: `cat UPLOAD_SERVICE.md`
- All Files: `cat 📁_R2_FILES_INDEX.md`

---

## 💰 Pricing

**Free Tier:**
- 10 GB storage
- Unlimited downloads ✅
- 1M writes/month
- 10M reads/month

**თქვენი პროექტი:** ~$0/თვე
**AWS S3 იგივე:** ~$22/თვე

**დაზოგვა:** $264/წელი 🎉

---

**Last Updated:** 2026-03-11
