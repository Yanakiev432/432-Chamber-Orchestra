# 432 — решение за историческите адреси преди миграцията

**За одобрение от собственика; не е извършен production cutover.**

## 16 предложени HTTP 302 пренасочвания

| № | Исторически адрес | Предложено ново направление | Основание | Решение |
|---:|---|---|---|---|
| 1 | `/` | `/bg/` | root-language-landing | **НЕОДОБРЕНО** |
| 2 | `/bg/blog/author/admin/` | `/en/` | legacy-author-redirect-observed | **НЕОДОБРЕНО** |
| 3 | `/en/blog/author/admin/` | `/en/` | legacy-author-redirect-observed | **НЕОДОБРЕНО** |
| 4 | `/bg/events/категория/концерт/` | `/bg/концерти-и-турнета/` | legacy-event-category-to-curated | **НЕОДОБРЕНО** |
| 5 | `/en/events/категория/concert/` | `/en/concerts-and-tours/` | legacy-event-category-avoid-excluded-gallery | **НЕОДОБРЕНО** |
| 6 | `/en/my-account/lost-password/` | `/en/my-account/` | retired-auth-to-static-notice | **НЕОДОБРЕНО** |
| 7 | `/bg/product-category/аудио/page/1/` | `/bg/product-category/аудио/` | canonical-first-page | **НЕОДОБРЕНО** |
| 8 | `/bg/product-category/аудио/музика-за-струнен-квартет/page/1/` | `/bg/product-category/аудио/музика-за-струнен-квартет/` | canonical-first-page | **НЕОДОБРЕНО** |
| 9 | `/bg/product-tag/квартет-bg/page/1/` | `/bg/product-tag/квартет-bg/` | canonical-first-page | **НЕОДОБРЕНО** |
| 10 | `/bg/product-tag/струнен-квартет-bg/page/1/` | `/bg/product-tag/струнен-квартет-bg/` | canonical-first-page | **НЕОДОБРЕНО** |
| 11 | `/bg/shop/page/1/` | `/bg/shop/` | canonical-first-page | **НЕОДОБРЕНО** |
| 12 | `/en/product-category/audio/page/1/` | `/en/product-category/audio/` | canonical-first-page | **НЕОДОБРЕНО** |
| 13 | `/en/product-category/audio/string-quartet-music/page/1/` | `/en/product-category/audio/string-quartet-music/` | canonical-first-page | **НЕОДОБРЕНО** |
| 14 | `/en/product-tag/quartet/page/1/` | `/en/product-tag/quartet/` | canonical-first-page | **НЕОДОБРЕНО** |
| 15 | `/en/product-tag/string-quartet/page/1/` | `/en/product-tag/string-quartet/` | canonical-first-page | **НЕОДОБРЕНО** |
| 16 | `/en/shop/page/1/` | `/en/shop/` | canonical-first-page | **НЕОДОБРЕНО** |

**Бележка:** / → /bg/ вече присъства в проверената V4 конфигурация; останалите 15 правила са нови във V6. На този етап всички са HTTP 302, не 301. Превръщане в 301 или промяна на направление изисква отделно решение.

## 13 исторически адреса, предложени да останат непубликувани (404)

- `/en/blog/gmedia/concert-1-jpg/` — **неодобрено окончателно изключване**
- `/en/blog/gmedia/concert-12-jpg/` — **неодобрено окончателно изключване**
- `/en/blog/gmedia/concert-14-jpg/` — **неодобрено окончателно изключване**
- `/en/blog/gmedia/concert-15-jpg/` — **неодобрено окончателно изключване**
- `/en/blog/gmedia/concert-17-jpg/` — **неодобрено окончателно изключване**
- `/en/blog/gmedia/concert-18-jpg/` — **неодобрено окончателно изключване**
- `/en/blog/gmedia/concert-19-jpg/` — **неодобрено окончателно изключване**
- `/en/blog/gmedia/concert-2-jpg/` — **неодобрено окончателно изключване**
- `/en/blog/gmedia/concert-20-jpg/` — **неодобрено окончателно изключване**
- `/en/blog/gmedia/concert-21-jpg/` — **неодобрено окончателно изключване**
- `/en/blog/gmedia/concert-4-jpg/` — **неодобрено окончателно изключване**
- `/en/blog/gmedia/concert-6-jpg/` — **неодобрено окончателно изключване**
- `/en/blog/gmedia/concert-9-jpg/` — **неодобрено окончателно изключване**

Те са изключени Studio5 галерийни детайли. Няма автоматично пренасочване към медийни файлове и не се въвеждат нови публични страници за тях.

## Други отделни разрешения, които НЕ произтичат от горните решения

- Точният списък за преместване на реалните файлове в `public_html`, с поименно запазване на шестте други директории.
- Независимото резервно копие и PFX парола извън Lenovo.
- Правилата за старите купувачи, счетоводните документи и личните данни.
- Финалният архив след спирането на новите поръчки и отделното писмено разрешение за реалния cutover.

**Текущ статус:** Всички 16 пренасочвания и 13 изключвания са само предложения, не са приложени на продукционния сайт.
