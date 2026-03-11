package com.agent.platform.agent.dto;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import java.util.List;

public record AgentUpdateRequest(
        @NotBlank @Size(min = 1, max = 50) String name,
        String description,
        @NotBlank String persona,
        @NotBlank String systemPrompt,
        String model,
        @Min(0) @Max(2) Double temperature,
        List<String> tools
) {}
