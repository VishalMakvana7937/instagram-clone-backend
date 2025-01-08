const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require("../middlewares/requireLogin");
const POST = mongoose.model("POST");

router.get("/allposts", requireLogin, (req, res) => {
    let limit = req.query.limit;
    let skip = req.query.skip;
    POST.find()
        .populate("postedBy", "_id name photo")
        .populate("comments.postedBy", "_id name")
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .sort("-createdAt")
        .then(posts => res.json(posts))
        .catch(err => console.log(err))
})

router.post("/createPost", requireLogin, (req, res) => {
    const { body, pic } = req.body;
    console.log(pic)

    if (!body || !pic) {
        return res.status(422).json({ error: "Please add all the fields" })
    }

    console.log(req.user)
    const post = new POST({
        body,
        photo: pic,
        postedBy: req.user
    })
    post.save().then((result) => {
        return res.json({ post: result })
    }).catch(err => console.log(err))

})

router.get("/myposts", requireLogin, (req, res) => {
    console.log(req.user);
    POST.find({ postedBy: req.user._id })
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .then(myposts => {
            res.json(myposts)
        })
})

// Assuming POST is the model you're working with, and requireLogin is middleware
router.put("/like", requireLogin, async (req, res) => {
    try {
        // Find and update the post to push the user's ID into the likes array
        const result = await POST.findByIdAndUpdate(
            req.body.postId, // Correct the key name to match the body parameter
            {
                $push: { likes: req.user._id }
            },
            { new: true } // Ensure the updated document is returned
        )
            .populate("postedBy", "_id name photo")

        return res.json(result);
    } catch (err) {
        // Handle any errors and return an appropriate response
        return res.status(422).json({ error: err.message });
    }
});

router.put("/unlike", requireLogin, async (req, res) => {
    try {
        const result = await POST.findByIdAndUpdate(
            req.body.postId, // Use `postId` instead of `postid`
            {
                $pull: { likes: req.user._id }
            },
            { new: true } // This will return the modified document instead of the original
        )
            .populate("postedBy", "_id name photo")

        // Send the updated post as a response
        return res.json(result);
    } catch (err) {
        return res.status(422).json({ error: err.message });
    }
});

router.put("/comment", requireLogin, async (req, res) => {
    const comment = {
        comment: req.body.text,
        postedBy: req.user._id
    }

    try {
        const result = await POST.findByIdAndUpdate(req.body.postId, {
            $push: { comments: comment }
        }, {
            new: true
        })
            .populate("comments.postedBy", "_id name")
            .populate("postedBy", "_id name")
            .populate("postedBy", "_id name photo")
        res.json(result);
    } catch (err) {
        return res.status(422).json({ error: err });
    }
});

router.delete("/deletePost/:postid", requireLogin, async (req, res) => {
    try {
        console.log(req.params.postid);  // Check the value of postid parameter

        // Find the post by its MongoDB _id, assuming the default id is _id
        const post = await POST.findById(req.params.postid).populate("postedBy", "_id");

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Ensure that the post is being deleted only by the user who created it
        if (post.postedBy._id.toString() === req.user._id.toString()) {
            // If the post belongs to the user, delete it
            await POST.findByIdAndDelete(req.params.postid);  // Deleting the post
            return res.json({ message: "Post deleted successfully" });
        }

        // If the user is not the creator, return a forbidden response
        res.status(403).json({ error: "You are not authorized to delete this post" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/myfollowing/post", requireLogin, async (req, res) => {
    POST.find({ postedBy: { $in: req.user.following } })
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .then((result) => {
            res.json(result);
        }).catch((err) => {
            res.status(500).json({ error: "Server error" });
        });
})

module.exports = router