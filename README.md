# recsys-controle-usuario

Protótipo de sistema de recomendação para streaming com foco em **transparência** e **controle do usuário**, desenvolvido como Projeto Final de Graduação em Ciências da Computação (PUC-Rio).

## Sobre o projeto

Sistemas de recomendação tradicionais constroem o perfil do usuário a partir de interações que nem sempre refletem seus interesses reais — compartilhamento de conta, cliques por curiosidade, dados históricos desatualizados. Isso gera recomendações desalinhadas, sem que o usuário tenha como entender ou corrigir a causa.

Este projeto explora uma alternativa: uma interface onde o usuário **visualiza, entende e edita diretamente** o que move suas recomendações, em vez de depender apenas de like/dislike ou remoção de itens do histórico.

## Funcionalidades do protótipo

- **Edição de interesses por gênero** — ajuste manual de pesos por meio de sliders, refletido em tempo real nas recomendações.
- **Marcação de interações não representativas** — qualquer item do histórico pode ser sinalizado como "não foi eu", sem exclusão definitiva (a marcação pode ser revertida).
- **Filtro de janela temporal** — restringe o histórico considerado pelo sistema (últimos 30 dias, últimos 6 meses, ou tudo).
- **Transparência das recomendações** — cada sugestão exibe os fatores que a geraram (gênero, título similar assistido, tendência entre perfis parecidos), com correção direta a partir do próprio motivo.

> Nesta etapa o catálogo, o histórico e o cálculo de recomendação são simulados (dados mockados). O foco do trabalho está na camada de interação com o perfil, não na acurácia de um algoritmo de recomendação real.

## Stack

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org/) instalado (`node -v` para conferir).

```bash
# instalar dependências
npm install

# rodar em ambiente de desenvolvimento
npm run dev
```

Acesse o endereço exibido no terminal (geralmente `http://localhost:5173`).

## Estrutura

```
src/
├── App.jsx                  # ponto de entrada da aplicação
├── PerfilPreferencias.jsx   # componente principal: perfil de preferências editável
├── index.css
└── main.jsx
```