const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WeightHistory = sequelize.define('WeightHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'weight_histories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id', 'date'],
        unique: true
      }
    ]
  });

  return WeightHistory;
};
