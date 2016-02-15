// 任务验证者类
class nsTaskValidator {

    // 角色code码
    NOT_PROJECT_MEMBER = '59008';
    PROJECT_MEMBER = '59007';
    SUB_TASK_JOIN_USER = '59006';
    SUB_TASK_VALIDATOR = '59005_5';
    SUB_TASK_FINISH_USER = '59005';
    SUB_TASK_CREATE_USER = '59004';
    TASK_JOIN_USER = '59006';
    TASK_VALIDATOR = '59002_5';
    TASK_FINISH_USER = '59002';
    TASK_CREATE_USER = '59001';
    PROJECT_MANAGAR = '59000';

    NOT_OPERATE_TYPE = 0;
    NOT_PERMISSION = -1;
    VALID_SUCCESS = 1;

    // 任务操作验证规则
    validMap = {
        '59007,59006,59005_5,59005,59004': {
            'desc': '子任务全体项目成员',
            'claimFinishUserSubTask': [this.checkClaimFinishUser],
            'claimValidatorSubTask': [this.checkClaimValidator],
            'finishPage->validatePage': [this.checkClaimValidator],
            'changeTaskStatusSubTask': [this.checkClaimValidator],
            'changeTaskStatus': [this.checkClaimValidator],
            'addOwnerJoinUserSubTask': true,
            'deleteOwnerJoinUserSubTask': true,
            'uploadOwnerTaskFileSubTask': true,
            'deleteOwnerTaskFileSubTask': true,
            'addOwnerTaskRemarkSubTask': true,
            'deleteOwnerTaskRemarkSubTask': true,
            'addSprintTaskCategorySubTask': true,
        },
        '59008': {
            'desc': '非项目成员',
        },
        '59007': {
            'desc': '项目成员',
        },
        '59006': {
            'desc': '子任务关注者 及 任务关注者',
        },
        '59005_5,59005,59004,59002,59001,59000': {
            'desc': '子任务验证者以上权限',
            'changeTaskNameSubTask': true,
            'changeTaskDescSubTask': true,
            'changeTaskAddrSubTask': true,
            'assignValidatorSubTask': true,
            'changeImportantSubTask': true,
            'changeTaskCateSubTask': true,
            'changeTaskStatusSubTask': true,
        },
        '59005_5': {
            'desc': '子任务验证者',
        },
        '59005': {
            'desc': '子任务执行者',
        },
        '59004,59002,59001,59000': {
            'desc': '子任务创建者以上权限',
            'deleteTaskSubTask': true,
            'changeEndDateSubTask': true,
            'deleteOtherTaskFileSubTask': true,
            'deleteOtherTaskRemarkSubTask': true,
        },
        '59004': {
            'desc': '子任务创建者',
        },
        '59007,59006,59005_5,59002,59001,59000': {
            'desc': '全体项目成员',
            'createTask': true,
            'claimFinishUser': [this.checkClaimFinishUser],
            'claimValidator': [this.checkClaimValidator],
            'addOwnerJoinUser': true,
            'deleteOwnerJoinUser': true,
            'uploadOwnerTaskFile': true,
            'deleteOwnerTaskFile': true,
            'addOwnerTaskRemark': true,
            'deleteOwnerTaskRemark': true,
            'addSprintTaskCategory': true,
        },
        '59002_5,59002,59001,59000': {
            'desc': '验证者以上权限',
            'changeTaskName': true,
            'changeTaskDesc': true,
            'changeTaskAddr': true,
            'assignValidator': true,
            'changeImportant': true,
            'changeTaskCate': true,
            'changeTaskStatus': true,
        },
        '59002_5': {
            'desc': '任务验证者',
        },
        '59002,59001,59000': {
            'desc': '执行者以上权限',
            'assignFinishUser': true,
            'addOtherJoinUser': true,
            'deleteOtherJoinUser': true,
            'addTaskGitBranch': true,
            'addTaskSubTask': true,
        },
        '59002': {
            'desc': '任务执行者',
            
            'finishPage->validatePage': [this.isChildTask],
            'validatePage->endPage': [this.isChildTask],
            'validatePage->finishPage': [this.isChildTask],
            'validatePage->needDoPage': [this.isChildTask],
            'endPage->validatePage': [this.isChildTask]
        },
        '59001,59000': {
            'desc': '创建者以上权限',
            'deleteTask': true,
            'changeEndDate': true,
            'deleteOtherTaskFile': true,
            'deleteOtherTaskRemark': true,
        },
        '59005,59004,59002,59001,59000': {
            'desc': '项目负责人/任务创建者/子任务创建者/  任务执行者/子任务执行者',
            'assignFinishUserSubTask': true,
            'addOtherJoinUserSubTask': true,
            'deleteOtherJoinUserSubTask': true,
            'addTaskGitBranchSubTask': true,

            'needDoPage->doingPage': true,
            'doingPage->needDoPage': true,
            'doingPage->finishPage': true,
            'finishPage->doingPage': true,            
        },
        '59005_5,59002_5,59004,59001,59000': {
            'desc': '项目负责人/任务创建者/子任务创建者/  任务验证者/子任务验证者',
            'finishPage->validatePage': true,
            'validatePage->endPage': true,
            'validatePage->finishPage': true,
            'validatePage->needDoPage': true,
            'endPage->validatePage': true,
        },
        '59001': {
            'desc': '任务创建者',
        },
        '59000': {
            'desc': '项目负责人',
            'transferTaskSubTask': true,
        }
    };

    titlePageMap = {
        '待开发': 'needDoPage',
        '开发中': 'doingPage',
        '待验证': 'finishPage',
        '已完成': 'endPage',
        '验证中': 'validatePage'
    };

    pageStatusMap = {
        'needDoPage': '17001',
        'doingPage': '17002',
        'finishPage': '17003',
        'endPage': '17004',
        'validatePage': '17007'
    };

    // 任务对象
    task = null;
    // 操作名称
    operate = null;
    // 本人对当前权限的操作
    taskRoleArr = [];
    // 操作数组
    operateArr = [];

    /**
     * [constructor 验证器构造函数]
     * @return {[type]} [description]
     */
    constructor() {
        for (var k in this.validMap) {
            var v = this.validMap[k];
            for (var kk in v) {
                var vv = v[kk];
                if (kk == 'desc') continue;
                _.addList(this.operateArr, kk, true);
            }
        }
    }

    /**
     * [setTask 向任务验证器，设置任务]
     * @param {[type]} task [任务数据]
     */
    setTask(task) {
        this.task = task;
        if (task) this.setTaskRoleArr();
    }

    /**
     * [setTaskRoleArr 设置任务验证规则]
     */
    setTaskRoleArr() {
        this.taskRoleArr = [];

        this.addRole(this.task.authCode);

        this.addRole(this.PROJECT_MEMBER);
        this.addRoleSubTaskJoinUser();
        this.addRoleSubTaskValidator();
        this.addRoleSubTaskFinishUser();
        this.addRoleSubTaskCreateUser();

        this.addRoleTaskJoinUser();
        this.addRoleTaskValidator();
        this.addRoleTaskFinishUser();
        this.addRoleTaskCreateUser();
    }

    /**
     * [addRoleTaskCreateUser 添加任务创建者角色]
     */
    addRoleTaskCreateUser() {
        if (this.task.issubtask != '1' && this.task.createUser == nsCtx.user.loginName) {
            this.addRole(this.TASK_CREATE_USER);
        }
    }

    /**
     * [addRoleTaskFinishUser 增加任务执行者角色]
     */
    addRoleTaskFinishUser() {
        if (this.task.issubtask != '1' && this.task.finishLoginName == nsCtx.user.loginName) {
            this.addRole(this.TASK_FINISH_USER);
        }
    }

    /**
     * [addRoleTaskValidator 增加任务验证者角色]
     */
    addRoleTaskValidator() {
        if (this.task.issubtask != '1' && this.task.taskValidator == nsCtx.user.loginName) {
            this.addRole(this.TASK_VALIDATOR);
        }
    }

    /**
     * [addRoleTaskJoinUser 增加任务参与者角色]
     */
    addRoleTaskJoinUser() {
        if (this.task.issubtask != '1' && this.task.isfocus == '1') {
            this.addRole(this.TASK_JOIN_USER);
        }
    }

    /**
     * [addRoleSubTaskCreateUser 增加子任务创建者角色]
     */
    addRoleSubTaskCreateUser() {
        if (this.task.issubtask == '1' && this.task.createUser == nsCtx.user.loginName) {
            this.addRole(this.SUB_TASK_CREATE_USER);
        }
    }

    /**
     * [addRoleSubTaskFinishUser 增加子任务执行者角色]
     */
    addRoleSubTaskFinishUser() {
        if (this.task.issubtask == '1' && this.task.finishLoginName == nsCtx.user.loginName) {
            this.addRole(this.SUB_TASK_FINISH_USER);
        }
    }

    /**
     * [addRoleSubTaskValidator 增加子任务验证者角色]
     */
    addRoleSubTaskValidator() {
        if (this.task.issubtask == '1' && this.task.taskValidator == nsCtx.user.loginName) {
            this.addRole(this.SUB_TASK_VALIDATOR);
        }
    }

    /**
     * [addRoleSubTaskJoinUser 增加子任务参与者角色]
     */
    addRoleSubTaskJoinUser() {
        if (this.task.issubtask == '1' && this.task.isfocus == '1') {
            this.addRole(this.SUB_TASK_JOIN_USER);
        }
    }

    /**
     * [addRole 向角色数组增加角色]
     * @param {[type]} role [角色码]
     */
    addRole(role) {
        _.addList(this.taskRoleArr, role, true);
    }

    /**
     * [checkDeleteJoinUser 检查被删除的关注者是否被允许]
     * @param  {[type]} loginName [参与者loginName]
     * @return {[type]}           [true: 可以删除 | false: 不允许删除]
     */
    checkDeleteJoinUser(_this, param) {
        if (_this.task) {
            if (_this.task.createUser == param ||
                _this.task.finishLoginName == param ||
                _this.task.taskValidator == param) return false;
            return true;
        }
        return false;
    }

    /**
     * [checkClaimFinishUser 检查任务执行者认领，是否存在任务执行人]
     * @return {[type]}      [true: 可以认领 | false: 不能认领]
     */
    checkClaimFinishUser(_this, param) {
        return _this.task && !_this.task.finishLoginName;
    }

    /**
     * [checkClaimValidator 检查任务验证者认领，是否存在任务验证者]
     * @return {[type]}      [true: 可以认领 | false: 不能认领]
     */
    checkClaimValidator(_this, param) {
        return _this.task && !_this.task.taskValidator;
    }

    isChildTask(_this, param) {
        return _this.task && _this.task.issubtask == '1';
    }

    /**
     * [validate 验证当前用户操作任务的权限]
     * @return {[type]} [true: 可以操作 | false: 不允许操作]
     */
    validate(param) {
        if (!_.contains(this.operateArr, this.operate)) return this.NOT_OPERATE_TYPE;
        for (var i in this.taskRoleArr) {
            var v = this.taskRoleArr[i];
            var r = this.validateUnit(v, param);
            if (r) return this.VALID_SUCCESS;
        }
        return this.NOT_PERMISSION;
    }

    /**
     * [validateUnit 验证一种角色对当前任务的操作]
     * @param  {[type]} role  [一种角色]
     * @param  {[type]} param [调用参数]
     * @return {[type]}       [true: 允许当前角色操作 | false: 拒绝角色操作]
     */
    validateUnit(role, param) {
        for (var k in this.validMap) {
            var v = this.validMap[k];
            if (k.indexOf(role) > -1) {
                var r = this.validateOperate(v, param);
                if (r) return true;
            }
        }
        return false;
    }

    /**
     * [validateOperate 验证相关操作]
     * @param  {[type]} om    [操作对象]
     * @param  {[type]} param [调用参数]
     * @return {[type]}       [true: 允许操作 | false: 不允许操作]
     */
    validateOperate(om, param) {
        for (var k in om) {
            var v = om[k];
            if (k == this.operate) {
                if (_.isArray(v)) {
                    return this.validateOperCheckArr(v, param);
                } else if (v) return true;
            }
        }
        return false;
    }

    /**
     * [validateOperCheckArr 验证附件验证数组]
     * @param  {[type]} arr   [附件验证数组]
     * @param  {[type]} param [调用参数]
     * @return {[type]}       [true: 允许操作 | false: 拒绝操作]
     */
    validateOperCheckArr(arr, param) {
        for (var i in arr) {
            var v = arr[i];
            if (_.isFunction(v)) {
                var r = v(this, param);
                if (!r) return false;
            }
        }
        return true;
    }

    /**
     * [chageOperate 如果是子任务，修改操作名称]
     * @return {[type]} [description]
     */
    chageOperate() {
        if (this.task.issubtask == '1' && !S.endsWith(this.operate, 'SubTask')) this.operate = this.operate + 'SubTask';
    }

    /**
     * [getTaskObj 从任务面板中提取，单个任务数据]
     * @param  {[type]} pane   [任务面板对象]
     * @param  {[type]} status [任务状态]
     * @param  {[type]} taskId [任务编号]
     * @return {[type]}        [任我游对象]
     */
    setPaneTaskObj(pane, status, taskId) {
        var task = _.find(pane[status].task.pageList, (task) => {
            return taskId == task.taskId;
        });
        task && this.setTask(task);
    }

    /**
     * [checkDropTaskFunc 拖拽任务，改变任务状态]
     * @param  {[type]} source [开始状态]
     * @param  {[type]} target [结束状态]
     * @return {[type]}        [true: 可以拖拽 | false: 不可以拖拽]
     */
    checkDropTaskFunc(source, target) {
        this.operate = source + '->' + target;
        var ret = this.validate();
        if (ret != this.VALID_SUCCESS) {
            if (this.operate == 'needDoPage->doingPage') {
                this.operate = 'claimFinishUser';
                this.chageOperate();
                return this.validate();
            } else if (this.operate == 'finishPage->validatePage') {
                this.operate = 'claimValidator';
                this.chageOperate();
                return this.validate();
            }
        }
        return ret;
    }

    /**
     * [checkTaskEditFunc 检查任务编辑函数]
     * @param  {[type]} oper [对任务操作]
     * @param  {[type]} canf [能操作回调函数]
     * @param  {[type]} notf [拒绝操作回调函数]
     * @return {[type]}      [description]
     */
    checkTaskOperateFunc(oper, canf, notf) {
        this.operate = oper;
        this.chageOperate();
        var ret = this.validate();
        if (ret == this.VALID_SUCCESS && _.isFunction(canf)) canf();
        else if (_.isFunction(notf)) notf();
    }

    /**
     * [getTaskObj 从任务分组面板中提取，单个任务数据]
     * @param  {[type]} pane   [任务分组面板对象]
     * @param  {[type]} key    [任务分组列表key值]
     * @param  {[type]} taskId [任务编号]
     * @return {[type]}        [任我游对象]
     */
    setPaneGroupTaskObj(pane, key, taskId) {
        var task = _.find(pane.taskListCache[key].taskgList, (task) => {
            return taskId == task.taskId;
        });
        task && this.setTask(task);
    }

    getTaskStatusList() {

        var oper = {};
        for (var k in this.validMap) {
            var v = this.validMap[k];

            var match = false;
            var ks = k.split(',');
            for (var j in ks) {
                var tv = ks[j];
                if (_.contains(this.taskRoleArr, tv)) {
                    match = true;
                    break;
                }
            }
            if (match) oper = _.extend(oper, v);
        }

        var sn = this.titlePageMap[this.task.status];
        var operArr = [this.pageStatusMap[sn]];
        for (var k in oper) {
            if (k.indexOf(sn) > -1) {
                var ks = k.split('->');
                var v = oper[k];
                var valid = v;
                if (_.isArray(v)) {
                    valid = this.validateOperCheckArr(v);
                }
                if (ks[0] == sn && valid) operArr.push(this.pageStatusMap[ks[1]]);
            }
        }
        return operArr;
    }
}

export default new nsTaskValidator();
