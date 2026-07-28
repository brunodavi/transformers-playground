# Transformers Playground - Documentação do Projeto

Este é um playground de IA rodando diretamente no navegador, utilizando **Transformers.js** para inferência local, **Preact** para UI e **PicoCSS** para estilização.

## Arquitetura e Padrões
- **Padrão de UI:** Preact com `htm` (para evitar etapas de build).
- **Gerenciamento de Estado:** Hooks customizados (`src/hooks/`) encapsulando a lógica de negócio.
- **Serviços:** Lógica isolada em `src/services/` para interagir com APIs externas (Transformers.js).
- **Componentização:** UI dividida em componentes puros em `src/components/`.

## Estrutura de Pastas
- `index.html`: Entrada principal.
- `src/`: Código fonte.
  - `app.js`: Composição principal do App.
  - `components/`: Componentes visuais.
  - `hooks/`: Lógica de estado e efeitos.
  - `services/`: Lógica de integração com a IA.
- `tests/`: Testes unitários (node --test).

## Padrões de Desenvolvimento
- **Imports:** Utilizamos `esm.sh` para dependências externas no navegador e caminhos relativos para arquivos locais.
- **Ambiente de Testes:** Rodado via `node --test`. Como o código fonte importa módulos de `https://`, os testes unitários devem focar em lógica pura ou usar mocks, evitando importar arquivos que contenham URLs `https://`.
- **Configuração:** `package.json` define `"type": "module"`.
