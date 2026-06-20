-- =========================
-- CLIENTES
-- =========================
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(150),
    cpf VARCHAR(20),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- ORÇAMENTOS
-- =========================
CREATE TABLE orcamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    descricao TEXT,
    valor_total NUMERIC(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE CASCADE
);

-- =========================
-- ITENS DO ORÇAMENTO
-- =========================
CREATE TABLE orcamento_items (
    id SERIAL PRIMARY KEY,
    orcamento_id INTEGER NOT NULL,
    nome VARCHAR(150) NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,

    CONSTRAINT fk_orcamento_items
        FOREIGN KEY (orcamento_id)
        REFERENCES orcamentos(id)
        ON DELETE CASCADE
);

-- =========================
-- PRODUÇÃO
-- =========================
CREATE TABLE producao (
    id SERIAL PRIMARY KEY,
    orcamento_id INTEGER UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    data_inicio DATE,
    data_fim DATE,

    CONSTRAINT fk_producao_orcamentos
        FOREIGN KEY (orcamento_id)
        REFERENCES orcamentos(id)
        ON DELETE CASCADE
);

-- =========================
-- PAGAMENTOS
-- =========================
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    orcamento_id INTEGER NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    data_pagamento DATE,
    metodo VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',

    CONSTRAINT fk_pagamento_orcamentos
        FOREIGN KEY (orcamento_id)
        REFERENCES orcamentos(id)
        ON DELETE CASCADE
);

ALTER TABLE orcamentos
ADD CONSTRAINT check_orcamento_status
CHECK (status IN ('pendente', 'aprovado', 'rejeitado'));

ALTER TABLE producao
ADD CONSTRAINT check_producao_status
CHECK (status IN ('pendente', 'em_andamento', 'concluido'));

ALTER TABLE pagamentos
ADD CONSTRAINT check_pagamento_status
CHECK (status IN ('pendente', 'pago', 'atrasado'));

CREATE INDEX idx_orcamentos_cliente_id ON orcamentos(cliente_id);
CREATE INDEX idx_orcamentos_items_orcamento_id ON orcamento_items(orcamento_id);
CREATE INDEX idx_pagamentos_orcamento_id ON pagamentos(orcamento_id);