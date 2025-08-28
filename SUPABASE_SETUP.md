# Supabase Kurulum Rehberi

## 🚀 Adım 1: Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) sitesine gidin
2. Yeni proje oluşturun
3. Proje adı: `pro-lance-contact`
4. Database password belirleyin
5. Region seçin (en yakın bölge)

## 🔧 Adım 2: Veritabanı Tablosu Oluşturma

1. Supabase Dashboard'da **SQL Editor**'a gidin
2. `supabase-setup.sql` dosyasındaki SQL kodunu kopyalayın
3. SQL Editor'da çalıştırın

## 🔑 Adım 3: API Anahtarlarını Alma

1. **Settings** > **API** bölümüne gidin
2. **Project URL**'yi kopyalayın
3. **anon public** key'i kopyalayın

## ⚙️ Adım 4: Konfigürasyon

`supabase-config.js` dosyasını düzenleyin:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co', // Project URL'nizi buraya yapıştırın
    anonKey: 'your-anon-key-here', // Anon key'inizi buraya yapıştırın
    tableName: 'contact_submissions'
};
```

## 🧪 Adım 5: Test Etme

1. Formu doldurun ve gönderin
2. Browser console'da logları kontrol edin
3. Supabase Dashboard'da **Table Editor** > **contact_submissions** tablosunu kontrol edin

## 📊 Veri Yapısı

Tablo şu alanları içerir:

- `id`: Otomatik UUID
- `name`: Ad Soyad
- `email`: E-posta
- `phone`: Telefon
- `subject`: Konu
- `message`: Mesaj
- `attachment_name`: Dosya adı (opsiyonel)
- `attachment_size`: Dosya boyutu (opsiyonel)
- `source`: Kaynak (pro-lance-website)
- `status`: Durum (new, processed, completed)
- `created_at`: Oluşturulma tarihi
- `updated_at`: Güncellenme tarihi

## 🔒 Güvenlik

- RLS (Row Level Security) aktif
- Anonim kullanıcılar sadece veri ekleyebilir
- Admin kullanıcılar tüm işlemleri yapabilir

## 🚨 Sorun Giderme

### Form gönderilmiyor
- Console'da hata mesajlarını kontrol edin
- Supabase URL ve key'in doğru olduğundan emin olun

### Veri kaydedilmiyor
- RLS politikalarını kontrol edin
- Tablo yapısını doğrulayın

### CORS hatası
- Supabase'de CORS ayarlarını kontrol edin
- Domain'inizin izinli olduğundan emin olun

## 📈 Monitoring

Supabase Dashboard'da şunları takip edebilirsiniz:
- **Database** > **Logs**: SQL sorguları
- **Analytics** > **API**: API kullanımı
- **Table Editor**: Veri görüntüleme ve düzenleme
