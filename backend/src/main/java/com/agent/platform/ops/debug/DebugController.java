package com.agent.platform.ops.debug;

import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/debug")
@CrossOrigin(origins = "*")
public class DebugController {

    private final DebugService debugService;

    public DebugController(DebugService debugService) {
        this.debugService = debugService;
    }

    @PostMapping("/chat")
    public DebugChatResponse chat(@Valid @RequestBody DebugChatRequest req) {
        return debugService.chat(req);
    }

    @GetMapping("/history")
    public List<DebugHistoryItem> history() {
        return debugService.history();
    }
}
