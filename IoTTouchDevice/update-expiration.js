function updateExpiration (food) {
    var today = Date.now();
    var week = 7 * 24 * 60 * 60 * 1000;

    if (food.status === 'ON') {
        if (!food.expiration) {
            food.expiration = today + 4 * week;
        }
    } else if (food.expiration > today + week) {
        food.expiration = today + week;
    }
}