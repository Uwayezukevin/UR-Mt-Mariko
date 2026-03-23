import Event from '../mongoschema/eventschema.js'

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, members } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      members: members || [],
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate({
        path: "members",
        select: "fullName category gender",
        populate: [
          { path: "subgroup", select: "name" },
          { path: "sakraments", select: "name" }
        ]
      });
    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: "members",
        select: "-nationalId",
        populate: [
          { path: "subgroup", select: "name" },
          { path: "sakraments", select: "name" },
          { path: "parent", select: "fullName category" },
          { path: "spouse", select: "fullName category" }
        ],
      });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (new Date(event.date) <= new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot update an event that has already happened" });
    }

    Object.assign(event, req.body);
    await event.save();

    res.status(200).json({ message: "Event updated", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (new Date(event.date) <= new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot delete an event that has already happened" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};