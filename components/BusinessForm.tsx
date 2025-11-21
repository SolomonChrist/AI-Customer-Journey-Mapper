import React from 'react';
import { BusinessData } from '../types';
import { Briefcase, Target, DollarSign, ScrollText } from 'lucide-react';

interface BusinessFormProps {
  data: BusinessData;
  onChange: (data: BusinessData) => void;
}

const BusinessForm: React.FC<BusinessFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof BusinessData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Simple comma separated goal parser for this MVP
      const goals = e.target.value.split(',').map(g => g.trim()).filter(Boolean);
      handleChange('goals', goals);
  };

  return (
    <div className="space-y-4 text-sm">
      <div>
        <label className="block text-slate-400 mb-1 flex items-center gap-2">
          <Briefcase size={14} /> Business Name
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 focus:border-blue-500 focus:outline-none transition-colors"
          placeholder="e.g. Acme Corp"
        />
      </div>

      <div>
        <label className="block text-slate-400 mb-1 flex items-center gap-2">
          <ScrollText size={14} /> What you sell
        </label>
        <textarea
          value={data.offer}
          onChange={(e) => handleChange('offer', e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 focus:border-blue-500 focus:outline-none transition-colors h-20 resize-none"
          placeholder="Describe your core offer..."
        />
      </div>

      <div>
        <label className="block text-slate-400 mb-1 flex items-center gap-2">
          <Target size={14} /> Ideal Customer
        </label>
        <textarea
          value={data.customer}
          onChange={(e) => handleChange('customer', e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 focus:border-blue-500 focus:outline-none transition-colors h-20 resize-none"
          placeholder="Who is your perfect buyer?"
        />
      </div>

      <div>
        <label className="block text-slate-400 mb-1 flex items-center gap-2">
          <DollarSign size={14} /> Price Point
        </label>
        <input
          type="text"
          value={data.price}
          onChange={(e) => handleChange('price', e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 focus:border-blue-500 focus:outline-none transition-colors"
          placeholder="High ticket / Low ticket / SaaS subscription"
        />
      </div>

       <div>
        <label className="block text-slate-400 mb-1">Goals (comma separated)</label>
        <input
          type="text"
          defaultValue={data.goals.join(', ')}
          onBlur={handleGoalChange}
          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 focus:border-blue-500 focus:outline-none transition-colors"
          placeholder="Increase LTV, Lower CPA..."
        />
      </div>
    </div>
  );
};

export default BusinessForm;
