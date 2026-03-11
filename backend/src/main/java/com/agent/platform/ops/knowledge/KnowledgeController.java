package com.agent.platform.ops.knowledge;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/knowledge/docs")
@CrossOrigin(origins = "*")
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    public KnowledgeController(KnowledgeService knowledgeService) {
        this.knowledgeService = knowledgeService;
    }

    @GetMapping
    public List<KnowledgeDocDto> list() {
        return knowledgeService.list();
    }

    @PostMapping
    public KnowledgeDocDto create(@Valid @RequestBody KnowledgeDocCreateRequest req) {
        return knowledgeService.create(req);
    }

    @PostMapping("/{id}/train")
    public KnowledgeDocDto train(@PathVariable String id) {
        KnowledgeDocDto dto = knowledgeService.train(id);
        if (dto == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "doc not found");
        return dto;
    }
}
