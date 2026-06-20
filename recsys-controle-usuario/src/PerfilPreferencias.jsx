import { useState, useMemo, useRef } from "react";

// =============================================================================
// PROTÓTIPO INICIAL — Interface de perfil de preferências editável
// Projeto Final I — Inconsistência em Sistemas de Recomendação
// Dados de catálogo, histórico e pesos de preferência são fictícios (mockados).
// =============================================================================

const GENEROS_INICIAIS = [
  { id: "ficcao", nome: "Ficção científica", peso: 85 },
  { id: "romance", nome: "Comédia romântica", peso: 20 },
  { id: "documentario", nome: "Documentários", peso: 55 },
  { id: "terror", nome: "Terror", peso: 65 },
  { id: "drama", nome: "Drama", peso: 40 },
];

const INTERACOES_INICIAIS = [
  { id: "i1", titulo: "Nebulosa Distante", genero: "ficcao", progresso: 92, suspeita: false, desconsiderada: false },
  { id: "i2", titulo: "Bonecas Mágicas 3", genero: "romance", progresso: 18, suspeita: true, desconsiderada: false },
  { id: "i3", titulo: "O Último Algoritmo", genero: "ficcao", progresso: 100, suspeita: false, desconsiderada: false },
  { id: "i4", titulo: "Tarde de Clique", genero: "terror", progresso: 4, suspeita: true, desconsiderada: true },
  { id: "i5", titulo: "Arquivos do Vazio", genero: "ficcao", progresso: 78, suspeita: false, desconsiderada: false },
];

const CATALOGO = [
  { titulo: "Horizonte de Sucesso", genero: "ficcao" },
  { titulo: "Nebulosa Distante", genero: "ficcao" },
  { titulo: "A Sala Silenciosa", genero: "terror" },
  { titulo: "Crônicas de Outono", genero: "drama" },
  { titulo: "O Último Algoritmo", genero: "ficcao" },
  { titulo: "Risadas de Verão", genero: "romance" },
  { titulo: "Vidas Documentadas", genero: "documentario" },
];

const JANELAS = [
  { id: "30d", label: "Últimos 30 dias" },
  { id: "6m", label: "Últimos 6 meses" },
  { id: "tudo", label: "Tudo" },
];

// --- Lógica simplificada de recomendação (camada de interação, não algorítmica) ---

function calcularRecomendacoes(generos, interacoes) {
  const pesoGenero = Object.fromEntries(generos.map((g) => [g.id, g.peso]));
  const interacoesValidas = interacoes.filter((i) => !i.desconsiderada);
  const titulosVistos = new Set(interacoesValidas.map((i) => i.titulo));
  const candidatos = CATALOGO.filter((c) => !titulosVistos.has(c.titulo));

  const pontuados = candidatos.map((c) => {
    const base = pesoGenero[c.genero] ?? 0;
    const reforco = interacoesValidas.filter((i) => i.genero === c.genero).length * 3;
    const score = Math.max(1, Math.min(99, Math.round(base * 0.9 + reforco)));
    return { ...c, score };
  });

  return pontuados.sort((a, b) => b.score - a.score).slice(0, 3);
}

function motivosDoTopo(generos, interacoes, recomendado) {
  if (!recomendado) return [];
  const genero = generos.find((g) => g.id === recomendado.genero);
  const interacaoBase = interacoes
    .filter((i) => !i.desconsiderada && i.genero === recomendado.genero)
    .sort((a, b) => b.progresso - a.progresso)[0];

  const motivos = [];
  if (genero) {
    motivos.push({
      tipo: "genero",
      label: "Gênero: " + genero.nome.toLowerCase(),
      detalhe: "peso " + genero.peso + " no seu perfil",
    });
  }
  if (interacaoBase) {
    motivos.push({
      tipo: "interacao",
      label: "Similar a título assistido",
      detalhe: interacaoBase.titulo + " (" + interacaoBase.progresso + "%)",
      interacaoId: interacaoBase.id,
    });
  }
  motivos.push({
    tipo: "tendencia",
    label: "Tendência entre usuários parecidos",
    detalhe: "com base em perfis similares ao seu",
  });
  return motivos;
}

function rotuloPeso(peso) {
  if (peso < 25) return "baixo";
  if (peso < 45) return "médio-baixo";
  if (peso < 65) return "médio";
  if (peso < 85) return "médio-alto";
  return "alto";
}

// --- Paleta (tokens locais) ---
const C = {
  bg: "#0E1116",
  surface: "#171B22",
  surfaceAlt: "#1D222B",
  border: "#272D38",
  borderSoft: "#1F2530",
  text: "#EDEFF2",
  textSecondary: "#9098A8",
  textTertiary: "#6B7280",
  accent: "#E8A33D",
  accentSoft: "#3A2E18",
  accentText: "#F4C572",
  danger: "#E2574C",
  dangerSoft: "#341E1C",
  dangerText: "#F2918A",
};

export default function PerfilPreferencias() {
  const [generos, setGeneros] = useState(GENEROS_INICIAIS);
  const [interacoes, setInteracoes] = useState(INTERACOES_INICIAIS);
  const [janela, setJanela] = useState("6m");
  const [pulse, setPulse] = useState(false);
  const pulseTimer = useRef(null);

  const recomendacoes = useMemo(() => calcularRecomendacoes(generos, interacoes), [generos, interacoes]);
  const principal = recomendacoes[0];
  const motivos = useMemo(() => motivosDoTopo(generos, interacoes, principal), [generos, interacoes, principal]);

  function sinalizar() {
    setPulse(true);
    if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    pulseTimer.current = window.setTimeout(() => setPulse(false), 700);
  }

  function atualizarPeso(id, valor) {
    setGeneros((prev) => prev.map((g) => (g.id === id ? { ...g, peso: Number(valor) } : g)));
    sinalizar();
  }

  function alternarDesconsiderar(id) {
    setInteracoes((prev) => prev.map((i) => (i.id === id ? { ...i, desconsiderada: !i.desconsiderada } : i)));
    sinalizar();
  }

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", borderRadius: 16, overflow: "hidden", maxWidth: 880, margin: "0 auto", border: "1px solid " + C.border }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid " + C.border }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15, letterSpacing: 0.2 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: C.accent, display: "inline-block" }} />
          StreamFlix
        </div>
        <div style={{ display: "flex", gap: 22, fontSize: 13, color: C.textSecondary }}>
          <span>Início</span>
          <span>Catálogo</span>
          <span style={{ color: C.text, fontWeight: 500, borderBottom: "2px solid " + C.accent, paddingBottom: 14, marginBottom: -17 }}>Meu perfil</span>
        </div>
      </div>

      <div style={{ padding: "22px 24px 26px" }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, margin: "0 0 4px" }}>Seu perfil de preferências</h1>
        <p style={{ fontSize: 13, color: C.textSecondary, margin: "0 0 22px" }}>
          Visualize e edite o que influencia suas recomendações
        </p>

        {/* Grid principal */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)", gap: 28 }}>
          {/* Coluna: gêneros */}
          <div>
            <SectionLabel>Interesses por gênero</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 14 }}>
              {generos.map((g) => (
                <div key={g.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <label htmlFor={"s-" + g.id} style={{ color: C.text }}>{g.nome}</label>
                    <span style={{ color: C.textTertiary, fontVariantNumeric: "tabular-nums" }}>{rotuloPeso(g.peso)}</span>
                  </div>
                  <input
                    id={"s-" + g.id}
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={g.peso}
                    onChange={(e) => atualizarPeso(g.id, e.target.value)}
                    style={{
                      width: "100%",
                      accentColor: C.accent,
                      height: 4,
                      cursor: "pointer",
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 26 }}>
              <SectionLabel>Janela de histórico considerada</SectionLabel>
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {JANELAS.map((j) => {
                  const active = janela === j.id;
                  return (
                    <button
                      key={j.id}
                      type="button"
                      onClick={() => { setJanela(j.id); sinalizar(); }}
                      aria-pressed={active}
                      style={{
                        fontSize: 12.5,
                        padding: "7px 13px",
                        borderRadius: 8,
                        cursor: "pointer",
                        border: "1px solid " + (active ? C.accent : C.border),
                        background: active ? C.accentSoft : "transparent",
                        color: active ? C.accentText : C.textSecondary,
                        transition: "background 120ms, border-color 120ms",
                      }}
                    >
                      {j.label}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 12, color: C.textTertiary, marginTop: 10, lineHeight: 1.5 }}>
                Interações fora dessa janela deixam de influenciar suas recomendações.
              </p>
            </div>
          </div>

          {/* Coluna: interações recentes */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <SectionLabel>Interações recentes</SectionLabel>
              <span style={{ fontSize: 11, color: C.textTertiary }}>marcar como não representativo</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
              {interacoes.map((it) => {
                const suspeitaAtiva = it.suspeita && !it.desconsiderada;
                return (
                  <div
                    key={it.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 10,
                      borderRadius: 10,
                      border: "1px solid " + (suspeitaAtiva ? "#5A2E29" : C.border),
                      background: suspeitaAtiva ? C.dangerSoft : C.surface,
                      opacity: it.desconsiderada ? 0.5 : 1,
                      transition: "opacity 150ms",
                    }}
                  >
                    <div style={{ width: 34, height: 44, borderRadius: 6, background: C.surfaceAlt, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 12.5, fontWeight: 500, margin: 0,
                        textDecoration: it.desconsiderada ? "line-through" : "none",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {it.titulo}
                      </p>
                      <p style={{ fontSize: 11, margin: "2px 0 0", color: it.desconsiderada ? C.textTertiary : suspeitaAtiva ? C.dangerText : C.textSecondary }}>
                        {it.desconsiderada ? "não considerado no perfil" : suspeitaAtiva ? "padrão fora do habitual — confirmar?" : "assistido " + it.progresso + "%"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alternarDesconsiderar(it.id)}
                      style={{
                        fontSize: 11,
                        padding: "6px 10px",
                        borderRadius: 7,
                        border: "1px solid " + C.border,
                        background: "transparent",
                        color: C.textSecondary,
                        cursor: "pointer",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {it.desconsiderada ? "restaurar" : "não foi eu"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transparência: por que recomendamos */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 22,
            borderTop: "1px solid " + C.border,
            transition: "background-color 200ms",
            background: pulse ? "rgba(232,163,61,0.05)" : "transparent",
            borderRadius: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <SectionLabel>Por que recomendamos isso?</SectionLabel>
            {principal && <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{principal.titulo}</span>}
          </div>

          {principal ? (
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div style={{
                minWidth: 92, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                background: C.surface, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 10px",
              }}>
                <span style={{ fontSize: 24, fontWeight: 600, color: C.accentText, fontVariantNumeric: "tabular-nums" }}>{principal.score}%</span>
                <span style={{ fontSize: 11, color: C.textTertiary, marginTop: 2 }}>compatível</span>
              </div>

              <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 8 }}>
                {motivos.map((m, idx) => (
                  <div key={idx} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                    padding: "9px 12px", borderRadius: 8, background: C.surface, border: "1px solid " + C.borderSoft,
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 500 }}>{m.label}</span>
                      <span style={{ fontSize: 11, color: C.textSecondary }}>{m.detalhe}</span>
                    </div>
                    {m.tipo === "interacao" && (
                      <button
                        type="button"
                        onClick={() => alternarDesconsiderar(m.interacaoId)}
                        style={{
                          fontSize: 11, padding: "6px 10px", borderRadius: 7, flexShrink: 0,
                          border: "1px solid #5A2E29", background: "transparent", color: C.dangerText, cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        não foi eu — corrigir
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 12.5, color: C.textTertiary }}>Ajuste seus interesses para gerar uma recomendação.</p>
          )}

          {recomendacoes.length > 1 && (
            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {recomendacoes.slice(1).map((r) => (
                <div key={r.titulo} style={{
                  display: "flex", alignItems: "center", gap: 8, fontSize: 11.5,
                  background: C.surface, border: "1px solid " + C.borderSoft, borderRadius: 999, padding: "6px 12px",
                  color: C.textSecondary,
                }}>
                  <span>{r.titulo}</span>
                  <span style={{ color: C.textTertiary }}>{r.score}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <h2 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, color: "#9098A8", margin: 0 }}>
      {children}
    </h2>
  );
}
