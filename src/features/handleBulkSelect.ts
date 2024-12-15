import { Product } from "../interfaces/Interface";

export default function handleBulkSelect(
  rowsToSelect: number,
  products: Product[],
  setSelectedProducts: React.Dispatch<
    React.SetStateAction<{ [key: number]: Product }>
  >,
  setPagesToLoad: React.Dispatch<React.SetStateAction<number[]>>,
  page: number
){
  // Reset selected products
  setSelectedProducts({});

  // First, select rows from the current page
  const rowsToSelectOnCurrentPage = Math.min(rowsToSelect, products.length);
  const initialSelectedProducts = products
    .slice(0, rowsToSelectOnCurrentPage)
    .reduce(
      (acc, product) => ({
        ...acc,
        [product.id]: product,
      }),
      {}
    );

  // If we need more rows, prepare to load additional pages
  if (rowsToSelect > rowsToSelectOnCurrentPage) {
    const additionalRowsNeeded = rowsToSelect - rowsToSelectOnCurrentPage;
    const pagesToLoadForSelection = Math.ceil(additionalRowsNeeded / 5);

    // Create array of pages to load
    const additionalPages = Array.from(
      { length: pagesToLoadForSelection },
      (_, i) => page + i + 1
    );

    setPagesToLoad(additionalPages);
  }

  // Set initial selected products from current page
  setSelectedProducts(initialSelectedProducts);
};
