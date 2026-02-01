const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WorkoutSession = sequelize.define('WorkoutSession', {
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
    routineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'routine_id',
      references: {
        model: 'routines',
        key: 'id'
      }
    },
    dayName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'day_name',
      comment: 'Day of the week (Lunes, Martes, etc.)'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_time',
      defaultValue: DataTypes.NOW
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'end_time'
    },
    totalDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'total_duration',
      comment: 'Total duration in seconds'
    },
    exercisesCompleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'exercises_completed',
      defaultValue: 0
    },
    exerciseData: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'exercise_data',
      defaultValue: [],
      comment: 'Array of exercise session data with times'
    },
    restTimeUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'rest_time_used',
      defaultValue: 60,
      comment: 'Rest time in seconds configured by user'
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_completed',
      defaultValue: false
    }
  }, {
    tableName: 'workout_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return WorkoutSession;
};
