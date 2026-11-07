import { Helmet } from 'react-helmet-async';
import { contactInfo } from '../data/contactInfo';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page">
      <Helmet>
        <title>Privacy Policy | Katingin Bikes</title>
        <meta name="description" content="Privacy Policy for Katingin Bikes. Learn how we collect, use, and protect your data." />
      </Helmet>

      <div className="container" style={{ maxWidth: '864px' }}>
        <header className="kb-page-head">
          <span className="kb-caption d-block mb-2">Data Privacy Act compliance</span>
          <h1 className="kb-display-lg kb-page-title">Privacy policy</h1>
        </header>

        <div className="privacy-content" style={{ lineHeight: 1.8, color: 'var(--ink-muted)' }}>
          <p>
            At Katingin Bikes, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your personal information in compliance with data privacy regulations. By submitting an inquiry through our platform, you agree to the terms outlined below.
          </p>

          <h2 className="kb-h3 mt-5 mb-3">1. What information we collect</h2>
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

          <h2 className="kb-h3 mt-5 mb-3">2. The purpose of data collection</h2>
          <p>
            We collect this information strictly for the purpose of communicating with you regarding your financing inquiry. Your contact details are used by our representatives to evaluate your request, provide financing options, and follow up regarding the specific pre-owned big bike you are interested in. <strong>We do not sell, rent, or share your personal data with third-party marketers or brokers.</strong>
          </p>

          <h2 className="kb-h3 mt-5 mb-3">3. Storage and security</h2>
          <p>
            To maximize your privacy, Katingin Bikes operates with a minimal data footprint architecture:
          </p>
          <ul>
            <li><strong>No Database Storage:</strong> Your financing inquiry details are <em>never</em> saved or stored in our application&apos;s database.</li>
            <li><strong>Direct Email Transmission:</strong> Upon form submission, your details are instantly packaged and transmitted directly to our secure, internal email system.</li>
            <li><strong>Encryption in Transit:</strong> Our website utilizes HTTPS/SSL encryption, ensuring your data is fully encrypted while traveling from your browser to our server.</li>
          </ul>

          <h2 className="kb-h3 mt-5 mb-3">4. Data retention</h2>
          <p>
            Because your data is only transmitted via email and never stored in a central database, the retention period is tied solely to our internal email inbox lifecycle. We retain these email records for a maximum of 6 months after your inquiry has been resolved or closed, after which the emails are securely deleted from our servers.
          </p>

          <h2 className="kb-h3 mt-5 mb-3">5. Your rights (right to erasure)</h2>
          <p>
            Under the Data Privacy Act, you have the right to access, update, or request the deletion of your personal data (&quot;Right to be Forgotten&quot;). While we do not store your data in a database, we are happy to purge any email records containing your inquiry details upon request.
          </p>

          <div className="kb-notice mt-5" style={{ padding: '20px 24px', fontSize: '16px', lineHeight: 1.6 }}>
            <div>
              <h3 className="kb-h4 mb-2">Contacting us regarding privacy</h3>
              <p className="mb-0" style={{ color: 'var(--ink-muted)' }}>
                If you wish to exercise your data subject rights, request a data deletion, or have any questions about this Privacy Policy, please contact our Data Protection Officer at:<br /><br />
                <strong>Email:</strong> {contactInfo.email}<br />
                <strong>Phone:</strong> {contactInfo.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
