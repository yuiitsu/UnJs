/**
 * 系统管理 - 系统维护
 */
Controller.extend('sys.maintain', function () {

    var self = this;
    //
    this.bind = {
        '.sys-control click': '_event.control',
        '#js-sys-search click': '_search',
        '#js-sys-new click': '_sysForm',
        '#js-sys-list-container .js-sys-list-edit click.sys_list_edit_': '_sysForm',
        '#js-sys-list-container .js-sys-stop click.sys_stop_': '_sysStop',
        '#js-sys-list-container .js-sys-del click.sys_del_': '_sysDel'
    };

    /**
     * 系统维护
     */
    this.index = function() {
        //
        this.watch(this.model.get(), 'sysListJson', this._renderSysList);
        this.watch(this.model.get(), 'searchJson', this.model.querySysList);
        //
        this.output('layout');
        //
        this.model.querySysList();
    };

    /**
     * 渲染列表
     * @private
     */
    this._renderSysList = function() {
        var sysListJson = this.model.get('sysListJson'),
            sysList = [];

        try {
            sysList = JSON.parse(sysListJson);
        } catch (e) {
            self.log('SysListJson parse failed.', 'danger');
        }

        this.output('sys_list', sysList, $('#js-sys-list-container'));
    };

    /**
     * 搜索
     * @private
     */
    this._search = function(e) {
        var id = $.trim($('#js-sys-search-id').val()),
            name = $.trim($('#js-sys-search-name').val()),
            status = $('#js-sys-search-status').val();

        // if (!id && !name) {
        //     self.notification.danger('没有搜索条件');
        //     return false;
        // }

        this.model.set('search.systemid', id);
        this.model.set('search.systemname', name);
        this.model.set('search.status', status);
        this.model.set('searchJson', JSON.stringify(this.model.get('search')));
    };

    /**
     * 新建系统表单
     * @private
     */
    this._sysForm = function(e) {
        var target = this.$(e),
            dataId = target.attr('data-id'),
            dataName = target.attr('data-name'),
            formTitle = dataId ? '编辑系统信息' : '新增系统信息';

        dataId = dataId ? dataId : '';
        dataName = dataName ? dataName : '';
        //
        self.renderComponent('modal.view', {
            title: formTitle,
            body: self.getView('module.sys.maintain.sys_form', {
                name: dataName
            }),
            callback: function (modal, res) {
                if (res === 'ok') {
                    //
                    if (self.callComponent({
                        name: 'verification'
                    }, {'form': $('#js-sys-maintain-form')})) {
                        var sysName = modal.el('#js-sys-maintain-name').val();
                        sysName = sysName ? $.trim(sysName) : '';
                        self.model.saveSystem({
                            id: dataId,
                            name: sysName
                        }, function() {
                            modal.close();
                        });
                    }
                }
            }
        }).appendTo($('body'));
    };

    /**
     * 停用/启用
     * @param e
     * @returns {boolean}
     * @private
     */
    this._sysStop = function(e) {
        var target = self.$(e),
            id = target.attr('data-sys-id'),
            status = target.attr('data-sys-status');

        if (!id) {
            self.notification.danger('数据有误，请刷新重试');
            return false;
        }
        //
        self.callComponent({
            name: 'confirm'
        }, {
            message: '确定要执行此操作吗？',
            callback: function(confirm, target) {
                self.model.stopSystem({
                    id: id,
                    status: parseInt(status) === 0 ? 1 : 0,
                    target: target
                }, function() {
                    confirm.close();
                });
            }
        });
    };

    /**
     * 删除
     * @param e
     * @returns {boolean}
     * @private
     */
    this._sysDel = function(e) {
        var target = self.$(e),
            id = target.attr('data-sys-id');

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
                self.model.delSystem(id, function() {
                    confirm.close();
                });
            }
        });
    };

    this._event = {
        control: function(e) {
            var target = self.$(e),
                module = target.attr('data-module'),
                systemId = target.attr('data-sys-id');

            self.callControl(module, 'index', {
                systemId: systemId
            });
        }
    };
});