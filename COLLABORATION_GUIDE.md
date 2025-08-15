# Çoklu Kullanıcı Geliştirme Rehberi

## Git ile Takım Çalışması

### 1. GitHub Repository Kurulumu

#### Ana Geliştirici (Siz):
```bash
# Mevcut projeyi GitHub'a yükleyin
git remote add origin https://github.com/kullaniciadi/proje-adi.git
git push -u origin main

# Branch oluşturun
git checkout -b development
git push -u origin development
```

#### Diğer Geliştiriciler:
```bash
# Projeyi klonlayın
git clone https://github.com/kullaniciadi/proje-adi.git
cd proje-adi

# Kendi branch'inizi oluşturun
git checkout -b feature/kullanici-adi
```

### 2. Çalışma Akışı

#### Her Geliştirici İçin:
```bash
# Güncel kodu alın
git pull origin main

# Kendi branch'inizde çalışın
git checkout feature/kullanici-adi

# Değişikliklerinizi commit edin
git add .
git commit -m "Açıklayıcı commit mesajı"

# Branch'inizi push edin
git push origin feature/kullanici-adi
```

#### Pull Request Süreci:
1. GitHub'da Pull Request oluşturun
2. Code review yapın
3. Ana branch'e merge edin

## 2. Ortak Veritabanı Yönetimi

### SQLite Yerine PostgreSQL/MySQL Kullanın

#### PostgreSQL Kurulumu:
```bash
# requirements.txt'ye ekleyin:
psycopg2-binary==2.9.9
```

#### Veritabanı Konfigürasyonu:
```python
# config.py
import os

class Config:
    # Geliştirme ortamı
    if os.environ.get('FLASK_ENV') == 'development':
        SQLALCHEMY_DATABASE_URI = 'sqlite:///projects.db'
    else:
        # Production ortamı - PostgreSQL
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
```

## 3. Ortak Dosya Paylaşımı

### Google Drive/OneDrive Kullanımı:
- Proje dosyalarını cloud storage'da paylaşın
- Herkes aynı klasörü senkronize etsin

### Notion/Confluence:
- Proje dokümantasyonu
- Görev takibi
- API dokümantasyonu

## 4. Ortak Geliştirme Ortamı

### Docker Compose ile Ortak Ortam:
```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - .:/app
    environment:
      - FLASK_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/prolance
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=prolance
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## 5. Görev Dağılımı ve İletişim

### Proje Yönetimi Araçları:
- **Trello**: Görev takibi
- **Slack/Discord**: İletişim
- **GitHub Issues**: Hata takibi
- **Notion**: Dokümantasyon

### Görev Dağılımı Örneği:
```
Frontend Geliştirici:
- HTML/CSS düzenlemeleri
- JavaScript fonksiyonları
- UI/UX iyileştirmeleri

Backend Geliştirici:
- Flask route'ları
- Veritabanı işlemleri
- API geliştirme

DevOps:
- Deployment
- Sunucu yönetimi
- CI/CD pipeline
```

## 6. Kod Standartları

### Python Kod Standartları:
```bash
# Black formatter
pip install black
black .

# Flake8 linter
pip install flake8
flake8 .

# Pre-commit hooks
pip install pre-commit
pre-commit install
```

### .pre-commit-config.yaml:
```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
```

## 7. Ortak Çalışma Kuralları

### Commit Mesajları:
```
feat: yeni özellik
fix: hata düzeltmesi
docs: dokümantasyon
style: kod formatı
refactor: kod yeniden düzenleme
test: test ekleme
chore: bakım işleri
```

### Branch İsimlendirme:
```
feature/kullanici-girisi
bugfix/admin-panel-hatasi
hotfix/kritik-hata
docs/readme-guncelleme
```

## 8. Deployment Stratejisi

### Geliştirme Ortamı:
- Herkes kendi local'inde çalışır
- Ortak test veritabanı kullanır

### Staging Ortamı:
- GitHub Actions ile otomatik deploy
- Test edilmiş kodlar buraya gelir

### Production Ortamı:
- Manuel deploy
- Sadece test edilmiş kodlar 