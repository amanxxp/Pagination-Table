export  interface Product {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

export  interface SizeOption {
  label: string;
  value: "small" | "normal" | "large";
}
