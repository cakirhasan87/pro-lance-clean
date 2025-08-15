# Proje Yönetimi Araçları

## 1. GitHub Issues Template

### Bug Report Template
```markdown
## Bug Açıklaması
Kısa ve net bir açıklama

## Adımlar
1. '...' sayfasına git
2. '....' butonuna tıkla
3. '....' hatası görünüyor

## Beklenen Davranış
Ne olması gerekiyordu

## Ekran Görüntüleri
Varsa ekran görüntüleri ekleyin

## Ortam Bilgileri
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Version: [version]

## Ek Bilgiler
Başka eklemek istediğiniz bilgiler
```

### Feature Request Template
```markdown
## Özellik Açıklaması
Yeni özelliğin açıklaması

## Problem
Bu özellik hangi problemi çözüyor

## Çözüm
Önerilen çözüm

## Alternatifler
Düşündüğünüz alternatif çözümler

## Ek Bilgiler
Ekran görüntüleri, mockup'lar vb.
```

## 2. Trello Board Yapısı

### Kanban Board
```
📋 Backlog
├── Yeni özellikler
├── Bug'lar
└── İyileştirmeler

🔄 In Progress
├── [Dev] Kullanıcı girişi
├── [Design] Admin panel
└── [Test] Form validasyonu

👀 Review
├── Code review bekleyen
└── Design review bekleyen

✅ Done
├── Tamamlanan görevler
└── Deploy edilen özellikler
```

### Kart Etiketleri
- 🐛 Bug
- ✨ Feature
- 🔧 Improvement
- 📝 Documentation
- 🚀 Deployment
- 🧪 Testing

## 3. Slack/Discord Kanalları

### Önerilen Kanallar
```
#general - Genel konuşmalar
#development - Geliştirme tartışmaları
#bugs - Hata bildirimleri
#deployment - Deploy durumları
#random - Sosyal konuşmalar
```

### Bot Entegrasyonları
- GitHub bot - Commit bildirimleri
- Trello bot - Kart güncellemeleri
- Deployment bot - Deploy durumları

## 4. Notion Workspace

### Sayfa Yapısı
```
📚 Proje Dokümantasyonu
├── 📋 Proje Genel Bakış
├── 🎯 Hedefler ve Roadmap
├── 👥 Takım Bilgileri
└── 📊 Metrikler

💻 Teknik Dokümantasyon
├── 🏗️ Mimari
├── 🔌 API Dokümantasyonu
├── 🗄️ Veritabanı Şeması
└── 🚀 Deployment Rehberi

📝 Geliştirme Süreçleri
├── 🔄 Git Workflow
├── 🧪 Test Stratejisi
├── 📦 Release Süreci
└── 🐛 Bug Tracking

📊 Proje Yönetimi
├── 📅 Sprint Planlaması
├── ⏱️ Zaman Takibi
├── 💰 Bütçe Takibi
└── 📈 Performans Metrikleri
```

## 5. Zaman Takibi

### Toggl/Clockify Kullanımı
```
Proje: Pro-Lance
├── Frontend Geliştirme
├── Backend Geliştirme
├── Database Yönetimi
├── Testing
├── Documentation
└── Deployment
```

### Haftalık Raporlar
- Her Cuma haftalık rapor
- Sprint başına planlama
- Sprint sonuna retrospektif

## 6. Code Review Süreci

### Pull Request Checklist
- [ ] Kod standartlarına uygun
- [ ] Testler yazıldı
- [ ] Dokümantasyon güncellendi
- [ ] Performance testleri yapıldı
- [ ] Security review yapıldı

### Review Kuralları
1. En az 1 onay gerekli
2. Conflict varsa çözülmeli
3. CI/CD testleri geçmeli
4. Code coverage %80+ olmalı

## 7. Sprint Planlaması

### 2 Haftalık Sprint
```
Sprint 1 (Hafta 1-2)
├── Kullanıcı girişi sistemi
├── Admin panel temel yapısı
└── Veritabanı şeması

Sprint 2 (Hafta 3-4)
├── Proje yönetimi modülü
├── Dosya yükleme sistemi
└── Email bildirimleri

Sprint 3 (Hafta 5-6)
├── Chat sistemi
├── Bildirim sistemi
└── Performance optimizasyonu
```

## 8. Risk Yönetimi

### Risk Matrisi
```
Düşük Etki - Düşük Olasılık: İzle
Düşük Etki - Yüksek Olasılık: Azalt
Yüksek Etki - Düşük Olasılık: Transfer
Yüksek Etki - Yüksek Olasılık: Kaçın
```

### Backup Stratejisi
- Günlük veritabanı yedekleme
- Haftalık kod yedekleme
- Aylık tam sistem yedekleme 