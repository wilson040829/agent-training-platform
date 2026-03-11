package com.agent.platform.agent.dto;

import javax.validation.constraints.NotBlank;

public record AgentConnectivityTestRequest(
        String provider,
        @NotBlank String baseUrl,
        @NotBlank String apiKey,
        String model
) {}
