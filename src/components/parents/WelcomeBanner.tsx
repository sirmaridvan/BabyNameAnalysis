import React from 'react';

interface WelcomeBannerProps { nameExample?: string; }

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ nameExample = 'Elif' }) => {
  return (
    <section className="welcome-banner fade-in-up" aria-labelledby="welcome-heading" role="region">
      <h1 id="welcome-heading" className="welcome-title">Minik Mucizeniz İçin Sevgi Dolu İsim Yolculuğu</h1>
      <p className="welcome-text" aria-describedby="welcome-disclaimer">
        Hoş geldiniz. Burada isimlerin ritmini, geçmişini ve duygusal dokusunu birlikte keşfediyoruz. Sakin bir nefes alın; her adımda yanınızdayız. Örn. <span className="example-name" lang="tr">{nameExample}</span> gibi isimlerin yıllar içindeki yolculuğunu görün, anlam katmanlarını inceleyin ve kalbinize en nazik dokunuşu yapan seçeneğe yaklaşın.
      </p>
      <p id="welcome-disclaimer" className="welcome-small" role="note">Bilgiler destekleyici amaçlıdır; her aile ve her bebek benzersizdir.</p>
    </section>
  );
};

export default WelcomeBanner;
