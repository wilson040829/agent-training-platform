package com.agent.platform.ops.release;

public record ReleaseVersionDto(
        String id,
        String version,
        String status,
        String publishedAt,
        String note
) {}
