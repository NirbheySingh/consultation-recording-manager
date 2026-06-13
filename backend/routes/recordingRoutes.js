const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { CATEGORIES } = require('../models/Recording');
const {
  createRecording,
  getRecordings,
  getStats,
  getRecordingById,
  updateRecording,
  deleteRecording,
} = require('../controllers/recordingController');
const { handleValidationErrors } = require('../controllers/authController');

const router = express.Router();

const recordingValidation = [
  body('clientName').trim().notEmpty().withMessage('Client name is required'),
  body('title').trim().notEmpty().withMessage('Consultation title is required'),
  body('consultationDate').isISO8601().withMessage('Valid consultation date is required'),
  body('category')
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('notes').optional().trim(),
];

router.use(protect);

router.get('/stats', getStats);

router
  .route('/')
  .post(upload.single('file'), handleUploadError, recordingValidation, handleValidationErrors, createRecording)
  .get(getRecordings);

router
  .route('/:id')
  .get(getRecordingById)
  .put(recordingValidation, handleValidationErrors, updateRecording)
  .delete(deleteRecording);

module.exports = router;
