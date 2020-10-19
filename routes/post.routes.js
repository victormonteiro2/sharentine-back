const router = require("express").Router();
const mongoose = require("mongoose");
const passport = require("passport");
const { ObjectId } = require("mongoose").Types;

//Import the models
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");

//Create post:
router.post("/post/:userId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    console.log("Post BODY =>", req.body);
    const { userId } = req.params;

    const resultPost = await Post.create({ ...req.body, userId: userId });

    const resultUser = await User.findOneAndUpdate({ _id: userId }, { $push: { posts: resultPost._id } }, { new: true });

    console.log(resultPost);
    return res.status(201).json({ created: { resultPost, resultUser } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
});

//Read post:
router.get("/post", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const result = await Post.find()
      .populate("userId")
      .populate({ path: "comments", model: "Comment", populate: { path: "user", model: "User" } });

    if (result) {
      return res.status(200).json(result);
    }

    return res.status(404).json({ msg: "Document not found" });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

router.get("/post/:userId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    console.log("TESTE", req.params.userId);
    const id = req.params.userId;
    const result = await User.findOne({ _id: id }).populate({
      path: "posts",
      model: "Post",
      populate: { path: "comments", model: "Comment", populate: { path: "user", model: "User" } },
    });
    console.log("TESTANDO", result);
    if (result) {
      return res.status(200).json(result);
    }

    return res.status(404).json({ msg: "Document not found" });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

//Update post
router.patch("/post/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    console.log(req.body);

    const { id } = req.params;

    const result = await Post.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });

    console.log("Rota update", result);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/post/:userId/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    console.log(req.body);

    const { id, userId } = req.params;

    const result = await Post.deleteOne({ _id: id });

    // Atualiza a lista de tarefas do projeto pra retirar a tarefa deletada
    const updatedUser = await User.findOneAndUpdate({ _id: userId }, { $pull: { posts: { $in: [ObjectId(id)] } } });

    console.log(result);

    return res.status(200).json({});
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
