import Reveal from './Reveal';

const BrandMarquee = () => {
  const logos = [
    { name: 'Ducati', src: '/static_data/ducati_logo.webp' },
    { name: 'BMW Motorrad', src: '/static_data/bmw-seeklogo.webp' },
    { name: 'Kawasaki', src: '/static_data/kawasaki_logo.webp' },
    { name: 'Honda', src: '/static_data/honda-png-logo-32839.webp' },
    { name: 'Yamaha', src: '/static_data/yamaha_logo.webp' },
    { name: 'Triumph', src: '/static_data/triumph_logo.webp' },
    { name: 'KTM', src: '/static_data/ktm_logo.webp' },
    { name: 'Suzuki', src: '/static_data/suzuki_logo.webp' },
    { name: 'Aprilia', src: '/static_data/aprilia-3-logo-png-transparent.webp' },
    { name: 'Harley Davidson', src: '/static_data/harley-davidson-logo-png-16295.webp' }
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
