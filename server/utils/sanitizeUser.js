const sanitizeUser = (user) => {
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber,
    profileImage: user.profileImage,
    teamId: user.teamId,
    isActive: user.isActive,
    lastActive: user.lastActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export default sanitizeUser;