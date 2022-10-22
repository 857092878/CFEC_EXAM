package com.rui.online.controller.student;

import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.github.pagehelper.PageInfo;
import com.rui.online.VO.admin.user.UserResponseVM;

import com.rui.online.VO.student.user.*;
import com.rui.online.base.RestResponse;
import com.rui.online.controller.BaseApiController;
import com.rui.online.domain.enums.RoleEnum;
import com.rui.online.domain.enums.UserStatusEnum;
import com.rui.online.event.UserEvent;
import com.rui.online.pojo.Message;
import com.rui.online.pojo.MessageUser;
import com.rui.online.pojo.User;
import com.rui.online.pojo.UserEventLog;
import com.rui.online.service.AuthenticationService;
import com.rui.online.service.IMessageService;
import com.rui.online.service.IUserEventLogService;
import com.rui.online.service.IUserService;
import com.rui.online.utils.DateTimeUtil;
import com.rui.online.utils.PageInfoHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * @Author 蒲锐
 * @CreateTme 2022/10/18 8:49
 * Version1.0.0
 */

@RestController("StudentUserController")
@RequestMapping(value = "/api/student/user")
public class UserController extends BaseApiController {

    private final IUserService userService;
    private final IUserEventLogService userEventLogService;
    private final IMessageService messageService;
    private final AuthenticationService authenticationService;
    private final ApplicationEventPublisher eventPublisher;

    @Autowired
    public UserController(IUserService userService, IUserEventLogService userEventLogService, IMessageService messageService, AuthenticationService authenticationService, ApplicationEventPublisher eventPublisher) {
        this.userService = userService;
        this.userEventLogService = userEventLogService;
        this.messageService = messageService;
        this.authenticationService = authenticationService;
        this.eventPublisher = eventPublisher;
    }

    /*
    用户注册
     */
    @RequestMapping(value = "/register", method = RequestMethod.POST)
    public RestResponse register(@RequestBody @Valid UserRegisterVM model) {
        User existUser = userService.getUserByUserName(model.getUserName());
        if (null != existUser) {
            return new RestResponse<>(2, "用户已存在");
        }
        User user = modelMapper.map(model, User.class);
        String encodePwd = authenticationService.pwdEncode(model.getPassword());
        user.setUserUuid(UUID.randomUUID().toString());
        user.setPassword(encodePwd);
        user.setRole(RoleEnum.STUDENT.getCode());
        user.setStatus(UserStatusEnum.Enable.getCode());
        user.setLastActiveTime(new Date());
        user.setCreateTime(new Date());
        user.setDeleted(false);
        userService.insertByFilter(user);
        UserEventLog userEventLog = new UserEventLog(user.getId(), user.getUserName(), user.getRealName(), new Date());
        userEventLog.setContent("欢迎 " + user.getUserName() + " 注册来到学之思开源考试系统");
        eventPublisher.publishEvent(new UserEvent(userEventLog));
        return RestResponse.ok();
    }

    /*
    用户动态
     */
    @RequestMapping(value = "/log", method = RequestMethod.POST)
    public RestResponse<List<UserEventLogVM>> log() {
        User user = getCurrentUser();
        List<UserEventLog> userEventLogs = userEventLogService.getUserEventLogByUserId(user.getId());
        List<UserEventLogVM> userEventLogVMS = userEventLogs.stream().map(d -> {
            UserEventLogVM vm = modelMapper.map(d, UserEventLogVM.class);
            vm.setCreateTime(DateTimeUtil.dateFormat(d.getCreateTime()));
            return vm;
        }).collect(Collectors.toList());
        return RestResponse.ok(userEventLogVMS);
    }
    /*
    当前用户信息
     */
    @RequestMapping(value = "/current", method = RequestMethod.POST)
    public RestResponse<UserResponseVM> current() {
        User user = getCurrentUser();
        UserResponseVM userVm = UserResponseVM.from(user);
        return RestResponse.ok(userVm);
    }
    /*
    修改用户信息
     */
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    public RestResponse update(@RequestBody @Valid UserUpdateVM model) {
        if (StringUtils.isBlank(model.getBirthDay())) {
            model.setBirthDay(null);
        }
        User user = userService.selectById(getCurrentUser().getId());
        modelMapper.map(model, user);
        user.setModifyTime(new Date());
        userService.updateByIdFilter(user);
        UserEventLog userEventLog = new UserEventLog(user.getId(), user.getUserName(), user.getRealName(), new Date());
        userEventLog.setContent(user.getUserName() + " 更新了个人资料");
        eventPublisher.publishEvent(new UserEvent(userEventLog));
        return RestResponse.ok();
    }
    /*
    消息分页
     */
    @RequestMapping(value = "/message/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<MessageResponseVM>> messagePageList(@RequestBody MessageRequestVM messageRequestVM) {
        messageRequestVM.setReceiveUserId(getCurrentUser().getId());
        PageInfo<MessageUser> messageUserPageInfo = messageService.studentPage(messageRequestVM);
        List<Integer> ids = messageUserPageInfo.getList().stream().map(d -> d.getMessageId()).collect(Collectors.toList());
        List<Message> messages = ids.size() != 0 ? messageService.selectMessageByIds(ids) : null;
        PageInfo<MessageResponseVM> page = PageInfoHelper.copyMap(messageUserPageInfo, e -> {
            MessageResponseVM vm = modelMapper.map(e, MessageResponseVM.class);
            messages.stream().filter(d -> e.getMessageId().equals(d.getId())).findFirst().ifPresent(message -> {
                vm.setTitle(message.getTitle());
                vm.setContent(message.getContent());
                vm.setSendUserName(message.getSendUserName());
            });
            vm.setCreateTime(DateTimeUtil.dateFormat(e.getCreateTime()));
            return vm;
        });
        return RestResponse.ok(page);
    }
    /*
    消息标记已读
     */
    @RequestMapping(value = "/message/read/{id}", method = RequestMethod.POST)
    public RestResponse read(@PathVariable Integer id) {
        messageService.read(id);
        return RestResponse.ok();
    }
    /*
    未读消息数量
     */
    @RequestMapping(value = "/message/unreadCount", method = RequestMethod.POST)
    public RestResponse unReadCount() {
        Integer count = messageService.unReadCount(getCurrentUser().getId());
        return RestResponse.ok(count);
    }
}
