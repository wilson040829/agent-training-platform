package com.agent.platform.agent.dto;

import java.util.List;

public record AgentListResponse(
        List<AgentResponse> items,
        int page,
        int size,
        long total,
        int totalPages
) {}
