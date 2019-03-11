/**
 * Form Designer
 */
Controller.extend('form_designer', function () {

    this.bind = {
        '.form-designer-component h2 click.designer_component_': 'openComponentSelector'
    };

    this.index = function() {
        this.output('layout');
    };

    this.openComponentSelector = function() {

    };
});