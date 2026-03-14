import React from 'react';

export function EntityOrgChartTab({ formData, setFormData }: { formData: any, setFormData: any }) {
  const departments = formData?.metadata?.org_chart?.departments || [];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Organograma</h2>
        <p className="text-sm text-gray-500">Mapeamento de departamentos.</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {departments.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum departamento cadastrado.</p>
        ) : (
          departments.map((dept: any) => (
            <div key={dept.id} className="border border-gray-100 p-4 rounded-xl">
              <h4 className="font-bold">{dept.name}</h4>
              <p className="text-xs text-gray-500">ID: {dept.id}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}