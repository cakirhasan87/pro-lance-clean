# Pro-Lance Projesi Kurulum Rehberi

## Gereksinimler
- Python 3.8 veya üzeri
- pip (Python paket yöneticisi)
- Git (opsiyonel)

## Kurulum Adımları

### 1. Projeyi İndirin
```bash
# Git ile (önerilen)
git clone https://github.com/kullaniciadi/proje-adi.git
cd proje-adi

# Veya dosyaları manuel olarak kopyalayın
```

### 2. Python Sanal Ortam Oluşturun
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Gerekli Paketleri Yükleyin
```bash
pip install -r requirements.txt
```

### 4. Veritabanını Kurun
```bash
# SQLite veritabanları zaten mevcut
# Eğer yoksa:
python create_projects_table.py
```

### 5. Uygulamayı Çalıştırın
```bash
python app.py
```

### 6. Tarayıcıda Açın
```
http://localhost:5000
```

## Docker ile Kurulum

### 1. Docker Kurulumu
Docker Desktop'ı [docker.com](https://docker.com) adresinden indirin ve kurun.

### 2. Projeyi Çalıştırın
```bash
docker-compose up --build
```

## Sorun Giderme

### Port 5000 Kullanımda
```bash
# Farklı port kullanın
python app.py --port 8000
```

### Paket Kurulum Hataları
```bash
# pip'i güncelleyin
pip install --upgrade pip

# Sanal ortamı yeniden oluşturun
deactivate
rm -rf venv
python -m venv venv
source venv/bin/activate  # veya venv\Scripts\activate
pip install -r requirements.txt
```

## Proje Yapısı
```
proje-adi/
├── app.py              # Ana Flask uygulaması
├── requirements.txt    # Python bağımlılıkları
├── config.py          # Konfigürasyon dosyası
├── projects.db        # SQLite veritabanı
├── users.db           # Kullanıcı veritabanı
├── admin/             # Admin paneli
├── templates/         # HTML şablonları
├── static/            # CSS, JS, resimler
└── blog-posts/        # Blog yazıları
```

## Admin Paneli
- URL: `http://localhost:5000/admin`
- Kullanıcı adı: `admin`
- Şifre: `prolance2024` 