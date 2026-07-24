(function(){
  'use strict';
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(!reduced&&fine){
    document.querySelectorAll('[data-tilt]').forEach(function(card,index){
      var frame=0;
      var active=true;
      var hovering=false;
      var phase=index?2.47:.38;
      var rest={x:index?-2.15:2.15,y:index?.38:-.28,z:index?-.62:.62};
      var current={x:0,y:0,lx:50,ly:24,energy:.18,hover:0};
      var pointer={x:0,y:0,lx:50,ly:24};
      function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
      function render(now){
        var time=now*.001;
        var idleX=Math.sin(time*.31+phase)*1.42+Math.sin(time*.17+phase*1.7)*.5;
        var idleY=Math.cos(time*.27+phase*.8)*.98+Math.sin(time*.13+phase)*.36;
        var idleLift=Math.sin(time*.38+phase)*2.58;
        var idleLightX=50+Math.sin(time*.23+phase)*18+Math.sin(time*.11+phase*2)*6;
        var idleLightY=25+Math.cos(time*.19+phase)*8.4;
        var idleEnergy=.2+(Math.sin(time*.34+phase)+1)*.066;
        var hoverTarget=hovering?1:0;
        current.hover+=(hoverTarget-current.hover)*(hovering?.085:.035);
        var targetX=rest.x+idleX*(1-current.hover)+pointer.x*current.hover;
        var targetY=rest.y+idleY*(1-current.hover)+pointer.y*current.hover;
        var targetLx=idleLightX+(pointer.lx-idleLightX)*current.hover;
        var targetLy=idleLightY+(pointer.ly-idleLightY)*current.hover;
        var targetEnergy=idleEnergy+current.hover*.76;
        current.x+=(targetX-current.x)*.065;
        current.y+=(targetY-current.y)*.065;
        current.lx+=(targetLx-current.lx)*.055;
        current.ly+=(targetLy-current.ly)*.055;
        current.energy+=(targetEnergy-current.energy)*.05;
        card.style.setProperty('--lx',current.lx+'%');
        card.style.setProperty('--ly',current.ly+'%');
        card.style.setProperty('--energy',current.energy);
        card.style.setProperty('--px',(current.x*1.18)+'px');
        card.style.setProperty('--py',(current.y*.96)+'px');
        card.style.setProperty('--npx',(-current.x*.62)+'px');
        card.style.setProperty('--npy',(-current.y*.48)+'px');
        var restZ=rest.z+Math.sin(time*.2+phase)*.16;
        card.style.transform='perspective(1200px) rotateX('+(-current.y)+'deg) rotateY('+current.x+'deg) rotateZ('+restZ+'deg) translate3d(0,'+(-4+idleLift-current.hover*2)+'px,0)';
        frame=active?requestAnimationFrame(render):0;
      }
      function start(){if(!frame)frame=requestAnimationFrame(render);}
      card.addEventListener('pointermove',function(event){
        var rect=card.getBoundingClientRect();
        var nx=clamp((event.clientX-rect.left)/rect.width,.12,.88);
        var ny=clamp((event.clientY-rect.top)/rect.height,.16,.84);
        hovering=true;
        pointer.x=clamp((nx-.5)*10.8,-5.4,5.4);
        pointer.y=clamp((ny-.5)*8.4,-4.2,4.2);
        pointer.lx=clamp(nx*100,18,82);
        pointer.ly=clamp(ny*100,15,72);
        start();
      });
      card.addEventListener('pointerleave',function(){
        hovering=false;
        start();
      });
      var observer=new IntersectionObserver(function(entries){
        active=entries[0].isIntersecting;
        if(active)start();
      },{rootMargin:'120px'});
      observer.observe(card);
      start();
    });
  }

  var header=document.querySelector('.site-header');
  var headerFrame=0;
  function updateHeader(){
    headerFrame=0;
    if(header)header.classList.toggle('is-elevated',window.scrollY>44);
  }
  function queueHeaderUpdate(){
    if(!headerFrame)headerFrame=requestAnimationFrame(updateHeader);
  }
  updateHeader();
  window.addEventListener('scroll',queueHeaderUpdate,{passive:true});

  var copy=[
    ['К содержанию','Skip to content'],
    ['Продукты','Products'],['Работы','Work'],['Контакт','Contact'],['Обсудить задачу','Discuss a project'],
    ['AI Product Engineer · Kazakhstan','AI Product Engineer · Kazakhstan'],
    ['Я — Idris Dabyl. Проектирую и собираю AI-инструменты для продаж, поиска клиентов и автоматизации бизнеса — от продуктовой логики до надёжного запуска.','I’m Idris Dabyl. I design and build AI tools for sales, lead generation and business automation — from product logic to a reliable launch.'],
    ['Смотреть продукты','Explore products'],['флагманских продукта','flagship products'],['направления работ','areas of work'],['Полный цикл','Full cycle'],['идея → код → запуск','idea → code → launch'],
    ['AI-приём заявок · квалификация','AI lead intake · qualification'],['Новая заявка','New inquiry'],['Проблема и контакты уточнены','Problem and contact details captured'],['Лид передан команде','Lead handed to the team'],['Передача человеку по правилам','Rule-based human handoff'],['Открыть кейс →','Open case →'],
    ['Аналитика намерений · маршрутизация','Intent intelligence · lead routing'],['Квалифицированная возможность','Qualified opportunity'],['Коммерческий интерес · назначено команде','Commercial intent · routed to team'],['Готов к закрытому пилоту','Ready for a closed pilot'],
    ['Основные продукты','Core products'],['Не концепты. Системы с реальной логикой и честными границами.','Not concepts. Systems with real logic and honest boundaries.'],
    ['01 / AI-ПРОДАЖИ','01 / AI SALES'],['Приём и квалификация заявок для сервисного бизнеса','Lead intake and qualification for service businesses'],['Быстро отвечает на входящий запрос, уточняет проблему, собирает контакт и необходимые детали, затем передаёт команде подготовленный к работе лид. Avito — первая канальная интеграция, а не граница продукта.','Responds promptly to inquiries, clarifies the problem, captures contact and required details, then hands the team a ready-to-act lead. Avito is the first channel integration, not the product identity.'],
    ['Контролируемая автоматизация','Controlled automation'],['Assist-режим: оператор подтверждает ответ перед отправкой.','Assist mode: an operator approves each answer before it is sent.'],['Надёжный поток сообщений','Reliable message flow'],['Очередь, SQLite-восстановление и защита от дублей.','Queueing, SQLite recovery and duplicate protection.'],['Первая канальная интеграция','First channel integration'],['Avito Messenger API — стартовый канал; продуктовая логика не зависит от одной площадки.','Avito Messenger API is the starting channel; the product logic is not tied to one platform.'],
    ['Статус:','Status:'],['MVP подготовлен к пилоту; для боевой проверки нужны доступ к Messenger API и реальный аккаунт пилота.','The MVP is pilot-ready; live validation requires Messenger API access and a real pilot account.'],
    ['Рабочее место оператора','Operator workspace'],['Диалоги','Conversations'],['Входящий запрос · Кофемашина','Inbound request · Coffee machine'],['Добрый день! Сколько стоит выезд и когда сможете приехать?','Hello! How much is a call-out and when can you come?'],['AI-черновик · высокая уверенность','AI draft · high confidence'],['Здравствуйте! Диагностика входит в стоимость ремонта. Подскажите модель кофемашины и ваш район?','Hello! Diagnostics are included in the repair price. What is your coffee machine model and area?'],['Подтвердить','Approve'],['Изменить','Edit'],['Намерение: ремонт','Intent: repair'],['Тёплый лид','Warm lead'],
    ['02 / АНАЛИТИКА ЛИДОВ','02 / LEAD INTELLIGENCE'],['Аналитика намерений и маршрутизация лидов','Intent intelligence and lead routing'],['Мониторит разрешённые источники, понимает коммерческое намерение в контексте, квалифицирует возможности и направляет готовые к действию лиды нужной команде, поддерживая их движение по воронке.','Monitors permitted sources, understands commercial intent in context, qualifies opportunities and routes actionable leads to the right team while supporting their movement through the funnel.'],
    ['Мониторинг разрешённых источников','Permitted-source monitoring'],['Telegram — первый источник; система спроектирована вокруг намерения, а не одной платформы.','Telegram is the first source; the system is designed around intent, not one platform.'],['Двухэтапный фильтр','Two-stage filter'],['Быстрый префильтр, затем AI-классификация и уверенность.','Fast prefilter, then AI classification and confidence.'],['Быстрый prefilter, затем AI-классификация и confidence.','Fast prefilter, then AI classification and confidence.'],['Маршрутизация и воронка','Routing and funnel'],['Подтверждение качества, причина ошибки и передача возможности в работу.','Quality confirmation, error reason and opportunity handoff into the workflow.'],['технически готов к закрытому семидневному пилоту; это ещё не self-service SaaS.','technically ready for a closed seven-day pilot; this is not yet a self-service SaaS.'],
    ['Поток лидов','Lead stream'],['12 источников','12 sources'],['префильтр активен','prefilter active'],['без дублей','no duplicates'],['Квалифицированная возможность · 2 мин','Qualified opportunity · 2 min'],['Ищу разработчика AI-бота для квалификации заявок','Looking for an AI bot developer to qualify requests'],['Нужна автоматизация первичной квалификации и передача подготовленных лидов менеджеру.','We need automated initial qualification and ready-to-act lead handoff to a manager.'],['👍 Подтвердить','👍 Confirm'],['Черновик ответа','Reply draft'],['В работу','In progress'],['источники → контекст → intent → маршрут → воронка','sources → context → intent → route → funnel'],
    ['Лаборатория продуктов','Product lab'],['Четыре направления. Один инженерный подход.','Four disciplines. One engineering approach.'],['22 лендинга, 10 AI-агентов, 10 Telegram-ботов и 5 мобильных приложений показывают широту практики, не конкурируя с двумя флагманскими продуктами.','22 landing pages, 10 AI agents, 10 Telegram bots and 5 mobile apps demonstrate breadth without competing with the two flagship products.'],
    ['Лендинга','Landing pages'],['AI-агентов','AI agents'],['Telegram-ботов','Telegram bots'],['Мобильных приложений','Mobile apps'],['Продуктовые страницы · интерактивные интерфейсы','Product pages · interactive interfaces'],['Инструменты · RAG · автоматизация процессов','Tool use · RAG · workflow automation'],['Поддержка · продажи · сервисные сценарии','Support · sales · service workflows'],['React Native · Expo · продуктовые прототипы','React Native · Expo · product prototypes'],
    ['Все','All'],['Лендинги','Landing pages'],['AI-агенты','AI agents'],['Telegram-боты','Telegram bots'],['Мобильные','Mobile'],['Фильтр проектов','Project filter'],
    ['Лендинг · демо','Landing · demo'],['AI-агент · сценарное демо','AI agent · scenario demo'],['Telegram-бот · сценарное демо','Telegram bot · scenario demo'],['Открыть внутри сайта ↗','Open in-site ↗'],['Проиграть сценарий ↗','Play scenario ↗'],['Проиграть чат ↗','Play chat ↗'],['Открыть макет ↗','Open mockup ↗'],
    ['Лендинг · демо','Landing · demo'],['AI-интерфейс · демо','AI interface · demo'],['Мобильное · прототип','Mobile · prototype'],['Продуктовый опыт на Three.js ↗','Three.js product experience ↗'],['Интерфейс ресторана ↗','Restaurant experience ↗'],['Ассистент с базой знаний ↗','Knowledge-base assistant ↗'],['От данных к выводам ↗','Data-to-insight workflow ↗'],['Трекер финансов ↗','Finance tracker ↗'],['Прогресс тренировок ↗','Fitness progress app ↗'],
    ['Открыть полный каталог','Open full catalogue'],['49 проектов','49 projects'],['Лендинги · 22','Landing pages · 22'],['AI-агенты · 10','AI agents · 10'],['Telegram-боты · 12','Telegram bots · 12'],['Мобильные · 5','Mobile · 5'],['Support-бот отмечен в исходном проекте как production.','The Support bot is marked as production in the source project.'],['React Native / Expo прототипы.','React Native / Expo prototypes.'],
    ['Есть процесс, который пора превратить в продукт?','Have a process that should become a product?'],['Опишите задачу коротко: где теряется время, лиды или качество. Я отвечу предметно — что можно собрать, где риски и с чего начать.','Describe the problem briefly: where time, leads or quality are lost. I’ll respond concretely — what can be built, the risks, and where to start.'],['Написать в Telegram','Message on Telegram'],['Наверх ↑','Back to top ↑'],['AI-продукты · автоматизация · разработка','AI products · automation · engineering']
  ];
  var aliases={
    'Full cycle':'Полный цикл',
    '01 / AI SALES':'01 / AI-ПРОДАЖИ','02 / LEAD INTELLIGENCE':'02 / АНАЛИТИКА ЛИДОВ','Operator workspace':'Рабочее место оператора',
    'AI draft · confidence high':'AI-черновик · высокая уверенность','Lead stream':'Поток лидов','prefilter active':'префильтр активен','no duplicates':'без дублей',
    'Product lab':'Лаборатория продуктов','Tool use · RAG · FastAPI':'Использование инструментов · RAG · FastAPI','aiogram · FSM · integrations':'aiogram · FSM · интеграции',
    'Mobile apps':'Мобильных приложений','Landing · demo':'Лендинг · демо','AI interface · demo':'AI-интерфейс · демо','Mobile · prototype':'Мобильное · прототип',
    'Three.js product experience ↗':'Продуктовый опыт на Three.js ↗','Restaurant experience ↗':'Интерфейс ресторана ↗','Knowledge-base assistant ↗':'Ассистент с базой знаний ↗',
    'Data-to-insight workflow ↗':'От данных к выводам ↗','Finance tracker ↗':'Трекер финансов ↗','Fitness progress app ↗':'Прогресс тренировок ↗',
    'Mobile · 5':'Мобильные · 5','AI products · automation · engineering':'AI-продукты · автоматизация · разработка'
  };
  var copyByRu={};copy.forEach(function(pair){copyByRu[pair[0]]={ru:pair[0],en:pair[1]};});
  var textBindings=[];
  var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  var textNode;
  while((textNode=walker.nextNode())){
    var value=textNode.nodeValue.trim();
    var canonical=aliases[value]||value;
    if(copyByRu[canonical]){
      var leading=(textNode.nodeValue.match(/^\s*/)||[''])[0];
      var trailing=(textNode.nodeValue.match(/\s*$/)||[''])[0];
      textBindings.push({node:textNode,pair:copyByRu[canonical],leading:leading,trailing:trailing});
    }
  }
  var attrBindings=[
    {el:document.querySelector('nav'),attr:'aria-label',ru:'Основная навигация',en:'Primary navigation'},
    {el:document.querySelector('.hero-stage'),attr:'aria-label',ru:'Два главных продукта',en:'Two flagship products'},
    {el:document.querySelector('.hero-facts'),attr:'aria-label',ru:'Ключевые направления',en:'Key areas'},
    {el:document.querySelector('.seller-case .product-ui'),attr:'aria-label',ru:'Схема интерфейса AI Seller',en:'AI Seller interface preview'},
    {el:document.querySelector('.scout-case .product-ui'),attr:'aria-label',ru:'Схема карточек LeadScout',en:'LeadScout card preview'},
    {el:document.querySelector('.gallery'),attr:'aria-label',ru:'Избранные проекты лаборатории',en:'Selected lab projects'},
    {el:document.querySelector('.lab-filters'),attr:'aria-label',ru:'Фильтр проектов',en:'Project filter'},
    {el:document.querySelector('.language-switch'),attr:'aria-label',ru:'Выбор языка',en:'Language selection'},
    {el:document.querySelector('[data-lang="ru"]'),attr:'aria-label',ru:'Переключить на русский язык',en:'Switch to Russian'},
    {el:document.querySelector('[data-lang="en"]'),attr:'aria-label',ru:'Переключить на английский язык',en:'Switch to English'}
  ];
  var switchButtons=document.querySelectorAll('.language-switch button');
  var languageSwitch=document.querySelector('.language-switch');
  var languageThumb=document.querySelector('.language-thumb');
  var dragState={active:false,pointerId:0,startLang:'ru',previewLang:'ru',progress:0,moved:false,suppressClick:false,capture:null};
  var languageRegions=[].slice.call(document.querySelectorAll('.site-header nav,.header-cta,.hero-lead,.hero-actions,.hero-facts,.case-copy>p,.case-copy>ul,.case-copy>.case-meta,.lab .section-heading,.lab-stats,.lab-filters,.gallery-card>span,.contact .eyebrow,.contact-grid,footer'));
  languageRegions.forEach(function(region){region.classList.add('i18n-local');});
  var languageTimer=0;
  function applyLanguage(lang,persist){
    lang=lang==='en'?'en':'ru';
    document.documentElement.lang=lang;
    textBindings.forEach(function(binding){binding.node.nodeValue=binding.leading+binding.pair[lang]+binding.trailing;});
    attrBindings.forEach(function(binding){if(binding.el)binding.el.setAttribute(binding.attr,binding[lang]);});
    switchButtons.forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.lang===lang));});
    if(languageSwitch&&!dragState.active)languageSwitch.style.setProperty('--thumb-progress',lang==='en'?1:0);
    document.title=lang==='ru'?'Idris Dabyl — AI Product Engineer':'Idris Dabyl — AI Product Engineer';
    document.querySelector('meta[name="description"]').content=lang==='ru'?'Idris Dabyl — AI Product Engineer. Создаю AI-продукты и автоматизации для продаж, лидогенерации и операционной работы.':'Idris Dabyl — AI Product Engineer building AI products and business automation for sales, lead generation and operations.';
    if(persist){try{localStorage.setItem('portfolio-language',lang);}catch(error){}}
    document.dispatchEvent(new CustomEvent('portfolio:language',{detail:{lang:lang}}));
  }
  function setLanguage(lang,persist,animate){
    lang=lang==='en'?'en':'ru';
    clearTimeout(languageTimer);
    if(!animate||reduced){
      languageRegions.forEach(function(region){region.classList.remove('is-changing');});
      applyLanguage(lang,persist);
      return;
    }
    languageRegions.forEach(function(region){region.classList.add('is-changing');});
    languageTimer=window.setTimeout(function(){
      applyLanguage(lang,persist);
      requestAnimationFrame(function(){languageRegions.forEach(function(region){region.classList.remove('is-changing');});});
    },150);
  }
  function animateLanguageThumb(){
    if(!languageThumb||reduced)return;
    languageThumb.classList.remove('is-selecting');
    void languageThumb.offsetWidth;
    languageThumb.classList.add('is-selecting');
    window.setTimeout(function(){languageThumb.classList.remove('is-selecting');},520);
  }
  switchButtons.forEach(function(button){
    button.addEventListener('click',function(event){
      if(dragState.suppressClick&&event.detail!==0){
        dragState.suppressClick=false;
        event.preventDefault();
        return;
      }
      animateLanguageThumb();
      if(button.getAttribute('aria-pressed')!=='true')setLanguage(button.dataset.lang,true,true);
    });
  });
  var storedLanguage='ru';
  try{storedLanguage=localStorage.getItem('portfolio-language')||'ru';}catch(error){}
  setLanguage(storedLanguage,false,false);

  if(languageSwitch){
    function dragProgress(clientX){
      var ruButton=document.querySelector('.language-switch [data-lang="ru"]');
      var enButton=document.querySelector('.language-switch [data-lang="en"]');
      var ruRect=ruButton.getBoundingClientRect();
      var enRect=enButton.getBoundingClientRect();
      var left=ruRect.left+ruRect.width/2;
      var right=enRect.left+enRect.width/2;
      return Math.max(0,Math.min(1,(clientX-left)/(right-left)));
    }
    switchButtons.forEach(function(button){
      button.addEventListener('pointerdown',function(event){
        if(event.button!==0||button.getAttribute('aria-pressed')!=='true')return;
        dragState.active=true;
        dragState.pointerId=event.pointerId;
        dragState.startLang=button.dataset.lang;
        dragState.previewLang=button.dataset.lang;
        dragState.progress=button.dataset.lang==='en'?1:0;
        dragState.moved=false;
        dragState.capture=button;
        languageSwitch.classList.add('is-dragging');
        button.setPointerCapture(event.pointerId);
        button.focus({preventScroll:true});
        event.preventDefault();
      });
    });
    languageSwitch.addEventListener('pointermove',function(event){
      if(!dragState.active||event.pointerId!==dragState.pointerId)return;
      var progress=dragProgress(event.clientX);
      if(Math.abs(progress-dragState.progress)>.035)dragState.moved=true;
      dragState.progress=progress;
      languageSwitch.style.setProperty('--thumb-progress',progress);
      var target=dragState.previewLang;
      if(progress>=.56)target='en';
      else if(progress<=.44)target='ru';
      if(target!==dragState.previewLang){
        dragState.previewLang=target;
        setLanguage(target,true,true);
      }
      event.preventDefault();
    });
    function finishDrag(event){
      if(!dragState.active||event.pointerId!==dragState.pointerId)return;
      var finalLang=dragState.previewLang;
      if(dragState.startLang==='ru'&&dragState.progress<.56)finalLang='ru';
      if(dragState.startLang==='en'&&dragState.progress>.44)finalLang='en';
      dragState.active=false;
      dragState.suppressClick=dragState.moved;
      languageSwitch.classList.remove('is-dragging');
      languageSwitch.style.setProperty('--thumb-progress',finalLang==='en'?1:0);
      if(finalLang!==dragState.previewLang)setLanguage(finalLang,true,true);
      animateLanguageThumb();
      if(dragState.capture&&dragState.capture.hasPointerCapture(event.pointerId))dragState.capture.releasePointerCapture(event.pointerId);
      dragState.capture=null;
    }
    languageSwitch.addEventListener('pointerup',finishDrag);
    languageSwitch.addEventListener('pointercancel',finishDrag);
  }

  var previewDialog=document.getElementById('preview-dialog');
  var previewBody=document.getElementById('preview-body');
  var previewTitle=document.getElementById('preview-title');
  var previewStatus=document.getElementById('preview-status');
  var previewReplay=document.querySelector('.preview-replay');
  var previewFoot=document.querySelector('.preview-foot p');
  var previewClose=document.querySelector('.preview-close');
  var previewOrigin=null;
  var activePreview='';
  var scenarioStep=0;
  var scenarioTimer=0;
  var mockupObserver=null;
  var previews={
    sato:{kind:'landing',title:'SATO KIMONOS',src:'sato-kimonos/'},
    ember:{kind:'landing',title:'Ember',src:'restaurant/'},
    money:{kind:'mockup',title:'MoneyKeep',src:'_apps/finance-app.html'},
    fitness:{kind:'mockup',title:'FitPulse',src:'_apps/fitness-app.html'},
    support:{kind:'terminal',title:'Support Agent',steps:{
      ru:[['user','Не работает форма оплаты на сайте.'],['agent','Уточню контекст: какой браузер используется, появляется ли сообщение об ошибке и работала ли оплата раньше?'],['user','Chrome. Появляется “payment declined”, раньше работало.'],['agent','Сценарий классифицирует обращение, собирает детали и готовит передачу специалисту. В реальной интеграции итог зависит от подключённой базы знаний и правил эскалации.']],
      en:[['user','The payment form on the site is not working.'],['agent','Let me clarify the context: which browser, is there an error message, and did payment work before?'],['user','Chrome. It says “payment declined”; it worked before.'],['agent','The scenario classifies the request, captures the details and prepares a specialist handoff. In a real integration, the result depends on the connected knowledge base and escalation rules.']]
    }},
    analytics:{kind:'terminal',title:'Analytics Agent',steps:{
      ru:[['user','analyze(\"sales_sample.csv\")'],['agent','[demo] Читаю структуру таблицы, проверяю пропуски и рассчитываю сводные показатели.'],['agent','Сценарный результат: найдено изменение по дням недели и одна строка, требующая проверки. Числа намеренно не показаны как реальные бизнес-результаты.'],['agent','Следующий шаг: подтвердить источник данных и сформировать воспроизводимый отчёт с методикой расчёта.']],
      en:[['user','analyze(\"sales_sample.csv\")'],['agent','[demo] Reading the table structure, checking missing values and calculating summary metrics.'],['agent','Scenario result: a weekday pattern and one row requiring review were found. Numbers are intentionally not presented as real business results.'],['agent','Next step: verify the data source and produce a reproducible report with calculation notes.']]
    }},
    'bot-support':{kind:'telegram',title:'Support Bot',steps:{
      ru:[['bot','Здравствуйте. Опишите вопрос — это сценарное демо интерфейса поддержки.'],['user','Не могу найти статус обращения.'],['bot','Уточните номер обращения. В подключённой системе бот мог бы проверить статус или передать запрос оператору.'],['user','Заявка 1042'],['bot','Демо завершено: показан сбор контекста и маршрут передачи человеку, без обращения к реальной CRM.']],
      en:[['bot','Hello. Describe your issue — this is a scripted support-interface demo.'],['user','I cannot find the status of my request.'],['bot','Please provide the request number. In a connected system, the bot could check status or route the request to an operator.'],['user','Request 1042'],['bot','Demo complete: it shows context capture and human handoff without accessing a real CRM.']]
    }},
    'bot-analytics':{kind:'telegram',title:'Analytics Bot',steps:{
      ru:[['bot','Пришлите CSV или JSON для демонстрационного анализа.'],['user','sales_sample.csv'],['bot','[demo] Проверяю структуру, пропуски и аномальные значения.'],['bot','Сценарий готовит краткое резюме и список проверок. Файл не загружался, показатели не являются реальными.']],
      en:[['bot','Send a CSV or JSON file for a demonstration analysis.'],['user','sales_sample.csv'],['bot','[demo] Checking structure, missing values and anomalies.'],['bot','The scenario prepares a short summary and review list. No file was uploaded and no metrics are presented as real.']]
    }}
  };
  document.querySelectorAll('.gallery-card[data-category="landing"][data-src]').forEach(function(card){
    previews[card.dataset.preview]={kind:'landing',title:card.dataset.title,src:card.dataset.src};
  });
  function previewLanguage(){return document.documentElement.lang==='en'?'en':'ru';}
  function previewLabels(){
    var en=previewLanguage()==='en';
    return {
      landing:en?'Landing-page demo':'Демо лендинга',
      mockup:en?'Source-backed mobile prototype mockup':'Макет мобильного прототипа с исходным кодом',
      terminal:en?'Scripted AI-agent demo':'Сценарное демо AI-агента',
      telegram:en?'Scripted Telegram-bot demo':'Сценарное демо Telegram-бота',
      close:en?'Close preview':'Закрыть превью',
      replay:en?'Replay demo':'Повторить демо',
      next:en?'Next step':'Следующий шаг',
      note:en?'Interface demo recovered from the original portfolio. It is not a claim of a live client product.':'Демонстрационный интерфейс из исходного портфолио. Не является заявлением о работающем клиентском продукте.'
    };
  }
  function clearPreviewRuntime(){
    clearTimeout(scenarioTimer);
    if(mockupObserver){mockupObserver.disconnect();mockupObserver=null;}
  }
  function renderScenario(){
    clearPreviewRuntime();
    var item=previews[activePreview];
    var labels=previewLabels();
    var steps=item.steps[previewLanguage()];
    previewBody.innerHTML='<div class="scenario '+(item.kind==='telegram'?'telegram':'terminal')+'"><div class="scenario-log" aria-live="polite"></div><div class="scenario-controls"><button class="scenario-next" type="button">'+labels.next+'</button></div></div>';
    scenarioStep=0;
    var log=previewBody.querySelector('.scenario-log');
    var next=previewBody.querySelector('.scenario-next');
    function addStep(){
      if(scenarioStep>=steps.length){next.disabled=true;next.hidden=true;return;}
      var step=steps[scenarioStep++];
      var line=document.createElement('div');
      line.className='scenario-line '+(step[0]==='user'?'user':'agent');
      var role=step[0]==='user'?(previewLanguage()==='en'?'You':'Вы'):(item.kind==='telegram'?'Bot':'Agent');
      line.innerHTML='<strong>'+role+'</strong>';
      line.appendChild(document.createTextNode(step[1]));
      log.appendChild(line);
      log.scrollTop=log.scrollHeight;
      if(scenarioStep>=steps.length){next.disabled=true;next.hidden=true;}
    }
    next.addEventListener('click',addStep);
    addStep();
  }
  function scaleMockup(){
    var viewport=previewBody.querySelector('.mockup-viewport');
    var canvas=previewBody.querySelector('.mockup-canvas');
    if(!viewport||!canvas)return;
    var scale=Math.min(viewport.clientWidth/1200,viewport.clientHeight/800);
    canvas.style.transform='scale('+scale+')';
  }
  function renderPreview(){
    var item=previews[activePreview];
    if(!item)return;
    var labels=previewLabels();
    clearPreviewRuntime();
    previewTitle.textContent=item.title;
    previewStatus.textContent=labels[item.kind];
    previewClose.setAttribute('aria-label',labels.close);
    previewReplay.textContent=labels.replay;
    previewFoot.textContent=labels.note;
    previewDialog.classList.toggle('is-scenario',item.kind==='terminal'||item.kind==='telegram');
    if(item.kind==='landing'){
      previewBody.innerHTML='<div class="preview-frame-wrap"><iframe class="preview-frame" title="'+item.title+' — '+labels.landing+'" src="'+item.src+'"></iframe></div>';
    }else if(item.kind==='mockup'){
      previewBody.innerHTML='<div class="mockup-viewport"><div class="mockup-canvas"><iframe title="'+item.title+' — '+labels.mockup+'" src="'+item.src+'"></iframe></div></div>';
      mockupObserver=new ResizeObserver(scaleMockup);
      mockupObserver.observe(previewBody.querySelector('.mockup-viewport'));
      requestAnimationFrame(scaleMockup);
    }else{
      renderScenario();
    }
  }
  function openPreview(key,origin,updateHash){
    if(!previewDialog||!previews[key])return;
    activePreview=key;
    previewOrigin=origin||document.activeElement;
    renderPreview();
    if(!previewDialog.open)previewDialog.showModal();
    if(updateHash!==false)history.pushState({preview:key},'','#preview-'+key);
  }
  function closePreview(updateHash){
    if(!previewDialog||!previewDialog.open)return;
    clearPreviewRuntime();
    previewDialog.close();
    previewBody.innerHTML='';
    activePreview='';
    if(updateHash!==false&&location.hash.indexOf('#preview-')===0)history.replaceState(null,'',location.pathname+location.search);
    if(previewOrigin&&document.contains(previewOrigin))previewOrigin.focus();
  }
  document.querySelectorAll('[data-preview]').forEach(function(button){
    button.addEventListener('click',function(){openPreview(button.dataset.preview,button,true);});
  });
  document.querySelectorAll('.lab-filters button').forEach(function(button){
    button.addEventListener('click',function(){
      var filter=button.dataset.filter;
      document.querySelectorAll('.lab-filters button').forEach(function(item){
        var active=item===button;
        item.classList.toggle('is-active',active);
        item.setAttribute('aria-pressed',String(active));
      });
      document.querySelectorAll('.gallery-card').forEach(function(card){
        if(filter==='all')card.hidden=card.hasAttribute('data-secondary');
        else card.hidden=card.dataset.category!==filter;
      });
    });
  });
  if(previewClose)previewClose.addEventListener('click',function(){closePreview(true);});
  if(previewReplay)previewReplay.addEventListener('click',renderScenario);
  if(previewDialog){
    previewDialog.addEventListener('click',function(event){if(event.target===previewDialog)closePreview(true);});
    previewDialog.addEventListener('close',function(){clearPreviewRuntime();});
    previewDialog.addEventListener('cancel',function(event){event.preventDefault();closePreview(true);});
  }
  function openPreviewFromHash(){
    var match=location.hash.match(/^#preview-(.+)$/);
    if(match&&previews[match[1]])openPreview(match[1],null,false);
    else if(previewDialog&&previewDialog.open)closePreview(false);
  }
  window.addEventListener('popstate',openPreviewFromHash);
  document.addEventListener('portfolio:language',function(){if(activePreview)renderPreview();});
  openPreviewFromHash();

  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    link.addEventListener('click',function(event){
      var target=document.querySelector(link.getAttribute('href'));
      if(!target)return;
      event.preventDefault();
      if(location.hash!==link.getAttribute('href')) history.pushState(null,'',link.getAttribute('href'));
      target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
      if(link.closest('.mini-product')){
        target.setAttribute('tabindex','-1');
        target.focus({preventScroll:true});
      }
    });
  });
})();
