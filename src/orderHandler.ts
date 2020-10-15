import {ContainerSpec, OrderRequest, ShipmentRecord} from "./interfaces";
import ProductHandler, {HeightAxis, LengthAxis, StartPosition, WidthAxis} from "./productHandler";
import ContainerHandler from "./containerHandler";

const CONTAINER_LIMIT = 3;

export class OrderHandler {

    private _products: ProductHandler[] = [];
    private _containers: ContainerHandler[] = [];
    private _unfitProducts: ProductHandler[] = [];
    private readonly _containerSpec: ContainerSpec[];

    constructor(private parameters: { containerSpecs: ContainerSpec[] }) {
        this._containerSpec = parameters.containerSpecs;
        this.initialize();
    }

    initialize() {
        this._products = [];
        this._unfitProducts = [];
        this._containers = [];
        for (let container of this._containerSpec) {
            for (let i = 0; i < CONTAINER_LIMIT; i++) {
                this.addContainers(new ContainerHandler(container.containerType, container.dimensions));
            }
        }
    }

    addUnfitProducts = (value: ProductHandler) => {
        this._unfitProducts.push(value);
    };
    addContainers = (value: ContainerHandler) => {
        this._containers.push(value);
    };
    addProduct = (value: ProductHandler) => {
        this._products.push(value);
    };

    findFittingContainer(product: ProductHandler) {
        for (let _i = 0; _i < this._containers.length; _i++) {
            let container = this._containers[_i];

            if (!container.putProduct(product, StartPosition)) {
                continue;
            }

            if (container.getProducts().length === 1 && container.getProducts()[0] === product) {
                container.setProducts([]);
            }

            return container;
        }
        return null;
    }

    getBiggerContainerThan(container: ContainerHandler) {
        let containerVolume = container.getVolume();
        for (let _i = 0; _i < this._containers.length; _i++) {
            let biggerContainer = this._containers[_i];
            if (biggerContainer.getVolume() > containerVolume) {
                return biggerContainer;
            }
        }
        return null;
    }

    unfitProduct() {
        if (this._products.length === 0) {
            return;
        }
        this.addUnfitProducts(this._products[0]);
        this._products.splice(0, 1);
    }

    packToContainer(container: ContainerHandler, products: ProductHandler[]): ProductHandler[] | any {
        let biggerContainer = null;
        let unpacked = [];
        let fit = container.putProduct(products[0], StartPosition);

        if (!fit) {
            let biggerContainer = this.getBiggerContainerThan(container);
            if (biggerContainer) {
                return this.packToContainer(biggerContainer, products);
            }
            return this._products;
        }

        // Pack unpacked products.
        for (let _i = 1; _i < this._products.length; _i++) {
            let fitted = false;
            let product = this._products[_i];

            // Try available pivots in current container that are not intersecting with
            // existing products in current container.
            lookup:
                for (let pivotType = 0; pivotType < 3; pivotType++) {
                    for (let _j = 0; _j < container.getProducts().length; _j++) {
                        let pivot: Array<number> = [0, 0, 0];
                        let existingProduct = container.getProducts()[_j];
                        switch (pivotType) {
                            case WidthAxis:
                                pivot = [existingProduct.getPosition()[0] + existingProduct.getWidth(),
                                    existingProduct.getPosition()[1],
                                    existingProduct.getPosition()[2]];
                                break;
                            case HeightAxis:
                                pivot = [existingProduct.getPosition()[0],
                                    existingProduct.getPosition()[1] + existingProduct.getHeight(),
                                    existingProduct.getPosition()[2]];
                                break;
                            case LengthAxis:
                                pivot = [existingProduct.getPosition()[0],
                                    existingProduct.getPosition()[1],
                                    existingProduct.getPosition()[2] + existingProduct.getLength()];
                                break;
                        }

                        if (container.putProduct(product, pivot)) {
                            fitted = true;
                            break lookup;
                        }
                    }
                }


            if (!fitted) {
                while (biggerContainer !== null) {
                    biggerContainer = this.getBiggerContainerThan(container);
                    if (biggerContainer) {
                        biggerContainer.appendProduct(product);
                        let left = this.packToContainer(biggerContainer, biggerContainer.getProducts());
                        if (left.length === 0) {
                            container = biggerContainer;
                            fitted = true;
                            break;
                        }
                    }
                }

                if (!fitted) {
                    unpacked.push(product);
                }
            }
        }

        return unpacked;
    }

    processProducts() {
        // @ts-ignore
        this._containers.sort((a, b) => {
            return a.getVolume() > b.getVolume();
        });

        // @ts-ignore
        this._products.sort((a, b) => {
            return a.getVolume() > b.getVolume();
        });

        while (this._products.length > 0) {
            let container = this.findFittingContainer(this._products[0]);

            if (container === null) {
                this.unfitProduct();
                continue;
            }

            this._products = this.packToContainer(container, this._products);
        }

        return null;
    }

    putProductsIntoCart(orderRequest: OrderRequest): void {
        for (let product of orderRequest.products) {
            for (let i = 0; i < product.orderedQuantity; i++) {
                let newProduct = new ProductHandler(product.id, product.name, product.dimensions, product.unitPrice);
                this.addProduct(newProduct)
            }
        }
    }

    getContainerInfo(): Array<any> {
        let result: any[] = [];
        for (let container of this._containers) {
            const containerMap = new Map<string, number>();
            for (const prod of container.getProducts())
                containerMap.set(prod.id, (containerMap.get(prod.id) || 0) + 1);
            let array = Array.from(containerMap, ([id, quantity]) => ({id, quantity}));
            let data = {
                containerType: container.getContainerType(),
                containingProducts: array
            };
            result.push(data);
        }
        return result;
    }

    getTotalVolume(): number {
        let totalVolume = 0;
        for (let container of this._containers) {
            if (container.getProducts().length > 0) {
                totalVolume += container.getVolume();
            }
        }
        return totalVolume;
    }

    removeUnUsedContainers() {
        for (let _i = this._containers.length - 1; _i >= 0; _i--) {
            if (this._containers[_i].getProducts().length === 0) {
                this._containers.splice(_i, 1);
            }
        }
    }

    packOrder(orderRequest: OrderRequest): ShipmentRecord {
        // Initialize container state
        this.initialize();
        // Move products to the cart and pack it
        this.putProductsIntoCart(orderRequest);
        this.processProducts();
        this.removeUnUsedContainers();
        if (this._unfitProducts.length > 0) {
            throw Error('Containers unavailable for bigger products!');
        }
        return {
            orderId: orderRequest.id,
            totalVolume: {
                unit: "cubic centimeter",
                value: this.getTotalVolume(),
            },
            containers: this.getContainerInfo(),
        };
    }


}
