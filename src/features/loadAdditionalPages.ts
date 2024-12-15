import { Product } from "../interfaces/Interface";
import fetchProductsForPage from "./fetchProductsForPage";
import { Dispatch, SetStateAction } from "react";


export default async function loadAdditionalPages(
  pagesToLoad: number[], 
  setLoading: Dispatch<SetStateAction<boolean>>,
  rowsToSelect: number, 
  selectedProducts: { [key: number]: Product }, 
  setSelectedProducts: Dispatch<SetStateAction<{ [key: number]: Product }>>,
  setPagesToLoad: Dispatch<SetStateAction<number[]>>
) {
  if (pagesToLoad.length > 0) {
    const pageToLoad = pagesToLoad[0];
    const { products: fetchedProducts } = await fetchProductsForPage(
      pageToLoad,
      setLoading
    );

    // Select first N rows from the fetched page
    const rowsToSelectOnPage = Math.min(
      rowsToSelect - Object.keys(selectedProducts).length,
      fetchedProducts.length
    );

    // Accumulator is typed as { [key: number]: Product }
    const newSelectedProducts = fetchedProducts
      .slice(0, rowsToSelectOnPage)
      .reduce(
        (acc: any, product: Product) => ({
          ...acc,
          [product.id]: product,
        }),
        {}
      );

    setSelectedProducts((prev) => ({
      ...prev,
      ...newSelectedProducts,
    }));

    // Remove the loaded page from pagesToLoad
    setPagesToLoad((prev) => prev.slice(1));
  }
}
