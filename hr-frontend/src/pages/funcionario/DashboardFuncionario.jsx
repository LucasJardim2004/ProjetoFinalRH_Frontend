function DashboardFuncionario() {
  return (
    <div>
      <h1>Dashboard do Funcionário</h1>

      <section style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <div style={{ border: "1px solid #ddd", padding: "1rem", flex: 1 }}>
          <h2>Último pagamento</h2>
          <p>Mês: Novembro 2025</p>
          <p>Valor líquido: 1 200,00 €</p>
          <button class="cssbuttons-io">
            <span>Ver detalhes</span>
          </button>
        </div>

        <div style={{ border: "1px solid #ddd", padding: "1rem", flex: 1 }}>
          <h2>Última movimentação</h2>
          <p>De: Suporte</p>
          <p>Para: Desenvolvimento</p>
          <p>Data: 01-10-2025</p>
        </div>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Notificações recentes</h2>
        <ul>
          <li>Atualização de pagamento - Novembro 2025</li>
          <li>Nova política de benefícios disponível</li>
        </ul>
      </section>
    </div>
  );
}

export default DashboardFuncionario;