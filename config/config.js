// 服务器列表
var serveList = [
    'http://localhost'
];

// 表结构列表
var tables = [{
    tableName: 'Category',
    version: 1,
    relation: [{
        relationType: 'hasMany',
        relationField: 'tasks',
        targetEntity: 'Task',
        targetField: 'category'
    }],
    fields: [{
        fieldName: 'name',
        fieldType: 'TEXT',
        validate: [{
            type: 'required',
            msg: ''
        }]
    }, {
        fieldName: 'metaData',
        fieldType: 'JSON',
        validate: []
    }]
}, {
    tableName: 'Task',
    version: 1,
    relation: [],
    fields: [{
        fieldName: 'name',
        fieldType: 'TEXT',
        validate: [{
            required: true
        }]
    }, {
        fieldName: 'description',
        fieldType: 'TEXT',
        validate: []
    }, {
        fieldName: 'done',
        fieldType: 'BOOL',
        validate: [{
            required: true
        }]
    }]
}];



// 服务器端数据导出
if (typeof exports !== 'undefined') {
	exports.wscTables = tables;
    exports.wscServeList = serveList;
// web端数据导出
} else {
	window = window || {};
	window.wscTables = tables;
    window.wscServeList = serveList;
}
