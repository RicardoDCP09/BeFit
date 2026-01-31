// BMI Calculation
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}

export function getBMIColor(bmi: number): string {
  if (bmi < 18.5) return '#FFA726'; // Orange
  if (bmi < 25) return '#4CAF50'; // Green
  if (bmi < 30) return '#FFA726'; // Orange
  return '#F44336'; // Red
}

// TMB Calculation (Mifflin-St Jeor)
export function calculateTMB(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female' | 'other'
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

// TDEE Calculation
export function calculateTDEE(
  tmb: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return tmb * multipliers[activityLevel];
}

// Body Fat Percentage (simplified formula)
export function calculateBodyFat(
  bmi: number,
  age: number,
  gender: 'male' | 'female' | 'other'
): number {
  if (gender === 'male') {
    return 1.2 * bmi + 0.23 * age - 16.2;
  }
  return 1.2 * bmi + 0.23 * age - 5.4;
}

// Calculate all metrics
export function calculateAllMetrics(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female' | 'other',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
) {
  const bmi = calculateBMI(weight, height);
  const tmb = calculateTMB(weight, height, age, gender);
  const tdee = calculateTDEE(tmb, activityLevel);
  const bodyFat = calculateBodyFat(bmi, age, gender);

  return {
    bmi: parseFloat(bmi.toFixed(2)),
    bmiCategory: getBMICategory(bmi),
    bmiColor: getBMIColor(bmi),
    tmb: parseFloat(tmb.toFixed(2)),
    tdee: parseFloat(tdee.toFixed(2)),
    bodyFatPercentage: parseFloat(bodyFat.toFixed(2)),
  };
}

// Activity level labels
export const activityLevelLabels = {
  sedentary: 'Sedentario (poco o nada de ejercicio)',
  light: 'Ligero (1-3 días/semana)',
  moderate: 'Moderado (3-5 días/semana)',
  active: 'Activo (6-7 días/semana)',
  very_active: 'Muy activo (atleta)',
};

// Goal labels
export const goalLabels = {
  lose_fat: 'Perder grasa',
  gain_muscle: 'Ganar músculo',
  maintain: 'Mantener peso',
  improve_health: 'Mejorar salud',
};
