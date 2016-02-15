// 缓存操作器
class nsCacheOperator {

    // 缓存容器
    cache = {};
    // 缓存更新回调
    callbackObj= null;

    //调用后台接口是否完成
    ajaxIsFinish = true;
    /**
     * [getListId 根据元素查找列表唯一标识]
     * @param  {[type]} item [description]
     * @return {[type]}      [description]
     */
    getListId(item) {
        if (_.isObject(item)) {
            for (var k in this.cache) {
                var v = this.cache[k];
                var data = v['list'];
                var key = v['key'];
                for (var i in data) {
                    var vv = data[i];
                    if (item[key] == vv[key]) return k;
                }
            }
        }
        return null;
    }

    /**
     * [getListIdByGroupId 根据分组编号和状态查找列表唯一标识]
     * @param  {[type]} groupId [分组编号]
     * @param  {[type]} status  [状态]
     * @return {[type]}         [description]
     */
    getListIdByGroupId(groupId, status) {
        var cache = this.cache;
        for (var id in cache) {
            var v = cache[id];
            var vgroupId = v.groupId;
            var vstatus = v.status;
            if (groupId == vgroupId && status == vstatus) return id;
        }
        return null;
    }

    /**
     * [getListIdByGroupId 根据分组编号和状态查找列表唯一标识]
     * @param  {[type]} status  [状态]
     * @return {[type]}         [description]
     */
    getListIdByStatus(status) {
        var cache = this.cache;
        for (var id in cache) {
            var v = cache[id];
            var vstatus = v.status;
            if (status == vstatus) return id;
        }
        return null;
    }

    /**
     * [findItem 根据元素主键，查询元素信息]
     * @param  {[type]} item [包含主键的元素内容]
     * @return {[type]}      [description]
     */
    findItem(item) {
        if (_.isObject(item)) {
            for (var k in this.cache) {
                var v = this.cache[k];
                var data = v['list'];
                var key = v['key'];
                for (var i in data) {
                    var vv = data[i];
                    if (item[key] == vv[key]) return vv;
                }
            }
        }
        return null;
    }

    findListObj(id) {
        var cache = this.cache[id];
        return cache && cache['_this'];
    }

    /**
     * [getList 根据唯一标识，获得缓存列表]
     * @param  {[type]} id [列表唯一标识]
     * @return {[type]}    [description]
     */
    getList(id) {
        if (!id) return null;
        var cache = this.cache[id];
        return cache && cache.list;
    }

    /**
     * [getListByItem 通过元素获得缓存列表]
     * @param  {[type]} item [被缓存元素]
     * @return {[type]}      [description]
     */
    getListByItem(item) {
        var id = this.getListId(item);
        return this.getList(id);
    }

    /**
     * [cacheList 缓存整个列表]
     * @param  {[type]} id   [列表唯一标识]
     * @param  {[type]} list [被缓存的列表]
     * @return {[type]}      [description]
     */
    cacheList(param) {
        var id = param['id'];
        var listKey = param['listKey'];
        var list = param['_this'][listKey];
        if (_.isArray(list)) {
            this.cache[id] = _.extend(param, {
                'list': list
            });
        }
    }

    /**
     * [refreshList 刷新缓存列表]
     * @param  {[type]} id [缓存列表唯一标识]
     * @return {[type]}    [description]
     */
    refreshList(id) {
        var cache = this.cache[id];
        if (cache) {
            var _this = cache['_this'];
            var listKey = cache['listKey'];
            var list = cache['list'];

            if (_.isObject(_this) && listKey && _.isArray(list)) {
                _this[listKey] = _.clone(list);
            }
        }
    }

    /**
     * [callback 缓存更新后，执行的回调事件]
     * @param  {[type]}   type [更新类型，post, put, delete]
     * @param  {[type]}   id   [缓存列表唯一标识]
     * @param  {[type]}   key  [更改实体key]
     * @return {Function}      [description]
     */
    callback(type, id, key) {
        let cb = this.callbackObj;
        if(_.isObject(cb)) {
            var cbf = cb.callback;
            var _this = cb._this;
            if(_.isFunction(cbf)) {
                cbf(_this, type, id, key);
            }
        }
    }

    /**
     * [postItem 增加某个缓存列表中的元素]
     * @param  {[type]} id    [列表唯一标识]
     * @param  {[type]} item  [需要增加的元素]
     * @param  {[type]} index [需要增加元素的索引]
     * @return {[type]}      [description]
     */
    postItem(id, item, index) {
        var cache = this.cache[id];
        if (cache && item) {
            var list = cache.list;
            var key = cache['key'];
            if(!item[key]) return false;
            var formatKey = cache['format'];
            var _this = cache['_this'];
            var format = formatKey && _this[formatKey];
            if (_.isFunction(format)) item = format(item);
            if (_.isNumber(index)) {
                list.splice(index, 0, item);
            } else {
                list.unshift(item);
                // _.addList(item, list, true);
            }
            cache.list = list;
            this.refreshList(id);

            var countKey = cache['countKey'];
            if(countKey) _this[countKey] = _this[countKey] + 1;

            
            this.callback('post', id, item[key]);

            return true;
        }
        return false;
    }

    /**
     * [putItem 更新某个缓存列表中的元素]
     * @param  {[type]} id   [列表唯一标识]
     * @param  {[type]} item [需要更新的元素]
     * @return {[type]}      [description]
     */
    putItem(id, item, fieldList) {
        if (fieldList) item = this.filterAttr(item, fieldList);
        var cache = this.cache[id];
        if (cache && _.isObject(item)) {
            var list = cache.list;
            var key = cache.key;
            var isPut = false;
            for (var i in list) {
                var v = list[i];
                if (item[key] == v[key]) {
                    list[i] = _.extend(v, item);
                    isPut = true;
                }
            }
            if(isPut) {
                this.refreshList(id);
                this.callback('put', id, item[key]);
                return true;
            }
        }
        return false;
    }

    filterAttr(item, fieldList) {
        var ret = {};
        for (var i in fieldList) {
            var k = fieldList[i];
            var v = item[k];
            ret[k] = v;
        }
        return ret;
    }

    /**
     * [putItemNoId 更新某个缓存列表中的元素]
     * @param  {[type]} item [需要更新的元素]
     * @return {[type]}      [description]
     */
    putItemNoId(item, fieldList) {
        var id = this.getListId(item);
        return this.putItem(id, item, fieldList);
    }

    /**
     * [deleteItem 删除某个缓存列表中的元素]
     * @param  {[type]} id   [列表唯一标识]
     * @param  {[type]} item [需要删除的元素]
     * @return {[type]}      [description]
     */
    deleteItem(id, item) {
        var cache = this.cache[id];
        if (cache && _.isObject(item)) {
            var list = cache.list;
            var key = cache.key;
            var ol = list.length;
            var newList = _.reject(list, (v) => {
                return item[key] == v[key];
            });
            var nl = newList.length;
            if (ol != nl) {
                this.cache[id].list = newList;
                this.refreshList(id);

                var _this = cache['_this'];
                var countKey = cache['countKey'];
                if(countKey) _this[countKey] = _this[countKey] - 1;

                this.callback('delete', id, item[key]);
                return true;
            }
        }
        return false;
    }

    /**
     * [appendItem 滚动加载数据方法]
     * @param  {[type]} id [列表唯一标识]
     * @return {[type]}    [description]
     */
    appendItem(id) {
        var cache = this.cache[id];
        if (cache) {
            if (cache.append) cache['_this'][cache['append']]();
        }
    }

    /**
     * [deleteItemNoId 删除某个缓存列表中的元素]
     * @param  {[type]} item [需要删除的元素]
     * @return {[type]}      [description]
     */
    deleteItemNoId(item) {
        var id = this.getListId(item);
        return this.deleteItem(id, item);
    }

    /**
     * [moveItemOnList 移动列表元素位置]
     * @param  {[type]} id       [列表唯一标识]
     * @param  {[type]} newIndex [元素移动后的位置]
     * @param  {[type]} oldIndex [元素移动前的位置]
     * @return {[type]}          [description]
     */
    moveItemOnList(id, newIndex, oldIndex) {
        var cache = this.cache[id];
        if (cache) {
            var list = cache.list;
            var tItemObj = list.splice(oldIndex, 1);
            list.splice(newIndex, 0, tItemObj[0]);
            cache.list = list;
            this.refreshList(id);
        }

    }

    /**
     * [deleteItem 查找元素在缓存列表中的索引]
     * @param  {[type]} id   [列表唯一标识]
     * @param  {[type]} item [需要查找的元素]
     * @return {[type]}      [description]
     */
    findItemIndex(id, item) {
        var cache = this.cache[id];
        if (cache && _.isObject(item)) {
            var list = cache.list;
            var key = cache.key;
            var param = {};
            param[key] = item[key];
            return _.findIndex(list, param);
        }
        return -1;
    }

    /**
     * [findItemIndexNoId 查找元素在缓存列表中的索引]
     * @param  {[type]} item [需要查找的元素]
     * @return {[type]}      [description]
     */
    findItemIndexNoId(item) {
        var id = this.getListId(item);
        return this.findItemIndex(id, item);
    }

    // 验证器
    filterRules = {};

    /**
     * [setFilterRules 向缓存器中设置过滤规则]
     * @param {[type]} rules [对数据进行过滤的规则 {'字段名':'规则 ==、contains、to、in'}]
     */
    setFilterRules(rules) {
        this.filterRules = rules;
    }

    /**
     * [filter 对数据进行过滤]
     * @param  {[type]} condition [过滤条件]
     * @param  {[type]} item      [当前元素]
     * @return {[type]}           [description]
     */
    filter(condition, item) {
        var ret = this.matchRules(condition, item);
        if (!ret) this.deleteItemNoId(item);
        return ret;
    }

    /**
     * [matchRules 对单个缓存对象进行所有条件过滤]
     * @param  {[type]} condition [匹配规则]
     * @param  {[type]} item      [缓存对象]
     * @return {[type]}           [description]
     */
    matchRules(condition, item) {
        for (var k in this.filterRules) {
            var rule = this.filterRules[k];
            var condVal = condition[k];
            if (!rule || !condVal) continue;
            if (k.indexOf(',') > -1) {
                var ret = false;
                var keys = k.split(',');
                for (var kk in keys) {
                    var itemVal = item[kk];
                    ret = this.matchUnit(condVal, rule, itemVal);
                    if (ret) break;
                }
                if (!ret) return false;
            } else {
                var itemVal = item[k];
                var ret = this.matchUnit(condVal, rule, itemVal);
                if (!ret) return false;
            }
        }
        return true;
    }

    /**
     * [matchUnit 对缓存对象属性进行规则匹配]
     * @param  {[type]} condVal [条件值]
     * @param  {[type]} rule    [规则类型]
     * @param  {[type]} itemVal [属性值]
     * @return {[type]}         [description]
     */
    matchUnit(condVal, rule, itemVal) {

        if ('==' == rule || 'equal' == rule || 'is' == rule) {
            return condVal == itemVal;
        } else if ('indexOf' == rule || 'contains' == rule) {
            if (!_.isString(condVal)) condVal = JSON.stringify(condVal);
            if (!_.isString(itemVal)) itemVal = JSON.stringify(itemVal);
            if (condVal.length > itemVal.length) return condVal.indexOf(itemVal) > -1;
            return itemVal.indexOf(condVal) > -1;
        } else if ('to' == rule) {
            if (_.isArray(condVal) && condVal.length > 1) {
                var s = condVal[0];
                var e = condVal[1];
                var st = typeof s;
                var et = typeof e;
                var it = typeof itemVal;
                if (st == et && et == it) {
                    return s < itemVal && itemVal < e;
                }
            }
        } else if ('in' == rule) {
            if (_.isArray(condVal)) {
                return _.contains(condVal, itemVal);
            }
        }
        return true;
    }

    /**
     * [sortBy 对所有缓存数据，按照规则进行排序]
     * @param  {[type]} rule [排序规则 {'字段名称': 'desc | asc'}]
     * @return {[type]}      [description]
     */
    sortBy(rule) {
        for (var k in this.cache) {
            var v = this.cache[k];
            var data = v['list'];
            v['list'] = this.sortByUnit(rule, list);
            this.refreshList(k);
        }
    }

    /**
     * [sortByUnit 对单个数据列表进行排序]
     * @param  {[type]} rule [排序规则 {'字段名称': 'desc | asc'}]
     * @param  {[type]} list [当前数据列表]
     * @return {[type]}      [description]
     */
    sortByUnit(rule, list) {
        if (!_.isObject(rule)) return;
        var ret = null;
        var prev = null;
        for (var field in rule) {
            var order = rule[field];
            if (ret) {
                ret = this.sortByMutil(ret, prev, field, order);
            } else {
                ret = this.sortByUnitFunc(field, order, list);
                for (var i in ret) {
                    var v = ret[i];
                    v['_nsIndex'] = i;
                }
            }
            prev = field;
        }
        if (!ret) return list;
        return ret;
    }

    /**
     * [sortByMutil description]
     * @param  {[type]} ret  [description]
     * @param  {[type]} prev [description]
     * @return {[type]}      [description]
     */
    sortByMutil(ret, prev, field, order) {
        var group = _.groupBy(ret, prev);
        for (var k in group) {
            var v = group[k];
            if (v.length > 1) {
                var iList = _.pluck(v, '_nsIndex');
                var min = _.min(iList);
                var tr = this.sortByUnitFunc(field, order, iList);
                for (var i in tr) {
                    var item = tr[i];
                    item['_nsIndex'] = min + i;
                }
            }
        }
        return ret;
    }

    /**
     * [sortByUnitFunc 根据字段与排序规则，进行排序]
     * @param  {[type]} field [字段名称]
     * @param  {[type]} order [排序规则]
     * @param  {[type]} list  [缓存列表数据]
     * @return {[type]}       [description]
     */
    sortByUnitFunc(field, order, list) {
        var ret = _.sortBy(list, field);
        if (order == 'desc') ret = ret.reverse();
        return ret;
    }

    /**
     * [clear 清空缓存数据]
     * @return {[type]} [description]
     */
    clear() {
        for (var k in this.cache) {
            var v = this.cache[k];
            var noClear = v['noClear'];
            if(!noClear) delete this.cache[k];
        }
    }
}

export default new nsCacheOperator();
