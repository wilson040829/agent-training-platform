package com.agent.platform.ops.knowledge;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class KnowledgeService {

    private final KnowledgeDocRepository repository;

    public KnowledgeService(KnowledgeDocRepository repository) {
        this.repository = repository;
    }

    public List<KnowledgeDocDto> list() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    public KnowledgeDocDto create(KnowledgeDocCreateRequest req) {
        KnowledgeDocEntity entity = new KnowledgeDocEntity();
        entity.setName(req.name());
        entity.setStatus("待训练");
        entity.setSizeKb(req.sizeKb());
        return toDto(repository.save(entity));
    }

    public KnowledgeDocDto train(String id) {
        KnowledgeDocEntity entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "doc not found"));
        entity.setStatus("已完成");
        return toDto(repository.save(entity));
    }

    private KnowledgeDocDto toDto(KnowledgeDocEntity entity) {
        return new KnowledgeDocDto(
                entity.getId(),
                entity.getName(),
                entity.getStatus(),
                entity.getSizeKb() == null ? 0 : entity.getSizeKb(),
                entity.getCreatedAt() == null ? null : entity.getCreatedAt().toString()
        );
    }
}
