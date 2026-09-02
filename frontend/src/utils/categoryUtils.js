// Trouve le slug de catégorie à partir de la sous-catégorie.

export function getCategorySlugFromSubCategory(subCategoryId, subCategories, categories) {
    const subCat = subCategories.find(sc => sc.id === subCategoryId);
    if (!subCat) return "autres";

    const parentCat = categories.find(c => c.id === subCat.categories_id);
    return parentCat ? parentCat.slug : "autres";
}

// Retourne les sous-catégories d'une catégorie (pour la page catégorie).

export function getSubCategoriesForCategory(categoryId, subCategories) {
    return subCategories.filter(sc => sc.categories_id === categoryId);
}
