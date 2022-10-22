package com.rui.online.config.security;

import com.rui.online.base.SystemCode;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @version 3.5.0
 * @description: 未登录
 * 未登录或者AuthenticationException会调用此方法
 */
@Component
public final class LoginAuthenticationEntryPoint extends LoginUrlAuthenticationEntryPoint {

    /**
     * Instantiates a new Login authentication entry point.
     */
    public LoginAuthenticationEntryPoint() {
        super("/api/user/login");

    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        RestUtil.response(response, SystemCode.UNAUTHORIZED);
    }

}
