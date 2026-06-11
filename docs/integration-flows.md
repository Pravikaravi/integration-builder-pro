# Integration Configuration Flow

End-to-end flow for **Integration Builder Pro** (as built today).  
Covers all four integration types, wizard steps, destination options, required field mapping, and integration chaining.

```mermaid
flowchart TD
    START([Configurations List]) --> ADD[Add Integration]
    ADD --> TYPE{Select Integration Type}

    TYPE -->|Push| T_PUSH["Push — Outbound<br/>Send data to a third-party when Optimo events occur"]
    TYPE -->|Pull| T_PULL["Pull — Inbound<br/>Periodically fetch data from an external endpoint"]
    TYPE -->|File| T_FILE["File — Bidirectional<br/>Exchange flat files via SFTP / FTP / shared drops"]
    TYPE -->|Document| T_DOC["Document — Inbound<br/>Receive structured documents: XML, PDF, EDI"]

    T_PUSH --> S1
    T_PULL --> S1
    T_FILE --> S1
    T_DOC --> S1

    S1["Step 1 — General Details<br/>Name · Contact · Active · Description · Notes"]
    S1 --> TYPECHECK{Integration Type?}

    TYPECHECK -->|Push| S2P
    TYPECHECK -->|Pull| S2L
    TYPECHECK -->|File or Document| S3FD

    S2P["Step 2 — Configuration (Push)<br/>Entity Type: Booking / Contact / Client<br/>Trigger: DELETE / UPDATE / CREATE OR CHANGE<br/>Same as Calling Entity · SQL Query<br/>Max Attempts · Error Log Email"]
    S2L["Step 2 — Configuration (Pull)<br/>Max Re-execution Attempts<br/>Error Log Email<br/>Next Integration — chain to existing integration"]
    S2P --> S3P
    S2L --> S3L

    S3P["Step 3 — Destination (Push)"]
    S3P --> ACTION{Integration Action?}
    ACTION -->|HTTP Service| HTTP_SVC["HTTP Service"]
    ACTION -->|HTTP Service External| HTTP_EXT["HTTP Service External"]
    ACTION -->|FTP| FTP["FTP / SFTP panel<br/>Inbound: pull files from remote<br/>Outbound: push files to remote<br/>Description · File name prefix · Credentials"]

    HTTP_SVC --> HTTP_DEST["HTTP Service Destination<br/>Base URL · Method · Operation · Auth"]
    HTTP_DEST --> ADD_INT
    HTTP_DEST -.-> ADD

    HTTP_EXT -.-> ADD
    HTTP_EXT --> HTTP_EXT_D1["Destination 1<br/>Base URL · Method · Operation · Auth"]
    HTTP_EXT_D1 --> ADD_DEST{Add Next Destination?}
    ADD_DEST -->|Yes| HTTP_EXT_D2["Destination 2<br/>Base URL · Method · Operation · Auth"]
    HTTP_EXT_D1 --> ADD_INT
    HTTP_EXT_D2 --> ADD_INT

    S3L["Step 3 — Destination (Pull)<br/>External API URL (http/https)"]
    S3FD["Step 2 — Destination (File / Document)<br/>External API URL<br/><i>Configuration step is skipped</i>"]

    FTP --> ADD_INT
    S3L --> ADD_INT
    S3FD --> ADD_INT

    ADD_INT["Add Integration<br/>at Destination step"]
    ADD_INT --> CHAIN{Chain another integration?}
    CHAIN -->|Yes| SAVE["Save current integration as Parent<br/>Reset form and start Child integration"]
    SAVE --> S1
    CHAIN -->|No| MAP

    MAP["Step 4 — Field Mapping (required)<br/>Source payload ↔ Target fields<br/>Tabs: JSON / XML / Upload<br/>Parse payload · Auto-map · Manual rows<br/>At least one source → target pair required"]
    MAP --> SUBMIT[Submit Integration]

    SUBMIT --> CHAINCHECK{Part of a chain?}
    CHAINCHECK -->|No — single integration| DONE([Saved → Configurations List])
    CHAINCHECK -->|Yes — child with saved parents| REVIEW["Review saved Parent integrations<br/>Walk through each parent step with Next / Back"]
    REVIEW --> MORE{More parents to review?}
    MORE -->|Yes| REVIEW
    MORE -->|No — last parent| FINISH["Finish chain<br/>Parent₁ → Parent₂ → … → Child"]
    FINISH --> DONE

    style START fill:#f0f4ff,stroke:#4a6cf7
    style DONE fill:#e8f8ef,stroke:#22a06b
    style TYPE fill:#fff8e6,stroke:#e6a817
    style TYPECHECK fill:#fff8e6,stroke:#e6a817
    style ACTION fill:#fff8e6,stroke:#e6a817
    style ADD_DEST fill:#fff8e6,stroke:#e6a817
    style ADD_INT fill:#f0f4ff,stroke:#4a6cf7
    style CHAIN fill:#fff8e6,stroke:#e6a817
    style CHAINCHECK fill:#fff8e6,stroke:#e6a817
    style MORE fill:#fff8e6,stroke:#e6a817
    style T_PUSH fill:#fff3e0,stroke:#f59e0b
    style T_PULL fill:#e0f2fe,stroke:#0ea5e9
    style T_FILE fill:#ecfdf5,stroke:#10b981
    style T_DOC fill:#f3e8ff,stroke:#8b5cf6
```

## Wizard steps by type

| Type | Steps | Flow |
|------|-------|------|
| **Push** | 4 | General Details → Configuration → Destination → Field Mapping |
| **Pull** | 4 | General Details → Configuration → Destination → Field Mapping |
| **File** | 3 | General Details → Destination → Field Mapping |
| **Document** | 3 | General Details → Destination → Field Mapping |

## Integration types

| Type | Data direction | Configuration | Destination options |
|------|----------------|---------------|---------------------|
| **Push** | Optimo → external system | Entity, trigger, SQL query, error email | HTTP Service, HTTP Service External, FTP |
| **Pull** | External system → Optimo | Max attempts, error email, next integration | External API URL |
| **File** | Bidirectional file exchange | *(skipped)* | External API URL |
| **Document** | External → Optimo (documents) | *(skipped)* | External API URL |

## Notes

- **Field mapping is required** — submit is blocked until at least one source → target mapping exists.
- **HTTP Service** — select action → configure **HTTP Service Destination** (single panel) → *Add Integration* to chain or continue to mapping.
- **HTTP Service External** — can go directly to *Add Integration*; optionally configure Destination 1 and/or Destination 2 via *Add Next Destination* (up to 2 HTTP panels).
- **Integration chaining** — *Add Integration* at the Destination step saves the current form as a parent and starts a new child integration. Submitting the child triggers a parent review before the full chain is saved.
- **No test / simulation step** in the current wizard — integrations save directly after field mapping (or after parent-chain review).
