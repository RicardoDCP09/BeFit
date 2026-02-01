const { Sequelize } = require('sequelize');
const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: isProduction ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
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
const WorkoutSession = require('./WorkoutSession')(sequelize);

// Associations
User.hasOne(HealthProfile, { foreignKey: 'userId', as: 'healthProfile' });
HealthProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Routine, { foreignKey: 'userId', as: 'routines' });
Routine.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ChatHistory, { foreignKey: 'userId', as: 'chatHistory' });
ChatHistory.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(WeightHistory, { foreignKey: 'userId', as: 'weightHistory' });
WeightHistory.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(WorkoutSession, { foreignKey: 'userId', as: 'workoutSessions' });
WorkoutSession.belongsTo(User, { foreignKey: 'userId' });

Routine.hasMany(WorkoutSession, { foreignKey: 'routineId', as: 'sessions' });
WorkoutSession.belongsTo(Routine, { foreignKey: 'routineId' });

module.exports = {
  sequelize,
  User,
  HealthProfile,
  Routine,
  ChatHistory,
  WeightHistory,
  WorkoutSession
};
