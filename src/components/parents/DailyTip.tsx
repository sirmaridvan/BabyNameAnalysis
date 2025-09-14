import React from 'react';

export interface DailyTipData { id: string; title: string; body: string; }

const defaultTips: DailyTipData[] = [
  { id: 'bonding', title: 'Sakinlik Molası', body: 'İsim ararken kısa nefes molaları verin. Bebeğinizin kalp atışını hayal edin; seçim yolculuğunuza sıcaklık katsın.' },
  { id: 'meaning', title: 'Anlam Katmanı', body: 'Bir ismi yüksek sesle söyleyin. Tınısı sizde hangi duyguyu uyandırıyor? O duygu çocuğunuza miras kalacak.' },
  { id: 'balance', title: 'Denge', body: 'Gelenekle özgünlük arasında köprü kurun. Aile büyüklerinin sevdiği bir isimle kendi dokunuşunuzu birleştirmeyi deneyin.' }
];

interface DailyTipProps { tips?: DailyTipData[]; }

const DailyTip: React.FC<DailyTipProps> = ({ tips = defaultTips }) => {
  // Random initial index only (changes only when page is reloaded)
  const [index] = React.useState(() => Math.floor(Math.random() * tips.length));
  const tip = tips[index];
  return (
    <aside className="daily-tip card elevate-soft" aria-live="polite" aria-label="Günlük nazik ipucu">
      <div className="tip-header">
        <strong className="tip-title">{tip.title}</strong>
      </div>
      <p className="tip-body">{tip.body}</p>
    </aside>
  );
};

export default DailyTip;
