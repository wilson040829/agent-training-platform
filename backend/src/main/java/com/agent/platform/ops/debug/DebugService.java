package com.agent.platform.ops.debug;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DebugService {

    private final DebugLogRepository repository;

    public DebugService(DebugLogRepository repository) {
        this.repository = repository;
    }

    public DebugChatResponse chat(DebugChatRequest req) {
        String message = req.message();
        int inputTokens = Math.max(1, message.length() / 3);
        String answer = "已收到问题：" + message + "。建议检查 Prompt、知识库命中以及工具调用链。";
        int outputTokens = Math.max(1, answer.length() / 3);
        long elapsedMs = 280;
        String trace = "retriever->reranker->llm";

        DebugLogEntity user = new DebugLogEntity();
        user.setRole("user");
        user.setContent(message);
        user.setElapsedMs(0L);
        user.setInputTokens(inputTokens);
        user.setOutputTokens(0);
        user.setTrace(trace);
        repository.save(user);

        DebugLogEntity assistant = new DebugLogEntity();
        assistant.setRole("assistant");
        assistant.setContent(answer);
        assistant.setElapsedMs(elapsedMs);
        assistant.setInputTokens(inputTokens);
        assistant.setOutputTokens(outputTokens);
        assistant.setTrace(trace);
        repository.save(assistant);

        return new DebugChatResponse(answer, elapsedMs, inputTokens, outputTokens, trace);
    }

    public List<DebugHistoryItem> history() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .limit(50)
                .map(e -> new DebugHistoryItem(
                        e.getId(),
                        e.getRole(),
                        e.getContent(),
                        e.getElapsedMs(),
                        e.getInputTokens(),
                        e.getOutputTokens(),
                        e.getTrace(),
                        e.getCreatedAt() == null ? null : e.getCreatedAt().toString()
                ))
                .toList();
    }
}
