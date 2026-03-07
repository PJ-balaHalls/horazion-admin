import { Activity, Users, AlertTriangle } from 'lucide-react';

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      
      {/* Alerta de Acesso Sirius */}
      <div className="bg-horazion-red/10 border border-horazion-red/20 rounded-hz p-4 flex items-start gap-4">
        <AlertTriangle className="text-horazion-red mt-0.5" size={20} />
        <div>
          <h3 className="text-horazion-red font-bold text-sm">Acesso de Nível Máximo (Sirius)</h3>
          <p className="text-xs text-horazion-gray mt-1">
            Você está operando com privilégios de CEO. Todas as ações destrutivas realizadas neste painel são definitivas e registradas nos logs de auditoria imutáveis.
          </p>
        </div>
      </div>

      {/* KPIs Macros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-horazion-white border border-horazion-light p-6 rounded-hz shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-horazion-gray">Cidadãos Horazion (DAU)</h3>
            <Users size={18} className="text-horazion-info" />
          </div>
          <p className="text-3xl font-bold text-horazion-black">12,450</p>
          <p className="text-xs text-horazion-success font-medium mt-2">+12% vs última semana</p>
        </div>

        <div className="bg-horazion-white border border-horazion-light p-6 rounded-hz shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-horazion-gray">Saúde do Core</h3>
            <Activity size={18} className="text-horazion-success" />
          </div>
          <p className="text-3xl font-bold text-horazion-black">Estável</p>
          <p className="text-xs text-horazion-gray mt-2">Latência média: 45ms</p>
        </div>

        <div className="bg-horazion-white border border-horazion-light p-6 rounded-hz shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-horazion-gray">Tickets Pendentes (Ouvidoria)</h3>
            <ShieldAlert size={18} className="text-horazion-warning" />
          </div>
          <p className="text-3xl font-bold text-horazion-black">3</p>
          <p className="text-xs text-horazion-red font-medium mt-2">2 requerem atenção Sirius</p>
        </div>
      </div>

      {/* Conteúdo modular em Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-horazion-white border border-horazion-light p-6 rounded-hz shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold text-horazion-black mb-4">Últimos Logs de Segurança</h3>
          <div className="text-sm text-horazion-gray flex items-center justify-center h-48">
            Nenhuma atividade suspeita nas últimas 24h.
          </div>
        </div>

        <div className="bg-horazion-white border border-horazion-light p-6 rounded-hz shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold text-horazion-black mb-4">Status dos Universos</h3>
          <div className="space-y-4">
            {['Education', 'Individuals', 'Startups'].map((uni) => (
              <div key={uni} className="flex items-center justify-between border-b border-horazion-light pb-2 last:border-0">
                <span className="text-sm font-medium text-horazion-black">{uni}</span>
                <span className="px-2 py-1 bg-horazion-success/10 text-horazion-success text-xs rounded-full font-semibold">Operacional</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}