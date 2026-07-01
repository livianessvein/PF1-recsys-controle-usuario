import { useState, useMemo, useRef } from "react";

// =============================================================================
// PROTÓTIPO INICIAL — Interface de perfil de preferências editável
// Projeto Final I — Inconsistência em Sistemas de Recomendação
// Layout alinhado ao wireframe (Balsamiq) da Seção 2.2 do relatório.
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
      nomeGenero: genero.nome.toLowerCase(),
      detalhe: "peso " + genero.peso + " no seu perfil",
    });
  }
  if (interacaoBase) {
    motivos.push({
      tipo: "interacao",
      tituloBase: interacaoBase.titulo,
      detalhe: interacaoBase.progresso + "% assistido",
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

// --- Paleta (tokens locais) — tema claro, próximo do wireframe original ---
const C = {
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceAlt: "#F3F4F6",
  border: "#1A1A1A",
  borderSoft: "#D1D5DB",
  text: "#111827",
  textSecondary: "#4B5563",
  textTertiary: "#6B7280",
  accent: "#2563EB",
  accentSoft: "#DBEAFE",
  accentText: "#1D4ED8",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
  dangerBorder: "#FCA5A5",
  dangerText: "#B91C1C",
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
    <div style={{ background: C.bg, color: C.text, fontFamily: "Arial, Helvetica, sans-serif", borderRadius: 8, overflow: "hidden", maxWidth: 900, margin: "0 auto", border: "1px solid " + C.border }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid " + C.border }}>
        <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: -0.5 }}>StreamFlix</div>
        <div style={{ display: "flex", gap: 26, fontSize: 15 }}>
          <span style={{ color: C.text }}>Início</span>
          <span style={{ color: C.text }}>Catálogo</span>
          <span style={{ color: C.accent, fontWeight: 700, borderBottom: "2px solid " + C.accent, paddingBottom: 2 }}>Meu perfil</span>
        </div>
      </div>

      <div style={{ padding: "24px 24px 28px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Seu perfil de preferências</h1>
        <p style={{ fontSize: 14, color: C.textSecondary, margin: "0 0 24px" }}>
          Visualize e edite o que influencia suas recomendações
        </p>

        {/* Grid principal */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) auto minmax(0,1fr)", gap: 24 }}>
          {/* Coluna: gêneros */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <SectionLabel>Interesses por gênero</SectionLabel>
              <span style={{ fontSize: 13, color: C.accent, fontWeight: 600, cursor: "default" }}>editar</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 14 }}>
              {generos.map((g) => (
                <div key={g.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                    <label htmlFor={"s-" + g.id} style={{ color: C.text }}>{g.nome}</label>
                    <span style={{ color: C.textTertiary }}>{rotuloPeso(g.peso)}</span>
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

            <div style={{ marginTop: 28 }}>
              <SectionLabel>Janela de histórico considerada</SectionLabel>
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                {JANELAS.map((j) => {
                  const active = janela === j.id;
                  return (
                    <button
                      key={j.id}
                      type="button"
                      onClick={() => { setJanela(j.id); sinalizar(); }}
                      aria-pressed={active}
                      style={{
                        fontSize: 14,
                        padding: "8px 14px",
                        borderRadius: 6,
                        cursor: "pointer",
                        border: "1px solid " + (active ? C.accent : C.border),
                        background: active ? C.accent : "#FFFFFF",
                        color: active ? "#FFFFFF" : C.text,
                      }}
                    >
                      {j.label}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 12.5, color: C.textTertiary, marginTop: 10, lineHeight: 1.5 }}>
                Interações fora dessa janela deixam de influenciar suas recomendações.
              </p>
            </div>
          </div>

          {/* Divisor vertical */}
          <div style={{ width: 1, background: C.borderSoft }} />

          {/* Coluna: interações recentes */}
          <div>
            <SectionLabel>Interações recentes</SectionLabel>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
              {interacoes.map((it) => {
                const suspeitaAtiva = it.suspeita && !it.desconsiderada;
                return (
                  <div
                    key={it.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      borderRadius: 8,
                      border: "1px solid " + (suspeitaAtiva ? C.danger : C.border),
                      background: suspeitaAtiva ? C.dangerSoft : "#FFFFFF",
                      opacity: it.desconsiderada ? 0.55 : 1,
                    }}
                  >
                    <div style={{ width: 36, height: 46, borderRadius: 4, background: C.surfaceAlt, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 14, fontWeight: 700, margin: 0,
                        textDecoration: it.desconsiderada ? "line-through" : "none",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {it.titulo}
                      </p>
                      <p style={{ fontSize: 12.5, margin: "2px 0 0", color: it.desconsiderada ? C.textTertiary : suspeitaAtiva ? C.dangerText : C.textSecondary }}>
                        {it.desconsiderada ? "não considerado" : suspeitaAtiva ? "assistido por outra pessoa?" : "assistido " + it.progresso + "%"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alternarDesconsiderar(it.id)}
                      aria-label={it.desconsiderada ? "restaurar interação" : "marcar como não representativa"}
                      style={{
                        fontSize: it.desconsiderada ? 13 : 16,
                        fontWeight: 700,
                        padding: it.desconsiderada ? "5px 10px" : "2px 9px",
                        borderRadius: 6,
                        border: "none",
                        background: "transparent",
                        color: it.desconsiderada ? C.accent : C.textSecondary,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      {it.desconsiderada ? "restaurar" : "\u00D7"}
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
            marginTop: 30,
            paddingTop: 22,
            borderTop: "1px solid " + C.border,
            transition: "background-color 200ms",
            background: pulse ? C.accentSoft : "transparent",
            borderRadius: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <SectionLabel>Por que recomendamos isso?</SectionLabel>
            {principal && <span style={{ fontSize: 13, color: C.textSecondary }}>{principal.titulo}</span>}
          </div>

          {principal ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {motivos.map((m, idx) => (
                <div key={idx} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 14px", borderRadius: 6, background: C.surfaceAlt, border: "1px solid " + C.borderSoft,
                  fontSize: 13.5, color: C.text,
                }}>
                  {m.tipo === "genero" && <span>{principal.score}% por gênero: {m.nomeGenero}</span>}
                  {m.tipo === "interacao" && <span>similar à &quot;{m.tituloBase}&quot;</span>}
                  {m.tipo === "tendencia" && <span>tendência entre usuários parecidos</span>}
                  {m.tipo === "interacao" && (
                    <button
                      type="button"
                      onClick={() => alternarDesconsiderar(m.interacaoId)}
                      style={{
                        fontSize: 12.5, fontWeight: 600, border: "none", background: "transparent",
                        color: C.danger, cursor: "pointer", padding: 0, marginLeft: 2,
                      }}
                    >
                      corrigir
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13.5, color: C.textTertiary }}>Ajuste seus interesses para gerar uma recomendação.</p>
          )}

          {recomendacoes.length > 1 && (
            <div style={{ marginTop: 18 }}>
              <span style={{ fontSize: 12, color: C.textTertiary }}>outras sugestões: </span>
              <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {recomendacoes.slice(1).map((r) => (
                  <div key={r.titulo} style={{
                    display: "flex", alignItems: "center", gap: 6, fontSize: 12.5,
                    background: "#FFFFFF", border: "1px solid " + C.borderSoft, borderRadius: 6, padding: "5px 10px",
                    color: C.textSecondary,
                  }}>
                    <span>{r.titulo}</span>
                    <span style={{ color: C.textTertiary }}>{r.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <h2 style={{ fontSize: 15.5, fontWeight: 700, color: "#111827", margin: 0 }}>
      {children}
    </h2>
  );
}