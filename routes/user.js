const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require("../middlewares/requireLogin");
const POST = mongoose.model("POST");
const USER = mongoose.model("INSTAUSER");

router.get("/user/:id", async (req, res) => {
    USER.findOne({ _id: req.params.id })
        .select("-password")
        .then(user => {
            POST.find({ postedBy: req.params.id })
                .populate("postedBy", "_id ")
                .then(post => {
                    res.json({ user, post });
                })
                .catch(err => {
                    return res.status(422).json({ error: err });
                })
        })
        .catch(err => {
            return res.status(422).json({ error: "User not found" });
        });
})

router.put("/follow", requireLogin, async (req, res) => {
    try {
        // Update the followers list for the user being followed
        const followResult = await USER.findByIdAndUpdate(
            req.body.followId,
            { $push: { followers: req.user._id } },
            { new: true }
        );

        // Update the following list for the logged-in user
        const followingResult = await USER.findByIdAndUpdate(
            req.user._id,
            { $push: { following: req.body.followId } },
            { new: true }
        );

        // Send the response with the updated user info
        res.json(followingResult);
    } catch (err) {
        console.error(err);
        return res.status(422).json({ error: "Follow failed" });
    }
});


router.put("/unfollow", requireLogin, async (req, res) => {
    try {
        // Update the user's followers array to remove the current user
        const result1 = await USER.findByIdAndUpdate(
            req.body.followId,
            { $pull: { followers: req.user._id } },
            { new: true }
        );

        if (!result1) {
            return res.status(422).json({ error: "Follow failed" });
        }

        // Update the current user's following array to remove the followee
        const result2 = await USER.findByIdAndUpdate(
            req.user._id,
            { $pull: { following: req.body.followId } },
            { new: true }
        );

        if (!result2) {
            return res.status(422).json({ error: "Unfollow failed" });
        }

        res.json(result2);  // Send the updated user data back in the response

    } catch (err) {
        console.log(err);
        return res.status(422).json({ error: "Unfollow failed" });
    }
});

router.put("/uploadprofilepic", requireLogin, async (req, res) => {
    USER.findByIdAndUpdate(req.user._id, {
        $set: { photo: req.body.pic }
    }, {
        new: true
    })
        .then(user => {
            res.json(user)
        })
        .catch(err => {
            console.log(err);
        })
})

module.exports = router;