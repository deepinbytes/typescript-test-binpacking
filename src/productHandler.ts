import {Dimensions} from "./interfaces";

export const RotationType_WHL: number = 0;
export const RotationType_HWL: number = 1;
export const RotationType_HLW: number = 2;
export const RotationType_LHW: number = 3;
export const RotationType_LWH: number = 4;
export const RotationType_WLH: number = 5;

export const WidthAxis: number = 0;
export const HeightAxis: number = 1;
export const LengthAxis: number = 2;

export const StartPosition: Array<number> = [0, 0, 0];
export default class ProductHandler {


    readonly id: string;
    readonly name: string;
    private readonly dimensions: Dimensions;

    private _rotationType = RotationType_WHL;
    private _position: Array<number> = [];
    private unitPrice: number;

    constructor(id: string, name: string, dimensions: Dimensions, unitPrice: number) {
        this.id = id;
        this.name = name;
        this.dimensions = dimensions;
        this.unitPrice = unitPrice;
    }

    setPosition = (value: Array<number>) => {
        this._position = value;
    };

    getPosition = (): Array<number> => this._position;

    getWidth = () => this.dimensions.width;

    getHeight = () => this.dimensions.height;

    getLength = () => this.dimensions.length;

    getVolume = () => this.getWidth() * this.getHeight() * this.getLength();


    getDimension = () => {
        let dimension;
        switch (this._rotationType) {
            case RotationType_WHL:
                dimension = [this.getWidth(), this.getHeight(), this.getLength()];
                break;
            case RotationType_HWL:
                dimension = [this.getHeight(), this.getWidth(), this.getLength()];
                break;
            case RotationType_HLW:
                dimension = [this.getHeight(), this.getLength(), this.getWidth()];
                break;
            case RotationType_LHW:
                dimension = [this.getLength(), this.getHeight(), this.getWidth()];
                break;
            case RotationType_LWH:
                dimension = [this.getLength(), this.getWidth(), this.getHeight()];
                break;
            case RotationType_WLH:
                dimension = [this.getWidth(), this.getLength(), this.getHeight()];
                break;
            default:
                dimension = [this.getWidth(), this.getHeight(), this.getLength()];
                break;
        }
        return dimension;
    };

    intersect = (i2: any) => rectIntersect(this, i2, WidthAxis, HeightAxis) &&
        rectIntersect(this, i2, HeightAxis, LengthAxis) &&
        rectIntersect(this, i2, WidthAxis, LengthAxis);


    setRotationType(rotationType: number) {
        this._rotationType = rotationType;
    }
}

export const rectIntersect = (productOne: ProductHandler, productTwo: ProductHandler, x: number, y: number) => {
    let prodDimension1, prodDimension2, cx1, cy1, cx2, cy2, ix, iy;

    prodDimension1 = productOne.getDimension();
    prodDimension2 = productTwo.getDimension();

    cx1 = productOne.getPosition()[x] + prodDimension1[x] / 2;
    cy1 = productOne.getPosition()[y] + prodDimension1[y] / 2;
    cx2 = productTwo.getPosition()[x] + prodDimension2[x] / 2;
    cy2 = productTwo.getPosition()[y] + prodDimension2[y] / 2;

    ix = Math.max(cx1, cx2) - Math.min(cx1, cx2);
    iy = Math.max(cy1, cy2) - Math.min(cy1, cy2);

    return ix < (prodDimension1[x] + prodDimension2[x]) / 2 && iy < (prodDimension1[y] + prodDimension2[y]) / 2;
};


