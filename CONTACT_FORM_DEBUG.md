# Contact Form Debug Guide

## Sorun
Contact sayfasındaki form alanları doldurulduğunda sadece tarih kaydı atıyor, n8n ile veriler gelmiyor.

## Yapılan Düzeltmeler

### 1. Supabase Konfigürasyonu Düzeltildi
- `supabase-config.js` dosyasında gerçek URL ve API key eklendi
- URL: `https://drxstcmoroaupedsynhq.supabase.co`
- API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. n8n Veri Gönderimi İyileştirildi
- Form verilerini URL-encoded format ile gönderme
- Debug logları eklendi
- Response handling iyileştirildi

### 3. Test Sayfaları Oluşturuldu
- `test-contact.html`: Basit contact form testi
- `debug-n8n.html`: n8n'e farklı formatlarda veri gönderme testi

## Test Etme

### 1. Debug Sayfasını Açın
```bash
# Proje dizininde HTTP server başlatın
python3 -m http.server 8000

# Tarayıcıda açın
http://localhost:8000/debug-n8n.html
```

### 2. Test Sonuçlarını Kontrol Edin
- Her test butonuna tıklayın
- Console'da logları kontrol edin
- Response'ları inceleyin

### 3. Gerçek Contact Formu Test Edin
```bash
http://localhost:8000/contact.html
```

## Debug Logları

Contact form gönderildiğinde console'da şu logları göreceksiniz:

```
Form data being sent:
name: Test User
email: test@example.com
phone: 5551234567
subject: Test Subject
message: Test message
timestamp: 2025-01-27T10:00:00.000Z
source: pro-lance-website

n8n data being sent:
name=Test%20User&email=test%40example.com&phone=5551234567&subject=Test%20Subject&message=Test%20message&timestamp=2025-01-27T10%3A00%3A00.000Z&source=pro-lance-website

Sending to n8n workflow...
n8n URL: https://pro-lance.app.n8n.cloud/form/c8bcf487-8382-46f3-af6b-744d5f74dd90
n8n response status: 200
n8n response: {"status":200}
```

## Olası Sorunlar ve Çözümler

### 1. CORS Hatası
- n8n workflow'unun CORS ayarlarını kontrol edin
- Gerekirse n8n'de CORS headers ekleyin

### 2. Form Verileri Eksik
- Form field'larının name attribute'larını kontrol edin
- n8n workflow'unun beklediği field isimlerini kontrol edin

### 3. n8n Workflow Hatası
- n8n dashboard'unda workflow'u kontrol edin
- Error logs'ları inceleyin

## n8n Workflow Kontrolü

1. n8n dashboard'una giriş yapın
2. Contact form workflow'unu açın
3. Webhook node'unu kontrol edin
4. Data mapping'i kontrol edin
5. Error handling'i kontrol edin

## Supabase Kontrolü

1. Supabase dashboard'una giriş yapın
2. `contact_submissions` tablosunu kontrol edin
3. RLS (Row Level Security) ayarlarını kontrol edin
4. API permissions'ları kontrol edin

## Sonraki Adımlar

1. Debug sayfasından hangi formatın çalıştığını belirleyin
2. Contact form'u çalışan format ile güncelleyin
3. n8n workflow'unu test edin
4. Supabase kayıtlarını kontrol edin

