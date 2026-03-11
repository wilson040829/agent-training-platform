package com.agent.platform.ops.debug;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DebugLogRepository extends JpaRepository<DebugLogEntity, String> {
}
