package com.agent.platform.ops.debug;

public record DebugChatResponse(
        String answer,
        long elapsedMs,
        int inputTokens,
        int outputTokens,
        String trace
) {}
