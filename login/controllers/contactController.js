const ContactUs = require('../models/contactUsModel');

exports.submitContactForm = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newEntry = await ContactUs.create({ firstName, lastName, email, message });

    return res.status(201).json({ message: 'Contact form submitted!', data: newEntry });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
