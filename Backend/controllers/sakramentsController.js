import Amasakramentu from '../mongoschema/sakramentsSchema.js'

// GET all sakraments
export const getAllSakraments = async (req, res) => {
  try {
    const sakraments = await Amasakramentu.find().select("_id name"); 
    res.status(200).json(sakraments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching sakraments" });
  }
};