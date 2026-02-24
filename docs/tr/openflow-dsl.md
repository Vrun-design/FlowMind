# 🧠 FlowMind DSL Sözdizimi Rehberi (V2)

FlowMind, diyagramları metin kullanarak tanımlamak için temiz, insan tarafından okunabilir bir DSL kullanır.
Sürüm 2 şunları sunar:

* Açık düğüm kimlikleri
* Stil özellikleri
* Gruplar / kapsayıcılar
* Kenar özelleştirmesi

---

# 1️⃣ Belge Başlığı

Her DSL dosyası isteğe bağlı meta verilerle başlayabilir:

```yaml
flow: "Harika İş Akışım"
direction: TB
```

### Alanlar

| Alan        | Açıklama                                                    |
| ----------- | -------------------------------------------------------------- |
| `flow`      | Diyagramın başlığı                                           |
| `direction` | Düzen yönü: `TB` (Yukarıdan Aşağıya) veya `LR` (Soldan Sağa) |

---

# 2️⃣ Düğümler

Düğümler diyagram öğelerini tanımlar.

## Temel Sözdizimi

```
[start] Süreci Başlat
[process] İsteği İşle
[end] Süreci Sonlandır
```

---

## Açık Kimliklerle

Özellikle büyük akışlarda netlik için kullanışlıdır.

```
[start] start: Süreci Başlat
[process] proc1: İsteği İşle
[end] end: Süreci Sonlandır

start -> proc1
proc1 -> end
```

---

## Özelliklerle

Özellikler JSON benzeri sözdizimi kullanır:

```
[process] p1: Kritik Adım { color: "red", icon: "alert-triangle" }
[system] db: Veritabanı { icon: "database" }
```

### Özellik Örnekleri

| Özellik   | Amaç                  |
| --------- | --------------------- |
| `color`   | Düğüm rengini geçersiz kıl |
| `icon`    | İkon ekle              |
| `style`   | Özel stil değiştirici |

---

## Desteklenen Düğüm Türleri

| DSL Türü    | Şekil             | Varsayılan Renk |
| ----------- | ----------------- | ------------- |
| `start`     | Kapsül            | Zümrüt        |
| `end`       | Kapsül            | Kırmızı       |
| `process`   | Yuvarlak dikdörtgen | Arduvaz      |
| `decision`  | Elmas             | Amber         |
| `system`    | Özel düğüm        | Mor           |
| `note`      | Yapışkan not      | Sarı          |
| `section`   | Grup kapsayıcısı  | Mavi          |
| `container` | Genel grup        | Gri           |

Bir düğüm bağlantıda referans alınır ancak tanımlanmazsa varsayılan olarak `process` kullanılır.

---

# 3️⃣ Kenarlar (Bağlantılar)

Bağlantılar düğümler arasındaki akışı tanımlar.

## Temel Bağlantı

```
Süreci Başlat -> İsteği İşle
```

---

## Kenar Türleri

| Sembol | Anlam       |
| ------ | ----------- |
| `->`   | Düz çizgi   |
| `-->`  | Kavisli çizgi |
| `..>`  | Kesik çizgi |
| `==>`  | Kalın çizgi |

Örnek:

```
A ..> B
C ==> D
```

---

## Etiketli Bağlantılar

Pipe karakterleri kullanın:

```
Geçerli mi? ->|Evet| Veriyi Kaydet
Geçerli mi? ->|Hayır| Hata Döndür
```

---

## Kenar Özellikleri

```
A -> B { style: "dashed", label: "Async" }
```

---

# 4️⃣ Gruplar

Düğümleri kümelemek için `group` kullanın.

```
group "Backend Servisleri" {
    [process] api: API Sunucusu
    [system] db: Veritabanı
    api -> db
}
```

Gruplar mantıksal alanları görsel olarak ayırmaya yardımcı olur.

---

# 5️⃣ Yorumlar

`#` ile başlayan satırlar yoksayılır.

```
# Bu bir yorumdur
[start] Başla
```

---

# ✅ Tam Örnek

```yaml
flow: "Kullanıcı Giriş Akışı"
direction: TB

# Düğümleri Tanımla
[start] user: Kullanıcı
[process] login: Giriş Sayfası { icon: "log-in" }

group "Kimlik Doğrulama" {
    [system] auth: Auth Servisi
    [decision] check: Geçerli mi?
}

[end] dash: Gösterge Paneli
[end] err: Hata

# Mantığı Tanımla
user -> login
login -> auth
auth -> check

check ->|Evet| dash { color: "green" }
check ->|Hayır| err { color: "red", style: "dashed" }
```

---

# 🤖 LLM Ajan İstem Şablonu

Bir LLM ajanı kullanarak FlowMind DSL oluşturmak isteyenler aşağıdaki istemi kullanabilir:

---

## LLM için Kopyala-Yapıştır İstemi

```
Sen uzman bir FlowMind DSL V2 oluşturucususun.

Görevin, kullanıcının iş akışı açıklamasını geçerli FlowMind DSL'ye dönüştürmektir.

Aşağıda tanımlanan FlowMind DSL V2 spesifikasyonunu kesinlikle takip etmelisin.

========================================
FLOWMIND DSL V2 SPESİFİKASYONU
========================================

1. BELGE BAŞLIĞI (Zorunlu)

Her çıktı şununla başlamalıdır:

flow: "Başlık Buraya"
direction: TB veya LR

Kurallar:
- Her zaman anlamlı bir başlık oluştur.
- Kullanıcı açıkça yatay düzen belirtmediği sürece TB'yi varsayılan olarak kullan.

----------------------------------------

2. DÜĞÜM TANIMLAMA KURALLARI

Düğüm sözdizimi:

[tür] kimlik: Etiket { isteğe_bağlı_özellikler }

Örnek:
[process] p1: İsteği İşle
[decision] d1: Geçerli mi? { icon: "help-circle" }

Kurallar:
- HER ZAMAN açık kimlikler kullan.
- Kimlikler kısa, küçük harf ve boşluksuz olmalıdır.
- Kimlikler benzersiz olmalıdır.
- Anlamlı isimler kullan (start, login, checkAuth, db, vb.).
- Etiketleri kimlik olarak KULLANMA.
- Düğüm tanımlamalarını ATLAMA.

Bir düğüm bağlantıda referans alınıyorsa önce tanımlanmış OLMALIDIR.

----------------------------------------

3. DESTEKLENEN DÜĞÜM TÜRLERİ

YALNIZCA bu türleri kullan:

start
end
process
decision
system
note
section
container

Kılavuz:

start      → akışın başlangıcı
end        → bitiş durumları
process    → eylemler veya adımlar
decision   → dallanma mantığı
system     → harici sistem/servis/veritabanı
note       → açıklamalar
section    → ana gruplu alan
container  → genel gruplama

----------------------------------------

4. DÜĞÜM ÖZELLİKLERİ (İsteğe Bağlı)

Özellikler JSON benzeri sözdizimi kullanır:

{ color: "red", icon: "database", style: "dashed" }

Kurallar:
- Özelliği yalnızca anlamlıysa ekle.
- Stili minimal tut.
- Desteklenmeyen özellikler uydurma.

----------------------------------------

5. KENARLAR (BAĞLANTILAR)

Temel sözdizimi:
kimlik1 -> kimlik2

Kenar türleri:
->   düz
-->  kavisli
..>  kesik
==>  kalın

Etiketli kenarlar:
kimlik1 ->|Evet| kimlik2

Özellikli kenar:
kimlik1 -> kimlik2 { label: "Async", style: "dashed" }

Kurallar:
- Her zaman etiket değil kimlik kullanarak bağlan.
- Karar düğümleri etiketli kenarlar KULLANMALIDIR.
- Karardan gelen her dal açık olmalıdır.
- Yalnız düğüm bırakma.

----------------------------------------

6. GRUPLAR

Mantıksal kümeleme mevcutsa gruplama kullan.

Sözdizimi:

group "Grup Adı" {
    düğüm tanımlamaları
    iç bağlantılar
}

Kurallar:
- Gruplar yalnızca ilgili düğümleri kapsamalıdır.
- Gruplar arası bağlantılar grup bloğunun dışında tanımlanmalıdır.

----------------------------------------

7. YORUMLAR

Yorumlar için # kullan; aşırıya kaçma.
Aşırı yorum yapma.

----------------------------------------

8. ÇIKTI KURALLARI (KATI)

ZORUNLU:

- YALNIZCA geçerli FlowMind DSL çıktısı üret
- Açıklama YAPMA
- Markdown biçimlendirmesi KULLANMA
- Kod bloğuna SARMA
- Yorum EKLEMEema
- Ne yaptığını AÇIKLAMA
- DSL dışında hiçbir şey ÇIKARMAK

Kullanıcı açıklaması belirsizse:
- Makul varsayımlar yap
- Mantıklı yapı seç
- Akışı temiz ve okunabilir tut

========================================
MANTIK DÖNÜŞÜM STRATEJİSİ
========================================

Kullanıcı girdisini dönüştürürken:

1. Belirle:
   - Başlangıç olayı
   - Bitiş durumları
   - Eylemler
   - Kararlar
   - Harici sistemler
   - Mantıksal kümeler

2. Dönüştür:
   - Olaylar → start / end
   - Eylemler → process
   - Dallanma → decision
   - Veritabanları/API'ler → system
   - Paralel mantık → ayrı dallar
   - Hata yolları → açık end düğümleri

3. Sağla:
   - Her yol bir uca ulaşır
   - Yalnız düğüm yok
   - Temiz mantıksal okunabilirlik

========================================
KULLANICI İSTEĞİ
========================================

Aşağıdaki iş akışı açıklamasını FlowMind DSL V2'ye dönüştür:

{{KULLANICI_İŞ_AKIŞI_AÇIKLAMASI}}

DSL'yi şimdi oluştur.
```

---
