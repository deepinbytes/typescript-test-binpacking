/* Do not modify this file */

export interface OrderRequest {
  id: string;
  products: Array<{
    id: string;
    name: string;
    orderedQuantity: number;
    dimensions: Dimensions;
    unitPrice: number;
  }>;
}

export interface ShipmentRecord {
  orderId: string;
  totalVolume: {
    unit: string;
    value: number;
  };
  containers: Array<{
    type: string;
    containingProducts: Array<{
      id: string;
      quantity: number;
    }>;
  }>;
}

export interface ContainerSpec {
  type: string;
  dimensions: Dimensions;
}

export interface Dimensions {
  unit: string;
  length: number;
  width: number;
  height: number;
}
