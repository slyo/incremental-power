var Player = {}, Game = {}, UI = {};

Player.powerPerSecond = 0;
Player.clickPower = 1;
Player.power = 0;
Player.powerEarned = 0;
Player.workers = [];

Player.earn = function (amount) {
  Player.power += amount;
  Player.powerEarned += amount;
};

Player.spend = function (amount) {
  Player.power -= amount;
};

UI.increasePowerButton = document.getElementById('increase-power');
UI.increasePowerVisual = document.getElementById('increase-power-visual');
UI.centerColumn = document.getElementById('column-center');
UI.currentPower = document.getElementById('current-power');
UI.powerPerSecond = document.getElementById('power-per-second');


UI.increasePowerButton.addEventListener('click', function () {
  Player.earn(Player.clickPower);
  UI.increasePowerVisual.classList.add('pulse');
  Game.powerButtonClicked = Game.time;
});


var GameWorker = function (name, baseCost, costIncrease, powerPerSecond) {
  this.name = name;
  this.baseCost = baseCost;
  this.cost = baseCost;
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
    icon.appendChild(i);
    worker.appendChild(icon);

    var data = document.createElement('div');
    data.className = 'worker-data';
    var cost = document.createElement('span');
    cost.className = 'worker-cost';
    var phCost = document.createElement('span');
    phCost.id = this.name + '-cost';
    phCost.textContent = this.baseCost.toFixed();
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
      cost.textContent = this.cost.toFixed();
      amount.textContent = this.owned.toFixed();
    }
  };
};

Game.time = 0;
Game.powerButtonClicked = null;

Game.start = function () {
  Player.workers.push(new GameWorker('faggots', 10, 5, 0.3));
  Player.workers.push(new GameWorker('homes', 100, 50, 5));

  for (var i = 0; i < Player.workers.length; i++) {
    UI.centerColumn.appendChild(Player.workers[i].draw());
  }

  window.requestAnimationFrame(Game.frame);
};

Game.frame = function (T) {
  var DT = Math.max(T - Game.time, 5);
  Game.time = T;
  Player.earn(Player.powerPerSecond / 1000 * DT);
  UI.currentPower.textContent = Player.power.toFixed();
  document.title = Player.power.toFixed();
  UI.powerPerSecond.textContent = Player.powerPerSecond.toFixed(1);
  window.requestAnimationFrame(Game.frame);

  if (Game.powerButtonClicked && (T - Game.powerButtonClicked > 1000)) {
    UI.increasePowerVisual.classList.remove('pulse');
  }
};

Game.start();

