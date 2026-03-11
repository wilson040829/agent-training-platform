package com.agent.platform.ops.release;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReleaseService {

    private final ReleaseVersionRepository repository;

    public ReleaseService(ReleaseVersionRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void initDefaults() {
        if (repository.count() > 0) return;

        ReleaseVersionEntity a = new ReleaseVersionEntity();
        a.setVersion("v1.2.0");
        a.setStatus("已发布");
        a.setPublishedAt(LocalDateTime.now().minusHours(1).toString());
        a.setNote("稳定版");
        repository.save(a);

        ReleaseVersionEntity b = new ReleaseVersionEntity();
        b.setVersion("v1.3.0-rc");
        b.setStatus("草稿");
        b.setPublishedAt("-");
        b.setNote("新增供应商配置");
        repository.save(b);
    }

    public List<ReleaseVersionDto> list() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    public ReleaseVersionDto create(ReleaseCreateRequest req) {
        ReleaseVersionEntity entity = new ReleaseVersionEntity();
        entity.setVersion(req.version());
        entity.setStatus("草稿");
        entity.setPublishedAt("-");
        entity.setNote(req.note() == null ? "" : req.note());
        return toDto(repository.save(entity));
    }

    public List<ReleaseVersionDto> publish(String id, ReleasePublishRequest req) {
        List<ReleaseVersionEntity> all = repository.findAll();
        ReleaseVersionEntity target = all.stream()
                .filter(v -> v.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "release version not found"));

        for (ReleaseVersionEntity v : all) {
            if (v.getId().equals(id)) {
                v.setStatus("已发布");
                v.setPublishedAt(LocalDateTime.now().toString());
                if (req != null && req.note() != null && !req.note().isBlank()) {
                    v.setNote(req.note());
                }
            } else {
                v.setStatus("草稿");
            }
            repository.save(v);
        }
        return list();
    }

    public List<ReleaseVersionDto> rollback(String id) {
        return publish(id, new ReleasePublishRequest("回滚"));
    }

    private ReleaseVersionDto toDto(ReleaseVersionEntity e) {
        return new ReleaseVersionDto(e.getId(), e.getVersion(), e.getStatus(), e.getPublishedAt(), e.getNote());
    }
}
