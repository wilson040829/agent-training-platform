package com.agent.platform.agent.dto;

import com.agent.platform.agent.AgentStatus;
import javax.validation.constraints.NotNull;

public record AgentStatusUpdateRequest(
        @NotNull(message = "status 不能为空") AgentStatus status
) {}
