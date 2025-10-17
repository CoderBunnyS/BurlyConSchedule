const axios = require('axios');

class FusionAuthService {
  constructor() {
    this.baseURL = process.env.FUSIONAUTH_DOMAIN;
    this.apiKey = process.env.FUSIONAUTH_USER_API_KEY;
  }

  async getUserById(userId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/user/${userId}`,
        {
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      console.error(`Failed to get user ${userId}:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserPhone(userId) {
    try {
      const result = await this.getUserById(userId);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      const user = result.user;
      
      // Set user phone number
      const phone = user.mobilePhone || user.phoneNumber || user.phone;
      
      if (!phone) {
        return { 
          success: false, 
          error: 'No phone number found for user',
          user: { email: user.email, firstName: user.firstName }
        };
      }

      return {
        success: true,
        phone: phone,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
      
    } catch (error) {
      console.error(`Error getting phone for user ${userId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUsersPhones(userIds) {
    try {
      const results = await Promise.all(
        userIds.map(async (userId) => {
          const result = await this.getUserPhone(userId);
          return {
            userId,
            ...result
          };
        })
      );

      // Filter results
      const validUsers = results.filter(result => result.success);
      const failedUsers = results.filter(result => !result.success);

      console.log(`Phone lookup results: ${validUsers.length} success, ${failedUsers.length} failed`);
      
      if (failedUsers.length > 0) {
        console.log('Failed phone lookups:', failedUsers.map(f => ({ userId: f.userId, error: f.error })));
      }

      return {
        success: true,
        validUsers,
        failedUsers,
        stats: {
          total: userIds.length,
          withPhone: validUsers.length,
          withoutPhone: failedUsers.length
        }
      };
      
    } catch (error) {
      console.error('Bulk phone lookup failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new FusionAuthService();