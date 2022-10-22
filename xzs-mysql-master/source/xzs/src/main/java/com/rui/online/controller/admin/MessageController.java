package com.rui.online.controller.admin;

import com.rui.online.VO.admin.message.MessageSendVM;
import com.rui.online.base.RestResponse;
import com.rui.online.controller.BaseApiController;
import com.rui.online.pojo.Message;
import com.rui.online.pojo.MessageUser;
import com.rui.online.pojo.User;
import com.rui.online.service.IMessageService;
import com.rui.online.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @Author 蒲锐
 * @CreateTme 2022/10/16 16:39
 * Version1.0.0
 */

@RestController("AdminMessageController")
@RequestMapping(value = "/api/admin/message")
public class MessageController extends BaseApiController {

    private final IMessageService messageService;
    private final IUserService userService;

    @Autowired
    public MessageController(IMessageService messageService, IUserService userService) {
        this.messageService = messageService;
        this.userService = userService;
    }

    /*
    消息发送
     */
    @RequestMapping(value = "/send", method = RequestMethod.POST)
    public RestResponse send(@RequestBody @Valid MessageSendVM model) {
        User user = getCurrentUser();
        List<User> receiveUser = userService.selectByIds(model.getReceiveUserIds());
        Date now = new Date();
        Message message = new Message();
        message.setTitle(model.getTitle());
        message.setContent(model.getContent());
        message.setCreateTime(now);
        message.setReadCount(0);
        message.setReceiveUserCount(receiveUser.size());
        message.setSendUserId(user.getId());
        message.setSendUserName(user.getUserName());
        message.setSendRealName(user.getRealName());
        List<MessageUser> messageUsers = receiveUser.stream().map(d -> {
            MessageUser messageUser = new MessageUser();
            messageUser.setCreateTime(now);
            messageUser.setReaded(false);
            messageUser.setReceiveRealName(d.getRealName());
            messageUser.setReceiveUserId(d.getId());
            messageUser.setReceiveUserName(d.getUserName());
            return messageUser;
        }).collect(Collectors.toList());
        messageService.sendMessage(message, messageUsers);
        return RestResponse.ok();
    }



}
