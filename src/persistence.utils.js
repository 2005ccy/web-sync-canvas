(function() {
    window = window || {};
    window.persistenceUtils = {};

    // 默认数据表
    persistenceUtils.defTable = 'WSC_TABLE';

    // 需要持久化的表结构
    persistenceUtils.tableMap = {
        'CACHE_TABLE': [{
            fieldName: 'name',
            fieldType: 'TEXT',
            tableName: 'CACHE_TABLE',
            version: 1
        }, {
            fieldName: 'desc',
            fieldType: 'TEXT',
            tableName: 'CACHE_TABLE',
            version: 1
        }]
    };

    // 定义默认表结构
    persistenceUtils.init = function() {

        // 定义实体对象
        return persistence.define(persistenceUtils.defTable, {
            fieldName: 'TEXT',
            fieldType: 'TEXT',
            tableName: 'TEXT',
            version: 'INT'
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

                var dr = new DefTable(d);
                persistence.add(dr);
            }
            if (!_.isEmpty(def)) persistence.define(key, def);
        }
        persistenceUtils.flush();
    }

    // 定义其他表结构
    persistenceUtils.matchTable = function(currentTables) {

    }

    // 同步表到新结构
    persistenceUtils.syncTable = function() {

        if (persistence.isDefined(persistenceUtils.defTable)) {
            // 存在实体，获得对象类
            var DefTable = persistence.define(persistenceUtils.defTable);
            DefTable.all().list(null, function(results) {

                // 如果默认表中没有数据，插入其他表
                if (_.isEmpty(results)) {
                    persistenceUtils.initOther();
                    persistence.schemaSync();
                    return;
                }

                // 转换结构
                var currentTables = _.groupBy(results, 'tableName');
                if (!persistenceUtils.matchTable(currentTables)) {

                    // 返回表明列表
                    var keys = _.keys(currentTables);

                    // 获得表的构造函数
                    var tableList = _.map(keys, function(key) {
                        return persistence.define(key);
                    });

                    // 打包数据
                    persistence.dump(null, tableList, function(dump) {
                        // 删除表结构
                        persistence.reset(null, function() {
                            // 定义默认表
                            var DefTable = persistenceUtils.init();

                            persistence.schemaSync(null, function() {

                                // 定义其他表
                                persistenceUtils.initOther();

                                // persistence 同步数据库
                                persistence.schemaSync(null, function() {

                                    // 加载打包数据
                                    persistence.load(null, dump, function() {

                                    });
                                });
                            });
                        });
                    });
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

        // persistence 同步数据库
        persistence.schemaSync(null, function() {
            // 同步表结构
            persistenceUtils.syncTable();
        });
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
