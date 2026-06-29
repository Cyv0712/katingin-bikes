import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import { FileText, CheckCircle, ArrowRight, Info } from 'lucide-react';
import { apiUrl } from '../config/api';
import Reveal from '../components/Reveal';
import { Helmet } from 'react-helmet-async';

const Financing = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const bikeNameParam = queryParams.get('bikeName') || '';

  const [availableBikes, setAvailableBikes] = useState([]);
  const [loadingBikes, setLoadingBikes] = useState(true);
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

  // Fetch active inventory
  useEffect(() => {
    fetch(apiUrl('/api/bikes'))
      .then((res) => res.json())
      .then((data) => {
        // Only active/available bikes
        const activeList = data.filter(b => b.status === 'Available');
        setAvailableBikes(activeList);
        
        // Setup initial pre-selected bike if provided in URL, else default to empty
        if (bikeNameParam) {
          setFormData(prev => ({ ...prev, unitInterested: bikeNameParam }));
        } else if (activeList.length > 0) {
          // Preselect the first bike in the list by default
          const firstBikeName = `${activeList[0].brand} ${activeList[0].model} ${activeList[0].engineSize || ''}`.trim();
          setFormData(prev => ({ ...prev, unitInterested: firstBikeName }));
        }
        setLoadingBikes(false);
      })
      .catch((err) => {
        console.error('Failed to load bikes list:', err);
        setLoadingBikes(false);
      });
  }, [bikeNameParam]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Contact number character limits and patterns validation
    if (name === 'contactNumber' && value.length > 20) {
      return; // Cap contact numbers at 20 characters
    }

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
        body: JSON.stringify(formData)
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

  return (
    <div className="financing-page pb-5" style={{ backgroundColor: 'var(--bg-void)', minHeight: '100vh', paddingTop: '76px' }}>
      <Helmet>
        <title>Bigbike Financing & Installment Options | Katingin Bikes</title>
        <meta name="description" content="Get pre-approved for second hand bigbike financing in the Philippines. Submit your installment application online for flexible payment terms." />
        <meta property="og:title" content="Bigbike Financing & Installment Options | Katingin Bikes" />
        <meta property="og:description" content="Get pre-approved for bigbike financing and installment options in Manila with easy downpayment options." />
        <meta property="og:url" content="https://katinginbikes.com/financing" />
      </Helmet>

      {/* Hero Section */}
      <section className="position-relative d-flex align-items-center justify-content-center text-center py-5">
        <Container>
          <Reveal>
            <span className="text-accent mb-2 d-block" style={{ letterSpacing: '4px', textTransform: 'uppercase', fontWeight: '700', fontSize: '0.85rem' }}>
              ACQUISITION DEFERRALS
            </span>
            <h1 className="moto-heading mb-0" style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}>FINANCING INQUIRY</h1>
          </Reveal>
        </Container>
      </section>

      <section className="py-4">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} md={10}>
              <Reveal delay={1}>
                {submitSuccess ? (
                  // Success State Card
                  <div className="moto-card p-5 text-center my-4">
                    <div className="mb-4 d-inline-flex align-items-center justify-content-center bg-muted rounded-circle" style={{ color: 'var(--accent-primary)', width: '70px', height: '70px' }}>
                      <CheckCircle size={40} />
                    </div>
                    <h2 className="moto-heading mb-3" style={{ fontSize: '1.8rem' }}>APPLICATION SUBMITTED</h2>
                    <p className="text-secondary mb-5 mx-auto" style={{ maxWidth: '500px', fontSize: '1rem', lineHeight: '1.7' }}>
                      Thank you for applying. We have received your financing inquiry details. A representative will review your request and get in touch with you shortly.
                    </p>
                    <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                      <Link to="/inventory" className="moto-btn py-3 px-4 text-decoration-none">
                        BACK TO CATALOG <ArrowRight size={16} className="ms-2" />
                      </Link>
                      <button onClick={() => setSubmitSuccess(false)} className="moto-btn-outline py-3 px-4">
                        SUBMIT ANOTHER REQUEST
                      </button>
                    </div>
                  </div>
                ) : (
                  // Form State Card
                  <div className="moto-card p-4 p-md-5 my-4">
                    <h3 className="moto-heading mb-4 d-flex align-items-center gap-2" style={{ fontSize: '1.3rem' }}>
                      <FileText className="text-accent" size={24} /> FINANCING DETAILS FORM
                    </h3>
                    <p className="text-secondary mb-4" style={{ fontSize: '0.95rem' }}>
                      Please supply clean, verified contact and identity information. We will use these details to contact you directly regarding your financing options.
                    </p>
                    <p className="mb-4" style={{ fontSize: '0.85rem', color: '#888', borderLeft: '3px solid var(--accent-primary)', paddingLeft: '12px', fontStyle: 'italic' }}>
                      <strong>Privacy Notice:</strong> We collect your name, email, and phone number solely to respond to your motorcycle inquiry. We do not sell, share, or use your data for unsolicited marketing.
                    </p>

                    {errorMsg && (
                      <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'rgba(220, 53, 69, 0.08)', border: '1px solid rgba(220, 53, 69, 0.2)', color: '#f87171', fontSize: '0.9rem' }}>
                        <Info size={16} className="me-2 d-inline-block align-text-bottom" /> {errorMsg}
                      </div>
                    )}

                    <Form onSubmit={handleSubmit}>
                      <Row className="g-4">
                        <Col md={12}>
                          <Form.Group>
                            <label className="text-white opacity-75 fw-bold d-block mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                              Applicant Full Name <span className="text-accent">*</span>
                            </label>
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
                          <Form.Group>
                            <label className="text-white opacity-75 fw-bold d-block mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                              Email Address <span className="text-accent">*</span>
                            </label>
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
                          <Form.Group>
                            <label className="text-white opacity-75 fw-bold d-block mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                              Contact / Mobile Number <span className="text-accent">*</span>
                            </label>
                            <Form.Control
                              type="text"
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
                          <Form.Group>
                            <label className="text-white opacity-75 fw-bold d-block mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                              Motorcycle Unit of Interest <span className="text-accent">*</span>
                            </label>
                            
                            {loadingBikes ? (
                              <div className="d-flex align-items-center gap-2 p-2 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Spinner animation="border" size="sm" variant="accent" />
                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Loading active units inventory...</span>
                              </div>
                            ) : (
                              <Form.Select
                                name="unitInterested"
                                className="moto-input text-white"
                                value={formData.unitInterested}
                                onChange={handleInputChange}
                                required
                              >
                                {availableBikes.length === 0 ? (
                                  <option value="">No available units in inventory</option>
                                ) : (
                                  availableBikes.map((bike) => {
                                    const fullName = `${bike.brand} ${bike.model} ${bike.engineSize || ''}`.trim();
                                    return (
                                      <option key={bike._id} value={fullName} className="bg-dark text-white">
                                        {fullName} (₱{parseFloat(bike.price.replace(/[^0-9.]/g, '') || 0).toLocaleString()})
                                      </option>
                                    );
                                  })
                                )}
                              </Form.Select>
                            )}
                          </Form.Group>
                        </Col>

                        <Col md={12}>
                          <Form.Group>
                            <label className="text-white opacity-75 fw-bold d-block mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                              Message / Downpayment Options <span className="text-muted">(Optional)</span>
                            </label>
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
                          <Form.Group>
                            <Form.Check 
                              type="checkbox"
                              id="privacy-consent"
                              checked={consentChecked}
                              onChange={(e) => setConsentChecked(e.target.checked)}
                              label={
                                <span style={{ fontSize: '0.85rem', color: '#ccc' }}>
                                  I agree to the <Link to="/privacy-policy" className="text-accent text-decoration-none">Privacy Policy</Link> and consent to Katingin Bikes processing my contact details to handle my inquiry. <span className="text-accent">*</span>
                                </span>
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col md={12} className="text-end mt-4">
                          <button
                            type="submit"
                            className="moto-btn w-100 py-3"
                            disabled={isSubmitting || loadingBikes || availableBikes.length === 0}
                          >
                            {isSubmitting ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" /> SUBMITTING APPLICATION...
                              </>
                            ) : (
                              'SUBMIT FINANCING APPLICATION'
                            )}
                          </button>
                        </Col>
                      </Row>
                    </Form>
                  </div>
                )}
              </Reveal>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Financing;
