package com.agent.platform.agent.dto;

import java.util.List;

public record AgentResponse(
        String id,
        String name,
        String description,
        String persona,
        String systemPrompt,
        String model,
        Double temperature,
        List<String> tools,
        String status,
        String createdAt,
        String updatedAt
) {}
