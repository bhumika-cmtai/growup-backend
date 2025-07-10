import express from "express";
import CountService from "../../services/count/count_services.js";

const router = express.Router();

// Get admin stats - counts of all data
router.get("/admin-stats", async (req, res) => {
  try {
    const stats = await CountService.getAdminStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;


