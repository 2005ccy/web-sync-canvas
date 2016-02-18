(function() {
    window = window || {};
    window.persistenceUtils = {};

    // 默认数据表
    persistenceUtils.defTable = 'WSC_TABLE';
    // 默认数据表字段
    persistenceUtils.defTableFields = 'WSC_TABLE_FIELDS';

    // 需要持久化的表结构
    persistenceUtils.tableMap = {
        'CACHE_TABLE': [{
            fieldName: 'name',
            fieldType: 'TEXT',
            tableName: 'CACHE_TABLE',
            version: 16
        }, {
            fieldName: 'desc',
            fieldType: 'TEXT',
            tableName: 'CACHE_TABLE',
            version: 1
        }]
    };

    // 定义默认表结构
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
            version: 'INT',
            validate: 'JSON',
        });


        Table.hasMany('fields', TableFields, 'tableId');

        // 构建默认表
        persistence.schemaSync(null, function() {
            // 定义其他实体
            persistenceUtils.initOther();
        });
    }

    // 定义其他表结构
    persistenceUtils.initOther = function() {
        var DefTable = persistence.define(persistenceUtils.defTable);
        // 遍历表结构
        for (var key in persistenceUtils.tableMap) {
            var v = persistenceUtils.tableMap[key];

            var def = {};
            for (var i in v) {
                var d = v[i];
                def[d.fieldName] = d.fieldType;
            }
            if (!_.isEmpty(def) && !persistence.isDefined(key)) {
                persistence.define(key, def);
            }
        }
    }

    // 定义其他表结构
    persistenceUtils.addDefTable = function() {
        var DefTable = persistence.define(persistenceUtils.defTable);
        // 遍历表结构
        for (var key in persistenceUtils.tableMap) {
            var v = persistenceUtils.tableMap[key];

            for (var i in v) {
                var d = v[i];

                var dr = new DefTable(d);
                persistence.add(dr);
            }
        }
        persistenceUtils.flush();
    }

    // 定义其他表结构
    persistenceUtils.matchTable = function(currentTables) {
        var map = persistenceUtils.tableMap;
        for (var k in map) {
            // field list
            var v = map[k];
            var m = currentTables[k];

            if (v.length != m.length) return false;

            for (var i in v) {
                // field
                var vv = v[i];
                var fn = vv.fieldName;
                var ft = vv.fieldType;
                var fv = vv.version;

                var fm = false;
                for (var j in m) {
                    var jv = m[j];
                    var fnj = jv.fieldName;
                    var ftj = jv.fieldType;
                    var fvj = jv.version;

                    if (fn === fnj) {
                        if (ft !== ftj || fv !== fvj) return false;
                        fm = true;
                    }
                }
                if (!fm) return false;
            }
        }
        return true;
    }

    // 同步表到新结构
    persistenceUtils.syncTable = function() {

        if (persistence.isDefined(persistenceUtils.defTable)) {
            // 存在实体，获得对象类
            var DefTable = persistence.define(persistenceUtils.defTable);
            DefTable.all().list(null, function(results) {

                // 如果默认表中没有数据，插入其他表
                if (_.isEmpty(results)) {
                    persistence.schemaSync(null, function() {
                        persistenceUtils.addDefTable();
                    });
                    return;
                }

                // 转换结构
                var currentTables = _.groupBy(results, 'tableName');
                if (!persistenceUtils.matchTable(currentTables)) {

                    // 打包数据   XXXXXXXXXXXX 构建自定义数据读取函数
                    // persistence.dump(null, persistenceUtils.entityList, function(dump) {
                    var dump = {
                        'CACHE_TABLE': [{ 'id': 'D025F99DBACF42D794A8AAF6F3026666', 'name': 'aaaaaa', 'desc': '11111111111' }, { 'id': '9CBDA5BAB8314E6D960DE451A637777', 'name': 'bbbbbb', 'desc': '22222222222' }]
                    };

                    // 删除表结构
                    persistence.reset(null, function() {

                        // 重新构建表结构
                        persistence.schemaSync(null, function() {

                            // 添加默认表数据
                            persistenceUtils.addDefTable();

                            // 加载打包数据
                            persistence.load(null, dump, function() {

                            });
                        });
                    });
                    // });
                    // 表结构相同，且为缓冲存储
                } else if (persistenceUtils.isMemory) {
                    persistence.loadFromLocalStorage();
                }
            });
        }
    }

    // 开始执行
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

        // 同步表结构
        persistenceUtils.syncTable();
    }

    // 持久化数据
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
