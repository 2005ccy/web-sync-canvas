(function() {
    window = window || {};
    window.persistenceUtils = {};

    // 默认数据表
    persistenceUtils.defTable = 'WSC_TABLE';
    // 当前表结构
    persistenceUtils.currentTables = {};

    // 需要持久化的表结构
    persistenceUtils.tableMap = {
        '': {

            'version': '1.0'
        },
    };

    // 初始化数据库
    persistenceUtils.init = function() {

        // 定义实体对象
        var DefTable = persistence.define(persistenceUtils.defTable, {
            fieldName: "TEXT",
            fieldType: "TEXT",
            tableName: "TEXT",
            version: "INT"
        });
    }

    persistenceUtils.getCurrentTables = function() {
        if (persistence.isDefined(persistenceUtils.defTable)) {
            // 存在实体，获得对象类
            var DefTable = persistence.define(persistenceUtils.defTable);
            DefTable.all().list(null, function(results) {

            });
        }
    }

    // 同步表到新结构
    persistenceUtils.syncTable = function() {

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

            // 同步localStorage 数据到缓存
            if (persistenceUtils.isMemory) {

            }

            
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
            _.isFunction(callback) callback();
    	});
    }

    // 开始执行数据库
    persistenceUtils.start();

})();
