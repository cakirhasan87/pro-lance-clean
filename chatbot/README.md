# Modern Chatbot

Modern, güvenli ve kullanıcı dostu bir mesajlaşma platformu. Flask ve Socket.IO kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- **Gerçek Zamanlı Mesajlaşma**: Socket.IO ile anlık iletişim
- **Kullanıcı Kimlik Doğrulama**: Güvenli giriş ve kayıt sistemi
- **Çoklu Sohbet Odası**: Birden fazla sohbet odası oluşturma
- **Dosya Paylaşımı**: Resim, PDF, doküman yükleme desteği
- **Emoji Desteği**: Zengin emoji kütüphanesi
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Modern UI/UX**: Bootstrap 5 ile modern arayüz
- **Güvenlik**: Şifreli kimlik doğrulama ve güvenli dosya yükleme

## 🛠️ Teknolojiler

- **Backend**: Flask, Flask-SQLAlchemy, Flask-Login
- **Real-time**: Socket.IO, Eventlet
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Veritabanı**: SQLite
- **Güvenlik**: bcrypt, Werkzeug

## 📋 Gereksinimler

- Python 3.8+
- pip (Python paket yöneticisi)

## 🚀 Kurulum

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd chatbot
```

2. **Sanal ortam oluşturun:**
```bash
python -m venv venv
```

3. **Sanal ortamı aktifleştirin:**
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. **Gerekli paketleri yükleyin:**
```bash
pip install -r requirements.txt
```

5. **Veritabanını oluşturun:**
```bash
python app.py
```

6. **Uygulamayı çalıştırın:**
```bash
python app.py
```

Uygulama `http://localhost:5000` adresinde çalışacaktır.

## 📁 Proje Yapısı

```
chatbot/
├── app.py                 # Ana Flask uygulaması
├── requirements.txt       # Python bağımlılıkları
├── README.md             # Proje dokümantasyonu
├── templates/            # HTML şablonları
│   ├── base.html         # Temel şablon
│   ├── index.html        # Ana sayfa
│   ├── login.html        # Giriş sayfası
│   ├── register.html     # Kayıt sayfası
│   └── chat.html         # Chat arayüzü
├── static/               # Statik dosyalar
│   └── style.css         # CSS stilleri
├── uploads/              # Yüklenen dosyalar
└── chatbot.db            # SQLite veritabanı
```

## 🔧 Konfigürasyon

### Ortam Değişkenleri

`.env` dosyası oluşturarak aşağıdaki değişkenleri ayarlayabilirsiniz:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
```

### Veritabanı

Varsayılan olarak SQLite kullanılır. Farklı bir veritabanı kullanmak için `app.py` dosyasındaki `SQLALCHEMY_DATABASE_URI` değişkenini güncelleyin.

## 🎯 Kullanım

### Kullanıcı Kaydı
1. Ana sayfada "Kayıt Ol" butonuna tıklayın
2. Kullanıcı adı, e-posta ve şifre girin
3. Kullanım şartlarını kabul edin
4. Kayıt işlemini tamamlayın

### Giriş Yapma
1. "Giriş Yap" butonuna tıklayın
2. Kullanıcı adı ve şifrenizi girin
3. Chat arayüzüne yönlendirileceksiniz

### Mesajlaşma
1. Sol panelden sohbet odası seçin
2. Mesajınızı yazın ve gönderin
3. Emoji eklemek için 😊 butonuna tıklayın
4. Dosya paylaşmak için 📎 butonunu kullanın

### Sohbet Odası Oluşturma
1. Sol paneldeki "+" butonuna tıklayın
2. Oda adını girin
3. Yeni oda oluşturulacak ve otomatik olarak katılacaksınız

## 🔒 Güvenlik

- Şifreler bcrypt ile hashlenir
- Dosya yükleme güvenliği (dosya türü kontrolü)
- SQL injection koruması
- XSS koruması
- CSRF koruması

## 🐛 Hata Ayıklama

### Yaygın Sorunlar

1. **Port 5000 kullanımda:**
   - `app.py` dosyasında port numarasını değiştirin
   - Veya mevcut uygulamayı durdurun

2. **Paket yükleme hatası:**
   - Python sürümünüzü kontrol edin (3.8+)
   - pip'i güncelleyin: `pip install --upgrade pip`

3. **Veritabanı hatası:**
   - `chatbot.db` dosyasını silin ve yeniden oluşturun

### Loglar

Uygulama çalışırken konsol loglarını takip edin. Hata mesajları burada görünecektir.

## 📱 Mobil Uyumluluk

Uygulama tamamen responsive tasarıma sahiptir:
- Mobil cihazlarda sidebar gizlenir
- Touch-friendly arayüz
- Mobil tarayıcı optimizasyonu

## 🔄 Güncellemeler

### v1.0.0
- İlk sürüm
- Temel mesajlaşma özellikleri
- Kullanıcı kimlik doğrulama
- Dosya paylaşımı
- Emoji desteği

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 📞 İletişim

Sorularınız için:
- GitHub Issues
- E-posta: [your-email@example.com]

## 🙏 Teşekkürler

- Flask topluluğu
- Socket.IO geliştiricileri
- Bootstrap ekibi
- Font Awesome

---

**Not**: Bu proje eğitim amaçlı geliştirilmiştir. Prodüksiyon ortamında kullanmadan önce güvenlik testlerini yapın. 