import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const dataPath = path.join(__dirname, '../../data/customers.json');

// Helper function to read customers file
const getCustomers = (): Customer[] => {
  if (!fs.existsSync(dataPath)) {
    return [];
  }
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write to customers file
const saveCustomers = (customers: Customer[]): void => {
  fs.writeFileSync(dataPath, JSON.stringify(customers, null, 2));
};

// Interface for Customer
interface Customer {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  email?: string;
  phone?: string;
  notes?: string;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

// GET all customers
router.get('/', (req, res) => {
  try {
    const customers = getCustomers();
    res.json(customers);
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({ message: 'Failed to get customers' });
  }
});

// GET single customer
router.get('/:id', (req, res) => {
  try {
    const customers = getCustomers();
    const customer = customers.find(c => c.id === req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error getting customer:', error);
    res.status(500).json({ message: 'Failed to get customer' });
  }
});

// POST new customer
router.post('/', (req, res) => {
  try {
    const customers = getCustomers();
    
    const newCustomer: Customer = {
      id: uuidv4(),
      name: req.body.name,
      address: req.body.address,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      email: req.body.email,
      phone: req.body.phone,
      notes: req.body.notes,
      verified: req.body.verified || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    customers.push(newCustomer);
    saveCustomers(customers);
    
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
});

// PUT update customer
router.put('/:id', (req, res) => {
  try {
    let customers = getCustomers();
    const customerIndex = customers.findIndex(c => c.id === req.params.id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const updatedCustomer = {
      ...customers[customerIndex],
      name: req.body.name || customers[customerIndex].name,
      address: req.body.address || customers[customerIndex].address,
      latitude: req.body.latitude || customers[customerIndex].latitude,
      longitude: req.body.longitude || customers[customerIndex].longitude,
      email: req.body.email || customers[customerIndex].email,
      phone: req.body.phone || customers[customerIndex].phone,
      notes: req.body.notes || customers[customerIndex].notes,
      verified: req.body.verified !== undefined ? req.body.verified : customers[customerIndex].verified,
      updatedAt: new Date().toISOString()
    };
    
    customers[customerIndex] = updatedCustomer;
    saveCustomers(customers);
    
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Failed to update customer' });
  }
});

// DELETE customer
router.delete('/:id', (req, res) => {
  try {
    let customers = getCustomers();
    const customerIndex = customers.findIndex(c => c.id === req.params.id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    customers = customers.filter(c => c.id !== req.params.id);
    saveCustomers(customers);
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Failed to delete customer' });
  }
});

export default router; 