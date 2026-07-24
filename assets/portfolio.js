(function(){
  'use strict';
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(!reduced&&fine){
    document.querySelectorAll('[data-tilt]').forEach(function(card){
      var frame=0;
      var current={x:0,y:0,lx:50,ly:24,energy:0};
      var target={x:0,y:0,lx:50,ly:24,energy:0};
      function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
      function render(){
        current.x+=(target.x-current.x)*.075;
        current.y+=(target.y-current.y)*.075;
        current.lx+=(target.lx-current.lx)*.07;
        current.ly+=(target.ly-current.ly)*.07;
        current.energy+=(target.energy-current.energy)*.06;
        card.style.setProperty('--lx',current.lx+'%');
        card.style.setProperty('--ly',current.ly+'%');
        card.style.setProperty('--energy',current.energy);
        card.style.setProperty('--px',(current.x*1.05)+'px');
        card.style.setProperty('--py',(current.y*.85)+'px');
        card.style.setProperty('--npx',(-current.x*.54)+'px');
        card.style.setProperty('--npy',(-current.y*.42)+'px');
        card.style.transform='perspective(1200px) rotateX('+(-current.y)+'deg) rotateY('+current.x+'deg) translate3d(0,'+(-2-current.energy*2)+'px,0)';
        if(Math.abs(target.x-current.x)>.01||Math.abs(target.y-current.y)>.01||Math.abs(target.lx-current.lx)>.05||Math.abs(target.ly-current.ly)>.05||Math.abs(target.energy-current.energy)>.01){
          frame=requestAnimationFrame(render);
        }else{frame=0;}
      }
      function start(){if(!frame)frame=requestAnimationFrame(render);}
      card.addEventListener('pointermove',function(event){
        var rect=card.getBoundingClientRect();
        var nx=clamp((event.clientX-rect.left)/rect.width,.12,.88);
        var ny=clamp((event.clientY-rect.top)/rect.height,.16,.84);
        target.x=clamp((nx-.5)*9,-4.5,4.5);
        target.y=clamp((ny-.5)*7,-3.5,3.5);
        target.lx=clamp(nx*100,18,82);
        target.ly=clamp(ny*100,15,72);
        target.energy=.92;
        start();
      });
      card.addEventListener('pointerleave',function(){
        target.x=0;target.y=0;target.lx=50;target.ly=24;target.energy=0;start();
      });
    });
  }

  var copy=[
    ['К содержанию','Skip to content'],
    ['Продукты','Products'],['Работы','Work'],['Контакт','Contact'],['Обсудить задачу','Discuss a project'],
    ['AI Product Engineer · Kazakhstan','AI Product Engineer · Kazakhstan'],
    ['Я — Idris Dabyl. Проектирую и собираю AI-инструменты для продаж, поиска клиентов и автоматизации бизнеса — от продуктовой логики до надёжного запуска.','I’m Idris Dabyl. I design and build AI tools for sales, lead generation and business automation — from product logic to a reliable launch.'],
    ['Смотреть продукты','Explore products'],['флагманских продукта','flagship products'],['проектов в лаборатории','projects in the lab'],['Полный цикл','Full cycle'],['идея → код → запуск','idea → code → launch'],
    ['Avito · с участием оператора','Avito · assist-first'],['Покупатель спрашивает о цене','Buyer asks about the price'],['Ответ собран по карточке','Answer grounded in the listing'],['Готово к проверке оператора','Ready for operator review'],['Безопасный режим рекомендаций','Safe recommendation mode'],['Открыть кейс →','Open case →'],
    ['Telegram · квалификация','Telegram · qualification'],['Новый запрос','New request'],['Нужен разработчик Telegram-бота…','Looking for a Telegram bot developer…'],['Готов к закрытому пилоту','Ready for a closed pilot'],
    ['Основные продукты','Core products'],['Не концепты. Системы с реальной логикой и честными границами.','Not concepts. Systems with real logic and honest boundaries.'],
    ['01 / AI-ПРОДАЖИ','01 / AI SALES'],['AI-продавец для входящих чатов Авито','AI salesperson for inbound Avito chats'],['Принимает официальный Messenger webhook, отвечает только по данным объявления, квалифицирует покупателя и передаёт владельцу горячий лид или сложный вопрос.','Receives official Messenger webhooks, answers only from listing data, qualifies buyers and hands hot leads or complex questions to the owner.'],
    ['Контролируемая автоматизация','Controlled automation'],['Assist-режим: оператор подтверждает ответ перед отправкой.','Assist mode: an operator approves each answer before it is sent.'],['Надёжный поток сообщений','Reliable message flow'],['Очередь, SQLite-восстановление и защита от дублей.','Queueing, SQLite recovery and duplicate protection.'],['Официальная интеграция','Official integration'],['OAuth и Messenger API без парсинга закрытых данных.','OAuth and Messenger API without scraping private data.'],
    ['Статус:','Status:'],['MVP подготовлен к пилоту; для боевой проверки нужны доступ к Messenger API и реальный аккаунт пилота.','The MVP is pilot-ready; live validation requires Messenger API access and a real pilot account.'],
    ['Рабочее место оператора','Operator workspace'],['Диалоги','Conversations'],['Входящий запрос · Кофемашина','Inbound request · Coffee machine'],['Добрый день! Сколько стоит выезд и когда сможете приехать?','Hello! How much is a call-out and when can you come?'],['AI-черновик · высокая уверенность','AI draft · high confidence'],['Здравствуйте! Диагностика входит в стоимость ремонта. Подскажите модель кофемашины и ваш район?','Hello! Diagnostics are included in the repair price. What is your coffee machine model and area?'],['Подтвердить','Approve'],['Изменить','Edit'],['Намерение: ремонт','Intent: repair'],['Тёплый лид','Warm lead'],
    ['02 / АНАЛИТИКА ЛИДОВ','02 / LEAD INTELLIGENCE'],['Мониторинг и квалификация лидов в Telegram','Telegram lead monitoring and qualification'],['Читает выбранные публичные источники через отдельный аккаунт-наблюдатель, отсеивает шум и отправляет владельцу интерактивные карточки релевантных запросов.','Reads selected public sources through a dedicated observer account, filters noise and sends the owner interactive cards for relevant requests.'],
    ['Централизованный мониторинг','Centralized monitoring'],['Выбранные публичные источники без вступления клиента в десятки групп.','Selected public sources without making the client join dozens of groups.'],['Двухэтапный фильтр','Two-stage filter'],['Быстрый префильтр, затем AI-классификация и уверенность.','Fast prefilter, then AI classification and confidence.'],['Быстрый prefilter, затем AI-классификация и confidence.','Fast prefilter, then AI classification and confidence.'],['Петля обратной связи','Feedback loop'],['👍/👎, причина ошибки и простая воронка прямо в Telegram.','👍/👎, error reason and a simple funnel directly in Telegram.'],['технически готов к закрытому семидневному пилоту; это ещё не self-service SaaS.','technically ready for a closed seven-day pilot; this is not yet a self-service SaaS.'],
    ['Поток лидов','Lead stream'],['12 источников','12 sources'],['префильтр активен','prefilter active'],['без дублей','no duplicates'],['Новый запрос · 2 мин','New request · 2 min'],['Ищу разработчика AI-бота для квалификации заявок','Looking for an AI bot developer to qualify requests'],['Есть текущий процесс в Telegram, нужна автоматизация и передача тёплых лидов менеджеру.','There is an existing Telegram workflow; we need automation and warm-lead handoff to a manager.'],['👍 Подтвердить','👍 Confirm'],['Черновик ответа','Reply draft'],['В работу','In progress'],['сбор → фильтр → AI → карточка → обратная связь','collect → filter → AI → card → feedback'],
    ['Лаборатория продуктов','Product lab'],['Лаборатория, где проверяю широту инженерного подхода.','A lab where I test the breadth of my engineering approach.'],['Вторичный каталог: интерфейсы, агенты, боты и мобильные прототипы. Эти работы показывают диапазон, но не подменяют два продуктовых кейса выше.','A secondary catalogue of interfaces, agents, bots and mobile prototypes. These show breadth without competing with the two product cases above.'],
    ['Лендинга','Landing pages'],['AI-агентов','AI agents'],['Telegram-ботов','Telegram bots'],['Мобильных приложений','Mobile apps'],['Использование инструментов · RAG · FastAPI','Tool use · RAG · FastAPI'],['aiogram · FSM · интеграции','aiogram · FSM · integrations'],
    ['Лендинг · демо','Landing · demo'],['AI-интерфейс · демо','AI interface · demo'],['Мобильное · прототип','Mobile · prototype'],['Продуктовый опыт на Three.js ↗','Three.js product experience ↗'],['Интерфейс ресторана ↗','Restaurant experience ↗'],['Ассистент с базой знаний ↗','Knowledge-base assistant ↗'],['От данных к выводам ↗','Data-to-insight workflow ↗'],['Трекер финансов ↗','Finance tracker ↗'],['Прогресс тренировок ↗','Fitness progress app ↗'],
    ['Открыть полный каталог','Open full catalogue'],['49 проектов','49 projects'],['Лендинги · 22','Landing pages · 22'],['AI-агенты · 10','AI agents · 10'],['Telegram-боты · 12','Telegram bots · 12'],['Мобильные · 5','Mobile · 5'],['Support-бот отмечен в исходном проекте как production.','The Support bot is marked as production in the source project.'],['React Native / Expo прототипы.','React Native / Expo prototypes.'],
    ['Есть процесс, который пора превратить в продукт?','Have a process that should become a product?'],['Опишите задачу коротко: где теряется время, лиды или качество. Я отвечу предметно — что можно собрать, где риски и с чего начать.','Describe the problem briefly: where time, leads or quality are lost. I’ll respond concretely — what can be built, the risks, and where to start.'],['Написать в Telegram','Message on Telegram'],['Наверх ↑','Back to top ↑'],['AI-продукты · автоматизация · разработка','AI products · automation · engineering']
  ];
  var aliases={
    'Full cycle':'Полный цикл','Avito · assist-first':'Avito · с участием оператора','Telegram · qualification':'Telegram · квалификация',
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
