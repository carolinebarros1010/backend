import React from "react";

/**
 * Simple dashboard page for the FemFlow admin panel.
 * Uses the FemFlow color palette defined in Tailwind for styling.
 */
const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-fem-cream p-4">
      <h1 className="text-3xl font-bold text-fem-terracotta mb-6">
        Painel FemFlow
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-fem-peach p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-semibold text-fem-terracotta mb-2">Usuários</h2>
          <p>Gerenciar usuários, ver status e planos.</p>
        </div>
        <div className="bg-fem-peach p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-semibold text-fem-terracotta mb-2">Planos</h2>
          <p>Criar, editar e atribuir planos de treino.</p>
        </div>
        <div className="bg-fem-peach p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-semibold text-fem-terracotta mb-2">Pagamentos</h2>
          <p>Histórico de pagamentos e status de assinaturas.</p>
        </div>
        <div className="bg-fem-peach p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-semibold text-fem-terracotta mb-2">Ebooks</h2>
          <p>Gerenciar e liberar acesso a ebooks e cursos.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;