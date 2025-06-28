import express from "express";
import LinkService from "../../services/link/link_services.js"
import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";

const router = express.Router();

router.post('/add', async (req, res) => {
  try {
    const { portalName, link } = req.body;


    const newLink = await LinkService.createLink(req.body);

    return ResponseManager.sendSuccess(res, newLink, 201, 'Link created successfully');

  } catch (err) {

    if (err.code === 11000) {
      consoleManager.error(`Creation failed: portalName '${req.body.portalName}' already exists.`);
      return ResponseManager.sendError(res, 409, 'CONFLICT', `The portal name '${req.body.portalName}' is already in use.`);
    }
    consoleManager.error(`Error in /add link route: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Error creating link.');
  }
});


router.get('/portal/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return ResponseManager.handleBadRequestError(res, 'Slug parameter is required.');
    }

    const linkData = await LinkService.getLinkByPortalName(slug);

    if (!linkData) {
      return ResponseManager.sendError(res, 404, 'NOT_FOUND', `Link for '${slug}' not found.`);
    }
    return ResponseManager.sendSuccess(res, linkData, 200, 'Link fetched successfully');
    
  } catch (err) {
    consoleManager.error(`Error in /:slug link route: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Error fetching link data.');
  }
});


router.get('/all', async (req, res) => {
  console.log("all link fetch")
    try {
      const allLinks = await LinkService.getAllLinks();
      console.log(allLinks)
  
      return ResponseManager.sendSuccess(res, allLinks, 200, 'All links fetched successfully');
  
    } catch (err) {
      consoleManager.error(`Error in /all link route: ${err.message}`);
      return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Error fetching all links.');
    }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return ResponseManager.handleBadRequestError(res, 'Request body cannot be empty for an update.');
    }

    const updatedLink = await LinkService.updateLinkById(id, updateData);

    if (!updatedLink) {
      return ResponseManager.sendError(res, 404, 'NOT_FOUND', `Link with ID '${id}' not found.`);
    }
    return ResponseManager.sendSuccess(res, updatedLink, 200, 'Link updated successfully');

  } catch (err) {
    if (err.statusCode === 409) {
      return ResponseManager.sendError(res, 409, 'CONFLICT', err.message);
    }
    consoleManager.error(`Error in /:id link route: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Error updating link data.');
  }
});

export default router;