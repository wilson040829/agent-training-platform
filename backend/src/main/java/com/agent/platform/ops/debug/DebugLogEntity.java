package com.agent.platform.ops.debug;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "debug_logs")
public class DebugLogEntity {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 20)
    private String role;

    @Column(nullable = false, length = 4000)
    private String content;

    @Column(nullable = false)
    private Long elapsedMs = 0L;

    @Column(nullable = false)
    private Integer inputTokens = 0;

    @Column(nullable = false)
    private Integer outputTokens = 0;

    @Column(nullable = false, length = 200)
    private String trace = "-";

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public String getId() { return id; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Long getElapsedMs() { return elapsedMs; }
    public void setElapsedMs(Long elapsedMs) { this.elapsedMs = elapsedMs; }
    public Integer getInputTokens() { return inputTokens; }
    public void setInputTokens(Integer inputTokens) { this.inputTokens = inputTokens; }
    public Integer getOutputTokens() { return outputTokens; }
    public void setOutputTokens(Integer outputTokens) { this.outputTokens = outputTokens; }
    public String getTrace() { return trace; }
    public void setTrace(String trace) { this.trace = trace; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
