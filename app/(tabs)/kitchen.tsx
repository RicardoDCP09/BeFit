import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useKitchenStore } from '@/store/kitchenStore';
import { showAlert, showError } from '@/utils/alert';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type TabType = 'cook' | 'history';

export default function KitchenScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const {
    ingredients,
    summary,
    currentRecipe,
    recipeHistory,
    isAnalyzing,
    isGeneratingRecipe,
    isLoadingHistory,
    smartCook,
    generateRecipe,
    loadHistory,
    toggleFavorite,
    deleteRecipe,
    viewRecipe,
    clearIngredients,
    clearRecipe,
  } = useKitchenStore();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('cook');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory(showFavoritesOnly);
    }
  }, [activeTab, showFavoritesOnly]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permiso requerido', 'Necesitamos acceso a la cámara para escanear tu nevera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(result.assets[0].uri);
      try {
        await smartCook(result.assets[0].base64);
      } catch (err: any) {
        showError('Error', err.message || 'No se pudo analizar la imagen');
      }
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permiso requerido', 'Necesitamos acceso a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(result.assets[0].uri);
      try {
        await smartCook(result.assets[0].base64);
      } catch (err: any) {
        showError('Error', err.message || 'No se pudo analizar la imagen');
      }
    }
  };

  const handleReset = () => {
    showAlert(
      'Nueva Receta',
      '¿Quieres empezar de nuevo? Se perderá la receta actual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, empezar de nuevo',
          onPress: () => {
            setSelectedImage(null);
            clearIngredients();
            clearRecipe();
          },
        },
      ]
    );
  };

  const isLoading = isAnalyzing || isGeneratingRecipe;

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.loadingCard, { backgroundColor: colors.card }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingTitle, { color: colors.text }]}>
            {isAnalyzing ? 'Analizando ingredientes...' : 'Generando receta...'}
          </Text>
          <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>
            Nuestra IA está trabajando para ti
          </Text>
        </View>
      </View>
    );
  }

  if (currentRecipe) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Recipe Header */}
        <View style={[styles.recipeHeader, { backgroundColor: colors.primary }]}>
          <Text style={styles.recipeTitle}>{currentRecipe.name}</Text>
          <Text style={styles.recipeDescription}>{currentRecipe.description}</Text>
          <View style={styles.recipeMeta}>
            <View style={styles.metaItem}>
              <FontAwesome name="clock-o" size={14} color="#fff" />
              <Text style={styles.metaText}>
                {currentRecipe.prepTime} + {currentRecipe.cookTime}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <FontAwesome name="users" size={14} color="#fff" />
              <Text style={styles.metaText}>{currentRecipe.servings} porciones</Text>
            </View>
            <View style={styles.metaItem}>
              <FontAwesome name="signal" size={14} color="#fff" />
              <Text style={styles.metaText}>{currentRecipe.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* Nutrition Info */}
        <View style={[styles.nutritionCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Información Nutricional
          </Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: colors.primary }]}>
                {currentRecipe.nutrition.calories}
              </Text>
              <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                Calorías
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: colors.error }]}>
                {currentRecipe.nutrition.protein}
              </Text>
              <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                Proteína
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: colors.accent }]}>
                {currentRecipe.nutrition.carbs}
              </Text>
              <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                Carbos
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: colors.secondary }]}>
                {currentRecipe.nutrition.fat}
              </Text>
              <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                Grasas
              </Text>
            </View>
          </View>
        </View>

        {/* Explanation */}
        {currentRecipe.explanation && (
          <View style={[styles.explanationCard, { backgroundColor: colors.primary + '15' }]}>
            <FontAwesome name="lightbulb-o" size={20} color={colors.primary} />
            <Text style={[styles.explanationText, { color: colors.text }]}>
              {currentRecipe.explanation}
            </Text>
          </View>
        )}

        {/* Ingredients */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredientes</Text>
          {currentRecipe.ingredients.map((ing, index) => (
            <View key={index} style={styles.ingredientRow}>
              <FontAwesome name="check-circle" size={16} color={colors.success} />
              <Text style={[styles.ingredientText, { color: colors.text }]}>
                {ing.amount} {ing.item}
              </Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preparación</Text>
          {currentRecipe.instructions.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Tips */}
        {currentRecipe.tips && currentRecipe.tips.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>💡 Tips</Text>
            {currentRecipe.tips.map((tip, index) => (
              <Text key={index} style={[styles.tipText, { color: colors.textSecondary }]}>
                • {tip}
              </Text>
            ))}
          </View>
        )}

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.border }]}
          onPress={handleReset}
        >
          <FontAwesome name="camera" size={16} color={colors.primary} />
          <Text style={[styles.resetButtonText, { color: colors.primary }]}>
            Escanear otra nevera
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const renderCookTab = () => (
    <View style={styles.content}>
      <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
          <FontAwesome name="cutlery" size={48} color={colors.accent} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Cocina Inteligente
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Toma una foto de tu nevera o despensa y la IA generará una receta
          personalizada con los ingredientes disponibles
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={pickImage}
          >
            <FontAwesome name="camera" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Tomar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={pickFromGallery}
          >
            <FontAwesome name="image" size={20} color={colors.primary} />
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Galería
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <FontAwesome name="eye" size={20} color={colors.secondary} />
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            Detecta ingredientes automáticamente
          </Text>
        </View>
        <View style={styles.featureItem}>
          <FontAwesome name="heart" size={20} color={colors.error} />
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            Recetas adaptadas a tu perfil
          </Text>
        </View>
        <View style={styles.featureItem}>
          <FontAwesome name="calculator" size={20} color={colors.accent} />
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            Información nutricional incluida
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.historyContainer} contentContainerStyle={styles.historyContent}>
      {/* Filter Toggle */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !showFavoritesOnly && { backgroundColor: colors.primary },
            showFavoritesOnly && { borderColor: colors.border, borderWidth: 1 },
          ]}
          onPress={() => setShowFavoritesOnly(false)}
        >
          <Text style={[styles.filterText, { color: showFavoritesOnly ? colors.text : '#fff' }]}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showFavoritesOnly && { backgroundColor: colors.primary },
            !showFavoritesOnly && { borderColor: colors.border, borderWidth: 1 },
          ]}
          onPress={() => setShowFavoritesOnly(true)}
        >
          <FontAwesome name="heart" size={12} color={showFavoritesOnly ? '#fff' : colors.error} />
          <Text style={[styles.filterText, { color: showFavoritesOnly ? '#fff' : colors.text }]}>
            Favoritas
          </Text>
        </TouchableOpacity>
      </View>

      {isLoadingHistory ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : recipeHistory.length === 0 ? (
        <View style={[styles.emptyHistory, { backgroundColor: colors.card }]}>
          <FontAwesome name="book" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyHistoryText, { color: colors.textSecondary }]}>
            {showFavoritesOnly ? 'No tienes recetas favoritas' : 'Aún no has generado recetas'}
          </Text>
          <TouchableOpacity
            style={[styles.goToCookButton, { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('cook')}
          >
            <Text style={styles.goToCookText}>Crear mi primera receta</Text>
          </TouchableOpacity>
        </View>
      ) : (
        recipeHistory.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.historyCard, { backgroundColor: colors.card }]}
            onPress={() => {
              viewRecipe(item.recipe);
              setActiveTab('cook');
            }}
          >
            <View style={styles.historyCardHeader}>
              <Text style={[styles.historyRecipeName, { color: colors.text }]} numberOfLines={1}>
                {item.recipe.name}
              </Text>
              <View style={styles.historyActions}>
                <TouchableOpacity
                  onPress={() => toggleFavorite(item.id)}
                  style={styles.historyActionButton}
                >
                  <FontAwesome
                    name={item.isFavorite ? 'heart' : 'heart-o'}
                    size={18}
                    color={item.isFavorite ? colors.error : colors.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    showAlert(
                      'Eliminar receta',
                      '¿Estás seguro de que quieres eliminar esta receta?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Eliminar', style: 'destructive', onPress: () => deleteRecipe(item.id) },
                      ]
                    );
                  }}
                  style={styles.historyActionButton}
                >
                  <FontAwesome name="trash-o" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.historyRecipeDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.recipe.description}
            </Text>
            <View style={styles.historyMeta}>
              <View style={styles.historyMetaItem}>
                <FontAwesome name="clock-o" size={12} color={colors.textSecondary} />
                <Text style={[styles.historyMetaText, { color: colors.textSecondary }]}>
                  {item.recipe.prepTime}
                </Text>
              </View>
              <View style={styles.historyMetaItem}>
                <FontAwesome name="fire" size={12} color={colors.primary} />
                <Text style={[styles.historyMetaText, { color: colors.textSecondary }]}>
                  {item.recipe.nutrition?.calories || '---'} kcal
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Selector */}
      <View style={[styles.tabSelector, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cook' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('cook')}
        >
          <FontAwesome
            name="camera"
            size={16}
            color={activeTab === 'cook' ? '#fff' : colors.textSecondary}
          />
          <Text style={[styles.tabText, { color: activeTab === 'cook' ? '#fff' : colors.textSecondary }]}>
            Cocinar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('history')}
        >
          <FontAwesome
            name="book"
            size={16}
            color={activeTab === 'history' ? '#fff' : colors.textSecondary}
          />
          <Text style={[styles.tabText, { color: activeTab === 'history' ? '#fff' : colors.textSecondary }]}>
            Mis Recetas
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'cook' ? renderCookTab() : renderHistoryTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  loadingCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  emptyState: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    marginTop: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
  },
  recipeHeader: {
    padding: 24,
    paddingTop: 16,
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#fff',
  },
  nutritionCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  nutritionLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  explanationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  explanationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  ingredientText: {
    fontSize: 15,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabSelector: {
    flexDirection: 'row',
    margin: 16,
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyContainer: {
    flex: 1,
  },
  historyContent: {
    padding: 16,
    paddingBottom: 32,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyHistory: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  goToCookButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  goToCookText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  historyCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyRecipeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  historyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  historyActionButton: {
    padding: 4,
  },
  historyRecipeDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  historyMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  historyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyMetaText: {
    fontSize: 12,
  },
});
