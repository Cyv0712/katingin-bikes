import React from 'react';
import Reveal from './Reveal';

const BrandMarquee = () => {
  const logos = [
    { name: 'Ducati', src: '/static_data/ducati_logo.png' },
    { name: 'BMW Motorrad', src: '/static_data/bmw-seeklogo.png' },
    { name: 'Kawasaki', src: '/static_data/kawasaki_logo.png' },
    { name: 'Honda', src: '/static_data/honda-png-logo-32839.png' },
    { name: 'Yamaha', src: '/static_data/yamaha_logo.png' },
    { name: 'Triumph', src: '/static_data/triumph_logo.png' },
    { name: 'KTM', src: '/static_data/ktm_logo.png' },
    { name: 'Suzuki', src: '/static_data/suzuki_logo.png' },
    { name: 'Aprilia', src: '/static_data/aprilia-3-logo-png-transparent.png' },
    { name: 'Harley Davidson', src: '/static_data/harley-davidson-logo-png-16295.png' }
  ];

  return (
    <Reveal>
      <div className="marquee-container">
        <div className="marquee-content">
          {/* Render the original list */}
          {logos.map((logo, idx) => (
            <img key={idx} src={logo.src} alt={logo.name} className={`brand-logo ${logo.name === 'BMW Motorrad' ? 'no-invert' : ''}`} />
          ))}
          {/* Render a duplicate list right next to it so the infinite scroll loops seamlessly */}
          {logos.map((logo, idx) => (
            <img key={`dup-${idx}`} src={logo.src} alt={logo.name} className={`brand-logo ${logo.name === 'BMW Motorrad' ? 'no-invert' : ''}`} />
          ))}
        </div>
      </div>
    </Reveal>
  );
};

export default BrandMarquee;
