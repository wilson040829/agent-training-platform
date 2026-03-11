package com.agent.platform.ops.knowledge;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.PositiveOrZero;

public record KnowledgeDocCreateRequest(
        @NotBlank String name,
        @PositiveOrZero long sizeKb
) {}
