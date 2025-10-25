const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
	let id1 = null;
	let id2 = null;

	suite('POST /api/issues/{project} => create issues', function() {
		test('Create an issue with every field', function(done) {
			chai.request(server)
				.post('/api/issues/test')
				.send({
					issue_title: 'Title',
					issue_text: 'text',
					created_by: 'Functional Test',
					assigned_to: 'Chai',
					status_text: 'In QA'
				})
				.end(function(err, res){
					assert.equal(res.status, 200);
					assert.property(res.body, 'issue_title');
					assert.property(res.body, 'issue_text');
					assert.property(res.body, 'created_by');
					assert.property(res.body, 'assigned_to');
					assert.property(res.body, 'status_text');
					assert.property(res.body, 'created_on');
					assert.property(res.body, 'updated_on');
					assert.property(res.body, 'open');
					assert.property(res.body, '_id');
					id1 = res.body._id;
					done();
				});
		});

		test('Create an issue with only required fields', function(done) {
			chai.request(server)
				.post('/api/issues/test')
				.send({
					issue_title: 'Required',
					issue_text: 'Only required fields',
					created_by: 'Tester'
				})
				.end(function(err, res){
					assert.equal(res.status, 200);
					assert.property(res.body, '_id');
					id2 = res.body._id;
					done();
				});
		});

		test('Create an issue with missing required fields', function(done) {
			chai.request(server)
				.post('/api/issues/test')
				.send({issue_title: 'Missing'})
				.end(function(err, res){
					assert.equal(res.status, 200);
					assert.property(res.body, 'error');
					done();
				});
		});
	});

	suite('GET /api/issues/{project} => view issues', function() {
		test('View issues on a project', function(done) {
			chai.request(server)
				.get('/api/issues/test')
				.end(function(err, res){
					assert.equal(res.status, 200);
					assert.isArray(res.body);
					done();
				});
		});

		test('View issues on a project with one filter', function(done) {
			chai.request(server)
				.get('/api/issues/test')
				.query({open: true})
				.end(function(err, res){
					assert.equal(res.status, 200);
					assert.isArray(res.body);
					done();
				});
		});

		test('View issues on a project with multiple filters', function(done) {
			chai.request(server)
				.get('/api/issues/test')
				.query({open: true, issue_title: 'Title'})
				.end(function(err, res){
					assert.equal(res.status, 200);
					assert.isArray(res.body);
					done();
				});
		});
	});

	suite('PUT /api/issues/{project} => update issues', function() {
		test('Update one field on an issue', function(done) {
			chai.request(server)
				.put('/api/issues/test')
				.send({_id: id1, issue_text: 'Updated text'})
				.end(function(err, res){
					assert.equal(res.status, 200);
					assert.property(res.body, 'result');
					done();
				});
		});

		test('Update an issue with missing _id', function(done) {
			chai.request(server)
				.put('/api/issues/test')
				.send({issue_text: 'No id'})
				.end(function(err, res){
					assert.equal(res.status, 200);
					assert.property(res.body, 'error');
					done();
				});
		});

		test('Update an issue with no fields to update', function(done) {
			chai.request(server)
				.put('/api/issues/test')
				.send({_id: id1})
				.end(function(err, res){
					assert.equal(res.status, 200);
					assert.property(res.body, 'error');
					done();
				});
		});

		test('Update an issue with an invalid _id', function(done) {
			chai.request(server)
				.put('/api/issues/test')
				.send({_id: 'invalidid123', issue_text: 'Won\'t work'})
				.end(function(err, res){
					assert.equal(res.status, 200);
					assert.property(res.body, 'error');
					done();
				});
		});
	});

	suite('DELETE /api/issues/{project} => delete issues', function() {
		test('Delete an issue', function(done) {
			chai.request(server)
				.delete('/api/issues/test')
				.send({_id: id2})
				.end(function(err, res){
					assert.equal(res.status, 200);
					assert.property(res.body, 'result');
					done();
				});
		});

		test('Delete an issue with an invalid _id', function(done) {
			chai.request(server)
				.delete('/api/issues/test')
				.send({_id: '1234invalidid'})
				.end(function(err, res){
					assert.equal(res.status, 200);
					assert.property(res.body, 'error');
					done();
				});
		});

		test('Delete an issue with missing _id', function(done) {
			chai.request(server)
				.delete('/api/issues/test')
				.send({})
				.end(function(err, res){
					assert.equal(res.status, 200);
					assert.property(res.body, 'error');
					done();
				});
		});
	});

});

