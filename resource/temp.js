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
        if(data) {

        // 数据库中不存在该值
        } else {

        }
    });
}
