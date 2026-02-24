# 🗺️ OpenFlowKit Ürün Yol Haritası

Açık kaynaklı, beyaz etiketli diyagramlama için standartı oluşturuyoruz. Bu yol haritası **OpenFlowKit**'in geleceğine yönelik vizyonumuzu özetlemektedir.

> **Not**: Bu yaşayan bir belgedir. Öncelikler topluluk geri bildirimlerine göre değişebilir.

---

## 🚀 Ç3 2026: Yapay Zeka Genişlemesi (v1.2)
*Odak: Diyagram oluşturmayı daha akıllı, daha hızlı ve daha çok yönlü hale getirmek.*

### 🧠 Çok Modelli Yapay Zeka Desteği
Tek bir sağlayıcıyla sınırlı kalmayın. Tüm büyük LLM'ler için "Kendi Anahtarını Getir" modelini destekleyeceğiz:
- **Anthropic Claude 3.5 Sonnet**: Karmaşık sistem mimarisi diyagramları için optimize edilmiş.
- **OpenAI GPT-4o**: İş mantığı akışları için hızlı, muhakeme ağırlıklı üretim.
- **Yerel LLM'ler (Ollama)**: %100 çevrimdışı, hava boşluklu diyagram oluşturma için Llama 3 veya Mistral'ı yerel olarak çalıştırın.

### ⚡ Gerçek Zamanlı "Copilot" Modu
- **Akışlar için Otomatik Tamamlama**: Bir düğümü sürüklerken yapay zeka, mevcut grafik bağlamınıza dayanarak en mantıklı 3 sonraki adımı önerir.
- **Akıllı Yeniden Düzenleme**: Karmaşık düğümleri seçin ve yapay zekadan "Düzeni Optimize Et" veya "Alt Gruba Grupla" isteyin.

---

## 🤝 Ç4 2026: İş Birliği ve Ekipler (v2.0)
*Odak: Bireysel bir geliştirici aracını ekip gücü merkezine dönüştürmek.*

### 👥 Gerçek Zamanlı Çok Oyunculu
- **Canlı İmleçler**: Takım arkadaşlarınızın nereye baktığını görün.
- **Çakışmasız Düzenleme**: Sorunsuz iş birlikçi oturumlar için **Yjs** ve CRDT'lerle desteklenir.
- **Varlık**: "Bu akışta kim var?" göstergeleri.

### 💬 Bağlamsal Yorumlar
- Yorumları doğrudan düğümlere veya kenarlara sabitleyin.
- Diyagram içindeki görevlere takım üyelerini @etiketle.
- Uygulamayı tamamladıkça konuları çözüme kavuşturun.

### 💾 Bulut Kalıcılık Adaptörü
- PostgreSQL/Supabase'e akış kaydetmek için isteğe bağlı referans uygulaması.
- Yüzlerce diyagramı düzenlemek için "Proje" görünümü.

---

## 🛠️ 2027: Platform Dönemi (v3.0)
*Odak: Geliştirici ekosistemine derin entegrasyon.*

### 🔌 IDE Uzantıları
- **VS Code Uzantısı**: Premium GUI'mizle `.flow` veya `.mermaid` dosyalarını doğrudan VS Code içinde düzenleyin.
- **IntelliJ / JetBrains Eklentisi**: Java/Kotlin ekosistemi diyagramları için yerel destek.

### 🎨 Gelişmiş Tasarım Sistemi
- **Figma Senkronizasyonu**: İki yönlü senkronizasyon. Değişiklikleri Figma'dan OpenFlowKit'e ve tersine aktarın.
- **Özel React Düğümleri**: Geliştiricilerin bir düğüm içinde *herhangi bir* React bileşenini (Grafikler, Veri Tabloları, Videolar) oluşturmasına olanak tanıyan eklenti API'si.

### 📊 Veri Odaklı Diyagramlar
- **Canlı Metrikler**: Düğüm renklerini/boyutlarını gerçek zamanlı API verilerine bağlayın (örn. Sunucu Sağlığı görselleştirmesi).
- **SQL'den ERD'ye**: Veritabanınıza bağlanın ve Varlık İlişki Diyagramını otomatik olarak oluşturun.

---

## 💡 Topluluk İstek Listesi
Kullanıcı isteklerine göre incelediğimiz özellikler:
- [ ] **Sunum Modu**: Karmaşık akışların slayt slayt anlatımı.
- [ ] **Erişilebilirlik (A11y)**: Ekran okuyucu desteği ve klavye navigasyonu iyileştirmeleri.
- [ ] **Uluslararasılaştırma (i18n)**: Arayüzü 10'dan fazla dile çevirme.

---

*Mevcut Sürüm: v1.0.0-beta*  
*Son Güncelleme: Şubat 2026*
