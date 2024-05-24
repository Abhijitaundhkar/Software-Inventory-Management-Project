import {productController} from './productController'

export default function(server:any){
let product = new productController();
    server.route(product.addNewProduct());
    server.route(product.getAllProductDetails());
    server.route(product.updateProductDetails());
    server.route(product.deleteProductDetails());
    server.route(product.filterProductPrice());
    server.route(product.searchProduct());
    server.route(product.checkQuantityOfProduct());
    server.route(product.countAllProduct());
    
    

}