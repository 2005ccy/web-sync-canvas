/*!
 * SocketServe socket.io 服务类
 * Copyright(c) 2016 Bruce Chen.
 * MIT Licensed
 */

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
	if(!entity || !this.sync) return;
	this.sync.emit('syncEntity', entity, function (data) {
      
    });
}

/**
 * [syncEvent 同步操作相关事件]
 * @param  {[type]} socket [description]
 * @return {[type]}        [description]
 */
SocketServe.prototype.syncEvent = function(socket) {
	if(!socket) return;
	var that = this;
	this.sync = socket;

	// 同步表结构
    socket.on('sync', function(param, fn) {
    	// 登录成功，回调方法
        // fn('woot');
    });
}


SocketServe.prototype.initSync = function(io) {
	if(!io) return;
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
	if(!socket) return;
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
	if(!io) return;
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
 * [init 初始化socket服务]
 * @param  {[type]} io [socketio对象]
 * @return {[type]}    [description]
 */
SocketServe.prototype.init = function(io) {
	if(!io) return;
    this.initPost(io);
    this.initGet(io);
    this.initPut(io);
    this.initDelete(io);
    this.initSync(io);
    this.initUser(io);
}