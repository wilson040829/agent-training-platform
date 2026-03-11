package com.agent.platform.ops.debug;

import javax.validation.constraints.NotBlank;

public record DebugChatRequest(@NotBlank String message) {}
