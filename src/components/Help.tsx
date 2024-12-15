import  { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SelectButton, SelectButtonChangeEvent } from "primereact/selectbutton";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import { Checkbox } from "primereact/checkbox";

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
  const [selectedProducts, setSelectedProducts] = useState<{
    [key: number]: Product;
  }>({});

  const [sizeOptions] = useState<SizeOption[]>([
    { label: "Small", value: "small" },
    { label: "Normal", value: "normal" },
    { label: "Large", value: "large" },
  ]);
  const [size, setSize] = useState<"small" | "normal" | "large">(
    sizeOptions[1].value
  );

  const truncateText = (text: string, wordLimit: number = 8): string => {
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${page}`
        );
        const data = await response.json();
        const transformedProducts = data.data
          .slice(0, 5) // Limit to the first 5 items
          .map((item: any) => ({
            id: item.id, // Ensure each product has a unique identifier
            title: item.title || "N/A",
            place_of_origin: truncateText(item.place_of_origin || "N/A"),
            artist_display: truncateText(item.artist_display || "N/A"),
            inscriptions: truncateText(item.inscriptions || "N/A"),
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
    setSelectedProducts((prev) => ({
      ...prev,
      [product.id]: product,
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
    const allCurrentPageSelected = products.every(
      (product) => selectedProducts[product.id]
    );

    return (
      <Checkbox
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
  return (
    <div className="p-4">
      <div className="flex justify-center mb-4">
        <SelectButton
          value={size}
          onChange={(e: SelectButtonChangeEvent) => setSize(e.value)}
          options={sizeOptions}
        />
      </div>
      <div className="card">
        <DataTable
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
