const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to local MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/mooshu', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Patient Schema 
const patientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dateOfBirth: String,
  gender: String,
  contactNumber: String,
  medicalId: String,
  records: [{
    diagnosis: String,
    admitted: Boolean,
    admittedDays: Number,
    discharged: Boolean,
    medication: String,
    // NEW FIELDS:
    testsDone: Boolean,       // yes/no
    testsDetails: String,     // free text when yes
    dateDischarged: String    // string date when discharged = yes
  }]
});


const Patient = mongoose.model('Patient', patientSchema);

// Add new patient
app.post('/patients', async (req, res) => {
    const { firstName, lastName, medicalId } = req.body;
    const exists = await Patient.findOne({ medicalId });
    if (exists) return res.status(400).json({ message: 'Patient already added' });

    const newPatient = new Patient(req.body);
    await newPatient.save();
    res.json({ message: 'Patient added successfully' });
});

// Get all patients OR search for one
app.get('/patients', async (req, res) => {
    const search = req.query.search;

    if (search) {
        const regex = new RegExp(search, 'i'); // case insensitive search
        const patients = await Patient.find({
            $or: [
                { firstName: regex },
                { lastName: regex },
                { medicalId: regex }
            ]
        });
        return res.json(patients);
    }

    // If no search query was provided return all patients
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
