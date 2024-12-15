import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SelectButton, SelectButtonChangeEvent } from "primereact/selectbutton";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import { Checkbox } from "primereact/checkbox";
import fetchProductsForPage from "../features/fetchProductsForPage";
import loadAdditionalPages from "../features/loadAdditionalPages";
import handleBulkSelect from "../features/handleBulkSelect";
import { Product, SizeOption } from "../interfaces/Interface";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";

export default function ArtworkTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const op = useRef<OverlayPanel>(null);
  // State to manage selected rows across pages
  const [selectedProducts, setSelectedProducts] = useState<{
    [key: number]: Product;
  }>({});

  const [sizeOptions] = useState<SizeOption[]>([
    { label: "Small", value: "small" },
    { label: "Normal", value: "normal" },
    { label: "Large", value: "large" },
  ]);
  const [size, setSize] = useState<"small" | "normal" | "large">(
    sizeOptions[0].value
  );

  // New states for row selection
  const [rowsToSelect, setRowsToSelect] = useState<number>(1);
  const [pagesToLoad, setPagesToLoad] = useState<number[]>([]);
  // Fetch products for a specific page

  // Main fetch effect for the current page
  useEffect(() => {
    const fetchProducts = async () => {
      const { products: fetchedProducts, total } = await fetchProductsForPage(
        page,
        setLoading
      );
      setProducts(fetchedProducts);
      setTotalRecords(total);
    };
    fetchProducts();
  }, [page]);

  // Effect to handle loading additional pages for selection
  useEffect(() => {
    if (pagesToLoad.length > 0) {
      loadAdditionalPages(
        pagesToLoad,
        setLoading,
        rowsToSelect,
        selectedProducts,
        setSelectedProducts,
        setPagesToLoad
      );
    }
  }, [pagesToLoad, rowsToSelect, selectedProducts]);

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setPage(event.page + 1);
  };

  // Handle individual row selection
  const onRowSelect = (product: Product) => {
    setSelectedProducts((prev) => ({ ...prev, [product.id]: product }));
  };

  // Handle individual row unselection
  const onRowUnselect = (product: Product) => {
    const { [product.id]: removed, ...rest } = selectedProducts;
    setSelectedProducts(rest);
  };

  // Custom checkbox for row selection
  const rowSelectionCheckbox = (rowData: Product) => {
    return (
      <Checkbox
        className="border-2 pb-[21px] border-grey-900 rounded-lg"
        checked={!!selectedProducts[rowData.id]}
        onChange={(e) => {
          e.checked ? onRowSelect(rowData) : onRowUnselect(rowData);
        }}
      />
    );
  };

  // Custom header checkbox to select/deselect all rows on current page
  const headerSelectionCheckbox = () => {
    const allCurrentPageSelected = products.every(
      (product) => selectedProducts[product.id]
    );

    return (
      <Checkbox
        className="border-2 pb-[21px] border-grey-900 rounded-lg"
        checked={products.length > 0 && allCurrentPageSelected}
        onChange={(e) => {
          if (e.checked) {
            // Select all rows on current page
            const newSelectedProducts = products.reduce(
              (acc, product) => ({
                ...acc,
                [product.id]: product,
              }),
              {}
            );
            setSelectedProducts((prev) => ({
              ...prev,
              ...newSelectedProducts,
            }));
          } else {
            // Unselect all rows on current page
            const newSelectedProducts = { ...selectedProducts };
            products.forEach((product) => {
              delete newSelectedProducts[product.id];
            });
            setSelectedProducts(newSelectedProducts);
          }
        }}
      />
    );
  };
  const showOverlay = (event: React.SyntheticEvent) => {
    op.current?.toggle(event);
  };
  return (
    <div className="p-4">
      <div className="">
        <p>No of Selected Rows: {Object.keys(selectedProducts).length}</p>
      </div>
      <div className="flex justify-center items-center mb-4">
        <SelectButton
          value={size}
          onChange={(e: SelectButtonChangeEvent) => setSize(e.value)}
          options={sizeOptions}
        />
      </div>
      <div className="card">
        <div className="mb-4 ml-44">
          <Button
            type="button"
            icon="pi pi-chevron-down"
            label="Select multiple row"
            onClick={showOverlay}
          />
          <OverlayPanel ref={op}>
            <div className="flex items-center gap-2">
              <label>Select Rows:</label>
              <input
                type="number"
                value={rowsToSelect}
                onChange={(e) => setRowsToSelect(Number(e.target.value))}
                min="1"
                className="w-20 p-1 border rounded"
              />
              <button
                onClick={() =>
                  handleBulkSelect(
                    rowsToSelect,
                    products,
                    setSelectedProducts,
                    setPagesToLoad,
                    page
                  )
                }
                className="bg-blue-500 text-white px-4 py-1 rounded"
              >
                Select Rows
              </button>
            </div>
          </OverlayPanel>
        </div>
      </div>
      <div className="card">
        <DataTable
          stripedRows
          value={products}
          rows={10}
          size={size}
          loading={loading}
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            header={headerSelectionCheckbox}
            body={rowSelectionCheckbox}
            headerClassName="w-[50px]"
            bodyClassName="w-[50px]"
          />

          <Column field="title" header="Title" />

          <Column field="place_of_origin" header="Place of Origin" />
          <Column field="artist_display" header="Artist Display" />
          <Column field="inscriptions" header="Inscriptions" />
          <Column field="date_start" header="Date Start" />
          <Column field="date_end" header="Date End" />
        </DataTable>
        <Paginator
          first={(page - 1) * 10}
          rows={10}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          className="mt-4"
        />
      </div>
    </div>
  );
}
