package com.agent.platform.ops.knowledge;

public record KnowledgeDocDto(
        String id,
        String name,
        String status,
        long sizeKb,
        String createdAt
) {}
