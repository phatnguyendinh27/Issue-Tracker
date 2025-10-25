'use strict';

const { randomUUID } = require('crypto');

// Simple in-memory storage: { projectName: [ issues... ] }
const db = {};

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      const project = req.params.project;
      const issues = db[project] || [];

      // Apply filters from query string
      const query = req.query || {};
      let results = issues.filter(issue => {
        for (let k in query) {
          // convert boolean-like strings
          if (issue[k] === undefined) return false;
          let qv = query[k];
          if (typeof issue[k] === 'boolean') {
            qv = (qv === 'true' || qv === true);
          }
          if (String(issue[k]) !== String(qv)) return false;
        }
        return true;
      });

      res.json(results);
    })
    
    .post(function (req, res){
      const project = req.params.project;
      const body = req.body || {};

      const issue_title = body.issue_title;
      const issue_text = body.issue_text;
      const created_by = body.created_by;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = {
        _id: (randomUUID && randomUUID()) || (Date.now().toString(36) + Math.random().toString(36).slice(2)),
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: body.assigned_to || '',
        status_text: body.status_text || '',
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        open: true
      };

      if (!db[project]) db[project] = [];
      db[project].push(newIssue);

      res.json(newIssue);
    })
    
    .put(function (req, res){
      const project = req.params.project;
      const body = req.body || {};
      const _id = body._id;

      if (!_id) return res.json({ error: 'missing _id' });

      // Determine which fields are present to update (exclude _id)
      // Treat strings that are only whitespace as empty (not an update).
      const updateFields = Object.keys(body).filter(k => {
        if (k === '_id') return false;
        const v = body[k];
        if (v === undefined) return false;
        if (typeof v === 'string') {
          return v.trim() !== '';
        }
        // for non-strings (booleans, numbers) consider them valid updates
        return true;
      });
      if (updateFields.length === 0) return res.json({ error: 'no update field(s) sent', '_id': _id });

      const issues = db[project] || [];
      const idx = issues.findIndex(i => i._id === _id);
      if (idx === -1) return res.json({ error: 'could not update', '_id': _id });

      const issue = issues[idx];
      updateFields.forEach(f => {
        if (f === 'open') {
          // allow boolean updates
          issue.open = (body.open === 'false' || body.open === false) ? false : (body.open === 'true' || body.open === true) ? true : issue.open;
        } else if (f === 'issue_title' || f === 'issue_text' || f === 'created_by' || f === 'assigned_to' || f === 'status_text') {
          issue[f] = body[f];
        }
      });
      issue.updated_on = new Date().toISOString();

      res.json({ result: 'successfully updated', '_id': _id });
    })
    
    .delete(function (req, res){
      const project = req.params.project;
      const body = req.body || {};
      const _id = body._id;

      if (!_id) return res.json({ error: 'missing _id' });

      const issues = db[project] || [];
      const idx = issues.findIndex(i => i._id === _id);
      if (idx === -1) return res.json({ error: 'could not delete', '_id': _id });

      // remove
      issues.splice(idx, 1);
      res.json({ result: 'successfully deleted', '_id': _id });
    });
    
};
