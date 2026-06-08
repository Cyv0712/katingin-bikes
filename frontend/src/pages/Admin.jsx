import { useState, useEffect, useMemo } from 'react';
import { Container, Table, Form, Modal, Row, Col } from 'react-bootstrap';
import { Trash, Plus, Bike, Banknote, TrendingUp, LogOut, Check, Database, Lock, ShieldAlert, Eye, EyeOff, Pencil, Search } from 'lucide-react';
import { apiUrl, toAbsoluteUploadUrl } from '../config/api';

// Parse price strings like "₱450,000" → 450000
const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  return parseFloat(String(priceStr).replace(/[^0-9.]/g, '')) || 0;
};

// Format numbers with commas: 1000 -> 1,000
const formatWithCommas = (val) => {
  if (!val) return '';
  // Remove existing commas and non-digits
  const cleanNum = val.toString().replace(/[^0-9]/g, '');
  if (!cleanNum) return val;
  return Number(cleanNum).toLocaleString();
};

const EMPTY_FORM = {
  combinedIdentity: '', // Format: BRAND MODEL ENGINE_SIZE
  type: '', year: '', mileage: '', price: '',
  description: '', engineConfig: '',
  power: '', transmission: '', fuelCapacity: '',
  brand: '', model: '', engineSize: '' // These will be auto-populated
};

const Admin = () => {
  // Persist auth across hot-reloads using sessionStorage (expires when tab is closed)
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('adminAuth') === 'true'
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [bikes, setBikes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [view, setView] = useState('Available');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [bikeToMarkSold, setBikeToMarkSold] = useState(null);
  const [editingBike, setEditingBike] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const showSuccess = (message) => {
    setSuccessModal({ show: true, message });
    setTimeout(() => {
      setSuccessModal(prev => {
        if (prev.message === message) {
          return { show: false, message: '' };
        }
        return prev;
      });
    }, 2500);
  };

  const fetchBikes = async () => {
    try {
      const res = await fetch(apiUrl('/api/bikes'));
      const data = await res.json();
      setBikes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isAuthenticated) fetchBikes();
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
      } else {
        alert(`ACCESS DENIED: ${data.message || 'Incorrect credentials.'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Login failed. Ensure server is running.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleUnauthorized = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setPassword('');
    alert('Session expired. Please log in again.');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 1. Negative Number Validation
    const numericFields = ['year', 'mileage', 'price', 'power', 'fuelCapacity'];
    if (numericFields.includes(name)) {
      const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
      if (numValue < 0) return; // Prevent negative numbers
    }

    // 2. Character Limit Validation (50 chars for short fields)
    const longFields = ['description'];
    if (!longFields.includes(name) && value.length > 50) {
      return; // Cap at 50 characters
    }

    setFormData({ ...formData, [name]: value });
  };
  const handleFileChange = (e) => setImageFiles(Array.from(e.target.files));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const parts = formData.combinedIdentity.trim().split(/\s+/);
    if (!formData.combinedIdentity.trim() || parts.length < 2) {
      alert("Please enter both the brand and model/engine size (e.g. 'HONDA REBEL' or 'KTM 390').");
      setIsSubmitting(false);
      return;
    }

    let brand = '';
    let model = '';
    let engineSize = '';

    if (parts.length > 0) {
      brand = parts[0];
      
      const modelParts = [];
      let foundEngineSize = false;
      
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        // Checks if the part is numeric (e.g., "1100", "700", or containing "cc" like "1100cc")
        const isNumber = /^\d+(cc)?$/i.test(part);
        
        if (isNumber && !foundEngineSize) {
          engineSize = part;
          foundEngineSize = true;
        } else {
          modelParts.push(part);
        }
      }
      
      model = modelParts.join(' ');

      // Fallback: If no distinct model name word was found, use engineSize as the model
      if (!model && engineSize) {
        model = engineSize;
      }
    }

    const data = new FormData();
    data.append('brand', brand);
    data.append('model', model);
    const cleanEngineSize = engineSize.toUpperCase().replace('CC', '').trim();
    const formattedEngineSize = cleanEngineSize ? `${cleanEngineSize} cc` : '';
    data.append('engineSize', formattedEngineSize);
    
    Object.keys(formData).forEach((key) => {
      if (!['brand', 'model', 'engineSize', 'combinedIdentity'].includes(key)) {
        let value = formData[key];
        if (['price', 'mileage'].includes(key)) {
          value = formatWithCommas(value);
        }
        data.append(key, value);
      }
    });
    
    imageFiles.forEach((file) => data.append('images', file));

    // If editing and no new files were selected, send the updated order of current images
    if (editingBike && imageFiles.length === 0) {
      currentImages.forEach((img) => data.append('existingImages', img));
    }

    try {
      const token = sessionStorage.getItem('adminToken');
      const url = editingBike ? apiUrl(`/api/bikes/${editingBike._id}`) : apiUrl('/api/bikes');
      const method = editingBike ? 'PUT' : 'POST';

      const res = await fetch(url, { 
        method: method, 
        body: data,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      
      setShowModal(false);
      setFormData(EMPTY_FORM);
      setImageFiles([]);
      setEditingBike(null);
      await fetchBikes();
      showSuccess(editingBike ? 'Unit details were successfully updated.' : 'New unit was successfully added to inventory.');
    } catch (err) {
      console.error('Failed to add bike:', err);
      if (err.name !== 'TypeError') {
        alert(`Failed to save: ${err.message}`);
      } else {
        alert('Upload is taking a while. Please refresh the inventory in 1 minute to see if it saved!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (bike) => {
    setEditingBike(bike);
    setCurrentImages(bike.images || []);
    const cleanEngine = bike.engineSize ? bike.engineSize.toLowerCase().replace('cc', '').trim() : '';
    const cleanMileage = bike.mileage ? String(bike.mileage).replace(/[^0-9]/g, '') : '';
    const cleanPrice = bike.price ? String(bike.price).replace(/[^0-9]/g, '') : '';

    setFormData({
      combinedIdentity: `${bike.brand} ${bike.model} ${cleanEngine}`.trim(),
      type: bike.type || '',
      year: bike.year || '',
      mileage: cleanMileage,
      price: cleanPrice,
      description: bike.description || '',
      engineConfig: bike.engineConfig || '',
      power: bike.power || '',
      transmission: bike.transmission || '',
      fuelCapacity: bike.fuelCapacity || '',
      brand: bike.brand || '',
      model: bike.model || '',
      engineSize: bike.engineSize || ''
    });
    setImageFiles([]);
    setShowModal(true);
  };

  const setAsCurrentThumbnail = (index) => {
    if (index === 0) return;
    const newImages = [...currentImages];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    setCurrentImages(newImages);
  };

  const setAsThumbnail = (index) => {
    if (index === 0) return;
    const newFiles = [...imageFiles];
    const [selected] = newFiles.splice(index, 1);
    newFiles.unshift(selected);
    setImageFiles(newFiles);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bikeToDelete, setBikeToDelete] = useState(null);

  const handleDelete = (id) => {
    setBikeToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bikeToDelete) return;
    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await fetch(apiUrl(`/api/bikes/${bikeToDelete}`), { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      setShowDeleteModal(false);
      setBikeToDelete(null);
      await fetchBikes();
      showSuccess('Unit was successfully deleted from inventory.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete the unit. Please try again.');
    }
  };

  const handleMarkAsSold = (id) => {
    setBikeToMarkSold(id);
    setShowSoldModal(true);
  };

  const confirmMarkAsSold = async () => {
    if (!bikeToMarkSold) return;
    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await fetch(apiUrl(`/api/bikes/${bikeToMarkSold}/sold`), { 
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      setShowSoldModal(false);
      setBikeToMarkSold(null);
      await fetchBikes();
      showSuccess('Unit was successfully marked as sold (images and specifications cleared).');
    } catch (err) {
      console.error(err);
      alert('Failed to mark the unit as sold. Please try again.');
    }
  };

  // Analytics — derived from bikes array
  const stats = useMemo(() => {
    const availableBikes = bikes.filter(b => b.status === 'Available');
    const soldBikes = bikes.filter(b => b.status === 'Sold');
    const count = availableBikes.length;
    const totalInventoryValue = availableBikes.reduce((sum, b) => sum + parsePrice(b.price), 0);
    const totalIncome = soldBikes.reduce((sum, b) => sum + parsePrice(b.price), 0);
    return { count, totalInventoryValue, totalIncome, availableBikes, soldBikes };
  }, [bikes]);

  const filteredBikes = useMemo(() => {
    const list = view === 'Available' ? stats.availableBikes : stats.soldBikes;
    const searchTerm = searchQuery.toLowerCase().trim();
    if (!searchTerm) return list;

    const searchWords = searchTerm.split(/\s+/).filter(Boolean);
    return list.filter((bike) =>
      searchWords.every((word) =>
        bike.brand?.toLowerCase().includes(word) ||
        bike.model?.toLowerCase().includes(word) ||
        bike.type?.toLowerCase().includes(word)
      )
    );
  }, [view, stats, searchQuery]);

  // ── Login Screen ──
  if (!isAuthenticated) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="moto-card p-4 p-sm-5" style={{ width: '100%', maxWidth: '400px', border: '1px solid var(--destructive)' }}>
          <div className="text-center mb-5">
            <div className="d-inline-flex p-3 rounded-circle bg-destructive-soft mb-4 text-destructive">
              <ShieldAlert size={40} />
            </div>
            <h3 className="moto-heading mb-2">ADMIN ACCESS</h3>
            <p className="text-destructive fw-bold" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>WARNING: AUTHORIZED PERSONNEL ONLY</p>
            <p className="text-secondary mt-2" style={{ fontSize: '0.75rem' }}>All access attempts are logged and monitored.</p>
          </div>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-4">
              <div className="position-relative">
                <Lock size={16} className="text-muted position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="moto-input moto-input-with-icon moto-input-with-icon-right"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="position-absolute text-muted p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Form.Group>
            <button type="submit" className="moto-btn w-100 py-3">
              LOGIN
            </button>
          </Form>
        </div>
      </Container>
    );
  }

  // ── Dashboard ──
  return (
    <div style={{ paddingTop: '100px', paddingBottom: '100px', minHeight: '100vh', backgroundColor: 'var(--bg-void)' }}>
      <Container>
        {/* Header */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-5">
          <div>
            <span className="text-accent" style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '2px' }}>STATUS: ONLINE</span>
            <h2 className="moto-heading mt-1 mb-0" style={{ fontSize: '2.5rem' }}>DASHBOARD</h2>
          </div>
          <div className="d-flex flex-wrap gap-2 gap-sm-3">
            <button
              onClick={handleLogout}
              className="moto-btn moto-btn-outline"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <LogOut size={16} className="me-2" /> LOGOUT
            </button>
            <button 
              onClick={() => {
                setEditingBike(null);
                setFormData(EMPTY_FORM);
                setImageFiles([]);
                setShowModal(true);
              }} 
              className="moto-btn" 
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Plus size={16} className="me-2" /> ADD NEW UNIT
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="g-4 mb-5">
          {[
            {
              icon: <Bike size={28} className="text-accent" />,
              label: 'UNITS IN STOCK',
              value: stats.count,
              sub: 'Operational Units',
            },
            {
              icon: <Banknote size={28} className="text-accent" />,
              label: 'TOTAL ASSET VALUE',
              value: `₱${stats.totalInventoryValue.toLocaleString()}`,
              sub: 'Inventory Liquidity',
            },
            {
              icon: <TrendingUp size={28} className="text-primary" />,
              label: 'REVENUE COLLECTED',
              value: `₱${stats.totalIncome.toLocaleString()}`,
              sub: 'Historical Sales',
            },
          ].map((card) => (
            <Col md={4} key={card.label}>
              <div className="moto-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  {card.icon}
                </div>
                <div className="text-secondary fw-bold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>{card.label}</div>
                <div className="text-primary fw-bold" style={{ fontSize: '1.8rem' }}>{card.value}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '8px' }}>{card.sub}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* View Selector & Search */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-end gap-3 mb-4 mt-5">
          <h4 className="moto-heading mb-0" style={{ fontSize: '1.4rem' }}>
             <Database size={20} className="text-accent me-2" /> 
             {view === 'Available' ? 'ACTIVE INVENTORY' : 'SOLD UNITS'}
          </h4>
          <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-end" style={{ width: '100%', maxWidth: '500px' }}>
            <Form.Group className="flex-grow-1">
              <small className="text-secondary fw-bold d-block mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>SEARCH INVENTORY</small>
              <div className="position-relative">
                <Search size={16} className="text-muted position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <Form.Control
                  type="text"
                  placeholder="Search brand, model, type..."
                  className="moto-input moto-input-with-icon"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </Form.Group>
            <Form.Group style={{ minWidth: '180px' }}>
               <small className="text-secondary fw-bold d-block mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>VIEW STATUS</small>
               <Form.Select 
                value={view} 
                onChange={(e) => setView(e.target.value)}
                className="moto-input"
              >
                <option value="Available">Active Inventory</option>
                <option value="Sold">Sold Units</option>
              </Form.Select>
            </Form.Group>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <div className="moto-card overflow-hidden p-0 border-0">
            <Table responsive variant="dark" className="mb-0" style={{ backgroundColor: 'var(--bg-card)' }}>
            <thead style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)' }}>
              <tr>
                <th className="py-3 ps-4 text-accent" style={{ fontWeight: 600 }}>BRAND</th>
                <th className="py-3 text-accent" style={{ fontWeight: 600 }}>MODEL</th>
                <th className="py-3 text-accent" style={{ fontWeight: 600 }}>TYPE</th>
                <th className="py-3 text-accent" style={{ fontWeight: 600 }}>YEAR</th>
                <th className="py-3 text-accent" style={{ fontWeight: 600 }}>PRICE</th>
                <th className="py-3 pe-4 text-center text-accent" style={{ fontWeight: 600 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBikes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    {searchQuery ? 'No matching units found.' : `No ${view === 'Available' ? 'available' : 'sold'} units in inventory.`}
                  </td>
                </tr>
              ) : (
                filteredBikes.map((bike) => (
                  <tr key={bike._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="py-3 ps-4">{bike.brand}</td>
                    <td className="py-3">{bike.model}</td>
                    <td className="py-3">{bike.type ? bike.type.toUpperCase() : '—'}</td>
                    <td className="py-3">{bike.year || '—'}</td>
                    <td className={`py-3 fw-bold ${view === 'Available' ? 'text-accent' : 'text-muted'}`}>{bike.price}</td>
                    <td className="py-3 pe-4">
                      {view === 'Available' ? (
                        <div className="d-flex justify-content-center gap-2">
                          <button className="p-1" style={{ background: 'none', border: 'none', color: '#60a5fa' }} onClick={() => handleEditClick(bike)} title="Edit Unit">
                            <Pencil size={18} />
                          </button>
                          <button className="p-1 text-accent" style={{ background: 'none', border: 'none' }} onClick={() => handleMarkAsSold(bike._id)} title="Mark as Sold">
                            <Check size={18} />
                          </button>
                          <button className="p-1 text-destructive" style={{ background: 'none', border: 'none' }} onClick={() => handleDelete(bike._id)} title="Delete Unit">
                            <Trash size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex justify-content-center">
                          <button className="p-1 text-destructive" style={{ background: 'none', border: 'none' }} onClick={() => handleDelete(bike._id)} title="Delete Unit">
                            <Trash size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          </div>
        </div>

        {/* Add/Edit Bike Modal */}
        <Modal show={showModal} onHide={() => { setShowModal(false); setEditingBike(null); }} size="lg" centered>
          <Modal.Header className="border-0 p-4 pb-0 bg-dark text-white" closeVariant="white">
            <Modal.Title className="moto-heading" style={{ fontSize: '1.4rem' }}>
              {editingBike ? 'EDIT MOTORCYCLE UNIT' : 'ADD NEW UNIT'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 bg-dark text-white">
            <Form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* ── Custom Identity Inputs ── */}
                <div className="col-md-12">
                  <Form.Group>
                    <label className="text-white opacity-75 fw-bold d-block mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                      Motorcycle Identity <span className="text-accent">*</span>
                    </label>
                    <Form.Control
                      placeholder="BRAND MODEL ENGINE_SIZE (e.g. KAWASAKI Z 1000)"
                      name="combinedIdentity"
                      className="moto-input"
                      value={formData.combinedIdentity}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </div>
                {/* ── Rest of the Form ── */}
                {Object.keys(formData).map((key) => {
                  const isHidden = ['brand', 'model', 'engineSize', 'combinedIdentity'].includes(key);
                  if (isHidden) return null;

                  const isRequired = ['type', 'year', 'mileage', 'price'].includes(key);
                  
                  const placeholders = {
                    type: 'e.g. Adventure, Sport, Touring',
                    year: 'e.g. 2023',
                    mileage: 'e.g. 15000 (just the number)',
                    price: 'e.g. 850000 (just the number)',
                    description: 'Detailed overview of the bike...',
                    engineConfig: 'e.g. Inline-4, Boxer, V-Twin',
                    power: 'e.g. 136 (in HP)',
                    transmission: 'e.g. 6-Speed Manual',
                    fuelCapacity: 'e.g. 20 (in Liters)'
                  };

                  const labelMapping = {
                    type: 'Type',
                    year: 'Year',
                    mileage: 'Mileage',
                    price: 'Price',
                    description: 'Description',
                    engineConfig: 'Engine Config',
                    power: 'Power',
                    transmission: 'Transmission',
                    fuelCapacity: 'Fuel Capacity'
                  };

                  return (
                    <div className="col-md-6" key={key}>
                      <Form.Group>
                        <label className="text-white opacity-75 fw-bold d-block mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                          {labelMapping[key] || key} {isRequired && <span className="text-accent">*</span>}
                        </label>
                        <Form.Control
                          as={key === 'description' ? 'textarea' : 'input'}
                          name={key}
                          className="moto-input"
                          value={formData[key]}
                          onChange={handleInputChange}
                          required={isRequired}
                          placeholder={placeholders[key] || ''}
                          rows={key === 'description' ? 3 : undefined}
                          type={['year'].includes(key) ? 'number' : 'text'}
                        />
                        {key === 'description' && (
                          <div className="d-flex justify-content-center align-items-center gap-2 mt-2 text-white-50" style={{ fontSize: '0.75rem' }}>
                             Press <kbd style={{ backgroundColor: '#333', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', border: '1px solid #444' }}>Shift</kbd> + <kbd style={{ backgroundColor: '#333', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', border: '1px solid #444' }}>Enter</kbd> to move to next bullet
                          </div>
                        )}
                      </Form.Group>
                    </div>
                  );
                })}
                <div className="col-md-12">
                  <Form.Group>
                    <label className="text-white opacity-75 fw-bold d-block mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>UNIT IMAGES</label>
                    <Form.Control
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      accept="image/*"
                      required={!editingBike}
                      className="moto-input text-white"
                    />
                    {imageFiles.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mt-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        {imageFiles.map((file, idx) => (
                          <div 
                            key={idx} 
                            className="position-relative" 
                            style={{ cursor: 'pointer', width: '80px', height: '80px' }}
                            onClick={() => setAsThumbnail(idx)}
                            title={idx === 0 ? 'Current Thumbnail' : 'Click to set as thumbnail'}
                          >
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt="preview" 
                              className={`w-100 h-100 rounded object-fit-cover ${idx === 0 ? 'border border-accent border-2' : 'opacity-50'}`}
                            />
                            {idx === 0 ? (
                              <div className="position-absolute bottom-0 start-0 w-100 bg-accent text-dark text-center" style={{ fontSize: '0.6rem', fontWeight: 900 }}>
                                THUMBNAIL
                              </div>
                            ) : (
                              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white opacity-0 hover-opacity-100" style={{ fontSize: '0.6rem', background: 'rgba(0,0,0,0.4)' }}>
                                SET MAIN
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {editingBike && currentImages && currentImages.length > 0 && imageFiles.length === 0 && (
                      <div className="mt-3">
                        <small className="text-secondary d-block mb-2" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                          CURRENT IMAGES (Click an image to set as thumbnail. Uploading new files will replace these):
                        </small>
                        <div className="d-flex flex-wrap gap-2 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.05)' }}>
                          {currentImages.map((imgUrl, idx) => (
                            <div 
                              key={idx} 
                              className="position-relative" 
                              style={{ cursor: 'pointer', width: '80px', height: '80px' }}
                              onClick={() => setAsCurrentThumbnail(idx)}
                              title={idx === 0 ? 'Current Thumbnail' : 'Click to set as thumbnail'}
                            >
                              <img 
                                src={toAbsoluteUploadUrl(imgUrl)} 
                                alt="current" 
                                className={`w-100 h-100 rounded object-fit-cover ${idx === 0 ? 'border border-accent border-2' : 'opacity-50'}`}
                              />
                              {idx === 0 ? (
                                <div className="position-absolute bottom-0 start-0 w-100 bg-accent text-dark text-center" style={{ fontSize: '0.6rem', fontWeight: 900 }}>
                                  THUMBNAIL
                                </div>
                              ) : (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white opacity-0 hover-opacity-100" style={{ fontSize: '0.6rem', background: 'rgba(0,0,0,0.4)' }}>
                                  SET MAIN
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Form.Group>
                </div>
              </div>
              <button
                type="submit"
                className="moto-btn w-100 mt-5 py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'SAVING...' : (editingBike ? 'SAVE CHANGES' : 'SAVE UNIT')}
              </button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Body className="p-5 bg-dark text-white text-center">
          <div className="d-inline-flex p-3 rounded-circle bg-destructive-soft mb-4 text-destructive">
            <Trash size={40} />
          </div>
          <h3 className="moto-heading mb-3">DELETE UNIT?</h3>
          <p className="text-secondary mb-5" style={{ fontSize: '0.9rem' }}>
            Are you sure you want to remove this bike from your inventory? <br />
            <strong>This action cannot be undone.</strong>
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3">
            <button 
              className="moto-btn moto-btn-outline w-100 py-3" 
              onClick={() => setShowDeleteModal(false)}
            >
              CANCEL
            </button>
            <button 
              className="moto-btn bg-destructive w-100 py-3 border-0" 
              onClick={confirmDelete}
            >
              DELETE
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Mark as Sold Confirmation Modal */}
      <Modal show={showSoldModal} onHide={() => setShowSoldModal(false)} centered>
        <Modal.Body className="p-5 bg-dark text-white text-center">
          <div className="d-inline-flex p-3 rounded-circle bg-destructive-soft mb-4 text-accent" style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)' }}>
            <Check size={40} />
          </div>
          <h3 className="moto-heading mb-3">MARK AS SOLD?</h3>
          <p className="text-secondary mb-5" style={{ fontSize: '0.9rem' }}>
            Are you sure you want to mark this bike as sold? <br />
            <strong>This will delete its images and specifications.</strong>
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3">
            <button 
              className="moto-btn moto-btn-outline w-100 py-3" 
              onClick={() => setShowSoldModal(false)}
            >
              CANCEL
            </button>
            <button 
              className="moto-btn w-100 py-3" 
              onClick={confirmMarkAsSold}
            >
              CONFIRM
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Success Notification Modal */}
      <Modal show={successModal.show} onHide={() => setSuccessModal({ show: false, message: '' })} centered size="sm">
        <Modal.Body className="p-4 bg-dark text-white text-center" style={{ border: '1px solid var(--accent-primary)', borderRadius: '8px' }}>
          <div className="d-inline-flex p-3 rounded-circle bg-destructive-soft mb-3 text-accent" style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)' }}>
            <Check size={32} />
          </div>
          <h5 className="moto-heading mb-2 text-primary" style={{ fontSize: '1.2rem', letterSpacing: '1px' }}>SUCCESS</h5>
          <p className="text-secondary mb-4" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
            {successModal.message}
          </p>
          <button 
            className="moto-btn w-100 py-2" 
            onClick={() => setSuccessModal({ show: false, message: '' })}
            style={{ fontSize: '0.85rem' }}
          >
            OK
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Admin;
