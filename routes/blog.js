const { Router } = require("express");
const router = Router();
const path=require("path")
const Blog=require("../models/blog")
const Comment=require("../models/comment")
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog_uploads",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });


router.get("/add-new",(req,res)=>{
    return res.render("addBlog",{
        user:req.user,
    })
})



router.get("/:id",async (req,res)=>{
    const blog =await Blog.findById(req.params.id).populate("createdBy");
    const comments=await Comment.find({blogId:req.params.id}).populate("createdBy")
    return res.render("blog",{
        user:req.user,
        blog,
        comments,
    })
})

router.post("/comment/:blogId",async (req,res)=>{
    const comment=await Comment.create({
        content:req.body.content,
        blogId:req.params.blogId,
        createdBy:req.user._id,
    })

    return res.redirect(`/blog/${req.params.blogId}`)

})


router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    console.log("File:", req.file);
    console.log("User:", req.user);

    const { title, body } = req.body;

    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user?._id,
      coverImage: req.file?.path,
    });

    return res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error("FULL ERROR:", err);
    return res.status(500).send(err.message);
  }
});


module.exports = router;