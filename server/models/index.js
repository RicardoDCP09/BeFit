const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const User = require('./User')(sequelize);
const HealthProfile = require('./HealthProfile')(sequelize);
const Routine = require('./Routine')(sequelize);
const ChatHistory = require('./ChatHistory')(sequelize);
const WeightHistory = require('./WeightHistory')(sequelize);

// Associations
User.hasOne(HealthProfile, { foreignKey: 'userId', as: 'healthProfile' });
HealthProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Routine, { foreignKey: 'userId', as: 'routines' });
Routine.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ChatHistory, { foreignKey: 'userId', as: 'chatHistory' });
ChatHistory.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(WeightHistory, { foreignKey: 'userId', as: 'weightHistory' });
WeightHistory.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  HealthProfile,
  Routine,
  ChatHistory,
  WeightHistory
};
