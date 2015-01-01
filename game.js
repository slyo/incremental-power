var Player = {}, Game = {}, UI = {};

Player.powerPerSecond = 0;
Player.clickPower = 1;
Player.power = 0;
Player.powerEarned = 0;
Player.workers = [];
Player.powerProgression = null;
Player.progress = null;

Player.earn = function (amount) {
  Player.power += amount;
  Player.powerEarned += amount;
  if (Player.powerProgression) {
    Player.powerProgression.earned += amount;
  }
};

Player.spend = function (amount) {
  Player.power -= amount;
};

UI.increasePowerButton = document.getElementById('increase-power');
UI.increasePowerVisual = document.getElementById('increase-power-visual');
UI.centerColumn = document.getElementById('column-center');
UI.currentPower = document.getElementById('current-power');
UI.powerPerSecond = document.getElementById('power-per-second');
UI.progression = document.getElementById('progression');


UI.increasePowerButton.addEventListener('click', function () {
  Player.earn(Player.clickPower);
  UI.increasePowerVisual.classList.add('pulse');
  Game.powerButtonClicked = Game.time;
  if (Player.progress) {
    Player.progress.add(Player.clickPower);
  }
});


var GameWorker = function (name, baseCost, costIncrease, powerPerSecond, icon) {
  this.name = name;
  this.baseCost = baseCost;
  this.cost = baseCost;
  this.icon = icon;
  this.costIncrease = costIncrease;
  this.powerPerSecond = powerPerSecond;

  this.owned = 0;
  this.totalPowerPerSecond = function () {
    return this.owned * this.powerPerSecond;
  };

  this.draw = function () {
    var worker = document.createElement('div');
    worker.id = 'buy-' + this.name;
    worker.className = 'worker';
    worker.addEventListener('click', this.purchase.bind(this));

    var icon = document.createElement('div');
    icon.className = 'worker-icon';
    var i = document.createElement('i');
    i.id = this.name;
    i.className = this.icon;
    i.setAttribute('data-icon', '');
    icon.appendChild(i);
    worker.appendChild(icon);

    var data = document.createElement('div');
    data.className = 'worker-data';
    var cost = document.createElement('span');
    cost.className = 'worker-cost';
    var phCost = document.createElement('span');
    phCost.id = this.name + '-cost';
    phCost.textContent = this.baseCost;
    cost.appendChild(phCost);
    cost.appendChild(document.createTextNode('P'));
    data.appendChild(cost);
    var content = document.createElement('div');
    content.className = 'worker-content';
    content.textContent = this.name;
    data.appendChild(content);
    worker.appendChild(data);

    var nr = document.createElement('div');
    nr.className = 'worker-number';
    nr.id = this.name + '-amount';
    nr.textContent = '0';
    worker.appendChild(nr);

    return worker;
  };

  this.purchase = function () {
    if (Player.power >= this.cost) {
      var cost = document.getElementById(this.name + '-cost'), amount = document.getElementById(this.name + '-amount');
      Player.spend(this.cost);
      this.owned++;
      Player.powerPerSecond += this.powerPerSecond;
      this.cost += this.costIncrease;
      cost.textContent = this.cost;
      amount.textContent = this.owned.toString();
    }
  };
};

var StoryProgression = function (name, req) {
  this.prev = null;
  this.next = null;

  this.name = name;
  this.req = req;

  this.spanCurrent = document.createElement('span');
  this.spanCurrent.id = 'click-progress-' + name + '-current';
  this.spanCurrent.textContent = '0';

  this.currentStep = 0;

  this.setNext = function (progression) {
    this.next = progression;
    progression.prev = this;
  };

  this.add = function (amount) {
    this.currentStep += amount;
    if (this.currentStep >= this.req) {
      this.currentStep = this.req;
      if (this.next && this.currentStep == this.req) {
        Player.progress = this.next;
        Player.progress.draw();
      }
    }
    this.spanCurrent.textContent = this.currentStep;
  };

  this.draw = function () {
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(this.name + ': '));
    li.appendChild(this.spanCurrent);
    li.appendChild(document.createTextNode(' / ' + this.req));
    UI.progression.appendChild(li);
  };

};

var PowerProgression = function (name, step, req) {
  this.prev = null;
  this.next = null;

  this.name = name;
  this.step = step;
  this.req = req;

  this.earned = 0;
  this.currentStep = 0;

  this.spanCurrent = document.createElement('span');
  this.spanCurrent.id = 'power-progress-' + name + '-current';
  this.spanCurrent.textContent = '0';

  this.setNext = function (progression) {
    this.next = progression;
    progression.prev = this;
  };

  this.checkProgress = function () {
    if (this.earned > (this.currentStep + 1) * this.step) {
      this.currentStep++;
      if (this.next && this.currentStep == this.req) {
        this.update();
        Player.powerProgression = this.next;
        Player.powerProgression.draw();
      }
      return true;
    }
    return false;
  };

  this.progress = function () {
    var progress = (this.earned / this.step);
    return Math.min(this.req, progress);
  };

  this.draw = function () {
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(this.name + ': '));
    li.appendChild(this.spanCurrent);
    li.appendChild(document.createTextNode(' / ' + this.req));
    UI.progression.appendChild(li);
  };

  this.update = function () {
    this.spanCurrent.textContent = this.progress();
  };
};


Game.time = 0;
Game.powerButtonClicked = null;

Game.start = function () {
  Player.workers.push(new GameWorker('test1', 10, 5, 0.3, 'rpg-Icon4_59'));
  Player.workers.push(new GameWorker('test2', 100, 50, 5, 'rpg-Icon4_89'));
  Player.workers.push(new GameWorker('test3', 1000, 500, 25, 'rpg-Icon4_89'));
  Player.workers.push(new GameWorker('test4', 5000, 1500, 50, 'rpg-Icon4_89'));
  Player.workers.push(new GameWorker('test5', 10000, 4000, 100, 'rpg-Icon4_89'));
  Player.workers.push(new GameWorker('test6', 100000, 8000, 150, 'rpg-Icon4_89'));


  var first = new StoryProgression('test', 10);
  first.setNext(new StoryProgression('test2', 10));
  Player.progress = first;


  for (var i = 0; i < Player.workers.length; i++) {
    UI.centerColumn.appendChild(Player.workers[i].draw());
  }
  Player.progress.draw();

  window.requestAnimationFrame(Game.frame);
};

Game.frame = function (T) {
  var DT = Math.max(T - Game.time, 5);
  Game.time = T;
  Player.earn(Player.powerPerSecond / 1000 * DT);
  UI.currentPower.textContent = Math.floor(Player.power);
  //document.title = Player.power.toFixed();
  UI.powerPerSecond.textContent = Player.powerPerSecond.toFixed(1);
  window.requestAnimationFrame(Game.frame);

  if (Game.powerButtonClicked && (T - Game.powerButtonClicked > 1000)) {
    UI.increasePowerVisual.classList.remove('pulse');
  }
};

Game.start();

