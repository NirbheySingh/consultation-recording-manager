const fs = require('fs');
const path = require('path');
const Recording = require('../models/Recording');
const { uploadsDir } = require('../middleware/upload');

const buildFileUrl = (req, fileName) => {
  return `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
};

// POST /api/recordings
const createRecording = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Recording file is required.' });
    }

    const { clientName, title, consultationDate, notes, category } = req.body;

    const recording = await Recording.create({
      clientName,
      title,
      consultationDate,
      notes: notes || '',
      category,
      fileName: req.file.filename,
      fileUrl: buildFileUrl(req, req.file.filename),
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
    });

    await recording.populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Recording uploaded successfully',
      data: { recording },
    });
  } catch (error) {
    if (req.file) {
      const filePath = path.join(uploadsDir, req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create recording.' });
  }
};

// GET /api/recordings
const getRecordings = async (req, res) => {
  try {
    const {
      search,
      category,
      sort = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const filter = { uploadedBy: req.user._id };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [{ clientName: searchRegex }, { title: searchRegex }];
    }

    const sortOrder = sort === 'asc' ? 1 : -1;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [recordings, total] = await Promise.all([
      Recording.find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('uploadedBy', 'name email'),
      Recording.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        recordings,
        pagination: {
          total,
          page: parseInt(page, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch recordings.' });
  }
};

// GET /api/recordings/stats
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalRecordings, recentUploads, categoryStats] = await Promise.all([
      Recording.countDocuments({ uploadedBy: userId }),
      Recording.find({ uploadedBy: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('clientName title category createdAt consultationDate'),
      Recording.aggregate([
        { $match: { uploadedBy: userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const uploadsThisMonth = await Recording.countDocuments({
      uploadedBy: userId,
      createdAt: { $gte: thisMonth },
    });

    res.json({
      success: true,
      data: {
        totalRecordings,
        uploadsThisMonth,
        recentUploads,
        categoryStats: categoryStats.map((c) => ({ category: c._id, count: c.count })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch statistics.' });
  }
};

// GET /api/recordings/:id
const getRecordingById = async (req, res) => {
  try {
    const recording = await Recording.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    }).populate('uploadedBy', 'name email');

    if (!recording) {
      return res.status(404).json({ success: false, message: 'Recording not found.' });
    }

    res.json({ success: true, data: { recording } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch recording.' });
  }
};

// PUT /api/recordings/:id
const updateRecording = async (req, res) => {
  try {
    const { clientName, title, consultationDate, notes, category } = req.body;

    const recording = await Recording.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!recording) {
      return res.status(404).json({ success: false, message: 'Recording not found.' });
    }

    if (clientName !== undefined) recording.clientName = clientName;
    if (title !== undefined) recording.title = title;
    if (consultationDate !== undefined) recording.consultationDate = consultationDate;
    if (notes !== undefined) recording.notes = notes;
    if (category !== undefined) recording.category = category;

    await recording.save();
    await recording.populate('uploadedBy', 'name email');

    res.json({
      success: true,
      message: 'Recording updated successfully',
      data: { recording },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update recording.' });
  }
};

// DELETE /api/recordings/:id
const deleteRecording = async (req, res) => {
  try {
    const recording = await Recording.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!recording) {
      return res.status(404).json({ success: false, message: 'Recording not found.' });
    }

    const filePath = path.join(uploadsDir, recording.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await recording.deleteOne();

    res.json({ success: true, message: 'Recording deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete recording.' });
  }
};

module.exports = {
  createRecording,
  getRecordings,
  getStats,
  getRecordingById,
  updateRecording,
  deleteRecording,
};
