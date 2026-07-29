# Part 2 — Loading state no botão "Executar Pipeline"

## Contexto atual

**Parte 1 já concluída e commitada**: PipelineForm agora mostra "Carregando..." / "Descarregar" / "Carregar Modelo" conforme o estado.

**Problema**: o botão "Executar Pipeline" em `src/components/InferenceForm.js` usa o mesmo `loading` compartilhado do hook `useApp.js`. Quando o pipeline está carregando, `loading=true` também desabilita o botão de inferência, mas o texto continua "Executar Pipeline" em vez de mostrar "Executando...".

## O que fazer

### 1. Separar loading states no `useApp.js`

Atualmente há um único `loading` que serve tanto para o carregamento do pipeline quanto para a execução da inferência. O ideal é ter dois estados separados:

```js
const [pipelineLoading, setPipelineLoading] = useState(false);
const [inferenceLoading, setInferenceLoading] = useState(false);
```

Ou manter um `loading` geral e adicionar um específico. O importante é que o botão do InferenceForm mostre "Executando..." durante a inferência.

### 2. Atualizar InferenceForm

Mudar o texto do botão conforme o estado:

| Estado | Texto |
|---|---|
| Sem pipeline | "Executar Pipeline" (disabled) |
| Pipeline carregado, ocioso | "Executar Pipeline" |
| Inferência rodando | "Executando..." (disabled, aria-busy) |

### 3. Atualizar testes

- `tests/components/InferenceForm.test.mjs`: os testes existentes buscam por `screen.getByText('Executar Pipeline')`. O teste de loading (`InferenceForm disables button while loading`) precisará buscar por `'Executando...'` e receber a nova prop de loading específica.
- `tests/hooks/useApp.test.mjs`: verificar se o novo estado de loading de inferência é exposto corretamente.

### 4. Fluxo de validação

```bash
npm run test:components   # 34 testes, todos passando
npm run lint              # 0 erros
```

### Arquivos que vão mudar

- `src/hooks/useApp.js` — separar loading states, expor `inferenceLoading`
- `src/components/InferenceForm.js` — botão com texto condicional
- `src/app.js` — passar `inferenceLoading` para InferenceForm
- `tests/components/InferenceForm.test.mjs` — atualizar asserções
- `tests/hooks/useApp.test.mjs` — verificar novo estado

### Commit style

```bash
git add -A && git commit -m "feat: add loading state to inference button"
```

---

**Para iniciar a sessão**: ler `AGENTS.md`, `docs/NEXT-SESSION.md`, e os arquivos listados acima. Todo o contexto está nos arquivos.
