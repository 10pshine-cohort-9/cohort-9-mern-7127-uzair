const Note = require('../models/Note');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

const createNote = async (req,res) => {
    try {
        const {title,content} = req.body;
        
        if(!title || !content){
            return res.status(400).json({message: "Please Provide Title and Content!"});
        }

        const note = await Note.create({title,content, user: req.user.id});

        return res.status(201).json(note);
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
}


const getNotes = async (req,res) => {
    try {
        const id = req.user.id;
        const Notes = await Note.find({user: id});
        return res.status(200).json(Notes);
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
}


const updateNote = async (req, res) => {
    try {
        const { id } = req.params;

        if(!mongoose.isObjectIdOrHexString(id)){
            return res.status(400).json({message: "Invalid Note ID!"});
        }

        const note = await Note.findOne({ _id: id });

        if (!note) {
            return res.status(404).json({ message: "Note Not Found!" });
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not Authorized!" });
        }

        const { title, content } = req.body;

        note.title = title || note.title;
        note.content = content || note.content;

        await note.save();

        return res.status(200).json(note);
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
}

const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;

        if(!mongoose.isObjectIdOrHexString(id)){
            return res.status(400).json({message: "Invalid Note ID!"});
        }

        const note = await Note.findOne({ _id: id });

        if (!note) {
            return res.status(404).json({ message: "Note Not Found!" });
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not Authorized!" });
        }

        await Note.deleteOne({ _id: id });

        return res.status(200).json({ message: "Note deleted successfully!" });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = { createNote, getNotes, updateNote, deleteNote };