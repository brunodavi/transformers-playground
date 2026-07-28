# Transformers Playground - Documentação do Projeto

Este é um playground de IA rodando diretamente no navegador, utilizando **Transformers.js** para inferência local, **Preact** para UI e **PicoCSS** para estilização.

## Arquitetura e Padrões
- **Padrão de UI:** Preact com `htm` (para evitar etapas de build).
- **Gerenciamento de Estado:** Hooks customizados (`src/hooks/`) encapsulando a lógica de negócio.
- **Lógica de integração:** Isolada em `src/factories/` (createPipeline).
- **Componentização:** UI dividida em componentes puros em `src/components/`.
- **Constantes:** Dados fixos em `src/constants/` (ex: lista de tarefas do Transformers.js).
- **Componentes Reutilizáveis:** `TaskSelect` aceita prop `allowCustom` para permitir valores personalizados fora da lista padrão.

## Estrutura de Pastas
- `index.html`: Entrada principal.
- `start-server.js`: Servidor HTTP estático (ESM, sem dependências).
- `src/`: Código fonte.
  - `app.js`: Composição principal do App.
  - `components/`: Componentes visuais (PipelineForm, InferenceForm, ModelInput, ProgressForm, TaskSelect).
  - `hooks/`: Lógica de estado e efeitos (useApp, useProgress).
  - `factories/`: Lógica de integração com a IA (createPipeline.js).
  - `constants/`: Dados estáticos (tasks.js).
- `tests/`: Testes.
  - `constants/`: Testes da TASKS.
  - `factories/`: Testes do createPipeline (incluindo checkModelExists).
  - `hooks/`: Testes de lógica pura (useProgress) e integração (useApp).
  - `components/`: Testes de componentes com DOM simulado.
  - `helpers/`: Loader ESM e setup de DOM para testes de componente.
- `stryker.config.json`: Configuração do mutation testing.
- `docs/transformers/`: Documentação offline do Transformers.js (não commitada).

## Testes

### Comandos

| Comando | Descrição |
|---|---|
| `npm test` | Testes unitários (43 tests) |
| `npm run test:coverage` | Testes unitários com cobertura (c8) |
| `npm run test:components` | Testes de componente com DOM simulado (20 tests) |
| `npm run test:mutation` | Mutation testing com Stryker |

### Tipos de Teste

**Unitários** (`tests/constants/`, `tests/factories/`, `tests/hooks/`):
- Rodam com `node --test` puro, sem loader.
- Testam lógica pura: `createPipeline`, `runInference`, `checkModelExists`, `useProgress`, `TASKS`, e integração do `useApp`.
- Mocks manuais de `fetch`, `globalThis.pipeline`, etc.

**Componentes** (`tests/components/`):
- Rodam com `node --import` + loader ESM (`tests/helpers/`).
- Usam `linkedom` para DOM headless e `@testing-library/preact` para queries e eventos.
- Loader redireciona `https://esm.sh/` → pacotes locais (`preact`, `htm`, `@testing-library/preact`).
- Testam: renderização, botões desabilitados/habilitados, submit de formulários, onChange de selects, progresso de download.

**Integração** (`tests/components/useApp.integration.test.mjs`):
- Testa o hook `useApp` com `renderHook` do `@testing-library/preact`.
- Mock completo do pipeline: load, execução de inferência, tratamento de erros.

### Mutation Testing

Stryker modifica o código fonte (inverte operadores, remove condições, etc.) e verifica se os testes detectam a mutação. Mutantes sobreviventes indicam testes fracos.

```bash
npm run test:mutation
```

### Cobertura

```bash
npm run test:coverage
```

Gera relatório no terminal com `c8`. Alvos: 100% statements, 100% functions, 100% lines.

## Armadilhas Conhecidas

### `useState` + Funções no Preact/React

O `useState` do Preact (e React) trata **qualquer valor function** passado ao setter como "functional updater" — ele chama a função com o estado anterior. Se você fizer:

```js
const [pipe, setPipe] = useState(null);
setPipe(someAsyncFunction); // ❌ Preact chama someAsyncFunction(null)
```

`pipe` será o **retorno** de `someAsyncFunction`, não a função em si.

**Solução em `useApp.js`:**
```js
setPipelineInstance(typeof pipe === 'function' ? { __call__: pipe } : pipe);
```

E em mocks de teste, usar objetos em vez de funções:
```js
win.pipeline = async () => ({
    __call__: async (input) => ({ result: `processed: ${input}` }),
});
```

O `runInference` já suporta objetos via `pipe.__call__ || pipe.call || pipe.run`.

### Testes de Componente com ESM do esm.sh

Os componentes importam de `https://esm.sh/`. Para testar em Node, um loader ESM redireciona esses imports para pacotes locais:

- `tests/helpers/resolve-hook.mjs`: Mapeia URLs do esm.sh para pacotes npm.
- `tests/helpers/register-loader.mjs`: Registra o loader via `register()` do `node:module`.
- `tests/helpers/dom-setup.mjs`: Inicializa `linkedom`, `getComputedStyle`, `HTMLSelectElement.prototype.value`, e mock do `pipeline`.

### `fireEvent.click` em formulários

`fireEvent.click` em botões `type="submit"` **não** dispara o submit do form automaticamente no DOM simulado. Use `fireEvent.submit(formElement)` diretamente.

### `getByRole` com linkedom

`getByRole` depende de `getComputedStyle`, que não existe no linkedom. Adicione no setup: `globalThis.getComputedStyle = () => ({});`.

### `HTMLSelectElement.value` no linkedom

O linkedom não implementa `value` no `<select>`. O setup adiciona um getter/setter via `Object.defineProperty(HTMLSelectElement.prototype, 'value', ...)`.

## Padrões de Desenvolvimento
- **Imports no navegador:** `https://esm.sh/` para dependências externas; caminhos relativos para arquivos locais.
- **Testes unitários:** Não importam de `https://` (usam mocks). Focam em lógica pura.
- **Testes de componente:** Importam de `https://` mas o loader redireciona para pacotes locais.
- **Configuração:** `package.json` define `"type": "module"`. `start-server.js` usa ESM (`import`).
- **Commits:** Usar [Conventional Commits](https://www.conventionalcommits.org/) em inglês (ex: `feat:`, `fix:`, `test:`, `refactor:`, `chore:`).

## Fluxo de Trabalho TDD (Red-Green-Refactor)

Este projeto segue **estritamente TDD**. O fluxo é:

### Hierarquia de Testes (Top-Down)
1. **Integração mais alta primeiro** — `tests/components/app.test.js` (ou o teste de mais alto nível equivalente)
2. Se o erro não for encontrado ou não reproduzir, **desce um nível** (ex: `tests/hooks/`, `tests/factories/`, `tests/components/`)
3. Repete o ciclo TDD em cada nível até encontrar a camada específica onde o erro se manifesta
4. Erros podem aparecer **somente em camadas específicas** (ex: só no componente, só no hook, só na factory)

### Ciclo Red-Green-Refactor

#### 🔴 RED
- Escrevo o teste que reproduz o bug ou valida a nova funcionalidade
- Rodo o teste e confirmo que **falha** com a mensagem de erro esperada
- A mensagem de erro específica nos logs temporários do console ou no texto de erro dos testes é a âncora para o GREEN

#### 🟢 GREEN
- Faço o **mínimo necessário** para o teste passar
- Uso a mensagem de erro específica dos logs/console como guia para a implementação
- Assim que o erro específico desaparecer e o teste passar, **paro** (mesmo que o código não seja ideal)
- **Commits:** `git add -A && git commit -m "test: add test for X"` no RED, `git add -A && git commit -m "feat: implement X"` no GREEN

#### 🔵 REFACTOR (Opcional, com permissão)
- Após o GREEN e o commit, **pergunto ao usuário** se deseja refatorar para simplificar algo que pode ser melhorado, por exemplo:
  - Extrair lógica para funções menores
  - Mover lógica para um hook existente ou novo
  - Separar em componentes menores
  - Renomear variáveis/funções para maior clareza
  - Melhorar coesão ou reduzir acoplamento
- Só refatoro **após confirmação explícita** do usuário
- Após refatorar, rodo os testes novamente para garantir que continuam VERDE
- **Commit do refactor:** `git add -A && git commit -m "refactor: simplify X by extracting Y"`

### Regras Gerais
- **Nunca** escrevo código de produção sem antes ter um teste vermelho.
- **Nunca** refatoro sem ter os testes verdes primeiro.
- **Nunca** refatoro sem perguntar ao usuário antes.
- A hierarquia de testes pode exigir múltiplas passadas: se o bug está no hook, posso precisar de um teste de integração no app.test.js, depois descer para o hook.test.js.

## Documentação de Referência
- O diretório `docs/transformers` contém documentação offline do Transformers.js para consulta quando necessário.
- **Atenção:** Não commitar este diretório no git, pois contém documentação de terceiros com direitos autorais.
