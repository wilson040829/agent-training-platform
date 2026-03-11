package com.agent.platform.agent;

import com.agent.platform.agent.dto.AgentConnectivityTestRequest;
import com.agent.platform.agent.dto.AgentConnectivityTestResponse;
import com.agent.platform.agent.dto.AgentCreateRequest;
import com.agent.platform.agent.dto.AgentListResponse;
import com.agent.platform.agent.dto.AgentResponse;
import com.agent.platform.agent.dto.AgentStatusUpdateRequest;
import com.agent.platform.agent.dto.AgentUpdateRequest;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/v1/agents")
@CrossOrigin(origins = "*")
public class AgentController {

    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    @PostMapping
    public AgentResponse create(@Valid @RequestBody AgentCreateRequest request) {
        return agentService.create(request);
    }

    @GetMapping
    public AgentListResponse list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return agentService.list(page, size, sortBy, sortDir);
    }

    @GetMapping("/{id}")
    public AgentResponse getById(@PathVariable String id) {
        return agentService.getById(id);
    }

    @PutMapping("/{id}")
    public AgentResponse update(@PathVariable String id, @Valid @RequestBody AgentUpdateRequest request) {
        return agentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        agentService.delete(id);
    }

    @PatchMapping("/{id}/status")
    public AgentResponse updateStatus(@PathVariable String id, @Valid @RequestBody AgentStatusUpdateRequest request) {
        return agentService.updateStatus(id, request);
    }

    @PostMapping("/connectivity-test")
    public AgentConnectivityTestResponse connectivityTest(@Valid @RequestBody AgentConnectivityTestRequest request) {
        return agentService.testConnectivity(request);
    }
}
