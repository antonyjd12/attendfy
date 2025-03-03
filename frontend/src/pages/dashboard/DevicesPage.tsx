import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/AuthContext';

interface Device {
  _id: string;
  deviceId: string;
  name: string;
  location: string;
  isActive: boolean;
}

interface NewDevice {
  deviceId: string;
  name: string;
  location: string;
}

const DevicesPage: React.FC = () => {
  const { token } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newDevice, setNewDevice] = useState<NewDevice>({
    deviceId: '',
    name: '',
    location: '',
  });

  const fetchDevices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/devices', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [token]);

  const handleAddDevice = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDevice),
      });

      if (response.ok) {
        setOpenDialog(false);
        setNewDevice({ deviceId: '', name: '', location: '' });
        fetchDevices();
      }
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const handleToggleStatus = async (deviceId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/devices/${deviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchDevices();
      }
    } catch (error) {
      console.error('Error updating device status:', error);
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Device Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Device
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Device ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device._id}>
                <TableCell>{device.deviceId}</TableCell>
                <TableCell>{device.name}</TableCell>
                <TableCell>{device.location}</TableCell>
                <TableCell>
                  {device.isActive ? 'Active' : 'Inactive'}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={device.isActive}
                    onChange={() => handleToggleStatus(device._id, device.isActive)}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Device</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Device ID"
              value={newDevice.deviceId}
              onChange={(e) =>
                setNewDevice({ ...newDevice, deviceId: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Name"
              value={newDevice.name}
              onChange={(e) =>
                setNewDevice({ ...newDevice, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Location"
              value={newDevice.location}
              onChange={(e) =>
                setNewDevice({ ...newDevice, location: e.target.value })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddDevice} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DevicesPage;