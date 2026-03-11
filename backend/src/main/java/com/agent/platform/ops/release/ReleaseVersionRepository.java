package com.agent.platform.ops.release;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReleaseVersionRepository extends JpaRepository<ReleaseVersionEntity, String> {
}
