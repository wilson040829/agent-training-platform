package com.agent.platform.ops.debug;

public record DebugHistoryItem(
        String id,
        String role,
        String content,
        Long elapsedMs,
        Integer inputTokens,
        Integer outputTokens,
        String trace,
        String createdAt
) {}
