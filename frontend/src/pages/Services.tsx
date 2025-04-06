import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
} from '@mui/material';

const services = [
  {
    title: 'Window Cleaning',
    description: 'Professional interior and exterior window cleaning service',
    price: 'From £20',
    frequency: 'Weekly, Bi-weekly, Monthly',
  },
  {
    title: 'Gutter Cleaning',
    description: 'Thorough gutter cleaning and maintenance',
    price: 'From £35',
    frequency: 'Quarterly, Bi-annually',
  },
  {
    title: 'Pressure Washing',
    description: 'High-pressure cleaning for driveways, patios, and exterior surfaces',
    price: 'From £45',
    frequency: 'Monthly, Quarterly',
  },
  {
    title: 'Deep Cleaning',
    description: 'Comprehensive cleaning service for homes and offices',
    price: 'From £60',
    frequency: 'Monthly, Quarterly',
  },
];

const Services: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Our Services
      </Typography>
      <Grid container spacing={3}>
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {service.description}
                </Typography>
                <Typography variant="body1" color="primary" gutterBottom>
                  {service.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Frequency: {service.frequency}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Book Now
                </Button>
                <Button size="small" color="primary">
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Services; 