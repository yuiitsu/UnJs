/**
 * Form Designer Page
 */
Controller.extend('form_designer.page', function () {
    //
    var self = this;

    this.bind = {
        '.form-designer-control click': '_event.control',
        '#js-form-new click': '_form',
        '#js-form-search click': '_search',
        '#js-form-list-container .js-form-edit click.form_edit_': '_form',
        '#js-form-list-container .js-form-del click.form_del_': '_formDel'
    };

    this.index = function() {
        var params = self.getParams(),
            systemId = params.systemId,
            time = params.time,
            search = this.model.get('search');
        //
        if (!systemId) {
            this.notification.danger('参数不正确');
            return false;
        }
        //
        this.watch(this.model.get(), 'formListJson', this._renderList);
        this.watch(this.model.get(), 'searchJson', this.model.queryFormList);
        //
        search.systemId = systemId;
        search.time = new Date().getTime();
        this.model.set('search', search);
        this.model.set('searchJson', JSON.stringify(search));
        //
        this.output('layout');
    };

    this._renderList = function() {
        var formListJson = self.model.get('formListJson'),
            formList = [];

        try {
            var o = JSON.parse(formListJson);
            formList = o.list;
        } catch (e) {
            self.log('SysListJson parse failed.', 'danger');
        }
        this.output('form_list', {list: formList}, $('#js-form-list-container'));
    };

    this._search = function() {
        var search = self.model.get('search');
        //
        search.formName = $.trim($('#js-form-search-form-name').val());
        //
        this.model.set('search', search);
        this.model.set('searchJson', JSON.stringify(search));
    };

    this._form = function(e) {
        var target = this.$(e),
            formId = target.attr('data-form-id'),
            formName = target.attr('data-form-name'),
            description = target.attr('data-description'),
            formTitle = formId ? '编辑表单信息' : '新增表单';

        formId = formId ? formId : '';
        formName = formName ? formName : '';
        description = description ? description : '';
        //
        self.renderComponent('modal.view', {
            title: formTitle,
            body: self.getView('module.form_designer.page.new_form', {
                formName: formName,
                description: description
            }),
            callback: function (modal, res) {
                if (res === 'ok') {
                    //
                    if (self.callComponent({
                        name: 'verification'
                    }, {'form': $('#js-sys-form-designer-form')})) {
                        var formName = modal.el('#js-sys-form-designer-name').val(),
                            description = modal.el('#js-sys-form-designer-name').val();
                        //
                        formName = formName ? $.trim(formName) : '';
                        description = description ? $.trim(description) : '';
                        //
                        self.model.saveForm({
                            formId: formId,
                            systemId: self.model.get('search').systemId,
                            formName: formName,
                            formType: 'normal',
                            formData: '',
                            description: description,
                        }, modal.$confirm(), function() {
                            modal.close();
                        });
                    }
                }
            }
        }).appendTo($('body'));
    };

    this._formDel = function(e) {
        var target = self.$(e),
            id = target.attr('data-form-id');

        if (!id) {
            self.notification.danger('数据有误，请刷新重试');
            return false;
        }
        //
        self.callComponent({
            name: 'confirm'
        }, {
            message: '确定要执行此操作吗？',
            callback: function(confirm, res) {
                self.model.delForm(id, function() {
                    confirm.close();
                });
            }
        });
    };

    this._event = {
        control: function(e) {
            var target = self.$(e),
                module = target.attr('data-module'),
                formId = target.attr('data-form-id');

            self.callControl(module, 'index', {
                formId: formId
            });
        }
    };
});
