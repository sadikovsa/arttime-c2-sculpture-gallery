(() => {
 'use strict';
 const root = document.documentElement;
 root.classList.add('js');
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 const small = window.matchMedia('(max-width: 760px)');
 const $ = (selector, within = document) => within.querySelector(selector);
 const $$ = (selector, within = document) => [...within.querySelectorAll(selector)];
 const motion = window.ArtTimeMotion.create(()=>!reduced.matches&&!paused);
 const cards = $$('[data-product-card]');
 const products = cards.map(card => {
  const paragraphs = $$('.product__fallback .disclosure-body p', card);
  return {id:card.dataset.productCard,title:$('h3',card).textContent,category:card.dataset.category,
   description:paragraphs[0].textContent,specification:paragraphs[1].textContent,
   image:$('img',card).getAttribute('src'),width:Number($('img',card).getAttribute('width')),height:Number($('img',card).getAttribute('height'))};
 });
 const galleries = $$('.gallery-card, .inspiration-card').map(card => ({
  title:$('h3',card).textContent,description:$('figcaption p',card).textContent,
  image:$('img',card).getAttribute('src'),alt:$('img',card).alt
 }));
 const findProduct = id => products.find(p => p.id === id);
 // The catalogue is present in the original HTML; filtering is an enhancement.
 let category = 'Все';
 const search = $('[data-search]');
 let composing = false;
 const normalized = text => text.toLocaleLowerCase('ru').replace(/ё/g,'е').trim();
 const filterMotion = window.ArtTimeFilterMotion.create(cards, {isPaused: () => paused});
 function filterProducts(updateURL = true) {
  const filterSnapshot = updateURL ? filterMotion.capture() : null;
  const query = normalized(search.value);
  const terms = query.split(/\s+/).filter(Boolean);
  let visible = 0;
  cards.forEach(card => {
   const match = (category === 'Все' || card.dataset.category === category) && terms.every(term => normalized(card.dataset.searchText).includes(term));
   card.hidden = !match;
   if (match) visible++;
  });
  $$('[data-filter]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.filter === category)));
  $('[data-empty]').hidden = visible !== 0;
  $('[data-result-count]').textContent = `Показано: ${visible} из ${cards.length}`;
  if (updateURL) {
   const url = new URL(window.location.href);
   category === 'Все' ? url.searchParams.delete('category') : url.searchParams.set('category',category);
   query ? url.searchParams.set('q',search.value.trim()) : url.searchParams.delete('q');
   history.replaceState(null,'',url);
  }
  filterMotion.play(filterSnapshot);
  scheduleScene();
 }
 function restoreFilters() {
  const params = new URLSearchParams(location.search);
  const requested = params.get('category');
  category = $$('[data-filter]').some(button => button.dataset.filter === requested) ? requested : 'Все';
  search.value = params.get('q') || '';
  filterProducts(false);
 }
 $$('[data-filter]').forEach(button => button.addEventListener('click',() => {category = button.dataset.filter;filterProducts();}));
 search.addEventListener('compositionstart',() => {composing = true;});
 search.addEventListener('compositionend',() => {composing = false;filterProducts();});
 search.addEventListener('input',() => {if (!composing) filterProducts();});
 $('[data-search-clear]').addEventListener('click',() => {search.value = '';composing = false;filterProducts();search.focus();});
 $('[data-reset]').addEventListener('click',() => {category = 'Все';search.value = '';filterProducts();search.focus();});
 window.addEventListener('popstate',restoreFilters);
 // Category preview uses synchronous local state; no stale preload callback can win.
 let previewAnimation;
 $$('[data-category-select]').forEach(button => button.addEventListener('click',() => {
  const nextCategory = button.dataset.categorySelect;
  $$('[data-category-select]').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
  const product = products.find(p => p.category === nextCategory);
  const image = $('#category-preview-image');
  motion.swap(image,()=>{image.src = product.image;image.alt = product.title;},1,450);
  $('#category-preview-label').textContent = `${nextCategory} / ${String(products.filter(p => p.category === nextCategory).length).padStart(2,'0')}`;
  $('#category-preview-name').textContent = product.title;
  category = nextCategory;filterProducts();
 }));
 // Native details: reverse from the current panel height; the latest click owns completion.
 const disclosures = new WeakMap();
 $$('details').forEach(details => {
  const summary = $('summary',details);
  const body = $('.disclosure-body',details);
  if (!body) return;
  const state = {target:details.open,animation:null,generation:0};
  disclosures.set(details,state);
  summary.addEventListener('click',event => {
   event.preventDefault();
   state.target = !state.target;
   const token = ++state.generation;
   const from = details.open ? body.getBoundingClientRect().height : 0;
   const fromOpacity = details.open ? Number(getComputedStyle(body).opacity) : 0;
   if (state.animation) state.animation.cancel();
   if (reduced.matches) {details.open = state.target;body.style.removeProperty('overflow');state.animation = null;scheduleScene();return;}
   details.open = true;
   body.style.overflow = 'hidden';
   const to = state.target ? body.scrollHeight : 0;
   state.animation = body.animate([{height:`${from}px`,opacity:fromOpacity},{height:`${to}px`,opacity:state.target ? 1 : 0}],{duration:270,easing:'cubic-bezier(.22,.68,.25,1)',fill:'both'});
   state.animation.onfinish = () => {
    if (token !== state.generation) return;
    details.open = state.target;
    state.animation.cancel();state.animation = null;
    body.style.removeProperty('overflow');scheduleScene();
   };
  });
 });
 const menuToggle = $('[data-menu-toggle]');
 const menu = $('#main-menu');
 let menuOpen = false;let menuAnimation;let menuGeneration = 0;
 function setMenu(open,restoreFocus = false) {
  menuOpen = open;
  menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.innerHTML = open ? 'Закрыть <span aria-hidden="true">×</span>' : 'Меню <span aria-hidden="true">+</span>';
  const current = menu.getBoundingClientRect().height;
  const token = ++menuGeneration;
  if (menuAnimation) menuAnimation.cancel();
  if (!small.matches || reduced.matches) {menu.classList.toggle('menu-open',open);if(restoreFocus) menuToggle.focus();return;}
  menu.classList.add('menu-open');
  menuAnimation = menu.animate([{height:`${current}px`,opacity:open ? 0 : 1},{height:open ? `${menu.scrollHeight}px` : '0px',opacity:open ? 1 : 0}],{duration:270,easing:'cubic-bezier(.22,.68,.25,1)',fill:'both'});
  menuAnimation.onfinish = () => {if(token !== menuGeneration) return;menu.classList.toggle('menu-open',open);menuAnimation.cancel();menuAnimation = null;scheduleScene();};
  if (restoreFocus) menuToggle.focus();
 }
 menuToggle.addEventListener('click',() => setMenu(!menuOpen));
 $$('a',menu).forEach(link => link.addEventListener('click',() => {if(small.matches) setMenu(false);}));
 window.addEventListener('keydown',event => {if(event.key === 'Escape' && menuOpen) setMenu(false,true);});
 small.addEventListener('change',() => {if(menuAnimation) menuAnimation.cancel();setMenu(false);scheduleScene();});
 // One native dialog owner handles focus restoration and body scroll locking.
 const dialogs = $$('dialog');
 const openers = new WeakMap();
 function showDialog(dialog,opener) {
  const previous = dialogs.find(item => item.open);
  const restoreTo = previous ? openers.get(previous) : opener;
  if(previous) {openers.delete(previous);previous.close();}
  openers.set(dialog,restoreTo || opener);
  dialog.showModal();root.classList.add('dialog-open');dialog.scrollTop = 0;motion.enter(dialog,opener,'x');
 }
 dialogs.forEach(dialog => {
  $('[data-close]',dialog).addEventListener('click',() => motion.close(dialog));
  dialog.addEventListener('click',event => {
   if(event.target !== dialog) return;
   const rect = dialog.getBoundingClientRect();
   if(event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) motion.close(dialog);
  });
  dialog.addEventListener('cancel',e=>{e.preventDefault();motion.close(dialog);});
  dialog.addEventListener('close',() => {motion.scope(dialog);
   if(!dialogs.some(item => item.open)) root.classList.remove('dialog-open');
   const opener = openers.get(dialog);openers.delete(dialog);
   if(opener && opener.isConnected && !dialogs.some(item => item.open)) opener.focus({preventScroll:true});
  });
 });
 const productDialog = $('#product-dialog');
 let activeProduct;
 $$('[data-product]').forEach(trigger => trigger.addEventListener('click',event => {
  event.preventDefault();activeProduct = findProduct(trigger.dataset.product);if(!activeProduct) return;
  $('#product-dialog-title').textContent = activeProduct.title;
  $('#product-dialog-category').textContent = activeProduct.category;
  $('#product-dialog-description').textContent = activeProduct.description;
  $('#product-dialog-specification').textContent = activeProduct.specification;
  const image = $('#product-dialog-image');image.src = activeProduct.image;image.alt = activeProduct.title;
  $('[data-request-product]').dataset.requestProduct = activeProduct.title;
  showDialog(productDialog,trigger);
 }));
 const galleryDialog = $('#gallery-dialog');let galleryIndex = 0;
 function showGalleryImage() {
  const photo = galleries[galleryIndex];
  $('#gallery-dialog-title').textContent = photo.title;
  $('#gallery-dialog-description').textContent = photo.description;
  $('#gallery-dialog-image').src = photo.image;$('#gallery-dialog-image').alt = photo.alt;
  $('#gallery-dialog-count').textContent = `${galleryIndex+1} / ${galleries.length}`;
 }
 $$('[data-gallery]').forEach(trigger => trigger.addEventListener('click',event => {event.preventDefault();galleryIndex = Number(trigger.dataset.gallery);showGalleryImage();showDialog(galleryDialog,trigger);}));
 function advanceGallery(change) {galleryIndex = (galleryIndex+change+galleries.length)%galleries.length;motion.swap($('#gallery-dialog-image'),showGalleryImage,change,430);}
 $('[data-gallery-prev]').addEventListener('click',() => advanceGallery(-1));
 $('[data-gallery-next]').addEventListener('click',() => advanceGallery(1));
 galleryDialog.addEventListener('keydown',event => {if(event.key === 'ArrowLeft') {event.preventDefault();advanceGallery(-1);}if(event.key === 'ArrowRight') {event.preventDefault();advanceGallery(1);}});
 const requestDialog = $('#request-dialog');
 const requestForm = $('#request-form');const draft = $('#request-draft');const status = $('.form-status',requestDialog);
 $$('[data-request]').forEach(trigger => trigger.addEventListener('click',event => {
  event.preventDefault();
  if(trigger.dataset.requestProduct && $('#request-object').value !== trigger.dataset.requestProduct) {
   $('#request-object').value = trigger.dataset.requestProduct;$('.draft-block',requestDialog).hidden = true;
  }
  status.textContent = '';
  showDialog(requestDialog,trigger);$('#request-name').focus({preventScroll:true});
 }));
 requestForm.addEventListener('submit',event => {
  event.preventDefault();
  if($('#request-website').value) return;
  let firstInvalid;
  [['name','Введите ваше имя.'],['contact','Укажите телефон или контакт в Instagram.']].forEach(([key,message]) => {
   const field = $(`#request-${key}`);const invalid = !field.value.trim();
   field.setAttribute('aria-invalid',String(invalid));$(`#${key}-error`).textContent = invalid ? message : '';
   if(invalid && !firstInvalid) firstInvalid = field;
  });
  if(firstInvalid) {firstInvalid.focus();status.textContent = 'Заполните имя и контакт, чтобы подготовить запрос.';return;}
  draft.value = ['Здравствуйте, Art Time!','',`Меня зовут ${$('#request-name').value.trim()}.`,`Контакт: ${$('#request-contact').value.trim()}.`,$('#request-object').value.trim() ? `Интересует: ${$('#request-object').value.trim()}.` : 'Хочу обсудить подбор предметов для интерьера.',$('#request-message').value.trim() ? `Задача: ${$('#request-message').value.trim()}` : '', '', 'Пожалуйста, уточните стоимость, наличие и условия подбора.'].filter(line => line !== undefined).join('\n');
  $('.draft-block',requestDialog).hidden = false;
  status.textContent = 'Текст подготовлен. Измените его при необходимости, затем скопируйте или сохраните. Запрос ещё не отправлен.';
  draft.focus();
 });
 ['name','contact'].forEach(key => $(`#request-${key}`).addEventListener('input',event => {event.target.removeAttribute('aria-invalid');$(`#${key}-error`).textContent = '';}));
 $('[data-copy]').addEventListener('click',async () => {
  try {await navigator.clipboard.writeText(draft.value);status.textContent = 'Текст скопирован. Откройте Instagram Art Time и вставьте его в сообщение.';}
  catch {draft.focus();draft.select();status.textContent = 'Копирование недоступно. Текст выделен: скопируйте его вручную или сохраните TXT.';}
 });
 $('[data-download]').addEventListener('click',() => {
  const url = URL.createObjectURL(new Blob([draft.value],{type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a');link.href = url;link.download = 'art-time-request.txt';document.body.append(link);link.click();link.remove();
  setTimeout(() => URL.revokeObjectURL(url),1000);
  status.textContent = 'TXT сохранён на вашем устройстве. Передайте текст Art Time удобным способом.';
 });
 // Native-scroll staging. Geometry is read from the current layout each frame, never cached.
 const scene = $('[data-scene]');const stage = $('.scene-stage');
 const sculpture = $('.hero-sculpture');const heroCopy = $('.hero-copy');const caption = $('.hero-caption');
 const plane = $('.black-plane');const arrival = $('.scene-arrival');const index = $('.scene-index');
 const motionToggle = $('[data-motion-toggle]');let paused = false;let frame = 0;
 const clamp = (value,min=0,max=1) => Math.max(min,Math.min(max,value));
 function renderScene() {
  frame = 0;
  if(reduced.matches || paused) return;
  const rect = scene.getBoundingClientRect();
  const distance = scene.offsetHeight-stage.offsetHeight;
  const progress = clamp(-rect.top/Math.max(1,distance));
  if(progress>.05){const light=$('.sculpture-sheen');if(light)motion.scope(light);}
  scene.dataset.progress = progress.toFixed(3);
  stage.dataset.motionState = progress < .1 ? 'start' : progress > .9 ? 'end' : 'middle';
  const travel = small.matches ? 50 : 160;
  sculpture.style.transform = `translate3d(${progress*travel}px,${-progress*85}px,0) scale(${1+progress*.22})`;
  sculpture.style.opacity = String(1-clamp((progress-.4)/.3));
  heroCopy.style.transform = `translate3d(0,${-progress*140}px,0) scale(${1-progress*.08})`;
  heroCopy.style.opacity = String(1-clamp(progress/.6));
  caption.style.opacity = String(1-clamp(progress/.4));index.style.opacity = String(1-clamp(progress/.4));
  const shutter=clamp((progress-.1)/.8);plane.style.transform='none';plane.style.clipPath=`polygon(0 ${Math.max(0,100-shutter*118)}%,100% ${Math.min(100,118-shutter*118)}%,100% 100%,0 100%)`;
  arrival.style.opacity = String(clamp((progress-.6)/.35));
  arrival.style.transform = `translate3d(0,${(1-progress)*90}px,0)`;
 }
 function scheduleScene() {if(!frame) frame = requestAnimationFrame(renderScene);}
 function configureMotion() {
  root.classList.toggle('motion-enabled',!reduced.matches);
  motionToggle.hidden = reduced.matches;
  if(reduced.matches) { [sculpture,heroCopy,caption,index,plane,arrival].forEach(element => {element.style.removeProperty('transform');element.style.removeProperty('opacity');element.style.removeProperty('clip-path');}); }
  else scheduleScene();
 }
 motionToggle.addEventListener('click',() => {
  paused = !paused;root.classList.toggle('motion-paused',paused);motionToggle.setAttribute('aria-pressed',String(paused));
  motionToggle.innerHTML = paused ? 'Продолжить движение <span aria-hidden="true">▷</span>' : 'Остановить движение <span aria-hidden="true">Ⅱ</span>';
  scene.dataset.paused = String(paused);if(!paused) scheduleScene();
 });
 window.addEventListener('scroll',scheduleScene,{passive:true});window.addEventListener('resize',scheduleScene,{passive:true});
 reduced.addEventListener('change',configureMotion);
 if(window.ResizeObserver) {const observer = new ResizeObserver(scheduleScene);observer.observe(document.body);}
 document.fonts.ready.then(scheduleScene);$$('img').forEach(image => image.addEventListener('load',scheduleScene));
 motion.bind(motionToggle,reduced);
 const replay=$('[data-motion-replay]');replay.hidden=false;replay.disabled=reduced.matches;reduced.addEventListener('change',()=>{replay.disabled=reduced.matches;});
 let lightRequest=0;
 function spotlight(){const version=++lightRequest;(sculpture.decode?sculpture.decode():Promise.resolve()).then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(version!==lightRequest||reduced.matches||paused||scene.dataset.progress>.05)return;
  const previousLight=$('.sculpture-sheen');if(previousLight){motion.scope(previousLight);previousLight.remove();}
  const shape=document.createElement('div'),ribbon=document.createElement('div'),b=sculpture.getBoundingClientRect(),p=stage.getBoundingClientRect();
  shape.className='sculpture-sheen';shape.setAttribute('aria-hidden','true');shape.style.cssText=`left:${b.left-p.left}px;top:${b.top-p.top}px;width:${b.width}px;height:${b.height}px;mask-image:url("${sculpture.currentSrc}");-webkit-mask-image:url("${sculpture.currentSrc}")`;
  ribbon.className='sheen-ribbon';shape.append(ribbon);stage.append(shape);motion.run(ribbon,[{transform:'translateX(-75%)',opacity:0},{opacity:1,offset:.18},{opacity:1,offset:.72},{transform:'translateX(40%)',opacity:0}],small.matches?800:1000,()=>shape.remove(),()=>{},{easing:'linear'});
 }))).catch(()=>{});}
 replay.addEventListener('click',()=>{if(reduced.matches)return;if(paused)motionToggle.click();scrollTo({top:0,behavior:'instant'});scheduleScene();spotlight();});
 configureMotion();restoreFilters();spotlight();
})();
