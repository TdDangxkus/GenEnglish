const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('teacher', 'username');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get course by ID
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('teacher', 'username')
            .populate('students', 'username');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create course (teachers only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const course = new Course({
            ...req.body,
            teacher: req.user.id
        });

        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update course
router.put('/:id', auth, async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        course = await Course.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete course
router.delete('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await course.remove();
        res.json({ message: 'Course removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Register for course
router.post('/:id/register', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.students.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already registered' });
        }

        course.students.push(req.user.id);
        await course.save();

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;