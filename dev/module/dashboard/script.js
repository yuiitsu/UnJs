/**
 * Dashboard
 */
Controller.extend('dashboard', function () {

    this.index = function() {
        console.log('dashboard.index');
         this.callComponent({ name: 'input', method: 'callMethod'}, {});
    }
});
