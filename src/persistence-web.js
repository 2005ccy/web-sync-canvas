(function() {
    window = window || {};
    window.persistenceUtils = {};

    // 默认数据表
    persistenceUtils.defTable = 'WSC_TABLE';
    // 默认数据表字段
    persistenceUtils.defTableFields = 'WSC_TABLE_FIELDS';

    // 需要持久化的表结构
    persistenceUtils.tableList = window.wscTables;

    /**
     * [init 初始化默认表结构]
     * @return {[type]} [description]
     */
    persistenceUtils.init = function() {

        // 定义表
        var Table = persistence.define(persistenceUtils.defTable, {
            tableName: 'TEXT',
            version: 'INT',
            relation: 'JSON'
        });

        // 定义表字段
        var TableFields = persistence.define(persistenceUtils.defTableFields, {
            fieldName: 'TEXT',
            fieldType: 'TEXT',
            validate: 'JSON'
        });

        Table.hasMany('fields', TableFields, 'table');
    }

    /**
     * [initOther 初始化其他表信息]
     */
    persistenceUtils.initOther = function() {

        // 表关系map
        var relationMap = {};
        // 实体map
        var entityMap = {};
        // 其余表的配置信息
        var tl = persistenceUtils.tableList || [];
        // 遍历表结构
        for (var i in tl) {
            var t = tl[i];
            var key = t.tableName;

            // 手机字段类型
            var def = {};
            for (var i in t.fields) {
                var d = t.fields[i];
                def[d.fieldName] = d.fieldType;
            }

            if (!_.isEmpty(def)) {
                // 定义表结构
                var e = persistence.define(key, def);
                // 记录表关系
                if (!_.isEmpty(t.relation) && _.isArray(t.relation)) {
                    relationMap[key] = t.relation;
                }
                // 记录实体
                entityMap[key] = e;
            }
        }
        // 创建表关系
        if (!_.isEmpty(relationMap)) {
            for (var k in relationMap) {
                var rl = relationMap[k];
                var e = entityMap[k];
                for (var i in rl) {
                    var r = rl[i];
                    // 建立一对多的关系
                    if (r.relationType === 'hasMany') {
                        e.hasMany(r.relationField, entityMap[r.targetEntity], r.targetField);
                        // 创建一对一的关系
                    } else if (r.relationType === 'hasOne') {
                        e.hasOne(r.relationField, entityMap[r.targetEntity]);
                    }
                }
            }
        }
    }

    /**
     * [addDefTable 将表配置文件，插入数据库]
     */
    persistenceUtils.addDefTable = function() {
        var DefTable = persistence.define(persistenceUtils.defTable);
        var DefTableFields = persistence.define(persistenceUtils.defTableFields);
        // 遍历表结构
        var tl = persistenceUtils.tableList || [];
        for (var i in tl) {
            var t = tl[i];

            // 向默认表中添加数据
            var r = t.relation || [];
            var dr = new DefTable({
                'tableName': t.tableName,
                'version': t.version,
                'relation': r
            });
            persistence.add(dr);

            // 向默认字段表中添加数据
            for (var j in t.fields) {
                var f = t.fields[j];

                var v = f.validate || [];
                var dtf = new DefTableFields({
                    fieldName: f.fieldName,
                    fieldType: f.fieldType,
                    table: dr,
                    validate: v
                });
                persistence.add(dtf);
            }
        }
        // 执行数据插入
        persistenceUtils.flush();
    }

    /**
     * [matchTable 表配置数据与数据库中表数据是否匹配]
     * @param  {[type]} tableList [数据库中表]
     * @return {[type]}           [description]
     */
    persistenceUtils.matchTable = function(tableList) {
        // 配置表数据
        var tl = persistenceUtils.tableList || [];
        // 表的个数不相同
        if (tl.length !== tableList.length) return false;
        // 遍历配置表与数据表比对
        for (var i in tl) {
            // field list
            var t = tl[i];
            var tn = t.tableName;
            var tv = t.version;

            var fm = false;
            for (var i in tableList) {
                // field
                var v = tableList[i];
                var vn = v.tableName;
                var vv = v.version;
                // 是否表相同
                if (tn === vn) {
                    fm = true;
                    // 是否版本相同
                    if (tv != vv) return false;
                }
            }
            // 配置表为新表
            if (!fm) return false;
        }
        return true;
    }

    /**
     * [initOldRelation 执行原有数据库的关系]
     * @param  {[type]} i           [当前索引]
     * @param  {[type]} size        [表个数]
     * @param  {[type]} relationMap [关系缓存]
     * @param  {[type]} entityMap   [实体缓存]
     * @param  {[type]} callback    [执行完的回调]
     * @return {[type]}             [description]
     */
    persistenceUtils.initOldRelation = function(i, size, relationMap, entityMap, callback) {
        if (i == size) {
            if (!_.isEmpty(relationMap)) {
                for (var k in relationMap) {
                    var rl = relationMap[k];
                    var e = entityMap[k];
                    for (var i in rl) {
                        var r = rl[i];
                        // 两表建立一对多关系
                        if (r.relationType === 'hasMany') {
                            e.hasMany(r.relationField, entityMap[r.targetEntity], r.targetField);
                        } else if (r.relationType === 'hasOne') {
                            e.hasOne(r.relationField, entityMap[r.targetEntity]);
                        }
                    }
                }
            }
            _.isFunction(callback) && callback();
        }
    }

    /**
     * [initOld 定义老的表结构]
     * @param  {[type]} tableList [数据库中表结构]
     * @return {[type]}           [description]
     */
    persistenceUtils.initOld = function(tableList, callback) {

        var relationMap = {};
        var entityMap = {};

        var tl = tableList || [];
        var size = tl.length;
        var index = 0;

        // 遍历表结构
        for (var i in tl) {
            var t = tl[i];
            var tn = t.tableName;
            // 查询表的字段数据
            t.fields.list(function(list) {
                // 字段名称：字段类型
                var fd = {};
                for (var j in list) {
                    var f = list[j];
                    fd[f.fieldName] = f.fieldType;
                }
                if (!_.isEmpty(def)) {
                    // 定义表结构
                    var e = persistence.define(key, fd);
                    // 缓存关系数据
                    if (!_.isEmpty(t.relation) && _.isArray(t.relation)) {
                        relationMap[key] = t.relation;
                    }
                    // 缓存实体
                    entityMap[tn] = e;
                    // 初始化表之间关系
                    persistenceUtils.initOldRelation(++index, size, relationMap, entityMap, callback);
                }
            });
        }
    }

    /**
     * [syncTable 同步数据库为配置数据]
     * @return {[type]} [description]
     */
    persistenceUtils.syncTable = function() {

        if (persistence.isDefined(persistenceUtils.defTable)) {
            // 存在实体，获得对象类
            var DefTable = persistence.define(persistenceUtils.defTable);
            // 查询数据库表数据
            DefTable.all().list(null, function(results) {

                // 如果默认表中没有数据，插入其他表
                if (_.isEmpty(results)) {
                    // 定义其他数据对象
                    persistenceUtils.initOther();
                    // 加载默认数据
                    persistence.schemaSync(null, function() {
                        persistenceUtils.addDefTable();
                    });
                    return;
                }

                // 配置与当前数据对比
                if (!persistenceUtils.matchTable(results)) {
                    // 定义现有表结构
                    persistenceUtils.initOld(results, function() {
                        // 读取现有数据
                        persistence.dump(function(dump) {
                            // 删除表结构
                            persistence.reset(null, function() {

                                // 定义其他数据对象
                                persistenceUtils.initOther();
                                // 重新构建表结构
                                persistence.schemaSync(null, function() {

                                    // 添加默认表数据
                                    persistenceUtils.addDefTable();
                                    // 加载打包数据
                                    if (dump) {
                                        delete dump[persistenceUtils.defTable];
                                        delete dump[persistenceUtils.defTableFields];
                                        // 将老数据同步到新的表中
                                        persistence.load(null, dump, function() {

                                        });
                                    }
                                });
                            });
                        });
                    });
                    // 如果为缓冲，加载localStorage数据
                } else if (persistenceUtils.isMemory) {
                    persistence.loadFromLocalStorage();
                }
            });
        }
    }

    /**
     * [start 数据加载]
     * @return {[type]} [description]
     */
    persistenceUtils.start = function() {

        if (location.protocol == "file:") {
            alert("Didn't you read the README ? You need to load this page from a server.");
        }
        // 配置数据库操作
        if (window.openDatabase) {
            persistence.store.websql.config(persistence, "persistenceUtils", 'database', 5 * 1024 * 1024);
        } else {
            persistenceUtils.isMemory = true;
            persistence.store.memory.config(persistence);
        }

        // 初始化表结构
        persistenceUtils.init();

        // 构建默认表
        persistence.schemaSync(null, function() {
            // 同步表结构
            persistenceUtils.syncTable();
        });
    }

    /**
     * [validate 验证数据格式]
     * @param  {[type]} entity [实体值]
     * @return {[type]}        [description]
     */
    persistenceUtils.validate = function(entity) {

        return true;
    }

    /**
     * [add 添加数据并验证数据合法性]
     * @param {Function} callback [description]
     */
    persistenceUtils.add = function(entity, callback) {

    }

    /**
     * [flush 持久化数据，并同步到后台，或是缓存到localStorage]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    persistenceUtils.flush = function(callback) {
        persistence.flush(null, function() {
            // 同步缓存数据到 localStorage
            if (persistenceUtils.isMemory) {
                persistence.saveToLocalStorage();
            }
            // 执行回调函数
            _.isFunction(callback) && callback();
        });
    }

    // 开始执行数据库
    persistenceUtils.start();

})();
