/**
 * Created by Administrator on 2017/11/15.
 */
var Component = function () {
    var Component_temp = function () {
        this._super = _core;
        this.type = 'component';
    };
    Component_temp.prototype = _core;
    var Component_func = function () {
        /**
         * 继承Base类
         * @param name 对象名称
         * @param func 对象方法
         * @param parent 父类方法(用于子控制器或model)
         */
        this.extend = function (name, func, parent) {
            // 继承Base对象
            if (parent) {
                if (this.type === 'component') {
                    this[this.type][name] = func;
                    if (Object.prototype.toString.call(this[this.type][parent]) === "[object Function]") {
                        var parent_instance = new this[this.type][parent]();
                        var F_temp = function () {
                        };
                        F_temp.prototype = parent_instance;
                        func.prototype = new F_temp();
                        func.prototype.constructor = func;
                        func.prototype._super = parent_instance;
                    } else {
                        this.componentExtendHandler(parent, func);
                    }
                }
            } else {
                var F_temp = function () {
                    this._super = Component;
                };
                F_temp.prototype = Component;
                func.prototype = new F_temp();
                func.prototype.constructor = func;
                this[this.type][name] = func;
            }
        };

        /**
         * 处理component继承
         * @param func 对象方法
         * @param parent 父类方法(用于component)
         */
        this.componentExtendHandler = function (parent, func) {
            if (Object.prototype.toString.call(this['component'][parent]) === '[object Array]') {
                this['component'][parent].push(func);
            } else if (Object.prototype.toString.call(this['component'][parent]) === "[object Undefined]") {
                this['component'][parent] = [func];
                this.watch(this['component'], parent, function (newVal, oldVal) {
                    if (Object.prototype.toString.call(newVal) === "[object Function]") {
                        var parent_func = new newVal();
                        var F_temp = function () {
                        };
                        F_temp.prototype = parent_func;
                        oldVal.forEach(function (v_func, i, arr) {
                            v_func.prototype = new F_temp();
                            v_func.prototype.constructor = v_func;
                            v_func.prototype._super = parent_func;
                        });
                    }

                });
            } else {

            }
        };

        /**
         * 通知订阅者干活,由组件自行通知
         * @param params 订阅者执行函数的参数object;
         */
        this.notify = function (type, params) {
            var subs = this.subs[type];
            if (Object.prototype.toString.call(subs) === '[object Array]') {
                subs.forEach(function (sub, i, arr) {
                    if (Object.prototype.toString.call(sub) === '[object Function]') {
                        sub.call(this, params);
                    }
                }, this)
            }
        };

        //添加订阅者
        this.addSubscriber = function (type, sub) {
            var subs = this.subs[type];
            if (Object.prototype.toString.call(subs) === '[object Array]' && subs.indexOf(sub) === -1) {
                subs.push(sub);
            }
        };

        //订阅者取消订阅
        this.removeSubscriber = function (type, sub) {
            var subs = this.subs[type],
                index = Object.prototype.toString.call(subs) === '[object Array]' ? subs.indexOf(sub) : -1;
            if (index !== -1) {
                subs.splice(index, 1);
            }
        };
    };
    Component_func.prototype = new Component_temp();
    Component_func.prototype.constructor = Component_func;
    return (new Component_func());
}();

