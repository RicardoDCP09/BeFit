const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RecipeHistory = sequelize.define('RecipeHistory', {
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
    recipe: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Full recipe object with name, ingredients, instructions, etc.'
    },
    ingredients: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Original ingredients detected from image'
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_favorite'
    }
  }, {
    tableName: 'recipe_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return RecipeHistory;
};
