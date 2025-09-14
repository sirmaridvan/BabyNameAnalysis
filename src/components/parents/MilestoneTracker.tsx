import React from 'react';

interface Milestone { id: string; label: string; done?: boolean; description?: string; }
interface MilestoneTrackerProps { milestones?: Milestone[]; }

const defaultMilestones: Milestone[] = [
  { id: 'shortlist', label: 'Ön Liste Oluştur', description: 'İlk 5-10 ismi not edin.' },
  { id: 'sound', label: 'Ses Uyumunu Dinle', description: 'Soyisimle birlikte yüksek sesle okuyun.' },
  { id: 'meaning', label: 'Anlamı İncele', description: 'Kültürel ve duygusal katmanları gözden geçirin.' },
  { id: 'family', label: 'Aile Geri Bildirimi', description: 'Yakın çevrenin hislerini dinleyin; karar size ait.' },
  { id: 'rest', label: 'Dinlen & Sindir', description: 'Bir gece araya koyun; hissiniz nasıl değişiyor bakın.' },
  { id: 'decide', label: 'Kararı Netleştir', description: 'Kalbinizde sıcak kalan ismi seçin.' }
];

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ milestones = defaultMilestones }) => {
  const [list, setList] = React.useState(milestones);
  function toggle(id: string) {
    setList(ls => ls.map(m => m.id === id ? { ...m, done: !m.done } : m));
  }
  return (
    <section className="milestone-tracker card" aria-labelledby="milestone-heading">
      <h2 id="milestone-heading" className="section-title">İsim Seçim Adımları</h2>
      <ul className="milestone-list" role="list">
        {list.map(m => (
          <li key={m.id} className={`milestone-item ${m.done ? 'is-done' : ''}`}>
            <label>
              <input type="checkbox" checked={!!m.done} onChange={() => toggle(m.id)} aria-label={`${m.label} tamamlandı mı?`}/>
              <span className="milestone-text">
                <span className="milestone-label">{m.label}</span>
                {m.description && <span className="milestone-desc">{m.description}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MilestoneTracker;
