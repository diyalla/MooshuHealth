const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 🔥 MONGO ATLAS STRING (USE YOURS)
const MONGO_URI = 'mongodb+srv://mooshu:Mooshu123@cluster0.pwavdl1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected to Atlas'))
.catch(err => console.log('MongoDB connection error:', err));

// UPDATED SCHEMA (critical added)
const patientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dateOfBirth: String,
  gender: String,
  contactNumber: String,
  medicalId: String,
  critical: Boolean,    // 🔥 NEW FIELD
  records: [{
    diagnosis: String,
    admitted: Boolean,
    admittedDays: Number,
    discharged: Boolean,
    medication: String,
    testsDone: Boolean,
    testsDetails: String,
    dateDischarged: String
  }]
});

const Patient = mongoose.model('Patient', patientSchema);

// Add new patient
app.post('/patients', async (req, res) => {
    const { medicalId } = req.body;
    const exists = await Patient.findOne({ medicalId });
    if (exists) return res.status(400).json({ message: 'Patient already added' });

    const newPatient = new Patient(req.body);
    await newPatient.save();
    res.json({ message: 'Patient added successfully' });
});

// Get all patients OR search
app.get('/patients', async (req, res) => {
    const search = req.query.search;

    if (search) {
        const regex = new RegExp(search, 'i');
        const patients = await Patient.find({
            $or: [
                { firstName: regex },
                { lastName: regex },
                { medicalId: regex }
            ]
        });
        return res.json(patients);
    }

    const patients = await Patient.find();
    res.json(patients);
});

// Add patient record
app.post('/patients/:id/record', async (req, res) => {
    const patient = await Patient.findById(req.params.id);
    patient.records.push(req.body);
    await patient.save();
    res.json({ message: 'Record added successfully' });
});

// Update patient
app.put('/patients/:id', async (req, res) => {
  const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete patient
app.delete('/patients/:id', async (req, res) => {
  await Patient.findByIdAndDelete(req.params.id);
  res.json({ message: 'Patient deleted successfully' });
});

app.listen(5000, () => console.log('Server running on port 5000'));
