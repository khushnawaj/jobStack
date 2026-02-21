const express = require('express');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const { searchJobs } = require('../services/jobSearchService');
const router = express.Router();

// Search External Jobs (Mock/Proxy)
router.get('/search', auth, async (req, res) => {
    try {
        const { q, l, remote, type, date, experience } = req.query;
        console.log('--- Job Search Incoming ---');
        console.log('Query:', q, '| Loc:', l, '| Exp:', experience);

        const apiKey = process.env.RAPID_API_KEY;
        if (!apiKey || apiKey === '' || (typeof apiKey === 'string' && apiKey.includes('...'))) {
            console.error('CRITICAL: RapidAPI Key is MISSING or placeholder in .env');
            return res.status(500).json({ error: 'Search service misconfigured. Please check server .env' });
        }

        const results = await searchJobs(q, l, { remote, jobType: type, datePosted: date, experience });
        res.json(results || []);
    } catch (error) {
        console.error('Jobs Search Route Error:', error.message, error.stack);
        res.status(500).json({ error: 'Search engine error', message: error.message });
    }
});

// Get all jobs for authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const jobs = await Job.find({ user: req.user.userId }).sort({ createdAt: -1 });
        // Transform _id to id for frontend compatibility
        const jobsWithId = jobs.map(job => {
            const obj = job.toObject();
            obj.id = obj._id;
            delete obj._id;
            return obj;
        });
        res.json(jobsWithId);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching jobs' });
    }
});

// Create a new job
router.post('/', auth, async (req, res) => {
    try {
        const { role, company, status, notes, salary, jdUrl, jdText, recruiterName, appliedDate } = req.body;

        if (!role || !company) {
            return res.status(400).json({ error: 'Role and Company are required' });
        }

        const newJob = new Job({
            user: req.user.userId,
            role,
            company,
            status: status || 'Saved',
            notes,
            salary,
            jdUrl,
            jdText,
            recruiterName,
            appliedDate: appliedDate ? new Date(appliedDate) : null,
        });

        const savedJob = await newJob.save();
        const obj = savedJob.toObject();
        obj.id = obj._id;
        delete obj._id;

        res.status(201).json(obj);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating job' });
    }
});

// Update a job
router.put('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        // Authorization
        if (job.user.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { role, company, status, notes, salary, jdUrl, jdText, recruiterName, appliedDate, checklistDone, aiScore } = req.body;

        if (role) job.role = role;
        if (company) job.company = company;
        if (status) job.status = status;
        if (notes !== undefined) job.notes = notes;
        if (salary) job.salary = salary;
        if (jdUrl) job.jdUrl = jdUrl;
        if (jdText) job.jdText = jdText;
        if (recruiterName) job.recruiterName = recruiterName;
        if (appliedDate) job.appliedDate = new Date(appliedDate);
        if (checklistDone) job.checklistDone = checklistDone;
        if (aiScore) job.aiScore = aiScore;

        const updatedJob = await job.save();
        const obj = updatedJob.toObject();
        obj.id = obj._id;
        delete obj._id;

        res.json(obj);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating job' });
    }
});

// Delete a job
router.delete('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        // Authorization
        if (job.user.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await job.deleteOne();
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error deleting job' });
    }
});

module.exports = router;
