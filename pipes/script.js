'use strict';



var levelPack;



function goAhead() {



  var blankLS = [];
  for ( var l = 0; l < levelPack.length-1; l++ ) {
    blankLS[l] = null;
  }
  if ( localStorage.getItem('krglPipes') === null ) {
    localStorage.setItem('krglPipes',JSON.stringify(blankLS));
  }
  function clearPlayerData() {
    const LSArr = JSON.parse(localStorage.krglPipes);
    var isLSBlank = true;
    for ( var i = 0; i < LSArr.length; i++ ) {
      if ( LSArr[i] !== null ) {
        isLSBlank = false;
        break;
      }
    }
    if ( isLSBlank === true ) {
      alert('Нет данных для удаления.');
    }
    else {
      const answer = confirm('Информация о пройденных вами уровнях будет удалена из локального хранилища. Продолжить?');
      if ( answer === true ) {
        localStorage.krglPipes = JSON.stringify(blankLS);
        alert('Данные удалены.');
      }
    }
  }



  const main = document.querySelector('main');
  const bg = document.getElementById('anim_bg');

  var prevPage = null;
  var currPage;
  var level;

  var logo;
  var menu;
  var header;
  var levelsTable;
  var levelsTableCells;
  var playfield;
  var navBar;
  var statusBar;
  var bars;
  var modal;
  var modalBd;
  var soundSwitch;
  var aboutText;

  var field;
  var gridSize;
  var cellSize;
  var pipeWidth;
  var autoBuild;
  var paths;
  var builtPipes;
  var totalPipes;
  var fieldCoverage;
  var dotlessCellsNum;
  var coveredCellPercentage;
  var counters;
  var s;

  const clickSound = new Audio();
  clickSound.src = 'audio/click.mp3';
  const pipeDestrSound = new Audio();
  pipeDestrSound.src = 'audio/pipe-destroyed.mp3';
  const almostSound = new Audio();
  almostSound.src = 'audio/almost-there.mp3';
  const completeSound = new Audio();
  completeSound.src = 'audio/level-complete.mp3';
  const completeAllSound = new Audio();
  completeAllSound.src = 'audio/all-levels-complete.mp3';

  var soundOff = false;
  function fSoundSwitch() {
    if ( soundOff === false ) {
      soundOff = true;
      soundSwitch.textContent = 'включить звук';
    }
    else {
      soundOff = false;
      soundSwitch.textContent = 'выключить звук';
    }
  }
  function playAudio(eo) {
    if ( soundOff === false ) {
      const soundToPlay = eo.target.getAttribute('data-sound');
      if ( soundToPlay === 'click' ) {
        clickSound.play();
      }
      else if ( soundToPlay === 'pipe-destroyed' ) {
        pipeDestrSound.play();
      }
    }
  }
  main.addEventListener('pointerdown',playAudio,false);

  function wrapEverySymbol(tag,str) {
    var wrappedStr = '';
    for ( var s = 0; s < str.length; s++ ) {
      if ( str[s] === ' ' ) {
        wrappedStr += ' ';
      }
      else {
        wrappedStr += `<${tag}>${str[s]}</${tag}>`;
      }
    }
    return wrappedStr;
  }

  function showElems(arr) {
    arr.forEach(
      function(elem) {
        elem.style.opacity = '0';
        elem.style.transitionDuration = '400ms';
        main.appendChild(elem);
      }
    );
    if ( currPage === 'levels' ) {
      levelsTableCells = [...document.querySelectorAll('#levels_table li a')];
    }
    else if ( currPage === 'level' ) {
      bars = {
        selves: [...document.querySelectorAll('.bar')],
        wrappers: [...document.querySelectorAll('.bar article')],
        titles: [...document.querySelectorAll('.bar article p:nth-of-type(2n+1)')],
        values: [...document.querySelectorAll('.bar article p:nth-of-type(2)')],
        buttons: [...document.querySelectorAll('.bar a')]
      };
      field = [ document.getElementById('field') ];
      autoBuild = false;
      paths = {};
      builtPipes = 0;
      totalPipes = 0;
      fieldCoverage = 0;
      counters = {
        builtPipes: document.getElementById('builtPipesCounter'),
        totalPipes: document.getElementById('totalPipesCounter'),
        fieldCoverage: document.getElementById('fieldCoverageCounter'),
      };
      buildField(levelPack[level]);
      s = {
        startColor: null,
        startNum: null,
        endColor: null,
        endNum: null,
        dotsConnected: false,

        pipeColor: null,
        pipeEntangled: false,
        pipesIntersect: false,

        refresh: function() {
          for ( var k in this ) {
            if ( k === 'refresh' ) continue;
            else if (
              k === 'pipeEntangled' ||
              k === 'pipesIntersect' ||
              k === 'dotsConnected'
            ) this[k] = false;
            else this[k] = null;
          }
        }
      };
      bars.buttons[2].addEventListener('click',clearField,false);
    }
    else if ( currPage === 'settings' ) {
      soundSwitch = document.getElementById('sound_switch');
      soundSwitch.addEventListener('click',fSoundSwitch,false);
      document.getElementById('clear_data').addEventListener('click',clearPlayerData,false);
    }
    if ( prevPage !== null ) {
      updateSizes();
      titleChanged();
    }
    const delay1 = setTimeout( function() {
      arr.forEach( elem => {
        elem.style.opacity = '100%'
        clearTimeout(delay1);
      } );
    }, 200 );
    const delay2 = setTimeout( function() {
      arr.forEach( elem => {
        elem.style.removeProperty('opacity');
        elem.style.removeProperty('transition-duration');
        clearTimeout(delay2);
      } );
    }, 1000 );
  }

  function hideElems(arr) {
    arr.forEach( function(item) {
      item.remove();
    } );
  }

  function updatePage() {
    const hash = window.location.hash.substr(1).split('_');
    currPage = hash[0];
    if ( currPage === 'level' ) {
      level = Number(hash[1]);
      main.style.removeProperty('align-items');
      main.style.removeProperty('justify-content');
      main.style.removeProperty('flex-direction');
      main.style.display = 'grid';
    }
    else {
      main.style.display = 'flex';
      main.style.flexDirection = 'column';
      main.style.justifyContent = 'center';
      main.style.alignItems = 'center';
    }
    switch ( prevPage ) {
      case null:
        break;
      case '':
      case 'main':
        hideElems([logo, menu]);
        break;
      case 'levels':
        hideElems([header, levelsTable]);
        break;
      case 'level':
        bars.buttons[2].removeEventListener('click',clearField,false);
        hideElems([header, playfield, navBar, statusBar, modal, modalBd]);
        break;
      case 'settings':
        hideElems([header, menu]);
        break;
      case 'about':
        hideElems([header, aboutText]);
        break;
    }
    switch ( currPage ) {

      case '':

      case 'main':

        logo = document.createElement('h1');
        logo.setAttribute('id','anim_title');
        logo.innerHTML = wrapEverySymbol('span','pipes');

        menu = document.createElement('ul');
        menu.setAttribute('id','menu');
        menu.innerHTML = '<li><a data-sound="click" class="button" href="#levels">играть<span> &gt;</span></a></li>' +
          '<li><a data-sound="click" class="button" href="#settings">параметры<span> &gt;</span></a></li>' +
          '<li><a data-sound="click" class="button" href="#about">об игре<span> &gt;</span></a></li>';

        showElems([logo, menu]);

        break;

      case 'levels':

        header = document.createElement('header');
        header.innerHTML = '<a data-sound="click" href="#main">&lt;</a>' +
          `<h2 id="anim_title">${wrapEverySymbol('span','выберите уровень')}</h2>` +
          '<a style="visibility: hidden">&gt;</a>';

        levelsTable = document.createElement('ol');
        levelsTable.setAttribute('id','levels_table');
        var levelsTableIH = '';
        const LSArr = JSON.parse(localStorage.krglPipes);
        for ( var l = 0; l < levelPack.length-1; l++ ) {
          if ( LSArr[l] !== null ) {
            levelsTableIH += `<li><a data-sound="click" style="background-image: url('star.svg')" href="#level_${l+1}">${l+1}</a></li>`;
          }
          else {
            levelsTableIH += `<li><a data-sound="click" href="#level_${l+1}">${l+1}</a></li>`;
          }
        }
        levelsTable.innerHTML = levelsTableIH;

        showElems([header, levelsTable]);

        break;

      case 'level':

        header = document.createElement('header');
        var headerIH;
        var lastLevelNum = levelPack.length-1;
        if ( level === 1 ) {
          headerIH = '<a style="visibility: hidden">&lt;</a>' +
          '<h2>уровень 1</h2>' +
          '<a data-sound="click" href="#level_2" title="следующий уровень">&gt;</a>';
        }
        else if ( level === lastLevelNum ) {
          headerIH = `<a data-sound="click" href="#level_${String(level-1)}" title="предыдущий уровень">&lt;</a>` +
          `<h2>уровень ${String(level)}</h2>` +
          '<a style="visibility: hidden">&gt;</a>';
        }
        else {
          headerIH = `<a data-sound="click" href="#level_${String(level-1)}" title="предыдущий уровень">&lt;</a>` +
          `<h2>уровень ${String(level)}</h2>` +
          `<a data-sound="click" href="#level_${String(level+1)}" title="следующий уровень">&gt;</a>`;
        }
        header.innerHTML = headerIH;

        playfield = document.createElementNS('http://www.w3.org/2000/svg','svg');
        playfield.setAttribute('id','field');

        navBar = document.createElement('section');
        navBar.setAttribute('class','bar');
        navBar.innerHTML = '<article><a data-sound="click" class="button" href="#levels">все уровни</a></article>' +
          '<article><a data-sound="click" class="button" href="#main">главное меню</a></article>';

        statusBar = document.createElement('section');
        statusBar.setAttribute('class','bar');
        statusBar.innerHTML = '<article><p>построено</p><p><span id="builtPipesCounter">0</span>&sol;<span id="totalPipesCounter"></span></p><p>труб</p></article>' +
          '<article><p>покрыто</p><p><span id="fieldCoverageCounter">0</span>&sol;<span>100</span></p><p>% поля</p></article>' +
          '<article><a data-sound="pipe-destroyed" class="button destr">сбросить</a></article>';

        modal = document.createElement('section');
        modal.setAttribute('id','dialog');
        main.appendChild(modal);

        modalBd = document.createElement('div');
        modalBd.setAttribute('id','backdrop');
        main.appendChild(modalBd);

        showElems([header, playfield, navBar, statusBar]);

        break;

      case 'settings':

        header = document.createElement('header');
        header.style.gridTemplateColumns = '1fr auto 1fr';
        header.innerHTML = '<a data-sound="click" href="#main" style="justify-self: end">&lt;</a>' +
          `<h2 id="anim_title">${wrapEverySymbol('span','параметры')}</h2>` +
          '<a style="visibility: hidden">&gt;</a>';

        menu = document.createElement('ul');
        menu.setAttribute('id','menu');
        menu.innerHTML = `<li><a data-sound="click" class="button" id="sound_switch">${soundOff?'включить':'выключить'} звук</a></li>` +
          '<li><a data-sound="click" class="button destr" id="clear_data">сбросить данные</a></li>';

        showElems([header, menu]);

        break;

      case 'about':

        header = document.createElement('header');
        header.style.gridTemplateColumns = '1fr auto 1fr';
        header.innerHTML = '<a data-sound="click" href="#main" style="justify-self: end">&lt;</a>' +
          `<h2 id="anim_title">${wrapEverySymbol('span','об игре')}</h2>` +
          '<a style="visibility: hidden">&gt;</a>';

        aboutText = document.createElement('section');
        aboutText.style.cssText = 'display: flex; flex-direction: column; overflow-x: hidden; overflow-y: auto';
        aboutText.innerHTML = '<article id="how_to_play">' +
          '<p>Цель игрока – соединить точки одного цвета друг с другом. Нажмите на точку и потяните, чтобы начать строить трубу; отпустите, чтобы прекратить. Труба не может пересекать саму себя и соединять точки разных цветов. Если труба пересекает другую трубу, пересекаемая труба разрушается.</p>' +
          '<p>Уровень засчитывается как пройденный, когда все точки одного цвета соединены друг с другом и на поле нет ни одной пустой клетки.</p>' +
          '</article>' +
          '<article id="about_project">' +
          '<p>Этот проект вдохновлён игрой <a href="https://www.bigduckgames.com/flowfree" target="_blank">Flow Free</a> – творением Big Duck Games.</p><br>' +
          '<p><a>Стёпин Сергей</a> | ноябрь 2022 г.</p>' +
          '</article>';

        showElems([header, aboutText]);

        break;

    }
    prevPage = currPage;
  }
  updatePage();
  window.onhashchange = updatePage;

  function returnToField() {
    modalBd.style.pointerEvents = 'none';
    modalBd.style.opacity = '0';
    modal.style.opacity = '0';
    modal.style.top = '150%';
    const delay3 = setTimeout( function() {
      modal.innerHTML = '';
      titleChanged();
      clearTimeout(delay3);
    }, 1000 );
  }

  function levelEnd() {
    if ( Math.round(fieldCoverage) < 100 ) {
      if ( soundOff === false ) {
        almostSound.play();
      }
      modal.innerHTML = `<h3 id="anim_title">${wrapEverySymbol('span','Вы почти у цели!')}</h3>` +
        '<p>Заполните трубой каждую клетку, чтобы пройти уровень.</p>' +
        '<a data-sound="click" class="button" id="return_button">вернуться на поле</a>';
    }
    else if ( Math.round(fieldCoverage) === 100 ) {
      var LSArr = JSON.parse(localStorage.krglPipes);
      LSArr[level-1] = paths;
      localStorage.krglPipes = JSON.stringify(LSArr);
      var isPackBeaten = true;
      for ( var j = 0; j < LSArr.length; j++ ) {
        if ( LSArr[j] === null ) {
          isPackBeaten = false;
          break;
        }
      }
      if ( isPackBeaten === true ) {
        if ( soundOff === false ) {
          completeAllSound.play();
        }
        modal.innerHTML = `<h3 id="anim_title">${wrapEverySymbol('span','Вы прошли все уровни!')}</h3>` +
          '<a data-sound="click" href="#main" class="button">главное меню</a>' +
          '<a data-sound="click" class="button" id="return_button">вернуться на поле</a>';
      }
      else if ( level === levelPack.length-1 && isPackBeaten === false ) {
        if ( soundOff === false ) {
          completeSound.play();
        }
        modal.innerHTML = `<h3 id="anim_title">${wrapEverySymbol('span','Уровень пройден!')}</h3>` +
          '<p>Это был последний, но есть ещё уровни, которые вы не прошли. Перейдите к списку всех уровней и выберите тот, что не помечен звёздочкой.</p>' +
          '<a data-sound="click" href="#levels" class="button">все уровни</a>' +
          '<a data-sound="click" class="button" id="return_button">вернуться на поле</a>';
      }
      else {
        if ( soundOff === false ) {
          completeSound.play();
        }
        modal.innerHTML = `<h3 id="anim_title">${wrapEverySymbol('span','Уровень пройден!')}</h3>` +
          `<a data-sound="click" href="#level_${String(level+1)}" class="button">следующий</a>` +
          '<a data-sound="click" class="button" id="return_button">вернуться на поле</a>';
      }
    }
    document.getElementById('return_button').addEventListener('click',returnToField,{once:true});
    titleChanged();
    modalBd.style.pointerEvents = 'all';
    modalBd.style.opacity = '100%';
    modal.style.opacity = '100%';
    modal.style.top = '50%';
  }



  var titleClrs = ['cyan', 'yellow', 'lime', 'blueviolet', 'magenta'];
  var titleLtrs = {};
  function titleChanged() {
    for ( var i = 0; i < titleClrs.length; i++ ) {
      titleLtrs[String(i)] = [...document.querySelectorAll(`#anim_title span:nth-of-type(${titleClrs.length}n+${i+1})`)];
    }
  }
  titleChanged();
  function updateTitle() {
    const lastColor = titleClrs.pop();
    titleClrs.unshift(lastColor);
    for ( var k in titleLtrs ) {
      titleLtrs[k].forEach(
        function(item) {
          item.style.color = titleClrs[Number(k)];
        }
      );
    }
  }
  updateTitle();
  setInterval(updateTitle,667);



  function updateSizes() {

    const viewPortWidth = window.innerWidth;
    const viewPortHeight = window.innerHeight;
    var shorterSide;
    var longerSide;
    var bgPosX;
    var bgPosY;

    document.body.style.height = `${viewPortHeight}px`;

    if ( viewPortWidth >= viewPortHeight ) {
      shorterSide = viewPortHeight;
      longerSide = viewPortWidth;
      bgPosX = 0;
      bgPosY = -(longerSide-shorterSide)/2;
    }
    else {
      shorterSide = viewPortWidth;
      longerSide = viewPortHeight;
      bgPosX = -(longerSide-shorterSide)/2;
      bgPosY = 0;
    }

    bg.style.width = `${longerSide}px`;
    bg.style.height = `${longerSide}px`;
    bg.style.left = `${bgPosX}px`;
    bg.style.top = `${bgPosY}px`;

    const gapSize = Math.round(viewPortWidth/75);

    const fontSize1 = Math.floor(shorterSide/5);
    const fontSize2 = Math.floor(shorterSide/10);
    const fontSize3 = Math.ceil(shorterSide/15);
    const fontSize4 = Math.ceil(shorterSide/25);
    const fontSize5 = Math.ceil(shorterSide/30);

    if ( currPage === '' || currPage === 'main' ) {
      const offset = Math.round(fontSize1/3);
      logo.style.fontSize = `${fontSize1}px`;
      logo.style.paddingBottom = `${offset}px`;
      menu.style.paddingBottom = `${offset}px`;
      menu.style.fontSize = `${fontSize3}px`;
    }
    else if ( currPage === 'level' ) {
      var fieldSize;
      const ratio = viewPortHeight/viewPortWidth;
      if ( ratio < 0.6133 ) {
        fieldSize = Math.floor(viewPortHeight/1.2);
        main.style.gridTemplate = '1fr auto auto 4fr / 1fr auto 1fr';
        main.style.gap = `${gapSize}px 0`;
        playfield.style.gridArea = '3 / 2 / 4 / 3';
        navBar.style.gridArea = '1 / 1 / 5 / 2';
        statusBar.style.gridArea = '1 / 3 / 5 / 4';
        bars.selves.forEach( function(item) {
          item.style.width = `${Math.ceil(fontSize4*6.67)}px`;
          item.style.flexDirection = 'column';
          item.style.justifyContent = 'center';
        } );
        bars.wrappers[1].style.order = '2';
        modal.style.width = `${viewPortWidth-gapSize*12}px`;
      }
      else {
        if ( ratio > 1.26 ) {
          fieldSize = viewPortWidth - gapSize*6;
        }
        else {
          fieldSize = Math.floor(viewPortHeight/1.59);
        }
        main.style.gridTemplate = '1fr auto auto auto auto 1fr / 1fr auto 1fr';
        main.style.gap = `${gapSize}px ${gapSize*3}px`;
        playfield.style.gridArea = '4 / 2 / 5 / 3';
        navBar.style.gridArea = '5 / 2 / 6 / 3';
        statusBar.style.gridArea = '3 / 2 / 4 / 3';
        bars.selves.forEach( function(item) {
          item.style.width = `${fieldSize}px`;
          item.style.flexDirection = 'row';
          item.style.justifyContent = 'space-between';
        } );
        bars.wrappers[1].style.order = '-1';
        modal.style.width = `${fieldSize}px`;
      }
      header.style.gridArea = '2 / 2 / 3 / 3';
      header.style.width = `${fieldSize}px`;
      header.style.fontSize = `${fontSize3}px`;
      playfield.style.borderWidth = `${Math.ceil(fontSize3/10)}px`;
      playfield.style.width = `${fieldSize}px`;
      playfield.style.height = `${fieldSize}px`;
      bars.selves.forEach( function(item) {
        item.style.gap = `${gapSize*2}px`;
      } );
      bars.titles.forEach( function(item) {
        item.style.fontSize = `${fontSize5}px`;
      } );
      bars.values.forEach( function(item) {
        item.style.fontSize = `${fontSize4}px`;
      } );
      bars.buttons.forEach( function(item) {
        item.style.fontSize = `${fontSize4}px`;
      } );
      modal.style.padding = `${gapSize*3}px`;
      modal.style.fontSize = `${fontSize4}px`;
      modalBd.style.backdropFilter = `blur(${shorterSide/40}px)`;
    }
    else if ( currPage === 'about' ) {
      header.style.padding = `${gapSize*3}px ${gapSize*6}px`;
      header.style.fontSize = `${fontSize2}px`;
      aboutText.style.margin = `0 ${gapSize*6}px ${gapSize*3}px`;
      aboutText.style.gap = `${gapSize*3}px`;
      aboutText.style.fontSize = `${fontSize4}px`;
    }
    else {
      header.style.padding = `${gapSize*3}px`;
      header.style.fontSize = `${fontSize2}px`;
    }

    if ( currPage === 'levels' ) {
      var cellsPerRow = Math.round(viewPortWidth/75);
      if ( viewPortWidth >= viewPortHeight && cellsPerRow > 10 ) {
        cellsPerRow = 10;
      }
      else if ( viewPortWidth < viewPortHeight && cellsPerRow > 7 ) {
        cellsPerRow = 7;
      }
      const cellSize = Math.round((viewPortWidth - ((cellsPerRow+5) * gapSize)) / cellsPerRow);
      levelsTable.style.marginBottom = `${gapSize*3}px`;
      levelsTable.style.gridTemplate = `repeat(auto-fill, ${cellSize}px) / repeat(${cellsPerRow}, ${cellSize}px)`;
      levelsTable.style.gap = `${gapSize}px`;
      levelsTableCells.forEach(
        function(cell) {
          cell.style.height = `${cellSize}px`;
          cell.style.fontSize = `${cellSize/2.25}px`;
        }
      );
    }

    if ( currPage === 'settings' ) {
      menu.style.fontSize = `${fontSize3}px`;
    }

  }
  updateSizes();
  window.onresize = updateSizes;



  var bgPipes = [];
  const bgPipeSpeed = 1;
  const bgPipeWidth = 6;
  const bgPipeClrs = [
    'red', 'orange', 'yellow',
    'green', 'lime', 'cyan',
    'blue', 'blueviolet', 'magenta'
  ];

  function getNumber(min,max) {
    const num = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(num);
  }

  function newBgPipe() {
    const dirNum = getNumber(1,4);
    const start = getNumber(20,80);
    const length = getNumber(40,80);
    var dir;
    var startX1;
    var startX2;
    var endX1;
    var endX2;
    var startY1;
    var startY2;
    var endY1;
    var endY2;
    switch ( dirNum ) {
      case 1:
        dir = 'to_bottom';
        startX2 = start;
        startX1 = startX2;
        endX1 = startX2;
        endX2 = endX1;
        startY2 = -bgPipeWidth/2;
        startY1 = startY2 - length;
        endY1 = 100 + bgPipeWidth/2;
        endY2 = endY1 + length;
        break;
      case 2:
        dir = 'to_left';
        startY1 = start;
        startY2 = startY1;
        endY2 = startY1;
        endY1 = endY2;
        startX1 = 100 + bgPipeWidth/2;
        startX2 = startX1 + length;
        endX2 = -bgPipeWidth/2;
        endX1 = endX2 - length;
        break;
      case 3:
        dir = 'to_top';
        startX1 = start;
        startX2 = startX1;
        endX2 = startX1;
        endX1 = endX2;
        startY1 = 100 + bgPipeWidth/2;
        startY2 = startY1 + length;
        endY2 = -bgPipeWidth/2;
        endY1 = endY2 - length;
        break;
      case 4:
        dir = 'to_right';
        startY2 = start;
        startY1 = startY2;
        endY1 = startY2;
        endY2 = endY1;
        startX2 = -bgPipeWidth/2;
        startX1 = startX2 - length;
        endX1 = 100 + bgPipeWidth/2;
        endX2 = endX1 + length;
        break;
    }
    const clrNum = getNumber(0,8);
    const clr = bgPipeClrs[clrNum];
    const bgPipe = document.createElementNS('http://www.w3.org/2000/svg','line');
    bgPipes.push({pipe: bgPipe, dir: dir, endX1: endX1, endY1: endY1, endX2: endX2, endY2: endY2});
    bg.appendChild(bgPipe);
    bgPipe.setAttribute('class',`anim_bg-pipe`);
    bgPipe.setAttribute('x1',`${startX1}%`);
    bgPipe.setAttribute('y1',`${startY1}%`);
    bgPipe.setAttribute('x2',`${startX2}%`);
    bgPipe.setAttribute('y2',`${startY2}%`);
    bgPipe.setAttribute('stroke',clr);
    bgPipe.setAttribute('stroke-width',`${bgPipeWidth}%`);
  }

  for ( var n = 0; n < 6; n++ ) {
    newBgPipe();
  }

  function moveBgPipes() {
    for ( var p = 0; p < bgPipes.length; p++ ) {
      const pipe = bgPipes[p].pipe;
      const dir = bgPipes[p].dir;
      const currX1 = parseInt(pipe.getAttribute('x1'));
      const currX2 = parseInt(pipe.getAttribute('x2'));
      const endX1 = bgPipes[p].endX1;
      const endX2 = bgPipes[p].endX2;
      const currY1 = parseInt(pipe.getAttribute('y1'));
      const currY2 = parseInt(pipe.getAttribute('y2'));
      const endY1 = bgPipes[p].endY1;
      const endY2 = bgPipes[p].endY2;
      function removeBgPipe() {
        pipe.remove();
        bgPipes.splice(p,1);
        newBgPipe();
      }
      switch ( dir ) {
        case 'to_bottom':
          if ( currY1 === endY1 && currY2 === endY2 ) {
            removeBgPipe();
          }
          else {
            pipe.setAttribute('y1',`${currY1 + bgPipeSpeed}%`);
            pipe.setAttribute('y2',`${currY2 + bgPipeSpeed}%`);
          }
          break;
        case 'to_left':
          if ( currX1 === endX1 && currX2 === endX2 ) {
            removeBgPipe();
          }
          else {
            pipe.setAttribute('x1',`${currX1 - bgPipeSpeed}%`);
            pipe.setAttribute('x2',`${currX2 - bgPipeSpeed}%`);
          }
          break;
        case 'to_top':
          if ( currY1 === endY1 && currY2 === endY2 ) {
            removeBgPipe();
          }
          else {
            pipe.setAttribute('y1',`${currY1 - bgPipeSpeed}%`);
            pipe.setAttribute('y2',`${currY2 - bgPipeSpeed}%`);
          }
          break;
        case 'to_right':
          if ( currX1 === endX1 && currX2 === endX2 ) {
            removeBgPipe();
          }
          else {
            pipe.setAttribute('x1',`${currX1 + bgPipeSpeed}%`);
            pipe.setAttribute('x2',`${currX2 + bgPipeSpeed}%`);
          }
          break;
      }
    }
  }
  setInterval(moveBgPipes,67);



  function darken(clr) {
    switch ( clr ) {
      case 'red':
        return 'rgb(64,0,0)';
      case 'orange':
        return 'rgb(64,41,0)';
      case 'yellow':
        return 'rgb(64,64,0)';
      case 'green':
        return 'rgb(0,32,0)';
      case 'lime':
        return 'rgb(0,64,0)';
      case 'cyan':
        return 'rgb(0,64,64)';
      case 'blue':
        return 'rgb(0,0,64)';
      case 'blueviolet':
        return 'rgb(34,11,56)';
      case 'magenta':
        return 'rgb(64,0,64)';
      default:
        console.log('Неизвестный цвет');
        return 'black';
    }
  }

  function changePathCells(act,clr) {
    const path = paths[clr];
    var color;
    switch ( act ) {
      case 'colorize':
        color = darken(clr);
        break;
      case 'discolor':
        color = 'black';
        break;
      default:
        console.log('Неверно указано действие!');
        return;
    }
    for ( var i = 0; i < path.length; i++ ) {
      const row = path[i].r;
      const col = path[i].c;
      const cellId = `cell-${row}_${col}`;
      const cell = document.querySelector(`#${cellId} rect`);
      cell.style.fill = color;
    }
  }

  function buildPipePiece(fromRow,fromCol,toRow,toCol,clr) {
    const x1 = cellSize/2 + cellSize*(fromCol-1);
    const y1 = cellSize/2 + cellSize*(fromRow-1);
    const x2 = cellSize/2 + cellSize*(toCol-1);
    const y2 = cellSize/2 + cellSize*(toRow-1);
    const pipePiece = document.createElementNS('http://www.w3.org/2000/svg','line');
    field[0].appendChild(pipePiece);
    pipePiece.setAttribute('id',`pipe-from-${fromRow}_${fromCol}-to-${toRow}_${toCol}`);
    pipePiece.setAttribute('x1',`${x1}%`);
    pipePiece.setAttribute('y1',`${y1}%`);
    pipePiece.setAttribute('x2',`${x2}%`);
    pipePiece.setAttribute('y2',`${y2}%`);
    pipePiece.setAttribute('stroke',clr);
    pipePiece.setAttribute('stroke-width',`${pipeWidth}%`);
  }

  function destroyPipePiece(fromRow,fromCol,toRow,toCol) {
    const pipePieceId = `pipe-from-${fromRow}_${fromCol}-to-${toRow}_${toCol}`;
    const pipePiece = document.getElementById(pipePieceId);
    if ( pipePiece ) pipePiece.remove();
  }

  function manipulatePipe(act,clr) {
    const path = paths[clr];
    for ( var i = 0; i < path.length-1; i++ ) {
      const fromRow = path[i].r;
      const fromCol = path[i].c;
      const toRow = path[i+1].r;
      const toCol = path[i+1].c;
      switch ( act ) {
        case 'build':
          buildPipePiece(fromRow,fromCol,toRow,toCol,clr);
          break;
        case 'destroy':
          destroyPipePiece(fromRow,fromCol,toRow,toCol);
          break;
        default:
          console.log('Неверно указано действие!');
          return;
      }
    }
  }

  function notifyModel(event,clr) {
    const path = paths[clr];
    switch ( event ) {
      case 'pipeBuilt':
        for ( var i = 0; i < path.length; i++ ) {
          const row = path[i].r;
          const col = path[i].c;
          field[row][col].pipe = clr;
        }
        break;
      case 'pipeDestroyed':
        for ( var i = 0; i < path.length; i++ ) {
          const row = path[i].r;
          const col = path[i].c;
          field[row][col].pipe = null;
        }
        break;
      default:
        console.log('Неверно указано событие!');
        return;
    }
  }

  function updateCounters(event,clr) {
    const path = paths[clr];
    const percent = (path.length-2)*coveredCellPercentage;
    switch ( event ) {
      case 'pipeBuilt':
        builtPipes++;
        fieldCoverage += percent;
        break;
      case 'pipeDestroyed':
        builtPipes--;
        fieldCoverage -= percent;
        break;
      default:
        console.log('Неверно указано событие!');
        return;
    }
    counters.builtPipes.innerHTML = builtPipes;
    counters.fieldCoverage.innerHTML = Math.round(fieldCoverage);
    if ( builtPipes === totalPipes && autoBuild === false ) {
      levelEnd();
    }
  }

  function clearField() {
    for ( var k in paths ) {
      if ( paths[k].length > 1 ) {
        changePathCells('discolor',k);
        manipulatePipe('destroy',k);
        notifyModel('pipeDestroyed',k);
        updateCounters('pipeDestroyed',k);
        paths[k] = [];
      }
      else {
        continue;
      }
    }
  }

  function buildField(lvl) {

    gridSize = lvl.gridSize;
    cellSize = 100 / gridSize;
    const cellBoundWidth = cellSize / 50;
    const dotRadius = cellSize / 2.5;
    pipeWidth = cellSize / 3;

    var cellPosX = 0;
    var cellPosY = 0;

    for ( var r = 1; r <= gridSize; r++ ) {
      field[0].innerHTML += `<g id="row-${r}"></g>`;
      field[r] = [ document.getElementById(`row-${r}`) ];
      for ( var c = 1; c <= gridSize; c++ ) {
        field[r][0].innerHTML += `<g id="cell-${r}_${c}"><rect x="${cellPosX}%" y="${cellPosY}%" width="${cellSize}%" height="${cellSize}%" stroke-width="${cellBoundWidth}%"/></g>`;
        field[r][c] = { dot: [ null, null ], pipe: null };
        cellPosX += cellSize;
      }
      cellPosX = 0;
      cellPosY += cellSize;
    }

    function placeDot(clr,n) {

      const r = lvl.dots[clr][n-1].r;
      const c = lvl.dots[clr][n-1].c;
      const y = cellSize/2 + cellSize*(r-1);
      const x = cellSize/2 + cellSize*(c-1);

      const newDot = document.createElementNS('http://www.w3.org/2000/svg','circle');
      document.getElementById(`cell-${r}_${c}`).appendChild(newDot);
      newDot.setAttribute('data-dotnum',String(n));
      newDot.setAttribute('cx',`${x}%`);
      newDot.setAttribute('cy',`${y}%`);
      newDot.setAttribute('r',`${dotRadius}%`);
      newDot.setAttribute('fill',clr);
      field[r][c].dot = [ clr, n ];
      newDot.onpointerdown = beginPipe;

    }

    for ( var color in lvl.dots ) {
      paths[color] = [];
      placeDot(color,1);
      placeDot(color,2);
      totalPipes++;
    }
    counters.totalPipes.innerHTML = totalPipes;
    dotlessCellsNum = Math.pow(gridSize,2) - totalPipes*2;
    coveredCellPercentage = 100 / dotlessCellsNum;

    const savedData = JSON.parse(localStorage.krglPipes)[level-1];
    if ( savedData !== null ) {
      autoBuild = true;
      paths = savedData;
      for ( var k in paths ) {
        manipulatePipe('build',k);
        changePathCells('colorize',k);
        notifyModel('pipeBuilt',k);
        updateCounters('pipeBuilt',k);
      }
      autoBuild = false;
    }

  }

  function getNeighbors(cellId) {
    const row = Number(cellId[5]);
    const col = Number(cellId[7]);
    return {
      top: document.getElementById(`cell-${row-1}_${col}`),
      right: document.getElementById(`cell-${row}_${col+1}`),
      bottom: document.getElementById(`cell-${row+1}_${col}`),
      left: document.getElementById(`cell-${row}_${col-1}`)
    };
  }

  function getPreviousCellId(num) {
    const path = paths[s.startColor];
    const index = path.length - 1 - num;
    if ( index < 0 ) {
      return null;
    }
    else {
      const cell = path[index];
      const row = cell.r;
      const col = cell.c;
      return `cell-${row}_${col}`;
    }
  }

  function getDirection(fromCellId,toCellId) {
    const startRow = Number(fromCellId[5]);
    const startCol = Number(fromCellId[7]);
    const endRow = Number(toCellId[5]);
    const endCol = Number(toCellId[7]);
    const subtrRow = startRow - endRow;
    const subtrCol = startCol - endCol;
    if ( subtrRow === 1 ) return 'up';
    else if ( subtrCol === -1 ) return 'right';
    else if ( subtrRow === -1 ) return 'down';
    else if ( subtrCol === 1 ) return 'left';
  }

  function toggleELs(hash,except,act,event,func) {
    var arr = [];
    for ( var k in hash ) {
      if ( k !== except && hash[k] !== null ) {
        arr.push(hash[k]);
      }
    }
    switch ( act ) {
      case 'add':
        arr.forEach(item => item.addEventListener(event,func,{once:true}));
        break;
      case 'remove':
        arr.forEach(item => item.removeEventListener(event,func));
        break;
      default:
        console.log('Неверно указано действие!');
        return;
    }
  }

  function beginPipe(eo) {

    eo = eo || window.event;
    eo.target.releasePointerCapture(eo.pointerId);

    field[0].addEventListener('pointerup',stopPipe,{once:true});
    field[0].addEventListener('pointerleave',stopPipe,{once:true});

    s.refresh();
    s.startColor = eo.target.getAttribute('fill');
    s.startNum = Number(eo.target.getAttribute('data-dotnum'));

    if ( paths[s.startColor].length > 0 ) {
      if ( soundOff === false ) {
        pipeDestrSound.play();
      }
      changePathCells('discolor',s.startColor);
      manipulatePipe('destroy',s.startColor);
      notifyModel('pipeDestroyed',s.startColor);
      updateCounters('pipeDestroyed',s.startColor);
      paths[s.startColor] = [];
    }

    const startCell = eo.target.parentNode.getAttribute('id');
    const startRow = Number(startCell[5]);
    const startCol = Number(startCell[7]);
    paths[s.startColor] = [ {r:startRow,c:startCol} ];

    const startCellNbs = getNeighbors(startCell);
    toggleELs(startCellNbs,'','add','pointerenter',pipeForth);

  }

  function stopPipe(eo) {

    eo = eo || window.event;

    field[0].removeEventListener('pointerup',stopPipe);
    field[0].removeEventListener('pointerleave',stopPipe);

    const pathLength = paths[s.startColor].length;
    const endCell = getPreviousCellId(0);
    const endCellNbs = getNeighbors(endCell);

    if ( pathLength === 1 ) {
      toggleELs(endCellNbs,'','remove','pointerenter',pipeForth);
      paths[s.startColor] = [];
    }
    else if ( pathLength > 1 ) {
      toggleELs(endCellNbs,'','remove','pointerenter',pipeBack);
      if ( s.dotsConnected ) {
        if ( soundOff === false ) {
          clickSound.play();
        }
        changePathCells('colorize',s.startColor);
        updateCounters('pipeBuilt',s.startColor);
      }
      else {
        if ( s.endColor === null && !s.pipeEntangled ) {
          toggleELs(endCellNbs,'','remove','pointerenter',pipeForth);
        }
        manipulatePipe('destroy',s.startColor);
        notifyModel('pipeDestroyed',s.startColor);
        if ( s.pipesIntersect ) {
          console.log('Труба, которую вы собирались пересечь, сохранена.');
          manipulatePipe('build',s.pipeColor);
          notifyModel('pipeBuilt',s.pipeColor);
        }
        paths[s.startColor] = [];
      }
    }
    s.refresh();

  }

  function pipeForth(eo) {

    eo = eo || window.event;
    eo.preventDefault();

    if ( s.pipesIntersect ) {
      console.log('Пересечённая труба удалена.');
      changePathCells('discolor',s.pipeColor);
      updateCounters('pipeDestroyed',s.pipeColor);
      paths[s.pipeColor] = [];
      s.pipeColor = null;
      s.pipesIntersect = false;
    }

    // определяем клетку, _В_ которую пришли, и её соседей
    const currCell = eo.target.getAttribute('id');
    const currRow = Number(currCell[5]);
    const currCol = Number(currCell[7]);
    const currCellNbs = getNeighbors(currCell);

    // запоминаем это движение
    paths[s.startColor].push({r:currRow,c:currCol});

    // определяем клетку, _ИЗ_ которой пришли (1 шаг назад),
    // и её соседей; снимаем с них обработчики
    const prevCell = getPreviousCellId(1);
    const prevRow = Number(prevCell[5]);
    const prevCol = Number(prevCell[7]);
    const prevCellNbs = getNeighbors(prevCell);
    toggleELs(prevCellNbs,'','remove','pointerenter',pipeForth);

    // определяем направление движения
    const direction = getDirection(prevCell,currCell);

    // определяем клетку 2 шага назад;
    // если такая существует, снимаем с неё обработчик
    const prevPrevCell = document.getElementById(getPreviousCellId(2));
    if ( prevPrevCell ) prevPrevCell.removeEventListener('pointerenter',pipeBack);

    const currCellInModel = field[currRow][currCol];
    s.endColor = currCellInModel.dot[0];
    s.endNum = currCellInModel.dot[1];
    if ( s.endColor === null ) {
      s.pipeColor = currCellInModel.pipe;
    }

    // выясняем, есть ли в текущей клетке точка;
    // если точка есть
    if ( s.endColor !== null ) {
      // и её цвет такой же, как у стартовой точки,
      if ( s.endColor === s.startColor ) {
        // а номер отличается от номера стартовой точки
        // (т. е. это другая точка такого же цвета),
        if ( s.endNum !== s.startNum ) {
          // то достраиваем трубу в текущую клетку
          buildPipePiece(prevRow,prevCol,currRow,currCol,s.startColor);
          field[currRow][currCol].pipe = s.startColor;
          // и сообщаем, что
          s.dotsConnected = true;
          console.log('Точки соединены!');
        }
        // и номер не отличается от номера стартовой точки
        // (т. е. это та самая стартовая точка),
        else {
          // то сообщаем, что
          console.log('Точка не может соединяться сама с собой.');
        }
      }
      // и её цвет отличается от цвета стартовой точки,
      else {
        // сообщаем, что
        console.log('Точки разных цветов не могут быть соединены.');
      }
      // в любом случае даём игроку возможность сделать шаг назад
      document.getElementById(prevCell).addEventListener('pointerenter',pipeBack,{once:true});
    }
    // если точки нет, выясняем, проходит ли здесь труба
    else {
      // если труба есть и её цвет такой же, как у трубы, которую мы строим сейчас,
      if ( s.pipeColor === s.startColor ) {
        // сообщаем, что
        console.log('Труба не может пересекать саму себя.');
        s.pipeEntangled = true;
        // и даём игроку возможность сделать шаг назад
        document.getElementById(prevCell).addEventListener('pointerenter',pipeBack,{once:true});
      }
      else {
        // если труба в этой клетке не проходит,
        if ( s.pipeColor === null ) {
          console.log('Двигаемся дальше!');
        }
        // если труба всё же есть и её цвет отличается от цвета «текущей» трубы,
        else {
          // сообщаем, что
          console.log('Вы пересекаете другую трубу! Сделайте шаг назад, чтобы её сохранить, или продолжите движение, чтобы удалить.');
          if ( soundOff === false ) {
            pipeDestrSound.play();
          }
          s.pipesIntersect = true;
          // убираем пересекаемую трубу (пока только визуально: ждём дальнейших действий игрока)
          manipulatePipe('destroy',s.pipeColor);
          notifyModel('pipeDestroyed',s.pipeColor);
        }
        // достраиваем трубу в текущую клетку
        buildPipePiece(prevRow,prevCol,currRow,currCol,s.startColor);
        field[currRow][currCol].pipe = s.startColor;
        // и вешаем одноразовые обработчики на 4 соседние клетки:
        // на предшествующую клетку — обработчик шага назад,
        // на 3 другие — шага вперёд (текущая функция)
        switch ( direction ) {
          case 'up':
            toggleELs(currCellNbs,'bottom','add','pointerenter',pipeForth);
            currCellNbs.bottom.addEventListener('pointerenter',pipeBack,{once:true});
            break;
          case 'right':
            toggleELs(currCellNbs,'left','add','pointerenter',pipeForth);
            currCellNbs.left.addEventListener('pointerenter',pipeBack,{once:true});
            break;
          case 'down':
            toggleELs(currCellNbs,'top','add','pointerenter',pipeForth);
            currCellNbs.top.addEventListener('pointerenter',pipeBack,{once:true});
            break;
          case 'left':
            toggleELs(currCellNbs,'right','add','pointerenter',pipeForth);
            currCellNbs.right.addEventListener('pointerenter',pipeBack,{once:true});
            break;
        }
      }
    }

  }

  function pipeBack(eo) {

    eo = eo || window.event;
    eo.preventDefault();

    console.log('Шаг назад');

    const currCell = eo.target.getAttribute('id');
    const currRow = Number(currCell[5]);
    const currCol = Number(currCell[7]);
    const currCellNbs = getNeighbors(currCell);

    const nextCell = getPreviousCellId(0);
    const nextRow = Number(nextCell[5]);
    const nextCol = Number(nextCell[7]);
    const nextCellNbs = getNeighbors(nextCell);

    paths[s.startColor].pop();

    if ( s.endColor !== null ) {
      if ( s.endColor === s.startColor ) {
        if ( s.endNum !== s.startNum ) {
          destroyPipePiece(currRow,currCol,nextRow,nextCol);
          field[nextRow][nextCol].pipe = null;
          s.dotsConnected = false;
          console.log('Точки разъединены.');
        }
      }
      s.endColor = null;
      s.endNum = null;
    }
    else {
      if ( s.pipeColor === s.startColor ) {
        s.pipeEntangled = false;
      }
      else {
        destroyPipePiece(currRow,currCol,nextRow,nextCol);
        field[nextRow][nextCol].pipe = null;
        if ( s.pipeColor !== null ) {
          console.log('Труба, которую вы собирались пересечь, сохранена.');
          manipulatePipe('build',s.pipeColor);
          notifyModel('pipeBuilt',s.pipeColor);
          s.pipesIntersect = false;
        }
        toggleELs(nextCellNbs,'','remove','pointerenter',pipeForth);
      }
      s.pipeColor = null;
    }

    const prevCell = getPreviousCellId(1);
    if ( prevCell === null ) {
      toggleELs(currCellNbs,'','add','pointerenter',pipeForth);
    }
    else {
      const direction = getDirection(currCell,prevCell);
      switch ( direction ) {
        case 'up':
          toggleELs(currCellNbs,'top','add','pointerenter',pipeForth);
          currCellNbs.top.addEventListener('pointerenter',pipeBack,{once:true});
          break;
        case 'right':
          toggleELs(currCellNbs,'right','add','pointerenter',pipeForth);
          currCellNbs.right.addEventListener('pointerenter',pipeBack,{once:true});
          break;
        case 'down':
          toggleELs(currCellNbs,'bottom','add','pointerenter',pipeForth);
          currCellNbs.bottom.addEventListener('pointerenter',pipeBack,{once:true});
          break;
        case 'left':
          toggleELs(currCellNbs,'left','add','pointerenter',pipeForth);
          currCellNbs.left.addEventListener('pointerenter',pipeBack,{once:true});
          break;
      }
    }

  }



}



const ajaxHandlerScript="https://fe.it-academy.by/AjaxStringStorage2.php";
const ajaxStringName='KRGL_PIPES_LEVELS';

function dataLoaded(data) {
  console.log('Загружен пакет уровней.');
  levelPack = JSON.parse(data.result);
  goAhead();
}

function errorOccured(jqXHR,statusStr,errorStr) {
  alert('Ошибка загрузки пакета уровней');
  console.log(errorStr);
}

function loadLevelPack() {
  $.ajax( {
    url: ajaxHandlerScript, type: 'POST', cache: false,
    dataType: 'json', data: { f: 'READ', n: ajaxStringName },
    success: dataLoaded, error: errorOccured
  } );
}

loadLevelPack();