import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import Reveal from '../components/Reveal';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page pb-5" style={{ backgroundColor: 'var(--bg-void)', minHeight: '100vh', paddingTop: '100px', color: '#e0e0e0' }}>
      <Helmet>
        <title>Privacy Policy | Katingin Bikes</title>
        <meta name="description" content="Privacy Policy for Katingin Bikes. Learn how we collect, use, and protect your data." />
      </Helmet>

      <Container>
        <Reveal>
          <div className="moto-card p-4 p-md-5 mx-auto" style={{ maxWidth: '800px' }}>
            <span className="text-accent mb-2 d-block" style={{ letterSpacing: '4px', textTransform: 'uppercase', fontWeight: '700', fontSize: '0.85rem' }}>
              DATA PRIVACY ACT COMPLIANCE
            </span>
            <h1 className="moto-heading mb-4" style={{ fontSize: '2.5rem' }}>PRIVACY POLICY</h1>
            
            <div className="content-section mb-5" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
              <p>
                At Katingin Bikes, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your personal information in compliance with data privacy regulations. By submitting an inquiry through our platform, you agree to the terms outlined below.
              </p>

              <h4 className="moto-heading text-white mt-5 mb-3" style={{ fontSize: '1.2rem' }}>1. WHAT INFORMATION WE COLLECT</h4>
              <p>
                When you use our Financing Inquiry form, we explicitly collect the following details provided by you:
              </p>
              <ul>
                <li>Full Name</li>
                <li>Email Address</li>
                <li>Contact / Mobile Number</li>
                <li>Motorcycle Unit of Interest</li>
                <li>Any optional messages or downpayment preferences</li>
              </ul>

              <h4 className="moto-heading text-white mt-5 mb-3" style={{ fontSize: '1.2rem' }}>2. THE PURPOSE OF DATA COLLECTION</h4>
              <p>
                We collect this information strictly for the purpose of communicating with you regarding your financing inquiry. Your contact details are used by our representatives to evaluate your request, provide financing options, and follow up regarding the specific second-hand big bike you are interested in. <strong>We do not sell, rent, or share your personal data with third-party marketers or brokers.</strong>
              </p>

              <h4 className="moto-heading text-white mt-5 mb-3" style={{ fontSize: '1.2rem' }}>3. STORAGE AND SECURITY</h4>
              <p>
                To maximize your privacy, Katingin Bikes operates with a minimal data footprint architecture:
              </p>
              <ul>
                <li><strong>No Database Storage:</strong> Your financing inquiry details are <em>never</em> saved or stored in our application's database.</li>
                <li><strong>Direct Email Transmission:</strong> Upon form submission, your details are instantly packaged and transmitted directly to our secure, internal email system.</li>
                <li><strong>Encryption in Transit:</strong> Our website utilizes HTTPS/SSL encryption, ensuring your data is fully encrypted while traveling from your browser to our server.</li>
              </ul>

              <h4 className="moto-heading text-white mt-5 mb-3" style={{ fontSize: '1.2rem' }}>4. DATA RETENTION</h4>
              <p>
                Because your data is only transmitted via email and never stored in a central database, the retention period is tied solely to our internal email inbox lifecycle. We retain these email records for a maximum of 6 months after your inquiry has been resolved or closed, after which the emails are securely deleted from our servers.
              </p>

              <h4 className="moto-heading text-white mt-5 mb-3" style={{ fontSize: '1.2rem' }}>5. YOUR RIGHTS (RIGHT TO ERASURE)</h4>
              <p>
                Under the Data Privacy Act, you have the right to access, update, or request the deletion of your personal data ("Right to be Forgotten"). While we do not store your data in a database, we are happy to purge any email records containing your inquiry details upon request.
              </p>

              <div className="mt-5 p-4 rounded" style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', borderLeft: '4px solid var(--accent-primary)' }}>
                <h5 className="text-white mb-2" style={{ fontSize: '1.1rem' }}>Contacting Us Regarding Privacy</h5>
                <p className="mb-0 text-secondary" style={{ fontSize: '0.95rem' }}>
                  If you wish to exercise your data subject rights, request a data deletion, or have any questions about this Privacy Policy, please contact our Data Protection Officer at:<br/><br/>
                  <strong className="text-accent">Email:</strong> katingin.bikes@gmail.com<br/>
                  <strong className="text-accent">Phone:</strong> 09435509357
                </p>
              </div>

            </div>
          </div>
        </Reveal>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;
