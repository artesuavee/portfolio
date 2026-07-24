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
    ['Смотреть продукты','Explore products'],['флагманских продукта','flagship products'],['проектов в лаборатории','projects in the lab'],['Полный цикл','Full cycle'],['идея → код → запуск','idea → code → launch'],
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
    ['Лаборатория продуктов','Product lab'],['Лаборатория, где проверяю широту инженерного подхода.','A lab where I test the breadth of my engineering approach.'],['Вторичный каталог: интерфейсы, агенты, боты и мобильные прототипы. Эти работы показывают диапазон, но не подменяют два продуктовых кейса выше.','A secondary catalogue of interfaces, agents, bots and mobile prototypes. These show breadth without competing with the two product cases above.'],
    ['Лендинга','Landing pages'],['AI-агентов','AI agents'],['Telegram-ботов','Telegram bots'],['Мобильных приложений','Mobile apps'],['Использование инструментов · RAG · FastAPI','Tool use · RAG · FastAPI'],['aiogram · FSM · интеграции','aiogram · FSM · integrations'],
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
    {el:document.querySelector('.language-switch'),attr:'aria-label',ru:'Выбор языка',en:'Language selection'},
    {el:document.querySelector('[data-lang="ru"]'),attr:'aria-label',ru:'Переключить на русский язык',en:'Switch to Russian'},
    {el:document.querySelector('[data-lang="en"]'),attr:'aria-label',ru:'Переключить на английский язык',en:'Switch to English'}
  ];
  var switchButtons=document.querySelectorAll('.language-switch button');
  function setLanguage(lang,persist){
    lang=lang==='en'?'en':'ru';
    document.documentElement.lang=lang;
    textBindings.forEach(function(binding){binding.node.nodeValue=binding.leading+binding.pair[lang]+binding.trailing;});
    attrBindings.forEach(function(binding){if(binding.el)binding.el.setAttribute(binding.attr,binding[lang]);});
    switchButtons.forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.lang===lang));});
    document.title=lang==='ru'?'Idris Dabyl — AI Product Engineer':'Idris Dabyl — AI Product Engineer';
    document.querySelector('meta[name="description"]').content=lang==='ru'?'Idris Dabyl — AI Product Engineer. Создаю AI-продукты и автоматизации для продаж, лидогенерации и операционной работы.':'Idris Dabyl — AI Product Engineer building AI products and business automation for sales, lead generation and operations.';
    if(persist){try{localStorage.setItem('portfolio-language',lang);}catch(error){}}
  }
  switchButtons.forEach(function(button){button.addEventListener('click',function(){setLanguage(button.dataset.lang,true);});});
  var storedLanguage='ru';
  try{storedLanguage=localStorage.getItem('portfolio-language')||'ru';}catch(error){}
  setLanguage(storedLanguage,false);

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
