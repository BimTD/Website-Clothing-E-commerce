package org.example.graduationproject.security;

import org.example.graduationproject.models.User;
import org.example.graduationproject.models.UserRole;
import org.example.graduationproject.repositories.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JpaUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public JpaUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new UserDetails() {
            @Override
            public Collection<? extends GrantedAuthority> getAuthorities() {
                Set<UserRole> userRoles = user.getUserRoles();
                if (userRoles == null) {
                    return List.of();
                }

                return userRoles.stream()
                        .map(userRole -> {
                            String roleName = userRole.getRole().getName();
                            if (!roleName.startsWith("ROLE_")) {
                                roleName = "ROLE_" + roleName;
                            }
                            return new SimpleGrantedAuthority(roleName);
                        })
                        .collect(Collectors.toSet());
            }

            @Override
            public String getPassword() {
                return user.getPassword();
            }

            @Override
            public String getUsername() {
                return user.getUsername();
            }

            @Override
            public boolean isEnabled() {
                return "1".equals(user.getEnabled()) || "true".equalsIgnoreCase(user.getEnabled());
            }

            @Override
            public boolean isAccountNonExpired() {
                return true;
            }

            @Override
            public boolean isAccountNonLocked() {
                return true;
            }

            @Override
            public boolean isCredentialsNonExpired() {
                return true;
            }
        };
    }
}
