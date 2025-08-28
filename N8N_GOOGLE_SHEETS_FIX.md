# n8n Google Sheets Mapping Sorunu Çözümü

## 🔍 Sorun
Contact form'dan gelen veriler n8n'e ulaşıyor ama Google Sheets'e sadece `created at` alanı kaydediliyor. Diğer alanlar (`name`, `email`, `phone`, `subject`, `message`) boş kalıyor.

## 🛠️ Çözüm Adımları

### 1. n8n Dashboard'a Giriş
- n8n dashboard'unuza giriş yapın
- Contact form workflow'unu açın

### 2. Webhook Node'unu Kontrol Edin
- Webhook node'una tıklayın
- **"Test step"** butonuna basın
- Gelen veriyi kontrol edin
- Veri şu formatta olmalı:
```json
{
  "name": "Test User",
  "email": "test@example.com", 
  "phone": "5551234567",
  "subject": "Test Subject",
  "message": "Test message",
  "timestamp": "2025-01-27T10:00:00.000Z",
  "source": "pro-lance-website"
}
```

### 3. Google Sheets Node'unu Kontrol Edin
- Google Sheets node'una tıklayın
- **"Operation"** alanında **"Append"** seçili olmalı
- **"Sheet"** alanında doğru sheet seçili olmalı

### 4. Data Mapping'i Düzeltin
**En önemli kısım bu!**

Google Sheets node'unda **"Columns"** bölümünde şu mapping'i yapın:

| Google Sheets Column | n8n Expression |
|---------------------|----------------|
| `name` | `{{ $json.name }}` |
| `email` | `{{ $json.email }}` |
| `phone` | `{{ $json.phone }}` |
| `subject` | `{{ $json.subject }}` |
| `message` | `{{ $json.message }}` |
| `created at` | `{{ $json.timestamp }}` |
| `Channel` | `{{ $json.source }}` |

### 5. Alternatif Mapping (Eğer yukarıdaki çalışmazsa)
Bazen veri farklı formatta gelir. Bu durumda şu mapping'i deneyin:

| Google Sheets Column | n8n Expression |
|---------------------|----------------|
| `name` | `{{ $json.body.name }}` |
| `email` | `{{ $json.body.email }}` |
| `phone` | `{{ $json.body.phone }}` |
| `subject` | `{{ $json.body.subject }}` |
| `message` | `{{ $json.body.message }}` |
| `created at` | `{{ $json.body.timestamp }}` |
| `Channel` | `{{ $json.body.source }}` |

### 6. Test Edin
1. Workflow'u **"Save"** edin
2. **"Test step"** butonuna basın
3. Google Sheets'i kontrol edin

## 🔧 Debug Adımları

### 1. Webhook Test
```bash
curl -X POST "https://pro-lance.app.n8n.cloud/form/c8bcf487-8382-46f3-af6b-744d5f74dd90" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=Test&email=test@test.com&phone=5551234567&subject=Test&message=Test message&timestamp=2025-01-27T10:00:00Z&source=test"
```

### 2. n8n Test Sayfası
```
http://localhost:8000/test-n8n-mapping.html
```

### 3. Console Logları
Tarayıcıda Developer Tools > Console'da şu logları kontrol edin:
```
Form data being sent:
name: Test User
email: test@example.com
...

n8n data being sent:
name=Test%20User&email=test%40example.com&...
```

## 🚨 Yaygın Hatalar

### 1. Yanlış Column Names
Google Sheets'teki column isimleri tam olarak eşleşmeli:
- `name` (küçük harf)
- `email` (küçük harf)
- `phone` (küçük harf)
- `subject` (küçük harf)
- `message` (küçük harf)
- `created at` (boşluklu)
- `Channel` (büyük C)

### 2. Yanlış Expression
Expression'lar doğru olmalı:
- ✅ `{{ $json.name }}`
- ❌ `{{ $json.Name }}`
- ❌ `{{ name }}`

### 3. Workflow Not Saved
Değişiklikleri kaydetmeyi unutmayın!

## 📞 Yardım
Eğer sorun devam ederse:
1. n8n workflow'unuzun screenshot'ını paylaşın
2. Webhook test sonucunu paylaşın
3. Google Sheets column isimlerini paylaşın
