package com.agent.platform.ops.release;

import javax.validation.constraints.NotBlank;

public record ReleaseCreateRequest(
        @NotBlank String version,
        String note
) {}
