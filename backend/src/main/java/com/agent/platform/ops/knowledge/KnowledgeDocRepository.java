package com.agent.platform.ops.knowledge;

import org.springframework.data.jpa.repository.JpaRepository;

public interface KnowledgeDocRepository extends JpaRepository<KnowledgeDocEntity, String> {
}
