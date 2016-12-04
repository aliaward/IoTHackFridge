var moment = require('moment');

var Food = function(name){
    this.name = name;
    this.dateAdded;
    this.open = false;
    this.daysOpened = 0;
    this.expiration;
    this.status = 'ON';
    this.daysLeft;
    this.message;
}




var milk = new Food('milk');

Food.prototype.updateExpiration = function() {
    var today = moment();
    var week = moment.duration(1, 'week');

    if (this.status === 'ON') {
        if (!this.expiration) {
            this.expiration = today + 4 * week;
        }
    } else if (this.expiration > today + week) {
        this.expiration = today + week;
    }
    // update days left and expiration message
    this.generateDaysLeft();
    this.generateMessage();
};

Food.prototype.generateDaysLeft = function() {
    if (this.expiration) {
        return this.daysLeft = Math.floor(moment.duration(this.expiration - moment()).asDays());
    }
};

Food.prototype.generateMessage = function() {
    var dayMsg = moment.duration(this.daysLeft, 'days').humanize()
    if (this.daysLeft > 0) {
        return this.message = this.name + ' expires in ' + dayMsg;
    } else if (this.daysLeft < 0) {
        return this.message = this.name + ' expired' + dayMsg;
    } else if (this.daysLeft === 0) {
        return this.message = this.name + ' expires today';
    }
}

console.log(1, milk);
milk.updateExpiration();
// milk.generateDaysLeft();
// milk.generateMessage();

console.log(2, milk);



