import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SelectButton, SelectButtonChangeEvent } from "primereact/selectbutton";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";

interface Product {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

interface SizeOption {
  label: string;
  value: "small" | "normal" | "large";
}

export default function ArtworkTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // State to manage selected rows across pages
  const [selectedProducts, setSelectedProducts] = useState<{[key: number]: Product}>({});

  const [sizeOptions] = useState<SizeOption[]>([
    { label: "Small", value: "small" },
    { label: "Normal", value: "normal" },
    { label: "Large", value: "large" },
  ]);
  const [size, setSize] = useState<"small" | "normal" | "large">(
    sizeOptions[1].value
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${page}&limit=10`
        );
        const data = await response.json();
        const transformedProducts = data.data.map((item: any, index: number) => ({
          id: item.id, // Ensure each product has a unique identifier
          title: item.title || "N/A",
          place_of_origin: item.place_of_origin || "N/A",
          artist_display: item.artist_display || "N/A",
          inscriptions: item.inscriptions || "N/A",
          date_start: item.date_start || 0,
          date_end: item.date_end || 0,
        }));

        setProducts(transformedProducts);
        setTotalRecords(data.pagination.total);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setPage(event.page + 1);
  };

  // Handle individual row selection
  const onRowSelect = (product: Product) => {
    setSelectedProducts(prev => ({
      ...prev,
      [product.id]: product
    }));
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
        checked={!!selectedProducts[rowData.id]}
        onChange={(e) => {
          if (e.checked) {
            onRowSelect(rowData);
          } else {
            onRowUnselect(rowData);
          }
        }}
      />
    );
  };

  // Custom header checkbox to select/deselect all rows on current page
  const headerSelectionCheckbox = () => {
    const allCurrentPageSelected = products.every(product => 
      selectedProducts[product.id]
    );

    return (
      <Checkbox
        checked={products.length > 0 && allCurrentPageSelected}
        onChange={(e) => {
          if (e.checked) {
            // Select all rows on current page
            const newSelectedProducts = products.reduce((acc, product) => ({
              ...acc,
              [product.id]: product
            }), {});
            setSelectedProducts(prev => ({
              ...prev,
              ...newSelectedProducts
            }));
          } else {
            // Unselect all rows on current page
            const newSelectedProducts = { ...selectedProducts };
            products.forEach(product => {
              delete newSelectedProducts[product.id];
            });
            setSelectedProducts(newSelectedProducts);
          }
        }}
      />
    );
  };

  // Custom selection panel to show selected items
  const selectionPanel = () => {
    const selectedProductsList = Object.values(selectedProducts);

    return (
      <div className="p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-bold mb-2">
          Selected Artworks: {selectedProductsList.length}
        </h3>
        {selectedProductsList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedProductsList.map(product => (
              <div 
                key={product.id} 
                className="bg-white p-2 rounded shadow-sm flex justify-between items-center"
              >
                <span className="truncate">{product.title}</span>
                <Button 
                  icon="pi pi-times" 
                  className="p-button-text p-button-danger p-button-sm"
                  onClick={() => onRowUnselect(product)}
                />
              </div>
            ))}
          </div>
        )}
        {selectedProductsList.length === 0 && (
          <p className="text-gray-500">No artworks selected</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Selection Panel */}
      {selectionPanel()}

      {/* Size Selection */}
      <div className="flex justify-center mb-4">
        <SelectButton
          value={size}
          onChange={(e: SelectButtonChangeEvent) => setSize(e.value)}
          options={sizeOptions}
        />
      </div>

      {/* Data Table */}
      <div className="card">
        <DataTable
          value={products}
          rows={10}
          size={size}
          loading={loading}
          tableStyle={{ minWidth: "50rem" }}
        >
          {/* Checkbox Column */}
          <Column 
            header={headerSelectionCheckbox} 
            body={rowSelectionCheckbox}
            headerClassName="w-[50px]"
            bodyClassName="w-[50px]"
          />

          {/* Other Columns */}
          <Column field="title" header="Title" />
          <Column field="place_of_origin" header="Place of Origin" />
          <Column field="artist_display" header="Artist Display" />
          <Column field="inscriptions" header="Inscriptions" />
          <Column field="date_start" header="Date Start" />
          <Column field="date_end" header="Date End" />
        </DataTable>

        {/* Pagination */}
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