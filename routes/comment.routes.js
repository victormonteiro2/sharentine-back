const router = require("express").Router();
const mongoose = require("mongoose");
const passport = require("passport");
const { ObjectId } = require("mongoose").Types;

//Import the models
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");

//Create post:
router.post("/comment/:userId/:postId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    console.log("Comment BODY =>", req.body);

    const { userId } = req.params;

    const resultComment = await Comment.create({...req.body, user: userId});

    const resultPost = await Post.findOneAndUpdate({ _id: req.params.postId }, { $push: { comments: resultComment._id } }, { new: true });

    console.log(resultComment);
    return res.status(201).json({ created: { resultComment, resultPost } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
});

//Read post:
router.get("/comment", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const result = await Comment.find();

    if (result) {
      return res.status(200).json(result);
    }

    return res.status(404).json({ msg: "Document not found" });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

//Update post
router.patch("/comment/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    console.log(req.body);

    const { id } = req.params;

    const result = await Comment.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/comment/:postId/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    console.log(req.body);

    const { id, postId } = req.params;

    const result = await Comment.deleteOne({ _id: id });

    // Atualiza a lista de tarefas do projeto pra retirar a tarefa deletada
    const updatedPost = await Post.findOneAndUpdate({ _id: postId }, { $pull: { comments: { $in: [ObjectId(id)] } } });

    console.log(result);

    return res.status(200).json({});
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
