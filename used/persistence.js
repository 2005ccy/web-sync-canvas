// 判断是否为服务器访问
if (location.protocol == "file:") {
    alert("Didn't you read the README ? You need to load this page from a server.");
}
// 查看浏览器是否支持websql
if (window.openDatabase) {
    // 配置数据库
    persistence.store.websql.config(persistence, "jquerymobile", 'database', 5 * 1024 * 1024);
} else {
    // 配置浏览器 {}单页存储，刷新页面后数据消失
    persistence.store.memory.config(persistence);

    // 从localStorage 中加载数据，最大5M
    // window.localStorage.getItem('key');
    persistence.loadFromLocalStorage(function() {
        alert("All data loaded!");
    });

    // 将数据存储到localStorage
    // window.localStorage.setItem('key', 'value');
    persistence.saveToLocalStorage(function() {
        alert("All data saved!");
    });
}

// 定义实体对象
persistence.define('Page', {
    path: "TEXT",
    data: "TEXT",
});

// 构建数据库表
persistence.schemaSync();

$('#reset').click(function() {
    // 重构数据库
    persistence.reset();
    persistence.schemaSync();
    return false;
});

// 对数据进行，新增或修改操作
// 持久器是否entityName 字符串名称的实体
if (persistence.isDefined(entityName)) {
    // 存在实体，获得对象类
    var Form = persistence.define(entityName);

    // 读取表单数据 obj

    // 实例化对象数据
    var entity = new Form(obj);
    // 将数据插入缓存
    persistence.add(entity);
    // 持久化数据到数据库
    persistence.flush();
}

// 根据已知的字段，查询值
// 持久器是否entityName 字符串名称的实体
if (persistence.isDefined(entityName)) {
    // 存在实体，获得对象类
    var Form = persistence.define(entityName);
    // 根据字段名，字段值查询数据
    Form.findBy(field, value, function(data) {
        // 数据库中存在该值
        if (data) {

            // 数据库中不存在该值
        } else {

        }
    });
}

// 持久化数据时，使用特定事务
persistence.transaction(function(tx) {
  persistence.flush(tx, function() {
    alert('Done flushing!');
  });
});

// 持久化数据时，使用一个全新事务
persistence.flush();
// or, with callback
persistence.flush(function() {
  alert('Done flushing');
});

/*
TEXT: 文本类型 for textual data
INT:   数值类型 for numeric values
BOOL: 布尔类型 for boolean values (true or false)
DATE: 日期时间类型 for date/time value (精确到秒 with precision of 1 second)
JSON:  任意JSON格式。该类型不能使用 filter、sort。该类型值被修改后, 需要调用 anObj.markDirty('jsonPropertyName')  标准属性状态，再执行persistence.flush 持久化数据    a special type that can be used to store arbitrary JSON data. Note that this data can not be used to filter or sort in any sensible way. If internal changes are made to a JSON property, persistence.js may not register them. Therefore, a manual call to anObj.markDirty('jsonPropertyName') is required before calling persistence.flush.
 */

// 是否为每个表的主键字段 'id'
persistence.isImmutable(fieldName)

// 关联表新建
var Task = persistence.define('Task', {
  name: "TEXT",
  description: "TEXT",
  done: "BOOL"
});

var Category = persistence.define('Category', {
  name: "TEXT",
  metaData: "JSON"
});

Category.hasMany('tasks', Task, 'category');

persistence.schemaSync();

var c = new Category({name: "Main category"});
persistence.add(c);
for ( var i = 0; i < 5; i++) {
  var t = new Task();
  t.name = 'Task ' + i;
  t.done = i % 2 == 0;
  t.category = c;
  persistence.add(t);
}

persistence.flush();

var C = persistence.define('Category');
C.load('ADD3177F6FF146CC85A8770B45B136E7', function(d) {
   d.tasks.list(function(ls) {
      console.info(JSON.stringify(ls));
   });
});