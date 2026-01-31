const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChatHistory = sequelize.define('ChatHistory', {
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
    messages: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of chat messages with role and content'
    },
    mood: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Detected mood from conversation'
    },
    sessionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'session_date',
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'chat_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ChatHistory;
};
