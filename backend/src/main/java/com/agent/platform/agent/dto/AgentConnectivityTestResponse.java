package com.agent.platform.agent.dto;

public record AgentConnectivityTestResponse(
        boolean ok,
        int status,
        String endpoint,
        String message
) {}
