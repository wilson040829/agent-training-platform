package com.agent.platform.ops.release;

import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/releases")
@CrossOrigin(origins = "*")
public class ReleaseController {

    private final ReleaseService releaseService;

    public ReleaseController(ReleaseService releaseService) {
        this.releaseService = releaseService;
    }

    @GetMapping
    public List<ReleaseVersionDto> list() {
        return releaseService.list();
    }

    @PostMapping
    public ReleaseVersionDto create(@Valid @RequestBody ReleaseCreateRequest req) {
        return releaseService.create(req);
    }

    @PostMapping("/{id}/publish")
    public List<ReleaseVersionDto> publish(@PathVariable String id, @RequestBody(required = false) ReleasePublishRequest req) {
        return releaseService.publish(id, req == null ? new ReleasePublishRequest("") : req);
    }

    @PostMapping("/{id}/rollback")
    public List<ReleaseVersionDto> rollback(@PathVariable String id) {
        return releaseService.rollback(id);
    }
}
