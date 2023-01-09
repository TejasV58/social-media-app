const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../app')
const User = require('../models/user')
const Post = require('../models/posts')
const Comment = require('../models/comments')

const should = chai.should();
chai.use(chaiHttp)

let token1;
let user1_id;
let user1;

before((done) => {
    const newUserDetails = {
        userName: 'sampleUser1',
        email: 'user1@gmail.com',
        password: 'user123'
    }
    chai.request(server)
        .post('/api/register')
        .send(newUserDetails)
        .end((err,res) => {
            res.body.should.have.property('token')
            token1 = res.body.token
            user1_id = res.body.user._id
            user1 = User.findById(user1_id, ()=>{})
            res.should.have.status(201)
            done()
        })
})

after((done) => {
    User.findByIdAndDelete(user1_id, (err) => {})
    done()
})

// User related tests

describe('User Related Tests', () => {

    let user2_id;
    before((done) => {
        const newUserDetails = {
            userName: 'sampleUser2',
            email: 'user2@gmail.com',
            password: 'user123'
        }
        chai.request(server)
            .post('/api/register')
            .send(newUserDetails)
            .end((err,res) => {
                res.body.should.have.property('token')
                user2_id = res.body.user._id
                res.should.have.status(201)
                done()
            })
    })

    after((done) => {
        User.findByIdAndDelete(user2_id, (err) => {})
        done()
    })

    it("GET /api/user - Should fetch authenticated user details successfully", (done)=>{
        chai.request(server)
            .get('/api/user')
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('userName')
                res.body.should.have.property('followers')
                res.body.should.have.property('following')
                res.should.have.status(200)
                done()
            })
    })

    it("GET /api/user - Should fail to fetch unauthenticated user details", (done)=>{
        chai.request(server)
            .get('/api/user')
            .end((err,res) => {
                res.body.should.have.property('error')
                res.body.error.should.be.equal('Please Authenticate')
                res.should.have.status(401)
                done()
            })
    })

    it("POST /api/follow/:id - Authenticated user should follow user with given id", (done)=>{
        chai.request(server)
            .post(`/api/follow/${user2_id}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.text.should.equal("You are following the user!")
                res.should.have.status(200)
                done()
            })
    })
    it("POST /api/follow/:id - Authenticated user cant follow the user twice", (done)=>{
        chai.request(server)
            .post(`/api/follow/${user2_id}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.body.error.should.have.property('message')
                res.body.error.message.should.equal('You already follow this user')
                res.should.have.status(403)
                done()
            })
    })
    it("POST /api/follow/:id - Authenticated user can not follow user with wrong id", (done)=>{
        const randomId = Math.random().toString(36).slice(2)
        chai.request(server)
            .post(`/api/follow/${randomId}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.should.have.status(401)
                done()
            })
    })
    it("POST /api/follow/:id - Authenticated user cant follow themselves", (done)=>{
        chai.request(server)
            .post(`/api/follow/${user1_id}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.body.error.should.have.property('message')
                res.body.error.message.should.equal('You cannot follow yourself')
                res.should.have.status(403)
                done()
            })
    })

    it("POST /api/unfollow/:id - Authenticated user should unfollow user with given id", (done)=>{
        chai.request(server)
            .post(`/api/unfollow/${user2_id}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.text.should.equal("You unfollwed the user")
                res.should.have.status(200)
                done()
            })
    })
    it("POST /api/unfollow/:id - Authenticated user cant unfollow the user twice", (done)=>{
        chai.request(server)
            .post(`/api/unfollow/${user2_id}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.body.error.should.have.property('message')
                res.body.error.message.should.equal('You do not follow this user')
                res.should.have.status(403)
                done()
            })
    })
    it("POST /api/unfollow/:id - Authenticated user cannot unfollow user with wrong id", (done)=>{
        const randomId = Math.random().toString(36).slice(2)
        chai.request(server)
            .post(`/api/unfollow/${randomId}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.should.have.status(401)
                done()
            })
    })
    it("POST /api/unfollow/:id - Authenticated user cant unfollow themselves", (done)=>{
        chai.request(server)
            .post(`/api/unfollow/${user1_id}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.body.error.should.have.property('message')
                res.body.error.message.should.equal('You cannot unfollow')
                res.should.have.status(403)
                done()
            })
    })
})

// Post related tests
describe('Posts Realted Tests', () => {
    let user2_id;
    let token2;
    let post_id;
    before((done) => {
        const newUserDetails = {
            userName: 'sampleUser2',
            email: 'user2@gmail.com',
            password: 'user123'
        }
        chai.request(server)
            .post('/api/register')
            .send(newUserDetails)
            .end((err,res) => {
                res.body.should.have.property('token')
                token2 = res.body.token
                user2_id = res.body.user._id
                res.should.have.status(201)
                done()
            })
    })


    after((done) => {
        User.findByIdAndDelete(user2_id, () => {})
        Comment.deleteMany({}, ()=>{})
        done()
    })

    it('POST /api/posts - Should create post successfully', (done) => {
        const postData= {
            title: 'sample title',
            description: 'sample description'
        }
        chai.request(server)
            .post('/api/posts')
            .send(postData)
            .set('Authorization', `Bearer ${token2}`)
            .end((err,res) => {
                res.body.should.have.property('title')
                res.body.should.have.property('description')
                res.body.should.have.property('_id')
                res.body.should.have.property('createdAt')
                post_id = res.body._id
                res.should.have.status(201)
                done()
            })

    })

    it('POST /api/posts - Should not create post without description', (done) => {
        const postData= {
            title: 'sample title'
        }
        chai.request(server)
            .post('/api/posts')
            .send(postData)
            .set('Authorization', `Bearer ${token2}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.should.have.status(400)
                done()
            })
    })

    it('POST /api/posts - Should not create post without title', (done) => {
        const postData= {
            description: 'sample description'
        }
        chai.request(server)
            .post('/api/posts')
            .send(postData)
            .set('Authorization', `Bearer ${token2}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.should.have.status(400)
                done()
            })
    })

    it('POST /api/like/:id - Should like a post', (done) => {
        chai.request(server)
            .post(`/api/like/${post_id}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.text.should.be.equal('You liked this post')
                res.should.have.status(200)
                done()
            })
    })

    it('POST /api/like/:id - Should not like already liked post', (done) => {
        chai.request(server)
            .post(`/api/like/${post_id}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.body.error.should.have.property('message')
                res.body.error.message.should.be.equal('You already liked this post')
                res.should.have.status(403)
                done()
            })
    })

    it('POST /api/like/:id - Should not like unexisiting post id', (done) => {
        const randomId = Math.random().toString(36).slice(2)
        chai.request(server)
            .post(`/api/like/${randomId}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.body.error.should.have.property('name')
                res.body.error.name.should.be.equal('CastError')
                res.should.have.status(401)
                done()
            })
    })

    it('POST /api/unlike/:id - Should unlike a post', (done) => {
        chai.request(server)
            .post(`/api/unlike/${post_id}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.text.should.be.equal('You unliked this post')
                res.should.have.status(200)
                done()
            })
    })

    it('POST /api/unlike/:id - Should not unlike already unliked post', (done) => {
        chai.request(server)
            .post(`/api/unlike/${post_id}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.body.error.should.have.property('message')
                res.body.error.message.should.be.equal('Post is already unliked')
                res.should.have.status(403)
                done()
            })
    })

    it('POST /api/unlike/:id - Should not unlike unexisiting post id', (done) => {
        const randomId = Math.random().toString(36).slice(2)
        chai.request(server)
            .post(`/api/unlike/${randomId}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.body.error.should.have.property('name')
                res.body.error.name.should.be.equal('CastError')
                res.should.have.status(401)
                done()
            })
    })

    it('POST /api/comment/:id - Should comment on a post', (done) => {
        chai.request(server)
            .post(`/api/comment/${post_id}`)
            .send({ comment: 'test comment' })
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('comment_id')
                res.should.have.status(200)
                done()
            })
    })

    it('POST /api/comment/:id - Cannot comment on a unexisiting post id', (done) => {
        const randomId = Math.random().toString(36).slice(2)
        chai.request(server)
            .post(`/api/comment/${randomId}`)
            .send({ comment: 'test comment' })
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.body.error.should.have.property('name')
                res.body.error.name.should.be.equal('CastError')
                res.should.have.status(401)
                done()
            })
    })

    it('GET /api/posts/:id - Should fetch a post details of given id', (done) => {
        chai.request(server)
            .get(`/api/posts/${post_id}`)
            .end((err,res) => {
                res.body.should.have.property('title')
                res.body.should.have.property('description')
                res.body.should.have.property('likes')
                res.body.should.have.property('comments')
                res.body.likes.should.be.a('number')
                res.body.comments.should.be.a('array')
                res.should.have.status(200)
                done()
            })
    })


    it('GET /api/posts/:id - Should not fetch a post details of wrong post id', (done) => {
        const randomId = Math.random().toString(36).slice(2)
        chai.request(server)
            .get(`/api/posts/${randomId}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.body.error.should.have.property('name')
                res.body.error.name.should.be.equal('CastError')
                res.should.have.status(401)
                done()
            })
    })

    it('GET /api/all_posts - Should fetch all posts details of authenticated user', (done) => {
        chai.request(server)
            .get(`/api/all_posts`)
            .set('Authorization', `Bearer ${token2}`)
            .end((err,res) => {
                res.body.should.be.a('array')
                res.body[0].should.have.property('id')
                res.body[0].should.have.property('title')
                res.body[0].should.have.property('desc')
                res.body[0].should.have.property('likes')
                res.body[0].should.have.property('comments')
                res.body[0].should.have.property('created_at')
                res.should.have.status(200)
                done()
            })
    })

    it('GET /api/all_posts - Should not fetch all posts details of unauthenticated user', (done) => {
        chai.request(server)
            .get(`/api/all_posts`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.body.error.should.be.equal('Please Authenticate')
                res.should.have.status(401)
                done()
            })
    })


    it('DELETE /api/posts/:id - Should not delete post of other user', (done) => {
        chai.request(server)
            .delete(`/api/posts/${post_id}`)
            .set('Authorization', `Bearer ${token1}`)
            .end((err,res) => {
                res.body.should.have.property('error')
                res.body.error.should.have.property('message')
                res.body.error.message.should.be.equal('You cannot delete other users post')
                res.should.have.status(403)
                done()
            })
    })

    it('DELETE /api/posts/:id - Should delete post successfully', (done) => {
        chai.request(server)
            .delete(`/api/posts/${post_id}`)
            .set('Authorization', `Bearer ${token2}`)
            .end((err,res) => {
                res.text.should.be.equal('Post deleted successfully')
                res.should.have.status(200)
                done()
            })
    })

});

