# Integration Flows

End-to-end flow for all integration types in Integration Builder Pro — from entry through type-specific setup, destinations, chaining, mapping, and submission.

```mermaid
flowchart TD
    START([Configurations List]) --> ADD[Add Integration]
    ADD --> TYPE{Select Integration Type}

    TYPE -->|Push| PUSH_DESC["Outbound: send data on Optimo events"]
    TYPE -->|Pull| PULL_DESC["Inbound: fetch data from external API"]
    TYPE -->|File| FILE_DESC["Bidirectional: flat files via SFTP/FTP"]
    TYPE -->|Document| DOC_DESC["Inbound: receive XML / PDF / EDI"]

    PUSH_DESC --> S1
    PULL_DESC --> S1
    FILE_DESC --> S1
    DOC_DESC --> S1

    S1["① General Details<br/>Name · Contact · Active · Description · Notes"]
    S1 --> TYPECHECK{Integration Type?}

    TYPECHECK -->|Push| S2P["② Configuration — Push<br/>Entity · Trigger · SQL Query<br/>Max Attempts · Error Email"]
    TYPECHECK -->|Pull| S2L["② Configuration — Pull<br/>Max Attempts · Error Email<br/>Next Integration (chain)"]
    TYPECHECK -->|File or Document| S3FD

    S2P --> S3P
    S2L --> S3L

    S3P["③ Destination — Push"]
    S3P --> ACTION{Integration Action?}
    ACTION -->|HTTP Service| HTTP1["Single HTTP destination<br/>URL · Method · Operation · Auth"]
    ACTION -->|HTTP Service External| HTTP2["Up to 2 HTTP destinations"]
    ACTION -->|FTP| FTP["FTP / SFTP panel<br/>Inbound pull · Outbound push"]

    S3L["③ Destination — Pull<br/>External API URL"]
    S3FD["② Destination — File / Document<br/>External API URL<br/>(Configuration step skipped)"]

    HTTP1 --> CHAIN
    HTTP2 --> CHAIN
    FTP --> CHAIN
    S3L --> CHAIN
    S3FD --> CHAIN

    CHAIN{Add Next Integration<br/>at Destination step?}
    CHAIN -->|Yes| SAVE["Save current as Parent<br/>Reset form → start Child"]
    SAVE --> S1
    CHAIN -->|No| MAP

    MAP["④ Field Mapping<br/>Source payload ↔ Target fields<br/>JSON / XML / Upload · Auto-map"]
    MAP --> SUBMIT{Submit}

    SUBMIT -->|Single integration| DONE([Saved → Configurations List])
    SUBMIT -->|Child in a chain| REVIEW["Review Parent integrations<br/>Walk through each parent step"]
    REVIEW --> MORE{More parents?}
    MORE -->|Yes| REVIEW
    MORE -->|No — last parent| FINISH["Finish chain<br/>Parent₁ → Parent₂ → … → Child"]
    FINISH --> DONE

    style START fill:#f0f4ff,stroke:#4a6cf7
    style DONE fill:#e8f8ef,stroke:#22a06b
    style TYPE fill:#fff8e6,stroke:#e6a817
    style TYPECHECK fill:#fff8e6,stroke:#e6a817
    style ACTION fill:#fff8e6,stroke:#e6a817
    style CHAIN fill:#fff8e6,stroke:#e6a817
    style SUBMIT fill:#fff8e6,stroke:#e6a817
    style MORE fill:#fff8e6,stroke:#e6a817
    style PUSH_DESC fill:#fff3e0,stroke:#f59e0b
    style PULL_DESC fill:#e0f2fe,stroke:#0ea5e9
    style FILE_DESC fill:#ecfdf5,stroke:#10b981
    style DOC_DESC fill:#f3e8ff,stroke:#8b5cf6
```

## Integration types

| Type | Direction | Config step | Destination |
|------|-----------|-------------|-------------|
| **Push** | Optimo → external | Entity, trigger, SQL query | HTTP Service, HTTP External, or FTP |
| **Pull** | External → Optimo | Max attempts, next integration | External API URL |
| **File** | Bidirectional files | Skipped | External API URL |
| **Document** | External → Optimo | Skipped | External API URL |
