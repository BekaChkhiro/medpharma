# Cloudflare R2 Setup Guide - ქართული ინსტრუქცია

## 📋 შესავალი

ეს არის ნაბიჯ-ნაბიჯ სახელმძღვანელო Cloudflare R2 bucket-ის კონფიგურაციისთვის MedPharma Plus პროექტში.

### რატომ Cloudflare R2?

✅ **უფასო Egress** - გადმოწერები უფასოა (შეუზღუდავი!)
✅ **სწრაფი CDN** - ჩაშენებული global CDN უფასოდ
✅ **იაფი** - 3x უფრო იაფია AWS S3-ზე
✅ **საქართველოსთვის** - სწრაფი რეაქცია ევროპიდან
✅ **S3 თავსებადი** - მუშაობს ყველა S3 ბიბლიოთეკასთან

## 🎯 საჭირო რესურსები

- ✅ Cloudflare ანგარიში (უფასო)
- ✅ ვალიდური payment method (card) Cloudflare-ზე
- ⏱️ დრო: ~10 წუთი

---

## ნაბიჯი 1: Cloudflare Account Setup

### 1.1 ანგარიშის შექმნა

თუ არ გაქვთ Cloudflare account:

1. გადადით: https://dash.cloudflare.com/sign-up
2. დარეგისტრირდით email-ით
3. დაადასტურეთ email
4. შედით dashboard-ში

### 1.2 Payment Method-ის დამატება

R2-ს სჭირდება card მიბმული (თუმცა უფასო plan არსებობს):

1. **Account** → **Billing**
2. **Add Payment Method**
3. შეიყვანეთ card details
4. Save

**მნიშვნელოვანი:** R2-ს აქვს **10GB/თვე უფასო storage** და **უფასო egress**. ფასი იწყება მხოლოდ 10GB-ის შემდეგ!

---

## ნაბიჯი 2: R2 Bucket-ის შექმნა

### 2.1 R2 გვერდზე გადასვლა

1. Cloudflare Dashboard → მარცხენა მენიუ → **R2**
2. თუ პირველად იყენებთ, დააჭირეთ **Get Started** ან **Enable R2**
3. წაიკითხეთ terms და დაეთანხმეთ

### 2.2 Bucket-ის შექმნა

1. დააჭირეთ **Create Bucket**

2. **Bucket Configuration:**
   ```
   Bucket name: medpharma-uploads
   Location: EEUR (Eastern Europe) - რეკომენდებული საქართველოსთვის

   Storage Class: Standard
   ```

3. დააჭირეთ **Create Bucket**

### 2.3 Development Bucket-ის შექმნა (ოფციონალური)

production-ისგან გამოსაყოფად:

```
Bucket name: medpharma-uploads-dev
Location: EEUR (Eastern Europe)
```

---

## ნაბიჯი 3: Public Access-ის კონფიგურაცია

### 3.1 R2.dev Subdomain (უფასო, რეკომენდებული development-ისთვის)

1. გახსენით თქვენი bucket: **medpharma-uploads**
2. **Settings** → **Public Access**
3. დააჭირეთ **Allow Access**
4. **R2.dev subdomain** → დააჭირეთ **Enable**
5. დააკოპირეთ URL (მაგ: `https://pub-a1b2c3d4.r2.dev`)

**ეს URL გამოიყენება `.env.local`-ში როგორც `S3_PUBLIC_URL`**

### 3.2 Custom Domain (რეკომენდებული production-ისთვის)

თუ გსურთ საკუთარი domain გამოყენება (მაგ: `uploads.medpharma.ge`):

**პირობები:**
- Domain უნდა მართოს Cloudflare-მ (nameservers)
- ან domain უნდა იყოს Cloudflare-ში (როგორც CNAME)

**Setup:**

1. Bucket → **Settings** → **Custom Domains**
2. დააჭირეთ **Connect Domain**
3. შეიყვანეთ subdomain: `uploads.medpharma.ge`
4. დააჭირეთ **Connect**
5. Cloudflare ავტომატურად შექმნის CNAME record
6. ✅ SSL certificate ავტომატურად გენერირდება (უფასო)

**გამოყენება:**
```env
S3_PUBLIC_URL="https://uploads.medpharma.ge"
```

---

## ნაბიჯი 4: API Token-ის შექმნა

### 4.1 Token-ის გენერაცია

1. **R2** → **Manage R2 API Tokens**
2. დააჭირეთ **Create API Token**

3. **Token Configuration:**
   ```
   Token name: medpharma-uploads-token

   Permissions:
   ✅ Object Read & Write

   TTL: Never expires (ან არჩევით 1 year)

   Bucket: medpharma-uploads (specific bucket)
   ```

4. დააჭირეთ **Create API Token**

### 4.2 Credentials-ის კოპირება

**მნიშვნელოვანი:** ეს ინფორმაცია მხოლოდ ერთხელ გამოჩნდება!

დააკოპირეთ:
- ✅ **Access Key ID** (მაგ: `a1b2c3d4e5f6g7h8i9j0`)
- ✅ **Secret Access Key** (მაგ: `abcdefghijklmnop1234567890qrstuvwxyz`)
- ✅ **Endpoint URL** (მაგ: `https://a1b2c3d4e5f6.r2.cloudflarestorage.com`)

**შეინახეთ ეს ინფორმაცია უსაფრთხო ადგილას!**

---

## ნაბიჯი 5: Environment Variables-ის კონფიგურაცია

### 5.1 .env.local-ის შექმნა

თუ არ გაქვთ `.env.local` ფაილი:

```bash
cd /path/to/clinic-shop
cp .env.example .env.local
```

### 5.2 R2 Credentials-ის შევსება

გახსენით `.env.local` და შეავსეთ ეს ველები:

```env
# ==============================================================================
# CLOUDFLARE R2 STORAGE
# ==============================================================================

# R2 Endpoint (დააკოპირეთ API Token გვერდიდან)
S3_ENDPOINT="https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com"

# Region (გამოიყენეთ "auto" R2-სთვის)
S3_REGION="auto"

# Bucket name (როგორც შექმენით)
S3_BUCKET="medpharma-uploads"

# API Credentials (დააკოპირეთ API Token-დან)
S3_ACCESS_KEY="your_access_key_id_here"
S3_SECRET_KEY="your_secret_access_key_here"

# Public URL (R2.dev subdomain ან custom domain)
S3_PUBLIC_URL="https://pub-abc123xyz.r2.dev"
```

### 5.3 მაგალითი კონფიგურაცია

**Development:**
```env
S3_ENDPOINT="https://1a2b3c4d5e6f7g8h.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET="medpharma-uploads-dev"
S3_ACCESS_KEY="a1b2c3d4e5f6g7h8i9j0"
S3_SECRET_KEY="abcdefghijklmnop1234567890"
S3_PUBLIC_URL="https://pub-1234abcd.r2.dev"
```

**Production:**
```env
S3_ENDPOINT="https://1a2b3c4d5e6f7g8h.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET="medpharma-uploads"
S3_ACCESS_KEY="z9y8x7w6v5u4t3s2r1q0"
S3_SECRET_KEY="zyxwvutsrqponmlkjihgfedcba"
S3_PUBLIC_URL="https://uploads.medpharma.ge"
```

---

## ნაბიჯი 6: CORS-ის კონფიგურაცია

CORS საჭიროა თუ მომავალში გსურთ browser-დან პირდაპირ upload.

### 6.1 CORS Policy-ის დამატება

1. გახსენით bucket: **medpharma-uploads**
2. **Settings** → **CORS Policy**
3. დააჭირეთ **Edit CORS Policy**

### 6.2 CORS Configuration

ჩასვით ეს JSON:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://medpharma.ge",
      "https://www.medpharma.ge"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

**განმარტება:**
- `AllowedOrigins` - საიდან შეიძლება requests
- `AllowedMethods` - რა ოპერაციები დაშვებულია
- `AllowedHeaders` - ყველა header დაშვებულია
- `MaxAgeSeconds` - preflight cache (1 საათი)

4. დააჭირეთ **Save**

---

## ნაბიჯი 7: ტესტირება

### 7.1 სერვერის გაშვება

```bash
cd /path/to/clinic-shop
pnpm dev
```

### 7.2 კონფიგურაციის შემოწმება

```bash
curl http://localhost:3000/api/upload \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "configured": true,
    "maxFileSize": 10485760,
    "maxFileSizeMB": 10,
    "allowedMimeTypes": ["image/jpeg", "image/png", "image/webp", "image/gif"]
  }
}
```

თუ `"configured": false` - შეამოწმეთ `.env.local` ფაილი!

### 7.3 Upload-ის ტესტი

**Option A: Admin Panel-დან (GUI)**

1. გადადით: http://localhost:3000/admin/login
2. შედით admin account-ით
3. Products → Add Product → Upload Image
4. აირჩიეთ სურათი და ატვირთეთ

**Option B: cURL-ით (CLI)**

```bash
# ჯერ შედით admin-ად და მიიღეთ session cookie
# შემდეგ:

curl -X POST http://localhost:3000/api/upload \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@/path/to/test-image.jpg" \
  -F "folder=test"
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "url": "https://pub-abc123.r2.dev/test/test-image-1234567890-abc.jpg",
        "key": "test/test-image-1234567890-abc.jpg",
        "size": 245678,
        "mimeType": "image/jpeg",
        "width": 1200,
        "height": 800
      }
    ]
  }
}
```

### 7.4 R2 Dashboard-ში შემოწმება

1. გადადით R2 → **medpharma-uploads**
2. **Objects** → უნდა ნახოთ `test/` ფოლდერი
3. გახსენით და ნახეთ ატვირთული სურათი

---

## 🔐 უსაფრთხოება

### არასოდეს გააკეთოთ:

❌ არ ატვირთოთ `.env.local` git-ში
❌ არ გაუზიაროთ API secrets პირდაპირ
❌ არ გამოიყენოთ production credentials development-ში

### რეკომენდაციები:

✅ გამოიყენეთ სხვადასხვა buckets dev/prod-ისთვის
✅ გამოიყენეთ environment-specific API tokens
✅ რეგულარულად შეცვალეთ API tokens
✅ დაამატეთ `.env.local` to `.gitignore` (უკვე დამატებულია)

### .gitignore შემოწმება:

```bash
cat .gitignore | grep .env.local
```

თუ არ არის:
```bash
echo ".env.local" >> .gitignore
```

---

## 💰 Pricing & Limits

### უფასო Tier (R2 Free Plan)

✅ **10 GB** storage
✅ **1 million** Class A operations/თვე (uploads, lists)
✅ **10 million** Class B operations/თვე (downloads, reads)
✅ **უფასო egress** (შეუზღუდავი გადმოწერები!)

### რა ხდება 10GB-ის შემდეგ?

**Storage:** $0.015/GB/თვე
**Class A ops:** $4.50 per million
**Class B ops:** $0.36 per million
**Egress:** $0.00 (ყოველთვის უფასო!)

### რეალისტური მაგალითი:

თუ გაქვთ:
- 5,000 პროდუქტის სურათი
- საშუალო ზომა: 500 KB თითო
- სულ: 2.5 GB storage
- 50,000 downloads/თვე

**ღირებულება:**
- Storage: 0GB paid (free tier-ში ხვდება) = **$0.00**
- Downloads: 50K B-class ops = **$0.00** (free tier-ში ხვდება)
- Egress: 25GB download = **$0.00** (ყოველთვის უფასო!)
- **Total: $0.00/თვე** 🎉

### AWS S3 იგივე სცენარისთვის:

- Storage: 2.5GB × $0.023 = $0.06
- Downloads: 50K × $0.0004 = $0.02
- **Egress: 25GB × $0.09 = $2.25** ⚠️
- **Total: $2.33/თვე**

**R2 დაზოგავს: $27.96/წელი**

---

## 🚀 Production Deployment

### Railway Deployment

თქვენი პროექტი deploy-ისას Railway-ზე:

1. **Railway Dashboard** → Project → **Variables**

2. დაამატეთ R2 credentials:
   ```
   S3_ENDPOINT=https://YOUR_ACCOUNT.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_BUCKET=medpharma-uploads
   S3_ACCESS_KEY=production_key
   S3_SECRET_KEY=production_secret
   S3_PUBLIC_URL=https://uploads.medpharma.ge
   ```

3. Redeploy application

### Custom Domain for Production

1. დაამატეთ DNS Record:
   ```
   Type: CNAME
   Name: uploads
   Target: medpharma-uploads.ACCOUNT_ID.r2.cloudflarestorage.com
   Proxy: Yes (Proxied through Cloudflare)
   ```

2. R2 Bucket → Custom Domains → Connect `uploads.medpharma.ge`

3. SSL Certificate ავტომატურად გენერირდება ✅

---

## 🔧 Troubleshooting

### Problem: "S3 storage is not configured"

**მიზეზი:** Environment variables არ არის სწორად დაყენებული

**გადაწყვეტა:**
```bash
# შეამოწმეთ .env.local
cat .env.local | grep S3_

# დარწმუნდით რომ ყველა ველი შევსებულია
# restart dev server
pnpm dev
```

### Problem: Upload fails with 403 Forbidden

**მიზეზი:** API Token-ს არ აქვს permissions

**გადაწყვეტა:**
1. R2 → Manage API Tokens
2. შეამოწმეთ token permissions: **Object Read & Write** ✅
3. თუ არა, შექმენით ახალი token სწორი permissions-ით

### Problem: Image URL 404 Not Found

**მიზეზი:** Bucket არ არის public

**გადაწყვეტა:**
1. R2 Bucket → Settings → Public Access
2. Allow Access ✅
3. R2.dev subdomain → Enable ✅
4. დაამატეთ URL `.env.local`-ში `S3_PUBLIC_URL`-ში

### Problem: CORS error in browser

**მიზეზი:** CORS policy არ არის კონფიგურირებული

**გადაწყვეტა:**
1. Bucket → Settings → CORS Policy
2. დაამატეთ თქვენი domain `AllowedOrigins`-ში
3. Save

### Problem: Slow uploads

**შემოწმება:**
```bash
# test upload speed
time curl -X POST http://localhost:3000/api/upload \
  -F "file=@large-image.jpg"
```

**გადაწყვეტა:**
- R2 location: გამოიყენეთ EEUR (Eastern Europe)
- Image optimization: გამორთეთ development-ში თუ ძალიან ნელია
- Network: შეამოწმეთ internet connection

---

## 📚 დამატებითი რესურსები

**Cloudflare R2 Docs:**
- Official Docs: https://developers.cloudflare.com/r2/
- Pricing: https://developers.cloudflare.com/r2/pricing/
- API Reference: https://developers.cloudflare.com/r2/api/

**ჩვენი Documentation:**
- Upload Service Guide: `UPLOAD_SERVICE.md`
- Environment Setup: `.env.example`
- Technical Spec: `TECHNICAL_SPEC.md`

---

## ✅ Checklist

გამოიყენეთ ეს checklist setup-ის დასადასტურებლად:

- [ ] Cloudflare account შექმნილი
- [ ] Payment method დამატებული
- [ ] R2 bucket შექმნილი (`medpharma-uploads`)
- [ ] Public access enabled
- [ ] R2.dev subdomain enabled (ან custom domain)
- [ ] API Token შექმნილი (Read & Write)
- [ ] `.env.local` ფაილი შექმნილი
- [ ] S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, S3_PUBLIC_URL შევსებული
- [ ] CORS policy დაყენებული
- [ ] Dev server გაშვებული (`pnpm dev`)
- [ ] Upload API tested და მუშაობს
- [ ] სურათი R2 bucket-ში ატვირთულია
- [ ] სურათის public URL მუშაობს browser-ში

---

## 🎉 გილოცავთ!

თქვენი Cloudflare R2 storage მზად არის! ახლა შეგიძლიათ:

1. ✅ ატვირთოთ პროდუქტების სურათები
2. ✅ ატვირთოთ banner-ები
3. ✅ გამოიყენოთ უფასო global CDN
4. ✅ დაზოგოთ ფული egress-ზე

**შემდეგი ნაბიჯები:**
- T2.3: Multi-image upload for products
- T5.9: Admin banners CRUD

დახმარება გჭირდებათ? შეამოწმეთ troubleshooting სექცია ან დაგვიკავშირდით!

---

**Last Updated:** 2026-03-11
**Version:** 1.0.0
**Status:** ✅ Production Ready
