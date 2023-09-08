//jshint esversion:6
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const db = "todolistDB";
const uri = `mongodb+srv://admin-ajay:mdbi24oct65@todolist.8t6izc1.mongodb.net/${db}`;

main().catch((err) => console.log(err));

async function main() {
    await mongoose.connect(uri, { useNewUrlParser: true });
}

const choreSchema = new mongoose.Schema({
    name: String,
});

const listSchema = new mongoose.Schema({
    name: String,
    chores: [choreSchema],
});

const Chore = new mongoose.model("chore", choreSchema);
const List = new mongoose.model("List", listSchema);

app.get("/", async (req, res) => {
    const lists = await List.find({});
    if (lists.length != 0) {
        res.render("index.ejs", { lists: lists });
    } else {
        res.render("index.ejs", { message: "You haven't made any list yet!" });
    }
});

app.post("/list/:listName/addChores", async (req, res) => {
    const addChore = new Chore({
        name: req.body.addChore,
    });
    const foundList = await List.findOne({ name: req.params.listName }).exec();
    if (foundList) {
        foundList.chores.push(addChore);
        await foundList.save();
        res.redirect(`/list/${req.params.listName}`);
    } else {
        console.log("No list found! (addChores)");
    }
});

app.post("/list/:listName/delete", async (req, res) => {
    const foundList = await List.findOne({ name: req.params.listName }).exec();
    if (foundList) {
        foundList.chores.id(req.body.checkbox).deleteOne();
        await foundList.save();
    }
    res.redirect(`/list/${req.params.listName}`);
});

app.post("/deleteList", async (req, res) => {
    await List.findByIdAndDelete(req.body.list);
    res.redirect("/");
});

app.post("/newList", async (req, res) => {
    const newListName = req.body.newList;
    const list = new List({
        name: newListName,
    });
    await list.save();
    res.redirect(`/list/${newListName}`);
});

app.get("/list/:customListName", async (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    const foundList = await List.findOne({
        name: customListName,
    });
    if (foundList) {
        res.render("list.ejs", {
            listTitle: foundList.name,
            chores: foundList.chores,
        });
    } else {
        console.log("No List found! (customListName)");
    }
});

var port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, () => {
    console.log(`server is running successfully!`);
});
