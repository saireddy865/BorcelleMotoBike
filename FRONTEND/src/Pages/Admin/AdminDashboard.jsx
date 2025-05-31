
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Modal,
  Box,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Fade,
  Input,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/AdminDashboard.css';

const AdminDashboardBikes = () => {
  const navigate = useNavigate();
  const [bikes, setBikes] = useState([]);
  const [editBike, setEditBike] = useState(null);
  const [addBike, setAddBike] = useState({
    bike_name: '',
    bike_model: '',
    bike_type: '',
    bike_enginetype: '',
    bike_price: '',
    imagefile: null,
    available: true,
  });
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    let admin;
    try {
      const storedAdmin = localStorage.getItem('Admin');
      console.log('Raw Admin from localStorage:', storedAdmin);
      admin = storedAdmin ? JSON.parse(storedAdmin) : null;
      console.log('Admin Token Check:', admin);
    } catch (error) {
      console.error('Error parsing Admin from localStorage:', error);
      localStorage.removeItem('Admin');
      admin = null;
    }
    if (!admin?.adminToken) {
      console.log('No valid token, redirecting to /admin/login');
      navigate('/admin/login', { replace: true });
    } else {
      fetchBikes(admin.adminToken);
    }
  }, [navigate]);

  const fetchBikes = async (token) => {
    setLoading(true);
    try {
      console.log('Fetching bikes with token:', token);
      const response = await fetch('https://borcellemotobike.onrender.com/admin/bikes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error(errorData.message || 'Unauthorized: Invalid or expired token');
        }
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch bikes`);
      }
      const data = await response.json();
      console.log('Bikes fetched:', data);
      setBikes(data);
      setError(null);
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch bikes';
      console.error('Fetch Bikes Error:', errorMessage, error);
      setError(errorMessage);
      toast.error(
        <div>
          <span style={{ marginRight: '8px' }}>!</span>
          {errorMessage}
        </div>,
        {
          position: 'top-center',
          autoClose: 3000,
          style: {
            background: '#d32f2f',
            color: '#ffffff',
            fontSize: '1rem',
            borderRadius: '8px',
          },
        }
      );
      if (errorMessage.includes('Unauthorized')) {
        console.log('Clearing invalid token and redirecting');
        localStorage.removeItem('Admin');
        navigate('/admin/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bike_id) => {
    try {
      const token = JSON.parse(localStorage.getItem('Admin')).adminToken;
      const response = await fetch(`https://borcellemotobike.onrender.com/bikes/${bike_id}/approve`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success(
          <div>
            <span style={{ marginRight: '8px' }}>✔</span>
            {data.message || 'Bike approved/unapproved successfully'}
          </div>,
          {
            position: 'top-center',
            autoClose: 1500,
            style: {
              background: '#4caf50',
              color: '#ffffff',
              fontSize: '1rem',
              borderRadius: '8px',
            },
          }
        );
        setBikes(bikes.map((bike) => (bike.bike_id === bike_id ? data.bike : bike)));
      } else {
        throw new Error(data.message || 'Approval failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Approval failed';
      console.error('Approve Error:', errorMessage, error);
      toast.error(
        <div>
          <span style={{ marginRight: '8px' }}>!</span>
          {errorMessage}
        </div>,
        {
          position: 'top-center',
          autoClose: 3000,
          style: {
            background: '#d32f2f',
            color: '#ffffff',
            fontSize: '1rem',
            borderRadius: '8px',
          },
        }
      );
    }
  };

  const handleEdit = (bike) => {
    console.log('Editing bike with ID:', bike.bike_id);
    setEditBike({ ...bike });
    setImageFile(null);
    setOpenEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'imagefile') {
      setImageFile(e.target.files[0]);
    } else {
      setEditBike((prev) => ({
        ...prev,
        [name]: name === 'bike_price' ? parseFloat(value) : value,
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editBike?.bike_id) {
      console.error('No bike_id provided for edit');
      toast.error(
        <div>
          <span style={{ marginRight: '8px' }}>!</span>
          Invalid bike ID
        </div>,
        {
          position: 'top-center',
          autoClose: 3000,
          style: {
            background: '#d32f2f',
            color: '#ffffff',
            fontSize: '1rem',
            borderRadius: '8px',
          },
        }
      );
      return;
    }
    try {
      const token = JSON.parse(localStorage.getItem('Admin')).adminToken;
      const formData = new FormData();
      formData.append('bike_name', editBike.bike_name || '');
      formData.append('bike_model', editBike.bike_model || '');
      formData.append('bike_type', editBike.bike_type || '');
      formData.append('bike_enginetype', editBike.bike_enginetype || '');
      formData.append('bike_price', editBike.bike_price || 0);
      formData.append('available', editBike.available ?? false);
      if (imageFile) {
        formData.append('image', imageFile);
      } else {
        formData.append('imagefile', editBike.image || '');
      }

      console.log('Submitting edit with FormData:', {
        id: editBike.bike_id,
        formData: Object.fromEntries(formData),
      });

      const response = await fetch(`https://borcellemotobike.onrender.com/admin/bikes/${editBike.bike_id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success(
          <div>
            <span style={{ marginRight: '8px' }}>✔</span>
            Bike updated successfully
          </div>,
          {
            position: 'top-center',
            autoClose: 1500,
            style: {
              background: '#4caf50',
              color: '#ffffff',
              fontSize: '1rem',
              borderRadius: '8px',
            },
          }
        );
        setBikes(bikes.map((bike) => (bike.bike_id === editBike.bike_id ? data.bike : bike)));
        setOpenEditModal(false);
        setEditBike(null);
        setImageFile(null);
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Update failed';
      console.error('Edit Error:', errorMessage, error);
      toast.error(
        <div>
          <span style={{ marginRight: '8px' }}>!</span>
          {errorMessage}
        </div>,
        {
          position: 'top-center',
          autoClose: 3000,
          style: {
            background: '#d32f2f',
            color: '#ffffff',
            fontSize: '1rem',
            borderRadius: '8px',
          },
        }
      );
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    if (name === 'imagefile') {
      setAddBike((prev) => ({ ...prev, imagefile: e.target.files[0] }));
    } else {
      setAddBike((prev) => ({
        ...prev,
        [name]: name === 'bike_price' ? parseFloat(value) : value,
      }));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = JSON.parse(localStorage.getItem('Admin')).adminToken;
      const formData = new FormData();
      formData.append('bike_name', addBike.bike_name || '');
      formData.append('bike_model', addBike.bike_model || '');
      formData.append('bike_type', addBike.bike_type || '');
      formData.append('bike_enginetype', addBike.bike_enginetype || '');
      formData.append('bike_price', addBike.bike_price || 0);
      formData.append('available', addBike.available ?? false);
      if (addBike.imagefile) {
        formData.append('image', addBike.imagefile);
      }

      console.log('Submitting add with FormData:', {
        formData: Object.fromEntries(formData),
      });

      const response = await fetch('https://borcellemotobike.onrender.com/admin/addBikes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success(
          <div>
            <span style={{ marginRight: '8px' }}>✔</span>
            Bike added successfully
          </div>,
          {
            position: 'top-center',
            autoClose: 1500,
            style: {
              background: '#4caf50',
              color: '#ffffff',
              fontSize: '1rem',
              borderRadius: '8px',
            },
          }
        );
        setBikes([...bikes, data.bike]);
        setOpenAddModal(false);
        setAddBike({
          bike_name: '',
          bike_model: '',
          bike_type: '',
          bike_enginetype: '',
          bike_price: '',
          imagefile: null,
          available: true,
        });
      } else {
        throw new Error(data.message || 'Failed to add bike');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to add bike';
      console.error('Add Error:', errorMessage, error);
      toast.error(
        <div>
          <span style={{ marginRight: '8px' }}>!</span>
          {errorMessage}
        </div>,
        {
          position: 'top-center',
          autoClose: 3000,
          style: {
            background: '#d32f2f',
            color: '#ffffff',
            fontSize: '1rem',
            borderRadius: '8px',
          },
        }
      );
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('Admin');
      toast.success(
        <div>
          <span style={{ marginRight: '8px' }}>✔</span>
          Logged out successfully
        </div>,
        {
          position: 'top-center',
          autoClose: 1500,
          style: {
            background: '#4caf50',
            color: '#ffffff',
            fontSize: '1rem',
            borderRadius: '8px',
          },
        }
      );
      console.log('Logging out, redirecting to /admin/login');
      setTimeout(() => navigate('/admin/login', { replace: true }), 1000);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const groupedBikes = useMemo(() => {
    return bikes.reduce((acc, bike) => {
      acc[bike.bike_type] = acc[bike.bike_type] || [];
      acc[bike.bike_type].push(bike);
      return acc;
    }, {});
  }, [bikes]);

  return (
    <div className="admin-dashboard" role="main" aria-labelledby="dashboard-title">
      <Button
        variant="outlined"
        className="logout-button"
        onClick={handleLogout}
        aria-label="Logout"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        Logout
      </Button>
      <Typography id="dashboard-title" variant="h4" className="dashboard-title">
        Admin Dashboard - Bikes
      </Typography>
      {loading && (
        <Box className="loading-container">
          <CircularProgress color="error" />
        </Box>
      )}
      {error && (
        <Typography color="error" className="error-message">
          {error}
        </Typography>
      )}
      {!loading && !error && Object.keys(groupedBikes).length === 0 && (
        <Typography className="no-bikes">No bikes available.</Typography>
      )}
      {Object.keys(groupedBikes).map((bikeType) => (
        <div key={bikeType} className="bike-category">
          <Typography variant="h5" className="category-title">
            {bikeType}
          </Typography>
          <Grid container spacing={2}>
            {groupedBikes[bikeType].map((bike) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={bike.bike_id}>
                <Fade in={true} timeout={500}>
                  <Card className="bike-card" aria-label={`Bike: ${bike.bike_name}`}>
                    <CardMedia
                      component="img"
                      height="140"
                      width="180"
                      image={bike.image || '/placeholder.jpg'}
                      alt={bike.bike_name}
                      className="bike-image"
                      loading="lazy"
                    />
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {bike.bike_name}
                      </Typography>
                      <Typography variant="body2">ID: {bike.bike_id}</Typography>
                      <Typography variant="body2">Model: {bike.bike_model}</Typography>
                      <Typography variant="body2">Type: {bike.bike_type}</Typography>
                      <Typography variant="body2">Engine: {bike.bike_enginetype}</Typography>
                      <Typography variant="body2">Price: ₹{bike.bike_price.toLocaleString()}</Typography>
                      <Typography variant="body2">
                        Status: {bike.available ? 'Available' : 'Unavailable'}
                      </Typography>
                      <div className="card-actions">
                        <Button
                          variant="contained"
                          className="approve-button"
                          onClick={() => handleApprove(bike.bike_id)}
                          aria-label={bike.available ? `Unapprove ${bike.bike_name}` : `Approve ${bike.bike_name}`}
                        >
                          {bike.available ? 'Unapprove' : 'Approve'}
                        </Button>
                        <Button
                          variant="outlined"
                          className="edit-button"
                          onClick={() => handleEdit(bike)}
                          aria-label={`Edit Bike ${bike.bike_name}`}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </div>
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          className="add-bike-button"
          onClick={() => setOpenAddModal(true)}
          aria-label="Add New Bike"
        >
          Add Bike
        </Button>
      </Box>
      <Modal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setImageFile(null);
        }}
        aria-labelledby="edit-bike-modal"
        closeAfterTransition
      >
        <Fade in={openEditModal}>
          <Box className="edit-modal" role="dialog" aria-labelledby="edit-bike-modal">
            <Typography id="edit-bike-modal" variant="h6" className="modal-title">
              Edit Bike
            </Typography>
            <form onSubmit={handleEditSubmit} noValidate>
              <TextField
                label="Bike ID"
                name="bike_id"
                value={editBike?.bike_id || ''}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                disabled
                InputProps={{ 'aria-readonly': true }}
              />
              <TextField
                label="Bike Name"
                name="bike_name"
                value={editBike?.bike_name || ''}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                required
                inputProps={{ maxLength: 50 }}
              />
              <TextField
                label="Bike Model"
                name="bike_model"
                value={editBike?.bike_model || ''}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                required
                inputProps={{ maxLength: 50 }}
              />
              <TextField
                select
                label="Bike Type"
                name="bike_type"
                value={editBike?.bike_type || ''}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                required
              >
                {['Sport', 'Touring', 'Standard', 'Scooty', 'Adventure'].map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Engine Type"
                name="bike_enginetype"
                value={editBike?.bike_enginetype || ''}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                required
              >
                {['Petrol', 'Electric'].map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Price"
                name="bike_price"
                type="number"
                value={editBike?.bike_price || ''}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                required
                inputProps={{ min: 0, step: 1 }}
              />
              <Box sx={{ margin: '16px 0' }}>
                <Typography variant="body2">Current Image:</Typography>
                {editBike?.image && (
                  <img
                    src={editBike.image}
                    alt="Current bike"
                    style={{ maxWidth: '100%', maxHeight: '100px', marginTop: '8px' }}
                  />
                )}
              </Box>
              <Input
                type="file"
                name="imagefile"
                onChange={handleEditChange}
                fullWidth
                inputProps={{ accept: 'image/*', 'aria-label': 'Upload new bike image' }}
                sx={{ margin: '16px 0' }}
              />
              <TextField
                select
                label="Availability"
                name="available"
                value={editBike?.available ?? false}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                required
              >
                <MenuItem value={true}>Available</MenuItem>
                <MenuItem value={false}>Unavailable</MenuItem>
              </TextField>
              <div className="modal-actions">
                <Button
                  type="submit"
                  variant="contained"
                  className="save-button"
                  aria-label="Save changes"
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  className="cancel-button"
                  onClick={() => {
                    setOpenEditModal(false);
                    setImageFile(null);
                  }}
                  aria-label="Cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Box>
        </Fade>
      </Modal>
      <Modal
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          setAddBike({
            bike_name: '',
            bike_model: '',
            bike_type: '',
            bike_enginetype: '',
            bike_price: '',
            imagefile: null,
            available: true,
          });
        }}
        aria-labelledby="add-bike-modal"
        closeAfterTransition
      >
        <Fade in={openAddModal}>
          <Box className="edit-modal" role="dialog" aria-labelledby="add-bike-modal">
            <Typography id="add-bike-modal" variant="h6" className="modal-title">
              Add New Bike
            </Typography>
            <form onSubmit={handleAddSubmit} noValidate>
              <TextField
                label="Bike Name"
                name="bike_name"
                value={addBike.bike_name}
                onChange={handleAddChange}
                fullWidth
                margin="normal"
                required
                inputProps={{ maxLength: 50 }}
              />
              <TextField
                label="Bike Model"
                name="bike_model"
                value={addBike.bike_model}
                onChange={handleAddChange}
                fullWidth
                margin="normal"
                required
                inputProps={{ maxLength: 50 }}
              />
              <TextField
                select
                label="Bike Type"
                name="bike_type"
                value={addBike.bike_type}
                onChange={handleAddChange}
                fullWidth
                margin="normal"
                required
              >
                {['Sport', 'Touring', 'Standard', 'Scooty', 'Adventure'].map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Engine Type"
                name="bike_enginetype"
                value={addBike.bike_enginetype}
                onChange={handleAddChange}
                fullWidth
                margin="normal"
                required
              >
                {['Petrol', 'Electric'].map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Price"
                name="bike_price"
                type="number"
                value={addBike.bike_price}
                onChange={handleAddChange}
                fullWidth
                margin="normal"
                required
                inputProps={{ min: 0, step: 1 }}
              />
              <Input
                type="file"
                name="imagefile"
                onChange={handleAddChange}
                fullWidth
                inputProps={{ accept: 'image/*', 'aria-label': 'Upload bike image' }}
                sx={{ margin: '16px 0' }}
                required
              />
              <TextField
                select
                label="Availability"
                name="available"
                value={addBike.available}
                onChange={handleAddChange}
                fullWidth
                margin="normal"
                required
              >
                <MenuItem value={true}>Available</MenuItem>
                <MenuItem value={false}>Unavailable</MenuItem>
              </TextField>
              <div className="modal-actions">
                <Button
                  type="submit"
                  variant="contained"
                  className="save-button"
                  aria-label="Add bike"
                >
                  Add
                </Button>
                <Button
                  variant="outlined"
                  className="cancel-button"
                  onClick={() => {
                    setOpenAddModal(false);
                    setAddBike({
                      bike_name: '',
                      bike_model: '',
                      bike_type: '',
                      bike_enginetype: '',
                      bike_price: '',
                      imagefile: null,
                      available: true,
                    });
                  }}
                  aria-label="Cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Box>
        </Fade>
      </Modal>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default AdminDashboardBikes;
