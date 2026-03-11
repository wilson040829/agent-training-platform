package com.agent.platform.agent;

import com.agent.platform.agent.dto.AgentConnectivityTestRequest;
import com.agent.platform.agent.dto.AgentConnectivityTestResponse;
import com.agent.platform.agent.dto.AgentCreateRequest;
import com.agent.platform.agent.dto.AgentListResponse;
import com.agent.platform.agent.dto.AgentResponse;
import com.agent.platform.agent.dto.AgentStatusUpdateRequest;
import com.agent.platform.agent.dto.AgentUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AgentService {

    private final AgentRepository agentRepository;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();

    public AgentService(AgentRepository agentRepository) {
        this.agentRepository = agentRepository;
    }

    public AgentResponse create(AgentCreateRequest req) {
        AgentEntity entity = new AgentEntity();
        entity.setName(req.name());
        entity.setDescription(req.description() == null ? "" : req.description());
        entity.setPersona(req.persona());
        entity.setSystemPrompt(req.systemPrompt());
        entity.setModel(req.model() == null ? "gpt-4o-mini" : req.model());
        entity.setTemperature(req.temperature() == null ? 0.7 : req.temperature());
        entity.setTools(req.tools() == null ? List.of() : req.tools());

        AgentEntity saved = agentRepository.save(entity);
        return toResponse(saved);
    }

    public AgentListResponse list(int page, int size, String sortBy, String sortDir) {
        String safeSortBy = resolveSortBy(sortBy);
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(direction, safeSortBy));
        Page<AgentEntity> result = agentRepository.findAll(pageable);

        return new AgentListResponse(
                result.getContent().stream().map(this::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    public AgentResponse getById(String id) {
        AgentEntity entity = agentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Agent not found: " + id));
        return toResponse(entity);
    }

    public AgentResponse update(String id, AgentUpdateRequest req) {
        AgentEntity entity = agentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Agent not found: " + id));

        entity.setName(req.name());
        entity.setDescription(req.description() == null ? "" : req.description());
        entity.setPersona(req.persona());
        entity.setSystemPrompt(req.systemPrompt());
        entity.setModel(req.model() == null ? "gpt-4o-mini" : req.model());
        entity.setTemperature(req.temperature() == null ? 0.7 : req.temperature());
        entity.setTools(req.tools() == null ? List.of() : req.tools());

        AgentEntity saved = agentRepository.save(entity);
        return toResponse(saved);
    }

    public void delete(String id) {
        if (!agentRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Agent not found: " + id);
        }
        agentRepository.deleteById(id);
    }

    public AgentResponse updateStatus(String id, AgentStatusUpdateRequest req) {
        AgentEntity entity = agentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Agent not found: " + id));

        AgentStatus current = AgentStatus.valueOf(entity.getStatus());
        AgentStatus target = req.status();

        if (current == target) {
            return toResponse(entity);
        }

        boolean allowed = (current == AgentStatus.DRAFT && target == AgentStatus.PUBLISHED)
                || (current == AgentStatus.PUBLISHED && target == AgentStatus.DRAFT);
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "非法状态流转: " + current + " -> " + target);
        }

        entity.setStatus(target.name());
        AgentEntity saved = agentRepository.save(entity);
        return toResponse(saved);
    }

    public AgentConnectivityTestResponse testConnectivity(AgentConnectivityTestRequest req) {
        String provider = req.provider() == null ? "custom" : req.provider().trim().toLowerCase();
        String baseUrl = req.baseUrl() == null ? "" : req.baseUrl().trim();
        String apiKey = req.apiKey() == null ? "" : req.apiKey().trim();

        if (baseUrl.isBlank() || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "baseUrl/apiKey 不能为空");
        }

        String cleanedBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String endpoint;
        HttpRequest.Builder builder;

        if ("gemini".equals(provider)) {
            endpoint = cleanedBase + "/v1beta/models?key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8);
            builder = HttpRequest.newBuilder(URI.create(endpoint)).GET();
        } else if ("anthropic".equals(provider)) {
            endpoint = cleanedBase + "/v1/models";
            builder = HttpRequest.newBuilder(URI.create(endpoint))
                    .GET()
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01");
        } else {
            endpoint = cleanedBase + "/models";
            builder = HttpRequest.newBuilder(URI.create(endpoint))
                    .GET()
                    .header("Authorization", "Bearer " + apiKey);
        }

        try {
            HttpRequest request = builder.timeout(Duration.ofSeconds(12)).build();
            HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int status = resp.statusCode();
            boolean ok = status >= 200 && status < 300;
            String body = resp.body() == null ? "" : resp.body();
            String msg = ok ? "连通成功" : ("连通失败，HTTP " + status + "，" + body.substring(0, Math.min(180, body.length())));
            return new AgentConnectivityTestResponse(ok, status, endpoint, msg);
        } catch (Exception e) {
            return new AgentConnectivityTestResponse(false, 0, endpoint, "连通失败：" + e.getMessage());
        }
    }

    private String resolveSortBy(String sortBy) {
        if (sortBy == null) return "updatedAt";
        return switch (sortBy) {
            case "name", "createdAt", "updatedAt", "model" -> sortBy;
            default -> "updatedAt";
        };
    }

    private AgentResponse toResponse(AgentEntity entity) {
        return new AgentResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getPersona(),
                entity.getSystemPrompt(),
                entity.getModel(),
                entity.getTemperature(),
                entity.getTools(),
                entity.getStatus(),
                entity.getCreatedAt() == null ? null : entity.getCreatedAt().toString(),
                entity.getUpdatedAt() == null ? null : entity.getUpdatedAt().toString()
        );
    }
}
