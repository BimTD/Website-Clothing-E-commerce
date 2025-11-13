package org.example.graduationproject.config;

import org.example.graduationproject.security.JpaUserDetailsService;
import org.example.graduationproject.security.jwt.JwtTokenProvider;
import org.example.graduationproject.security.jwt.TokenProvider;
import org.example.graduationproject.security.jwt.authentication.JwtAuthenticationConverter;
import org.example.graduationproject.security.jwt.authentication.JwtAuthenticationFilter;
import org.example.graduationproject.security.jwt.authentication.JwtAuthenticationProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JpaUserDetailsService jpaUserDetailsService, JwtAuthenticationFilter jwtAuthenticationFilter, CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler, CorsConfigurationSource corsConfigurationSource) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/assets/**", "/fe/**").permitAll()
                        .requestMatchers("/login", "/register").permitAll()
                        .requestMatchers("/api/auth/**").permitAll() // Cho phép tất cả API auth
                        .requestMatchers("/api/user/products/**").permitAll() // Cho phép xem sản phẩm
                        .requestMatchers("/api/user/orders/**").authenticated() // Yêu cầu đăng nhập cho orders
                        .requestMatchers("/api/cart/**").authenticated()
                        .requestMatchers("/cart").authenticated()
                        .requestMatchers("/checkout/**").authenticated()
                        .requestMatchers("/orders/**").authenticated()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").permitAll() // Tạm thời cho phép tất cả API admin để test
                        .requestMatchers("/user/**").hasRole("USER")
                        .requestMatchers("/", "/home").authenticated()
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults())
                .formLogin(form -> form
                        .loginPage("/login")
                        .successHandler(customAuthenticationSuccessHandler)
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login?logout=true")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                )
                .userDetailsService(jpaUserDetailsService)
                .addFilterAfter(jwtAuthenticationFilter, LogoutFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public TokenProvider tokenProvider(@Value("${security.jwt.secret:changeit}") String secret,
                                       @Value("${security.jwt.issuer:cpl-orm}") String issuer,
                                       @Value("${security.jwt.expiration-seconds:3600}") long expirationSeconds) {
        return new JwtTokenProvider(secret, issuer, expirationSeconds);
    }

    @Bean
    public JwtAuthenticationProvider jwtAuthenticationProvider(TokenProvider tokenProvider, UserDetailsService userDetailsService) {
        return new JwtAuthenticationProvider(tokenProvider, userDetailsService);
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtAuthenticationProvider jwtAuthenticationProvider) {
        AuthenticationManager authenticationManager = new ProviderManager(jwtAuthenticationProvider);
        return new JwtAuthenticationFilter(authenticationManager, new JwtAuthenticationConverter());
    }
}
