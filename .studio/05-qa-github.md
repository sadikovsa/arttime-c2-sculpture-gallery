# S2 — Скульптурная галерея — GitHub release QA

Оглавление: 1. Вердикт/версия; 2. Проверки; 3. Ограничения.

## 1. Вердикт и версия

**PASS WITH NOTES. BLOCKER0, MAJOR0, открытых MINOR0.** Дата2026-10-12. Готовность локального пакета к уже разрешённой публикации; live URL пока planned. QA не менял source и не выполнял commit/deploy.

Approved checkpoint: 51d0fd1. Проверенный dist working-tree digest: `90342a647fba0f8090aed245a78d0e60353364508a5e215c527a8bb1e4679fbc`.
Алгоритм и общая evidence-карта — `../../qa/release-qa.md`; root привяжет следующий release SHA к этому digest в manifest.

## 2. Проверки scoped контракта

| Проверка | Результат / доказательство |
|---|---|
| Adaptive/network/runtime | PASS: root browser-report.json, fresh320/360/390/768/1280/1440/1920 + noJS390/reduced390; JS/HTTP errors0, hero/footer overflow0. |
| Catalog/search/native motion | PASS: root flow-report.json — catalog16, art2, empty/clear recovery; настоящие wheel forward/reverse states, pause оставляет native scroll. |
| Request/export/channel | PASS: invalid state, product→request, editable TXT equals edited draft; Instagram handoff и storage0. Submit preventsDefault source-reviewed; отдельный POST-network audit не проведён. |
| Share/entry/recovery | PASS: root sharing-report.json — correct ?product=id#catalog entry, invalid ID safe, Escape/focus/URL cleanup. Собственный390: denied clipboard даёт полное selected input, очищает stale q/category, next product resets fallback/status. |
| PracticalFAQ | PASS: собственный rapid3 clicks35ms, native noJS, reduced instant. |
| A11y/fonts | Root axe violations0 desktop; собственные font loads и отдельные focus checks. Не исчерпывающая accessibility certification. |
| SEO | Static/local validation PASS, planned Pages prefix и noindex,follow; внешний deployed URL будет проверять root. |

После MAJOR stale-srcset correction собственный currentSrc audit390/1440: Картины/Часы category previews, Dogeni/высокая хрустальная ваза, gallery0→1 — selected original decoded, srcset отсутствует. Финальный sharing-mobile.png реально открыт: Dogeni показывает правильные часы. Root повторил полную девятирежимную matrix после исправления: PASS. Loaded Golos Text400–900; reduced FAQ animations0.

Наблюдение глазами — реально открытые `../../qa/arttime-c2-sculpture-gallery/` кадры: desktop-hero.png, mobile-hero.png, request-edited.png, final sharing-mobile.png. Прочие screenshots не объявляются визуально проверенными этим QA.

Lab Lighthouse: Mobile88/LCP3.85s, Desktop99/0.87s, CLS0. Значения лабораторные, не field CWV. A11y100/BP100/SEO66; SEO66 связан с intentional noindex. TBT0 не является INP. Последний Lighthouse normal-mode выполнен SEO отдельно до scoped reduced/dynamic image fixes; normal hero/font geometry сохранены.

История исправленных MINOR/MAJOR и superseded evidence находится в combined report. На финальной версии не осталось подтверждённых blocker/major/minor defects. Source changes после этих scoped checks требуют новой проверки соответствующего состояния.

## 3. НЕ ПРОВЕРЕНО и почему

Safari, Firefox, реальные телефоны и screen readers, field INP/CWV/FPS, настоящее browser zoom, полный tab-order/a11y-tree и gradient pixel contrast — НЕ ПРОВЕРЕНО доступными инструментами/отдельным исчерпывающим аудитом. Live Pages prefix/assets/canonical/deeplink ещё не проверены: публикация принадлежит root. Отправка сообщений Instagram/звонки не выполнялись; форма готовит local editable текст.

STATUS: QA_PASS_WITH_NOTES
