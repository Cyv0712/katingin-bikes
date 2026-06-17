# Production Mirroring & Migration Guide 🚀
This guide outlines the recent high-performance, security, SEO, and structural updates implemented in **Katingin Bikes**. Use this list to mirror these changes in the clone site (**Jett Lau Done Deal**).

---

## 📦 1. Frontend Bundler Code Splitting (Vite)
* **Goal:** Reduce main bundle size, improve LCP/FCP, and enable modular browser caching.
* **File to modify/create:** `frontend/vite.config.js`
* **Changes:** Configure `manualChunks` in the Rollup build options:
  ```javascript
  export default defineConfig({
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('gsap')) return 'vendor-gsap';
              if (id.includes('react-bootstrap') || id.includes('bootstrap')) return 'vendor-bootstrap';
              if (id.includes('lucide-react')) return 'vendor-lucide';
              if (id.includes('react-icons')) return 'vendor-icons';
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) return 'vendor-react';
              return 'vendor-others';
            }
          }
        }
      }
    }
  })
  ```

---

## 🚦 2. React Dynamic Routing & Error Boundaries
* **Goal:** Load pages dynamically on-demand and prevent blank screens on network failures.
* **Files to create/modify:**
  * **`frontend/src/components/ErrorBoundary.jsx` [NEW]:** Standard class component to catch chunk-loading failures and show a themed reconnect banner with a retry trigger (`window.location.reload()`).
  * **`frontend/src/pages/NotFound.jsx` [NEW]:** Custom gold/dark themed 404 page.
  * **`frontend/src/App.jsx`:**
    * Convert static route imports to lazy loads:
      `const Home = lazy(() => import('./pages/Home'));`
    * Wrap `<Suspense>` inside the `<ErrorBoundary>` component.
    * Add a catch-all route at the bottom of `<Routes>`:
      `<Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />`

---

## ⚡ 3. Asset & CSS Optimization
* **Goal:** Maximize paint performance and meet accessibility guidelines.
* **Hero Image Load:**
  * In `frontend/index.html`, add a high-priority preload tag:
    `<link rel="preload" as="image" href="HERO_IMAGE_URL" fetchpriority="high" />`
  * In `frontend/src/components/SplashScreen.jsx`, add `fetchPriority="high"` to the rendered hero `<img>` tag and set `preload.fetchPriority = 'high';` in the `useEffect` preloading logic.
* **Tagline Lag Fix:**
  * Avoid animating CSS properties like `letter-spacing` in GSAP.
  * Define static spacing in `index.css`:
    ```css
    .splash-tagline {
      letter-spacing: 4px;
      will-change: transform, opacity;
    }
    ```
  * Only animate `opacity` and `y` (translateY) in the GSAP tagline timeline.
* **A11y (Accessibility) Contrast Checks:**
  * Ensure text color contrast ratio is greater than 4.5:1. 
  * Update `--text-muted` or secondary classes in `index.css` to a brighter shade.
  * Add descriptive `aria-label` tags to navbar buttons and social media icons in the footer.
* **Media Compression:**
  * Switch raw images to compressed WebP formats (`.webp`).
  * Add `loading="lazy"` to secondary/below-the-fold images (showroom lists, buyer avatars).

---

## 🧹 4. GSAP Memory Leak Prevention
* **Goal:** Ensure animations unmount cleanly without holding references.
* **File to modify:** `frontend/src/components/SplashScreen.jsx`
* **Changes:** Wrap splash timeline initializations within `gsap.context()` and return its `revert()` cleanup callback in `useEffect`:
  ```javascript
  useEffect(() => {
    const ctx = gsap.context(() => {
      // timeline animations here
    }, containerRef);

    return () => ctx.revert(); // clean up memory leaks
  }, []);
  ```

---

## 🛡️ 5. Admin Security & Token Expirations
* **Goal:** Terminate expired user sessions gracefully.
* **File to modify:** `frontend/src/pages/Admin.jsx`
* **Changes:** 
  * Add a helper to clear tokens and storage:
    ```javascript
    const handleUnauthorized = () => {
      sessionStorage.removeItem('adminAuth');
      sessionStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      alert('Session expired. Please log in again.');
    };
    ```
  * Intercept API request responses. If the server returns a `401 Unauthorized` status on POST/PATCH/DELETE calls, trigger `handleUnauthorized()`.

---

## 📈 6. SEO Search Crawl Indexing
* **Goal:** Direct search engines to index legitimate public routes.
* **Files to create (in `frontend/public/`):**
  * **`robots.txt`:** Allow indexation of `/`, `/inventory`, etc. Disallow `/admin` routes.
  * **`sitemap.xml`:** Map key navigation endpoints with priority weighting.

---

## 🖼️ 7. Image Optimization Proxy & On-Demand Caching
* **Goal:** Use Cloudinary purely for file storage (0 dynamic transformation credits), minimize bandwidth, and achieve instant page loads without a first-load cold start.
* **Files to modify/create:**
  * **`backend/server.js`:**
    * Add global DNS resolution preference at the very top to prevent Happy Eyeballs IPv6 timeout bugs in cloud containers (like Render):
      ```javascript
      const dns = require('dns');
      dns.setDefaultResultOrder('ipv4first');
      ```
    * **Trigger Cache Warmer:** Trigger the cache warmer service in the MongoDB connection success callback, wrapping it in a `setTimeout` of 30 seconds to prevent CPU/memory spikes during early port-binding/health-check phases:
      ```javascript
      mongoose.connect(MONGO_URI).then(() => {
        console.log('Connected to MongoDB');
        setTimeout(() => {
          const { warmImageCache } = require('./utils/cacheWarmer');
          warmImageCache().catch(err => console.error('[Startup] Cache warmer error:', err));
        }, 30000);
      });
      ```
  * **`backend/utils/download.js` [NEW]:**
    * Downloader utility using Node's native `https` module to download images. This respects the custom DNS setting and avoids the Undici IPv6 timeout bug.
  * **`backend/utils/cacheWarmer.js` [NEW/OPTIONAL]:**
    * Background script that queries the database for active listing images on startup, limits the query to the **15 most recent listings** to avoid CPU choking, checks if they exist in `backend/cache/`, disables `sharp`'s internal memory cache (`sharp.cache(false)`), and optimizes any missing ones to WebP sequentially with a **1500ms throttle delay** to ensure memory usage stays well under 150MB.
  * **`backend/utils/imageStorage.js`:**
    * Import `sharp` and create an `optimizeImageBuffer(buffer)` helper (max dimensions 1200x1200px, WebP format, quality 80).
    * Optimize buffer in-memory inside `uploadBufferToCloudinary` and `writeBufferToDisk` before writing.
    * Accept a `bikeName` parameter in `persistUploadedImages(files, bikeName)` and `uploadBufferToCloudinary(file, bikeName)` to print contextual logs (e.g. `Upload Success for [BMW R 1250 GS]`).
    * Catch Cloudinary error messages using `err.error?.message || err.message` to prevent logging `undefined`.
  * **`backend/routes/bikes.js`:**
    * Set up a `/image-proxy` GET endpoint.
    * Checks if the requested Cloudinary URL exists as an optimized `.webp` file inside `backend/cache/` (using an MD5 hash of the URL as filename).
    * If cached, streams it instantly using `res.sendFile()`.
    * If not cached, downloads it once using the `downloadImage` helper, optimizes it, caches it to disk, and serves it.
    * Sets cache headers: `Cache-Control: public, max-age=31536000, immutable`.
  * **`frontend/src/config/api.js`:**
    * Update `toAbsoluteUploadUrl(path)` to detect `res.cloudinary.com` URLs, strip out any legacy transformation segments (e.g. `/f_auto,q_auto/`), and return the proxied URL:
      ```javascript
      return apiUrl(`/api/bikes/image-proxy?url=${encodeURIComponent(cleanPath)}`);
      ```

---

## ✉️ 8. Resend Email Integration (Bypassing Render SMTP Block)
* **Goal:** Send inquiry emails from Render's free tier, which blocks all outbound SMTP ports (25, 465, 587).
* **Files to modify:**
  * **`backend/routes/inquiries.js`:**
    * Remove `nodemailer` import and SMTP transport setup.
    * Fetch Resend credentials from environment variables (`RESEND_API_KEY`, `INQUIRY_RECEIVER_EMAIL`, `RESEND_SENDER_EMAIL`).
    * Send the HTML email via a native `fetch()` POST request to Resend's HTTP API: `https://api.resend.com/emails` (operating over unblocked port 443).
  * **`backend/.env`:**
    * Add variables:
      ```env
      RESEND_API_KEY=re_your_api_key
      RESEND_SENDER_EMAIL=onboarding@resend.dev (or verified domain address)
      INQUIRY_RECEIVER_EMAIL=your_signup_email@gmail.com
      ```

---

## 🛠️ 9. Advanced Admin Operations (Edit, Sold, & Delete)
* **Goal:** Provide secure, full-lifecycle operations on inventory listings, ensuring automatic cleanup of media files on disk and Cloudinary to safeguard storage capacity and bandwidth limits.
* **Files to modify/create:**
  * **`backend/routes/bikes.js`:**
    * **`POST /` (Create Route):** To prevent orphaned uploads on Cloudinary if database validation fails, instantiate and save the `Bike` document with an empty images array first. If validation/saving succeeds, proceed to upload images. Update the document with image URLs. If uploading fails, delete the newly created database listing (rollback):
      ```javascript
      // 1. Save document first with empty images to trigger validation
      const bike = new Bike({ ...bikeData, images: [] });
      await bike.save();

      // 2. Only proceed to upload images if database validation succeeds
      if (req.files?.length) {
        try {
          const uploadedImages = await persistUploadedImages(req.files, bikeName);
          bike.images = uploadedImages;
          await bike.save();
        } catch (uploadErr) {
          await Bike.findByIdAndDelete(bike._id); // rollback
          throw uploadErr;
        }
      }
      ```
    * **`PUT /:id` (Edit Route):** Checks if the listing exists. Update and save specifications first (validating fields) keeping original images intact. If it succeeds, upload the new files. Overwrite the image array, save, and then delete the old images from Cloudinary:
      ```javascript
      // 1. Update specs and validate first, keeping original images
      existing.set({ ...bikeData, images: originalImages });
      await existing.save();

      // 2. Handle image replacements
      if (req.files?.length) {
        try {
          const uploadedImages = await persistUploadedImages(req.files, bikeName);
          existing.images = uploadedImages;
          await existing.save();
          await deleteBikeImages(originalImages); // safely delete old images AFTER new save
        } catch (uploadErr) {
          throw uploadErr;
        }
      } else if (req.body.existingImages) {
        const imagesArray = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
        existing.images = imagesArray;
        await existing.save();
      }
      ```
    * **`PATCH /:id/sold` (Sold Route):** To keep the database lightweight and comply with storage limits, mark the status as `'Sold'`, delete all associated listing images, and unset all detailed specification fields using MongoDB's `$unset` operator:
      ```javascript
      await deleteBikeImages(bike.images);
      const updatedBike = await Bike.findByIdAndUpdate(
        req.params.id,
        {
          $set: { status: 'Sold' },
          $unset: {
            edition: 1, type: 1, year: 1, mileage: 1, description: 1, issues: 1,
            engineSize: 1, engineConfig: 1, power: 1, transmission: 1, fuelCapacity: 1, images: 1
          }
        },
        { new: true }
      );
      ```
    * **`DELETE /:id` (Delete Route):** Delete all uploaded image files in storage and remove the listing document from the database.
  * **`frontend/src/pages/Admin.jsx`:**
    * **Combined Identity Parser:** Instead of filling brand, model, and engine size in separate inputs, parse them on submission from a single `combinedIdentity` string (e.g. `KAWASAKI Z 1000 1000cc`):
      * Brand: First word.
      * Engine Size: Numeric word or word ending in "cc" (converted to upper case `CC` and formatted as `X cc`).
      * Model: Remaining words joined together.
    * **Input Safeguards:** Validate on input change. If numeric fields (`year`, `mileage`, `price`) are less than `0`, reject. Limit text fields (excluding description) to a maximum of 50 characters.
    * **Thumbnail Manager:** Display preview cards of uploaded files (or current images). Clicking any card moves it to index `0` of the array to designate it as the primary thumbnail.
    * **Confirmation Modals:** Wrap delete and sold actions inside secure React-Bootstrap `<Modal>` prompts.

---

## 📋 10. Financing Inquiry System & Privacy-Compliant Emails
* **Goal:** Collect user applications for financing options and dispatch them to one or more admin email addresses without storing sensitive user details in the database to satisfy the Data Privacy Act.
* **Files to modify/create:**
  * **`frontend/src/pages/Financing.jsx` [NEW]:** Create the financing page. *Note: Be sure to change the page titles, description tags, privacy links, and brand names (e.g. from "Katingin Bikes" to "Jett Lau Done Deal") to match your site's identity:*
    ```javascript
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
            <title>Financing Inquiries | Katingin Bikes</title>
            <meta name="description" content="Inquire about financing options for your dream big bike. Submit your application details online." />
            <meta property="og:title" content="Financing Inquiries | Katingin Bikes" />
            <meta property="og:description" content="Get pre-approved for big bike financing with clean papers and verified inspection." />
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
                                      I agree to the <Link to="/privacy-policy" className="text-accent text-decoration-none">Privacy Policy</Link> and consent to processing my contact details to handle my inquiry. <span className="text-accent">*</span>
                                    </span>
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col md={12} className="text-end mt-4">
                              <button
                                type="submit"
                                className="moto-btn w-100 py-3"
                                disabled={isSubmitting || loadingBikes || availableBikes.length === 0 || !consentChecked}
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
    ```
  * **`backend/routes/inquiries.js` [NEW]:**
    * **Multi-Recipient Email Support:** Parse a comma-separated list of recipient emails from environment variables:
      ```javascript
      const recipients = receiverEmail.split(',').map(email => email.trim()).filter(Boolean);
      ```
    * **Input Escaper:** Escape incoming strings to prevent HTML injection inside email layouts:
      ```javascript
      const escapeHtml = (unsafe) => unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      ```
    * **Zero-Persistence Routing:** Do not write submission data to MongoDB. Only validate, sanitize, build the HTML email template, and transmit it via a POST fetch to Resend's API.

---

## 📲 11. Device-Aware Deep Links & App Detection Fallbacks
* **Goal:** Provide immediate, device-tailored contact channels that open native apps on mobile and fallback gracefully on desktop.
* **Files to modify/create:**
  * **`frontend/src/pages/Contact.jsx`:**
    * **Gmail Redirect:** Detect mobile users. On mobile, fire a standard `mailto:` link. On desktop, bypass external mail clients and redirect to the web-based Gmail composer in a new tab:
      ```javascript
      const emailLink = isMobile
        ? `mailto:${contactInfo.email}`
        : `https://mail.google.com/mail/?view=cm&fs=1&to=${contactInfo.email}`;
      ```
    * **Viber Detection Fallback:** On mobile and desktop, trigger deep link schema `viber://chat/?number=...`. Open the link inside a new window (`about:blank`) first. If the page is still loading the app protocol after 2-seconds (meaning Viber is not installed), redirect the user to the official Viber installer page:
      ```javascript
      const handleViberClick = (e) => {
        e.preventDefault();
        const newTab = window.open('about:blank', '_blank');
        if (!newTab) return;
        newTab.location.href = viberLink;
        setTimeout(() => {
          try {
            if (!newTab.closed && (newTab.location.href === 'about:blank' || newTab.location.href.startsWith('viber://'))) {
              newTab.location.href = 'https://www.viber.com/en/download/';
            }
          } catch (err) {}
        }, 2000);
      };
      ```

---

## 🎭 12. Session-Aware Splash Screen & Scroll Control
* **Goal:** Render a cinematic entry animation on first landing while preventing unnecessary load lag on standard refreshes and cleaning up animation references to prevent memory leaks.
* **Files to modify/create:**
  * **`frontend/src/App.jsx`:**
    * **Bypass State Check:** Initialize the splash display state using a function that reads `sessionStorage` to verify if the user has already loaded the site in their current tab session:
      ```javascript
      const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('hasSeenSplash'));
      ```
    * **Scroll Lock:** Lock body scrolling while the splash is playing:
      ```javascript
      useEffect(() => {
        document.body.style.overflow = showSplash ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
      }, [showSplash]);
      ```
    * **Session Registry:** Set `sessionStorage.setItem('hasSeenSplash', 'true')` when the splash triggers its completion callback.
  * **`frontend/src/components/SplashScreen.jsx`:**
    * **Memory Leak Cleanup:** Wrap GSAP animations inside `gsap.context()` and return its `revert()` cleanup command in the unmount callback:
      ```javascript
      useEffect(() => {
        const ctx = gsap.context(() => {
          // GSAP timeline sequences
        }, containerRef);
        return () => ctx.revert();
      }, [onComplete]);
      ```

---

## 🚦 13. Eased Global Rate Limiting
* **Goal:** Increase the global request threshold to prevent concurrent image proxy requests from triggering false-positive "429 Too Many Requests" blocks for active visitors.
* **File to modify/create:** `backend/middleware/rateLimiter.js`
* **Changes:** Set the `max` requests limit of the `globalLimiter` from `100` to `1500` per 15-minute window:
  ```javascript
  const rateLimit = require('express-rate-limit');

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1500, // eased to handle bulk dynamic asset/image proxy loading
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many requests from this IP, please try again after 15 minutes'
    }
  });
  ```



