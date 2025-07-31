# KVKK-Compliant Cookie Consent System

Bu doküman, Pro-Lance web sitesi için 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca geliştirilmiş çerez onay sistemini açıklamaktadır.

## Genel Bakış

Bu çerez onay sistemi, Türkiye'deki KVKK gerekliliklerine tam uyumlu olarak tasarlanmıştır ve aşağıdaki özellikleri içerir:

- **Granüler Onay**: Kullanıcılar her çerez kategorisi için ayrı ayrı onay verebilir
- **Detaylı Bilgilendirme**: Her çerez türü hakkında açık ve anlaşılır bilgi
- **Kolay Onay Yönetimi**: Kullanıcılar istedikleri zaman ayarlarını değiştirebilir
- **Supabase Entegrasyonu**: Tüm onay verileri güvenli şekilde saklanır
- **Çok Dilli Destek**: Türkçe ve İngilizce dil desteği

## Çerez Kategorileri

### 1. Zorunlu Çerezler (Necessary Cookies)
- **Amaç**: Web sitesinin temel işlevleri için gerekli
- **KVKK Durumu**: Kişisel veri içermez, KVKK kapsamında değil
- **Devre Dışı Bırakılabilir**: Hayır (sitenin çalışması için gerekli)
- **Örnekler**: Oturum yönetimi, güvenlik çerezleri

### 2. İşlevsel Çerezler (Functional Cookies)
- **Amaç**: Kullanıcı tercihlerini hatırlamak ve gelişmiş işlevsellik
- **KVKK Durumu**: Kişisel veri içerebilir, açık rıza gerekli
- **Devre Dışı Bırakılabilir**: Evet
- **Örnekler**: Dil tercihi, tema seçimi, form verileri

### 3. Performans Çerezleri (Performance Cookies)
- **Amaç**: Site performansını analiz etmek ve kullanıcı deneyimini iyileştirmek
- **KVKK Durumu**: Anonim veri toplar, açık rıza gerekli
- **Devre Dışı Bırakılabilir**: Evet
- **Örnekler**: Google Analytics, site kullanım istatistikleri

### 4. Pazarlama Çerezleri (Marketing Cookies)
- **Amaç**: Kişiselleştirilmiş reklamlar ve içerik sunmak
- **KVKK Durumu**: Kişisel veri içerir, açık rıza gerekli
- **Devre Dışı Bırakılabilir**: Evet
- **Örnekler**: Reklam takibi, sosyal medya entegrasyonu

## KVKK Uyumluluğu

### Açık Rıza Gereklilikleri
- ✅ **Bilgilendirme**: Her çerez kategorisi için detaylı açıklama
- ✅ **Granüler Onay**: Kategori bazında ayrı onay seçenekleri
- ✅ **Kolay Reddetme**: "Tümünü Reddet" seçeneği
- ✅ **Kolay Değiştirme**: Ayarlar butonu ile sürekli erişim
- ✅ **Şeffaflık**: Gizlilik politikası linki

### KVKK Madde 5 Uyumluluğu
- ✅ **Açık Rıza**: Kullanıcıların özgür iradesiyle verdiği onay
- ✅ **Aydınlatma Yükümlülüğü**: Çerezler hakkında detaylı bilgi
- ✅ **Hukuki Sebep**: Açık rıza dışında hukuki sebepler de değerlendirilir

### KVKK Madde 11 Uyumluluğu
- ✅ **Bilgi Alma Hakkı**: Hangi çerezlerin kullanıldığı açıkça belirtilir
- ✅ **Erişim Hakkı**: Kullanıcılar ayarlarına her zaman erişebilir
- ✅ **Düzeltme Hakkı**: Ayarlar değiştirilebilir
- ✅ **Silme Hakkı**: Çerezler silinebilir

## Teknik Uygulama

### Dosya Yapısı
```
├── cookie-consent.js          # Türkçe çerez onay sistemi
├── en/cookie-consent.js       # İngilizce çerez onay sistemi
├── js/supabase-client.js      # Supabase bağlantısı
├── style.css                  # CSS stilleri
└── cookie-consent-setup.sql   # Veritabanı şeması
```

### Veritabanı Şeması
```sql
CREATE TABLE cookie_consent_logs (
    id UUID PRIMARY KEY,
    user_id VARCHAR,           -- Anonim kullanıcı kimliği
    session_id VARCHAR,        -- Oturum kimliği
    consent_status VARCHAR,    -- Onay durumu
    cookie_settings JSONB,     -- Detaylı çerez ayarları
    page_url VARCHAR,          -- Onay verilen sayfa
    user_agent TEXT,           -- Tarayıcı bilgisi
    language VARCHAR,          -- Dil tercihi
    created_at TIMESTAMP,      -- Oluşturulma tarihi
    updated_at TIMESTAMP       -- Güncellenme tarihi
);
```

### JavaScript Sınıf Yapısı
```javascript
class CookieConsent {
    constructor() {
        // Kullanıcı ve oturum kimlikleri
        this.userId = this.generateUserId();
        this.sessionId = this.generateSessionId();
    }
    
    // Ana metodlar
    async acceptAll()          // Tüm çerezleri kabul et
    async rejectAll()          // Tüm çerezleri reddet
    async saveSettings()       // Özel ayarları kaydet
    async saveToSupabase()     // Supabase'e kaydet
}
```

## Kullanıcı Arayüzü

### Ana Banner
- **Başlık**: "🍪 Çerez Kullanımı ve Kişisel Veriler"
- **Açıklama**: KVKK uyarınca çerez kullanımı hakkında bilgi
- **Çerez Türleri**: Her kategori için kısa açıklama
- **Butonlar**: 
  - "Detaylı Ayarlar" (granüler kontrol)
  - "Tümünü Kabul Et" (hızlı onay)
  - "Tümünü Reddet" (hızlı red)

### Ayarlar Modalı
- **Başlık**: "🍪 Çerez Ayarları"
- **Kategoriler**: Her çerez türü için toggle switch
- **Açıklamalar**: Her kategori için detaylı bilgi
- **Butonlar**: "Ayarları Kaydet" ve "İptal"

### Revisit Butonu
- **Konum**: Sol alt köşe
- **Görünüm**: "🍪 Çerez Ayarları"
- **İşlev**: Ayarlar modalını açar

## Veri Güvenliği

### Anonim Takip
- **User ID**: localStorage'da saklanan anonim kimlik
- **Session ID**: sessionStorage'da saklanan oturum kimliği
- **Kişisel Veri**: IP adresi veya diğer tanımlayıcı bilgiler saklanmaz

### Supabase Güvenliği
- **RLS Politikaları**: Sadece gerekli erişim izinleri
- **Anonim Erişim**: Sadece veri ekleme izni
- **Kimlik Doğrulama**: Görüntüleme için kimlik doğrulama gerekli

### Çerez Güvenliği
- **SameSite=Lax**: CSRF saldırılarına karşı koruma
- **HttpOnly**: JavaScript erişimi kısıtlanmış
- **Secure**: HTTPS üzerinden gönderim

## Analitik ve Raporlama

### Supabase Views
```sql
-- Günlük onay analizi
SELECT * FROM cookie_consent_analytics;

-- Detaylı çerez ayarları analizi
SELECT * FROM cookie_settings_analysis;
```

### Raporlanabilir Metrikler
- Günlük onay sayıları
- Kategori bazında onay oranları
- Dil bazında kullanım istatistikleri
- Kullanıcı davranış analizi

## Test ve Doğrulama

### Test Senaryoları
1. **İlk Ziyaret**: Banner görünür, onay verilmemiş
2. **Tümünü Kabul Et**: Tüm kategoriler aktif
3. **Tümünü Reddet**: Sadece zorunlu çerezler aktif
4. **Özel Ayarlar**: Kategori bazında seçim
5. **Ayarları Değiştirme**: Revisit butonu ile erişim
6. **Çoklu Dil**: Türkçe/İngilizce geçiş

### KVKK Uyumluluk Kontrolü
- ✅ Açık rıza alınıyor
- ✅ Bilgilendirme yapılıyor
- ✅ Kolay reddetme seçeneği var
- ✅ Ayarlar değiştirilebiliyor
- ✅ Gizlilik politikası erişilebilir
- ✅ Veri güvenliği sağlanıyor

## Bakım ve Güncelleme

### Düzenli Kontroller
- Aylık KVKK güncellemeleri kontrolü
- Çerez kategorilerinin güncellenmesi
- Supabase veri arşivleme
- Performans optimizasyonu

### Güncelleme Süreci
1. Yeni çerez kategorisi ekleme
2. Açıklama metinlerini güncelleme
3. Veritabanı şemasını güncelleme
4. Test ve doğrulama

## İletişim ve Destek

Bu çerez onay sistemi ile ilgili sorularınız için:
- **Teknik Destek**: Geliştirme ekibi
- **Hukuki Danışmanlık**: KVKK uzmanı
- **Kullanıcı Desteği**: Müşteri hizmetleri

---

**Son Güncelleme**: 2025-01-XX
**Versiyon**: 2.0 (KVKK Uyumlu)
**Durum**: Aktif ve Test Edilmiş 