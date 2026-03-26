---
draft: false
title: Theming
description: OpenFlowKit içinde tasarım sistemleri kullanarak her diyagramı tek tek stillendirmeden tutarlı bir görsel dil kurun.
---

OpenFlowKit, tema yönetimini tek tek diyagram stilleri yerine tekrar kullanılabilir tasarım sistemleri üzerinden ele alır.

## OpenFlowKit içinde theming ne anlama gelir?

Theming ayrı bir render modu değildir. Diyagramların oturumlar ve ekipler arasında nasıl göründüğünü belirleyen tasarım sistemi katmanıdır.

Şu durumlarda kullanın:

- birden çok diyagramın tutarlı görünmesi gerektiğinde
- farklı hedef kitleler için markalı varyantlar oluşturmak istediğinizde
- her yeni akışta renk ve stil ayarlarını yeniden yapmak istemediğinizde
- stil tanımlarını ortamlar arasında taşımak gerektiğinde

## Önerilen kullanım şekli

Pratik akış şu şekildedir:

1. Kararlı bir varsayılan tasarım sistemi ile başlayın.
2. Marka veya kullanım bağlamı değiştiğinde onu çoğaltın.
3. Diyagramları tek tek yeniden biçimlendirmek yerine aktif tasarım sistemini kullanın.
4. Stil tanımını tarayıcı oturumu dışına taşımak gerektiğinde tema JSON'unu dışa aktarın.

## Nereden yönetilir?

Komut Merkezi üzerinden tasarım sistemi araçlarıyla şunları yapabilirsiniz:

- aktif tasarım sistemini değiştirme
- mevcut temaları çoğaltma ve düzenleme
- JSON içe aktarma
- aktif temayı dışa aktarma

## Sistemi küçük tutun

Fazla sayıda tema çoğu zaman esneklikten çok tutarsızlık üretir. Çoğu ekip için bir varsayılan sistem ve az sayıda varyant en sürdürülebilir yaklaşımdır.

## İlgili sayfalar

- [Design Systems & Branding](/tr/design-systems-branding/)
- [Command Center](/tr/command-center/)
- [Figma Design Import](/tr/figma-design-import/)
