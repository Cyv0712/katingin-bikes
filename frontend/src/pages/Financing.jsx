import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Row, Col, Form, Spinner } from 'react-bootstrap';
import { FileText, CheckCircle, ArrowRight, Info } from 'lucide-react';
import { apiUrl } from '../config/api';
import { Helmet } from 'react-helmet-async';
import useBikes from '../hooks/useBikes';

const getBikeName = (bike) => `${bike.brand} ${bike.model} ${bike.engineSize || ''}`.trim();

const Financing = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const bikeNameParam = queryParams.get('bikeName') || '';
  const bikeIdParam = queryParams.get('bikeId') || '';

  const { bikes, loading: loadingBikes } = useBikes();
  // Units that can still take an inquiry
  const availableBikes = bikes.filter((b) => !b.isReserved);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    unitInterested: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  // Until the visitor picks a unit: the one they came from (?bikeId=, or ?bikeName= for old
  // links), else the first available. formData.unitInterested holds the picked bike's _id.
  const defaultBikeId = (
    availableBikes.find((b) => b._id === bikeIdParam) ||
    availableBikes.find((b) => getBikeName(b) === bikeNameParam) ||
    availableBikes[0]
  )?._id || '';
  const selectedBikeId = formData.unitInterested || defaultBikeId;
  const selectedBike = availableBikes.find((b) => b._id === selectedBikeId);
  const selectedUnit = selectedBike ? getBikeName(selectedBike) : '';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contactNumber' && value.length > 20) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentChecked) {
      setErrorMsg('You must agree to the Privacy Policy and check the consent box before submitting your application.');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(apiUrl('/api/inquiries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, unitInterested: selectedUnit, bikeId: selectedBikeId })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to submit inquiry.');
      }

      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        contactNumber: '',
        unitInterested: '',
        message: ''
      });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong. Please check your network connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const required = <span className="text-accent" aria-hidden="true"> *</span>;

  return (
    <div className="financing-page">
      <Helmet>
        <title>Big Bike & Motorcycle Financing Philippines | Katingin Bikes</title>
        <meta name="description" content="Apply for motorcycle financing and installment options in the Philippines. Easy pre-approval for pre-owned big bikes with low downpayment terms." />
        <meta name="keywords" content="Motorcycle Financing Philippines, Big Bike Installment Philippines, Used Motorcycle Financing Metro Manila" />
        <link rel="canonical" href="https://katinginbikes.com/financing" />
        <meta property="og:title" content="Big Bike & Motorcycle Financing Philippines | Katingin Bikes" />
        <meta property="og:description" content="Get pre-approved for pre-owned big bike financing in the Philippines. Flexible downpayment and monthly installment plans." />
        <meta property="og:url" content="https://katinginbikes.com/financing" />
      </Helmet>

      <header className="container kb-page-head">
        <h1 className="kb-display-lg kb-page-title">Financing inquiry</h1>
      </header>

      <section className="container pt-3" style={{ maxWidth: '864px' }}>
        {submitSuccess ? (
          <div className="moto-card p-5 text-center">
            <div
              className="kb-badge-success mb-4 d-inline-flex align-items-center justify-content-center rounded-circle"
              style={{ width: '64px', height: '64px' }}
            >
              <CheckCircle size={36} strokeWidth={1.75} aria-hidden="true" />
            </div>
            <h2 className="kb-h2 mb-3">Application submitted</h2>
            <p className="kb-body-lg mx-auto mb-5" style={{ maxWidth: '500px' }}>
              Thank you for applying. We have received your financing inquiry details. A representative will review your request and get in touch with you shortly.
            </p>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Link to="/inventory" className="moto-btn">
                Back to catalog <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
              </Link>
              <button type="button" onClick={() => setSubmitSuccess(false)} className="moto-btn moto-btn-outline">
                Submit another request
              </button>
            </div>
          </div>
        ) : (
          <div className="moto-card kb-form-panel">
            <h2 className="kb-h3 mb-3 d-flex align-items-center gap-2">
              <FileText className="text-accent" size={26} strokeWidth={1.75} aria-hidden="true" /> Financing details form
            </h2>
            <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>
              Please supply clean, verified contact information. We will use these details to contact you directly regarding your financing options.
            </p>
            <div className="kb-notice mb-4">
              <Info size={20} strokeWidth={1.75} aria-hidden="true" />
              <span><strong>Privacy notice:</strong> We collect your name, email, and phone number solely to respond to your motorcycle inquiry. We do not sell, share, or use your data for unsolicited marketing.</span>
            </div>

            {errorMsg && (
              <div className="kb-notice kb-notice-danger mb-4" role="alert">
                <Info size={20} strokeWidth={1.75} aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              <Row className="g-4">
                <Col md={12}>
                  <Form.Group controlId="financing-name" className="kb-field">
                    <Form.Label>Applicant full name{required}</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="e.g. John Doe"
                      className="moto-input"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="financing-email" className="kb-field">
                    <Form.Label>Email address{required}</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="e.g. johndoe@gmail.com"
                      className="moto-input"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="financing-phone" className="kb-field">
                    <Form.Label>Contact / mobile number{required}</Form.Label>
                    <Form.Control
                      type="text"
                      inputMode="tel"
                      name="contactNumber"
                      placeholder="e.g. 09171234567"
                      className="moto-input"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group controlId="financing-unit" className="kb-field">
                    <Form.Label>Motorcycle unit of interest{required}</Form.Label>
                    {loadingBikes ? (
                      <div className="d-flex align-items-center gap-2" style={{ minHeight: '48px' }}>
                        <Spinner animation="border" size="sm" variant="accent" />
                        <span style={{ color: 'var(--ink-subtle)' }}>Loading available units...</span>
                      </div>
                    ) : (
                      <Form.Select
                        name="unitInterested"
                        className="moto-input"
                        value={selectedBikeId}
                        onChange={handleInputChange}
                        required
                      >
                        {availableBikes.length === 0 ? (
                          <option value="">No available units in inventory</option>
                        ) : (
                          availableBikes.map((bike) => {
                            const fullName = getBikeName(bike);
                            return (
                              <option key={bike._id} value={bike._id}>
                                {fullName} (₱{parseFloat(String(bike.price).replace(/[^0-9.]/g, '') || 0).toLocaleString()})
                              </option>
                            );
                          })
                        )}
                      </Form.Select>
                    )}
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group controlId="financing-message" className="kb-field">
                    <Form.Label>Message / downpayment options <span style={{ color: 'var(--ink-subtle)', fontWeight: 400 }}>(optional)</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      name="message"
                      rows={4}
                      placeholder="Describe your preferred financing terms (e.g. 30% downpayment, 36 months term)..."
                      className="moto-input"
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={12} className="mt-4">
                  <Form.Check
                    type="checkbox"
                    id="privacy-consent"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    label={
                      <span className="kb-body-sm" style={{ color: 'var(--ink-muted)' }}>
                        I agree to the <Link to="/privacy-policy" className="kb-link" style={{ minHeight: 0 }}>Privacy Policy</Link> and consent to Katingin Bikes processing my contact details to handle my <span style={{ whiteSpace: 'nowrap' }}>inquiry.{required}</span>
                      </span>
                    }
                  />
                </Col>

                <Col md={12} className="mt-4">
                  <button
                    type="submit"
                    className="moto-btn moto-btn-lg moto-btn-block"
                    disabled={isSubmitting || loadingBikes || availableBikes.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner animation="border" size="sm" /> Submitting application...
                      </>
                    ) : (
                      'Submit financing application'
                    )}
                  </button>
                </Col>
              </Row>
            </Form>
          </div>
        )}
      </section>
    </div>
  );
};

export default Financing;
