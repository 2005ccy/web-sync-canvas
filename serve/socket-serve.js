/*!
 * SocketServe socket.io 服务类
 * Copyright(c) 2016 Bruce Chen.
 * MIT Licensed
 */
var client = require('socket.io-client');
var serveList = require('./config/config.js').wscServeList;

'use strict';

// 导出socket 服务
module.exports = SocketServe;

/**
 * [SocketServe 构造函数]
 */
function SocketServe() {

}

SocketServe.prototype.initPost = function(io) {
    var that = this;
    io.of('/post');
}

SocketServe.prototype.initGet = function(io) {
    var that = this;
    io.of('/get');
}

SocketServe.prototype.initPut = function(io) {
    var that = this;
    io.of('/put');
}

SocketServe.prototype.initDelete = function(io) {
    var that = this;
    io.of('/delete');
}



/**
 * [syncEntity 同步单条数据]
 * @param  {[type]} entity [description]
 * @return {[type]}        [description]
 */
SocketServe.prototype.syncEntity = function(entity) {
    if (!entity || !this.sync) return;
    this.sync.emit('syncEntity', entity, function(data) {

    });
}

/**
 * [syncEvent 同步操作相关事件]
 * @param  {[type]} socket [description]
 * @return {[type]}        [description]
 */
SocketServe.prototype.syncEvent = function(socket) {
    if (!socket) return;
    var that = this;
    this.sync = socket;

    // 同步表结构
    socket.on('sync', function(param, fn) {
        // 登录成功，回调方法
        // fn('woot');
    });
}


SocketServe.prototype.initSync = function(io) {
    if (!io) return;
    var that = this;
    io.of('/sync').on('connection', function(socket) {
        // 定义同步事件
        that.syncEvent(socket);
    });
}

/**
 * [userEvent 用户操作相关事件]
 * @param  {[type]} socket [socket对象]
 * @return {[type]}        [description]
 */
SocketServe.prototype.userEvent = function(socket) {
    if (!socket) return;
    var that = this;
    this.user = socket;

    // 用户登录事件
    socket.on('login', function(param, fn) {
        // 登录成功，回调方法
        // fn('woot');
    });

    // 用户注销事件
    socket.on('logout', function(param, fn) {
        // 登录成功，回调方法
        // fn('woot');
    });
}

/**
 * [initUser 初始化用户相关操作]
 * @param  {[type]} io [socketio对象]
 * @return {[type]}    [description]
 */
SocketServe.prototype.initUser = function(io) {
    if (!io) return;
    var that = this;
    // 连接用户相关操作
    io.of('/user').on('connection', function(socket) {
        // 用户操作连接断开
        socket.on('disconnect', function() {

        });
        // 定义用户事件
        that.userEvent(socket);
    });
}

/**
 * [syncServeList 同步服务器间列表]
 * @param  {[type]} list [实体列表]
 * @return {[type]}      [description]
 */
SocketServe.prototype.syncServeList = function(list) {
    if (!this.serve || !list || list.length == 0) return;
    this.serve.broadcast.emit('syncServeList', list, function(data) {

    });
}

/**
 * [syncServeEntity 同步服务器间实体]
 * @param  {[type]} entity [被用户修改实体]
 * @return {[type]}        [description]
 */
SocketServe.prototype.syncServeEntity = function(entity) {
    if (!entity || !this.serve) return;
    this.serve.broadcast.emit('syncServeEntity', entity, function(data) {

    });
}

/**
 * [serveClientEvent 服务器客户端，监听事件]
 * @param  {[type]} socket [客户端socket]
 * @return {[type]}        [description]
 */
SocketServe.prototype.serveClientEvent = function(socket) {
	if (!socket) return;
    var that = this;

    // 某服务器，与当前服务器进行连接
    socket.on('connect', function() {

    });

   	// 同步服务器间实体
    socket.on('syncServeEntity', function(entity, fn) {
    	// 同步实体
    	// 回调服务器函数 fn()
    });

    // 同步服务器间列表
    socket.on('syncServeList', function(list, fn) {
    	// 同步实体
    	// 回调服务器函数 fn()
    });

    // 某服务器断开相关链接
    socket.on('disconnect', function() {

    });
}

/**
 * [serveEvent 服务器客户端，连接其他服务器]
 * @param  {[type]} socket [socket对象]
 * @param  {[type]} url    [当前服务器访问路径]
 * @return {[type]}        [description]
 */
SocketServe.prototype.serveEvent = function(socket, url) {
    if (!socket) return;
    var that = this;
    this.serve = socket;
    // 遍历现有服务器
    if (serveList && serveList.length > 1) {
        for (var i in serveList) {
            var serve = serveList[i];
            if (serve == url) continue;
            // 初始化客户端，连接其余服务器
            var sc = client(serve);
            that.serveClientEvent(sc);
        }
    }
}

/**
 * [initServe 初始化服务器间相关操作]
 * @param  {[type]} io  [socketio对象]
 * @param  {[type]} url [当前服务器访问路径]
 * @return {[type]}     [description]
 */
SocketServe.prototype.initServe = function(io, url) {
    if (!io) return;
    var that = this;
    // 连接用户相关操作
    io.of('/serve').on('connection', function(socket) {
        // 用户操作连接断开
        socket.on('disconnect', function() {

        });
        // 定义用户事件
        that.serveEvent(socket, url);
    });
}

/**
 * [init 初始化socket服务]
 * @param  {[type]} io [socketio对象]
 * @return {[type]}    [description]
 */
SocketServe.prototype.init = function(io, url) {
    if (!io) return;
    this.initPost(io);
    this.initGet(io);
    this.initPut(io);
    this.initDelete(io);
    this.initSync(io);
    this.initUser(io);
    this.initServe(io, url);
}
