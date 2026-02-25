const a=`FlowMind, diyagramlarınızı sunumlarda, belgelerde veya diğer harici araçlarda kullanmanıza yardımcı olmak için geniş bir dışa aktarma seçenekleri yelpazesi sunar.

> [!TIP]
> Tüm dışa aktarma seçeneklerine araç çubuğunun sağ üst köşesindeki **"Dışa Aktar"** düğmesinden ulaşabilirsiniz.

## Görsel Dışa Aktarma

Slaytlar, belgeler veya Slack'te paylaşmak için idealdir.

### PNG (Taşınabilir Ağ Grafikleri)
Mevcut akışınızın yüksek çözünürlüklü, piksel tabanlı bir görselini dışa aktarır.
*   **En İyi Kullanım**: Slaytlar, Web, Genel Paylaşım.
*   **Ayarlar**: Ayarlarda etkinleştirilmişse varsayılan olarak şeffaflık içerir.

### JPEG (Ortak Fotoğrafçılık Uzmanları Grubu)
Sıkıştırılmış bir görsel dosyası dışa aktarır.
*   **En İyi Kullanım**: E-posta ekleri, dosya boyutunun önemli olduğu durumlar.
*   **Not**: Şeffaflığı desteklemez (arka plan beyaz olacaktır).

## Veri ve Kod Dışa Aktarma

FlowMind bir "Kod Olarak Diyagram" aracıdır; bu nedenle diyagram verilerinizi birinci sınıf vatandaş olarak ele alıyoruz.

### JSON (FlowMind Yerel Formatı)
Tüm düğüm konumlarını, stillerini ve verilerini içeren ham \`.json\` dosyasını indirir.
*   **En İyi Kullanım**: Yedekleme, Sürüm Kontrolü, Diğer FlowMind kullanıcılarıyla düzenlenebilir dosya paylaşımı.

### FlowMind DSL
Basitleştirilmiş Alan Spesifik Dil (DSL) temsilini panonuza kopyalar.
*   **En İyi Kullanım**: Diyagram mantığını kod tabanı yorumlarında saklamak veya yapay zeka aracılığıyla benzer akışlar oluşturmak.

### Mermaid.js
Mevcut diyagramınızı [Mermaid](https://mermaid.js.org/) sözdizimine dönüştürür ve panoya kopyalar.
*   **En İyi Kullanım**: GitHub \`README.md\` dosyalarına, Notion veya Obsidian'a diyagram gömme.
*   **Desteklenen**: Temel Akış Şemaları, Sekans Diyagramları.

### PlantUML
Diyagramınızın PlantUML temsilini kopyalar.
*   **En İyi Kullanım**: Kurumsal wikiler (Confluence) veya eski dokümantasyon sistemleri.

### Figma
Figma'nın yapıştırma formatıyla uyumlu bir vektör temsilini kopyalar.
*   **En İyi Kullanım**: Yüksek kaliteli parlatma için diyagramları tasarımcılara teslim etme.

> [!WARNING]
> Figma dışa aktarma deneyseldir. Karmaşık özel düğümler %100 mükemmel aktarılmayabilir.
`;export{a as default};
