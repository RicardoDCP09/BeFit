const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HealthProfile = sequelize.define('HealthProfile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Weight in kg'
    },
    height: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Height in cm'
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true
    },
    activityLevel: {
      type: DataTypes.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
      allowNull: true,
      field: 'activity_level'
    },
    goal: {
      type: DataTypes.ENUM('lose_fat', 'gain_muscle', 'maintain', 'improve_health'),
      allowNull: true
    },
    bmi: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: 'Body Mass Index'
    },
    tmb: {
      type: DataTypes.DECIMAL(7, 2),
      allowNull: true,
      comment: 'Basal Metabolic Rate in kcal'
    },
    tdee: {
      type: DataTypes.DECIMAL(7, 2),
      allowNull: true,
      comment: 'Total Daily Energy Expenditure'
    },
    bodyFatPercentage: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      field: 'body_fat_percentage'
    }
  }, {
    tableName: 'health_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return HealthProfile;
};
