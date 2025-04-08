import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const dataPath = path.join(__dirname, '../../data/rounds.json');

// Helper function to read rounds file
const getRounds = (): Round[] => {
  if (!fs.existsSync(dataPath)) {
    return [];
  }
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write to rounds file
const saveRounds = (rounds: Round[]): void => {
  fs.writeFileSync(dataPath, JSON.stringify(rounds, null, 2));
};

// Interface for Round
interface Round {
  id: string;
  name: string;
  description?: string;
  color?: string;
  dayOfWeek?: number; // 0-6 where 0 is Sunday
  createdAt: string;
  updatedAt: string;
}

// GET all rounds
router.get('/', (req, res) => {
  try {
    const rounds = getRounds();
    res.json(rounds);
  } catch (error) {
    console.error('Error getting rounds:', error);
    res.status(500).json({ message: 'Failed to get rounds' });
  }
});

// GET single round
router.get('/:id', (req, res) => {
  try {
    const rounds = getRounds();
    const round = rounds.find(r => r.id === req.params.id);
    
    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }
    
    res.json(round);
  } catch (error) {
    console.error('Error getting round:', error);
    res.status(500).json({ message: 'Failed to get round' });
  }
});

// POST new round
router.post('/', (req, res) => {
  try {
    const rounds = getRounds();
    
    const newRound: Round = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description,
      color: req.body.color,
      dayOfWeek: req.body.dayOfWeek,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    rounds.push(newRound);
    saveRounds(rounds);
    
    res.status(201).json(newRound);
  } catch (error) {
    console.error('Error creating round:', error);
    res.status(500).json({ message: 'Failed to create round' });
  }
});

// PUT update round
router.put('/:id', (req, res) => {
  try {
    let rounds = getRounds();
    const roundIndex = rounds.findIndex(r => r.id === req.params.id);
    
    if (roundIndex === -1) {
      return res.status(404).json({ message: 'Round not found' });
    }
    
    const updatedRound = {
      ...rounds[roundIndex],
      name: req.body.name || rounds[roundIndex].name,
      description: req.body.description !== undefined ? req.body.description : rounds[roundIndex].description,
      color: req.body.color !== undefined ? req.body.color : rounds[roundIndex].color,
      dayOfWeek: req.body.dayOfWeek !== undefined ? req.body.dayOfWeek : rounds[roundIndex].dayOfWeek,
      updatedAt: new Date().toISOString()
    };
    
    rounds[roundIndex] = updatedRound;
    saveRounds(rounds);
    
    res.json(updatedRound);
  } catch (error) {
    console.error('Error updating round:', error);
    res.status(500).json({ message: 'Failed to update round' });
  }
});

// DELETE round
router.delete('/:id', (req, res) => {
  try {
    let rounds = getRounds();
    const roundIndex = rounds.findIndex(r => r.id === req.params.id);
    
    if (roundIndex === -1) {
      return res.status(404).json({ message: 'Round not found' });
    }
    
    rounds = rounds.filter(r => r.id !== req.params.id);
    saveRounds(rounds);
    
    res.json({ message: 'Round deleted successfully' });
  } catch (error) {
    console.error('Error deleting round:', error);
    res.status(500).json({ message: 'Failed to delete round' });
  }
});

export default router; 