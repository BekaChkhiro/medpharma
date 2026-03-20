# Cloudflare R2 - სწრაფი დაწყება (5 წუთში)

## 🚀 მოკლე ინსტრუქცია

თუ გსურთ სწრაფად დაწყება, მიჰყევით ამ ნაბიჯებს:

### 1️⃣ Cloudflare R2 Bucket (3 წუთი)

```
1. https://dash.cloudflare.com → R2
2. Create Bucket
   - Name: medpharma-uploads
   - Location: EEUR
3. Settings → Public Access → Allow Access
4. Settings → R2.dev subdomain → Enable
   ✅ დააკოპირეთ URL: https://pub-xxxxx.r2.dev
```

### 2️⃣ API Token (1 წუთი)

```
1. R2 → Manage R2 API Tokens
2. Create API Token
   - Permissions: Object Read & Write
   - Bucket: medpharma-uploads
3. დააკოპირეთ:
   ✅ Access Key ID
   ✅ Secret Access Key
   ✅ Endpoint URL
```

### 3️⃣ Environment Setup (1 წუთი)

```bash
# პროექტის ფოლდერში
cd /path/to/clinic-shop

# კოპირება template-დან
cp .env.local.r2-template .env.local

# ან კოპირება example-დან
# cp .env.example .env.local
```

**გახსენით `.env.local` და შეავსეთ:**

```env
# ჩასვით თქვენი values
S3_ENDPOINT="https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET="medpharma-uploads"
S3_ACCESS_KEY="your_access_key"
S3_SECRET_KEY="your_secret_key"
S3_PUBLIC_URL="https://pub-xxxxx.r2.dev"
```

### 4️⃣ ტესტი

```bash
# სერვერის გაშვება
pnpm dev

# ბრაუზერში
http://localhost:3000/admin
```

## ✅ Done!

ახლა შეგიძლიათ ატვირთოთ სურათები! 🎉

---

## 📚 დეტალური ინსტრუქცია

სრული setup guide (ყველა ნაბიჯი დეტალურად):
👉 **R2_SETUP.md**

---

## ⚡ კარგი რჩევები

### Development vs Production

**Development:**
```env
S3_BUCKET="medpharma-uploads-dev"
S3_PUBLIC_URL="https://pub-dev123.r2.dev"
```

**Production:**
```env
S3_BUCKET="medpharma-uploads"
S3_PUBLIC_URL="https://uploads.medpharma.ge"
```

### Custom Domain (Production-ისთვის)

```
R2 Bucket → Settings → Custom Domains
დაამატეთ: uploads.medpharma.ge

შემდეგ .env.local-ში:
S3_PUBLIC_URL="https://uploads.medpharma.ge"
```

SSL certificate ავტომატურად მიიღებთ! ✅

---

## 🔥 რატომ R2?

| | AWS S3 | Cloudflare R2 |
|---|---|---|
| Storage | $0.023/GB | $0.015/GB |
| Downloads | $0.09/GB ⚠️ | **უფასო** ✅ |
| CDN | ცალკე (ფასიანი) | **ჩაშენებული** ✅ |

**10GB სურათებით + 100GB downloads/თვე:**
- AWS S3: ~$9.20/თვე
- R2: **$0.00/თვე** (free tier)

დაზოგვა: **$110/წელი!** 💰

---

## 🆘 პრობლემები?

### "S3 storage is not configured"
```bash
# შეამოწმეთ
cat .env.local | grep S3_

# restart server
pnpm dev
```

### "403 Forbidden"
- R2 Token permissions: Object Read & Write ✅

### "404 Not Found"
- Bucket → Public Access → Allow ✅
- R2.dev subdomain → Enable ✅

---

## 📞 დახმარება

- **სრული Guide:** R2_SETUP.md
- **Upload Docs:** UPLOAD_SERVICE.md
- **Technical Spec:** TECHNICAL_SPEC.md

---

**Ready to upload!** 🚀
