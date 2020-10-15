import ProductHandler from "./productHandler";
import {ContainerSpec, Dimensions} from "./interfaces";

export default class ContainerHandler implements ContainerSpec {


    private _products: ProductHandler[] = [];

    constructor(readonly containerType: string, readonly dimensions: Dimensions) {}

    getContainerType = () => this.containerType;

    getWidth = () => this.dimensions.width;

    getHeight = () => this.dimensions.height;

    getLength = () => this.dimensions.length;

    getProducts = () => this._products;

    setProducts(value: ProductHandler[]) {
        this._products = value;
    }

    appendProduct(product: ProductHandler) {
        this._products.push(product)
    }

    getVolume = () => this.getWidth() * this.getHeight() * this.getLength();

    putProduct = (product: ProductHandler, productPosition: Array<number>) => {
        let container = this;
        let fit = false;

        product.setPosition(productPosition);
        for (let i = 0; i < 6; i++) {
            product.setRotationType(i);
            let dimension = product.getDimension();

            // @ts-ignore
            if (container.getWidth() < productPosition[0] + dimension[0] || container.getHeight() < productPosition[1] + dimension[1] || container.getLength() < productPosition[2] + dimension[2]) {
                continue;
            }

            fit = true;

            for (let j = 0; j < container._products.length; j++) {
                let _j = container._products[j];
                if (_j.intersect(product)) {
                    fit = false;
                    break;
                }
            }

            if (fit) {
                this.appendProduct(product);
            }
            return fit;
        }

        return fit;
    };

}