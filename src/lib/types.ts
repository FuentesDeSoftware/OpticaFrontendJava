export type Rol = "CLIENTE" | "VENDEDOR";

export interface Sesion {
  nombre: string;
  rol: Rol;
  email: string;
}

export interface Cliente {
  id: number;
  usuarioId: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  dni: string;
  telefono: string | null;
  email: string;
}

export interface Medicion {
  id: number;
  clienteId: number;
  vendedorId: number | null;
  fecha: string;
  odEsfera: number;
  odCilindro: number;
  odEje: number;
  odAdicion: number;
  oiEsfera: number;
  oiCilindro: number;
  oiEje: number;
  oiAdicion: number;
  dip: number | null;
  observaciones: string | null;
}

interface Producto {
  id: number;
  codigo: string;
  precio: number;
  stock: number;
  activo: boolean;
  etiqueta: string;
}

export interface Aro extends Producto {
  marca: string;
  modelo: string;
  material: string;
  forma: string;
  color: string | null;
  imagenUrl: string | null;
}

export type TipoLuna = "MONOFOCAL" | "BIFOCAL" | "PROGRESIVO";

export interface Luna extends Producto {
  tipo: TipoLuna;
  material: string;
  indice: number;
  tratamiento: string | null;
}

export interface Accesorio extends Producto {
  nombre: string;
  descripcion: string | null;
}

export type EstadoApartado = "PENDIENTE" | "VENDIDO" | "CANCELADO";

export interface Apartado {
  id: number;
  clienteId: number;
  aroId: number;
  fecha: string;
  estado: EstadoApartado;
  aro: Aro;
}

export interface DetalleVenta {
  id: number | null;
  tipoProducto: "ARO" | "LUNA" | "ACCESORIO";
  productoId: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: number | null;
  clienteId: number;
  vendedorId: number | null;
  medicionId: number;
  aroId: number;
  lunaId: number;
  fecha: string | null;
  subtotal: number;
  igv: number;
  total: number;
  clienteNombre: string | null;
  vendedorNombre: string | null;
  detalles: DetalleVenta[];
}

export interface AlertasStock {
  umbral: number;
  aros: Aro[];
  lunas: Luna[];
  accesorios: Accesorio[];
}

export interface FiltrosCatalogo {
  marcas: string[];
  materiales: string[];
  formas: string[];
}
