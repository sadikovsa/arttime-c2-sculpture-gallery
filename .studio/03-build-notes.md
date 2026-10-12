# Art Time S2 — frontend build

## 1. Результат и scope

BUILD_READY. Реализована утверждённая «Скульптурная галерея». Запись только в `sites/arttime-c2-sculpture-gallery/dist`, `DESIGN.md` и этот документ. Сайты S1/S3, A/B, DecoFlowers, Git и глобальная студия не изменялись. Согласованное изображение и RGBA-hero фактически просмотрены.

Файлы: `dist/index.html`, `dist/assets/css/tokens.css`, `dist/assets/css/main.css`, `dist/assets/js/main.js`, `dist/assets/fonts/golostext.css`, `dist/assets/img/favicon.svg`. Существующие реальные фото и hero-sculpture responsive variants используются локально. Root подготовил официальный variable TTF в dist; frontend подтвердил `wght 400–900` fontTools и подключил настоящие 800 для hero.

## 2. Композиция и содержимое

Гигантский чёрный гротеск «Форма. Свет. Характер.»; нейтральная открытая сцена и хромированный объект с настоящей alpha; небольшой кобальтовый интерфейс. Чёрный индекс категорий с большим меняющимся фото. Полный исходный HTML-каталог 16 предметов, продуктовые панели, глава материалов, нерегулярные пять кейсов наполнения плюс отдельные две интерьерные идеи, три иллюстрированные услуги и четыре FAQ, локальная подготовка запроса и компактный футер.

Тексты/характеристики каталога перенесены из `02b-copy.json` без выдуманных производителей, материала или размеров. Наличие и цены по запросу. Галерея не заявляет авторство архитектуры/ремонта. Нет публичных DEMO/ИИ/source плашек, фальшивых каналов или отзывов.

## 3. Движение и доступность

Нативная sticky-сцена: разные start/middle/end, реверс, pause/resume без изменения scroll. Подробные формулы и состояния — в DESIGN.md. Движок vanilla rAF, не заявлен ScrollTrigger. Только transform/opacity, исключение — 270ms height у disclosures/menu. Categories last-action-wins, details реверсируют текущую высоту с generation guard. Reduced motion/noJS читаемые, без длинного scroll stage.

Native dialogs: product/viewer/request, Escape, close, focus restoration, inert фон и внутренний scroll. Счёт/категория/search URL, IME-safe search и empty/reset. Request текст редактируемый, copy/TXT текущего текста, ошибки clipboard честные. Нет automatic submit/backend, хранения контактов. Native fallback: 16 карточек + details + реальные прямые контакты + оригинальные полные фото.

## 4. Самопроверка

ПРОВЕРЕНО: `node --check main.js` без ошибок. HTML parser: 16 карточек, один h1, 65 asset references существуют, 14 hash-ссылок имеют цели, duplicate ids = 0. CSS не содержит underline или !important. TTF ось веса проверена fontTools. Концепт/alpha asset визуально открыты через view_image.

НЕ ПРОВЕРЕНО frontend: браузерный рендер/скриншоты, настоящее движение с scroll вперёд/назад, keyboard и focus в runtime, noJS/reduced runtime, overflow на breakpoint, hidden-image decode, console/404, показатели производительности. По делегированному scope это делает root; сервер/установка/публикация frontend не запускались. Статичные проверки не доказывают плавность или художественную приёмку.

## 5. Коррекция hero после визуального QA

Фактически просмотрен root desktop screenshot `work/arttime-c/qa/arttime-c2-sculpture-gallery/desktop-hero.png`: основание было ниже исходного viewport, подпись пересекала хром. Исправлен только hero CSS: desktop sticky-stage учитывает 100px header, sculpture height `min(96%,60vw)` и нижнее поле 12px; подпись перенесена вправо/выше с коротким leader. Вариант tablet ограничивает размер по ширине. Mobile и остальные разделы сохранены. Motion geometry обновлена в DESIGN.md; progress вычисляет актуальный stage и не требует hardcoded trigger. Новые browser screenshots ожидаются от root.

Второй визуальный круг: фактически просмотрены `qa/reviewer/arttime-c2-sculpture-gallery/mobile-start.png` (390×844) и `narrow-start.png` (320×760). Mobile sticky stage уменьшен на 88px header, minimum-height удалён. Sculpture height теперь `min(56%,100% − 310px)` с нижним полем 70px: начало объекта после CTA, полное основание до нижних контролов. Подпись шириной 105px расположена под объектом справа, pause слева. Изменены только mobile CSS, DESIGN и эти notes; desktop и остальные разделы сохранены. Фактическая повторная браузерная проверка — root.

## 6. Передача QA / SEO

Buildless static entry `dist/index.html`, публичный root `dist/`. Сервер только 127.0.0.1 (запускает root). Разделы: objects, catalog, spaces, request, contact. Темы: интерьерные предметы Art Time, вазы/картины/часы/арт-объекты, подбор, Ташкент. Metadata базовые; final canonical/OG/noindex/business JSON-LD и реальные URL — root SEO после регистрации Sites. Планируемого URL frontend не заявил.

Test selectors: `[data-menu-toggle]`, `[data-filter]`, `[data-search]`, `[data-search-clear]`, `[data-reset]`, `[data-product]`, `[data-request]`, `[data-motion-toggle]`, `[data-gallery]`, `[data-scene]`. QA должен пройти выбор/поиск/очистку/empty, product→request с новым выбранным предметом, export правок, reversal details, gallery ArrowLeft/ArrowRight, menu Escape, scene start/middle/end и pause/re-enable из нижнего раздела. Контент вне сцены имеет единственный максимум 1200px.

STATUS: BUILD_READY
