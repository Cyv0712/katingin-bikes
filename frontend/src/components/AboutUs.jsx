import { ShieldCheck, ClipboardCheck, FileText } from 'lucide-react';
import { brandConfig } from '../data/brandConfig';

const pillars = [
  {
    Icon: ShieldCheck,
    title: 'Verified quality',
    body: 'Every unit goes through a strict 100-point mechanical inspection by certified technicians before it enters our showroom.',
  },
  {
    Icon: ClipboardCheck,
    title: 'Full transparency',
    body: 'We disclose the complete bike history and true odometer readings. No hidden issues, no surprises.',
  },
  {
    Icon: FileText,
    title: 'Clean documents',
    body: 'Authentic registration, complete OR/CR papers, and hassle-free transfer assistance.',
  },
];

const AboutUs = () => (
  <section id="about" className="kb-section" aria-labelledby="difference-heading">
    <div className="container">
      <div className="mb-5" style={{ maxWidth: '640px' }}>
        <h2 id="difference-heading" className="kb-h2 mb-3">The Katingin difference</h2>
        <p className="kb-body-lg m-0">{brandConfig.quote}</p>
      </div>
      <div className="kb-grid-3">
        {pillars.map(({ Icon, title, body }) => (
          <div className="moto-card kb-feature" key={title}>
            <Icon size={32} strokeWidth={1.75} aria-hidden="true" />
            <h3 className="kb-h4 m-0">{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutUs;
