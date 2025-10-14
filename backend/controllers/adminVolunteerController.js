const User = require("../models/User");
const Shift = require("../models/FlexibleShift");
const fusionAuthService = require("../utils/fusionAuthService");

exports.getUserPhone = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await fusionAuthService.getUserPhone(user.fusionAuthId);
    
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({ 
      mobilePhone: result.phone
    });
  } catch (error) {
    console.error('Error fetching user phone:', error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
};