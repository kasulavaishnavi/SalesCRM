const express = require('express');
  const {
      EmpByAdmin,       
      empLogin,      
      empLogout,        
      currentProfile,
      getAllEmployees,
       updateEmployee,
  deleteEmployee,  
  updateEmpProfile  
  } = require('../controllers/authController');
  const { isAuthenticated, } = require('../middleware/empMiddleware');

  const router = express.Router();

  //POST /api/auth/register-employee
  router.post('/register-employee', EmpByAdmin);

  //   POST /api/auth/login
  router.post('/login', empLogin);



  router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      });
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  });


  //   GET /api/auth/me
  router.get('/me', isAuthenticated, currentProfile);

  router.get('/all',  getAllEmployees);
  router.put("/update/:id", updateEmployee);
router.delete("/delete/:id", deleteEmployee);
router.put("/profile/update",isAuthenticated, updateEmpProfile);


  module.exports = router;